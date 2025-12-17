import { output, commandInput } from "./elements.js";
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

async function safeFetch(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error("Данные временно недоступны");
      } else if (response.status >= 500) {
        throw new Error("Ошибка сервера. Попробуйте позже");
      }
    }

    return await response.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Нет соединения с сервером");
    }

    throw err instanceof Error ? err : new Error("Неизвестная ошибка");
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

commandInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const input = commandInput.value.trim();
  if (!input) return;

  const command = input.split(" ");
  const cmd = command[0].toLowerCase();
  const args = command.slice(1).join(" ").trim();

  commandInput.value = "";
  setLoading(true);

  try {
    switch (cmd) {
      case "/warframe":
      case "/wf": {
        const data = await safeFetch(`/wf/${encodeURIComponent(args)}`);
        if (data && data.length > 0) {
          displayWarframeInfo(data);
        } else {
          showError("Варфрейм не найден");
        }
        break;
      }

      case "/profile":
      case "/stats": {
        const data = await safeFetch(`/stat/${encodeURIComponent(args)}`);
        if (data && data.length > 0) {
          displayStatInfo(data);
        } else {
          showError("Профиль не найден или недоступен");
        }
        break;
      }

      case "/mods":
      case "/mod": {
        const data = await safeFetch(`/mods/${encodeURIComponent(args)}`);
        if (data && data.length > 0) {
          displayModsInfo(data);
        } else {
          showError("Мод не найден");
        }
        break;
      }

      case "/arcanes":
      case "/arcane": {
        const data = await safeFetch(`/arcanes/${encodeURIComponent(args)}`);
        if (data && data.length > 0) {
          displayArcaneInfo(data);
        } else {
          showError("Мистификатор не найден");
        }
        break;
      }

      case "/worldstate": {
        if (!args) {
          showError(
            "Укажите тип события: Invasions, VoidStorms, ActiveMissions или VoidTraders"
          );
          break;
        }

        const data = await safeFetch(`/worldState/${encodeURIComponent(args)}`);
        const { event, locations } = data;

        if (args === "Invasions") {
          displayInvasionInfo(event, locations);
        } else if (args === "VoidStorms") {
          displayVoidStormInfo(event, locations);
        } else if (args === "ActiveMissions") {
          displayAbyssGapInfo(event, locations);
        } else if (args === "VoidTraders") {
          displayVoidTradersInfo(event, locations);
        } else {
          showError("Неизвестный тип события");
        }
        break;
      }

      default:
        showError(
          "Неизвестная команда. Доступные: /wf, /mod, /arcane, /stats, /worldstate"
        );
    }
  } catch (err) {
    showError(err.message || "Произошла ошибка при загрузке данных");
    console.error("Ошибка команды:", err);
  } finally {
    setLoading(false);
  }
});
