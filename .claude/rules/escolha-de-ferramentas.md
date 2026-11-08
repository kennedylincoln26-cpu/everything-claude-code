# Escolha de ferramentas: Superpowers + ECC + Karpathy

Este projeto junta três kits, sem duplicatas:

- **Karpathy** (`karpathy-guidelines.md`): o comportamento base, em toda
  tarefa. Pensar antes de codar, simplicidade, mudanças cirúrgicas e objetivos
  verificáveis.
- **Superpowers**: o *processo* (entender, planejar, executar, depurar,
  verificar).
- **ECC**: as *ferramentas específicas* (linguagem, build, segurança, design).

Escolha pela tarefa, sem cerimônia desnecessária.

## Regra geral

1. **Tarefa trivial** (trocar um texto, renomear algo, ajuste de uma linha):
   faça direto. Não abra brainstorming nem plano.
2. **Tarefa média** (poucos passos, pedido claro): plano curto no próprio chat,
   no formato `passo → verificar` (princípio 4 do Karpathy). Sem `writing-plans`.
3. **Ideia nova ou vaga**: comece por `brainstorming`.
4. **Trabalho grande, com várias etapas**: `writing-plans`, depois
   `executing-plans` (sessão única) ou `subagent-driven-development` (tarefas
   independentes).
5. **Ferramenta específica** (revisor da linguagem, build, segurança, design):
   use a do ECC.
6. Se o usuário chamar um comando ou skill pelo nome, use o que ele pediu.

## Quando as regras se chocam

- **Estilo ao editar código existente**: siga o estilo do arquivo e mexa só no
  que foi pedido (Karpathy), mesmo que `ecc-common/coding-style.md` prefira
  outro jeito. As regras de estilo do ECC valem para código novo.
- **Código morto que já existia**: avise, não apague. Apague só quando o
  usuário pedir, por exemplo com `/refactor-clean`.
- **Tratamento de erros**: trate os erros que podem acontecer de verdade (ECC),
  mas não crie tratamento para cenários impossíveis (Karpathy).
- **Projetos-esqueleto** (`ecc-common/patterns.md`): só ao começar um projeto do
  zero, nunca para uma mudança pequena em projeto existente.

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
