window.Barista = (function () {

  let userModified = {};
  let lastRecipe = null;

  /* =========================
     State Helpers
  ========================= */

  function markAsModified(id) {
    userModified[id] = true;
  }

  function isUserModified(id) {
    return !!userModified[id];
  }

  /* =========================
     Time Helpers
  ========================= */

  function parseTimeToSeconds(value) {

    if (!value) {
      return null;
    }

    if (value.includes(":")) {

      const [m, s] = value
        .split(":")
        .map(Number);

      return (m * 60) + (s || 0);
    }

    return Number(value);
  }

  function formatTime(sec) {

    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;
  }

/* =========================
   Scroll Helpers
========================= */

function scrollToElement(el, offset = 16) {

  const top =
    el.getBoundingClientRect().top +
    window.pageYOffset -
    offset;

  window.scrollTo({
    top,
    behavior: "smooth"
  });
}

  /* =========================
     Input Source
  ========================= */

  function getInput() {

    return {
      method: val("method"),
      profile: val("profile"),
      value: Number(val("value")),

      ratio: isUserModified("ratio")
        ? val("ratio")
        : null,

      grind: val("grind"),

      roast: val("roast"),
      freshness: val("freshness"),

      bloomWater: isUserModified("bloomWater")
        ? num("bloomWater")
        : null,

      bloomTime: isUserModified("bloomTime")
        ? parseTimeToSeconds(val("bloomTime"))
        : null,

      poursCount: isUserModified("poursCount")
        ? num("poursCount")
        : null,

      totalTimeOverride: isUserModified("totalTime")
        ? parseTimeToSeconds(val("totalTime"))
        : null
    };
  }

  /* =========================
     Dynamic Preview
  ========================= */

  function updatePreview() {

    const preview = generateRecipe(getInput());

    if (!isUserModified("bloomWater")) {
      setInput("bloomWater", preview.bloom.water);
    }

    if (!isUserModified("bloomTime")) {
      setInput("bloomTime", formatTime(preview.bloom.time));
    }

    if (!isUserModified("poursCount")) {
      setInput("poursCount", preview.pours.length);
    }

    if (!isUserModified("totalTime")) {
      setInput("totalTime", formatTime(preview.totalTime));
    }
  }

  /* =========================
     Initialization
  ========================= */

  function init() {

    const inputs = [
      "method",
      "profile",
      "value",
      "ratio",
      "grind",
      "roast",
      "freshness",
      "bloomWater",
      "bloomTime",
      "poursCount",
      "totalTime"
    ];

    inputs.forEach(id => {

      const el = document.getElementById(id);

      if (!el) {
        return;
      }

      el.addEventListener("change", () => {

        const editableFields = [
          "ratio",
          "grind",
          "bloomWater",
          "bloomTime",
          "poursCount",
          "totalTime"
        ];

        if (editableFields.includes(id)) {
          markAsModified(id);
        }

        const derivedFields = [
          "bloomWater",
          "bloomTime",
          "poursCount",
          "totalTime"
        ];

        if ([
          "method",
          "profile",
          "ratio",
          "freshness",
          "grind"
        ].includes(id)) {

          derivedFields.forEach(field => {
            userModified[field] = false;
          });
        }

        updatePreview();
      });
    });

    initGrindChips();
    initTimeMasks();
    initProfileDefaults();

    document
      .getElementById("profile")
      .dispatchEvent(new Event("change"));
  }

  /* =========================
     Grind Selection
  ========================= */

  function initGrindChips() {

    document.querySelectorAll(".chip").forEach(chip => {

      chip.addEventListener("click", () => {

        document.querySelectorAll(".chip")
          .forEach(c => c.classList.remove("active"));

        chip.classList.add("active");

        setInput("grind", chip.dataset.value);

        markAsModified("grind");

        updatePreview();
      });
    });
  }

  /* =========================
     Time Input Masks
  ========================= */

  function initTimeMasks() {

    ["totalTime", "bloomTime"].forEach(id => {

      const el = document.getElementById(id);

      if (!el) {
        return;
      }

      el.addEventListener("input", (e) => {

        let value = e.target.value.replace(/\D/g, "");

        if (value.length >= 3) {

          const minutes = value.slice(0, -2);
          const seconds = value.slice(-2);

          e.target.value =
            `${parseInt(minutes)}:${seconds}`;
        }
      });
    });
  }

  /* =========================
     Profile Defaults
  ========================= */

  function initProfileDefaults() {

    document
      .getElementById("profile")
      .addEventListener("change", (e) => {

        const profile =
          CONFIG.profiles[e.target.value];

        if (!profile) {
          return;
        }

        if (!isUserModified("ratio")) {
          setInput("ratio", profile.ratio);
        }

        if (
          !isUserModified("grind") &&
          profile.grind
        ) {

          setInput("grind", profile.grind);

          document.querySelectorAll(".chip")
            .forEach(chip => {

              chip.classList.remove("active");

              if (chip.dataset.value === profile.grind) {
                chip.classList.add("active");
              }
            });
        }

        updatePreview();
      });
  }

  /* =========================
     Recipe Generation
  ========================= */

  function run() {

    const result = generateRecipe(getInput());

    lastRecipe = result;

    const resultCard =
      document.getElementById("resultCard");

    resultCard.classList.remove("hidden");
    resultCard.classList.remove("fade-in");

    void resultCard.offsetWidth;

    resultCard.classList.add("fade-in");

    document
      .getElementById("extractionCard")
      .classList.add("hidden");

    Timeline.renderSummary(
      "summaryContainer",
      result
    );

	scrollToElement(resultCard, 16);

  }

  /* =========================
     Guided Extraction
  ========================= */

function startExtraction() {

  if (!lastRecipe) {
    return;
  }

  // Hide footer during guided extraction
  document
    .getElementById("footer")
    .classList.add("hidden");

  const extractionCard =
    document.getElementById("extractionCard");

  extractionCard.classList.remove("hidden");
  extractionCard.classList.remove("fade-in");

  void extractionCard.offsetWidth;

  extractionCard.classList.add("fade-in");

  Timeline.render(
    "timelineContainer",
    lastRecipe
  );

	scrollToElement(extractionCard, 16);

}

  /* =========================
     DOM Helpers
  ========================= */

  function val(id) {
    return document.getElementById(id).value;
  }

  function num(id) {

    const value = val(id);

    return value
      ? Number(value)
      : null;
  }

  function set(id, value) {
    document.getElementById(id).innerText = value;
  }

  function setInput(id, value) {
    document.getElementById(id).value = value;
  }

  /* =========================
     UI Helpers
  ========================= */

  function toggleAdvanced() {
    document
      .getElementById("advanced")
      .classList.toggle("hidden");
  }

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

  return {
    run,
    startExtraction,
    toggleAdvanced
  };

})();