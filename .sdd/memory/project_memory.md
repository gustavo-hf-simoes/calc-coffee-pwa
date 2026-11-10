# Memória Contínua do Projeto — CoffeeApp (Calc Coffee)

Este documento consolida a visão estratégica, regras de domínio e histórico técnico do projeto **CoffeeApp (Calc Coffee)**, migrado para governança pela **SDD Factory (Spec-Driven Development)**.

- **Data de Adoção SDD**: 2026-11-07T05:43:53.358Z
- **Stack Identificada**: Python, Vanilla Web PWA
- **Skills Locais Preservadas**: `ai-agent-ux`, `analytics-tracking`, `design-system`, `full-stack-builder`, `full-stack-builder-model`, `mobile-testing`, `pwa-offline-first`

## 📌 Propósito Essencial
Copiloto do Barista, Calculadora de Extração Sensorial e Cronômetro de Bancada PWA Offline-First (Vanilla JS, Service Workers, Design Scandinavian Specialty Coffee, regras SCA/BSCA e curadoria de cafés especiais).

## 🏛️ Diretrizes Globais do Projeto
- **Modelo de Governança**: Spec-Driven Development AI-First (.sdd)
- **Checkpoints Human-in-the-Loop**:
  - Checkpoint 1: Aprovação de Requisitos (PRD) antes de modelar arquitetura.
  - Checkpoint 2: Aprovação de Stack e Banco antes de gerar código.
- **Contratos API**: Invioláveis e documentados em `.sdd/02_architecture/SPEC.md`.
- **UI/UX**: Sempre cobrir os 4 estados visuais (Loading, Sucesso, Empty, Erro).


## 📜 Legado Migrado de gemini.md:
# ☕ Calc Coffee — Guia de Arquitetura Agêntica & Sistema de Instruções (gemini.md)

Este documento estabelece as diretrizes de desenvolvimento, arquitetura técnica, padrões de código e catálogo de habilidades agênticas para o projeto **Calc Coffee**, orquestrado pelo **Google Antigravity**.

---

## 1. Visão Geral & Papéis

* **Produto:** *Calc Coffee* — Copiloto do Barista, Calculadora de Extração Sensorial e Cronômetro de Bancada com Comércio Contextual de Grãos Especiais e Equipamentos.
* **Modelo Societário & Liderança:**
  * **Gustavo (Bene):** Arquiteto Agêntico e Líder Técnico. Responsável pela governança do software, orquestração de agentes de IA, usabilidade (UX), conformidade de dados e infraestrutura de produto.
  * **Eduardo:** Líder de Infraestrutura & Domínio de Negócio. Especialista prático em métodos de barismo, calibração de regras de extração e responsável pelo canal de distribuição inicial (comunidade *Coffee Lovers*).

---

## 2. Regras Obrigatórias para os Agentes de Desenvolvimento

Ao modificar ou estender o código, o agente de IA **deve seguir obrigatoriamente sem exceções**:

1. **Uso Obrigatório da Skill `full-stack-builder` (`skills.sh`):**
   * Sempre que for realizar qualquer alteração no código do projeto (frontend, backend, lógica de negócio ou testes), o agente **deve obrigatoriamente carregar e utilizar a skill `full-stack-builder`** instalada em `.agents/skills/full-stack-builder/`.
   * Essa skill orienta a visão holística de ponta a ponta (requisito -> arquitetura limpa -> código sem quebras -> validação de testes -> entrega funcional).
2. **Pesquisa Prévia Obrigatória & Contextos Reais (Anti-Alucinação):**
   * **É terminantemente proibido inventar parâmetros genéricos ou usar arquivos fictícios.**
   * O agente deve **sempre efetuar uma busca na web (`search_web`)** sobre o método, regra de barismo, variedades de café ou referência técnica antes de implementar alterações.
   * As regras devem ser embasadas em padrões reais da **SCA (Specialty Coffee Association)**, **BSCA (Associação Brasileira de Cafés Especiais)**, manuais de fabricantes oficiais (Hario, Koar, Chemex) e receitas públicas auditadas de campeões mundiais.
