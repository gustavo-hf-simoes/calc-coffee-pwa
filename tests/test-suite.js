/**
 * Calc Coffee - Automated Unit Test Suite
 * Validação rigorosa dos motores de cálculo, presets, física de extração e IA sensorial
 */

const assert = require("assert");
const CoffeeEngine = require("../js/engine.js");
const DialInCoach = require("../js/dialin-coach.js");
const CoffeeStore = require("../js/store.js");
const CoffeeAnalytics = require("../js/analytics.js");

let totalTests = 0;
let passedTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Erro: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("SUÍTE DE TESTES UNITÁRIOS — CALC COFFEE ENGINE & AI COACH");
console.log("=======================================================\n");

// 1. TESTES DO MOTOR DE PRESETS E MÉTODOS
console.log("1. Validação de Métodos e Presets de Barismo:");

it("Deve conter todos os 7 métodos fundamentais de extração", () => {
  const methods = Object.keys(CoffeeEngine.CONFIG.methods);
  assert.deepStrictEqual(methods, ["V60", "KOAR", "MELITTA", "KALITA", "CHEMEX", "AEROPRESS", "FRENCH_PRESS"]);
});

it("Deve carregar os presets específicos ao selecionar um método", () => {
  const v60 = CoffeeEngine.getMethodDefaults("V60");
  assert.strictEqual(v60.water, 300);
  assert.strictEqual(v60.ratio, "1:15");
  assert.strictEqual(v60.grind, "medium");

  const aero = CoffeeEngine.getMethodDefaults("AEROPRESS");
  assert.strictEqual(aero.water, 200);
  assert.strictEqual(aero.ratio, "1:13");
  assert.strictEqual(aero.grind, "medium-fine");

  const chemex = CoffeeEngine.getMethodDefaults("CHEMEX");
  assert.strictEqual(chemex.water, 400);
  assert.strictEqual(chemex.ratio, "1:16");
  assert.strictEqual(chemex.grind, "medium-coarse");

  const koar = CoffeeEngine.getMethodDefaults("KOAR");
  assert.strictEqual(koar.water, 250);
  assert.strictEqual(koar.ratio, "1:14");
});

// 2. TESTES DE CÁLCULO DINÂMICO E FÍSICA DE EXTRAÇÃO
console.log("\n2. Validação da Física de Extração e Balanço de Massa:");

it("Deve calcular dose de café e temperatura com precisão matemática", () => {
  const recipe = CoffeeEngine.calculateRecipe({
    method: "V60",
    water: 300,
    ratio: "1:15",
    roast: "light"
  });

  assert.strictEqual(recipe.coffee, 20.0, "300ml / 15 deve resultar em 20.0g de pó");
  assert.strictEqual(recipe.temperature, 95, "Torra clara exige 95°C");
  assert.ok(recipe.bloom.water >= 40 && recipe.bloom.water <= 70, "Bloom deve estar em faixa aceitável");
});

it("Deve garantir conservação de massa: soma de água do bloom e despejos deve ser igual ao volume total", () => {
  const recipe = CoffeeEngine.calculateRecipe({
    method: "V60",
    water: 360,
    ratio: "1:15",
    poursCount: 4
  });

  const lastPour = recipe.pours[recipe.pours.length - 1];
  assert.strictEqual(lastPour.totalWater, 360, "A água total acumulada no último despejo deve ser 360ml");
});

it("Deve aplicar o Método 4:6 de Tetsu Kasuya com 5 despejos e distribuição correta", () => {
  const recipe = CoffeeEngine.calculateRecipe({
    championId: "tetsu-4-6",
    water: 300
  });

  assert.strictEqual(recipe.isChampion, true);
  assert.strictEqual(recipe.pours.length, 4, "Após o bloom, restam 4 despejos somando 5 etapas no total");
  assert.strictEqual(recipe.temperature, 92);
  assert.strictEqual(recipe.pours[recipe.pours.length - 1].totalWater, 300);
});

it("Deve aplicar a Receita de Ouro de Boram Um (WBC 2023) com 4 etapas e temperatura calibrada", () => {
  const recipe = CoffeeEngine.calculateRecipe({
    championId: "boram-um",
    water: 300
  });

  assert.strictEqual(recipe.isChampion, true);
  assert.strictEqual(recipe.method, "V60");
  assert.strictEqual(recipe.temperature, 93);
  assert.strictEqual(recipe.pours.length, 3, "Bloom + 3 despejos = 4 etapas");
  assert.strictEqual(recipe.bloom.water, 60, "Bloom deve ser de 60ml");
  assert.strictEqual(recipe.pours[recipe.pours.length - 1].totalWater, 300);
});

