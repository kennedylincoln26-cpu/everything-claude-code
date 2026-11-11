'use strict';
// Clientes HTTP dos provedores. `fetchImpl` pode ser trocado nos testes.

const TIMEOUT_MS = 60000;

class ErroProvedor extends Error {
  constructor(mensagem, { status = 0, tipo = 'erro' } = {}) {
    super(mensagem);
    this.status = status;
    this.tipo = tipo; // 'timeout' | 'http' | 'sem_chave' | 'erro'
  }
  // 5xx, timeout, 401 e 429 deixam o provedor em cooldown (seção 3.2, regra 2).
  get derrubaProvedor() {
    return this.tipo === 'timeout' || this.tipo === 'sem_chave' || this.status === 401 || this.status === 429 || this.status >= 500;
  }
}

async function postJson(fetchImpl, url, headers, corpo) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let resp;
  try {
    resp = await fetchImpl(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(corpo), signal: ctrl.signal });
  } catch (e) {
    throw new ErroProvedor(e.name === 'AbortError' ? 'Tempo esgotado' : `Falha de rede: ${e.message}`, { tipo: e.name === 'AbortError' ? 'timeout' : 'erro', status: e.name === 'AbortError' ? 0 : 503 });
  } finally {
    clearTimeout(t);
  }
  const texto = await resp.text();
  if (!resp.ok) throw new ErroProvedor(`HTTP ${resp.status}: ${texto.slice(0, 300)}`, { status: resp.status, tipo: 'http' });
  return JSON.parse(texto);
}

function chave(cfgProv) {
  const k = process.env[cfgProv.env_chave];
  if (!k) throw new ErroProvedor(`Variável ${cfgProv.env_chave} não definida`, { tipo: 'sem_chave' });
  return k;
}

const PROVEDORES = {
  grok: {
    async chamar(cfgProv, prompt, fetchImpl = fetch) {
      const j = await postJson(fetchImpl, `${cfgProv.base_url}/chat/completions`, { authorization: `Bearer ${chave(cfgProv)}` },
        { model: cfgProv.modelo, messages: [{ role: 'user', content: prompt }] });
      return {
        texto: j.choices?.[0]?.message?.content ?? '',
        tokens_entrada: j.usage?.prompt_tokens ?? 0,
        tokens_saida: j.usage?.completion_tokens ?? 0
      };
    },
    painel_cobranca: 'https://console.x.ai'
  },
  claude: {
    async chamar(cfgProv, prompt, fetchImpl = fetch) {
      const j = await postJson(fetchImpl, `${cfgProv.base_url}/messages`, { 'x-api-key': chave(cfgProv), 'anthropic-version': '2023-06-01' },
        { model: cfgProv.modelo, max_tokens: cfgProv.max_tokens || 4096, messages: [{ role: 'user', content: prompt }] });
      return {
        texto: (j.content || []).filter(b => b.type === 'text').map(b => b.text).join(''),
        tokens_entrada: j.usage?.input_tokens ?? 0,
        tokens_saida: j.usage?.output_tokens ?? 0
      };
    },
    painel_cobranca: 'https://console.anthropic.com/settings/billing'
  }
};

// Nenhum dos dois expõe o saldo de crédito com uma chave comum de API,
// então o app mostra "Saldo indisponível pela API" e aceita registro manual (seção 4).
async function consultarSaldo(_nome) {
  return null;
}

function custo(cfgProv, tokensEntrada, tokensSaida) {
  return (tokensEntrada * (cfgProv.preco_entrada_mtok || 0) + tokensSaida * (cfgProv.preco_saida_mtok || 0)) / 1e6;
}

module.exports = { PROVEDORES, ErroProvedor, consultarSaldo, custo };
