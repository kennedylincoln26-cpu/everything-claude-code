# Kit Superpowers + ECC + Karpathy (celular, navegador e PC)

Esta pasta faz o Claude Code carregar três kits juntos em qualquer sessão aberta
neste repositório, inclusive pelo app do celular ou claude.ai/code, sem instalar
nada.

- **Karpathy** (comportamento base): pensar antes de codar, código simples,
  mudar só o que foi pedido e definir como verificar que deu certo.
- **Superpowers** (processo): entender o pedido, planejar, executar, depurar e
  verificar.
- **ECC** (ferramentas específicas): revisores por linguagem, build, segurança,
  design e testes E2E.

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
| `writing-skills` | Criar novas skills |

Origem: [obra/superpowers](https://github.com/obra/superpowers) v7.0.2 (commit
`22f0b46`), licença MIT em `skills/SUPERPOWERS-LICENSE`. Ficaram de fora
`using-superpowers` (a ordem automática de início de sessão) e
`diagnosing-superpowers` (diagnóstico do plugin), substituídos pela regra de escolha.

## ECC

**Comandos** (digite `/`):

| Comando | O que faz |
|---|---|
| `/code-review` | Revisa um Pull Request do GitHub (passe o número) ou as mudanças locais |
| `/build-fix` | Corrige erros de build/compilação |
| `/refactor-clean` | Remove código morto com segurança |
| `/test-coverage` | Mede a cobertura e cria os testes que faltam |

Também existem `/feature-development`, `/database-migration` e
`/add-language-rules`, que vêm do repositório original e servem para trabalhar no
próprio ECC.

**Agentes:** architect, security-reviewer, build-error-resolver, e2e-runner,
refactor-cleaner, typescript-reviewer, python-reviewer.

**Skills:** security-review, coding-standards, e2e-testing, search-first,
api-design.

**Skill própria deste fork:** `futuristic-luxury-design`, visual futurista e de
luxo. Peça: "use a skill futuristic-luxury-design nesta página".

**Regras sempre ativas** (`rules/ecc-common/`): estilo de código, segurança,
revisão de código, git e padrões.

## O que foi removido para não haver conflito

| Removido (ECC) | Substituído por (Superpowers) |
|---|---|
| `/plan`, agente `planner` | `brainstorming` + `writing-plans` |
| `/feature-dev` | `brainstorming` → `writing-plans` → `executing-plans` |
| skill `tdd-workflow`, agente `tdd-guide`, regra `testing.md` | `test-driven-development` |
| skill `verification-loop` | `verification-before-completion` |
| agente `code-reviewer` | `requesting-code-review` |
| regras `development-workflow.md` e `agents.md` | `rules/escolha-de-ferramentas.md` |
| regras `hooks.md` e `performance.md` | (não se aplicam: hooks não estão instalados) |

## Como atualizar

- **ECC:** copie de novo os arquivos das pastas da raiz (`commands/`, `agents/`,
  `skills/`, `rules/common/`), **só os que estão listados acima**. Não traga de
  volta os removidos. Depois, refaça os ajustes de links em
  `rules/ecc-common/code-review.md`, `rules/ecc-common/git-workflow.md`,
  `agents/build-error-resolver.md` e `skills/search-first/SKILL.md`, que apontam
  para as ferramentas do Superpowers no lugar das removidas.
- **Superpowers:** baixe a versão nova de obra/superpowers, copie as pastas de
  `skills/` (menos `using-superpowers` e `diagnosing-superpowers`) e troque
  `superpowers:<nome>` por `<nome>` nos arquivos.
- **Karpathy:** copie de novo o `CLAUDE.md` do repositório para
  `rules/karpathy-guidelines.md`, mantendo o cabeçalho de origem no topo.

## Limitações

- Vale só dentro deste repositório. Para outros projetos, copie a pasta `.claude/`.
- Hooks (automações) não estão incluídos.
- O "visual companion" do `brainstorming` (opcional, abre uma página no navegador)
  carrega o logo do site do Superpowers. Para desligar, defina
  `SUPERPOWERS_DISABLE_TELEMETRY=1`.
