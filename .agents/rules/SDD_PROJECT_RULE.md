# Regra Local de Governança SDD — CoffeeApp (Calc Coffee)

Este repositório é governado pela esteira **Spec-Driven Development AI-First**.

1. **Consulta Prévia Sob Demanda (Progressive Disclosure)**:
   - Leia `.sdd/state.json` para checar o estágio atual antes de alterar código.
   - Consulte `.sdd/memory/project_memory.md` (regras de negócio do domínio) e `.sdd/memory/lessons_learned.md` (erros passados que não devem se repetir).
2. **Fonte Única da Verdade & Fidelidade à SPEC**:
   - O arquivo físico em `.sdd/` (incluindo edições manuais do usuário em `PRD.md` ou `SPEC.md`) tem precedência absoluta.
   - Todo código deve seguir estritamente `.sdd/02_architecture/SPEC.md` e `.sdd/02_architecture/DB_SCHEMA.md`. Mudanças arquiteturais exigem registro em `.sdd/memory/ADR.md`.
3. **Auditoria Contínua & Retroalimentação**:
   - Todo desenvolvimento deve ser validado contra a SPEC (`sdd-qa-auditor`).
   - Sempre que o usuário corrigir uma implementação ou requisito, grave o aprendizado em `.sdd/memory/lessons_learned.md`.
