/**
 * Calc Coffee - Telemetria e Analytics Anônimo (Privacy-First)
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CoffeeAnalytics = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  const STORAGE_KEY = "calc_coffee_telemetry_events";

  function logEvent(eventName, payload = {}) {
    const event = {
      event: eventName,
      timestamp: Date.now(),
      isoDate: new Date().toISOString(),
      properties: payload
    };

    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        const list = stored ? JSON.parse(stored) : [];
        list.push(event);
        // Mantém no máximo 100 eventos no buffer local
        const trimmed = list.slice(-100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      }
    } catch (e) {
      console.warn("Analytics buffer error:", e);
    }

    console.log(`[📊 Telemetria Calc Coffee] ${eventName}:`, payload);
  }

  return {
    trackBrewStart: (data) => logEvent("brew_started", data),
    trackBrewFinish: (data) => logEvent("brew_completed", data),
    trackFeedback: (feedbackKey, method) => logEvent("sensory_feedback", { feedbackKey, method }),
    trackAffiliateClick: (productId, partner) => logEvent("affiliate_clicked", { productId, partner }),
    getEvents: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
  };
});
