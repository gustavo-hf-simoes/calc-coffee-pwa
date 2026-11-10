# Lições Aprendidas & Registro de Qualidade — CoffeeApp (Calc Coffee)

Registro contínuo de aprendizados técnicos, autocorreções do QA e guardrails operacionais aprendidos.

## 🛡️ Guardrails Globais da SDD Factory
1. **Fonte Única da Verdade em Edições Manuais**: Edições diretas do usuário em arquivos físicos dentro de `.sdd/` (como `PRD.md` ou `SPEC.md`) têm precedência absoluta sobre conversas anteriores.
2. **UI sem Prompts Bloqueantes**: Interfaces web interativas e sidecars não devem usar `window.prompt()` ou modais bloqueantes para inputs complexos.
3. **Cobertura dos 4 Estados Visuais**: Toda tela ou componente de interface deve tratar explicitamente os 4 estados visuais: Loading, Sucesso, Empty e Erro.
4. **Anti-Travamento de Watchers**: Watchers de sistema de arquivos (`fs.watch`) e streams SSE devem usar debounce >= 350ms e excluir pastas densas (`node_modules`, `.git`, links junction e OneDrive), vigiando recursivamente apenas a pasta `.sdd/`.
