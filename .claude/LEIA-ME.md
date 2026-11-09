# Kit completo: Karpathy + Superpowers + ECC + Anthropic

Esta pasta faz o Claude Code carregar quatro kits juntos em qualquer sessão
aberta neste repositório, inclusive pelo app do celular ou claude.ai/code, sem
instalar nada.

- **Karpathy** (comportamento base): pensar antes de codar, código simples,
  mudar só o que foi pedido e definir como verificar que deu certo.
- **Superpowers** (processo): entender o pedido, planejar, executar, depurar e
  verificar.
- **ECC** (ferramentas específicas): revisores por linguagem, build, segurança,
  limpeza de código e testes E2E.
- **Anthropic** (oficial): design de interface, servidores MCP, teste de app web,
  arte e imagem, e comandos de git.

Funções duplicadas foram removidas: cada tarefa tem uma única ferramenta. A regra
`rules/escolha-de-ferramentas.md` diz ao Claude qual usar em cada situação e quem
vale quando duas regras se chocam, então você não precisa escolher.

## Karpathy (regra sempre ativa)

`rules/karpathy-guidelines.md`, com 4 princípios:

1. **Pensar antes de codar**: dizer as suposições e perguntar quando o pedido
   tiver mais de um sentido.
2. **Simplicidade**: o mínimo de código que resolve, nada "para o futuro".
3. **Mudanças cirúrgicas**: mexer só no que foi pedido, sem "melhorar" o resto.
4. **Execução por objetivo**: transformar o pedido em algo verificável (por
   exemplo, um teste) e repetir até passar.

Origem: [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills),
pelo seu fork `kennedylincoln26-cpu/andrej-karpathy-skills` (commit `2c60614`),
licença MIT. É uma regra, não uma skill: vale em toda tarefa, sem precisar chamar.

## Superpowers (skills)

| Skill | Para quê |
|---|---|
| `brainstorming` | Entender a ideia antes de codar |
| `writing-plans` / `executing-plans` | Montar e seguir um plano |
| `subagent-driven-development` | Executar o plano com subagentes |
| `dispatching-parallel-agents` | Tarefas independentes em paralelo |
| `test-driven-development` | Teste antes do código |
| `systematic-debugging` | Achar a causa de bugs |
| `verification-before-completion` | Provar que terminou antes de dizer "pronto" |
| `requesting-code-review` / `receiving-code-review` | Pedir e aplicar revisão |
| `using-git-worktrees` / `finishing-a-development-branch` | Organizar branches |

Origem: [obra/superpowers](https://github.com/obra/superpowers) v7.0.2 (commit
`22f0b46`), licença MIT em `skills/SUPERPOWERS-LICENSE`. Ficaram de fora
`using-superpowers` (a ordem automática de início de sessão),
`diagnosing-superpowers` (diagnóstico do plugin) e `writing-skills` (sua conta já
tem o `skill-creator`, que faz o mesmo).

## ECC

**Comandos** (digite `/`):

| Comando | O que faz |
|---|---|
| `/build-fix` | Corrige erros de build/compilação |
| `/refactor-clean` | Remove código morto com segurança |
| `/test-coverage` | Mede a cobertura e cria os testes que faltam |

Também existem `/feature-development`, `/database-migration` e
`/add-language-rules`, que vêm do repositório original e servem para trabalhar no
próprio ECC.

**Agentes:** architect, security-reviewer, build-error-resolver, e2e-runner,
refactor-cleaner, typescript-reviewer, python-reviewer.

**Skills:** coding-standards, e2e-testing, search-first, api-design.

**Skill própria deste fork:** `futuristic-luxury-design`, visual futurista e de
luxo. Peça: "use a skill futuristic-luxury-design nesta página".

**Regras sempre ativas** (`rules/ecc-common/`): estilo de código, segurança,
revisão de código, git e padrões.

## Anthropic

**Skills** de [anthropics/skills](https://github.com/anthropics/skills) (commit
`2c5958e`, licença Apache 2.0 em cada pasta; avisos de terceiros em
`skills/ANTHROPIC-SKILLS-THIRD-PARTY-NOTICES.md`):

| Skill | Para quê |
|---|---|
| `frontend-design` | Direção visual para qualquer interface, sem cara de template |
| `webapp-testing` | Abrir e testar um app web local: clicar, tirar print, ver logs |
| `mcp-builder` | Criar servidores MCP (ligar o Claude a APIs e serviços) |
| `algorithmic-art` | Arte generativa com código (p5.js) |
| `canvas-design` | Pôsteres e artes estáticas em PNG/PDF (inclui fontes com licença OFL) |
| `slack-gif-creator` | GIFs animados |

