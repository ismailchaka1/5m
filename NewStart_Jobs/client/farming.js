/* ``````````` ## Development By el8rbawY ## ```````````*/
const FARMING_DATA = { 
   tickID: null, vehID: null, blips: [], blipMain: null,
   isOpen: false, runClose: false, currentName: null, timeoutID: null,
   time: 2000, money: 160, exp: 7, maxCount: 20, maxKG: 40, finalID: 40,
   spawnVeh: [1965.8637, 5173.1210, 47.0395, 155.9055],
   locations: [
      { type: 'cylinder', name: 'outfit', gps: [1980.1713, 5173.5429, 47.6292], distance: 3.4, scale: 4.5 },
      { type: 'chevron', name: 'box', gps: [1897.1208, 4917.8505, 48.7919, 50], distance: 5, text: 'للحصول علي صناديق' },
      { type: 'chevron', name: 'pickUp', gps: [1892.4395, 4867.6220, 46.0791, 232.4409], distance: 5, text: 'لتعبئة الصناديق' },
      { type: 'chevron', name: 'pickUp', gps: [1876.2065, 4851.1518, 45.1018, 232.4409], distance: 5, text: 'لتعبئة الصناديق' },
      { type: 'chevron', name: 'pickUp', gps: [1885.6334, 4860.2963, 45.1018, 232.4409], distance: 5, text: 'لتعبئة الصناديق' },
      { name: 'reward', blipID: 514, title: 'ﻉﺭﺍﺰﻤﻟﺍ ﻊﻴﺑ', gps: [-3309.1120, 2843.9077, 8.2285], distance: 6.5,  text: 'لتسليم الصناديق' }
   ]
};

function START_FARMING_JOB() {
   RequestModel(-1207771834); // vehicle
   RequestModel(-1934174148); // trowel
   RequestAnimDict('amb@world_human_gardener_plant@male@base');

   FARMING_DATA.blipMain = createBlip(514, "ﺔﻴﻨﻃﻮﻟﺍ ﻉﺭﺍﺰﻤﻟﺍ", FARMING_DATA.locations[0].gps, 3, false);
   if (state.currentJob?.isActive) FARMING_BLIPS();

   FARMING_DATA.tickID = setTick(_=> {
      const pedID = PlayerPedId();
      const coords = GetEntityCoords(pedID, true);
      const inVeh = GetVehiclePedIsIn(pedID, false);
      FARMING_DATA.currentName = null;

      for (let data of FARMING_DATA.locations) {
         const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], data.gps[0], data.gps[1], data.gps[2], true);

         if (distance < 60 && !FARMING_DATA.timeoutID) {
            if (data.type === 'cylinder') {
               DrawMarker(
                  1, data.gps[0], data.gps[1], data.gps[2] - 1, 
                  0.0, 0.0, 0.0, 0.0, 0, 0.0, 
                  data.scale || 1.5, data.scale || 1.5, 0.5, 45, 101, 167, 100,
                  false, false, 2, null, null, false
               );
            } else if (data.type === 'chevron' && state.currentJob?.isActive) {
               DrawMarker(
                  20, data.gps[0], data.gps[1], data.gps[2], 
                  0.0, 0.0, 0.0, 0, 180, 0, 
                  1.5, 1.5, 1, 45, 101, 167, 100,
                  false, true, 2, null, null, false
               );
            }
         }

         if ((data.distance >= distance && state.currentJob?.isActive) || (data.distance >= distance && data.name === 'outfit')) {
            FARMING_DATA.currentName = data.name; continue;
         }
      }

      if (
         FARMING_DATA.currentName && !inVeh && 
         !IsEntityDead(pedID) &&
         !IsPauseMenuActive()
      ) {
         if (IsControlJustPressed(0, 38)) {
            FARMING_DATA.isOpen = true;

            if (FARMING_DATA.currentName === 'outfit') {
               SetNuiFocus(true, true);
               SendNUIMessage({ type: 'outfit' });

            } else if (!FARMING_DATA.timeoutID) {
               if (exports.NewStart_Inventory.info('isRequest')) {
                  return exports.NewStart_Notifications.showAttention('error', 'من فضلك انتظر قليلاً حتي استعمال هذا!');
                  
               } else if (FARMING_DATA.currentName === 'box') { // =========> box
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 12)?.count; 

                  if (!count || count < 1) {
                     FARMING_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي عدة الزراعة!');
                  }

                  FARMING_PROGRESS_JOB({ itemID: 12, count, receive: { id: 39, title: 'صندوق فارغ' }, canMove: true});

               } else if (FARMING_DATA.currentName === 'pickUp') { // =========> pickUp
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 39)?.count; 

                  if (!count || count < 1) {
                     FARMING_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي صناديق فارغة!');
                  }

                  // and edit finalID
                  FARMING_PROGRESS_JOB({ itemID: 39, count, receive: { id: 40, title: 'صندوق خضروات وفواكه' }});

               } else { // ===========> reward
                  if (exports.NewStart_Tools.method('getInfo').seaPortClosed) {
                     return exports.NewStart_Notifications.showAttention('error', 'الميناء البحري مغلق يمكنك العودة عند السابعة صباحًا!');  
                  }
                  
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 40)?.count;

                  if (!count || count < 1) {
                     FARMING_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي صناديق خضروات وفواكه!');
                  }

                  FARMING_PROGRESS_JOB({ itemID: 40, count, canMove: true });
               }
            }

         } else if (!FARMING_DATA.isOpen && !FARMING_DATA.runClose && !exports.NewStart_Tools.method('isProgress')) {
            const find = FARMING_DATA.locations.find(obj => obj.name === FARMING_DATA.currentName);
            SendNUIMessage({ type: 'entranceOpen', text: find.text });
         }

         FARMING_DATA.runClose = true;

      } else if (FARMING_DATA.runClose) {
         CLOSE_FARMING_JOB();
      }
   });
}

