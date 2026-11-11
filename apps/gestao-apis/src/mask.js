'use strict';

// Mascara qualquer coisa parecida com chave de API (xai-..., sk-ant-..., Bearer ...).
const PADROES = [
  /\b(xai|sk-ant|sk)-[A-Za-z0-9_-]{8,}/g,
  /(Bearer\s+)[A-Za-z0-9._-]{8,}/gi,
  /(x-api-key["':\s]+)[A-Za-z0-9._-]{8,}/gi
];

function mascarar(texto) {
  if (texto === null || texto === undefined) return texto;
  let s = String(texto);
  for (const chave of [process.env.XAI_API_KEY, process.env.ANTHROPIC_API_KEY]) {
    if (chave && chave.length >= 8) s = s.split(chave).join('****');
  }
  s = s.replace(PADROES[0], (m, p) => `${p}-****`);
  s = s.replace(PADROES[1], '$1****');
  s = s.replace(PADROES[2], '$1****');
  return s;
}

function log(...partes) {
  console.error('[gestao-apis]', ...partes.map(p => mascarar(typeof p === 'string' ? p : JSON.stringify(p))));
}

module.exports = { mascarar, log };
