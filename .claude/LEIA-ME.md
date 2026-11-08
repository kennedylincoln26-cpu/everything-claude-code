# Kit ECC para sessões na nuvem (celular / navegador)

Esta pasta faz o Claude Code carregar parte do ECC automaticamente em qualquer
sessão aberta neste repositório — inclusive pelo app do celular ou claude.ai/code,
sem instalar nada no PC.

Os arquivos são **cópias** das pastas oficiais da raiz (`commands/`, `agents/`,
`skills/`, `rules/common/`). Se você atualizar o fork com o repositório original,
copie de novo os arquivos para manter tudo em dia.

## Comandos (digite `/` na sessão)

| Comando | O que faz |
|---|---|
| `/plan` | Entende o pedido, lista riscos e monta um plano — espera você confirmar antes de codar |
| `/feature-dev` | Desenvolvimento guiado de uma funcionalidade nova |
| `/code-review` | Revisa as mudanças locais ou um Pull Request (passe o número do PR) |
| `/build-fix` | Encontra e corrige erros de build/compilação |
| `/refactor-clean` | Remove código morto e simplifica com segurança |
| `/test-coverage` | Mede a cobertura de testes e cria os testes que faltam |

Também continuam disponíveis: `/feature-development`, `/database-migration`, `/add-language-rules`.

## Agentes (o Claude chama sozinho, ou você pede: "use o agente planner")

planner, architect, tdd-guide, code-reviewer, security-reviewer,
build-error-resolver, e2e-runner, refactor-cleaner, typescript-reviewer, python-reviewer

## Skills (ativadas pelo contexto, ou peça pelo nome)

tdd-workflow, verification-loop, security-review, coding-standards,
e2e-testing, search-first, api-design

## Regras sempre ativas

`rules/ecc-common/` — estilo de código, segurança, testes, git, performance e padrões.

## Como atualizar as cópias

```bash
for c in plan feature-dev code-review build-fix refactor-clean test-coverage; do cp commands/$c.md .claude/commands/; done
for a in planner architect tdd-guide code-reviewer security-reviewer build-error-resolver e2e-runner refactor-cleaner typescript-reviewer python-reviewer; do cp agents/$a.md .claude/agents/; done
for s in tdd-workflow verification-loop security-review coding-standards e2e-testing search-first api-design; do rm -rf .claude/skills/$s && cp -r skills/$s .claude/skills/; done
cp rules/common/*.md .claude/rules/ecc-common/
```

## Limitações

- Vale só dentro deste repositório. Para outros projetos, copie a pasta `.claude/` para eles.
- Hooks (automações) não foram incluídos — eles dependem dos scripts do plugin instalado.
- A instalação completa (todos os 98 comandos, 71 agentes e 314 skills) continua sendo
  pelo PC: `npx ecc-universal@2.2.3 setup`.
