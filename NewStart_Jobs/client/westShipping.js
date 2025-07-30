/* ``````````` ## Development By el8rbawY ## ```````````*/
const WEST_DATA = { 
   tickID: null, vehID: null, blips: [], blipMain: null,
   isOpen: false, runClose: false, currentName: null, timeoutID: null,
   money: 30500, exp: 900,
   spawnVeh: {
      plane: [2132.4921, 4808.7558, 40.9736, 116.2204],
      car: [2133.5473, 4783.0419, 40.2321, 25.5118],
      // carWithOutfit: { x: -49.5560, y: -2546.5979, z: 6.3472, h: 325.9842 }
      carWithOutfit: [-152.9274, 6307.2792, 30.6614, 314.6456]
   },
   locations: [
      // { type: 'chevron', name: 'outfit', gps: [-35.2351, -2552.3339, 6.0607], distance: 0.7 },
      { type: 'cylinder', name: 'outfit', gps: [-136.0483, 6291.2045, 31.5040], distance: 0.7, scale: 1.2 },
      { type: 'cylinder', name: 'firstStage', gps: [2136.3955, 4775.15624, 40.9567], distance: 1.3, scale: 2.5, text: 'لتبديل المركبات' },
      { type: 'cylinder', name: 'secondStage', gps: [1738.7340, 3317.0900, 41.2094, 286.2991], distance: 1.73, scale: 3.5, text: 'لاستلام البضائع' },
      { name: 'reward', blipID: 501, title: 'ﻦﺤﺸﻟﺍ ﻢﻠﺴﺗ', gps: [-3385.7539, 2925.5078, 9.2285], distance: 4.5, text: 'لتسليم البضائع' }
   ]
};

function START_WEST_SHIPPING_JOB() {
   WEST_DATA.blipMain = createBlip(501, 'ﻦﺤﺸﻠﻟ ﺖﺴﻳﻭ', WEST_DATA.locations[0].gps, 3, false);
   if (state.currentJob?.isActive) WEST_SHIPPING_BLIPS();

   RequestModel(-1743316013); // car
   RequestModel(-644710429);  // plane

   // RequestModel(176137803); // clipboard
   // RequestAnimDict('amb@world_human_clipboard@male@idle_a');

   WEST_DATA.tickID = setTick(_=> {
      const pedID = PlayerPedId();
      const coords = GetEntityCoords(pedID, true);
      const inVeh = GetVehiclePedIsIn(pedID, false);
      WEST_DATA.currentName = null;

      for (let data of WEST_DATA.locations) {
         const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], data.gps[0], data.gps[1], data.gps[2], true);

         if (distance < 50) {
            /* if (data.type === 'chevron') {
               DrawMarker(
                  20, data.gps[0], data.gps[1], data.gps[2], 0.0, 0.0, 0.0,
                  0, 180, data.name === 'outfit' ? 150 : 30, 
                  1.5, 1.5, 1, 45, 101, 167, 100, false, false, 2, null, null, false
               );

            } else */ if (data.type === 'cylinder' && (data.name === 'outfit' || state.currentJob?.isActive)) { // && state.currentJob?.isActive
               DrawMarker(
                  1, data.gps[0], data.gps[1], data.gps[2] - 1, 
                  0.0, 0.0, 0.0, 0.0, 0, 0.0, 
                  data.scale || 1.5, data.scale || 1.5, 0.5, 
                  45, 101, 167, 100, false, false, 2, null, null, false
               );
            }
         }

         if ((data.distance >= distance && state.currentJob?.isActive) || (data.distance >= distance && data.name === 'outfit')) {
            WEST_DATA.currentName = data.name; continue;
         }
      }

      if (
         WEST_DATA.currentName && !inVeh && 
         !IsEntityDead(pedID) &&
         !IsPauseMenuActive()
      ) {
         if (IsControlJustPressed(0, 38)) {
            WEST_DATA.isOpen = true;

            if (WEST_DATA.currentName === 'outfit') {
               SetNuiFocus(true, true);
               SendNUIMessage({ type: 'outfit' });

            } else if (!WEST_DATA.timeoutID) {
               let vehID = WEST_DATA.vehID;
               if (vehID) vehID = NetworkGetEntityFromNetworkId(vehID);

               if (WEST_DATA.currentName === 'firstStage') { /*************** First Stage ***************/
                  const vehCoords = GetEntityCoords(vehID, true);
                  const vehClass = GetVehicleClass(vehID);
                  const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], vehCoords[0], vehCoords[1], vehCoords[2], true);

                  if (!WEST_DATA.vehID) {
                     WEST_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب الحصول علي مركبة الوظيغة أولاً وأن تكون بالقرب منك!');

                  } else if (distance > 100) {
                     WEST_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون المركبة في نفس المنطقة!');

                  } else if (GetVehicleEngineHealth(vehID) <= 0) {
                     WEST_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'المركبة لم تعد صالحة يجب عليك الحصول مركبة أخري!');
                  }

                  const callback = _=> {
                     emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: WEST_DATA.vehID }));
                     
                     if (vehClass === 16) { // isPlane
                        WEST_DATA.vehID = vehicleBuild(-1743316013, 2, WEST_DATA.spawnVeh.car);

                     } else {
                        WEST_DATA.vehID = vehicleBuild(-644710429, 2, WEST_DATA.spawnVeh.plane);
                     }
                  }
                  
                  WEST_SHIPPING_PROGRESS_JOB({ callback }, 10000);
                  exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true, canMove: true });

               } else if (WEST_DATA.currentName === 'secondStage') { /*************** Second Stage ***************/
                  const findItem = _=> exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 16); 
                  const vehCoords = GetEntityCoords(vehID, true);
                  const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], vehCoords[0], vehCoords[1], vehCoords[2], true);

                  if (GetVehicleClass(vehID) !== 16 || distance > 100) {
                     WEST_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون طائرة الشحن في نفس المنطقة!');

                  } else if (!findItem()) {
                     WEST_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي عدة الشحن!');
                  }

                  WEST_SHIPPING_PROGRESS_JOB({ itemID: 16, findItem, receive: { id: 38, title: 'بضاعة شحن' } });
                  TaskAchieveHeading(pedID, WEST_DATA.locations.find(l => l.name === WEST_DATA.currentName).gps[3], 0);
                  setTimeout(_=> toggleAnim('westShipping', true), 1500);
                  exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '100s', status: true });

               } else { // ===========> reward
                  if (exports.NewStart_Tools.method('getInfo').seaPortClosed) {
                     return exports.NewStart_Notifications.showAttention('error', 'الميناء البحري مغلق يمكنك العودة عند السابعة صباحًا!');  
                  }

                  const findItem = _=> exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 38);

                  if (!findItem()) {
                     WEST_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي بضاعة الشحن!');
                  }

                  WEST_SHIPPING_PROGRESS_JOB({ itemID: 38, findItem });
                  exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '100s', status: true, canMove: true });
               }
            }

         } else if (!WEST_DATA.isOpen && !WEST_DATA.runClose && !exports.NewStart_Tools.method('isProgress')) {
            const find = WEST_DATA.locations.find(obj => obj.name === WEST_DATA.currentName);
            SendNUIMessage({ type: 'entranceOpen', text: find.text });
         }

         WEST_DATA.runClose = true;

      } else if (WEST_DATA.runClose) {
         CLOSE_WEST_SHIPPING_JOB();
      }
   });
}

