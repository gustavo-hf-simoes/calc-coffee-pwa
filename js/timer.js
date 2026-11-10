/**
 * Calc Coffee - Live Brew Timer (Modo Bancada)
 * Cronômetro interativo com áudio acústico harmônico, síntese de voz neural humanizada e Wake Lock
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BrewTimer = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  let currentRecipe = null;
  let steps = [];
  let currentStepIndex = 0;
  let startTime = null;
  let elapsedBeforePause = 0;
  let timerInterval = null;
  let isRunning = false;
  let isPaused = false;
  let wakeLock = null;
  let audioCtx = null;
  let onFinishCallback = null;
  
  // Modos de áudio: 'voice-chime' (voz + sino), 'chime-only' (apenas sino acústico), 'silent' (mudo)
  let audioMode = "voice-chime";
  let naturalVoice = null;
  let currentAudio = null;

  /**
   * Toca arquivo de áudio neural humanizado de barista (MP3 de alta definição)
   * Se indisponível, recorre ao sintetizador de voz (Web Speech API)
   */
  function playHumanVoice(filename, fallbackText) {
    if (audioMode !== "voice-chime") return;

    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }

    try {
      const audio = new Audio(`audio/${filename}`);
      audio.preload = "auto";
      currentAudio = audio;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Áudio neural MP3 bloqueado ou não carregado, usando fallback Web Speech:", err);
          if (fallbackText) speak(fallbackText);
        });
      }
    } catch (e) {
      if (fallbackText) speak(fallbackText);
    }
  }

  function getAudioClipForStep(step, isLastStep) {
    if (step.isBloom) return "bloom.mp3";
    if (isLastStep) return "last_pour.mp3";
    if (step.pourNumber === 1) return "pour_1.mp3";
    if (step.pourNumber === 2) return "pour_2.mp3";
    if (step.pourNumber === 3) return "pour_3.mp3";
    if (step.pourNumber === 4) return "pour_4.mp3";
    return "pour_5.mp3";
  }

  function playStepInstruction(step, isLastStep = false) {
    playStepAlert();
    if (audioMode !== "voice-chime") return;

    const clipFile = getAudioClipForStep(step, isLastStep);
    const instructionText = getBaristaInstruction(step, isLastStep);

    // Pausa elegante de 320ms para o gongo harmônico soar com clareza antes da voz
    setTimeout(() => {
      playHumanVoice(clipFile, instructionText);
    }, 320);
  }

  /**
   * Inicializa e desbloqueia o contexto de áudio em navegadores e WebViews Android/iOS
   */
  function initAudio() {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    } catch (e) {
      console.warn("Web Audio API indisponível:", e);
    }
  }

  function unlockAudio() {
    initAudio();
    if (typeof window !== "undefined" && !window._audioUnlocked) {
      try {
        const dummy = new Audio();
        dummy.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
        dummy.play().then(() => {
          window._audioUnlocked = true;
        }).catch(() => {});
      } catch (e) {}
    }
  }

  /**
   * Sino Acústico Harmônico (Tibetan Bowl / Brass Chime)
   * Usa múltiplos parciais com decaimento exponencial orgânico
   */
  function playAcousticChime(freq = 523.25, duration = 0.9) {
    if (audioMode === "silent") return;
    try {
      initAudio();
      if (!audioCtx) return;

      const t = audioCtx.currentTime;

      // Parcial Fundamental (corpo do sino)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, t);

      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(0.25, t + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);

      // Segundo Parcial Harmônico (ressonância e brilho acústico)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2.008, t); // Leve batimento natural

      gain2.gain.setValueAtTime(0.001, t);
      gain2.gain.linearRampToValueAtTime(0.08, t + 0.012);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + (duration * 0.7));

      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration);
      osc2.stop(t + duration);
    } catch (e) {
      console.warn("Erro ao emitir sino acústico:", e);
    }
  }

  function playStepAlert() {
    playAcousticChime(523.25, 0.7); // C5
    setTimeout(() => playAcousticChime(659.25, 1.0), 120); // E5
  }

  function playFinishFanfare() {
    playAcousticChime(523.25, 0.6); // C5
    setTimeout(() => playAcousticChime(659.25, 0.6), 180); // E5
    setTimeout(() => playAcousticChime(783.99, 0.8), 360); // G5
    setTimeout(() => playAcousticChime(1046.50, 1.4), 560); // C6
  }

  /**
   * Localiza a melhor voz neural/natural em português do Brasil
   * Prioriza vozes neurais de alta fidelidade (iOS Enhanced/Luciana e Android Google Wavenet/Neural)
   */
  function getBestNaturalVoice() {
    if (naturalVoice) return naturalVoice;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const ptVoices = voices.filter(v => {
      const l = (v.lang || "").toLowerCase().replace("_", "-");
      return l === "pt-br" || l === "pt";
    });

    if (ptVoices.length === 0) return null;

    // 1. Vozes Premium/Enhanced/Neural/Natural em pt-BR
    const premiumVoice = ptVoices.find(v => 
      /natural|neural|online|premium|enhanced/i.test(v.name)
    );
    if (premiumVoice) {
      naturalVoice = premiumVoice;
      return naturalVoice;
    }

    // 2. Vozes conhecidas de alta fidelidade (Google pt-BR, Luciana da Apple, Francisca da Microsoft)
    const knownNaturalVoice = ptVoices.find(v =>
      /google|luciana|francisca|antonio|yara|leticia/i.test(v.name)
    );
    if (knownNaturalVoice) {
      naturalVoice = knownNaturalVoice;
      return naturalVoice;
    }

    // 3. Fallback para a primeira voz pt-BR disponível
    naturalVoice = ptVoices.find(v => (v.lang || "").toLowerCase().includes("br")) || ptVoices[0];
    return naturalVoice;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      naturalVoice = null;
      getBestNaturalVoice();
    };
  }

  /**
   * Constrói frases naturais com tom de barista profissional perfeitamente sincronizadas com a tela
   */
  function getBaristaInstruction(step, isLastStep = false) {
    if (step.isBloom) {
      return `Inicie a pré-infusão com calma. Despeje ${step.targetTotal} ml em círculos lentos para abrir os aromas do café.`;
    }
    if (step.pourNumber === 1) {
      return `Primeiro despejo. Despeje com fluxo constante até atingir ${step.targetTotal} ml na balança.`;
    }
    if (step.pourNumber === 2) {
      return `Segundo despejo. Controle o nível da água suavemente até atingir ${step.targetTotal} ml.`;
    }
    if (step.pourNumber === 3) {
      return `Terceiro despejo. Mantenha o ritmo calmo até atingir ${step.targetTotal} ml.`;
    }
    if (step.pourNumber === 4) {
      return `Quarto despejo. Conduza o fluxo até atingir ${step.targetTotal} ml.`;
    }
    return `Despejo número ${step.pourNumber}. Continue até atingir ${step.targetTotal} ml na balança.`;
  }

  /**
   * Fala a instrução em português com prosódia e ritmo humanizados
   */
  function speak(text) {
    if (audioMode !== "voice-chime" || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      
      const bestVoice = getBestNaturalVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Parâmetros de prosódia humana calma
      utterance.rate = 0.90; // Ritmo pausado e tranquilo de cafeteria
      utterance.pitch = 0.96; // Tom mais quente e aveludado
      utterance.volume = 0.95;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Falha no sintetizador de voz:", e);
    }
  }

  /**
   * Solicita Wake Lock para a tela não apagar na bancada
   */
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {
          wakeLock = null;
        });
      }
    } catch (e) {
      console.warn("WakeLock não suportado ou bloqueado:", e);
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  }

  /**
   * Converte a receita calculada em passos sequenciais
   */
  function buildSteps(recipe) {
    const list = [];

    // Passo 0: Pré-infusão (Bloom)
    list.push({
      index: 0,
      pourNumber: 0,
      label: "Pré-infusão (Bloom)",
      subtitle: "Umedeça todo o pó em espiral para liberar os gases (CO₂)",
      start: 0,
      end: recipe.bloom.time,
      duration: recipe.bloom.time,
      added: recipe.bloom.water,
      targetTotal: recipe.bloom.water,
      isBloom: true
    });

    // Passos seguintes: Despejo 1, Despejo 2, etc.
    recipe.pours.forEach((pour, i) => {
      const pourNum = i + 1;
      list.push({
        index: i + 1,
        pourNumber: pourNum,
        label: `Despejo ${pourNum}`,
        subtitle: `Despeje ${pour.added} ml de forma contínua em círculos lentos`,
        start: pour.start,
        end: pour.end,
        duration: pour.duration,
        added: pour.added,
        targetTotal: pour.totalWater,
        isBloom: false
      });
    });

    return list;
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, "0")}`;
  }

  function load(recipe, onFinish) {
    stop();
    currentRecipe = recipe;
    steps = buildSteps(recipe);
    currentStepIndex = 0;
    elapsedBeforePause = 0;
    onFinishCallback = onFinish;
    triggerRender();
  }

  function start() {
    if (isRunning) return;
    unlockAudio();
    requestWakeLock();

    isRunning = true;
    isPaused = false;
    startTime = Date.now() - (elapsedBeforePause * 1000);

    const step = steps[currentStepIndex];
    if (step && elapsedBeforePause === 0) {
      playStepInstruction(step, currentStepIndex === steps.length - 1);
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 100);
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    isPaused = true;
    clearInterval(timerInterval);
    releaseWakeLock();
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function stop() {
    isRunning = false;
    isPaused = false;
    clearInterval(timerInterval);
    releaseWakeLock();
    elapsedBeforePause = 0;
    currentStepIndex = 0;
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    triggerRender();
  }

  function skipToNextStep() {
    if (currentStepIndex < steps.length - 1) {
      currentStepIndex++;
      const nextStep = steps[currentStepIndex];
      elapsedBeforePause = nextStep.start;
      startTime = Date.now() - (elapsedBeforePause * 1000);

      playStepInstruction(nextStep, currentStepIndex === steps.length - 1);
      triggerRender();
    } else {
      finish();
    }
  }

  function finish() {
    const finalElapsed = Math.round(elapsedBeforePause || currentRecipe?.totalTime || 180);
    stop();
    playFinishFanfare();
    if (audioMode === "voice-chime") {
      setTimeout(() => {
        playHumanVoice("finish.mp3", "Extração concluída com sucesso. Aproveite a sua xícara de café especial.");
      }, 420);
    }

    if (typeof onFinishCallback === "function") {
      onFinishCallback({
        recipe: currentRecipe,
        actualTime: finalElapsed,
        completedAt: new Date().toISOString()
      });
    }
  }

  function tick() {
    if (!isRunning) return;

    const elapsed = (Date.now() - startTime) / 1000;
    elapsedBeforePause = elapsed;

    const totalDuration = currentRecipe ? currentRecipe.totalTime : 180;

    const step = steps[currentStepIndex];
    if (step && elapsed >= step.end) {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        const newStep = steps[currentStepIndex];
        playStepInstruction(newStep, currentStepIndex === steps.length - 1);
      } else if (elapsed >= totalDuration) {
        finish();
        return;
      }
    }

    triggerRender();
  }

  let renderListener = null;
  function setRenderListener(fn) {
    renderListener = fn;
  }

  function triggerRender() {
    if (typeof renderListener === "function") {
      const elapsed = elapsedBeforePause;
      const total = currentRecipe ? currentRecipe.totalTime : 180;
      const step = steps[currentStepIndex] || steps[steps.length - 1] || null;

      const progress = Math.min(100, (elapsed / total) * 100);

      renderListener({
        isRunning,
        isPaused,
        elapsed,
        elapsedFormatted: formatTime(elapsed),
        total,
        totalFormatted: formatTime(total),
        progress,
        currentStep: step,
        currentStepIndex,
        totalSteps: steps.length,
        steps: steps.map((s, idx) => ({
          ...s,
          isDone: elapsed >= s.end,
          isActive: idx === currentStepIndex
        }))
      });
    }
  }

  return {
    load,
    start,
    pause,
    stop,
    skipToNextStep,
    finish,
    playVoicePreview: () => {
      playStepInstruction({ isBloom: true, targetTotal: 60, pourNumber: 0 }, false);
    },
    setRenderListener,
    setAudioMode: (mode) => { audioMode = mode; },
    getAudioMode: () => audioMode,
    getState: () => ({ isRunning, isPaused, currentRecipe, currentStepIndex })
  };
});
