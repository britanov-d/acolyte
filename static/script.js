import {
  output,
  commandInput,
  AVAILABLE_COMMANDS,
  COMMAND_TYPE_MAP,
} from "./elements.js";

import {
  displayArcaneInfo,
  displayInvasionInfo,
  displayModsInfo,
  displayStatInfo,
  displayWarframeInfo,
  displayVoidStormInfo,
  displayAbyssGapInfo,
  displayVoidTradersInfo,
} from "./display.js";

let wrapper = commandInput.parentElement;
if (!wrapper.classList.contains("search-wrapper")) {
  wrapper = document.createElement("div");
  wrapper.classList.add("search-wrapper");
  wrapper.style.position = "relative";
  commandInput.parentNode.insertBefore(wrapper, commandInput);
  wrapper.appendChild(commandInput);
}

let suggestionsList = wrapper.querySelector(".autocomplete-list");
if (!suggestionsList) {
  suggestionsList = document.createElement("ul");
  suggestionsList.className = "autocomplete-list";
  wrapper.appendChild(suggestionsList);
}

let debounceTimer;
let currentSuggestions = [];
let commandHistory = [];
let historyIndex = 0;

async function safeFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 503)
        throw new Error("Данные временно недоступны");
      else if (response.status >= 500) throw new Error("Ошибка сервера");
    }
    return await response.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Нет соединения с сервером");
    }
    throw err;
  }
}

function showError(message) {
  output.innerHTML = `<p style="color: #ff5555;">Ошибка: ${message}</p>`;
}

function setLoading(isLoading) {
  if (isLoading) {
    output.innerHTML =
      '<p style="color: #aaaaaa; font-style: italic;">Загрузка...</p>';
    output.classList.add("loading");
  } else {
    output.classList.remove("loading");
  }
}

function renderCommandSuggestions(commands) {
  suggestionsList.innerHTML = "";
  currentSuggestions = commands;

  if (commands.length === 0) {
    suggestionsList.style.display = "none";
    return;
  }

  commands.forEach((c) => {
    const li = document.createElement("li");
    li.innerHTML = `<span style="color: #fff; font-weight: bold;">${c.cmd}</span> <span style="color: #888; font-style: italic; font-size: 0.8em;">${c.desc}</span>`;

    li.onmouseover = () => {
      li.style.backgroundColor = "#333";
    };
    li.onmouseout = () => {
      li.style.backgroundColor = "transparent";
    };

    li.onclick = () => {
      commandInput.value = c.cmd + " ";
      commandInput.focus();
      suggestionsList.style.display = "none";
    };
    suggestionsList.appendChild(li);
  });
  suggestionsList.style.display = "block";
}

function renderItemSuggestions(items, activeFilterType) {
  suggestionsList.innerHTML = "";
  currentSuggestions = items;

  if (!items || items.length === 0) {
    suggestionsList.style.display = "none";
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    const typeLabels = { wf: "Warframe", mods: "Mod", arcanes: "Arcane" };
    const label = typeLabels[item.type] || item.type;

    li.innerHTML = `<span>${item.name}</span> <span style="color: #666; font-size: 0.8em;">[${label}]</span>`;

    li.onmouseover = () => {
      li.style.backgroundColor = "#333";
    };
    li.onmouseout = () => {
      li.style.backgroundColor = "transparent";
    };

    li.onclick = () => {
      if (activeFilterType) {
        const currentCmd = commandInput.value.split(" ")[0];
        commandInput.value = `${currentCmd} ${item.name}`;
      } else {
        const typeCmd =
          item.type === "wf"
            ? "/wf"
            : item.type === "mods"
              ? "/mod"
              : "/arcane";
        commandInput.value = `${typeCmd} ${item.name}`;
      }
      suggestionsList.style.display = "none";
      handleCommandExecution(commandInput.value);
    };
    suggestionsList.appendChild(li);
  });
  suggestionsList.style.display = "block";
}

