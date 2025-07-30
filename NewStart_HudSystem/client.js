/* ``````````` ## Development By el8rbawY ## ```````````*/
let isCreateDone = false, runOpen = true, isAutoHP = true;
let hudValues = { food: 0, water: 0 };

// ---
const getHudMainValues = (isAll = true) => {
   const pedID = GetPlayerPed(-1);
   const playerID = PlayerId();

   if (isAll) {
      return {
         health: GetEntityHealth(pedID),
         armour: GetPedArmour(pedID),
         oxygen: GetPlayerUnderwaterTimeRemaining(playerID),
         sprint: GetPlayerSprintStaminaRemaining(playerID),
      };

   } else {
      return {
         health: GetEntityHealth(pedID),
         armour: GetPedArmour(pedID)
      };
   }
}

// ---
const startTickHud = _=> {
   setInterval(_=> {
      const pedID = PlayerPedId();

      if (!exports.NewStart_Medicine.method('info').isDead) {
         const vehID = IsPedInAnyVehicle(pedID, false);

         SendNUIMessage(JSON.stringify({ 
            type: 'hud_update',
            isVehicle: vehID && GetVehicleClass(vehID) !== 13,
            values: { ...getHudMainValues(), ...hudValues }
         }));
      }
   }, 1000);
}

// ---
setInterval(_=> {
   const pedID = GetPlayerPed(-1);
   const decrease = 10;

   if (!isCreateDone || exports.NewStart_Medicine.method('info').isDead || exports.NewStart_CharacterCreator.isOpen() || exports.NewStart_Admin.method('info').isComfort) return;

   for (let key in hudValues) {
      hudValues[key] = hudValues[key] <= decrease ? 0 : hudValues[key] - decrease;
   }

   const currentHealth = GetEntityHealth(pedID) - decrease;
   
   if (currentHealth <= 100) { 
      SetEntityHealth(pedID, 0);
      SendNUIMessage(JSON.stringify({ type: 'isDead' }));

   } else if (Object.values(hudValues).includes(0)) {
      SetEntityHealth(pedID, currentHealth);
   }

   emitNet('NewStart_HudSystem:saveHudValues-server', { ...getHudMainValues(false), ...hudValues });
}, 780000); // 780000 => 13min

// ---
setTick(() => {
   if (isAutoHP && (!hudValues.food || !hudValues.water)) {
      SetPlayerHealthRechargeMultiplier(PlayerId(), 0.0); // Disable Auto HP
      isAutoHP = false;

   } else if (!isAutoHP && hudValues.food && hudValues.water) {
      SetPlayerHealthRechargeMultiplier(PlayerId(), 1.0);
      isAutoHP = true;
   }
});

// ---
exports('openHud', (type, data) => {
   if (type === 'first') {
      const pedID = GetPlayerPed(-1);
   
      RequestAnimDict('mp_player_intdrink');
      RequestAnimDict('mp_player_inteat@burger');

      SetEntityHealth(pedID, data.health);
      SetPedArmour(pedID, data.armour);

      hudValues = { food: data.food, water: data.water };
      startTickHud();
      isCreateDone = true;

   } else if (type === 'create') {      
      hudValues = { food: 100, water: 100 };
      startTickHud();
      isCreateDone = true;

   } else if (type === 'revive') {
      hudValues = { food: 25, water: 25 };
      emitNet('NewStart_HudSystem:saveHudValues-server', { ...getHudMainValues(false), ...hudValues });
   }

   if (runOpen) {
      runOpen = false;
      SendNUIMessage(JSON.stringify({ type: 'open_hud' }));
   }
});

// ---
exports('closeUI', _=> { 
   runOpen = true;
   SendNUIMessage(JSON.stringify({ type: 'close' }));
});

// ---
exports('update', (data, noCreateObj) => {
   // noCreateObj => مع برادات الماء
   const keys = Object.keys(data);

   if (Object.keys(hudValues).includes(keys[0])) {
      for (let key of keys) {
         const sum = hudValues[key] + data[key];
         hudValues[key] = sum > 100 ? 100 : sum;
      }

      if (keys.includes('water')) {
         TaskPlayAnim(PlayerPedId(), 'mp_player_intdrink', 'loop', 1.0, -1.0, 2000, 50, 0, 0, 0, 0);

      } else if (keys.includes('food')) {
         TaskPlayAnim(PlayerPedId(), 'mp_player_inteat@burger', 'mp_player_int_eat_burger', 1.0, -1.0, 2000, 50, 0, 0, 0, 0);
      }
   }

   emitNet('NewStart_HudSystem:saveHudValues-server', { ...getHudMainValues(false), ...hudValues });
});

// ---
exports('radio', body => { SendNUIMessage(JSON.stringify({ type: 'radio', ...body }));});

// ---
exports('updateJob', info => {
   exports.NewStart_Tools.method('setDiscord', info);
   SendNUIMessage(JSON.stringify({ type: 'updateJob', info }));
});

// ---
exports('method', (type, data) => {
   if (type === 'setDoubleLevel') {
      SendNUIMessage(JSON.stringify({ type: 'doubleLevel', isDouble: data }));

   } else if (type === 'setStateNUI') {
      SendNUIMessage(JSON.stringify({ type: 'setState', info: data }));

   } else if (type === 'updateWine') {
      SendNUIMessage(JSON.stringify({ type, value: data }));

   } else if (type === 'getValues') {
      return hudValues;
   }
});