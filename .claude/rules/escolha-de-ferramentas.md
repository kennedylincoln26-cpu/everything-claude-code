# Escolha de ferramentas: Karpathy + Superpowers + ECC + Anthropic

Este projeto junta quatro kits, sem duplicatas:

- **Karpathy** (`karpathy-guidelines.md`): o comportamento base, em toda
  tarefa. Pensar antes de codar, simplicidade, mudanças cirúrgicas e objetivos
  verificáveis.
- **Superpowers**: o *processo* (entender, planejar, executar, depurar,
  verificar).
- **ECC**: as *ferramentas específicas* (linguagem, build, segurança, limpeza,
  testes E2E).
- **Anthropic** (anthropics/skills e plugins oficiais do Claude Code): design de
  interface, servidores MCP, teste de app web, arte e imagem, e comandos de git.

Também valem as ferramentas que já vêm no Claude Code (`/code-review`,
`/security-review`, `/simplify`, `/run`) e na conta do usuário (`skill-creator`,
`docx`, `pdf`, `pptx`, `xlsx`).

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
5. **Ferramenta específica**: use a da tabela abaixo.
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
- **Direção visual**: se o usuário pedir luxo, premium ou futurista,
  `futuristic-luxury-design` define a direção e `frontend-design` só ajuda na
  execução. Nos outros casos, `frontend-design` escolhe a direção.
- **Karpathy x `ponytail`**: o Karpathy é o comportamento base. Use o
  `ponytail` só quando o usuário pedir ("ponytail", "be lazy", `/ponytail`),
  mesmo que a descrição dele diga "qualquer tarefa de código".
- **Pesquisa na internet**: use primeiro a busca e a leitura normais. Use o
  `agent-reach` só quando elas falharem ou o conteúdo exigir a rede social
  (comentários, legendas, posts).
- **Skills da conta com a mesma função** (por exemplo `engineering:code-review`,
  `engineering:debug`, `engineering:architecture`, `engineering:system-design`,
  `engineering:testing-strategy`, `design:design-system`): use a da tabela
  abaixo. As da conta só quando o usuário pedir pelo nome.

## Tabela de decisão

| Situação | Use |
|---|---|
| Ideia nova, requisitos vagos | `brainstorming` |
| Planejar trabalho com várias etapas | `writing-plans` |
| Executar um plano | `executing-plans` ou `subagent-driven-development` |
| Várias tarefas independentes em paralelo | `dispatching-parallel-agents` |
| Implementar com testes | `test-driven-development` |
| Bug difícil, teste falhando, comportamento estranho | `systematic-debugging` |
| Erro de build/compilação | `/build-fix` (agente `build-error-resolver`) |
| Confirmar que terminou | `verification-before-completion` |
| Revisão do trabalho atual, dentro de um plano | `requesting-code-review` |
| Revisar um PR do GitHub ou o diff atual | `/code-review` (do Claude Code) |
| Receber e aplicar comentários de revisão | `receiving-code-review` |
| Revisão por linguagem | agentes `typescript-reviewer`, `python-reviewer` |
| Checar se uma skill ou plugin é seguro antes de instalar | `skill-inspector` |
| Ler Reddit, YouTube, X e outras redes quando a busca normal falha | `agent-reach` |
| Vídeo animado feito em código | `animate` |
| Usuário pede o modo "preguiçoso" / menor solução | `ponytail` (lista de atalhos: `ponytail-debt`) |
| Escrever código sensível (login, dados, pagamentos, APIs) | agente `security-reviewer` + regra `ecc-common/security.md` |
| Revisão de segurança das mudanças do branch | `/security-review` (do Claude Code) |
| Decisão de arquitetura | agente `architect` |
| Simplificar o código que acabou de mudar | `/simplify` (do Claude Code) |
| Remover código morto do projeto | `/refactor-clean` (agente `refactor-cleaner`) |
| Cobertura de testes | `/test-coverage` |
| Pesquisar se já existe solução pronta | `search-first` |
| Padrões gerais de código | `coding-standards` |
| Design de API REST | `api-design` |
| Design de interface (qualquer UI) | `frontend-design` |
| Visual premium / luxo / futurista | `futuristic-luxury-design` |
| Abrir e testar um app web local (clicar, screenshot, logs) | `webapp-testing` (o `/run` do Claude Code usa essa skill) |
| Escrever uma suíte de testes E2E (Playwright) | `e2e-testing` (agente `e2e-runner`) |
| Criar um servidor MCP | `mcp-builder` |
| Arte generativa com código (p5.js) | `algorithmic-art` |
| Pôster, arte ou imagem estática (PNG/PDF) | `canvas-design` |
| GIF animado | `slack-gif-creator` |
| Word, PDF, PowerPoint, Excel | `docx`, `pdf`, `pptx`, `xlsx` (da conta) |
| Criar ou editar uma skill | `skill-creator` (da conta) |
| Commit rápido das mudanças | `/commit` |
| Commit + push + PR em um passo | `/commit-push-pr` (no PC precisa do GitHub CLI `gh`; na nuvem, o PR sai pelas ferramentas do GitHub) |
| Apagar branches locais que já sumiram do GitHub | `/clean_gone` |
| Fechar o trabalho de um branch (merge, PR ou descartar) | `finishing-a-development-branch` |
| Isolar trabalho em outro diretório | `using-git-worktrees` |
