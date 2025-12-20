export const output = document.querySelector(".output-parse");
export const commandInput = document.querySelector(".parsing");

export const AVAILABLE_COMMANDS = [
  { cmd: "/wf", desc: "Поиск Варфрейма" },
  { cmd: "/warframe", desc: "Поиск Варфрейма" },
  { cmd: "/mod", desc: "Поиск Мода" },
  { cmd: "/mods", desc: "Поиск Мода" },
  { cmd: "/arcane", desc: "Поиск Мистификатора" },
  { cmd: "/arcanes", desc: "Поиск Мистификатора" },
  { cmd: "/stats", desc: "Статистика профиля" },
  { cmd: "/profile", desc: "Статистика профиля" },
  { cmd: "/worldstate", desc: "Состояние мира" },
];

export const COMMAND_TYPE_MAP = {
  "/wf": "wf",
  "/warframe": "wf",
  "/mod": "mods",
  "/mods": "mods",
  "/arcane": "arcanes",
  "/arcanes": "arcanes",
};
