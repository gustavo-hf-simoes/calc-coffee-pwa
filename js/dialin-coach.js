/**
 * Calc Coffee - Copiloto de IA & Motor de Diagnóstico Sensorial (Dial-in Coach)
 * Análise físico-química dinâmica de extração, estimativa de EY (Extraction Yield) e calibração precisa
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.DialInCoach = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  const STORAGE_KEY = "calc_coffee_history_v1";

  /**
   * Converte segundos em formato mm:ss
   */
  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, "0")}`;
  }

  /**
   * Estima o rendimento de extração (Extraction Yield - EY %)
   * baseado na proporção, granulometria, tempo real e temperatura.
   */
  function estimateExtractionYield(recipe, actualTime) {
    const targetTime = recipe.totalTime || 180;
    const timeRatio = actualTime > 0 ? (actualTime / targetTime) : 1.0;

    // Fator base por proporção (Ratios mais curtos extraem porcentagem ligeiramente menor por saturação)
    const ratioVal = (recipe.water / recipe.coffee) || 15;
    let baseEY = 19.5; // Alvo central da SCA (18% - 22%)

    // Impacto do desvio de tempo
    if (timeRatio > 1.15) {
      baseEY += (timeRatio - 1.0) * 3.5; // Aumento de extração por tempo excessivo
    } else if (timeRatio < 0.85) {
      baseEY -= (1.0 - timeRatio) * 4.0; // Queda drástica por fluxo rápido
    }

    // Impacto da moagem
    const grindOffsets = {
      fine: +1.8,
      "medium-fine": +0.8,
      medium: 0.0,
      "medium-coarse": -1.0,
      coarse: -2.2
    };
    baseEY += (grindOffsets[recipe.grind] || 0);

    // Impacto da temperatura
    if (recipe.temperature >= 95) baseEY += 0.8;
    if (recipe.temperature <= 90) baseEY -= 0.8;

    return Math.min(26.0, Math.max(13.0, Number(baseEY.toFixed(1))));
  }

  /**
   * Diagnóstico Dinâmico de Barismo
   * Sintetiza variáveis reais do preparo e gera um parecer técnico contextualizado
   */
  function diagnose(feedbackKey, recipe, sessionMeta = {}) {
    const actualTime = sessionMeta.actualTime || recipe.totalTime;
    const targetTime = recipe.totalTime;
    const timeDelta = Math.round(actualTime - targetTime);

    const timeDeltaFormatted = timeDelta > 0 
      ? `+${timeDelta}s acima da meta` 
      : (timeDelta < 0 ? `${Math.abs(timeDelta)}s mais rápido que o previsto` : "no tempo exato previsto");

    const eyEstimated = estimateExtractionYield(recipe, actualTime);
    const method = recipe.methodName || "Hario V60";
    const water = recipe.water || 300;
    const coffee = recipe.coffee || 20.0;
    const ratio = recipe.ratio || "1:15";
    const temp = recipe.temperature || 93;
    const grind = recipe.grindLabel || "Média";
    const roast = recipe.roastLabel || "Média";

    let title = "";
    let badge = "";
    let statusTone = "warning"; // warning, error, success
    let diagnosisNarrative = "";
    let chemicalExplanation = "";
    let adjustments = [];
    let recommendedGear = null;

    // 1. Caso: AMARGO / SECO (Sobre-extração)
    if (feedbackKey === "bitter") {
      title = `Sobre-extração Detectada (${eyEstimated}% EY estimado)`;
      badge = "Sobre-extração";
      statusTone = "error";

      diagnosisNarrative = `No seu preparo com **${method}** (${water} ml de água para ${coffee} g de pó, proporção ${ratio}), a extração durou **${formatTime(actualTime)}** (${timeDeltaFormatted}). O pó com moagem **${grind}** associado à água a **${temp}°C** provocou dissolução excessiva de compostos pesados.`;

      chemicalExplanation = `Na curva de solubilidade, os ácidos clorogênicos e compostos fenólicos de alto peso molecular são os últimos a serem dissolvidos. Quando o fluxo desacelera ou a temperatura agride o leito, ocorre a extração de fenilindanos e taninos, responsáveis pela adstringência e amargor residual que resseca o fundo da língua.`;

      let grindRecommendation = "Abra a moagem em 2 a 3 cliques mais grossa no seu moedor manual";
      if (recipe.grind === "fine") grindRecommendation = "Mude a moagem de Fina para Média ou Média-Grossa";

      let tempRecommendation = `Diminua a temperatura da água de ${temp}°C para ${Math.max(88, temp - 3)}°C`;
      if (recipe.roast === "dark") {
        tempRecommendation = `Como a torra é escura, a quebra celular já é alta: baixe a água para 88°C~89°C para não queimar os açúcares restantes.`;
      }

      adjustments = [
        {
          param: "Granulometria da Moagem",
          action: grindRecommendation,
          technicalReason: "Partículas maiores reduzem a área de contato total e aceleram o escoamento, interrompendo a extração antes da quebra dos taninos."
        },
        {
          param: "Temperatura da Água",
          action: tempRecommendation,
          technicalReason: "A água com menor energia cinética desacelera a taxa de difusão osmótica dos compostos amargos mais lentos."
        },
        {
          param: "Técnica de Despejo no " + method,
          action: "Abaixe a ponta da chaleira e mantenha despejos concêntricos suaves, evitando turbulência que desloque os finos para o fundo.",
          technicalReason: "Reduz a migração de micropartículas (fines) que entopem os microporos do filtro e represam a água."
        }
      ];

      recommendedGear = {
        name: "Moedor Manual com Mós Cônicas de Inox (Timemore C3 / Kingrinder)",
        category: "gear",
        desc: "Moedores comuns de hélice giratória fragmentam os grãos de forma caótica, gerando muita poeira fina que causa sobre-extração mesmo em moagens grossas. Mós cônicas de aço garantem grânulos perfeitamente uniformes.",
        actionLabel: "Conhecer Moedores de Precisão"
      };
    }

    // 2. Caso: ÁCIDO / AZEDO / CHÁ RALO (Sub-extração)
    else if (feedbackKey === "sour") {
      title = `Sub-extração Acentuada (${eyEstimated}% EY estimado)`;
      badge = "Sub-extração";
      statusTone = "warning";

      diagnosisNarrative = `No seu preparo com **${method}** (${water} ml com ${coffee} g de pó, proporção ${ratio}), o fluxo finalizou em **${formatTime(actualTime)}** (${timeDeltaFormatted}). A água escoou rápido demais através da granulometria **${grind}**, sem tempo de contato hábil para dissolver os açúcares.`;

      chemicalExplanation = `Os ácidos cítrico, málico e acético são os primeiros componentes solúveis a entrar na xícara nos primeiros 30 segundos. Os carboidratos complexos, lípidos e açúcares caramelizados que conferem doçura e corpo precisam de mais tempo e energia para dissolver. Sem eles, a acidez se apresenta crua, pontiaguda e desequilibrada (sensação de vinagre ou limão sem açúcar).`;

      adjustments = [
        {
          param: "Granulometria da Moagem",
          action: "Feche a moagem em 2 a 3 cliques mais fina",
          technicalReason: "Aumenta a área superficial de contato e gera resistência hidráulica, prolongando o tempo de infusão natural."
        },
        {
          param: "Temperatura da Água",
          action: `Eleve a temperatura da água para ${Math.min(96, temp + 2)}°C`,
          technicalReason: "Água mais quente possui maior solvência térmica para dissolver açúcares complexos que equilibram os ácidos."
        },
        {
          param: "Pré-infusão (Bloom)",
          action: `Aumente a pré-infusão em +10s (de ${recipe.bloom.time}s para ${recipe.bloom.time + 10}s) com leve rotação da jarra`,
          technicalReason: "Garante desgasificação total do CO₂ antes do fluxo principal, permitindo que a água penetre no núcleo de cada grânulo."
        }
      ];

      recommendedGear = {
        name: "Chaleira Bico de Ganso (Gooseneck com Termômetro)",
        category: "gear",
        desc: "O bico fino pescoço de ganso permite um fluxo lento em fio contínuo de 4 a 6 ml/s sem afundar a cama de pó, garantindo o tempo de contato ideal para extração completa da doçura.",
        actionLabel: "Ver Chaleiras Gooseneck"
      };
    }

    // 3. Caso: DESEQUILIBRADO / PONTADAS AMARGAS E AZEDAS (Canalização)
    else if (feedbackKey === "channeling") {
      title = `Canalização Hidráulica (Channeling)`;
      badge = "Canalização";
      statusTone = "error";

      diagnosisNarrative = `A xícara apresentou notas confusas: sensação rala com pontadas amargas e azedas simultâneas. No **${method}**, isso ocorre quando a água cria 'canais preferenciais' de baixa resistência no leito de pó, super-extraindo esse túnel e deixando o restante do pó quase intacto.`;

      chemicalExplanation = `A resistência hidráulica não foi homogênea. A porção de pó por onde o canal passou sofreu sobre-extração severa (extraindo taninos adstringentes), enquanto o pó adjacente sofreu sub-extração (entregando apenas ácidos azedos). O resultado é uma xícara dissonante.`;

      adjustments = [
        {
          param: "Nivelamento do Leito de Pó",
          action: "Dê duas batidinhas laterais suaves no suporte antes de despejar a água para nivelar o pó perfeitamente horizontal",
          technicalReason: "Um leito inclinado ou com bolsões de ar força a água a correr pelo caminho mais raso."
        },
        {
          param: "Padrão de Vertimento",
          action: "Despeje a água em círculos lentos do centro para fora, nunca jogando o jato diretamente nas paredes do filtro",
          technicalReason: "Água na parede do filtro escorre sem passar pelo café (bypass descontrolado), canalizando as bordas."
        },
        {
          param: "Saturação do Bloom",
          action: `Certifique-se de que todos os ${recipe.bloom.water} ml de bloom molhem 100% do pó em até 10 segundos`,
          technicalReason: "Se parte do pó continuar seca na pré-infusão, ela repelirá a água hidrofobicamente nos despejos seguintes."
        }
      ];

      recommendedGear = {
        name: "Balança Digital de Precisão (0.1g) com Cronômetro Integrado",
        category: "gear",
        desc: "Acompanhar a velocidade de despejo grama a grama é a única forma de manter taxa de fluxo constante e evitar o impacto mecânico violento que abre fissuras no leito de café.",
        actionLabel: "Ver Balanças de Precisão"
      };
    }

    // 4. Caso: FRACO / CHOCADO / SEM CORPO (Sub-dosagem ou Ratio Excessivo)
    else if (feedbackKey === "weak") {
      title = `Baixo TDS / Sub-dosagem (${eyEstimated}% EY estimado)`;
      badge = "Sub-dosagem";
      statusTone = "warning";

      diagnosisNarrative = `A extração não apresentou defeitos amargos ou azedos grosseiros, mas a concentração de sólidos totais dissolvidos (TDS) ficou abaixo de 1.15%. A bebida ficou aguada e perdeu a textura encorpada esperada para o método **${method}**.`;

      chemicalExplanation = `A relação de diluição (${ratio}) foi muito longa para a densidade desse café ou a quantidade de despejos não gerou gradiente osmótico suficiente para carrear os óleos emulsionados para a xícara final.`;

      adjustments = [
        {
          param: "Proporção Café : Água (Ratio)",
          action: `Aperte a proporção: use 1:13 ou 1:14 (ex: aumente o pó de ${coffee}g para ${(water / 14).toFixed(1)}g para os mesmos ${water}ml de água)`,
          technicalReason: "Reduz a água livre na xícara e eleva o TDS para a faixa de ouro de 1.25% a 1.45%."
        },
        {
          param: "Número de Despejos",
          action: "Fracione a água em mais 1 despejo (ex: passe de 3 para 4 despejos)",
          technicalReason: "Pulsos fracionados renovam a água pura no topo do leito, aumentando a pressão osmótica que extrai o corpo do café."
        }
      ];

      recommendedGear = {
        name: "Grãos Especiais de Microlote (Bourbon Amarelo / Catuaí Natural)",
        category: "beans",
        desc: "Cafés de processo natural das regiões da Mantiqueira e Cerrado Mineiro possuem alta concentração de açúcares mucilaginosos que conferem corpo xaroposo e textura aveludada incomparável.",
        actionLabel: "Ver Cafés Encorpados"
      };
    }

    // 5. Caso: PERFEITO / EQUILIBRADO (Golden Cup Standard)
    else {
      title = `Xícara de Ouro SCA! (${eyEstimated}% EY - Equilíbrio Ideal)`;
      badge = "Perfeição Sensorial";
      statusTone = "success";

      diagnosisNarrative = `Parabéns! Sua extração no **${method}** atingiu a zona de ouro do barismo internacional (entre 18.0% e 22.0% de rendimento de extração). A acidez cítrica málica está em perfeita sinergia com os açúcares caramelizados, finalizando com retrogosto doce e limpo.`;

      chemicalExplanation = `Você alcançou o ponto de saturação perfeito: dissolveu os ácidos no início, os carboidratos e óleos no meio e interrompeu o fluxo exatamente antes da degradação dos taninos insolúveis. O tempo real de ${formatTime(actualTime)} e a temperatura de ${temp}°C foram impecáveis.`;

      adjustments = [
        {
          param: "Receita de Referência Salva",
          action: "Estes parâmetros foram favoritados no seu histórico para repetição exata neste pacote de grãos.",
          technicalReason: "Consistência é a maior virtude de um barista. Mantenha essa calibração até o fim do lote."
        }
      ];

      recommendedGear = {
        name: "Pote de Armazenamento a Vácuo para Grãos (Fellow Atmos)",
        category: "gear",
        desc: "Para que seu café continue apresentando essa mesma xícara brilhante pelos próximos 30 dias, bloqueie a oxidação e o contato com a umidade ambiente.",
        actionLabel: "Ver Acessórios de Conservação"
      };
    }

    return {
      feedbackKey,
      title,
      badge,
      statusTone,
      eyEstimated,
      timeDelta,
      timeDeltaFormatted,
      actualTimeFormatted: formatTime(actualTime),
      targetTimeFormatted: formatTime(targetTime),
      diagnosisNarrative,
      chemicalExplanation,
      adjustments,
      recommendedGear,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Salva uma sessão no histórico local
   */
  function saveToHistory(sessionData) {
    try {
      const history = getHistory();
      const record = {
        id: "brew_" + Date.now(),
        date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
        ...sessionData
      };
      history.unshift(record);
      const trimmed = history.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return record;
    } catch (e) {
      console.error("Falha ao persistir histórico:", e);
      return null;
    }
  }

  function getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    estimateExtractionYield,
    diagnose,
    saveToHistory,
    getHistory,
    clearHistory
  };
});
