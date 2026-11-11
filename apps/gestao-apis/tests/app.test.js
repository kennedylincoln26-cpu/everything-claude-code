'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const db = require('../src/db');
const { escolher, criarOrquestrador, criarSaude } = require('../src/orchestrator');
const { criarApp } = require('../src/server');
const { mascarar } = require('../src/mask');

process.env.XAI_API_KEY = 'xai-CHAVEFALSAGROK1234567890';
process.env.ANTHROPIC_API_KEY = 'sk-ant-CHAVEFALSACLAUDE1234567890';

const novo = () => db.abrir(':memory:');

// fetch falso: `falhar` define quais hosts respondem com erro.
function fetchFalso(falhar = {}) {
  const chamadas = [];
  const fn = async (url, opts) => {
    chamadas.push({ url, opts });
    const host = new URL(url).host;
    const status = falhar[host];
    if (status) return new Response(JSON.stringify({ error: `falha com chave ${process.env.XAI_API_KEY}` }), { status });
    if (host === 'api.x.ai') return Response.json({ choices: [{ message: { content: 'resposta grok' } }], usage: { prompt_tokens: 10, completion_tokens: 20 } });
    return Response.json({ content: [{ type: 'text', text: 'resposta claude' }], usage: { input_tokens: 11, output_tokens: 22 } });
  };
  fn.chamadas = chamadas;
  return fn;
}

const cfgBase = () => JSON.parse(JSON.stringify(db.CONFIG_PADRAO));

test('roteamento: preferência manual vence', () => {
  const r = escolher({ preferido: 'claude', tipo: 'roteiro', cfg: cfgBase(), saude: criarSaude(['grok', 'claude']), saldos: {} });
  assert.deepEqual(r.ordem, ['claude', 'grok']);
});

test('roteamento: tipo de tarefa usa a rota configurada', () => {
  const saude = criarSaude(['grok', 'claude']);
  assert.equal(escolher({ tipo: 'roteiro', cfg: cfgBase(), saude, saldos: {} }).ordem[0], 'grok');
  assert.equal(escolher({ tipo: 'revisao', cfg: cfgBase(), saude, saldos: {} }).ordem[0], 'claude');
});

test('roteamento: provedor em cooldown é ignorado', () => {
  const saude = criarSaude(['grok', 'claude']);
  saude.grok = { estado: 'indisponivel', cooldownAte: Date.now() + 60000 };
  assert.equal(escolher({ tipo: 'roteiro', cfg: cfgBase(), saude, saldos: {} }).ordem[0], 'claude');
});

test('roteamento: saldo abaixo do mínimo é ignorado', () => {
  const r = escolher({ tipo: 'roteiro', cfg: cfgBase(), saude: criarSaude(['grok', 'claude']), saldos: { grok: 1.0, claude: 50 } });
  assert.equal(r.ordem[0], 'claude');
});

test('roteamento: empate decide pelo menor custo', () => {
  const cfg = cfgBase();
  cfg.provedores.claude.preco_saida_mtok = 1;
  assert.equal(escolher({ tipo: 'padrao', cfg, saude: criarSaude(['grok', 'claude']), saldos: {} }).ordem[0], 'claude');
});

test('fallback: chave inválida no Grok faz usar o Claude e registra o evento', async () => {
  const conn = novo();
  const orq = criarOrquestrador(conn, { fetchImpl: fetchFalso({ 'api.x.ai': 401 }) });
  const r = await orq.executar({ prompt: 'oi', tipo: 'roteiro' });
  assert.equal(r.provedor, 'claude');
  assert.equal(r.fallback, true);
  assert.equal(orq.estados().grok.estado, 'indisponivel');
  const hist = db.historico(conn);
  assert.equal(hist.length, 2, 'a chamada que falhou também é registrada');
  assert.ok(hist.some(c => c.status === 'erro' && c.provedor === 'grok'));
  const ev = conn.prepare('SELECT * FROM eventos_orquestrador').all();
  assert.ok(ev.some(e => e.de_provedor === 'grok' && e.para_provedor === 'claude' && /fallback/.test(e.motivo)));
});

test('fallback: depois do cooldown o provedor volta e fica ativo após sucesso', async () => {
  const conn = novo();
  const orq = criarOrquestrador(conn, { fetchImpl: fetchFalso() });
  orq.saude.grok = { estado: 'indisponivel', cooldownAte: Date.now() - 1 };
  assert.equal(orq.estados().grok.estado, 'degradado');
  await orq.executar({ prompt: 'oi', tipo: 'roteiro' });
  assert.equal(orq.estados().grok.estado, 'ativo');
});

