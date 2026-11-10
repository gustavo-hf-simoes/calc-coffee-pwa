/**
 * Calc Coffee - Core Brewing Engine
 * Arquitetura de extração matemática, métodos de barismo e receitas dos campeões
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CoffeeEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  const CONFIG = {
    methods: {
      V60: {
        id: "V60",
        name: "Hario V60",
        tag: "Cônico 60°",
        category: "Percolação Livre",
        defaultWater: 300,
        defaultRatio: "1:15",
        defaultGrind: "medium",
        defaultRoast: "medium",
        defaultFreshness: "rested",
        defaultProfile: "classico",
        baseTime: 180,
        baseBloomTime: 35,
        bloomWaterRatio: 2.5,
        poursCount: 3,
        description: "Filtro cônico com ranhuras espirais a 60° e orifício largo. Proporciona fluxo livre, acidez málica brilhante e alta clareza aromática.",
        physics: "Alta velocidade de fluxo por gravidade; exige controle manual rigoroso da taxa de vazão da chaleira."
      },
      KOAR: {
        id: "KOAR",
        name: "Koar",
        tag: "100% Brasileiro",
        category: "Percolação Guiada",
        defaultWater: 250,
        defaultRatio: "1:14",
        defaultGrind: "medium",
        defaultRoast: "medium",
        defaultFreshness: "fresh",
        defaultProfile: "classico",
        baseTime: 175,
        baseBloomTime: 30,
        bloomWaterRatio: 2.3,
        poursCount: 3,
        description: "Método de porcelana/acrílico com 16 sulcos verticais que evitam a compactação do papel. Realça a doçura natural e o corpo de cafés brasileiros.",
        physics: "Maior retenção térmica e canaletas que direcionam a vazão uniforme até o orifício central de 15mm."
      },
      MELITTA: {
        id: "MELITTA",
        name: "Melitta",
        tag: "Fundo Reto",
        category: "Imersão Parcial",
        defaultWater: 300,
        defaultRatio: "1:14",
        defaultGrind: "medium-coarse",
        defaultRoast: "medium",
        defaultFreshness: "rested",
        defaultProfile: "classico",
        baseTime: 210,
        baseBloomTime: 30,
        bloomWaterRatio: 2.2,
        poursCount: 3,
        description: "Porta-filtro trapezoidal com orifício pequeno na base. Gera uma resistência hidráulica maior com imersão parcial prolongada.",
        physics: "Tempo de contato mais longo, ideal para extrair açúcares caramelizados e notas achocolatadas equilibradas."
      },
      KALITA: {
        id: "KALITA",
        name: "Kalita Wave",
        tag: "Fundo Plano",
        category: "Leito Nivelado",
        defaultWater: 300,
        defaultRatio: "1:15",
        defaultGrind: "medium",
        defaultRoast: "light",
        defaultFreshness: "rested",
        defaultProfile: "frutado",
        baseTime: 200,
        baseBloomTime: 35,
        bloomWaterRatio: 2.4,
        poursCount: 4,
        description: "Base plana com 3 furos e filtro de papel sanfonado com 20 ondas. Minimiza canalizações acidentais e extrai de forma homogênea.",
        physics: "Cama de café uniforme e leito plano; o contato entre a água e o pó ocorre em plano horizontal sem compressão nas bordas."
      },
      CHEMEX: {
        id: "CHEMEX",
        name: "Chemex",
        tag: "Filtro Denso",
        category: "Clareza Máxima",
        defaultWater: 400,
        defaultRatio: "1:16",
        defaultGrind: "medium-coarse",
        defaultRoast: "light",
        defaultFreshness: "rested",
        defaultProfile: "floral",
        baseTime: 250,
        baseBloomTime: 40,
        bloomWaterRatio: 2.6,
        poursCount: 4,
        description: "Jarra de vidro borossilicato com filtro de celulose de densidade 30% maior. Retém quase todos os óleos diterpenos e microfinos.",
        physics: "Alta resistência mecânica do papel que requer granulometria média-grossa para não empoçar."
      },
      AEROPRESS: {
        id: "AEROPRESS",
        name: "AeroPress",
        tag: "Pressão de Ar",
        category: "Imersão & Pressão",
        defaultWater: 200,
        defaultRatio: "1:13",
        defaultGrind: "medium-fine",
        defaultRoast: "medium",
        defaultFreshness: "rested",
        defaultProfile: "gourmet",
        baseTime: 120,
        baseBloomTime: 25,
        bloomWaterRatio: 2.0,
        poursCount: 2,
        description: "Infusão direta sob câmara estanque selada por êmbolo de silicone. Extração ultrarrápida com perfil encorpado e doçura limpa.",
        physics: "Combinação de imersão total com pressão pneumática de 0.35 a 0.75 bar no término."
      },
      FRENCH_PRESS: {
        id: "FRENCH_PRESS",
        name: "Prensa Francesa",
        tag: "Imersão Total",
        category: "Filtro de Metal",
        defaultWater: 350,
        defaultRatio: "1:14",
        defaultGrind: "coarse",
        defaultRoast: "medium",
        defaultFreshness: "fresh",
        defaultProfile: "gourmet",
        baseTime: 240,
        baseBloomTime: 45,
        bloomWaterRatio: 2.5,
        poursCount: 1,
        description: "Imersão estática prolongada sem papel celulósico. O êmbolo de malha de aço preserva óleos lipídicos e textura sedosa.",
        physics: "Equilíbrio osmótico contínuo; sedimentação natural dos sólidos solúveis sem filtragem de compostos pesados."
      }
    },

    champions: {
      "tetsu-4-6": {
        id: "tetsu-4-6",
        name: "Método 4:6 (Tetsu Kasuya)",
        subtitle: "Campeão Mundial Brewers Cup 2016",
        method: "V60",
        ratio: "1:15",
        water: 300,
        grind: "coarse",
        roast: "light",
        freshness: "rested",
        poursCount: 4,
        distribution: [70, 60, 60, 60], // Bloom 50ml + 4 despejos = 5 etapas: 50, 70, 60, 60, 60
        bloomWaterPercent: 50 / 300,
        bloomTime: 45,
        totalTime: 210,
        temp: 92,
        notes: "Moagem grossa. Os primeiros 40% da água (50ml + 70ml) ajustam acidez e doçura; os 60% restantes (3x 60ml) dosam a força e corpo."
      },
      "boram-um": {
        id: "boram-um",
        name: "Receita de Ouro (Boram Um)",
        subtitle: "Campeão Mundial Barista 2023 • Brasil",
        method: "V60",
        ratio: "1:15.5",
        water: 300,
        grind: "medium-coarse",
        roast: "light",
        freshness: "rested",
        poursCount: 3,
        distribution: [1.0, 1.0, 1.0], // Bloom 60ml + 3 despejos de 80ml = 4 etapas: 60, 80, 80, 80
        bloomWaterPercent: 60 / 300,
        bloomTime: 40,
        totalTime: 180,
        temp: 93,
        notes: "Despejos suaves de 80ml em círculos lentos. Mantém fluxo constante com turbulência reduzida, preservando notas florais e acidez sedosa."
      },
      "leo-moco": {
        id: "leo-moco",
        name: "Pulsos Rápidos (Léo Moço)",
        subtitle: "Tetracampeão Brasileiro de Barista",
        method: "KOAR",
        ratio: "1:14",
        water: 250,
        grind: "medium",
        roast: "medium",
        freshness: "fresh",
        poursCount: 2,
        distribution: [1.0, 1.0], // Bloom 50ml + 2 pulsos rápidos de 100ml = 3 etapas: 50, 100, 100
        bloomWaterPercent: 50 / 250,
        bloomTime: 30,
        totalTime: 150,
        temp: 94,
        notes: "Pulsos rápidos no Koar que aproveitam a vazão de seus 16 sulcos verticais, valorizando notas de chocolate e caramelo com corpo denso."
      }
    },

    profiles: {
      gourmet: {
        id: "gourmet",
        name: "Gourmet / Intenso",
        ratio: "1:12",
        grind: "fine",
        poursCount: 2,
        distribution: [1.2, 1.0],
        desc: "Alta densidade e concentração de sólidos. Ideal para quem aprecia corpo denso e persistência prolongada no paladar."
      },
      classico: {
        id: "classico",
        name: "Clássico Equilibrado",
        ratio: "1:15",
        grind: "medium",
        poursCount: 3,
        distribution: [1, 1, 1],
        desc: "Harmonia perfeita entre açúcares solúveis, ácidos orgânicos e corpo sedoso. Padrão áureo do barismo."
      },
      frutado: {
        id: "frutado",
        name: "Frutado & Cítrico",
        ratio: "1:16",
        grind: "medium",
        poursCount: 4,
        distribution: [1.3, 1.1, 0.9, 0.7],
        desc: "Maior proporção nos primeiros 40% para extrair ácidos málicos e cítricos de microlotes especiais fermentados."
      },
      floral: {
        id: "floral",
        name: "Floral & Delicado",
        ratio: "1:17",
        grind: "medium-coarse",
        poursCount: 4,
        distribution: [0.8, 1.0, 1.2, 1.3],
        desc: "Fluxo suave e relação alongada que valoriza notas de flor de laranjeira, jasmim e variedades como Geisha e Arara."
      },
      exotico: {
        id: "exotico",
        name: "Exótico & Complexo",
        ratio: "1:14",
        grind: "medium-coarse",
        poursCount: 4,
        distribution: [1.2, 1.0, 1.0, 0.8],
        desc: "Despejos calculados para microlotes com processos anaeróbicos induzidos e notas de frutas amarelas tropicais."
      }
    },

    ratios: {
      "1:12": 12,
      "1:13": 13,
      "1:14": 14,
      "1:15": 15,
      "1:15.5": 15.5,
      "1:16": 16,
      "1:17": 17,
      "1:18": 18
    },

    impactMatrix: {
      grind: {
        fine:            { tempo: 1.08, bloomTempo: 1.08, bloomAgua: 1.03, label: "Fina (Açúcar refinado)" },
        "medium-fine":   { tempo: 1.04, bloomTempo: 1.04, bloomAgua: 1.01, label: "Média-Fina (Areia fina)" },
        medium:          { tempo: 1.00, bloomTempo: 1.00, bloomAgua: 1.00, label: "Média (Açúcar cristal)" },
        "medium-coarse": { tempo: 0.95, bloomTempo: 0.96, bloomAgua: 0.98, label: "Média-Grossa (Areia grossa)" },
        coarse:          { tempo: 0.92, bloomTempo: 0.93, bloomAgua: 0.95, label: "Grossa (Flor de sal)" }
      },

      freshness: {
        fresh:  { tempo: 1.05, bloomTempo: 1.20, bloomAgua: 1.10, label: "Fresco (até 7 dias)" },
        rested: { tempo: 1.00, bloomTempo: 1.00, bloomAgua: 1.00, label: "Descansado (7 a 30 dias)" },
        old:    { tempo: 0.95, bloomTempo: 0.90, bloomAgua: 0.92, label: "Antigo (> 30 dias)" }
      },

      roast: {
        light:  { tempo: 1.10, temp: 95, label: "Clara (95°C • Ácida & Floral)" },
        medium: { tempo: 1.00, temp: 93, label: "Média (93°C • Caramelo & Equilíbrio)" },
        dark:   { tempo: 0.90, temp: 90, label: "Escura (90°C • Chocolate & Encorpada)" }
      }
    },

    dynamics: {
      reference: {
        water: 300,
        ratio: 15
      },
      ratioImpact: 0.40,
      bloomBaseRatio: 2.3
    }
  };

  /**
   * Retorna os valores padrão de um método para atualizar a interface dinamicamente
   */
  function getMethodDefaults(methodKey) {
    const m = CONFIG.methods[methodKey] || CONFIG.methods.V60;
    return {
      method: m.id,
      name: m.name,
      water: m.defaultWater,
      ratio: m.defaultRatio,
      grind: m.defaultGrind,
      roast: m.defaultRoast,
      freshness: m.defaultFreshness,
      profile: m.defaultProfile,
      temp: m.defaultRoast === "light" ? 95 : (m.defaultRoast === "dark" ? 90 : 93),
      description: m.description,
      physics: m.physics
    };
  }

  /**
   * Calcula a receita completa com base nos parâmetros
   */
  function calculateRecipe(input) {
    // 1. Caso de receita de campeão
    if (input.championId && CONFIG.champions[input.championId]) {
      const champ = CONFIG.champions[input.championId];
      const water = Number(input.water || champ.water || 300);
      const ratioVal = CONFIG.ratios[champ.ratio] || 15;
      const coffee = water / ratioVal;
      const bloomWater = Math.round(water * champ.bloomWaterPercent);
      const remainingWater = water - bloomWater;
      const effectiveTime = champ.totalTime - champ.bloomTime;

      const sumDist = champ.distribution.reduce((a, b) => a + b, 0);
      const normalized = champ.distribution.map(d => d / sumDist);

      let pours = [];
      let cumulativeWater = bloomWater;
      let cumulativeTime = champ.bloomTime;
      const stepTime = effectiveTime / champ.poursCount;

      normalized.forEach((weight, i) => {
        const added = remainingWater * weight;
        cumulativeWater += added;
        const start = cumulativeTime;
        cumulativeTime += stepTime;

        pours.push({
          step: i + 1,
          label: `Despejo ${i + 1}`,
          added: Math.round(added),
          totalWater: Math.round(cumulativeWater),
          start: Math.round(start),
          end: Math.round(cumulativeTime),
          duration: Math.round(stepTime)
        });
      });

      return {
        isChampion: true,
        championData: champ,
        method: champ.method,
        methodName: CONFIG.methods[champ.method].name,
        profileName: champ.name,
        water: Math.round(water),
        coffee: Number(coffee.toFixed(1)),
        ratio: champ.ratio,
        temperature: champ.temp,
        grind: champ.grind,
        grindLabel: CONFIG.impactMatrix.grind[champ.grind]?.label || champ.grind,
        roast: champ.roast,
        roastLabel: CONFIG.impactMatrix.roast[champ.roast]?.label || champ.roast,
        freshness: champ.freshness,
        freshnessLabel: CONFIG.impactMatrix.freshness[champ.freshness]?.label || champ.freshness,
        bloom: {
          water: bloomWater,
          time: champ.bloomTime
        },
        pours: pours,
        totalTime: champ.totalTime,
        sensoryNotes: champ.notes,
        physics: CONFIG.methods[champ.method].physics
      };
    }

    // 2. Cálculo dinâmico para método personalizado
    const methodKey = input.method || "V60";
    const method = CONFIG.methods[methodKey] || CONFIG.methods.V60;
    const profileKey = input.profile || method.defaultProfile || "classico";
    const profile = CONFIG.profiles[profileKey] || CONFIG.profiles.classico;

    const ratioKey = input.ratio || method.defaultRatio || profile.ratio;
    const ratioValue = CONFIG.ratios[ratioKey] || 15;

    const water = Number(input.water || method.defaultWater || 300);
    const coffee = water / ratioValue;

    const grind = input.grind || method.defaultGrind || "medium";
    const freshness = input.freshness || method.defaultFreshness || "rested";
    const roast = input.roast || method.defaultRoast || "medium";

    const grindF = CONFIG.impactMatrix.grind[grind] || CONFIG.impactMatrix.grind.medium;
    const freshF = CONFIG.impactMatrix.freshness[freshness] || CONFIG.impactMatrix.freshness.rested;
    const roastF = CONFIG.impactMatrix.roast[roast] || CONFIG.impactMatrix.roast.medium;

    // Fator de tempo base
    let tempoFactor = grindF.tempo * freshF.tempo * roastF.tempo;

    // Impacto do Ratio na extração
    const refCoffee = CONFIG.dynamics.reference.water / CONFIG.dynamics.reference.ratio;
    const ratioDelta = coffee - refCoffee;
    const ratioFactor = 1 + ((ratioDelta / refCoffee) * CONFIG.dynamics.ratioImpact);
    tempoFactor *= ratioFactor;

    // Escala não-linear de volume de água
    const waterRatio = water / CONFIG.dynamics.reference.water;
    const waterFactor = Math.pow(waterRatio, 0.28);
    tempoFactor *= waterFactor;

    // Cálculo do Bloom (Pré-infusão)
    let bloomTime = input.bloomTimeOverride || Math.round(method.baseBloomTime * grindF.bloomTempo * freshF.bloomTempo);
    bloomTime = Math.max(20, Math.min(60, bloomTime));

    let bloomWater = input.bloomWaterOverride || (coffee * (method.bloomWaterRatio || CONFIG.dynamics.bloomBaseRatio) * grindF.bloomAgua * freshF.bloomAgua);
    const maxBloom = water * 0.24;
    bloomWater = Math.min(bloomWater, maxBloom);

    // Tempo total de extração
    let totalTime = input.totalTimeOverride || (method.baseTime * tempoFactor);
    const poursCount = input.poursCountOverride || profile.poursCount || method.poursCount || 3;
    const poursFactor = 1 + ((poursCount - 3) * 0.04);
    totalTime *= poursFactor;

    const minTime = bloomTime + (poursCount * 12);
    if (totalTime < minTime) totalTime = minTime;

    const bloomDrift = Math.max(0, bloomTime - 30);
    totalTime += (bloomDrift * 0.35);

    // Distribuição dos Despejos (Pours)
    let pattern = [...(profile.distribution || [1, 1, 1])];
    while (pattern.length < poursCount) {
      pattern.push(1);
    }
    pattern = pattern.slice(0, poursCount);

    const sumDist = pattern.reduce((a, b) => a + b, 0);
    const normalized = pattern.map(v => v / sumDist);

    const remainingWater = water - bloomWater;
    const effectiveTime = totalTime - bloomTime;

    let pours = [];
    let cumulativeWater = bloomWater;
    let cumulativeTime = bloomTime;
    const stepDuration = effectiveTime / poursCount;

    normalized.forEach((weight, index) => {
      const addWater = remainingWater * weight;
      cumulativeWater += addWater;
      const start = cumulativeTime;
      cumulativeTime += stepDuration;

      pours.push({
        step: index + 1,
        label: methodKey === "FRENCH_PRESS" ? "Infusão Completa" : `Despejo ${index + 1}`,
        added: Math.round(addWater),
        totalWater: Math.round(cumulativeWater),
        start: Math.round(start),
        end: Math.round(cumulativeTime),
        duration: Math.round(stepDuration)
      });
    });

    return {
      isChampion: false,
      method: methodKey,
      methodName: method.name,
      methodCategory: method.category,
      profile: profileKey,
      profileName: profile.name,
      water: Math.round(water),
      coffee: Number(coffee.toFixed(1)),
      ratio: ratioKey,
      temperature: roastF.temp || 93,
      grind: grind,
      grindLabel: grindF.label,
      roast: roast,
      roastLabel: roastF.label,
      freshness: freshness,
      freshnessLabel: freshF.label,
      bloom: {
        water: Math.round(bloomWater),
        time: Math.round(bloomTime)
      },
      pours: pours,
      totalTime: Math.round(totalTime),
      sensoryNotes: profile.desc,
      physics: method.physics
    };
  }

  return {
    CONFIG,
    getMethodDefaults,
    calculateRecipe
  };
});
