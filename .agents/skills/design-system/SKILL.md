---
name: design-system
description: Governança de tokens CSS, paleta clean nórdica de café especial, tipografia espresso e ícones vetoriais SVG do Calc Coffee.
---

# Skill: Design System & Tokens Governance (Calc Coffee Clean)

Esta skill define e governa a identidade visual obrigatória do **Calc Coffee**, aprovada para todas as alterações de interface.

## 1. Princípios Visuais
- **Estética Nórdica de Cafeteria Especial:** A interface é clara, arejada, iluminada e acolhedora. Evita-se totalmente estilos escuros/gaming ou fundos pretos pesados.
- **Zero Emojis:** Todos os ícones de métodos, ferramentas, estados sensoriais e navegação devem ser exclusivamente **ícones vetoriais SVG de linha** (stroke: 2px, cantos arredondados).
- **Enquadramento Mobile Estrito:** Componentes devem ser contidos em container de até 500px, sem transbordamento horizontal ou quebra de layout em telas pequenas.

## 2. Tokens de Cor Oficiais (`style.css`)
- **Fundo Global:** `background: linear-gradient(135deg, #f7f3ee 0%, #efe7de 100%)` (creme suave e natural de papel de filtro e leite vaporizado).
- **Superfícies de Cartão:** `background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(247, 243, 239, 0.95))` com borda fina `rgba(229, 231, 235, 0.9)` e sombra suave `0 10px 30px rgba(59, 42, 31, 0.05)`.
- **Tipografia & Títulos:** `--text-heading: #3b2a1f` (marrom torra média-escura / espresso puro).
- **Textos Secundários:** `--text-secondary: #6b7280` e `--text-muted: #9ca3af`.
- **Acentos e Destaques:** `--coffee-terracotta: #c08457` e `--coffee-terracotta-soft: rgba(192, 132, 87, 0.12)`.
- **Estado Ativo de Chips/Botões:**
  - Inativo: fundo branco `#ffffff`, borda `#e5e7eb`, texto `#6b7280`.
  - Ativo: fundo espresso `#3b2a1f`, texto branco `#ffffff`, sombra `0 4px 12px rgba(59, 42, 31, 0.15)`.

## 3. Barra Inferior de Navegação (Bottom Nav)
- Vidro fosco limpo: `rgba(255, 255, 255, 0.94)` com `backdrop-filter: blur(16px)`.
- Respeito obrigatório ao `env(safe-area-inset-bottom)` para não colidir com o gesto de início do iPhone e Android.