test('custo e tokens são registrados', async () => {
  const conn = novo();
  const orq = criarOrquestrador(conn, { fetchImpl: fetchFalso() });
  const r = await orq.executar({ prompt: 'oi', tipo: 'revisao' });
  assert.equal(r.tokens_entrada, 11);
  assert.ok(Math.abs(r.custo_usd - (11 * 3 + 22 * 15) / 1e6) < 1e-12);
});

test('prompts: editar gera nova versão e rollback funciona', () => {
  const conn = novo();
  const v1 = db.salvarPrompt(conn, 'resumo', 'versão A');
  db.salvarPrompt(conn, 'resumo', 'versão B');
  const rb = db.restaurarPrompt(conn, v1.prompt_id, 1);
  assert.equal(rb.versao, 3);
  const versoes = db.listarPrompts(conn)[0].versoes;
  assert.deepEqual(versoes.map(v => v.conteudo), ['versão A', 'versão B', 'versão A']);
});

test('configurações: versionadas, com rollback, e recusa chaves', () => {
  const conn = novo();
  const cfg = cfgBase();
  cfg.orquestrador.cooldown_segundos = 30;
  assert.equal(db.salvarConfig(conn, cfg), 2);
  assert.equal(db.restaurarConfig(conn, 1), 3);
  assert.equal(db.configAtiva(conn).dados.orquestrador.cooldown_segundos, 120);
  const ruim = cfgBase();
  ruim.provedores.grok.chave = 'xai-abc';
  assert.throws(() => db.salvarConfig(conn, ruim), /chaves/);
});

test('saldo: estimado desconta o gasto desde a última consulta', async () => {
  const conn = novo();
  db.registrarSaldo(conn, 'claude', 10, 'manual');
  await new Promise(r => setTimeout(r, 5));
  const orq = criarOrquestrador(conn, { fetchImpl: fetchFalso() });
  await orq.executar({ prompt: 'oi', tipo: 'revisao' });
  const s = db.saldoEstimado(conn, 'claude');
  assert.equal(s.saldo, 10);
  assert.ok(s.estimado < 10 && s.gasto_desde > 0);
});

test('máscara: chaves nunca aparecem', () => {
  const s = mascarar(`erro ${process.env.ANTHROPIC_API_KEY} Bearer abcdefghijkl xai-zzzzzzzzzz`);
  assert.ok(!s.includes('CHAVEFALSA') && !s.includes('abcdefghijkl') && !s.includes('zzzzzzzzzz'));
});

test('nenhuma chave no banco, mesmo quando o provedor devolve a chave no erro', async () => {
  const conn = novo();
  const orq = criarOrquestrador(conn, { fetchImpl: fetchFalso({ 'api.x.ai': 500 }) });
  await orq.executar({ prompt: 'oi', tipo: 'roteiro' });
  const dump = JSON.stringify(db.exportar(conn));
  assert.ok(!dump.includes(process.env.XAI_API_KEY));
  assert.ok(!dump.includes(process.env.ANTHROPIC_API_KEY));
});

test('HTTP: saldo só é consultado no clique e guarda data e hora', async () => {
  const conn = novo();
  const srv = http.createServer(criarApp(conn, { fetchImpl: fetchFalso() })).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    await fetch(`${base}/api/estado`);
    assert.equal(conn.prepare('SELECT COUNT(*) n FROM saldos').get().n, 0, 'abrir o painel não consulta saldo');
    const r = await (await fetch(`${base}/api/saldo/grok/consultar`, { method: 'POST' })).json();
    assert.equal(r.disponivel_pela_api, false);
    assert.ok(r.saldo.consultado_em);
    const bad = await fetch(`${base}/api/saldo/grok/manual`, { method: 'POST', body: '{"saldo_usd":"x"}' });
    assert.equal(bad.status, 400);
    const pagina = await fetch(`${base}/`);
    assert.equal(pagina.status, 200);
    const fuga = await fetch(`${base}/..%2F..%2Fpackage.json`);
    assert.equal(fuga.status, 404);
  } finally {
    srv.close();
  }
});

test('interface: só preto, branco e cinza', () => {
  const css = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'style.css'), 'utf8');
  const cores = css.match(/#[0-9a-fA-F]{3,6}\b/g) || [];
  for (const c of cores) {
    const h = c.length === 4 ? c.slice(1).split('').map(x => x + x).join('') : c.slice(1);
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    assert.ok(r === g && g === b, `cor não neutra: ${c}`);
  }
});
