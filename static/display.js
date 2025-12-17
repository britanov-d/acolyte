import { output } from "./elements.js";

export function displayInvasionInfo(event, locations) {
  output.innerHTML = "";
  for (const index of event) {
    const dateActivation = new Date(Number(index.Activation.$date.$numberLong));
    if (index.Completed === true) continue;
    output.innerHTML += `<div class = 'invasion'>
    <p>Вторжение в локацию: <span class = 'label'>${locations[index.Node].value}</span></p>
    <p>Дата запуска: <span class = 'label'>${dateActivation}</span></p>
    <p>Атака: <span class = 'label'>${index.Faction}</span></p>
    <p>Награда атакующих: <span class = 'label'> ${
      index.AttackerReward.countedItems
        ? `${index.AttackerReward.countedItems[0].ItemType} x${index.AttackerReward.countedItems[0].ItemCount}</span></p>`
        : `Отсутствует</span></p>`
    }
    <p>Защита: <span class = 'label'>${index.DefenderFaction}</span></p>
    <p>Награда защитников: <span class = 'label'>${index.DefenderReward.countedItems[0].ItemType} 
    x${index.DefenderReward.countedItems[0].ItemCount}</span></p>
    </div>`;
  }
}

export function displayVoidTradersInfo(event, locations) {
  output.innerHTML = "";
  const dateActivation = new Date(
    Number(event[0].Activation.$date.$numberLong)
  );
  const dateExpiry = new Date(Number(event[0].Expiry.$date.$numberLong));
  output.innerHTML = `<p>Прибытие Торговца Бездны:</p>
  <p>Локация: <span class = 'label'>${locations[event[0].Node].value}</span></p>
  <p>Торговец: <span class ='label'>${event[0].Character}</span></p>
  <p>Дата прибытия: <span class = 'label'> ${dateActivation}</span></p>
  <p>Дата отбытия: <span class = 'label'> ${dateExpiry}</span></p>`;
}

export function displayVoidStormInfo(event, locations) {
  output.innerHTML = "";
  for (const index of event) {
    const date = new Date();
    const dateActivation = new Date(Number(index.Activation.$date.$numberLong));
    const dateExpiry = new Date(Number(index.Expiry.$date.$numberLong));
    output.innerHTML += `<div class = 'voidStorm'>
    <p>Буря бездны в локации: <span class = 'label'>${locations[index.Node].value}</span></p>
    <p>Тир локации: <span class = 'label'>${index.ActiveMissionTier}</span></p>
    <p>Дата начала разрыва: <span class = 'label'>${dateActivation}</span></p>
    <p>Дата окончания разрыва: <span class = 'label'>${dateExpiry}</span></p>
    <p>Конец через: <span class = 'label'>${Math.floor((dateExpiry - date) / 60000)}</span> минут</p>
    </div>`;
  }
}

export function displayAbyssGapInfo(event, locations) {
  output.innerHTML = "";
  for (const index of event) {
    const date = new Date();
    const dateActivation = new Date(Number(index.Activation.$date.$numberLong));
    const dateExpiry = new Date(Number(index.Expiry.$date.$numberLong));
    output.innerHTML += `<div class = 'abyssGap'>
    <p>Разрыв бездны в локации: <span class = 'label'>${locations[index.Node].value}</span></p>
    <p>Тир локации: <span class = 'label'>${index.Modifier}</span></p>
    <p>Дата начала разрыва: <span class = 'label'>${dateActivation}</span></p>
    <p>Дата окончания разрыва: <span class = 'label'>${dateExpiry}</span></p>
    <p>Конец через: <span class = 'label'>${Math.floor((dateExpiry - date) / 60000)}</span> минут</p>
    </div>`;
  }
}

export function displayArcaneInfo(arcane) {
  const item = arcane[0];
  output.innerHTML = `<p>Название мистификатора: <span class = "label">${arcane[0].name}</span></p>
  <p>Категория: <span class = "label">${arcane[0].category}</span></p>
  <p>Тип: <span class = "label">${arcane[0].type}</span></p>
  <p>Редкость: <span class = "label">${arcane[0].rarity}</span></p>
  <p>Возможность продажи: <span class = "label">${arcane[0].tradable}</span></p>
  <p>Характеристики:</p>`;
  output.innerHTML += item.levelStats
    .map(
      (lvl, i) =>
        `<p>Уровень ${i + 1}: <span class="label">${lvl.stats[0]}</span></p>`
    )
    .join("");
}

