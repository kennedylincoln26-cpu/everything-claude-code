'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { mascarar } = require('./mask');

const CONFIG_PADRAO = {
  orquestrador: {
    cooldown_segundos: 120,
    saldo_minimo_usd: 2.0,
    tentativas_fallback: 1,
    rotas: { roteiro: 'grok', revisao: 'claude', padrao: 'auto' }
  },
  provedores: {
    grok: { env_chave: 'XAI_API_KEY', base_url: 'https://api.x.ai/v1', modelo: 'grok-4', preco_entrada_mtok: 3, preco_saida_mtok: 15 },
    claude: { env_chave: 'ANTHROPIC_API_KEY', base_url: 'https://api.anthropic.com/v1', modelo: 'claude-sonnet-5-5', preco_entrada_mtok: 3, preco_saida_mtok: 15 }
  }
};

function migrar(db) {
  db.exec('CREATE TABLE IF NOT EXISTS schema_versao (versao INTEGER PRIMARY KEY, aplicado_em TEXT NOT NULL)');
  const aplicadas = new Set(db.prepare('SELECT versao FROM schema_versao').all().map(r => r.versao));
  const dir = path.join(__dirname, 'migrations');
  for (const arq of fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
    const versao = parseInt(arq, 10);
    if (aplicadas.has(versao)) continue;
    db.exec('BEGIN');
    try {
      db.exec(fs.readFileSync(path.join(dir, arq), 'utf8'));
      db.prepare("INSERT INTO schema_versao VALUES (?, datetime('now'))").run(versao);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
}

function abrir(arquivo = process.env.GESTAO_DB || path.join(__dirname, '..', 'dados.sqlite')) {
  const db = new DatabaseSync(arquivo);
  db.exec('PRAGMA foreign_keys = ON');
  migrar(db);
  if (!db.prepare('SELECT 1 FROM configuracoes_versoes LIMIT 1').get()) {
    db.prepare('INSERT INTO configuracoes_versoes (versao, conteudo, ativo) VALUES (1, ?, 1)').run(JSON.stringify(CONFIG_PADRAO, null, 2));
  }
  const cfg = configAtiva(db).dados;
  for (const [nome, p] of Object.entries(cfg.provedores)) {
    db.prepare('INSERT OR IGNORE INTO provedores (nome, base_url) VALUES (?, ?)').run(nome, p.base_url);
  }
  return db;
}

// ---------- configurações versionadas ----------
function configAtiva(db) {
  const r = db.prepare('SELECT * FROM configuracoes_versoes WHERE ativo = 1').get();
  return { id: r.id, versao: r.versao, dados: JSON.parse(r.conteudo) };
}

function validarConfig(dados) {
  const o = dados && dados.orquestrador;
  if (!o || typeof o.cooldown_segundos !== 'number' || typeof o.saldo_minimo_usd !== 'number') {
    throw new Error('Configuração inválida: orquestrador.cooldown_segundos e saldo_minimo_usd precisam ser números');
  }
  if (!dados.provedores || typeof dados.provedores !== 'object') throw new Error('Configuração inválida: falta "provedores"');
  for (const p of Object.values(dados.provedores)) {
    if ('chave' in p || 'api_key' in p) throw new Error('Não coloque chaves na configuração; use variáveis de ambiente');
  }
}

function salvarConfig(db, dados) {
  validarConfig(dados);
  const prox = db.prepare('SELECT COALESCE(MAX(versao), 0) + 1 AS v FROM configuracoes_versoes').get().v;
  db.exec('BEGIN');
  db.exec('UPDATE configuracoes_versoes SET ativo = 0');
  db.prepare('INSERT INTO configuracoes_versoes (versao, conteudo, ativo) VALUES (?, ?, 1)').run(prox, JSON.stringify(dados, null, 2));
  db.exec('COMMIT');
  return prox;
}

// Rollback = nova versão com o conteúdo antigo (nada é sobrescrito).
function restaurarConfig(db, versao) {
  const r = db.prepare('SELECT conteudo FROM configuracoes_versoes WHERE versao = ?').get(versao);
  if (!r) throw new Error(`Versão ${versao} não existe`);
  return salvarConfig(db, JSON.parse(r.conteudo));
}

function listarConfigs(db) {
  return db.prepare('SELECT id, versao, conteudo, ativo, criado_em FROM configuracoes_versoes ORDER BY versao DESC').all();
}

// ---------- prompts versionados ----------
function salvarPrompt(db, nome, conteudo, autor = 'eu') {
  if (!nome || !conteudo) throw new Error('Nome e conteúdo são obrigatórios');
  db.prepare('INSERT OR IGNORE INTO prompts (nome) VALUES (?)').run(nome);
  const p = db.prepare('SELECT id FROM prompts WHERE nome = ?').get(nome);
  const prox = db.prepare('SELECT COALESCE(MAX(versao), 0) + 1 AS v FROM prompt_versoes WHERE prompt_id = ?').get(p.id).v;
  const r = db.prepare('INSERT INTO prompt_versoes (prompt_id, versao, conteudo, autor) VALUES (?, ?, ?, ?)').run(p.id, prox, conteudo, autor);
  return { prompt_id: p.id, versao: prox, id: Number(r.lastInsertRowid) };
}

function restaurarPrompt(db, promptId, versao) {
  const r = db.prepare('SELECT p.nome, v.conteudo FROM prompt_versoes v JOIN prompts p ON p.id = v.prompt_id WHERE v.prompt_id = ? AND v.versao = ?').get(promptId, versao);
  if (!r) throw new Error('Versão não encontrada');
  return salvarPrompt(db, r.nome, r.conteudo, `rollback v${versao}`);
}

function listarPrompts(db) {
  const prompts = db.prepare('SELECT * FROM prompts ORDER BY nome').all();
  return prompts.map(p => ({
    ...p,
    versoes: db.prepare('SELECT * FROM prompt_versoes WHERE prompt_id = ? ORDER BY versao DESC').all(p.id)
  }));
}

// ---------- chamadas, saldos, eventos ----------
function idProvedor(db, nome) {
  const r = db.prepare('SELECT id FROM provedores WHERE nome = ?').get(nome);
  return r ? r.id : null;
}

function registrarChamada(db, c) {
  const r = db.prepare(`INSERT INTO chamadas (provedor_id, tipo_tarefa, prompt_versao_id, config_versao_id, prompt, resposta, erro,
    tokens_entrada, tokens_saida, custo_usd, latencia_ms, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    c.provedor ? idProvedor(db, c.provedor) : null, c.tipo_tarefa, c.prompt_versao_id || null, c.config_versao_id || null,
    c.prompt, c.resposta || null, c.erro ? mascarar(c.erro) : null,
    c.tokens_entrada || 0, c.tokens_saida || 0, c.custo_usd || 0, c.latencia_ms || 0, c.status);
  return Number(r.lastInsertRowid);
}

function registrarEvento(db, chamadaId, de, para, motivo) {
  db.prepare('INSERT INTO eventos_orquestrador (chamada_id, de_provedor, para_provedor, motivo) VALUES (?, ?, ?, ?)').run(chamadaId, de, para, mascarar(motivo));
}

function registrarSaldo(db, provedor, saldo, origem) {
  db.prepare("INSERT INTO saldos (provedor_id, saldo_usd, origem, consultado_em) VALUES (?, ?, ?, strftime('%Y-%m-%d %H:%M:%f', 'now'))").run(idProvedor(db, provedor), saldo, origem);
}

// Último saldo conhecido (api ou manual) menos o gasto registrado desde então.
function saldoEstimado(db, provedor) {
  const pid = idProvedor(db, provedor);
  const ult = db.prepare("SELECT saldo_usd, origem, consultado_em FROM saldos WHERE provedor_id = ? AND saldo_usd IS NOT NULL ORDER BY consultado_em DESC, id DESC LIMIT 1").get(pid);
  const ultConsulta = db.prepare('SELECT origem, consultado_em FROM saldos WHERE provedor_id = ? ORDER BY consultado_em DESC, id DESC LIMIT 1').get(pid);
  if (!ult) return { saldo: null, estimado: null, gasto_desde: 0, consultado_em: ultConsulta ? ultConsulta.consultado_em : null, origem: ultConsulta ? ultConsulta.origem : null };
  const gasto = db.prepare('SELECT COALESCE(SUM(custo_usd), 0) AS g FROM chamadas WHERE provedor_id = ? AND criado_em >= ?').get(pid, ult.consultado_em).g;
  return { saldo: ult.saldo_usd, estimado: ult.saldo_usd - gasto, gasto_desde: gasto, consultado_em: ult.consultado_em, origem: ult.origem };
}

function setEstado(db, provedor, estado) {
  db.prepare("UPDATE provedores SET estado = ?, atualizado_em = datetime('now') WHERE nome = ?").run(estado, provedor);
}

function historico(db, { provedor, status, limite = 100 } = {}) {
  const cond = [];
  const args = [];
  if (provedor) { cond.push('p.nome = ?'); args.push(provedor); }
  if (status) { cond.push('c.status = ?'); args.push(status); }
  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
  args.push(Math.min(Number(limite) || 100, 500));
  return db.prepare(`SELECT c.*, p.nome AS provedor FROM chamadas c LEFT JOIN provedores p ON p.id = c.provedor_id ${where} ORDER BY c.id DESC LIMIT ?`).all(...args)
    .map(c => ({ ...c, eventos: db.prepare('SELECT * FROM eventos_orquestrador WHERE chamada_id = ?').all(c.id) }));
}

function exportar(db) {
  const tabelas = ['provedores', 'prompts', 'prompt_versoes', 'configuracoes_versoes', 'chamadas', 'saldos', 'eventos_orquestrador'];
  const out = { exportado_em: new Date().toISOString() };
  for (const t of tabelas) out[t] = db.prepare(`SELECT * FROM ${t}`).all();
  return out;
}

module.exports = {
  abrir, configAtiva, salvarConfig, restaurarConfig, listarConfigs,
  salvarPrompt, restaurarPrompt, listarPrompts,
  registrarChamada, registrarEvento, registrarSaldo, saldoEstimado, setEstado, historico, exportar, CONFIG_PADRAO
};
