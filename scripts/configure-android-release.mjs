/**
 * Calc Coffee — Configurador de Release Android (API 36 + Assinatura Zero-Secret + VersionCode)
 *
 * Responsabilidade única (SRP):
 *  1. Validar conformidade da API alvo (compileSdkVersion >= 36, targetSdkVersion >= 36).
 *  2. Injetar `versionCode` (automático/monotônico) e `versionName` no `android/app/build.gradle`.
 *  3. Configurar `signingConfigs.release` lendo exclusivamente variáveis de ambiente em tempo de build
 *     (zero credenciais chumbadas em código).
 *  4. Endurecer o `AndroidManifest.xml` (`usesCleartextTraffic="false"` e `allowBackup="false"`).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CURRENT_DIR, "..");

const REQUIRED_ANDROID_API_LEVEL = 36;
const MIN_SUPPORTED_API_LEVEL = 24;
const SIGNING_MARKER = "// [CALC-COFFEE-RELEASE-SIGNING]";

export function parseSdkLevels(variablesGradleContent) {
  const extractInt = (name) => {
    const match = variablesGradleContent.match(new RegExp(`${name}\\s*=\\s*(\\d+)`));
    return match ? Number.parseInt(match[1], 10) : null;
  };

  return {
    minSdkVersion: extractInt("minSdkVersion"),
    compileSdkVersion: extractInt("compileSdkVersion"),
    targetSdkVersion: extractInt("targetSdkVersion")
  };
}

export function validateApiLevelCompliance(variablesGradleContent) {
  const levels = parseSdkLevels(variablesGradleContent);

  if (levels.compileSdkVersion === null || levels.compileSdkVersion < REQUIRED_ANDROID_API_LEVEL) {
    throw new Error(
      `compileSdkVersion inválido (${levels.compileSdkVersion}). Google Play exige >= ${REQUIRED_ANDROID_API_LEVEL}.`
    );
  }

  if (levels.targetSdkVersion === null || levels.targetSdkVersion < REQUIRED_ANDROID_API_LEVEL) {
    throw new Error(
      `targetSdkVersion inválido (${levels.targetSdkVersion}). Google Play exige >= ${REQUIRED_ANDROID_API_LEVEL}.`
    );
  }

  if (levels.minSdkVersion === null || levels.minSdkVersion < MIN_SUPPORTED_API_LEVEL) {
    throw new Error(
      `minSdkVersion inválido (${levels.minSdkVersion}). Capacitor 8 exige >= ${MIN_SUPPORTED_API_LEVEL}.`
    );
  }

  return levels;
}

export function parseVersionCode(rawValue) {
  const parsed = Number.parseInt(String(rawValue ?? "1"), 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 2100000000) {
    throw new Error(`ANDROID_VERSION_CODE inválido: "${rawValue}". Informe um inteiro entre 1 e 2100000000.`);
  }
  return parsed;
}

export function parseVersionName(rawValue, fallbackVersion) {
  const candidate = String(rawValue || fallbackVersion || "1.0.0").trim();
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(candidate)) {
    throw new Error(`ANDROID_VERSION_NAME inválido: "${candidate}". Use formato SemVer (ex.: 2.4.0).`);
  }
  return candidate;
}

export function patchAppBuildGradle(gradleContent, { versionCode, versionName }) {
  let updated = gradleContent;

  if (!/versionCode\s+\d+/.test(updated)) {
    throw new Error("Bloco versionCode não encontrado em android/app/build.gradle.");
  }
  if (!/versionName\s+"[^"]+"/.test(updated)) {
    throw new Error("Bloco versionName não encontrado em android/app/build.gradle.");
  }

  updated = updated.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  updated = updated.replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);

  if (!updated.includes(SIGNING_MARKER)) {
    const signingBlock = [
      `    ${SIGNING_MARKER}`,
      "    signingConfigs {",
      "        release {",
      '            def keystorePath = System.getenv("ANDROID_KEYSTORE_PATH")',
      "            if (keystorePath) {",
      "                storeFile file(keystorePath)",
      '                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")',
      '                keyAlias System.getenv("ANDROID_KEY_ALIAS")',
      '                keyPassword System.getenv("ANDROID_KEY_PASSWORD")',
      "            }",
      "        }",
      "    }",
      "    buildTypes {"
    ].join("\n");

    if (!updated.includes("    buildTypes {")) {
      throw new Error("Bloco buildTypes não encontrado em android/app/build.gradle.");
    }
    updated = updated.replace("    buildTypes {", signingBlock);

    const releaseBlockPattern = /(buildTypes\s*\{\s*release\s*\{)/;
    if (!releaseBlockPattern.test(updated)) {
      throw new Error("Bloco buildTypes.release não encontrado em android/app/build.gradle.");
    }

    updated = updated.replace(
      releaseBlockPattern,
      [
        "$1",
        '            if (System.getenv("ANDROID_KEYSTORE_PATH")) {',
        "                signingConfig signingConfigs.release",
        "            }"
      ].join("\n")
    );
  }

  return updated;
}

export function hardenAndroidManifest(manifestContent) {
  let updated = manifestContent;

  if (updated.includes('android:allowBackup="true"')) {
    updated = updated.replace('android:allowBackup="true"', 'android:allowBackup="false"');
  } else if (!updated.includes("android:allowBackup=")) {
    updated = updated.replace("<application", '<application\n        android:allowBackup="false"');
  }

  if (updated.includes('android:usesCleartextTraffic="true"')) {
    updated = updated.replace('android:usesCleartextTraffic="true"', 'android:usesCleartextTraffic="false"');
  } else if (!updated.includes("android:usesCleartextTraffic=")) {
    updated = updated.replace(
      'android:allowBackup="false"',
      'android:allowBackup="false"\n        android:usesCleartextTraffic="false"'
    );
  }

  return updated;
}

export function configureAndroidRelease({
  rootDir = PROJECT_ROOT,
  versionCode = process.env.ANDROID_VERSION_CODE || process.env.GITHUB_RUN_NUMBER || "1",
  versionName = process.env.ANDROID_VERSION_NAME
} = {}) {
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  const resolvedVersionCode = parseVersionCode(versionCode);
  const resolvedVersionName = parseVersionName(versionName, pkg.version);

  const variablesPath = path.join(rootDir, "android", "variables.gradle");
  const appBuildPath = path.join(rootDir, "android", "app", "build.gradle");
  const manifestPath = path.join(rootDir, "android", "app", "src", "main", "AndroidManifest.xml");

  for (const requiredFile of [variablesPath, appBuildPath, manifestPath]) {
    if (!fs.existsSync(requiredFile)) {
      throw new Error(`Arquivo Android ausente: ${requiredFile}. Execute "npx cap add android" antes.`);
    }
  }

  const variablesContent = fs.readFileSync(variablesPath, "utf8");
  const sdkLevels = validateApiLevelCompliance(variablesContent);

  const originalGradle = fs.readFileSync(appBuildPath, "utf8");
  const patchedGradle = patchAppBuildGradle(originalGradle, {
    versionCode: resolvedVersionCode,
    versionName: resolvedVersionName
  });
  fs.writeFileSync(appBuildPath, patchedGradle, "utf8");

  const originalManifest = fs.readFileSync(manifestPath, "utf8");
  const hardenedManifest = hardenAndroidManifest(originalManifest);
  fs.writeFileSync(manifestPath, hardenedManifest, "utf8");

  return {
    sdkLevels,
    versionCode: resolvedVersionCode,
    versionName: resolvedVersionName
  };
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  try {
    const result = configureAndroidRelease();
    console.log(
      `[AndroidRelease] Configurado com sucesso: API ${result.sdkLevels.targetSdkVersion} | versionName=${result.versionName} | versionCode=${result.versionCode}`
    );
  } catch (error) {
    console.error("[AndroidRelease] Falha na configuração:", error.message);
    process.exit(1);
  }
}
