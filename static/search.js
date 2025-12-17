document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".search-form");
  forms.forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    const suggestions = [
      "главная",
      "о боте",
      "about",
      "документация",
      "docs",
      "введение",
      "варфреймы",
      "warframe",
      "моды",
      "mods",
      "мистификаторы",
      "arcane",
      "вторжения",
      "invasions",
      "бури бездны",
      "voidstorm",
      "разрывы бездны",
      "voidmission",
      "торговец бездны",
      "баро ки'тир",
      "voidtraders",
      "статистика",
      "stats",
    ];

    const searchMap = {
      главная: "/",
      "о боте": "/about",
      about: "/about",
      документация: "/documentation",
      docs: "/documentation",
      введение: "/documentation#tab-intro",
      варфреймы: "/documentation#tab-warframe",
      warframe: "/documentation#tab-warframe",
      моды: "/documentation#tab-mods",
      mods: "/documentation#tab-mods",
      мистификаторы: "/documentation#tab-arcane",
      arcane: "/documentation#tab-arcane",
      аркан: "/documentation#tab-arcane",
      вторжения: "/documentation#tab-invasions",
      invasions: "/documentation#tab-invasions",
      "бури бездны": "/documentation#tab-voidstorm",
      voidstorm: "/documentation#tab-voidstorm",
      "разрывы бездны": "/documentation#tab-voidmission",
      voidmission: "/documentation#tab-voidmission",
      "торговец бездны": "/documentation#tab-voidtraders",
      баро: "/documentation#tab-voidtraders",
      voidtraders: "/documentation#tab-voidtraders",
      статистика: "/documentation#tab-stats",
      stats: "/documentation#tab-stats",
    };

    let suggestionsBox = document.createElement("div");
    suggestionsBox.className = "search-suggestions";
    form.style.position = "relative";
    form.appendChild(suggestionsBox);

    function showSuggestions(matches) {
      suggestionsBox.innerHTML = "";
      if (matches.length === 0 || input.value.trim() === "") {
        suggestionsBox.style.display = "none";
        return;
      }

      matches.forEach((suggestion) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = suggestion;

        const query = input.value.trim().toLowerCase();
        const idx = suggestion.toLowerCase().indexOf(query);
        if (idx !== -1) {
          const highlighted =
            suggestion.substring(0, idx) +
            "<strong>" +
            suggestion.substring(idx, idx + query.length) +
            "</strong>" +
            suggestion.substring(idx + query.length);
          item.innerHTML = highlighted;
        }

        item.addEventListener("click", () => {
          window.location.href = searchMap[suggestion] || "/";
          suggestionsBox.style.display = "none";
        });

        suggestionsBox.appendChild(item);
      });

      suggestionsBox.style.display = "block";
    }

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        suggestionsBox.style.display = "none";
        return;
      }

      const matches = suggestions.filter((s) =>
        s.toLowerCase().includes(query)
      );

      showSuggestions(matches.slice(0, 6));
    });

    document.addEventListener("click", (e) => {
      if (!form.contains(e.target)) {
        suggestionsBox.style.display = "none";
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim().toLowerCase();

      const exactMatch = suggestions.find((s) => s.toLowerCase() === query);
      if (exactMatch && searchMap[exactMatch]) {
        window.location.href = searchMap[exactMatch];
        return;
      }

      const partialMatch = suggestions.find((s) =>
        s.toLowerCase().includes(query)
      );
      if (partialMatch && searchMap[partialMatch]) {
        window.location.href = searchMap[partialMatch];
        return;
      }

      alert("Ничего не найдено. Попробуйте: варфреймы, баро, моды");
    });

    input.addEventListener("keydown", (e) => {
      const items = suggestionsBox.querySelectorAll(".suggestion-item");
      let active = suggestionsBox.querySelector(".suggestion-item.active");

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!active) {
          items[0]?.classList.add("active");
        } else {
          active.classList.remove("active");
          const next = active.nextElementSibling || items[0];
          next?.classList.add("active");
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (active) {
          active.classList.remove("active");
          const prev = active.previousElementSibling || items[items.length - 1];
          prev?.classList.add("active");
        }
      } else if (e.key === "Enter" && active) {
        e.preventDefault();
        active.click();
      }
    });
  });
});
