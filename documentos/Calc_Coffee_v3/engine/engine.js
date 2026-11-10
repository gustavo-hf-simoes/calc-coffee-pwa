window.CONFIG = {

  methods: {
    MELITTA: { baseTime: 210, baseBloomTime: 30 },
    V60:     { baseTime: 180, baseBloomTime: 30 },
    CHEMEX:  { baseTime: 250, baseBloomTime: 35 },
    KALITA:  { baseTime: 200, baseBloomTime: 35 },
    KOAR:    { baseTime: 175, baseBloomTime: 30 }
  },

  profiles: {
    gourmet: {
      ratio: "1:12",
      grind: "fine",
      poursCount: 2,
      distribution: [1.2, 1.0]
    },

    classico: {
      ratio: "1:15",
      grind: "medium",
      poursCount: 3,
      distribution: [1, 1, 1]
    },

    frutado: {
      ratio: "1:16",
      grind: "medium",
      poursCount: 4,
      distribution: [1.3, 1.1, 0.9, 0.7]
    },

    floral: {
      ratio: "1:17",
      grind: "medium-coarse",
      poursCount: 4,
      distribution: [0.8, 1, 1.2, 1.3]
    },

    exotico: {
      ratio: "1:14",
      grind: "medium-coarse",
      poursCount: 4,
      distribution: [1.2, 1.0, 1.0, 0.8]
    }
  },

  ratios: {
    "1:12": 12,
    "1:13": 13,
    "1:14": 14,
    "1:15": 15,
    "1:16": 16,
    "1:17": 17,
    "1:18": 18
  },

  impactMatrix: {

    grind: {
      fine:            { tempo: 1.08, bloomTempo: 1.08, bloomAgua: 1.03 },
      medium:          { tempo: 1.0,  bloomTempo: 1.0,  bloomAgua: 1.0  },
      "medium-coarse": { tempo: 0.95, bloomTempo: 0.96, bloomAgua: 0.98 },
      coarse:          { tempo: 0.92, bloomTempo: 0.93, bloomAgua: 0.95 }
    },

    freshness: {
      fresh:  { tempo: 1.05, bloomTempo: 1.2, bloomAgua: 1.1 },
      rested: { tempo: 1.0,  bloomTempo: 1.0, bloomAgua: 1.0 },
      old:    { tempo: 0.95, bloomTempo: 0.9, bloomAgua: 0.92 }
    },

    roast: {
      light:  { tempo: 1.1 },
      medium: { tempo: 1.0 },
      dark:   { tempo: 0.9 }
    }
  },

  /* Dynamic Extraction Adjustments */
  dynamics: {

    reference: {
      water: 300,
      ratio: 15
    },

    ratioImpact: 0.40
  },

  bloom: {
    baseRatio: 2.3
  },

  constraints: {
    minPourGap: 10
  }
};


/* ==============================
   Recipe Engine
============================== */

window.generateRecipe = function(input) {

  const method = CONFIG.methods[input.method];
  const profile = CONFIG.profiles[input.profile];

  const ratio = input.ratio ?? profile.ratio;
  const ratioValue = CONFIG.ratios[ratio];

  const grind = input.grind ?? "medium";

  const water = input.value;
  const coffee = water / ratioValue;

  /* =========================
     Base Extraction Factors
  ========================= */

  const grindF = CONFIG.impactMatrix.grind[grind];
  const freshF = CONFIG.impactMatrix.freshness[input.freshness];
  const roastF = CONFIG.impactMatrix.roast[input.roast];

  let tempoFactor =
    grindF.tempo *
    freshF.tempo *
    roastF.tempo;

  /* =========================
     Ratio Impact
  ========================= */

  const refCoffee =
    CONFIG.dynamics.reference.water /
    CONFIG.dynamics.reference.ratio;

  const ratioDelta = coffee - refCoffee;

  const ratioFactor =
    1 + (
      (ratioDelta / refCoffee) *
      CONFIG.dynamics.ratioImpact
    );

  tempoFactor *= ratioFactor;

  /* =========================
     Water Volume Impact
  ========================= */

  const waterRatio =
    water / CONFIG.dynamics.reference.water;

  const waterFactor =
    Math.pow(waterRatio, 0.28);

  tempoFactor *= waterFactor;

  /* =========================
     Bloom Calculation
  ========================= */

  const bloomTempoFactor =
    grindF.bloomTempo *
    freshF.bloomTempo;

  const bloomAguaFactor =
    grindF.bloomAgua *
    freshF.bloomAgua;

  let bloomTime =
    input.bloomTime ??
    (method.baseBloomTime * bloomTempoFactor);

  bloomTime = Math.max(
    20,
    Math.min(60, bloomTime)
  );

  let bloomWater =
    input.bloomWater ??
    coffee *
    CONFIG.bloom.baseRatio *
    bloomAguaFactor;

  const maxBloom = water * 0.22;

  bloomWater = Math.min(
    bloomWater,
    maxBloom
  );

  /* =========================
     Total Extraction Time
  ========================= */

  let totalTime =
    input.totalTimeOverride ??
    (method.baseTime * tempoFactor);

  const poursCount =
    input.poursCount ??
    profile.poursCount;

  const poursFactor =
    1 + ((poursCount - 3) * 0.04);

  totalTime *= poursFactor;

  const minTime =
    bloomTime +
    poursCount *
    CONFIG.constraints.minPourGap;

  if (totalTime < minTime) {
    totalTime = minTime;
  }

  const bloomDrift =
    Math.max(0, bloomTime - 30);

  totalTime += bloomDrift * 0.35;

  /* =========================
     Pour Distribution
  ========================= */

  let pattern = [...profile.distribution];
  
  while (pattern.length < poursCount) {
    pattern.push(1);
  }
  
  pattern = pattern.slice(0, poursCount);

  const sum =
    pattern.reduce((a, b) => a + b, 0);

  const normalized =
    pattern.map(v => v / sum);

  const remaining = water - bloomWater;
  const effectiveTime = totalTime - bloomTime;

  let pours = [];

  let cumulativeWater = bloomWater;
  let cumulativeTime = bloomTime;

  normalized.forEach((weight) => {

    const addWater = remaining * weight;

    cumulativeWater += addWater;

    const addTime =
      effectiveTime / poursCount;

    const start = cumulativeTime;

    cumulativeTime += addTime;

    pours.push({
      water: Math.round(cumulativeWater),
      added: Math.round(addWater),
      start: Math.round(start),
      end: Math.round(cumulativeTime)
    });
  });

  /* =========================
     Water Temperature
  ========================= */

  const tempMap = {
    light: 95,
    medium: 93,
    dark: 90
  };

  return {

    method: input.method,
    profile: input.profile,
    freshness: input.freshness,

    grind: {
      fine: "fina",
      medium: "média",
      "medium-coarse": "média grossa",
      coarse: "grossa"
    }[grind],

    water: Math.round(water),

    coffee: coffee.toFixed(1),

    temperature:
      tempMap[input.roast] || 93,

    bloom: {
      water: Math.round(bloomWater),
      time: Math.round(bloomTime)
    },

    pours,

    totalTime: Math.round(totalTime)
  };
};