/**
 * Calc Coffee - Suíte 7: Conformidade Play Store, Privacidade LGPD 2026,
 * Hardening Capacitor 8 (API 36), Ícones Nativos e Automação AAB
 */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { assert, createSuiteRunner } = require("./test-helpers.js");

const ROOT_DIR = path.resolve(__dirname, "..");
const runner = createSuiteRunner("7. Mobile Play Store, LGPD 2026, Capacitor 8 (API 36) & CI AAB");

runner.test("Capacitor 8 + @capacitor/assets instalados e engines Node >= 22 no package.json", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf8"));
  assert.ok(pkg.devDependencies["@capacitor/core"].startsWith("^8."), "@capacitor/core deve estar na v8+");
  assert.ok(pkg.devDependencies["@capacitor/cli"].startsWith("^8."), "@capacitor/cli deve estar na v8+");
  assert.ok(pkg.devDependencies["@capacitor/android"].startsWith("^8."), "@capacitor/android deve estar na v8+");
  assert.ok(Boolean(pkg.devDependencies["@capacitor/assets"]), "@capacitor/assets deve estar configurado");
  assert.strictEqual(pkg.engines.node, ">=22.0.0", "Capacitor 8 exige Node >= 22");
});

runner.test("capacitor.config.json endurecido para produção (sem debug, mixed content ou cleartext)", () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "capacitor.config.json"), "utf8"));
  assert.strictEqual(cfg.appId, "com.calccoffee.app");
  assert.strictEqual(cfg.server.androidScheme, "https");
  assert.strictEqual(cfg.server.cleartext, false, "cleartext deve ser false");
  assert.deepStrictEqual(cfg.server.allowNavigation, [], "allowNavigation deve ser vazio");
  assert.strictEqual(cfg.android.allowMixedContent, false, "allowMixedContent deve ser false");
  assert.strictEqual(cfg.android.webContentsDebuggingEnabled, false, "webContentsDebuggingEnabled deve ser false");
  assert.strictEqual(cfg.android.useLegacyBridge, false, "useLegacyBridge deve ser false");
  assert.strictEqual(cfg.plugins.CapacitorCookies.enabled, false, "CapacitorCookies deve ficar desativado");
  assert.strictEqual(cfg.plugins.SystemBars.insetsHandling, "css", "SystemBars insetsHandling deve ser css");
});

runner.test("privacy.html cobre base jurídica Brasil 2026 e reflete o código real do aplicativo", () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, "privacy.html"), "utf8");
  const requiredClauses = [
    "13.709/2018",
    "12.965/2014",
    "8.078/1990",
    "15.211/2025",
    "2/2022",
    "15/2024",
    "18/2024",
    "19/2024",
    "calc_coffee_history_v1",
    "calc_coffee_telemetry_events",
    "calccoffee-20",
    "koar.com.br",
    "com.calccoffee.app",
    "btn-privacy-clear-local-data"
  ];

  for (const clause of requiredClauses) {
    assert.ok(html.includes(clause), `privacy.html deve conter referência a: ${clause}`);
  }
  assert.ok(!html.includes("fonts.googleapis.com"), "privacy.html não deve carregar CDNs externos");
});

runner.test("manifest.json e assets nativos/PWA possuem PNGs reais na paleta nórdica (zero emojis)", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "manifest.json"), "utf8"));
  assert.strictEqual(manifest.background_color, "#f7f3ee");
  assert.strictEqual(manifest.theme_color, "#3b2a1f");
  assert.ok(manifest.icons.length >= 3, "manifest deve declarar ícones 192, 512 e maskable");
  assert.ok(!JSON.stringify(manifest).includes("☕"), "manifest não pode usar emoji como ícone");

  const expectedAssets = [
    "assets/icon-only.png",
    "assets/icon-foreground.png",
    "assets/icon-background.png",
    "assets/splash.png",
    "assets/splash-dark.png",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "icons/icon-maskable-512.png",
    "icons/apple-touch-icon.png",
    "icons/icon.svg"
  ];

  for (const relPath of expectedAssets) {
    const fullPath = path.join(ROOT_DIR, relPath);
    assert.ok(fs.existsSync(fullPath), `Asset obrigatório ausente: ${relPath}`);
    assert.ok(fs.statSync(fullPath).size > 200, `Asset vazio/corrompido: ${relPath}`);
  }
});