**Comandos** do plugin oficial `commit-commands`, da loja de plugins do
[anthropics/claude-code](https://github.com/anthropics/claude-code). O código vem
de [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
(commit `0412be7`), com licença Apache 2.0 em `commands/COMMIT-COMMANDS-LICENSE`:

| Comando | O que faz |
|---|---|
| `/commit` | Cria um commit das mudanças atuais |
| `/commit-push-pr` | Commit, push e Pull Request de uma vez (no PC precisa do GitHub CLI `gh`) |
| `/clean_gone` | Apaga branches locais que já foram apagados no GitHub |

## Terceiros (revisados antes de entrar)

Skills de outros autores. Cada uma passou por revisão manual do código antes de
entrar: rede, comandos, arquivos, credenciais e caracteres escondidos. A
licença está dentro de cada pasta.

| Skill | Para quê | Origem |
|---|---|---|
| `skill-inspector` | Checar se uma skill ou plugin é seguro **antes** de instalar | [NVIDIA/SkillSpector](https://github.com/NVIDIA/SkillSpector) (commit `919aa4b`, Apache 2.0) |
| `animate` | Vídeos animados feitos em código, com 7 estilos prontos ou um estilo novo a partir das suas referências | [cth9191/animate](https://github.com/cth9191/animate) (commit `7e5eb56`, MIT) |
| `ponytail` / `ponytail-debt` | Modo "dev sênior preguiçoso" (a menor mudança que resolve) e a lista dos atalhos marcados com `shortcut:` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) (commit `96608e0`, MIT) |
| `agent-reach` | Ler Reddit, YouTube, X, GitHub e outras redes quando a busca normal não basta | [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) v1.6.1 (commit `c70ae6d`, MIT) |

O que cada uma precisa e o que ficou de fora:

- **`skill-inspector`:** funciona sem instalar nada (faz a revisão lendo o
  código). Com o programa `skillspector` instalado no PC, faz também a varredura
  automática: `uv tool install git+https://github.com/NVIDIA/skillspector.git`.
- **`animate`:** precisa de Node 18+, Playwright com Chromium e ffmpeg. Narração é
  opcional (Python com `faster-whisper`). Usa só programas da máquina, sem rede.
- **`ponytail`:** entraram só as skills. Os hooks ficaram de fora: rodavam a cada
  mensagem, gravavam um CSV em `~/.config/ponytail/` e podiam enviar dados para um
  webhook. `ponytail-review` e `ponytail-audit` também ficaram de fora, porque
  repetem o `/code-review`. O Karpathy continua sendo a regra base. O `ponytail`
  só entra quando você pede (veja `rules/escolha-de-ferramentas.md`).
- **`agent-reach`:** a skill só funciona com o programa `agent-reach` instalado
  no PC (Python). **Atenção:** ele copia automaticamente o login do site a partir
  do seu Chrome (se conectado à extensão OpenCLI), usa um navegador próprio
  feito para não ser detectado como robô e baixa instaladores (`uv`, Node).
  X e Reddit pedem login, e o Reddit costuma bloquear servidores na nuvem. O
  `SKILL.md` é a versão em inglês, com a tabela de canais trocada por
  `agent-reach channels` (no original, ela é gerada na instalação).

**Não instalado: FreeLLMAPI** ([tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi)).
Não é um plugin. É um servidor que junta as cotas grátis de outros provedores
(Groq, Gemini etc.) e se passa pela API da Anthropic. Com ele, o Claude Code passa
a rodar com esses modelos **no lugar do Claude**, e o seu código vai para esses
provedores. Se mesmo assim quiser testar, rode no seu PC e siga o README do
projeto (`npx freellmapi launch`). O "mais de 7 bilhões de tokens" do vídeo não
bate com o README, que fala em cerca de 4 bilhões por mês.

## Já vem pronto (não precisa de nada aqui)

- **No Claude Code:** `/code-review` (revisão de PR ou do diff),
  `/security-review` (segurança das mudanças do branch), `/simplify` e `/run`.
- **Na sua conta:** `skill-creator`, `docx`, `pdf`, `pptx` e `xlsx`.

## O que foi removido ou deixado de fora para não haver conflito

| Item | Motivo / substituto |
|---|---|
| ECC: `/plan`, agente `planner` | `brainstorming` + `writing-plans` |
| ECC: `/feature-dev` | `brainstorming` → `writing-plans` → `executing-plans` |
| ECC: skill `tdd-workflow`, agente `tdd-guide`, regra `testing.md` | `test-driven-development` |
| ECC: skill `verification-loop` | `verification-before-completion` |
| ECC: agente `code-reviewer` | `requesting-code-review` |
| ECC: comando `/code-review` | escondia o `/code-review` do Claude Code, que é mais completo |
| ECC: skill `security-review` | tinha o mesmo nome do `/security-review` do Claude Code |
| ECC: regras `development-workflow.md` e `agents.md` | `rules/escolha-de-ferramentas.md` |
| ECC: regras `hooks.md` e `performance.md` | não se aplicam: hooks não estão instalados |
| Superpowers: `writing-skills` | `skill-creator` da sua conta |
| Anthropic: `docx`, `pdf`, `pptx`, `xlsx`, `skill-creator`, `claude-api` | já vêm na sua conta ou no Claude Code |
| Anthropic: `web-artifacts-builder` | o Claude Code já tem ferramentas próprias para artifacts |
| Anthropic: `theme-factory`, `brand-guidelines` | competem com o seu design (`brand-guidelines` aplica a marca da Anthropic) |
| Anthropic: `doc-coauthoring` | sua conta já tem a skill `docs` para documentos |
| Anthropic: `internal-comms` | formatos de comunicação interna da Anthropic |
| Anthropic: `academy-guide`, `discernment-nudge` | mudariam o fim das respostas (cursos e perguntas extras) |
| Plugins: `code-review`, `pr-review-toolkit`, `feature-dev`, `frontend-design` | repetem ferramentas que já estão no kit |
| Plugin: `security-guidance` | revisão com Opus ao fim de **toda** resposta (gasta seu limite de uso) e instala pacotes a cada sessão; o kit já tem `security-reviewer` e `/security-review` |
| Plugins: `hookify`, `ralph-loop` | automações que rodam a cada ação ou em loop; não são necessárias agora |
| Plugins: `explanatory-output-style`, `learning-output-style` | mudam o estilo de todas as respostas |
| Plugins: `agent-sdk-dev`, `plugin-dev` | só servem para criar apps do Agent SDK e plugins |

Se um dia quiser algum plugin deixado de fora, instale pela loja oficial, por
exemplo: `/plugin install security-guidance@claude-plugins-official`.

## Como atualizar

- **ECC:** copie de novo os arquivos das pastas da raiz (`commands/`, `agents/`,
  `skills/`, `rules/common/`), **só os que estão listados acima**. Não traga de
  volta os removidos. Depois, refaça os ajustes de links em
  `rules/ecc-common/code-review.md`, `rules/ecc-common/git-workflow.md`,
  `agents/build-error-resolver.md`, `agents/security-reviewer.md` e
  `skills/search-first/SKILL.md`, que apontam para os substitutos.
- **Superpowers:** baixe a versão nova de obra/superpowers, copie as pastas de
  `skills/` (menos `using-superpowers`, `diagnosing-superpowers` e
  `writing-skills`) e troque `superpowers:<nome>` por `<nome>` nos arquivos. Em
  `test-driven-development/writing-good-tests.md`, troque a menção a
  `writing-skills` por `skill-creator`.
- **Karpathy:** copie de novo o `CLAUDE.md` do repositório para
  `rules/karpathy-guidelines.md`, mantendo o cabeçalho de origem no topo.
- **Anthropic:** copie de novo as 6 pastas listadas de `anthropics/skills` e os 3
  comandos de `plugins/commit-commands/commands/` de
  `anthropics/claude-plugins-official`.
- **Terceiros:** antes de atualizar, rode o `skill-inspector` na versão nova.
  Copie as mesmas pastas listadas em "Terceiros". No `agent-reach`, use o
  `agent_reach/skill/SKILL_en.md` e troque `{{VERSION}}` e `{{CHANNEL_TABLE}}`
  como na versão atual.

## Limitações

- Vale só dentro deste repositório. Para outros projetos, copie a pasta `.claude/`.
- Hooks (automações) não estão incluídos.
- Algumas skills precisam de bibliotecas Python que talvez não estejam
  instaladas: `webapp-testing` usa Playwright, e `slack-gif-creator` usa Pillow,
  NumPy e imageio. Na hora de usar, o Claude instala o que faltar, se a rede do
  ambiente permitir.
- O "visual companion" do `brainstorming` (opcional, abre uma página no navegador)
  carrega o logo do site do Superpowers. Para desligar, defina
  `SUPERPOWERS_DISABLE_TELEMETRY=1`.
