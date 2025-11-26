(function () {
  const STORAGE_KEY = "Jassa_config_accent";
  const DEFAULT_ACCENT = "nike";
  const palettes = [
    {
      id: "nike",
      title: "Nike Pulse",
      brand: "Nike",
      description: "Steely teal confidence",
      colors: ["#ececec", "#9fd3c7", "#385170", "#142d4c"]
    },
    {
      id: "apple",
      title: "Apple Ember",
      brand: "Apple",
      description: "Minimal crimson energy",
      colors: ["#233142", "#455d7a", "#f95959", "#e3e3e3"]
    },
    {
      id: "samsung",
      title: "Samsung Ocean",
      brand: "Samsung",
      description: "Calm navy gradients",
      colors: ["#e7eaf6", "#a2a8d3", "#38598b", "#113f67"]
    },
    {
      id: "google",
      title: "Google Breeze",
      brand: "Google",
      description: "Playful coastal mix",
      colors: ["#5585b5", "#53a8b6", "#79c2d0", "#bbe4e9"]
    },
    {
      id: "tesla",
      title: "Tesla Ember",
      brand: "Tesla",
      description: "Bold electric warmth",
      colors: ["#155263", "#ff6f3c", "#ff9a3c", "#ffc93c"]
    },
    {
      id: "amazon",
      title: "Amazon Grove",
      brand: "Amazon",
      description: "Vibrant rainforest hues",
      colors: ["#93e4c1", "#3baea0", "#118a7e", "#1f6f78"]
    },
    {
      id: "spotify",
      title: "Spotify Neon",
      brand: "Spotify",
      description: "Neon studio glow",
      colors: ["#27296d", "#5e63b6", "#a393eb", "#f5c7f7"]
    }
  ];

  const paletteMap = new Map(palettes.map((p) => [p.id, p]));
  let pickerCount = 0;

  const safeStorage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        console.warn("Accent palette storage read failed", err);
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.warn("Accent palette storage write failed", err);
      }
    }
  };

  const getStoredAccent = () => safeStorage.get(STORAGE_KEY) || DEFAULT_ACCENT;

  const ensureBodyAccent = (accent) => {
    if (!document.body) return;
    document.body.dataset.accent = accent;
  };

  const syncInputs = (accent) => {
    document.querySelectorAll('input[data-accent-control]').forEach((input) => {
      const isActive = input.value === accent;
      input.checked = isActive;
      const option = input.closest(".setting-toggle-option");
      if (option) option.classList.toggle("is-active", isActive);
    });
  };

  const applyAccent = (accent, { skipPersist = false } = {}) => {
    const targetAccent = paletteMap.has(accent) ? accent : DEFAULT_ACCENT;
    ensureBodyAccent(targetAccent);
    if (!skipPersist) {
      safeStorage.set(STORAGE_KEY, targetAccent);
    }
    syncInputs(targetAccent);
    window.dispatchEvent(
      new CustomEvent("ums:accent-change", {
        detail: targetAccent
      })
    );
  };

  const buildOptionMarkup = (name, palette) => {
    const [first, second, third, fourth] = palette.colors;
    const inputId = `${name}-${palette.id}`;
    const style = `--setting-first:${first};--setting-second:${second};--setting-third:${third};--setting-fourth:${fourth};`;
    return `
      <div class="setting-toggle-option">
        <input
          type="radio"
          name="${name}"
          id="${inputId}"
          value="${palette.id}"
          data-accent-control
        />
        <label class="setting-toggle" for="${inputId}" style="${style}">
          <div class="setting-toggle__meta">
            <span class="setting-toggle__title">${palette.title}</span>
            <span class="setting-toggle__brand">${palette.brand} · ${palette.description}</span>
          </div>
          <div class="setting-toggle__swatches">
            <span class="swatch first-color"></span>
            <span class="swatch second-color"></span>
            <span class="swatch third-color"></span>
            <span class="swatch fourth-color"></span>
          </div>
        </label>
      </div>
    `;
  };

  const initPicker = (node) => {
    if (!node || node.dataset.accentBound === "true") return;
    const radioName = node.dataset.accentName || `accent-choice-${++pickerCount}`;
    node.dataset.accentBound = "true";
    node.innerHTML = palettes.map((palette) => buildOptionMarkup(radioName, palette)).join("");
    node.addEventListener("change", (event) => {
      if (event.target && event.target.matches('input[data-accent-control]')) {
        applyAccent(event.target.value);
      }
    });
  };

  const ensurePanelPicker = () => {
    const panel = document.querySelector(".settings-options");
    if (!panel || panel.querySelector("[data-accent-picker]")) return;

    const block = document.createElement("div");
    block.className = "mb-3";
    block.innerHTML = `
      <small class="d-block text-uppercase font-weight-bold text-muted mb-2">System accent</small>
      <div class="setting-toggle-grid" data-accent-picker></div>
    `;

    const firstDivider = panel.querySelector("hr");
    if (firstDivider) {
      panel.insertBefore(block, firstDivider);
    } else {
      panel.appendChild(block);
    }
  };

  const initAllPickers = () => {
    ensurePanelPicker();
    document.querySelectorAll("[data-accent-picker]").forEach(initPicker);
    syncInputs(getStoredAccent());
  };

  document.addEventListener("DOMContentLoaded", () => {
    const accent = getStoredAccent();
    ensureBodyAccent(accent);
    initAllPickers();
    syncInputs(accent);
  });

  const observer = new MutationObserver((mutations) => {
    let shouldInit = false;
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (
          node.matches &&
          (node.matches("[data-accent-picker]") ||
            node.matches(".settings-options") ||
            node.querySelector("[data-accent-picker]") ||
            node.querySelector(".settings-options"))
        ) {
          shouldInit = true;
        }
      });
    });

    if (shouldInit) {
      initAllPickers();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

