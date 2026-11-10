---
name: sdd-mobile-engineering
description: >-
  Playbook de Engenharia Mobile, Empacotamento Nativo (Capacitor/TWA), Geração de APK/AAB e Publicação na Google Play Store
  e App Store na esteira SDD. Use esta skill para transformar PWAs/Webapps em aplicativos nativos instaláveis, gerar APKs de
  distribuição direta (WhatsApp/staging) e automatizar builds via GitHub Actions.
---

# Skill: SDD Mobile Engineering & Store Delivery

Esta skill governa a transição de aplicações web/PWA para ecossistemas mobile nativos (Android e iOS) na **Fábrica SDD**, cobrindo empacotamento, compilação de APKs, adaptação ergonômica de tela e submissão nas lojas de aplicativos.

---

## 1. Princípios de Arquitetura Mobile na Esteira SDD

1. **Estratégia Web-to-Native (Capacitor Native Bridge)**:
   - Preserva 100% da base modular limpa (HTML5, CSS3, Vanilla JS ou framework).
   - O Capacitor empacota a aplicação em uma WebView de alta performance (Chrome Chromium moderna no Android, WKWebView no iOS), garantindo que atualizações de lógica de negócio e estilo reflitam sem reescrita.
2. **Build Hands-Free na Nuvem (Zero Dependência Local de SDK)**:
   - Em vez de obrigar a instalação de 15 GB de Android Studio, NDK e SDK localmente na máquina do desenvolvedor, todo build de APK e AAB deve ser automatizado via **GitHub Actions** em runners Ubuntu oficiais (`actions/setup-java`).
   - **Nota sobre Gradle vs. Maven no Android**: Enquanto o **Maven** é o padrão consagrado em backends corporativos Java, o ecossistema Android foi padronizado pelo Google exclusivamente em torno do **Android Gradle Plugin (AGP)** para compilação de binários nativos (APKs/AABs). O Gradle busca as dependências nos repositórios oficiais **Maven Central** e **Google Maven**, mas atua de forma transparente via `gradlew` dentro do runner do GitHub Actions, dispensando qualquer instalação ou intervenção manual do desenvolvedor.
   - O APK gerado fica disponível na aba **Releases** ou **Actions Artifacts** do GitHub para download imediato via celular.
3. **Ergonomia de Dispositivo & Modos de Uso**:
   - **Modo Celular (Retrato)**: Interface com botões grandes, controles táteis na zona inferior e leitura legível a 50 cm de distância.
   - **Modo Tablet / Bancada**: Layout dividido em 2 colunas com tipografia aumentada, dispensando toques contínuos durante operações com mãos ocupadas/molhadas.
   - **Modo Display / TV**: Visualização em tela cheia de alto contraste para visibilidade a 2-3 metros de distância.
4. **Resiliência Offline & Hardware APIs**:
   - **Wake Lock API**: Impede o apagamento automático da tela durante tarefas operacionais (ex: extração de café, cronômetros, instruções de receitas).
   - **Local Storage / IndexedDB**: Armazenamento 100% local sem dependência de internet para tarefas operacionais críticas.
   - **Áudio Nativo / Web Audio**: Uso de arquivos locais empacotados no bundle para eliminar latência de rede.

---

## 2. Roteiro Prático de Empacotamento (Capacitor)

### 2.1 Configuração Básica (`capacitor.config.json`)
```json
{
  "appId": "com.calccoffee.app",
  "appName": "Calc Coffee",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

### 2.2 Workflow de Compilação de APK no GitHub Actions (`.github/workflows/build-apk.yml`)
```yaml
name: Build Android APK
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'
      - name: Install Dependencies
        run: npm ci || npm install
      - name: Build Web Assets & Sync Capacitor
        run: |
          npx cap add android || true
          npx cap sync android
      - name: Build Debug APK
        run: |
          cd android && ./gradlew assembleDebug --no-daemon
      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: calc-coffee-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Roteiro de Publicação: Da Distribuição Direta à Play Store

| Fase | Formato | Como Entregar ao Usuário | Requisitos |
| :--- | :--- | :--- | :--- |
| **Fase 1: Staging / Amigos** | `app-debug.apk` | Envio direto do arquivo APK pelo WhatsApp ou link de download do GitHub Actions. | Nenhuma conta de desenvolvedor necessária. O usuário habilita "Instalar de fontes desconhecidas". |
| **Fase 2: Beta Fechado** | `app-release.aab` | Google Play Console (Trilha de Teste Interno / Fechado com 14 a 20 testadores). | Conta Google Play Console (\$25 taxa única), Keystore de assinatura gerada via `keytool`. |
| **Fase 3: Produção Pública** | `app-release.aab` | Google Play Store pública para busca e download oficial. | Ícone 512x512, Feature Graphic 1024x500, Prints de tela mobile (ao menos 2) e Política de Privacidade. |

---

## 4. Checklist de Validação Mobile

1. O app abre instantaneamente em tela cheia sem barra de endereço do navegador.
2. O botão de voltar do Android (`Back button`) é tratado corretamente sem fechar o app inesperadamente.
3. A tela permanece ligada durante a extração via Wake Lock.
4. O APK compila com sucesso via CI/CD e é instalável em Android 9+.
5. Não há dependências de servidores externos para a execução da regra de negócio básica.
