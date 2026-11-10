/**
 * Calc Coffee - Main Application Controller
 */

(function () {
  "use strict";

  // Estado global do aplicativo
  const state = {
    activeTab: "brew",
    presetMode: "custom", // 'custom' ou 'champions'
    selectedChampion: "tetsu-4-6",
    currentRecipe: null,
    lastCompletedBrew: null,
    inputs: {
      method: "V60",
      profile: "classico",
      water: 300,
      ratio: "1:15",
      grind: "medium",
      roast: "medium",
      freshness: "rested"
    }
  };

  /* ===================================================
     INICIALIZAÇÃO DO APLICATIVO
  =================================================== */

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initBrewControls();
    initTimerBridge();
    initCoachEvents();
    initStoreView();
    initPWA();

    // Primeira geração da receita
    recalculate();
  });

  /* ===================================================
     NAVEGAÇÃO POR ABAS (SPA ZERO SCROLL)
  =================================================== */

  function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", () => {
        const tab = item.dataset.tab;
        switchTab(tab);
      });
    });
  }

  function switchTab(tabId) {
    state.activeTab = tabId;

    // Atualiza classes ativas da barra inferior
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.tab === tabId);
    });

    // Alterna visualização das views
    document.querySelectorAll(".view-section").forEach(view => {
      view.classList.toggle("active", view.id === `view-${tabId}`);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Ações ao entrar em abas específicas
    if (tabId === "coach") {
      renderHistoryList();
    } else if (tabId === "store") {
      renderProducts("all");
    }
  }

  /* ===================================================
     CONTROLES DA CALCULADORA DE PREPARO
  =================================================== */

  function initBrewControls() {
    // Alternância Personalizado vs Campeões
    const btnCustom = document.getElementById("tab-mode-custom");
    const btnChamps = document.getElementById("tab-mode-champions");
    const customSection = document.getElementById("section-custom-params");
    const champsSection = document.getElementById("section-champions-params");

    if (btnCustom && btnChamps) {
      btnCustom.addEventListener("click", () => {
        state.presetMode = "custom";
        btnCustom.classList.add("active");
        btnChamps.classList.remove("active");
        customSection.style.display = "block";
        champsSection.style.display = "none";
        recalculate();
      });

      btnChamps.addEventListener("click", () => {
        state.presetMode = "champions";
        btnChamps.classList.add("active");
        btnCustom.classList.remove("active");
        customSection.style.display = "none";
        champsSection.style.display = "block";
        recalculate();
      });
    }

    // Seleção de Campeões
    const champCards = document.querySelectorAll(".champion-card-item");
    champCards.forEach(card => {
      card.addEventListener("click", () => {
        champCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        state.selectedChampion = card.dataset.champId;
        recalculate();
      });
    });

    // Seleção de métodos com aplicação dinâmica dos parâmetros ideais (presets do método)
    const methodCards = document.querySelectorAll(".method-card");
    const waterInput = document.getElementById("input-water");
    const waterDisplay = document.getElementById("water-display-val");
    const ratioSelect = document.getElementById("select-ratio");
    const profileSelect = document.getElementById("select-profile");

    methodCards.forEach(card => {
      card.addEventListener("click", () => {
        methodCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        const methodKey = card.dataset.method;
        state.inputs.method = methodKey;

        // Carrega e aplica os parâmetros ideais recomendados do método
        const defaults = CoffeeEngine.getMethodDefaults(methodKey);
        state.inputs.water = defaults.water;
        state.inputs.ratio = defaults.ratio;
        state.inputs.grind = defaults.grind;
        state.inputs.profile = defaults.profile;

        if (waterInput) waterInput.value = defaults.water;
        if (waterDisplay) waterDisplay.innerText = `${defaults.water} ml`;
        if (ratioSelect) ratioSelect.value = defaults.ratio;
        if (profileSelect) profileSelect.value = defaults.profile;

        // Atualiza os chips de moagem
        document.querySelectorAll("#chips-grind .chip").forEach(chip => {
          chip.classList.toggle("active", chip.dataset.value === defaults.grind);
        });

        // Atualiza o banner explicativo da física do método
        const bannerTitle = document.getElementById("method-physics-title");
        const bannerDesc = document.getElementById("method-physics-desc");
        if (bannerTitle) bannerTitle.innerText = `${defaults.name}:`;
        if (bannerDesc) bannerDesc.innerText = defaults.description;

        recalculate();
      });
    });

    // Volume de água com botões rápidos (+50, 200, 300, 500)
    if (waterInput) {
      waterInput.addEventListener("input", (e) => {
        state.inputs.water = Number(e.target.value) || 300;
        if (waterDisplay) waterDisplay.innerText = `${state.inputs.water} ml`;
        recalculate();
      });
    }

    document.querySelectorAll(".stepper-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.water;
        if (val.startsWith("+")) {
          state.inputs.water = (Number(state.inputs.water) || 300) + Number(val.replace("+", ""));
        } else {
          state.inputs.water = Number(val);
        }
        if (waterInput) waterInput.value = state.inputs.water;
        if (waterDisplay) waterDisplay.innerText = `${state.inputs.water} ml`;
        recalculate();
      });
    });

    // Proporção (Ratio)
    if (ratioSelect) {
      ratioSelect.addEventListener("change", (e) => {
        state.inputs.ratio = e.target.value;
        recalculate();
      });
    }

    // Perfil sensorial
    if (profileSelect) {
      profileSelect.addEventListener("change", (e) => {
        state.inputs.profile = e.target.value;
        recalculate();
      });
    }

    // Moagem (Chips)
    document.querySelectorAll("#chips-grind .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#chips-grind .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.inputs.grind = chip.dataset.value;
        recalculate();
      });
    });

    // Torra (Chips)
    document.querySelectorAll("#chips-roast .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#chips-roast .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.inputs.roast = chip.dataset.value;
        recalculate();
      });
    });

    // Frescor (Chips)
    document.querySelectorAll("#chips-freshness .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#chips-freshness .chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.inputs.freshness = chip.dataset.value;
        recalculate();
      });
    });

    // Botão Principal: Iniciar Extração na Bancada
    const btnStart = document.getElementById("btn-start-bench");
    if (btnStart) {
      btnStart.addEventListener("click", () => {
        loadAndLaunchTimer();
      });
    }
  }

  /**
   * Recalcula a receita instantaneamente e atualiza o resumo
   */
  function recalculate() {
    let payload;
    if (state.presetMode === "champions") {
      payload = {
        championId: state.selectedChampion,
        water: state.inputs.water
      };
    } else {
      payload = {
        ...state.inputs
      };
    }

    state.currentRecipe = CoffeeEngine.calculateRecipe(payload);
    renderSummary(state.currentRecipe);
  }

  function renderSummary(recipe) {
    const elCoffee = document.getElementById("sum-coffee");
    const elTemp = document.getElementById("sum-temp");
    const elBloom = document.getElementById("sum-bloom");
    const elPours = document.getElementById("sum-pours");
    const elTotalTime = document.getElementById("sum-time");
    const elMethodName = document.getElementById("sum-method-name");
    const elNotes = document.getElementById("sum-notes");

    if (elCoffee) elCoffee.innerText = recipe.coffee;
    if (elTemp) elTemp.innerText = `${recipe.temperature}°C`;
    if (elBloom) elBloom.innerText = `${recipe.bloom.water}ml (${recipe.bloom.time}s)`;
    if (elPours) elPours.innerText = recipe.pours.length;
    if (elTotalTime) {
      const m = Math.floor(recipe.totalTime / 60);
      const s = recipe.totalTime % 60;
      elTotalTime.innerText = `${m}:${s.toString().padStart(2, "0")}`;
    }
    if (elMethodName) {
      if (recipe.isChampion) {
        elMethodName.innerHTML = `${recipe.profileName} <span style="font-size: 11px; font-weight: 600; color: var(--coffee-terracotta); background: var(--coffee-terracotta-soft); padding: 2px 8px; border-radius: var(--radius-full); margin-left: 6px;">${recipe.methodName}</span>`;
      } else {
        elMethodName.innerText = recipe.methodName;
      }
    }
    if (elNotes) elNotes.innerText = recipe.sensoryNotes;
  }

  /* ===================================================
     INTEGRAÇÃO COM O CRONÔMETRO (MODO BANCADA)
  =================================================== */

  function initTimerBridge() {
    const btnPlayPause = document.getElementById("timer-btn-play");
    const btnSkip = document.getElementById("timer-btn-skip");
    const btnReset = document.getElementById("timer-btn-reset");
    const btnTestVoice = document.getElementById("btn-test-voice");
    const selectAudioMode = document.getElementById("select-audio-mode");
    if (selectAudioMode) {
      selectAudioMode.addEventListener("change", (e) => {
        BrewTimer.setAudioMode(e.target.value);
      });
    }

    if (btnTestVoice) {
      btnTestVoice.addEventListener("click", () => {
        BrewTimer.playVoicePreview();
      });
    }

    if (btnPlayPause) {
      btnPlayPause.addEventListener("click", () => {
        const timerState = BrewTimer.getState();
        if (timerState.isRunning) {
          BrewTimer.pause();
          btnPlayPause.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Continuar Extração</span>
          `;
        } else {
          BrewTimer.start();
          btnPlayPause.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
            <span>Pausar</span>
          `;
        }
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener("click", () => {
        BrewTimer.skipToNextStep();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        BrewTimer.stop();
        if (btnPlayPause) {
          btnPlayPause.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Iniciar Cronômetro</span>
          `;
        }
      });
    }

    // Listener de renderização do timer
    BrewTimer.setRenderListener((data) => {
      renderTimerUI(data);
    });
  }

  function loadAndLaunchTimer() {
    if (!state.currentRecipe) recalculate();

    BrewTimer.load(state.currentRecipe, (completedSession) => {
      state.lastCompletedBrew = completedSession;
      onBrewCompleted(completedSession);
    });

    if (window.CoffeeAnalytics) {
      CoffeeAnalytics.trackBrewStart({
        method: state.currentRecipe.methodName,
        water: state.currentRecipe.water,
        coffee: state.currentRecipe.coffee,
        ratio: state.currentRecipe.ratio,
        isChampion: !!state.currentRecipe.isChampion
      });
    }

    switchTab("timer");

    // Prepara botão de play
    const btnPlayPause = document.getElementById("timer-btn-play");
    if (btnPlayPause) {
      btnPlayPause.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <span>Começar Extração</span>
      `;
    }

    // Atualiza nome do método no header do timer
    const elTimerMethod = document.getElementById("timer-method-badge");
    if (elTimerMethod) {
      const displayName = state.currentRecipe.isChampion 
        ? `${state.currentRecipe.profileName} (${state.currentRecipe.methodName})`
        : state.currentRecipe.methodName;
      elTimerMethod.innerText = `${displayName} • ${state.currentRecipe.water}ml (${state.currentRecipe.ratio})`;
    }
  }

  function renderTimerUI(data) {
    const elClock = document.getElementById("timer-clock");
    const elTargetNumber = document.getElementById("timer-target-water");
    const elTargetSub = document.getElementById("timer-target-sub");
    const elStepBadge = document.getElementById("timer-step-badge");
    const elProgressBar = document.getElementById("timer-progress-bar");
    const elStepsChecklist = document.getElementById("timer-steps-checklist");
    const elWakePill = document.getElementById("wakelock-pill");

    if (elClock) elClock.innerText = data.elapsedFormatted;
    if (elProgressBar) elProgressBar.style.width = `${data.progress}%`;

    if (elWakePill) {
      elWakePill.classList.toggle("active", data.isRunning);
    }

    if (data.currentStep) {
      if (elTargetNumber) elTargetNumber.innerHTML = `${data.currentStep.targetTotal} <span>ml</span>`;
      if (elTargetSub) elTargetSub.innerText = `+${data.currentStep.added} ml neste passo`;
      if (elStepBadge) elStepBadge.innerText = `${data.currentStep.label} (${data.currentStepIndex + 1}/${data.totalSteps})`;
    }

    // Renderiza lista de passos com status ativo/concluído
    if (elStepsChecklist && data.steps) {
      elStepsChecklist.innerHTML = data.steps.map(step => `
        <div class="step-row ${step.isActive ? "active" : ""} ${step.isDone ? "done" : ""}">
          <div class="step-row-left">
            <div class="step-indicator">
              ${step.isDone ? "✓" : (step.isBloom ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>` : step.pourNumber)}
            </div>
            <div>
              <strong>${step.label}</strong>
              <div style="font-size: 11px; color: var(--text-secondary);">${step.subtitle}</div>
            </div>
          </div>
          <div style="font-weight: 800; color: var(--accent-gold);">
            ${step.targetTotal} ml
          </div>
        </div>
      `).join("");
    }
  }

  /**
   * Chamado quando o cronômetro finaliza com sucesso
   */
  function onBrewCompleted(completedSession) {
    if (window.CoffeeAnalytics) {
      CoffeeAnalytics.trackBrewFinish({
        method: completedSession?.recipe?.methodName,
        completedAt: completedSession?.completedAt
      });
    }

    // Abre a aba do Copiloto IA para avaliação sensorial
    switchTab("coach");

    // Mostra seção de avaliação e rola até ela
    const feedbackBox = document.getElementById("coach-feedback-box");
    if (feedbackBox) {
      feedbackBox.style.display = "block";
    }

    const diagnosisContainer = document.getElementById("coach-diagnosis-container");
    if (diagnosisContainer) {
      diagnosisContainer.innerHTML = "";
    }
  }

  /* ===================================================
     COPILOTO IA & DIAL-IN COACH
  =================================================== */

  function initCoachEvents() {
    // Tags sensoriais de avaliação de 1 clique
    const tags = document.querySelectorAll(".feedback-tag");
    tags.forEach(tag => {
      tag.addEventListener("click", () => {
        tags.forEach(t => t.classList.remove("selected"));
        tag.classList.add("selected");

        const feedbackKey = tag.dataset.feedback;
        runAIDiagnosis(feedbackKey);
      });
    });
  }

  function runAIDiagnosis(feedbackKey) {
    const recipe = state.lastCompletedBrew?.recipe || state.currentRecipe;
    const actualTime = state.lastCompletedBrew?.actualTime || recipe.totalTime;
    const diagnosis = DialInCoach.diagnose(feedbackKey, recipe, { actualTime });

    if (window.CoffeeAnalytics) {
      CoffeeAnalytics.trackFeedback(feedbackKey, recipe.methodName);
    }

    // Salva automaticamente no histórico
    DialInCoach.saveToHistory({
      method: recipe.methodName,
      water: recipe.water,
      coffee: recipe.coffee,
      ratio: recipe.ratio,
      score: feedbackKey === "perfect" ? "5 Estrelas" : "Calibrando",
      feedbackKey: feedbackKey,
      feedbackTitle: diagnosis.title,
      diagnosis: diagnosis
    });

    renderDiagnosisCard(diagnosis, recipe);
    renderHistoryList();
  }

  function renderDiagnosisCard(diag, recipe) {
    const container = document.getElementById("coach-diagnosis-container");
    if (!container) return;

    const narrativeHtml = diag.diagnosisNarrative
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    container.innerHTML = `
      <div class="ai-diagnosis-card">
        <div class="ai-badge">${diag.badge}</div>
        <h3 class="ai-diagnosis-title">${diag.title}</h3>

        <p class="ai-explanation">
          ${narrativeHtml}
        </p>

        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px; padding: 10px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm); border-left: 3px solid var(--coffee-terracotta);">
          <strong>Fundamento Físico-Químico:</strong> ${diag.chemicalExplanation}
        </div>

        <div class="adjustment-list">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--coffee-terracotta); font-weight: 800; margin-bottom: 8px; letter-spacing: 0.05em;">
            Prescrição de Calibração para a Próxima Xícara:
          </div>
          ${diag.adjustments.map(adj => `
            <div class="adjustment-item">
              <span class="adj-param">${adj.param}</span>
              <span class="adj-action">${adj.action}</span>
              <span class="adj-reason">${adj.technicalReason}</span>
            </div>
          `).join("")}
        </div>

        ${diag.recommendedGear ? `
          <div class="context-gear-box">
            <div class="gear-info">
              <h4>💡 Dica Técnica de Equipamento: ${diag.recommendedGear.name}</h4>
              <p>${diag.recommendedGear.desc}</p>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderHistoryList() {
    const container = document.getElementById("history-list-container");
    if (!container) return;

    const list = DialInCoach.getHistory();
    if (!list || list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 10px; color: var(--text-secondary); font-size: 13px;">
          Nenhum preparo salvo ainda.<br>Faça sua primeira extração e avalie o café para registrar a evolução!
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="history-card">
        <div>
          <div class="history-method">${item.method} • ${item.water}ml (${item.coffee}g)</div>
          <div class="history-meta">${item.date} • ${item.feedbackTitle || "Preparo"}</div>
        </div>
        <span class="history-score ${item.feedbackKey === "perfect" ? "score-perfect" : "score-issue"}">
          ${item.feedbackKey === "perfect" ? "★ Perfeito" : "Ajustado"}
        </span>
      </div>
    `).join("");
  }

  /* ===================================================
     CURADORIA & SHOPPING (AFILIADOS & PARCERIAS)
  =================================================== */

  function initStoreView() {
    document.querySelectorAll(".shop-category-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".shop-category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts(btn.dataset.category);
      });
    });
  }

  function renderProducts(category) {
    const container = document.getElementById("products-feed");
    if (!container) return;

    const products = CoffeeStore.getProducts(category);

    container.innerHTML = products.map(prod => `
      <div class="product-card">
        <div class="product-header">
          <div>
            <span class="product-tag">${prod.badge}</span>
            <h3 class="product-title">${prod.title}</h3>
            <div class="product-roaster">${prod.roaster} • ${prod.sca}</div>
          </div>
        </div>
        <div class="product-notes">
          <strong>Notas Sensoriais:</strong> ${prod.notes}
        </div>
        <div class="product-footer">
          <div>
            <div class="product-price">${prod.price}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${prod.package} • Cupom: <strong style="color: var(--accent-gold);">${prod.coupon}</strong></div>
          </div>
          <a href="${prod.link}" target="_blank" rel="noopener noreferrer" class="btn-buy" onclick="if (window.CoffeeAnalytics) CoffeeAnalytics.trackAffiliateClick('${prod.id}', '${prod.partner}')">
            Comprar / Ver Oferta →
          </a>
        </div>
      </div>
    `).join("");
  }

  /* ===================================================
     PWA SERVICE WORKER & INSTALAÇÃO
  =================================================== */

  function initPWA() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").then((reg) => {
        // Força checagem imediata de versão atualizada
        reg.update();
      }).catch(err => {
        console.warn("ServiceWorker registration:", err);
      });
    }

    let deferredPrompt;
    const installBanner = document.getElementById("pwa-install-banner");
    const installBtn = document.getElementById("btn-install-pwa");

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBanner) installBanner.style.display = "block";
    });

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          if (installBanner) installBanner.style.display = "none";
        }
        deferredPrompt = null;
      });
    }
  }

  // API pública
  window.CalcApp = {
    switchTab,
    openStoreCategory: (cat) => {
      switchTab("store");
      const btn = document.querySelector(`.shop-category-btn[data-category="${cat}"]`);
      if (btn) btn.click();
    }
  };

})();
