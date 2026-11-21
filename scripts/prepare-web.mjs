/**
 * Calc Coffee — Preparação Determinística do Diretório Web (`www/`) para Capacitor
 *
 * Responsabilidade única (SRP): copiar apenas os artefatos de runtime estáticos do
 * aplicativo para `www/` com validação fail-fast, impedindo vazamento de arquivos
 * internos (.env, scripts, testes, docs, dotfiles) para o pacote Android.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CURRENT_DIR, "..");

const REQUIRED_WEB_ENTRIES = Object.freeze([
  "index.html",
  "privacy.html",
  "manifest.json",
  "sw.js",
  "css",
  "js",
  "audio",
  "icons"
]);

const OPTIONAL_WEB_ENTRIES = Object.freeze([
  "favicon.ico"
]);

/**
 * Exclui arquivos de runtime exclusivo Node.js (ex.: grafo .mjs de desenvolvimento)
 * do bundle web empacotado no WebView Android.
 */
function shouldCopyWebAsset(sourcePath) {
  const baseName = path.basename(sourcePath);
  if (baseName.startsWith(".")) return false;
  if (baseName.endsWith(".mjs")) return false;
  return true;
}

export function prepareWebDirectory(rootDir = PROJECT_ROOT) {
  const outputDir = path.join(rootDir, "www");

  for (const entry of REQUIRED_WEB_ENTRIES) {
    const sourcePath = path.join(rootDir, entry);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Artefato web obrigatório ausente: ${entry}`);
    }
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const copiedEntries = [];

  for (const entry of REQUIRED_WEB_ENTRIES) {
    const sourcePath = path.join(rootDir, entry);
    const targetPath = path.join(outputDir, entry);
    fs.cpSync(sourcePath, targetPath, { recursive: true, filter: shouldCopyWebAsset });
    copiedEntries.push(entry);
  }

  for (const entry of OPTIONAL_WEB_ENTRIES) {
    const sourcePath = path.join(rootDir, entry);
    if (!fs.existsSync(sourcePath)) continue;
    const targetPath = path.join(outputDir, entry);
    fs.cpSync(sourcePath, targetPath, { recursive: true, filter: shouldCopyWebAsset });
    copiedEntries.push(entry);
  }

  return { outputDir, copiedEntries };
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  try {
    const { outputDir, copiedEntries } = prepareWebDirectory();
    console.log(`[PrepareWeb] Bundle pronto em ${outputDir} (${copiedEntries.join(", ")})`);
  } catch (error) {
    console.error("[PrepareWeb] Erro:", error.message);
    process.exit(1);
  }
}
