/**
 * Calc Coffee — Controle de Autoatendimento de Dados Locais (Art. 18, VI da LGPD)
 * Remove exclusivamente as chaves locais pertencentes ao aplicativo Calc Coffee.
 */
(function initPrivacyControls() {
  "use strict";

  const APP_STORAGE_KEYS = Object.freeze([
    "calc_coffee_history_v1",
    "calc_coffee_telemetry_events"
  ]);

  function clearAppLocalData() {
    let removedCount = 0;

    try {
      for (const key of APP_STORAGE_KEYS) {
        if (window.localStorage.getItem(key) !== null) {
          window.localStorage.removeItem(key);
          removedCount += 1;
        }
      }
      return { success: true, removedCount };
    } catch {
      return { success: false, removedCount };
    }
  }

  function bindControls() {
    const clearButton = document.getElementById("btn-privacy-clear-local-data");
    const statusElement = document.getElementById("privacy-clear-status");

    if (!clearButton || !statusElement) return;

    clearButton.addEventListener("click", () => {
      const result = clearAppLocalData();
      if (!result.success) {
        statusElement.textContent = "Não foi possível acessar o armazenamento local deste navegador.";
        return;
      }

      statusElement.textContent = result.removedCount > 0
        ? "Dados locais do Calc Coffee removidos com sucesso deste dispositivo."
        : "Nenhum dado local do Calc Coffee estava armazenado neste navegador.";
    });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", bindControls);
  }
})();
