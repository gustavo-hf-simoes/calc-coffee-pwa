# ☕ Resumo de Benchmarking & Pesquisa de Mercado — App de Café Especial

---

## 1. Mapeamento de Concorrentes (O que já existe no mercado)

Ao aprofundar a pesquisa em âmbito global e nas lojas de aplicativos (Google Play Store e Apple App Store), identificamos que o conceito de cronômetro inteligente com controle de etapas de extração é bastante valorizado pela comunidade de cafés especiais, contando com players consolidados:

* **FourSix Coffee Timer (iOS / Android):**
  * Focado especificamente no **método 4:6 de Tetsu Kasuya** (campeão mundial de barista).
  * Divide a água em 40% (para equilibrar acidez vs. doçura) e 60% (para dosar a intensidade/corpo) por meio de múltiplos despejos e tempos calculados.
  * Funcionalidade idêntica à proposta da nossa calculadora de etapas.

* **Timer.Coffee:**
  * Aplicativo gratuito e *open-source* com grande base de usuários.
  * Suporte a dezenas de métodos (Hario V60, AeroPress, Chemex, Prensa Francesa, Kalita Wave, etc.).
  * Calculadora de proporção de água/pó (*ratio*) automática, avisos sonoros e diário de preparo (*Brew Diary*).

* **Brew Timer & Better Coffee:**
  * Focados em guias passo a passo com contagem regressiva, comandos de voz/áudio e biblioteca compartilhada de receitas criadas por baristas renomados e pela comunidade.

* **Beanconqueror:**
  * Plataforma aberta e avançada voltada para o público técnico/entusiasta avançado.
  * Permite registrar granulometria de moedores específicos, curvas de temperatura, perfil de mineralização de água e integração com balanças digitais via Bluetooth.

> **Ponto de Atenção:** Como já existem ferramentas utilitárias gratuitas executando a função básica de calculadora + cronômetro, nosso produto não pode se posicionar apenas como "mais um timer". Precisamos de diferenciais claros que motivem o usuário a adotar e manter a nossa solução instalada.

---

## 2. Ergonomia & Comportamento Real do Usuário (UX de Cozinha)

Analisando a rotina prática de quem prepara café especial em casa diariamente, mapeamos desafios essenciais de usabilidade:

1. **A barreira física durante o preparo:**
   * O usuário está com as mãos ocupadas manuseando a chaleira bico de ganso quente, observando a balança e muitas vezes com as mãos úmidas.
   * *Requisito de produto:* Interface *no-touch* durante o fluxo, tela sempre ativa (*wake lock*) para não apagar no meio do processo e alertas sonoros/voz claros em cada estágio (ex.: *"Primeiro despejo: 60 ml"*).

2. **O risco do hábito automatizado (Churn por memorização):**
   * Nas primeiras semanas, o usuário segue atentamente o passo a passo na tela. Porém, com a repetição, ele memoriza a receita preferida e passa a usar apenas a balança da cozinha, abandonando o app.
   * *Requisito de produto:* Mecanismos que incentivem a recorrência de abertura (descoberta de novas receitas, diário de cafés testados, notas sensoriais e rastreamento de grãos).

---

## 3. Oportunidades de Diferenciação

Para ir além de um cronômetro genérico, há dores latentes pouco exploradas pelos concorrentes estrangeiros:

* **O "Assistente de Ajuste" (Dial-in Coach):**
  * A maior frustração de quem compra um café de pontuação alta (SCA 85–90+) é o resultado na xícara não corresponder à expectativa.
  * *Exemplo prático:* O usuário marca que o café ficou muito amargo ou adstringente; o app analisa e sugere: *"Engrosse a moagem em 2 cliques ou diminua a temperatura da água para 91 °C"*. Isso resolve um problema real de perda financeira do grão.

* **Foco no Mercado e Torrefações Brasileiras:**
  * A maioria dos concorrentes é em inglês ou traz traduções automáticas impessoais.
  * Oportunidade de criar uma experiência conectada à cultura de cafés especiais do Brasil, com vocabulário acessível e receitas alinhadas aos cafés e variedades locais (Bourbon Amarelo, Catuaí, Arara, etc.).

* **Diário Simplificado de Lotes:**
  * Registro rápido de quais grãos foram comprados, torrefação de origem, pontuação e qual moagem/temperatura funcionou melhor para cada pacote.

---

## 4. Viabilidade e Modelos de Receita

* **Cobrança por Assinatura (SaaS utilitário):**
  * Baixa aderência para uma ferramenta restrita a timer e proporções, dado o volume de alternativas gratuitas.
* **Caminhos com Maior Potencial de Retorno:**
  1. **Afiliação e Parcerias Comerciais:**
     * Recomendação de grãos de microtorrefações parceiras e links de comissão para equipamentos (moedores manuais, filtros específicos, chaleiras e balanças).
  2. **Modelo Freemium com Compra Única:**
     * Funcionalidades essenciais (métodos e timer base) gratuitas para tração de usuários.
     * Recursos avançados (diagnóstico de sabor, diário ilimitado e perfis customizados) liberados via taxa única (*lifetime*) acessível.

---

## 5. Próximos Passos Sugeridos

1. **Disponibilizar o protótipo web como MVP inicial:**
   * Colocar a versão atual em HTML/JavaScript no ar (web/PWA) para que possa ser acessada diretamente pelo celular, sem necessidade de publicação nas lojas neste primeiro momento.
2. **Teste de validação com baristas e entusiastas:**
   * Compartilhar o link com o círculo próximo de contatos para uso prático ao longo de 5 a 7 dias.
3. **Perguntas-chave para coleta de feedback:**
   * *Sentiu necessidade de acompanhar o celular durante a extração?*
   * *O ritmo e a divisão das etapas ajudaram ou atrapalharam o fluxo na bancada?*
   * *Qual recurso faria você continuar abrindo este aplicativo toda semana?*
