# Architectural Decision Records (ADR) — CoffeeApp (Calc Coffee)

## ADR-001: Adoção Brownfield na SDD Factory
- **Data**: 2026-11-07T05:43:53.358Z
- **Status**: Aceito
- **Contexto**: O projeto existente possuía código em produção e regras dispersas. Para acelerar entregas com zero alucinação e controle rigoroso de tokens, o repositório foi migrado para a esteira SDD.
- **Decisão**: Adoção do padrão .sdd/ sem apagar código existente, higienização de pastas legadas infladas e criação da memória contínua.
- **Consequências**: Todas as novas funcionalidades deverão seguir a esteira SDD (PRD -> Checkpoint 1 -> SPEC -> Checkpoint 2 -> Dev -> QA).
