'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');
const { criarOrquestrador } = require('./orchestrator');
const { consultarSaldo, PROVEDORES } = require('./providers');
const { mascarar, log } = require('./mask');

const PUBLICO = path.join(__dirname, '..', 'public');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };
const LIMITE_CORPO = 1024 * 1024;

function lerCorpo(req) {
  return new Promise((ok, falha) => {
    let tam = 0;
    const partes = [];
    req.on('data', p => {
      tam += p.length;
      if (tam > LIMITE_CORPO) { falha(Object.assign(new Error('Corpo grande demais'), { status: 413 })); req.destroy(); return; }
      partes.push(p);
    });
    req.on('end', () => {
      if (!partes.length) return ok({});
      try { ok(JSON.parse(Buffer.concat(partes).toString('utf8'))); } catch { falha(Object.assign(new Error('JSON inválido'), { status: 400 })); }
    });
    req.on('error', falha);
  });
}

function json(res, status, dados) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(mascarar(JSON.stringify(dados)));
}

function criarApp(conn, opcoes = {}) {
  const orq = criarOrquestrador(conn, opcoes);

  function provedorValido(nome) {
    if (!db.configAtiva(conn).dados.provedores[nome]) throw Object.assign(new Error('Provedor desconhecido'), { status: 404 });
  }

  const rotas = [
    ['GET', /^\/api\/estado$/, () => {
      const cfg = db.configAtiva(conn).dados;
      const estados = orq.estados();
      return {
        saldo_minimo_usd: cfg.orquestrador.saldo_minimo_usd,
        provedores: Object.keys(cfg.provedores).map(n => ({
          nome: n, ...(estados[n] || { estado: 'ativo' }), saldo: db.saldoEstimado(conn, n),
          chave_configurada: Boolean(process.env[cfg.provedores[n].env_chave]),
          painel_cobranca: PROVEDORES[n]?.painel_cobranca || null
        }))
      };
    }],
    ['POST', /^\/api\/saldo\/(\w+)\/consultar$/, async (_c, m) => {
      provedorValido(m[1]);
      const v = await consultarSaldo(m[1]);
      db.registrarSaldo(conn, m[1], v, v === null ? 'indisponivel' : 'api');
      return { disponivel_pela_api: v !== null, saldo: db.saldoEstimado(conn, m[1]) };
    }],
    ['POST', /^\/api\/saldo\/(\w+)\/manual$/, (c, m) => {
      provedorValido(m[1]);
      const v = Number(c.saldo_usd);
      if (!Number.isFinite(v) || v < 0) throw Object.assign(new Error('saldo_usd precisa ser um número >= 0'), { status: 400 });
      db.registrarSaldo(conn, m[1], v, 'manual');
      return { saldo: db.saldoEstimado(conn, m[1]) };
    }],
    ['POST', /^\/api\/executar$/, async c => {
      try {
        return await orq.executar({ prompt: c.prompt, tipo: c.tipo || 'padrao', provedor: c.provedor || 'auto', promptVersaoId: c.prompt_versao_id || null });
      } catch (e) {
        throw Object.assign(e, { status: e.message === 'Prompt vazio' ? 400 : 502 });
      }
    }],
    ['GET', /^\/api\/historico$/, (_c, _m, url) => db.historico(conn, {
      provedor: url.searchParams.get('provedor') || undefined,
      status: url.searchParams.get('status') || undefined,
      limite: url.searchParams.get('limite') || 100
    })],
    ['GET', /^\/api\/prompts$/, () => db.listarPrompts(conn)],
    ['POST', /^\/api\/prompts$/, c => db.salvarPrompt(conn, c.nome, c.conteudo, c.autor)],
    ['POST', /^\/api\/prompts\/(\d+)\/restaurar$/, (c, m) => db.restaurarPrompt(conn, Number(m[1]), Number(c.versao))],
    ['GET', /^\/api\/config$/, () => ({ ativa: db.configAtiva(conn), versoes: db.listarConfigs(conn) })],
    ['POST', /^\/api\/config$/, c => ({ versao: db.salvarConfig(conn, c.dados) })],
    ['POST', /^\/api\/config\/restaurar$/, c => ({ versao: db.restaurarConfig(conn, Number(c.versao)) })],
    ['GET', /^\/api\/exportar$/, () => db.exportar(conn)]
  ];

  return async function app(req, res) {
    const url = new URL(req.url, 'http://localhost');
    try {
      for (const [metodo, re, fn] of rotas) {
        const m = url.pathname.match(re);
        if (m && req.method === metodo) {
          const corpo = metodo === 'POST' ? await lerCorpo(req) : {};
          return json(res, 200, await fn(corpo, m, url));
        }
      }
      if (url.pathname.startsWith('/api/')) return json(res, 404, { erro: 'Rota não encontrada' });
      const arq = path.normalize(path.join(PUBLICO, url.pathname === '/' ? 'index.html' : url.pathname));
      if (!arq.startsWith(PUBLICO + path.sep) || !fs.existsSync(arq) || !fs.statSync(arq).isFile()) {
        res.writeHead(404); return res.end('Não encontrado');
      }
      res.writeHead(200, { 'content-type': TIPOS[path.extname(arq)] || 'application/octet-stream' });
      fs.createReadStream(arq).pipe(res);
    } catch (e) {
      const status = e.status || 500;
      if (status >= 500) log(`erro ${req.method} ${url.pathname}:`, e.message);
      json(res, status, { erro: e.message });
    }
  };
}

if (require.main === module) {
  const conn = db.abrir();
  const porta = Number(process.env.PORT) || 4317;
  const host = process.env.HOST || '127.0.0.1';
  http.createServer(criarApp(conn)).listen(porta, host, () => log(`rodando em http://${host}:${porta}`));
}

module.exports = { criarApp };
