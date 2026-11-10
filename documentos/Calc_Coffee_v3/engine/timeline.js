window.Timeline = (function () {

  let steps = [];
  let interval = null;

  let startTime = null;
  let totalTime = 0;

  let isRunning = false;
  let isFinished = false;
  let isFinalized = false;

  const overtimeLimit = 60;

  /* =========================
     Time Helpers
  ========================= */

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /* =========================
     Engine Conversion
  ========================= */

  function fromEngine(recipe) {

    const parsedSteps = [];

    if (recipe.bloom) {

      parsedSteps.push({
        label: "Pré-infusão",
        start: 0,
        end: recipe.bloom.time,
        added: recipe.bloom.water,
        total: recipe.bloom.water,
        bloom: true
      });
    }

    recipe.pours.forEach((pour, index) => {

      parsedSteps.push({
        label: `Despejo ${index + 1}`,
        start: pour.start,
        end: pour.end,
        added: pour.added,
        total: pour.water,
        bloom: false
      });
    });

    return parsedSteps;
  }

  /* =========================
     SVG Icons
  ========================= */

  function icon(name) {

    const icons = {

      method: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 6h16"/>
          <path d="M6 6l2 12h8l2-12"/>
          <path d="M10 18h4"/>
        </svg>
      `,

      profile: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 4c4 4 4 12 0 16"/>
        </svg>
      `,

      freshness: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 3C8 8 6 11 6 14a6 6 0 0012 0c0-3-2-6-6-11z"/>
        </svg>
      `,

      water: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 3C8 8 6 11 6 14a6 6 0 0012 0c0-3-2-6-6-11z"/>
        </svg>
      `,

      coffee: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M8 3h8v4H8z"/>
          <path d="M6 7h12l-1 10H7z"/>
        </svg>
      `,

      grind: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="7" y="3" width="10" height="5"/>
          <rect x="6" y="8" width="12" height="10"/>
        </svg>
      `,

      temp: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 14V5"/>
          <circle cx="12" cy="17" r="3"/>
        </svg>
      `,

      bloom: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 3C8 8 6 11 6 14a6 6 0 0012 0c0-3-2-6-6-11z"/>
        </svg>
      `,

      clock: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 2"/>
        </svg>
      `
    };

    return icons[name] || "";
  }

  /* =========================
     Recipe Summary
  ========================= */

  function summary(recipe) {

    const freshnessMap = {
      fresh: "fresco",
      rested: "descansado",
      old: "velho"
    };

    return `
      <div class="recipe-summary">

        <div class="summary-title">
          Resumo da Receita
        </div>

        <div class="summary-grid">

          <div class="summary-item">
            <div class="summary-icon">${icon("method")}</div>

            <div>
              <div class="summary-label">Método</div>
              <div class="summary-value">${recipe.method}</div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("profile")}</div>

            <div>
              <div class="summary-label">Perfil</div>
              <div class="summary-value">${recipe.profile}</div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("freshness")}</div>

            <div>
              <div class="summary-label">Frescor</div>

              <div class="summary-value">
                ${freshnessMap[recipe.freshness] || recipe.freshness}
              </div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("water")}</div>

            <div>
              <div class="summary-label">Água</div>
              <div class="summary-value">${recipe.water} ml</div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("coffee")}</div>

            <div>
              <div class="summary-label">Café</div>
              <div class="summary-value">${recipe.coffee} g</div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("grind")}</div>

            <div>
              <div class="summary-label">Moagem</div>
              <div class="summary-value">${recipe.grind}</div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("temp")}</div>

            <div>
              <div class="summary-label">Temperatura</div>
              <div class="summary-value">${recipe.temperature}°C</div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("bloom")}</div>

            <div>
              <div class="summary-label">Bloom</div>
              <div class="summary-value">${recipe.bloom.water} ml</div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("clock")}</div>

            <div>
              <div class="summary-label">Tempo Bloom</div>

              <div class="summary-value">
                ${formatTime(recipe.bloom.time)}
              </div>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">${icon("water")}</div>

            <div>
              <div class="summary-label">Despejos</div>
              <div class="summary-value">${recipe.pours.length}</div>
            </div>
          </div>

          <div class="summary-item summary-item-full">
            <div class="summary-icon">${icon("clock")}</div>

            <div>
              <div class="summary-label">Tempo total</div>

              <div class="summary-value">
                ${formatTime(recipe.totalTime)}
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  /* =========================
     Extraction Header
  ========================= */

  function extractionHeader() {

    return `
      <div class="recipe-summary">

        <div class="step-header">

          <div class="step-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 3C8 8 6 11 6 14a6 6 0 0012 0c0-3-2-6-6-11z"/>
            </svg>
          </div>

          <div>
            <div class="step-title">Extração</div>

            <div class="step-subtitle">
              acompanhe sua extração passo a passo
            </div>
          </div>

        </div>

      </div>
    `;
  }

  /* =========================
     Timeline Render
  ========================= */

  function render(containerId, recipe) {

    stop();

    const container =
      document.getElementById(containerId);

    steps = fromEngine(recipe);

    totalTime = recipe.totalTime;

    container.innerHTML = `

      ${extractionHeader()}

      <div class="timeline">

        ${steps.map((step, index) => `

          <div
            class="step ${step.bloom ? "bloom-step" : ""}"
            data-index="${index}"
          >

            <div class="step-left">

              <strong>${step.label}</strong>

              <div class="step-description">
                ${formatTime(step.start)}
                —
                ${formatTime(step.end)}
              </div>

            </div>

            <div class="step-dot"></div>

            <div class="step-right">

				<strong class="${step.bloom ? "" : "added-water"}">
				  ${step.bloom ? "" : "+"}${step.added} ml
				</strong>

				<div class="step-total">
				  Total ${step.total} ml
				</div>

            </div>

          </div>

        `).join("")}

      </div>

      <div class="timeline-clock" id="timeline-clock">
        0:00
      </div>

      <div class="progress-bar">
        <div id="progress-fill"></div>
      </div>

      <button
        id="timeline-btn"
        class="button mt-md"
        onclick="Timeline.toggle()"
      >
        ▶ Iniciar preparo
      </button>
    `;
  }

  /* =========================
     Timeline Loop
  ========================= */

  function runLoop() {

    const clockEl =
      document.getElementById("timeline-clock");

    interval = setInterval(() => {

      if (!isRunning) return;

      const elapsed =
        (Date.now() - startTime) / 1000;

      const sec = Math.floor(elapsed);

      clockEl.innerText = formatTime(sec);

      const progress =
        Math.min(elapsed / totalTime, 1) * 100;

      document.getElementById("progress-fill").style.width =
        `${progress}%`;

      steps.forEach((step, index) => {

        const el = document.querySelector(
          `.step[data-index="${index}"]`
        );

        if (!el) return;

        if (elapsed < step.start) {

          el.classList.remove("active", "done");

        } else if (elapsed <= step.end) {

          el.classList.add("active");
          el.classList.remove("done");

        } else {

          el.classList.remove("active");
          el.classList.add("done");
        }
      });

      if (elapsed >= totalTime && !isFinished) {

        isFinished = true;

        clockEl.classList.add("over");
      }

      if (
        elapsed >= totalTime + overtimeLimit &&
        !isFinalized
      ) {
        finalize(true);
      }

    }, 100);
  }

  /* =========================
     Timeline Start
  ========================= */

  function start() {

    clearInterval(interval);

    startTime = Date.now();

    isRunning = true;
    isFinished = false;
    isFinalized = false;

    const btn =
      document.getElementById("timeline-btn");

    btn.innerText = "Finalizar";

    document
      .getElementById("timeline-clock")
      .classList.remove("over");

    runLoop();
  }

  /* =========================
     Timeline Finalization
  ========================= */

  function finalize() {

    if (!isRunning || isFinalized) return;

    stop();

    isFinalized = true;

    const btn =
      document.getElementById("timeline-btn");

    btn.innerText = "Refazer receita";

    btn.disabled = false;

    btn.onclick = () => location.reload();
  }

  /* =========================
     Timeline Stop
  ========================= */

  function stop() {

    clearInterval(interval);

    interval = null;

    isRunning = false;
  }

  /* =========================
     Timeline Toggle
  ========================= */

  function toggle() {

    if (isFinalized) return;

    if (!isRunning) {
      start();
    } else {
      finalize();
    }
  }

  /* =========================
     Summary Render
  ========================= */

  function renderSummary(containerId, recipe) {

    const container =
      document.getElementById(containerId);

    container.innerHTML = summary(recipe);
  }

  return {
    render,
    renderSummary,
    toggle
  };

})();