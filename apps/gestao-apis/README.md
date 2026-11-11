# Gestão de APIs (v2)

App pessoal para usar o Grok (xAI) e o Claude (Anthropic) num só lugar: escolhe o provedor de cada pedido, troca sozinho quando um falha, mostra o saldo quando você pede e guarda tudo num banco versionado.

## Como rodar

Precisa do Node.js 22.5 ou mais novo. Não tem dependências para instalar.

```bash
export XAI_API_KEY=...
export ANTHROPIC_API_KEY=...
npm start
```

Abra `http://localhost:4317`. O app só escuta em `localhost`. Para mudar a porta, use `PORT`. O banco fica em `dados.sqlite` (ou no caminho de `GESTAO_DB`).

## Testes

```bash
npm test
```

## O que cada tela faz

- **Painel:** estado de cada provedor, saldo estimado, "Ver saldo", "Atualizar todos" e registro manual de saldo.
- **Console:** envia um pedido em modo auto, Grok ou Claude, com tipo de tarefa e prompt salvo opcional.
- **Histórico:** todas as chamadas, inclusive as que falharam, com os eventos do orquestrador. Exporta o banco em JSON.
- **Prompts:** biblioteca versionada, com comparação e rollback.
- **Configurações:** regras do orquestrador, versionadas, com rollback.

## Diferenças em relação à especificação

- **Saldo:** nem a xAI nem a Anthropic informam o crédito restante com uma chave comum de API. O botão "Ver saldo" registra a consulta com data e hora, mostra "Saldo indisponível pela API" com o link do painel de cobrança e aceita o valor digitado à mão. A partir daí o app desconta o gasto das chamadas registradas.
- **Configuração em JSON, não YAML:** evita uma dependência externa. Os campos são os mesmos da seção 3.4, mais `modelo` e preços por milhão de tokens.
- **Migrações:** arquivos SQL numerados em `src/migrations/`, aplicados na partida (o papel do Flyway na spec).
- **Rollback:** restaurar cria uma nova versão com o conteúdo antigo; nada é apagado.
