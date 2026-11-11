CREATE TABLE provedores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'ativo',
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE prompt_versoes (
  id INTEGER PRIMARY KEY,
  prompt_id INTEGER NOT NULL REFERENCES prompts(id),
  versao INTEGER NOT NULL,
  conteudo TEXT NOT NULL,
  autor TEXT NOT NULL DEFAULT 'eu',
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (prompt_id, versao)
);
CREATE TABLE configuracoes_versoes (
  id INTEGER PRIMARY KEY,
  versao INTEGER NOT NULL UNIQUE,
  conteudo TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE chamadas (
  id INTEGER PRIMARY KEY,
  provedor_id INTEGER REFERENCES provedores(id),
  tipo_tarefa TEXT NOT NULL,
  prompt_versao_id INTEGER REFERENCES prompt_versoes(id),
  config_versao_id INTEGER REFERENCES configuracoes_versoes(id),
  prompt TEXT NOT NULL,
  resposta TEXT,
  erro TEXT,
  tokens_entrada INTEGER NOT NULL DEFAULT 0,
  tokens_saida INTEGER NOT NULL DEFAULT 0,
  custo_usd REAL NOT NULL DEFAULT 0,
  latencia_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now'))
);
CREATE TABLE saldos (
  id INTEGER PRIMARY KEY,
  provedor_id INTEGER NOT NULL REFERENCES provedores(id),
  saldo_usd REAL,
  origem TEXT NOT NULL CHECK (origem IN ('api', 'manual', 'indisponivel')),
  consultado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE eventos_orquestrador (
  id INTEGER PRIMARY KEY,
  chamada_id INTEGER REFERENCES chamadas(id),
  de_provedor TEXT,
  para_provedor TEXT,
  motivo TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
