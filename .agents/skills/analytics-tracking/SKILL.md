---
name: analytics-tracking
description: Mapeamento de taxonomia de telemetria anônima, eventos de preparo, conclusões de receita e cliques de conversão e afiliação.
---

# Skill: Analytics & Telemetry Tracking

Esta skill define a arquitetura de telemetria anônima do produto, respeitando a LGPD e privacidade offline-first.

## Eventos Mapeados
1. `brew_started`: Disparado quando o usuário inicia o cronômetro (atributos: `method`, `water_ml`, `ratio`, `preset_type`).
2. `brew_completed`: Disparado quando o tempo de extração é concluído com sucesso.
3. `sensory_feedback`: Disparado ao avaliar o café no Copiloto IA (atributos: `feedback_key` [bitter, sour, channeling, weak, perfect]).
4. `affiliate_clicked`: Disparado quando o usuário clica em um produto da curadoria (atributos: `product_id`, `category`, `partner`).

## Privacidade
- Nenhum dado pessoal identificável (PII), e-mail, IP ou nome é transmitido.
- Os eventos são armazenados em buffer local e enviados apenas de forma anônima e agregada.
