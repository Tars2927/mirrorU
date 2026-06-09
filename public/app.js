(() => {
  const STORAGE_KEY = "mirror-of-truth-history";
  const THEME_KEY = "mirror-of-truth-theme";
  const MAX_HISTORY = 6;

  const sources = [
    "Stoic Philosophy",
    "Bhagavad Gita",
    "Upanishads",
    "Nietzsche",
    "Buddhism / Dhammapada",
    "Taoism"
  ];
  const tones = [
    "Quietly Devastating",
    "Brutally Honest",
    "Cold & Philosophical",
    "Melancholic"
  ];
  const languages = [
    "English",
    "Hindi",
    "Sanskrit (with English meaning)",
    "Urdu",
    "Bengali",
    "Tamil",
    "Spanish",
    "French",
    "German",
    "Arabic",
    "Japanese",
    "Russian"
  ];
  const topics = [
    "Self-Deception",
    "Ego & Illusion",
    "Time & Death",
    "Comfort & Cowardice",
    "Attachment",
    "Ambition",
    "Loneliness",
    "Failure",
    "Desire",
    "Self-Betrayal"
  ];

  const fallbackQuote = {
    quote: "You are not lost. You are loyal to a version of yourself that already failed.",
    attr: "Stoic Philosophy - English",
    stamp: "Ready"
  };

  const form = document.getElementById("oracle-form");
  const reveal = document.getElementById("reveal");
  const revealLabel = reveal.querySelector(".button-label");
  const randomize = document.getElementById("randomize");
  const language = document.getElementById("language");
  const topic = document.getElementById("topic");
  const error = document.getElementById("error");
  const apiStatus = document.getElementById("api-status");
  const themeToggle = document.getElementById("theme-toggle");
  const visualSource = document.getElementById("visual-source");
  const visualTone = document.getElementById("visual-tone");
  const mirrorScene = document.getElementById("mirror-scene");
  const quoteEl = document.getElementById("quote");
  const attrEl = document.getElementById("attr");
  const stampEl = document.getElementById("quote-stamp");
  const copyButton = document.getElementById("copy-quote");
  const shareButton = document.getElementById("share-quote");
  const clearButton = document.getElementById("clear-quote");
  const historyList = document.getElementById("history-list");
  const clearHistory = document.getElementById("clear-history");
  const toast = document.getElementById("toast");

  let currentQuote = { ...fallbackQuote };
  let history = readHistory();
  let toastTimer = 0;

  function getChecked(name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }

  function setChecked(name, value) {
    const input = form.querySelector(`input[name="${name}"][value="${cssEscape(value)}"]`);
    if (input) input.checked = true;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }
    return String(value).replace(/"/g, "\\\"");
  }

  function getPayload() {
    return {
      source: getChecked("source"),
      language: language.value,
      tone: getChecked("tone"),
      topic: topic.value.trim() || "Self-Deception"
    };
  }

  function setError(message) {
    error.textContent = message || "";
    error.hidden = !message;
  }

  function setLoading(isLoading) {
    reveal.disabled = isLoading;
    reveal.classList.toggle("is-loading", isLoading);
    revealLabel.textContent = isLoading ? "Revealing..." : "Reveal";
  }

  function setStatus(text, state) {
    apiStatus.textContent = text;
    apiStatus.dataset.state = state;
  }

  function formatQuote(item) {
    const quote = item.quote || "";
    const attr = item.attr ? `\n\n- ${item.attr}` : "";
    return `${quote}${attr}`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }

  function renderQuote(item, options = {}) {
    currentQuote = {
      quote: item.quote || "",
      attr: item.attr || "",
      stamp: item.stamp || "Just now"
    };

    mirrorScene.classList.remove("is-swapping");
    void mirrorScene.offsetWidth;
    mirrorScene.classList.add("is-swapping");
    
    // Automatically flip the mirror to show the quote
    if (options.save) {
      mirrorScene.classList.add("is-flipped");
    }

    quoteEl.textContent = currentQuote.quote || fallbackQuote.quote;
    attrEl.textContent = currentQuote.attr || fallbackQuote.attr;
    stampEl.textContent = currentQuote.stamp;

    const hasQuote = Boolean(currentQuote.quote);
    copyButton.disabled = !hasQuote;
    shareButton.disabled = !hasQuote;
    clearButton.disabled = !hasQuote;

    if (options.save) {
      saveToHistory(currentQuote);
    }
  }

  function readHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(item => item && item.quote).slice(0, MAX_HISTORY) : [];
    } catch (_) {
      return [];
    }
  }

  function persistHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (_) {
      // Private browsing or storage quotas should not break generation.
    }
  }

  function saveToHistory(item) {
    const normalized = {
      quote: item.quote,
      attr: item.attr || "",
      stamp: item.stamp || "Just now"
    };
    history = [
      normalized,
      ...history.filter(existing => existing.quote !== normalized.quote)
    ].slice(0, MAX_HISTORY);
    persistHistory();
    renderHistory();
  }

  function renderHistory() {
    historyList.replaceChildren();

    if (!history.length) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "No saved reflections";
      historyList.appendChild(empty);
      clearHistory.disabled = true;
      return;
    }

    clearHistory.disabled = false;
    history.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-item";
      button.setAttribute("aria-label", `Open reflection ${index + 1}`);

      const strong = document.createElement("strong");
      strong.textContent = item.quote;
      const meta = document.createElement("span");
      meta.textContent = item.attr || item.stamp || "Reflection";

      button.append(strong, meta);
      button.addEventListener("click", () => renderQuote(item));
      historyList.appendChild(button);
    });
  }

  function syncVisualLabels() {
    visualSource.textContent = getChecked("source") || "Source";
    visualTone.textContent = getChecked("tone") || "Tone";
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function randomizeSettings() {
    setChecked("source", pick(sources));
    setChecked("tone", pick(tones));
    language.value = pick(languages);
    topic.value = pick(topics);
    syncVisualLabels();
    showToast("Shuffled");
  }

  async function checkHealth() {
    setStatus("Checking", "checking");
    try {
      const response = await fetch("/health", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.hasKey) {
        setStatus("Ready", "ready");
      } else {
        setStatus("Needs key", "warning");
      }
    } catch (_) {
      setStatus("Offline", "error");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload())
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (!response.ok) {
        setError(data.error || `Request failed with HTTP ${response.status}.`);
        return;
      }

      renderQuote({
        quote: data.quote,
        attr: data.attr || "",
        stamp: new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit"
        }).format(new Date())
      }, { save: true });
    } catch (_) {
      setError("The mirror is unreachable. Try again when the server is online.");
    } finally {
      setLoading(false);
      checkHealth();
    }
  }

  async function copyCurrentQuote() {
    if (!currentQuote.quote) return;

    try {
      await navigator.clipboard.writeText(formatQuote(currentQuote));
      showToast("Copied");
    } catch (_) {
      setError("Clipboard access is unavailable in this browser.");
    }
  }

  async function shareCurrentQuote() {
    if (!currentQuote.quote) return;

    const text = formatQuote(currentQuote);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mirror of Truth", text });
        showToast("Shared");
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    await copyCurrentQuote();
  }

  function clearCurrentQuote() {
    renderQuote({
      quote: "",
      attr: "",
      stamp: "Cleared"
    });
    copyButton.disabled = true;
    shareButton.disabled = true;
    clearButton.disabled = true;
  }

  function clearAllHistory() {
    history = [];
    persistHistory();
    renderHistory();
    showToast("Cleared");
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      // Theme persistence is optional.
    }
  }

  function initTheme() {
    let theme = "light";
    try {
      theme = localStorage.getItem(THEME_KEY) || theme;
    } catch (_) {
      theme = "light";
    }
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("change", syncVisualLabels);
  randomize.addEventListener("click", randomizeSettings);
  copyButton.addEventListener("click", copyCurrentQuote);
  shareButton.addEventListener("click", shareCurrentQuote);
  clearButton.addEventListener("click", clearCurrentQuote);
  clearHistory.addEventListener("click", clearAllHistory);
  themeToggle.addEventListener("click", toggleTheme);

  document.querySelectorAll("[data-topic]").forEach(button => {
    button.addEventListener("click", () => {
      topic.value = button.dataset.topic || topic.value;
      topic.focus();
    });
  });

  // Toggle the mirror flip when clicking the mirror itself
  mirrorScene.addEventListener("click", (e) => {
    if (!e.target.closest("button") && !e.target.closest("a")) {
      mirrorScene.classList.toggle("is-flipped");
    }
  });

  // Also support Enter/Space key to flip when focused for accessibility
  mirrorScene.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      mirrorScene.classList.toggle("is-flipped");
    }
  });

  initTheme();
  syncVisualLabels();
  renderQuote(currentQuote);
  renderHistory();
  checkHealth();
})();
