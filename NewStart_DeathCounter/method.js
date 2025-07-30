/* ``````````` ## Development By el8rbawY ## ```````````*/
const Delay = ms => new Promise(res => setTimeout(res, ms));

// ---
async function screenBlanking() {
   isOpen = true;

   closeAll();
   exports.NewStart_HudSystem.closeUI();
   exports.NewStart_MainMenu.toggleAds(false);
   exports.NewStart_Phone.noticesToggle(true);

   DisplayRadar(false);
   SetNuiFocus(true, false);
   SendNUIMessage(JSON.stringify({ type: 'open' }));
}

// ---
async function revivePlayer(spawn, isTools = false, isLimit = false) {
   DoScreenFadeOut(1000);
   await Delay(1000);

   const pedID = PlayerPedId();
   const update = { 'mode.isDie': '' };
   
   SetNuiFocus(false, false);
   ClearPedBloodDamage(pedID);
   SetEntityCoordsNoOffset(pedID, spawn.x, spawn.y, spawn.z, false, false, false, true);
	NetworkResurrectLocalPlayer(spawn.x, spawn.y, spawn.z, spawn.heading || GetEntityHeading(pedID), true, false);
   if (isLimit) exports.NewStart_Medicine.limited('set', true, true);

   isOpen = false;

   if (!isTools && exports.NewStart_Employee.data().isActive) update['job.isTools'] = false;
   emitNet('NewStart:updateUser', update);
   exports.NewStart_Medicine.method('startDeath', false);
   
   DoScreenFadeIn(1000);
   spawnPlayer(isTools);
}

// ---
function spawnPlayer(isTools) {
   if (!exports.NewStart_Questions.isOpen()) {
      DisplayRadar(true);

      if (!IsPauseMenuActive()) {
         exports.NewStart_MainMenu.toggleAds(true);
         exports.NewStart_Phone.noticesToggle(false);
         exports.NewStart_HudSystem.openHud('revive');
      }
   }

   exports.NewStart_Inventory.method('weaponsLoad');
   if (isTools) exports.NewStart_Employee.method('giveTools');
}

// ---
function closeUI() {
   const pedID = PlayerPedId();
   const player = GetEntityCoords(pedID, true);
   const distanceAll = [];
   const coords = [
      { name: 'ساندي', x: 1821.1779, y: 3672.1845, z: 33.2674, heading: 243.7795 }, // sandy
      // { name: 'لوس سانتوس', x: 330.1186, y: -594.8967, z: 43.2821, heading: 56.6929 }, // los
      { name: 'بوليتو', x: -250.0219, y: 6316.1538, z: 31.4139, heading: 328.8189 } // paleto
   ];

   for (let item of coords) {
      const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, player[0], player[1], player[2], true);
      distanceAll.push({ distance, coords: item });
   }

   const spawn = distanceAll.find(obj => obj.distance === Math.min(...distanceAll.map(item => item.distance))).coords;
   emitNet('NewStart_DeathCounter:revivePlayer-server', null, true, spawn.name);
   emit('NewStart_RealEstate:handleInterior-client', 'safeExit');

   exports.NewStart_Inventory.method('setExtraKG', 0);
   exports.NewStart_Inventory.method('removeAll');

   ClearPedBloodDamage(pedID);
   clearTimeout(goHospitalID);
   goHospitalID = setTimeout(() => { goHospitalID = 0; }, 5000);
   revivePlayer(spawn);
}

// ---
function closeAll(isNormal, skip) {
   exports.NewStart_Admin.method('closeUI');
   exports.NewStart_Inventory.closeUI();
   if (!skip) exports.NewStart_Inspection.closeUI();
   exports.NewStart_Petrol.closeUI();
   exports.NewStart_Radio.method('closeUI');
   exports.NewStart_Phone.closeUI();
   exports.NewStart_Options.closeUI();
   exports.NewStart_Factions.closeUI();
   exports.NewStart_Employee.closeUI();
   exports.NewStart_Mechanical.method('closeUI');
   exports.NewStart_Stores.method('closeUI');
   exports.NewStart_MainMenu.closeUI(isNormal);
   exports.NewStart_Medicine.method('closeUI');
   exports.NewStart_Inventory.method('smoking', 'done');
   exports.NewStart_Police.method('closeUI');
   exports.NewStart_Licenses.method('closeUI');

   if (isNormal) {
      exports.NewStart_Hairdresser.method('closeUI');
      exports.NewStart_Clothes.closeUI();
      exports.NewStart_VehicleDealership.method('closeUI');
      exports.NewStart_Jobs.closeUI();
      exports.NewStart_RealEstate.closeUI();
      exports.NewStart_Bank.closeUI();
   }
}

// ---
exports('isOpen', _=> isOpen);
exports('closeAll', closeAll);

// ---
RegisterCommand('fix', () => {
   closeAll(true, true);
   exports.NewStart_Notifications.showAttention('info', 'من فضلك يرجي التبليغ عن المشكلة التي جعلتك تستخدم هذا الأمر!');
}, false);