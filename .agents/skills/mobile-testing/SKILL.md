---
name: mobile-testing
description: Procedimentos de auditoria de ergonomia mobile, alvos de toque, viewports responsivas e testes de bancada com mãos molhadas.
---

# Skill: Mobile & Ergonomics Testing

Esta skill instrui o agente a verificar a usabilidade mobile em condições reais de bancada de café.

## Regras de Ergonomia de Cozinha
1. **Touch Targets Mínimos:** Todos os botões primários (`.btn-primary`, `.btn-timer-main`, `.feedback-tag`) devem ter área de clique mínima de 48px de altura.
2. **Safe Area Insets:** A barra inferior fixa (`.bottom-nav`) deve sempre respeitar `env(safe-area-inset-bottom)` para não colidir com o indicador de gestos do iPhone/Android.
3. **Prevenção de Zoom Acidental:** A meta viewport deve conter `user-scalable=no, viewport-fit=cover` para evitar zoom duplo involuntário ao tocar rápido nos botões.
4. **Validação de Sintaxe em Node.js:** Todo arquivo de motor matemático ou coach deve ser validado via `node -e` antes de deploy.