// ---
function CLOSE_WEST_SHIPPING_JOB() {
   WEST_DATA.isOpen = false;
   WEST_DATA.runClose = false;

   SetNuiFocus(false, false);
   SendNUIMessage({ type: 'closeUI' });

   if (WEST_DATA.timeoutID) exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
   if (state.objectID) toggleAnim('westShipping', false);

   clearTimeout(WEST_DATA.timeoutID);
   WEST_DATA.timeoutID = null;
}

// --- 
function QUIT_WEST_SHIPPING_JOB() {
   CLOSE_WEST_SHIPPING_JOB();
   
   for (let blip of [...WEST_DATA.blips, WEST_DATA.blipMain]) {
      RemoveBlip(blip);
   }

   if (WEST_DATA.vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: WEST_DATA.vehID }));
   clearTick(WEST_DATA.tickID);

   WEST_DATA.blips = [];
   WEST_DATA.tickID = null;
   WEST_DATA.vehID = null;
}

// --- 
function WEST_SHIPPING_OUTFIT(withBlips) {
   const pedID =  PlayerPedId();
   const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');

   SetPedComponentVariation(pedID, 11, isMale ? 63 : 9, 0, 0); // top
   SetPedComponentVariation(pedID, 8, 15, 0, 0); // undershirt
   SetPedComponentVariation(pedID, 3, isMale ? 0 : 9, 0, 0); // torso 
   SetPedComponentVariation(pedID, 4, isMale ? 25 : 3, 0, 0); // leg
   SetPedComponentVariation(pedID, 6, 24, 0, 0); // shoe
   if (withBlips) WEST_SHIPPING_BLIPS();
}

// ---
function WEST_SHIPPING_BLIPS() {
   for (let obj of WEST_DATA.locations) {
      if (obj.name === 'outfit') continue;

      const blip = createBlip(501, 'ﻦﺤﺸﻠﻟ ﺖﺴﻳﻭ', obj.gps, 3);
      WEST_DATA.blips.push(blip);
   }
}

// ---
function WEST_SHIPPING_PROGRESS_JOB({ itemID, findItem, receive, callback }, time = 100000) {
   SendNUIMessage({ type: 'closeUI' });
   
   WEST_DATA.timeoutID = setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      
      if (state.objectID) toggleAnim('westShipping', false);
      else ClearPedTasks(PlayerPedId());

      const find = POULTRY_DATA.locations.find(obj => obj.name === POULTRY_DATA.currentName);
      if (find) SendNUIMessage({ type: 'entranceOpen', text: find.text });
      
      if (itemID) {
         if (findItem()) {
            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: itemID, count: 1 }));
   
            if (!receive) {            
               exports.NewStart_Bank.method('giveCash', { name: jobsList.find(i => i.id === state.currentJob.id).name, amount: WEST_DATA.money });
               exports.NewStart_MainMenu.levelUp(WEST_DATA.exp);
   
            } else {
               exports.NewStart_Inventory.addItem(JSON.stringify({ id: receive.id, count: 1 }));
               exports.NewStart_Notifications.showAttention('success', `لقد حصلت للتو على +1 ${ receive.title }.`);
            }
            
         } else exports.NewStart_Notifications.showAttention('error', 'لقد فشلت العملية لفقدان المواد اللازمة!');
      } else callback();
      
      WEST_DATA.timeoutID = null;
      WEST_DATA.isOpen = false;
   }, time);
}