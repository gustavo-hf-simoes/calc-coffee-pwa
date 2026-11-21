/**
 * Calc Coffee — Gerador Determinístico de Ícones Nativos, Splash Screens e Assets PWA
 *
 * Responsabilidade única (SRP): renderizar a identidade visual oficial (Design System
 * Nórdico de Café Especial) em SVGs e PNGs de alta fidelidade para:
 *  - `assets/` (entrada oficial do `@capacitor/assets` para Android API 36 / Adaptive Icons)
 *  - `icons/`  (PWA manifest.json, favicon e ícone 512x512 pronto para a Google Play Store)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CURRENT_DIR, "..");
const ASSETS_DIR = path.join(PROJECT_ROOT, "assets");
const ICONS_DIR = path.join(PROJECT_ROOT, "icons");

const PALETTE = Object.freeze({
  bgNordic: "#f7f3ee",
  bgSubtle: "#efe7de",
  espresso: "#3b2a1f",
  espressoDark: "#2a1e16",
  terracotta: "#c08457",
  cream: "#f7f3ee"
});

/**
 * Gera o SVG oficial da xícara minimalista Calc Coffee centralizada.
 * Respeita a zona segura de 66% dos Android Adaptive Icons quando `safeScale` é aplicado.
 */
function buildCupMarkSvg({ size, backgroundColor, strokeColor, steamColor, markScale = 0.52, roundedRadius = 0 }) {
  const half = size / 2;
  const markSize = size * markScale;
  const scaleFactor = markSize / 24;
  // O path da xícara (x: 2..23, y: 1..21) tem centro visual aproximado em (12.0, 11.2)
  const translateX = half - 12.0 * scaleFactor;
  const translateY = half - 11.2 * scaleFactor;

  const backgroundRect = backgroundColor
    ? `<rect width="${size}" height="${size}" rx="${roundedRadius}" fill="${backgroundColor}"/>`
    : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    backgroundRect,
    `  <g transform="translate(${translateX.toFixed(2)}, ${translateY.toFixed(2)}) scale(${scaleFactor.toFixed(4)})"`,
    `     fill="none" stroke-linecap="round" stroke-linejoin="round">`,
    `    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="${strokeColor}" stroke-width="1.9"/>`,
    `    <path d="M6 1.5v3M10 1.5v3M14 1.5v3" stroke="${steamColor}" stroke-width="1.9"/>`,
    "  </g>",
    "</svg>"
  ].join("\n");
}

function buildBackgroundSvg({ size, primaryColor, accentColor }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    "  <defs>",
    `    <radialGradient id="espressoGlow" cx="50%" cy="42%" r="65%">`,
    `      <stop offset="0%" stop-color="${accentColor}"/>`,
    `      <stop offset="100%" stop-color="${primaryColor}"/>`,
    "    </radialGradient>",
    "  </defs>",
    `  <rect width="${size}" height="${size}" fill="url(#espressoGlow)"/>`,
    "</svg>"
  ].join("\n");
}