3. **Padrão Visual Inegociável (Clean Scandinavian Specialty Coffee):**
   * Proibido usar estilo dark gaming ou emojis genéricos na interface.
   * O design deve seguir estritamente o padrão aprovado documentado em `.agents/skills/design-system/`: fundo creme suave (`#f7f3ee` a `#efe7de`), cartões em branco puro acetinado, tipografia em marrom espresso profundo (`#3b2a1f`), detalhes terracota (`#c08457`) e **ícones vetoriais SVG de linha**.
4. **Validação Contínua com Sintaxe e Testes Unitários:**
   * Nunca finalizar uma alteração sem antes rodar:
     * `node --check <arquivo.js>` para garantir zero erros de sintaxe;
     * `node tests/test-suite.js` para garantir 100% de aprovação na suíte de testes.

---

## 3. Pilares de Arquitetura (PWA Mobile-First)

1. **SPA sem Auto-Scroll (Zero-Scroll Pattern):**
   * A interface nunca deve rolar páginas longas para baixo durante ações do usuário.
   * Navegação em 4 vistas isoladas controladas pela barra inferior (`Preparo`, `Bancada`, `Copiloto IA`, `Curadoria`).
2. **Ergonomia de Bancada (Hands-Free):**
   * **Wake Lock API:** A tela do dispositivo não pode apagar enquanto a extração estiver em andamento.
   * **Áudio & Voz:** Bipes acústicos via Web Audio API e síntese de voz (Web Speech API) orientando o usuário em português sem que ele precise encostar no aparelho com as mãos molhadas.
3. **Presets Dinâmicos por Método:**
   * Clicar em um método (V60, Koar, Melitta, Kalita, Chemex, AeroPress, Prensa) deve atualizar automaticamente os valores de volume, proporção, moagem recomendada e o banner explicativo de física de extração.
4. **Offline-First & Privacidade por Design (LGPD):**
   * Persistência de dados das receitas e histórico em `LocalStorage` / `IndexedDB` no dispositivo do usuário.
   * Não exigir cadastro ou login no MVP, eliminando fricção de onboarding e riscos de vazamento de dados sensíveis.

---

## 4. Catálogo de Skills Instaladas (`.agents/skills/`)

| Categoria | Skill | Finalidade no Calc Coffee |
| :--- | :--- | :--- |
| **Arquitetura Geral** | `full-stack-builder` | Execução ponta a ponta com visão sistêmica e artesanato de software. |
| **Design System** | `design-system` | Governança da paleta clean, tipografia espresso e ícones SVG. |
| **PWA & Offline** | `pwa-offline-first` | Otimização de Service Workers, ciclo de vida de cache e manifest offline. |
| **Testes Mobile** | `mobile-testing` | Validação de touch targets (mín 48px), ergonomia de bancada e compatibilidade mobile. |
| **Copiloto UX** | `ai-agent-ux` | Padrões de resposta do motor de inferência sensorial e tom de voz de barismo. |
| **Telemetria** | `analytics-tracking` | Mapeamento de eventos anônimos (`brew_started`, `sensory_feedback`, `affiliate_clicked`). |

---

## 5. Estrutura Modular de Arquivos

```text
coffe-app/
├── index.html              # Shell da SPA mobile e definição das 4 views clean
├── manifest.json           # Manifesto PWA (nome, ícones, tema e modo standalone)
├── sw.js                   # Service Worker para cache e uso 100% offline
├── serve.js                # Servidor local de desenvolvimento zero-dependency
├── cloudflared.exe         # Binário de túnel público para testes mobile
├── gemini.md               # Este arquivo de governança agêntica
├── css/
│   └── style.css           # Design system clean com paleta nórdica e cards brancos
├── js/
│   ├── engine.js           # Motor matemático puro de extração e presets dos métodos
│   ├── timer.js            # Cronômetro de bancada, Web Audio, Speech e WakeLock
│   ├── dialin-coach.js     # Copiloto sensorial IA com cálculo de EY e diagnósticos dinâmicos
│   ├── store.js            # Catálogo de curadoria, afiliação e cupons de desconto
│   ├── analytics.js        # Módulo de telemetria anônima
│   └── app.js              # Controlador principal e orquestrador de estado
└── tests/
    └── test-suite.js       # Suíte automatizada de testes unitários em Node.js
```

