'use strict';
const $ = s => document.querySelector(s);
const NOMES = { grok: 'Grok', claude: 'Claude' };
const ROTULO = { ativo: 'ativo', degradado: 'degradado', indisponivel: 'indisponível' };

function el(tag, attrs = {}, ...filhos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'onclick') e.addEventListener('click', v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  }
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === '') continue;
    // Em <summary>, cada campo vira um <span> para o espaçamento do flex funcionar.
    e.append(f instanceof Node ? f : tag === 'summary' ? Object.assign(document.createElement('span'), { textContent: String(f) }) : String(f));
  }
  return e;
}

async function api(caminho, corpo) {
  const r = await fetch(caminho, corpo === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.erro || `Erro ${r.status}`);
  return j;
}

function avisar(msg) {
  const a = $('#aviso');
  a.textContent = msg;
  a.classList.remove('oculto');
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => a.classList.add('oculto'), 4000);
}

const usd = v => (v === null || v === undefined ? '—' : `US$ ${Number(v).toFixed(4)}`);

// ---------- Painel ----------
async function consultar(nome) {
  const r = await api(`/api/saldo/${nome}/consultar`, {});
  if (!r.disponivel_pela_api) avisar(`${NOMES[nome] || nome}: saldo indisponível pela API`);
}

function cartao(p, minimo) {
  const s = p.saldo;
  const baixo = s.estimado !== null && s.estimado < minimo;
  const manual = el('input', { type: 'number', step: '0.01', min: '0', placeholder: 'US$' });
  return el('div', { class: 'cartao' },
    el('div', { class: 'cab' },
      el('strong', {}, NOMES[p.nome] || p.nome),
      el('span', { class: 'estado' }, el('span', { class: `ponto ${p.estado}` }), ROTULO[p.estado] || p.estado,
        p.cooldown_restante_s ? ` (${p.cooldown_restante_s}s)` : '')),
    el('div', { class: 'suave' }, 'Saldo estimado'),
    el('div', { class: 'saldo' }, s.estimado === null ? '—' : usd(s.estimado)),
    el('div', { class: 'suave mono' },
      s.consultado_em ? `consultado ${s.consultado_em} UTC · ${s.origem}` : 'nunca consultado',
      s.saldo !== null ? ` · gasto desde então ${usd(s.gasto_desde)}` : ''),
    s.origem === 'indisponivel' || s.saldo === null
      ? el('div', { class: 'suave' }, 'Saldo indisponível pela API. ', p.painel_cobranca ? el('a', { href: p.painel_cobranca, target: '_blank', rel: 'noopener' }, 'Abrir painel de cobrança') : null)
      : null,
    baixo ? el('div', { class: 'alerta' }, `Abaixo do mínimo de ${usd(minimo)}`) : null,
    p.chave_configurada ? null : el('div', { class: 'alerta' }, 'Chave não configurada no ambiente'),
    el('div', { class: 'acoes' },
      el('button', { onclick: async e => { e.target.disabled = true; try { await consultar(p.nome); await painel(); } catch (x) { avisar(x.message); } e.target.disabled = false; } }, 'Ver saldo'),
      manual,
      el('button', { onclick: async () => { try { await api(`/api/saldo/${p.nome}/manual`, { saldo_usd: manual.value }); await painel(); } catch (x) { avisar(x.message); } } }, 'Registrar manual')));
}

async function painel() {
  try {
    const e = await api('/api/estado');
    $('#cartoes').replaceChildren(...e.provedores.map(p => cartao(p, e.saldo_minimo_usd)));
  } catch (x) { avisar(x.message); }
}

$('#atualizar-todos').addEventListener('click', async ev => {
  ev.target.disabled = true;
  try {
    const e = await api('/api/estado');
    for (const p of e.provedores) await consultar(p.nome);
    await painel();
  } catch (x) { avisar(x.message); }
  ev.target.disabled = false;
});

// ---------- Console ----------
let promptsCache = [];
$('#prompt-salvo').addEventListener('change', e => {
  const v = promptsCache.flatMap(p => p.versoes).find(v => String(v.id) === e.target.value);
  if (v) $('#prompt').value = v.conteudo;
});

$('#enviar').addEventListener('click', async ev => {
  ev.target.disabled = true;
  $('#resultado').classList.remove('oculto');
  $('#meta').textContent = 'enviando…';
  $('#resposta').textContent = '';
  try {
    const r = await api('/api/executar', {
      prompt: $('#prompt').value, tipo: $('#tipo').value, provedor: $('#provedor').value,
      prompt_versao_id: $('#prompt-salvo').value ? Number($('#prompt-salvo').value) : null
    });
    $('#meta').textContent = `${NOMES[r.provedor]}${r.fallback ? ' (fallback)' : ''} · ${r.motivo} · ${r.tokens_entrada}+${r.tokens_saida} tokens · ${usd(r.custo_usd)} · ${r.latencia_ms} ms`;
    $('#resposta').textContent = r.resposta;
  } catch (x) {
    $('#meta').textContent = 'erro';
    $('#resposta').textContent = x.message;
  }
  ev.target.disabled = false;
});