function buildSplashSvg({ size, canvasColor, badgeColor, strokeColor, steamColor }) {
  const badgeSize = Math.round(size * 0.24);
  const badgeRadius = Math.round(badgeSize * 0.22);
  const badgeOffset = Math.round((size - badgeSize) / 2);
  const markSize = badgeSize * 0.56;
  const scaleFactor = markSize / 24;
  const translateX = size / 2 - 12.0 * scaleFactor;
  const translateY = size / 2 - 11.2 * scaleFactor;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <rect width="${size}" height="${size}" fill="${canvasColor}"/>`,
    `  <rect x="${badgeOffset}" y="${badgeOffset}" width="${badgeSize}" height="${badgeSize}" rx="${badgeRadius}" fill="${badgeColor}"/>`,
    `  <g transform="translate(${translateX.toFixed(2)}, ${translateY.toFixed(2)}) scale(${scaleFactor.toFixed(4)})"`,
    `     fill="none" stroke-linecap="round" stroke-linejoin="round">`,
    `    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="${strokeColor}" stroke-width="1.9"/>`,
    `    <path d="M6 1.5v3M10 1.5v3M14 1.5v3" stroke="${steamColor}" stroke-width="1.9"/>`,
    "  </g>",
    "</svg>"
  ].join("\n");
}

async function renderPng(svgContent, outputPath) {
  const buffer = Buffer.from(svgContent, "utf8");
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(outputPath);
}

export async function generateBrandAssets() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  fs.mkdirSync(ICONS_DIR, { recursive: true });

  // 1. Assets nativos para `@capacitor/assets` (Android API 36 Adaptive Icons + SplashScreen)
  const iconOnlySvg = buildCupMarkSvg({
    size: 1024,
    backgroundColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta,
    markScale: 0.54
  });

  // Zona segura Android Adaptive Icon (~44% do canvas 1024px garante margem total contra cortes circulares/squircle)
  const iconForegroundSvg = buildCupMarkSvg({
    size: 1024,
    backgroundColor: null,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta,
    markScale: 0.44
  });

  const iconBackgroundSvg = buildBackgroundSvg({
    size: 1024,
    primaryColor: PALETTE.espressoDark,
    accentColor: PALETTE.espresso
  });

  const splashLightSvg = buildSplashSvg({
    size: 2732,
    canvasColor: PALETTE.bgNordic,
    badgeColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta
  });

  const splashDarkSvg = buildSplashSvg({
    size: 2732,
    canvasColor: PALETTE.espressoDark,
    badgeColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta
  });

  // 2. Assets Web / PWA / Google Play Store Listing (512x512)
  const faviconSvg = buildCupMarkSvg({
    size: 512,
    backgroundColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta,
    markScale: 0.56,
    roundedRadius: 96
  });

  const pwaIcon512Svg = buildCupMarkSvg({
    size: 512,
    backgroundColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta,
    markScale: 0.54
  });

  const pwaIcon192Svg = buildCupMarkSvg({
    size: 192,
    backgroundColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta,
    markScale: 0.54
  });

  const pwaMaskable512Svg = buildCupMarkSvg({
    size: 512,
    backgroundColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta,
    markScale: 0.44
  });

  const appleTouch180Svg = buildCupMarkSvg({
    size: 180,
    backgroundColor: PALETTE.espresso,
    strokeColor: PALETTE.cream,
    steamColor: PALETTE.terracotta,
    markScale: 0.54
  });

  fs.writeFileSync(path.join(ICONS_DIR, "icon.svg"), `${faviconSvg}\n`, "utf8");

  await Promise.all([
    renderPng(iconOnlySvg, path.join(ASSETS_DIR, "icon-only.png")),
    renderPng(iconForegroundSvg, path.join(ASSETS_DIR, "icon-foreground.png")),
    renderPng(iconBackgroundSvg, path.join(ASSETS_DIR, "icon-background.png")),
    renderPng(splashLightSvg, path.join(ASSETS_DIR, "splash.png")),
    renderPng(splashDarkSvg, path.join(ASSETS_DIR, "splash-dark.png")),
    renderPng(pwaIcon512Svg, path.join(ICONS_DIR, "icon-512.png")),
    renderPng(pwaIcon192Svg, path.join(ICONS_DIR, "icon-192.png")),
    renderPng(pwaMaskable512Svg, path.join(ICONS_DIR, "icon-maskable-512.png")),
    renderPng(appleTouch180Svg, path.join(ICONS_DIR, "apple-touch-icon.png"))
  ]);

  return {
    assetsDir: ASSETS_DIR,
    iconsDir: ICONS_DIR
  };
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  generateBrandAssets()
    .then(({ assetsDir, iconsDir }) => {
      console.log(`[BrandAssets] Assets nativos gerados em: ${assetsDir}`);
      console.log(`[BrandAssets] Ícones PWA/Play Store gerados em: ${iconsDir}`);
    })
    .catch((error) => {
      console.error("[BrandAssets] Falha ao gerar assets:", error.message);
      process.exit(1);
    });
}
