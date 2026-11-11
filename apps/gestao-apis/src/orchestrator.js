'use strict';
const db = require('./db');
const { PROVEDORES, ErroProvedor, custo } = require('./providers');

// Saúde em memória: { [nome]: { estado, cooldownAte } }
function criarSaude(nomes) {
  return Object.fromEntries(nomes.map(n => [n, { estado: 'ativo', cooldownAte: 0 }]));
}

function estadoAtual(s, agora = Date.now()) {
  if (s.estado === 'indisponivel' && agora >= s.cooldownAte) s.estado = 'degradado'; // em observação após o cooldown
  return s.estado;
}

/**
 * Ordena os provedores candidatos seguindo a seção 3.2.
 * Retorna { ordem: [nomes], motivo }.
 */
function escolher({ preferido, tipo, cfg, saude, saldos, agora = Date.now() }) {
  const todos = Object.keys(cfg.provedores);
  const outros = n => todos.filter(x => x !== n);

  if (preferido && preferido !== 'auto') {
    if (!cfg.provedores[preferido]) throw new Error(`Provedor desconhecido: ${preferido}`);
    return { ordem: [preferido, ...outros(preferido)], motivo: 'preferência manual' };
  }

  const motivos = [];
  let vivos = todos.filter(n => estadoAtual(saude[n], agora) !== 'indisponivel');
  if (vivos.length < todos.length) motivos.push(`em cooldown: ${todos.filter(n => !vivos.includes(n)).join(', ')}`);

  const minimo = cfg.orquestrador.saldo_minimo_usd;
  const comSaldo = vivos.filter(n => saldos[n] === null || saldos[n] === undefined || saldos[n] >= minimo);
  if (comSaldo.length < vivos.length) motivos.push(`saldo baixo: ${vivos.filter(n => !comSaldo.includes(n)).join(', ')}`);
  vivos = comSaldo;

  if (vivos.length === 0) return { ordem: todos, motivo: `${motivos.join('; ')}; nenhum disponível, tentando mesmo assim` };

  const rota = cfg.orquestrador.rotas?.[tipo];
  let primeiro;
  if (rota && rota !== 'auto' && vivos.includes(rota)) {
    primeiro = rota;
    motivos.push(`rota do tipo "${tipo}"`);
  } else {
    const preco = n => (cfg.provedores[n].preco_entrada_mtok || 0) + (cfg.provedores[n].preco_saida_mtok || 0);
    primeiro = [...vivos].sort((a, b) => preco(a) - preco(b))[0];
    motivos.push('menor custo');
  }
  const resto = [...vivos.filter(n => n !== primeiro), ...todos.filter(n => !vivos.includes(n))];
  return { ordem: [primeiro, ...resto], motivo: motivos.join('; ') };
}

function criarOrquestrador(conn, { fetchImpl = fetch } = {}) {
  const saude = criarSaude(Object.keys(db.configAtiva(conn).dados.provedores));

  function marcarErro(nome, erro, cfg) {
    const s = saude[nome] || (saude[nome] = { estado: 'ativo', cooldownAte: 0 });
    if (erro instanceof ErroProvedor && erro.derrubaProvedor) {
      s.estado = 'indisponivel';
      s.cooldownAte = Date.now() + cfg.orquestrador.cooldown_segundos * 1000;
    } else {
      s.estado = 'degradado';
    }
    db.setEstado(conn, nome, s.estado);
  }

  function marcarSucesso(nome) {
    saude[nome].estado = 'ativo';
    db.setEstado(conn, nome, 'ativo');
  }

  async function executar({ prompt, tipo = 'padrao', provedor = 'auto', promptVersaoId = null }) {
    if (!prompt || !String(prompt).trim()) throw new Error('Prompt vazio');
    const config = db.configAtiva(conn);
    const cfg = config.dados;
    const saldos = Object.fromEntries(Object.keys(cfg.provedores).map(n => [n, db.saldoEstimado(conn, n).estimado]));
    const { ordem, motivo } = escolher({ preferido: provedor, tipo, cfg, saude, saldos });
    const maxTentativas = 1 + (cfg.orquestrador.tentativas_fallback ?? 1);
    const tentativas = ordem.slice(0, maxTentativas);

    const eventos = [];
    let anterior = null;
    let ultimoErro = null;
    let ultimaChamadaId = null;
    for (const nome of tentativas) {
      const cfgProv = cfg.provedores[nome];
      const impl = PROVEDORES[nome];
      const inicio = Date.now();
      try {
        if (!impl) throw new ErroProvedor(`Provedor ${nome} não implementado`, { tipo: 'erro' });
        const r = await impl.chamar(cfgProv, prompt, fetchImpl);
        const c = custo(cfgProv, r.tokens_entrada, r.tokens_saida);
        const id = db.registrarChamada(conn, {
          provedor: nome, tipo_tarefa: tipo, prompt_versao_id: promptVersaoId, config_versao_id: config.id, prompt,
          resposta: r.texto, tokens_entrada: r.tokens_entrada, tokens_saida: r.tokens_saida, custo_usd: c,
          latencia_ms: Date.now() - inicio, status: 'ok'
        });
        db.registrarEvento(conn, id, anterior, nome, anterior ? `fallback após erro: ${ultimoErro.message}` : `escolhido: ${motivo}`);
        eventos.forEach(e => db.registrarEvento(conn, id, e.de, e.para, e.motivo));
        marcarSucesso(nome);
        return { id, provedor: nome, resposta: r.texto, tokens_entrada: r.tokens_entrada, tokens_saida: r.tokens_saida, custo_usd: c, latencia_ms: Date.now() - inicio, motivo, fallback: Boolean(anterior) };
      } catch (e) {
        ultimoErro = e;
        marcarErro(nome, e, cfg);
        ultimaChamadaId = db.registrarChamada(conn, {
          provedor: nome, tipo_tarefa: tipo, prompt_versao_id: promptVersaoId, config_versao_id: config.id, prompt,
          erro: e.message, latencia_ms: Date.now() - inicio, status: 'erro'
        });
        db.registrarEvento(conn, ultimaChamadaId, nome, null, `falhou: ${e.message}`);
        anterior = nome;
      }
    }
    const erro = new Error(`Todos os provedores falharam. Último erro: ${ultimoErro ? ultimoErro.message : 'desconhecido'}`);
    erro.chamadaId = ultimaChamadaId;
    throw erro;
  }

  function estados() {
    return Object.fromEntries(Object.entries(saude).map(([n, s]) => [n, { estado: estadoAtual(s), cooldown_restante_s: Math.max(0, Math.ceil((s.cooldownAte - Date.now()) / 1000)) }]));
  }

  return { executar, estados, saude };
}

module.exports = { escolher, criarOrquestrador, criarSaude };
