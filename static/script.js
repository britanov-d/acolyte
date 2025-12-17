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

commandInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const command = commandInput.value.split(" ");
    const cmd = command[0];
    const args = command.slice(1).join(" ");
    commandInput.value = "";

    switch (cmd) {
      case "/warframe":
      case "/wf":
        const warframeData = await load_json("wf", args);
        if (warframeData && warframeData.length > 0) {
          displayWarframeInfo(warframeData);
        } else {
          output.innerHTML = "<p>Варфрейм не найден!</p>";
        }
        break;

      case "/profile":
      case "/stats":
        const statData = await load_json("stat", args);
        if (statData && statData.length > 0) {
          displayStatInfo(statData);
        } else {
          output.innerHTML = "<p>Профиль не найден!</p>";
        }
        break;

      case "/mods":
      case "/mod":
        const modData = await load_json("mods", args);
        if (modData && modData.length > 0) {
          displayModsInfo(modData);
        } else {
          output.innerHTML = "<p>Мод не найден!</p>";
        }
        break;

      case "/arcanes":
      case "/arcane":
        const arcaneData = await load_json("arcanes", args);
        if (arcaneData && arcaneData.length > 0) {
          displayArcaneInfo(arcaneData);
        } else {
          output.innerHTML = "<p>Мистификатор не найден</p>";
        }
        break;

      case "/worldstate":
        try {
          const response = await fetch(
            `/worldState/${encodeURIComponent(args)}`
          );
          const { event, locations } = await response.json();
          if (args == "Invasions") {
            displayInvasionInfo(event, locations);
          } else if (args == "VoidStorms") {
            displayVoidStormInfo(event, locations);
          } else if (args == "ActiveMissions") {
            displayAbyssGapInfo(event, locations);
          } else if (args == "VoidTraders") {
            displayVoidTradersInfo(event, locations);
          }
        } catch (err) {
          console.error(`Could not get products: ${err}`);
        }
        break;

      default:
        output.innerHTML = `<p>Введённая вами команда не найдена!</p>`;
    }
  }
});

async function load_json(endpoint, args) {
  try {
    const response = await fetch(
      `/${encodeURIComponent(endpoint)}/${encodeURIComponent(args)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Не удалось загрузить ${endpoint}: ${err}`);
    throw err;
  }
}