// --- 
function CLOSE_FARMING_JOB() {
   FARMING_DATA.isOpen = false;
   FARMING_DATA.runClose = false;

   SetNuiFocus(false, false);
   SendNUIMessage({ type: 'closeUI' });
   if (FARMING_DATA.timeoutID) exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
   if (state.objectID) toggleAnim('farming', false);

   clearTimeout(FARMING_DATA.timeoutID);
   FARMING_DATA.timeoutID = null;
}

// ---
function FARMING_OUTFIT(withBlips) {
   const pedID =  PlayerPedId();
   const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');

   SetPedComponentVariation(pedID, 11, isMale ? 22 : 73, 0, 0); // top
   SetPedComponentVariation(pedID, 8, 15, 0, 0); // undershirt
   SetPedComponentVariation(pedID, 3, isMale ? 30 : 44, 0, 0); // torso
   SetPedComponentVariation(pedID, 4, isMale ? 90 : 93, 8, 0); // leg
   SetPedComponentVariation(pedID, 6, 24, 0, 0); // shoe
   if (withBlips) FARMING_BLIPS();
}

// ---
function FARMING_BLIPS() {
   for (let obj of FARMING_DATA.locations) {
      if (obj.name === 'outfit') continue;

      const blip = createBlip(514, "ﺔﻴﻨﻃﻮﻟﺍ ﻉﺭﺍﺰﻤﻟﺍ", obj.gps, 3);
      FARMING_DATA.blips.push(blip);
   }
}

// ---
function QUIT_FARMING_JOB() {
   CLOSE_FARMING_JOB();
   
   for (let blip of [...FARMING_DATA.blips, FARMING_DATA.blipMain]) {
      RemoveBlip(blip);
   }

   if (FARMING_DATA.vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: FARMING_DATA.vehID }));
   clearTick(FARMING_DATA.tickID);

   FARMING_DATA.blips = [];
   FARMING_DATA.tickID = null;
   FARMING_DATA.vehID = null;
}

// ---
function FARMING_PROGRESS_JOB({ itemID, receive, count, canMove = false }) {
   PlaySoundFrontend(-1, 'Select_Placed_Prop', 'DLC_Dmod_Prop_Editor_Sounds', false);

   if (count > FARMING_DATA.maxCount) count = FARMING_DATA.maxCount;

   if (FARMING_DATA.currentName === 'pickUp') {
      const space = exports.NewStart_Inventory.staticData().find((i) => i.id === receive.id).space;
      const current = exports.NewStart_Inventory.info('currentItems').find(i => i.id === receive.id);

      if (current) {
         const result = (current.count * space) + (space * count);

         if (result > FARMING_DATA.maxKG) {
            return exports.NewStart_Notifications.showAttention('error', `يسمح فقط بـ${FARMING_DATA.maxKG} كجم في اليد من المنتج النهائي، وأضبط عدد الصناديق!`);
         }
      }

      toggleAnim('farming', true);
   }

   exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: `${(FARMING_DATA.time * count / 1000).toFixed(1)}s`, status: true, canMove });
   SendNUIMessage({ type: 'closeUI' });

   FARMING_DATA.timeoutID = setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      if (state.objectID) toggleAnim('farming', false);

      const find = FARMING_DATA.locations.find(obj => obj.name === FARMING_DATA.currentName);
      if (find) SendNUIMessage({ type: 'entranceOpen', text: find.text });
      
      let isLoseInv = exports.NewStart_Inventory.info('currentItems').find(i => i.id === itemID)?.count;
      isLoseInv = isLoseInv < count || !isLoseInv;

      // execute
      if (!isLoseInv) {
         exports.NewStart_Inventory.removeItem(JSON.stringify({ id: itemID, count }));

         if (!receive) {
            exports.NewStart_Bank.method('giveCash', { name: jobsList.find(i => i.id === state.currentJob.id).name, amount: FARMING_DATA.money * count });
            exports.NewStart_MainMenu.levelUp(FARMING_DATA.exp * count);

         } else {
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: receive.id, count }));
            exports.NewStart_Notifications.showAttention('success', `لقد حصلت للتو على +${count} ${ receive.title }.`);
         }
         
      } else {
         exports.NewStart_Notifications.showAttention('error', 'لقد فشلت العملية لفقدان بعض المواد اللازمة!');
      }

      FARMING_DATA.timeoutID = null;
      FARMING_DATA.isOpen = false;
   }, FARMING_DATA.time * count);
}