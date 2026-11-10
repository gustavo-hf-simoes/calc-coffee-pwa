---
name: pwa-offline-first
description: Guia e rotinas de ciclo de vida de Service Worker, cache offline e instalabilidade PWA para cozinhas sem conexão estável.
---

# Skill: PWA Offline-First para o Calc Coffee

Esta skill orienta o desenvolvimento e manutenção das capacidades offline do Calc Coffee.

## Objetivos
1. Garantir que todas as telas, áudios e cálculos funcionem sem conexão com a internet.
2. Gerenciar versões do Service Worker (`sw.js`) com invalidação segura de cache quando novos arquivos forem adicionados.
3. Garantir critérios de instalabilidade PWA no iOS Safari e Android Chrome.

## Checklist de Manutenção
- Toda nova dependência CSS/JS deve ser registrada na constante `ASSETS_TO_CACHE` do `sw.js`.
- O manifesto `manifest.json` deve manter `display: standalone`, `orientation: portrait` e ícones SVG/PNG válidos.
- Sempre manter a Wake Lock API protegida por feature detection (`if ("wakeLock" in navigator)`).