export function displayModsInfo(mod) {
  output.innerHTML = `<p>Название мода: <span class = "label">${mod[0].name}</span></p>
  <p>Категория: <span class = "label">${mod[0].type}</span></p>
  <p>Потребление: <span class = "label">${Math.abs(mod[0].baseDrain)} - ${Math.abs(mod[0].baseDrain) + mod[0].fusionLimit}</span></p>
  <p>Редкость: <span class = "label">${mod[0].rarity}</span></p>
  <p>Полярность: <span class = "label">${mod[0].polarity}</span></p>
  <p>Возможность продажи: <span class = "label">${mod[0].tradable}</span></p>
  <p>Первое появление в игре: <span class = "label">${mod[0].releaseDate}</span></p>
  ${mod[0].wikiAvailable ? `<p>WikiURL: <span class = "label"><a href =${mod[0].wikiaUrl}>${mod[0].name}</a></span></p>` : ""}`;
}

export function displayStatInfo(profile) {
  const totalMissions =
    profile.Stats.MissionsDumped +
    profile.Stats.MissionsInterrupted +
    profile.Stats.MissionsFailed +
    profile.Stats.MissionsQuit +
    profile.Stats.MissionsCompleted;
  output.innerHTML = `<p>Profile: <span class = "label">${profile.Results[0].DisplayName}</span></p>
  <p>Guild: <span class = "label">${profile.Results[0].GuildName}</span></p>
  <p>Mastery Rank: <span class = "label">${profile.Results[0].PlayerLevel}</span></p>
  <p>Hours Played: <span class = "label">${Math.ceil(profile.Stats.TimePlayedSec / 60 / 60)}</span></p>
  <p>Avg Cipher: <span class = "label">${(profile.Stats.CipherTime / profile.Stats.CiphersSolved).toFixed(2)}</span> sec.</p>
  <p>Credit Income: <span class = "label">${profile.Stats.Income}</span></p>
  <p>Pickup Count: <span class = "label">${profile.Stats.PickupCount}</span></p>
  <p>Deaths: <span class = "label">${profile.Stats.Deaths}</span></p>
  <p>Revives: <span class = "label">${profile.Stats.ReviveCount}</span></p>
  <p>Completed Missions: <span class = "label">${profile.Stats.MissionsCompleted}</span></p>
  <p>Quit Missions: <span class = "label">${profile.Stats.MissionsQuit}</span></p>
  <p>Failed Missions: <span class = "label">${profile.Stats.MissionsFailed}</span></p>
  <p>Interrupted Missions: <span class = "label">${profile.Stats.MissionsInterrupted}</span></p>
  <p>Dumped Missions: <span class = "label">${profile.Stats.MissionsDumped}</span></p>
  <p>Total Missions: <span class = "label">${totalMissions}</span></p>`;
}

export function displayWarframeInfo(warframe) {
  output.innerHTML = `<p>Название: <span class = "label">${warframe[0].name}</span></p>
  <p>Тип: <span class = "label">${warframe[0].type}</span></p>
  <p>Здоровье: <span class = "label">${warframe[0].health}</span></p>
  <p>Щиты: <span class = "label">${warframe[0].shield}</span></p>
  <p>Броня: <span class = "label">${warframe[0].armor}</span></p>
  <p>Энергия: <span class = "label">${warframe[0].power}</span></p>
  <p>Скорость бега: <span class = "label">${warframe[0].sprintSpeed.toFixed(2)}</span></p>
  <p>Дата выхода: <span class = "label">${warframe[0].releaseDate}</span></p>
  <p>Описание: <span class = "label">${warframe[0].description}</span></p>
  <p>Способности:</p>
  <p>1 Способность: <span class = "label">${warframe[0].abilities[0].name}</span></p>
  <p>Описание: <span class = "label">${warframe[0].abilities[0].description}</span></p>
  <p>2 Способность: <span class = "label">${warframe[0].abilities[1].name}</span</p>
  <p>Описание: <span class = "label">${warframe[0].abilities[1].description}</span</p>
  <p>3 Способность: <span class = "label">${warframe[0].abilities[2].name}</span</p>
  <p>Описание: <span class = "label">${warframe[0].abilities[2].description}</span</p>
  <p>4 Способность: <span class = "label">${warframe[0].abilities[3].name}</span</p>
  <p>Описание: <span class = "label">${warframe[0].abilities[3].description}</span></p>`;
}
