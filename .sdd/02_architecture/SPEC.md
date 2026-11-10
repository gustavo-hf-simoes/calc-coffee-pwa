# Technical Specification (SPEC) — CoffeeApp (Calc Coffee)

## 1. Arquitetura PWA Vanilla JS
O CoffeeApp adota uma arquitetura ultra leve sem dependências pesadas de frameworks:
- **Core HTML**: `index.html` contendo o shell da SPA mobile e as 4 vistas isoladas.
- **Service Worker**: `sw.js` com estratégia Cache-First para assets estáticos e Offline Fallback.
- **Módulos JS (`js/`)**:
  - `engine.js`: Motor matemático puro de física de extração, ratios e presets de métodos.
  - `timer.js`: Cronômetro de alta precisão com `requestAnimationFrame`, `navigator.wakeLock`, Web Audio API e Web Speech API.
  - `dialin-coach.js`: Lógica diagnóstica sensorial baseada na roda de sabores da SCA e equações de EY.
  - `store.js`: Catálogo de produtos curados e links de afiliados.
  - `analytics.js`: Telemetria anônima respeitando privacidade.
  - `app.js`: Orquestrador de estado e transição entre vistas.

## 2. Contratos de Dados do Motor Matemático (`engine.js`)
- `calculateRecipe(methodId: string, doseGrams: number, ratio: number) -> RecipePlan`:
  - Retorna estágios de despejo (`blooming`, `first_pour`, `second_pour`, `drain`), volumes parciais em gramas e timestamps recomendados.