it("Deve aplicar a receita de Pulsos Rápidos de Léo Moço com método Koar e ratio 1:14", () => {
  const recipe = CoffeeEngine.calculateRecipe({
    championId: "leo-moco",
    water: 250
  });

  assert.strictEqual(recipe.isChampion, true);
  assert.strictEqual(recipe.method, "KOAR");
  assert.strictEqual(recipe.methodName, "Koar");
  assert.strictEqual(recipe.temperature, 94);
  assert.strictEqual(recipe.pours.length, 2, "Bloom + 2 pulsos = 3 etapas");
  assert.strictEqual(recipe.pours[recipe.pours.length - 1].totalWater, 250);
});

// 3. TESTES DO COPILOTO IA E ESTIMATIVA SENSORIAL (EY %)
console.log("\n3. Validação do Copiloto IA (Dial-in Sensory Coach):");

it("Deve gerar diagnóstico dinâmico de Sobre-extração para queixa de café amargo", () => {
  const mockRecipe = CoffeeEngine.calculateRecipe({
    method: "V60",
    water: 300,
    ratio: "1:15",
    grind: "fine",
    roast: "medium"
  });

  const diag = DialInCoach.diagnose("bitter", mockRecipe, { actualTime: 220 });

  assert.strictEqual(diag.badge, "Sobre-extração");
  assert.strictEqual(diag.statusTone, "error");
  assert.ok(diag.eyEstimated > 21.0, "EY estimado deve ser alto para sobre-extração");
  assert.ok(diag.diagnosisNarrative.includes("Hario V60"));
  assert.ok(diag.diagnosisNarrative.includes("300 ml"));
  assert.ok(diag.adjustments.length >= 3);
  assert.strictEqual(diag.recommendedGear.category, "gear");
});

it("Deve gerar diagnóstico dinâmico de Sub-extração para queixa de café ácido", () => {
  const mockRecipe = CoffeeEngine.calculateRecipe({
    method: "CHEMEX",
    water: 400,
    ratio: "1:16",
    grind: "coarse",
    roast: "light"
  });

  const diag = DialInCoach.diagnose("sour", mockRecipe, { actualTime: 160 });

  assert.strictEqual(diag.badge, "Sub-extração");
  assert.strictEqual(diag.statusTone, "warning");
  assert.ok(diag.eyEstimated < 18.5, "EY estimado deve ser baixo para sub-extração");
  assert.ok(diag.diagnosisNarrative.includes("Chemex"));
  assert.ok(diag.adjustments.some(a => a.param.includes("Granulometria")));
});

it("Deve reconhecer Xícara de Ouro SCA com perfeição de balanço", () => {
  const mockRecipe = CoffeeEngine.calculateRecipe({
    method: "KOAR",
    water: 250,
    ratio: "1:14",
    grind: "medium",
    roast: "medium"
  });

  const diag = DialInCoach.diagnose("perfect", mockRecipe, { actualTime: 175 });

  assert.strictEqual(diag.badge, "Perfeição Sensorial");
  assert.strictEqual(diag.statusTone, "success");
  assert.ok(diag.eyEstimated >= 18.0 && diag.eyEstimated <= 22.0, "EY deve estar na faixa áurea");
});

// 4. TESTES DE CURADORIA E TELEMETRIA
console.log("\n4. Validação da Curadoria e Telemetria:");

it("Deve filtrar catálogo de produtos da curadoria corretamente", () => {
  const all = CoffeeStore.getProducts("all");
  const beans = CoffeeStore.getProducts("beans");
  const gear = CoffeeStore.getProducts("gear");

  assert.ok(all.length >= 7);
  assert.ok(beans.length >= 3);
  assert.ok(gear.length >= 4);
  assert.strictEqual(beans.every(b => b.category === "beans"), true);
});

console.log("\n-------------------------------------------------------");
console.log(`RESULTADO: ${passedTests} de ${totalTests} testes passaram com 100% de sucesso!`);
console.log("-------------------------------------------------------\n");