commandInput.addEventListener("input", function () {
  const rawInput = this.value;
  const isCommandSearch = rawInput.startsWith("/") && !rawInput.includes(" ");

  clearTimeout(debounceTimer);

  if (isCommandSearch) {
    const query = rawInput.toLowerCase();
    const matches = AVAILABLE_COMMANDS.filter((c) => c.cmd.startsWith(query));
    renderCommandSuggestions(matches);
    return;
  }

  let query = rawInput.trim();
  let filterType = null;

  if (rawInput.startsWith("/")) {
    const parts = rawInput.split(" ");
    const command = parts[0].toLowerCase();
    if (parts.length < 2 || parts[1] === "") {
      suggestionsList.style.display = "none";
      currentSuggestions = [];
      return;
    }

    if (COMMAND_TYPE_MAP[command]) {
      filterType = COMMAND_TYPE_MAP[command];
      query = parts.slice(1).join(" ").trim();
    }
  }

  const minLength = filterType ? 1 : 2;

  if (query.length < minLength) {
    suggestionsList.style.display = "none";
    currentSuggestions = [];
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      let url = `/api/autocomplete?q=${encodeURIComponent(query)}`;
      if (filterType) url += `&type=${filterType}`;

      const data = await safeFetch(url);
      renderItemSuggestions(data, filterType);
    } catch (e) {
      console.error(e);
    }
  }, 300);
});

commandInput.addEventListener("keydown", async (e) => {
  // 1. ЛОГИКА TAB
  if (e.key === "Tab") {
    if (
      suggestionsList.style.display === "block" &&
      currentSuggestions.length > 0
    ) {
      e.preventDefault();
      const firstMatch = currentSuggestions[0];

      if (firstMatch.cmd) {
        commandInput.value = firstMatch.cmd + " ";
      } else if (firstMatch.name) {
        const parts = commandInput.value.split(" ");
        if (parts.length > 1 && parts[0].startsWith("/")) {
          commandInput.value = parts[0] + " " + firstMatch.name;
        } else {
          const typeCmd =
            firstMatch.type === "wf"
              ? "/wf"
              : firstMatch.type === "mods"
                ? "/mod"
                : "/arcane";
          commandInput.value = `${typeCmd} ${firstMatch.name}`;
        }
      }
      suggestionsList.style.display = "none";
    }
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    suggestionsList.style.display = "none";

    const input = commandInput.value.trim();
    if (!input) return;

    if (
      commandHistory.length === 0 ||
      commandHistory[commandHistory.length - 1] !== input
    ) {
      commandHistory.push(input);
    }

    historyIndex = commandHistory.length;

    handleCommandExecution(input);
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      commandInput.value = commandHistory[historyIndex];

      setTimeout(() => {
        commandInput.selectionStart = commandInput.selectionEnd =
          commandInput.value.length;
      }, 0);
    }
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < commandHistory.length) {
      historyIndex++;

      if (historyIndex === commandHistory.length) {
        commandInput.value = "";
      } else {
        commandInput.value = commandHistory[historyIndex];
      }
    }
  }
});

async function handleCommandExecution(inputString) {
  const command = inputString.split(" ");
  const cmd = command[0].toLowerCase();
  const args = command.slice(1).join(" ").trim();

  commandInput.value = "";
  setLoading(true);

  try {
    switch (cmd) {
      case "/warframe":
      case "/wf": {
        const data = await safeFetch(`/wf/${encodeURIComponent(args)}`);
        if (data && data.length > 0) displayWarframeInfo(data);
        else showError("Варфрейм не найден");
        break;
      }
      case "/profile":
      case "/stats": {
        const data = await safeFetch(`/stat/${encodeURIComponent(args)}`);
        if (data && !data.error) displayStatInfo(data);
        else showError("Профиль не найден");
        break;
      }
      case "/mods":
      case "/mod": {
        const data = await safeFetch(`/mods/${encodeURIComponent(args)}`);
        if (data && data.length > 0) displayModsInfo(data);
        else showError("Мод не найден");
        break;
      }
      case "/arcanes":
      case "/arcane": {
        const data = await safeFetch(`/arcanes/${encodeURIComponent(args)}`);
        if (data && data.length > 0) displayArcaneInfo(data);
        else showError("Мистификатор не найден");
        break;
      }
      case "/worldstate": {
        if (!args) {
          showError(
            "Укажите тип: Invasions, VoidStorms, ActiveMissions, VoidTraders"
          );
          break;
        }
        const data = await safeFetch(`/worldState/${encodeURIComponent(args)}`);
        if (data.error) {
          showError(data.error);
          break;
        }

        const { event, locations } = data;
        if (args === "Invasions") displayInvasionInfo(event, locations);
        else if (args === "VoidStorms") displayVoidStormInfo(event, locations);
        else if (args === "ActiveMissions")
          displayAbyssGapInfo(event, locations);
        else if (args === "VoidTraders")
          displayVoidTradersInfo(event, locations);
        else showError("Неизвестный тип события");
        break;
      }
      default:
        showError("Неизвестная команда. Введите / для списка.");
    }
  } catch (err) {
    showError(err.message || "Ошибка");
    console.error(err);
  } finally {
    setLoading(false);
  }
}