// ---------- Histórico ----------
async function historico() {
  const q = new URLSearchParams({ provedor: $('#f-provedor').value, status: $('#f-status').value });
  try {
    const lista = await api(`/api/historico?${q}`);
    $('#lista-historico').replaceChildren(...(lista.length ? lista.map(c => el('details', { class: 'item' },
      el('summary', {}, `#${c.id}`, c.criado_em, NOMES[c.provedor] || c.provedor || '—', c.tipo_tarefa, c.status, usd(c.custo_usd), `${c.latencia_ms} ms`),
      el('pre', {}, `PROMPT\n${c.prompt}\n\n${c.status === 'ok' ? `RESPOSTA\n${c.resposta}` : `ERRO\n${c.erro}`}`),
      el('div', { class: 'suave mono' }, `tokens ${c.tokens_entrada}+${c.tokens_saida} · prompt v${c.prompt_versao_id ?? '—'} · config #${c.config_versao_id ?? '—'}`),
      ...c.eventos.map(ev => el('div', { class: 'suave mono' }, `↳ ${ev.de_provedor || '·'} → ${ev.para_provedor || '·'}: ${ev.motivo}`))
    )) : [el('p', { class: 'suave' }, 'Nenhuma chamada ainda.')]));
  } catch (x) { avisar(x.message); }
}
$('#f-provedor').addEventListener('change', historico);
$('#f-status').addEventListener('change', historico);
$('#exportar').addEventListener('click', () => { window.location.href = '/api/exportar'; });

// ---------- Prompts ----------
async function prompts() {
  try {
    promptsCache = await api('/api/prompts');
    $('#prompt-salvo').replaceChildren(el('option', { value: '' }, 'nenhum'),
      ...promptsCache.flatMap(p => p.versoes.slice(0, 1).map(v => el('option', { value: v.id }, `${p.nome} (v${v.versao})`))));
    $('#lista-prompts').replaceChildren(...promptsCache.map(p => el('div', { class: 'cartao' },
      el('div', { class: 'cab' }, el('strong', {}, p.nome), el('span', { class: 'suave' }, `${p.versoes.length} versões`)),
      ...p.versoes.map((v, i) => el('details', { class: 'item' },
        el('summary', {}, `v${v.versao}`, v.criado_em, v.autor, i === 0 ? 'atual' : ''),
        el('pre', {}, v.conteudo),
        i > 0 ? el('pre', { class: 'suave' }, diff(v.conteudo, p.versoes[0].conteudo)) : null,
        i > 0 ? el('button', { onclick: async () => { try { await api(`/api/prompts/${p.id}/restaurar`, { versao: v.versao }); avisar(`v${v.versao} restaurada como nova versão`); prompts(); } catch (x) { avisar(x.message); } } }, 'Restaurar esta versão') : null
      )))));
  } catch (x) { avisar(x.message); }
}

// Comparação simples linha a linha com a versão atual.
function diff(antiga, atual) {
  const a = antiga.split('\n');
  const b = atual.split('\n');
  const saida = ['comparação com a versão atual:'];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] === b[i]) continue;
    if (a[i] !== undefined) saida.push(`- ${a[i]}`);
    if (b[i] !== undefined) saida.push(`+ ${b[i]}`);
  }
  return saida.length > 1 ? saida.join('\n') : 'idêntica à atual';
}

$('#p-salvar').addEventListener('click', async () => {
  try {
    const r = await api('/api/prompts', { nome: $('#p-nome').value.trim(), conteudo: $('#p-conteudo').value });
    avisar(`Salvo como v${r.versao}`);
    prompts();
  } catch (x) { avisar(x.message); }
});

// ---------- Configurações ----------
async function config() {
  try {
    const c = await api('/api/config');
    $('#c-texto').value = JSON.stringify(c.ativa.dados, null, 2);
    $('#lista-config').replaceChildren(...c.versoes.map(v => el('details', { class: 'item' },
      el('summary', {}, `v${v.versao}`, v.criado_em, v.ativo ? 'ativa' : ''),
      el('pre', {}, v.conteudo),
      v.ativo ? null : el('button', { onclick: async () => { try { await api('/api/config/restaurar', { versao: v.versao }); avisar(`v${v.versao} restaurada`); config(); } catch (x) { avisar(x.message); } } }, 'Restaurar esta versão'))));
  } catch (x) { avisar(x.message); }
}

$('#c-salvar').addEventListener('click', async () => {
  let dados;
  try { dados = JSON.parse($('#c-texto').value); } catch { return avisar('JSON inválido'); }
  try { const r = await api('/api/config', { dados }); avisar(`Salvo como v${r.versao}`); config(); } catch (x) { avisar(x.message); }
});

// ---------- Navegação ----------
const CARREGAR = { painel, console: prompts, historico, prompts, config };
$('#abas').addEventListener('click', e => {
  const t = e.target.dataset.tela;
  if (!t) return;
  document.querySelectorAll('#abas button').forEach(b => b.classList.toggle('ativa', b === e.target));
  document.querySelectorAll('.tela').forEach(s => s.classList.toggle('ativa', s.id === t));
  CARREGAR[t]();
});

painel();
prompts();
setInterval(() => { if ($('#painel').classList.contains('ativa')) painel(); }, 5000); // só o estado local; o saldo é consultado apenas no clique
