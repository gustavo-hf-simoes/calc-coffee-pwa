# ☕ Calc Coffee — Copiloto do Barista & Calculadora Sensorial

Aplicativo PWA mobile-first desenvolvido para baristas e entusiastas de cafés especiais. Combina calculadora de proporção áurea, física de extração dinâmica, cronômetro de bancada com áudio neural humanizado e copiloto de diagnóstico sensorial (Dial-in Coach) com recomendações de calibração de moagem.

---

## 🚀 Principais Funcionalidades

1. **Calculadora & Física de Métodos:**
   * Suporte aos métodos fundamentais: **Hario V60**, **Koar**, **Melitta**, **Kalita Wave**, **Chemex**, **AeroPress** e **Prensa Francesa**.
   * Presets dinâmicos de proporção (1:12 a 1:18), granulometria recomendada e cálculo conservativo de massa (bloom + despejos).
   * Modo **Receitas dos Campeões**: Receita 4:6 (Tetsu Kasuya 2016), Boram Um (2023) e Léo Moço.

2. **Cronômetro de Bancada (Hands-Free):**
   * **Wake Lock API:** Mantém a tela ligada sem apagar durante todo o preparo.
   * **Sino Acústico Harmônico (Tibetan Bowl / Brass Chime):** Dois parciais em Dó (523.25 Hz) e sobretom harmônico (1046.5 Hz) com decaimento exponencial orgânico via Web Audio API.
   * **Voz Neural de Barista (Microsoft Azure Neural):** Áudios pré-renderizados em MP3 (`audio/*.mp3`) com tom acolhedor, calmo e técnico, garantindo experiência de cafeteria sem voz robótica.
   * **Seletor de Modo de Áudio:** Alternância entre *Voz & Sino*, *Modo Zen (Apenas Sino)* e *Silencioso*.

3. **Copiloto IA Sensorial (Dial-in Coach):**
   * Diagnóstico físico-químico dinâmico baseado no feedback da xícara (*Muito Amargo / Seco*, *Muito Ácido / Azedo*, *Muito Fraco / Aguado*, *Muito Forte / Pesado*, *Xícara de Ouro*).
   * Estimativa de *Extraction Yield* (EY %) e desvio de tempo de fluxo.
   * Recomendações práticas em 3 passos (ajuste de cliques do moedor, temperatura da água e vazão).
   * Diário de extrações salvo localmente via `LocalStorage`.

4. **Curadoria & Comércio Contextual:**
   * Feed de cafés especiais 85+ SCA e equipamentos de barismo com cupons de desconto parceiros (`CALCCOFFEE10`).
   * Telemetria anônima respeitando integralmente a LGPD.

5. **PWA Offline-First:**
   * Service Worker com estratégia *Network-First* para atualizações imediatas de código e cache local completo de áudios para funcionamento sem internet.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** Vanilla JavaScript (ES6+ modular), HTML5 Semântico, CSS3 Moderno (Clean Scandinavian Design System, paleta creme e marrom espresso, ícones SVG lineares).
* **Áudio:** Web Audio API (síntese harmônica senoidal) + HTML5 Audio (Azure Neural TTS).
* **PWA:** Service Worker v2.1.0, Web App Manifest, Cache API, Screen Wake Lock API.
* **Testes:** Suíte de testes unitários automatizados em Node.js (`tests/test-suite.js`).

---

## 📦 Como Executar Localmente

### Pré-requisitos
* Node.js v18+

### Execução
```bash
# Iniciar o servidor local zero-dependency
node serve.js
```
Abra o navegador em `http://localhost:3000` ou no endereço da rede local exibido no terminal.

### Executar os Testes Unitários
```bash
node tests/test-suite.js
```

---

## 👥 Liderança do Projeto
* **Gustavo (Bene):** Arquiteto Agêntico e Líder Técnico.
* **Eduardo:** Líder de Infraestrutura & Domínio de Negócio (Comunidade *Coffee Lovers*).
