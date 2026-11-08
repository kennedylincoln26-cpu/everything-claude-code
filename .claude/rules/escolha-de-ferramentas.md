# Escolha de ferramentas: Superpowers + ECC

Este projeto junta dois kits, sem duplicatas. O **Superpowers** cuida do
*processo* (entender, planejar, executar, depurar, verificar). O **ECC** cuida
das *ferramentas específicas* (linguagem, build, segurança, design). Escolha
pela tarefa, sem cerimônia desnecessária.

## Regra geral

1. **Tarefa pequena e clara** (trocar um texto, renomear algo, ajuste de uma
   linha): faça direto. Não abra brainstorming nem plano.
2. **Ideia nova ou vaga**: comece por `brainstorming`.
3. **Trabalho com várias etapas**: `writing-plans`, depois `executing-plans`
   (sessão única) ou `subagent-driven-development` (tarefas independentes).
4. **Ferramenta específica** (revisor da linguagem, build, segurança, design):
   use a do ECC.
5. Se o usuário chamar um comando ou skill pelo nome, use o que ele pediu.

## Tabela de decisão

| Situação | Use |
|---|---|
| Ideia nova, requisitos vagos | `brainstorming` |
| Planejar trabalho com várias etapas | `writing-plans` |
| Executar um plano | `executing-plans` ou `subagent-driven-development` |
| Implementar com testes | `test-driven-development` |
| Bug difícil, teste falhando, comportamento estranho | `systematic-debugging` |
| Erro de build/compilação | `/build-fix` (agente `build-error-resolver`) |
| Confirmar que terminou | `verification-before-completion` |
| Revisão de código do trabalho atual | `requesting-code-review` |
| Revisão de um PR do GitHub pelo número | `/code-review` |
| Revisão por linguagem | agentes `typescript-reviewer`, `python-reviewer` |
| Segurança (login, dados, pagamentos, APIs) | agente `security-reviewer` + skill `security-review` |
| Receber e aplicar comentários de revisão | `receiving-code-review` |
| Decisão de arquitetura | agente `architect` |
| Visual premium / luxo / futurista | `futuristic-luxury-design` |
| Design de API REST | `api-design` |
| Testes E2E (Playwright) | `e2e-testing` (agente `e2e-runner`) |
| Código morto / limpeza | `/refactor-clean` (agente `refactor-cleaner`) |
| Cobertura de testes | `/test-coverage` |
| Pesquisar se já existe solução pronta | `search-first` |
| Padrões gerais de código | `coding-standards` |
| Várias tarefas independentes em paralelo | `dispatching-parallel-agents` |
| Isolar trabalho em outro diretório | `using-git-worktrees` |
| Fechar o trabalho de um branch | `finishing-a-development-branch` |
| Criar ou editar uma skill | `writing-skills` |