runner.test("scripts/configure-android-release.mjs valida API 36, injeta versionCode e bloqueia API 34", async () => {
  const mod = await import(pathToFileURL(path.join(ROOT_DIR, "scripts", "configure-android-release.mjs")).href);

  const validVars = "ext { minSdkVersion = 24\n compileSdkVersion = 36\n targetSdkVersion = 36 }";
  const levels = mod.validateApiLevelCompliance(validVars);
  assert.strictEqual(levels.targetSdkVersion, 36);

  assert.throws(
    () => mod.validateApiLevelCompliance("ext { minSdkVersion = 24\n compileSdkVersion = 34\n targetSdkVersion = 34 }"),
    /36/,
    "Deve rejeitar targetSdkVersion < 36"
  );

  const sampleGradle = [
    "android {",
    "    defaultConfig {",
    "        versionCode 1",
    '        versionName "1.0"',
    "    }",
    "    buildTypes {",
    "        release {",
    "            minifyEnabled false",
    "        }",
    "    }",
    "}"
  ].join("\n");

  const patched = mod.patchAppBuildGradle(sampleGradle, { versionCode: 15, versionName: "2.4.0" });
  assert.ok(patched.includes("versionCode 15"), "versionCode deve ser atualizado");
  assert.ok(patched.includes('versionName "2.4.0"'), "versionName deve ser atualizado");
  assert.ok(patched.includes('System.getenv("ANDROID_KEYSTORE_PATH")'), "Assinatura deve ler env vars");
  assert.ok(patched.includes("signingConfig signingConfigs.release"), "Release deve aplicar signingConfigs.release");

  const patchedTwice = mod.patchAppBuildGradle(patched, { versionCode: 16, versionName: "2.4.1" });
  assert.ok(patchedTwice.includes("versionCode 16"), "Patch deve ser idempotente");
  assert.strictEqual(patchedTwice.split("signingConfigs {").length - 1, 1, "signingConfigs não pode duplicar");
});

runner.test("scripts/prepare-web.mjs inclui privacy.html e exclui arquivos .mjs Node-only do bundle www/", async () => {
  const mod = await import(pathToFileURL(path.join(ROOT_DIR, "scripts", "prepare-web.mjs")).href);
  const { outputDir } = mod.prepareWebDirectory(ROOT_DIR);

  assert.ok(fs.existsSync(path.join(outputDir, "index.html")), "www/index.html deve existir");
  assert.ok(fs.existsSync(path.join(outputDir, "privacy.html")), "www/privacy.html deve existir");
  assert.ok(fs.existsSync(path.join(outputDir, "icons", "icon-512.png")), "www/icons/icon-512.png deve existir");
  assert.ok(
    !fs.existsSync(path.join(outputDir, "js", "coach", "official-langgraph-agent.mjs")),
    "Arquivos .mjs exclusivos de Node não devem ir para o bundle Android"
  );
});

runner.test("Workflow build-release-aab.yml possui assinatura via Secrets, Java 21, Node 22 e zero segredos fixos", () => {
  const yml = fs.readFileSync(path.join(ROOT_DIR, ".github", "workflows", "build-release-aab.yml"), "utf8");
  const requiredTokens = [
    "node-version: 22",
    'java-version: "21"',
    "secrets.ANDROID_KEYSTORE_BASE64",
    "secrets.ANDROID_KEYSTORE_PASSWORD",
    "secrets.ANDROID_KEY_ALIAS",
    "secrets.ANDROID_KEY_PASSWORD",
    "bundleRelease",
    "jarsigner -verify",
    "github.run_number",
    "npm run android:configure",
    "npm run assets:native"
  ];

  for (const token of requiredTokens) {
    assert.ok(yml.includes(token), `build-release-aab.yml deve conter: ${token}`);
  }
});

runner.test("Regra Zero var respeitada nos novos arquivos JS/MJS criados", () => {
  const filesToCheck = [
    "js/privacy.js",
    "scripts/generate-brand-assets.mjs",
    "scripts/prepare-web.mjs",
    "scripts/configure-android-release.mjs",
    "tests/test-mobile-release.js"
  ];

  for (const relPath of filesToCheck) {
    const content = fs.readFileSync(path.join(ROOT_DIR, relPath), "utf8");
    const hasVarDeclaration = /(?:^|[;{(])\s*var\s+[A-Za-z_$]/m.test(content);
    assert.strictEqual(hasVarDeclaration, false, `Arquivo ${relPath} não pode utilizar declaração var`);
  }
});

if (require.main === module) {
  runner.run().then(({ failed }) => {
    process.exitCode = failed > 0 ? 1 : 0;
  });
}

module.exports = runner;
