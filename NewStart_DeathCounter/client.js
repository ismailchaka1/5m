/* ``````````` ## Development By el8rbawY ## ```````````*/
let isOpen = false, reason = '', killBydrugs = false, goHospitalID = 0;

// ---
onNet('NewStart_DeathCounter:revivePlayer-client', doctorID => {
   if (!isOpen) return;
   exports.NewStart_Medicine.method('info', { key: 'waitDead', value: false });

   const pedID = PlayerPedId();
   const [x, y, z] = GetEntityCoords(pedID, true);

   SendNUIMessage(JSON.stringify({ type: 'close' }));
   revivePlayer({ x, y, z }, true, !!doctorID);

   if (doctorID) emitNet('NewStart_Medicine:handleGeneral-server', 'doctorReward', doctorID);
});

// ---
function startDeath(typeID, isDead, data) {   
   if (isOpen) {
      return;
      
   } else if (exports.NewStart_Police.method('info').isJailed || exports.NewStart_Admin.method('info').isComfort) {
      const [x, y, z] = GetEntityCoords(PlayerPedId(), true);
      return revivePlayer({ x, y, z }, true);
   }

   const house = exports.NewStart_RealEstate.method('getCurrent').enterCoords;
   const coords = house ? Object.values(house).filter(i => parseFloat(i)) : Array.isArray(data) ? data : data.killerpos;

   const zone = GetNameOfZone(coords[0], coords[1], coords[2]);
   const name = exports.NewStart_Initialize.getPlace(zone) || GetLabelText(zone);
   const message = { type: 'unknown', to: 'health', name: 'مجهول', text: 'هناك شخص في حالة حرجة', unique: 'death', location: { name, coords } };

   screenBlanking();
   emitNet('NewStart_Phone:EmergencyMessage-server', JSON.stringify(message));
   exports.NewStart_Robbery.method('reset', isDead);

   // reason
   if (!reason) {
      if (Array.isArray(data)) {
         const hud = exports.NewStart_HudSystem.method('getValues');
         if (killBydrugs) reason = 'جرعة زائدة من المخدرات';
         else if (!hud.food || !hud.water) reason = 'الجوع والعطش';
         else if (typeID === -1) reason = 'انتحار أو سقوط (غير معلوم)';
         else if (typeID === 2) reason = 'الحروق أو انفجار';
         else reason = 'غير معلوم';
   
         killBydrugs = false;
   
      } else {
         const lastDamage = GetPedLastDamageBone(PlayerPedId())[1];
         const weaponGroup = GetWeapontypeGroup(data.weaponhash);
   
         if (data.killerinveh) reason = 'الدهس بالمركبة';
         else if (weaponGroup === -728555052 || weaponGroup === 2685387236) reason = 'سلاح أبيض';
         else if (weaponGroup === 1548507267) reason = 'الحروق أو انفجار';
         else if (lastDamage === 31086) reason = 'إصابة في الرأس';
         else if ([416676503, -957766203, 860033945, -1569042529, -1212426201, 970310034].includes(weaponGroup)) reason = 'طلق ناري';
         else reason = 'غير معلوم';
      }
   }

   emitNet('NewStart:updateUser', { 'mode.isDie': reason });
   exports.NewStart_Medicine.method('startDeath', true);
   exports.NewStart_Employee.method('saveCurrentAmmo');
   exports.NewStart_Inventory.method('weaponsLoad', true);
   exports.NewStart_Medicine.limited('set', false);
   reason = '';
}

// --
on('baseevents:onPlayerKilled', (typeID, deathData) => startDeath(typeID, false, deathData));
on('baseevents:onPlayerDied', (typeID, position) => startDeath(typeID, true, position));

// --
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   if (data.type === 'hasCursor') {
      SetNuiFocus(true, true);

   } else {
      closeUI();
   }

   cb('OK!');
});

// ---
exports('method', (type, data) => {
   if (type === 'setKillBydrugs') {
      killBydrugs = true;

   } /* else if (type === 'setReason') {
      reason = data;
      SetEntityHealth(PlayerPedId(), 0);

   } */ else if (type === 'spawnPlayer') {
      spawnPlayer(true); // in medicine

   } else if (type === 'isOpen') {
      return isOpen;

   } else if (type === 'isGoHospital') { // for anti-cheat
      return !!goHospitalID;

   } else if (type === 'executeHospital') {
      closeUI();
   }
});