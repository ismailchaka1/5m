/* ``````````` ## Development By el8rbawY ## ```````````*/
const FISHING_DATA = { 
   tickID: null, vehID: null, blips: [], blipMain: null,
   isOpen: false, runClose: false, currentName: null, timeoutID: null,
   time: 6000, timeSale: 2000, maxCount: 1, MaxGiveCount: 2, maxSaleCount: 5, maxKG: 40,
   items: [
      { id: 89, title: 'أسماك ', price: 295, exp: 11, pct: 95 },
      { id: 90, title: 'سمك نادر', price: 310, exp: 13, pct: 5 },
   ],
   spawnVeh: {
      boat: [877.1604, 3716.6506, 30.2065, 354.33071],
      car: [869.4329, 3673.5561, 32.0769, 354.3307]
   },
   locations: [
      { type: 'cylinder', name: 'outfit', gps: [863.0637, 3676.6682, 32.7509], distance: 0.7, scale: 1.2 },
      { type: 'hide', name: 'hunting', gps: [1968.7648, 4257.0859, 30.0043], distance: 227, scale: 450, text: 'لبدء الصيد' },
      { name: 'reward', blipID: 317, title: 'ﻙﺎﻤﺳﻷﺍ ﻊﻴﺑ', gps: [-3533.6850, 2982.9104, 9.2390], distance: 4.5, text: 'لتسليم الصناديق' },
      // { name: 'reward', blipID: 317, title: 'ﻙﺎﻤﺳﻷﺍ ﻊﻴﺑ', gps: [-3673.5166, 2881.0285, 9.2285], subSeaPort: true, distance: 4.5, text: 'لتسليم الصناديق' }
   ]
};

function START_FISHING_JOB() {
   RequestModel(-1743316013); // car
   RequestModel(4012021193); // boat
   RequestModel(-1910604593); // hook
   RequestAnimDict('amb@world_human_stand_fishing@base');

   FISHING_DATA.blipMain = createBlip(317, 'ﻙﺎﻤﺳﻷﺍ ﺪﻴﺻ', FISHING_DATA.locations[0].gps, 3, false);
   if (state.currentJob?.isActive) FISHING_BLIPS();

   FISHING_DATA.tickID = setTick(_=> {
      const pedID = PlayerPedId();
      const coords = GetEntityCoords(pedID, true);
      const inVeh = IsPedInAnyVehicle(pedID, false);
      let subSeaPort = false;
      FISHING_DATA.currentName = null;

      for (let data of FISHING_DATA.locations) {
         const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], data.gps[0], data.gps[1], data.gps[2], true);

         if (distance < 50 && data.type !== 'hide') {
            if (data.type === 'cylinder' && (data.name === 'outfit' || state.currentJob?.isActive)) {
               DrawMarker(
                  1, data.gps[0], data.gps[1], data.gps[2] - 1, 
                  0.0, 0.0, 0.0, 0.0, 0, 0.0, 
                  data.scale || 1.5, data.scale || 1.5, 0.5, 45, 101, 167, 100,
                  false, false, 2, null, null, false
               );
            }
         }

         if ((data.distance >= distance && state.currentJob?.isActive) || (data.distance >= distance && data.name === 'outfit')) {
            subSeaPort = data.subSeaPort;
            FISHING_DATA.currentName = data.name; continue;
         }
      }

      if (
         FISHING_DATA.currentName && !inVeh &&
         !IsEntityDead(pedID) &&
         !IsPauseMenuActive() && 
         !(FISHING_DATA.timeoutID && FISHING_DATA.currentName === 'hunting' && IsPedSwimming(pedID))
      ) {
         if (IsControlJustPressed(0, 38)) {
            FISHING_DATA.isOpen = true;

            if (FISHING_DATA.currentName === 'outfit') {
               const vehID = FISHING_DATA.vehID ? NetworkGetEntityFromNetworkId(FISHING_DATA.vehID) : 0;

               SetNuiFocus(true, true);
               SendNUIMessage({ type: 'outfit', vehType: GetVehicleClass(vehID) === 14 ? 'car' : 'boat' });

            } else if (!FISHING_DATA.timeoutID) {
               if (exports.NewStart_Inventory.info('isRequest')) {
                  return exports.NewStart_Notifications.showAttention('error', 'من فضلك انتظر قليلاً حتي استعمال هذا!');
                  
               } else if (FISHING_DATA.currentName === 'hunting') { // =========> hunting
                  if (IsPedSwimming(pedID)) {
                     FISHING_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون علي قارب أو أي سطح مرتفع!');
                  }

                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 76)?.count; 

                  if (!count || count < 1) {
                     FISHING_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي عدة الصيد!');
                  }

                  FISHING_PROGRESS_JOB({ itemID: 76, count, receive: Array.from({ length: FISHING_DATA.MaxGiveCount }, () => randomByPercentage(FISHING_DATA.items)) });

               } else { // ===========> reward
                  if (exports.NewStart_Tools.method('getInfo').seaPortClosed) {
                     return exports.NewStart_Notifications.showAttention('error', 'الميناء البحري مغلق يمكنك العودة عند السابعة صباحًا!');
                     
                  } else if (!exports.NewStart_Tools.method('getInfo').subSeaPortClosed && !subSeaPort) {
                     return exports.NewStart_Notifications.showAttention('error', 'التسليم مغلق هنا يمكنك التسليم فى التوسعة الفرعية!');

                  } else if (exports.NewStart_Tools.method('getInfo').subSeaPortClosed && subSeaPort) {
                     return exports.NewStart_Notifications.showAttention('error', 'التسليم مغلق هنا يمكنك التسليم فى التوسعة الرئيسية!');
                  }

                  const count = exports.NewStart_Inventory.info('currentItems').filter(obj => FISHING_DATA.items.some(i => i.id === obj.id)).reduce((a, b) => a + b.count, 0);

                  if (!count || count < 1) {
                     FISHING_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'ليس لديك أي نوع أسماك لتسليمها!');
                  }

                  FISHING_PROGRESS_JOB({ count, canMove: true });
               }
            }

         } else if (!FISHING_DATA.isOpen && !FISHING_DATA.runClose && !exports.NewStart_Tools.method('isProgress')) {
            const find = FISHING_DATA.locations.find(obj => obj.name === FISHING_DATA.currentName);
            SendNUIMessage({ type: 'entranceOpen', text: find.text });
         }

         FISHING_DATA.runClose = true;

      } else if (FISHING_DATA.runClose) {
         CLOSE_FISHING_OUTFIT();
      }
   });
}

function CLOSE_FISHING_OUTFIT() {
   FISHING_DATA.isOpen = false;
   FISHING_DATA.runClose = false;

   SetNuiFocus(false, false);
   SendNUIMessage({ type: 'closeUI' });

   if (FISHING_DATA.timeoutID) exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
   if (state.objectID) toggleAnim('fishing', false);

   clearTimeout(FISHING_DATA.timeoutID);
   FISHING_DATA.timeoutID = null;
}

// ---
function FISHING_OUTFIT(withBlips) {
   const pedID =  PlayerPedId();
   const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');

   SetPedPropIndex(pedID, 0, isMale ? 94 : 93, 0, true); // hat
   SetPedComponentVariation(pedID, 11, isMale ? 16 : 49, 0, 0); // top
   SetPedComponentVariation(pedID, 8, 15, 0, 0); // undershirt
   SetPedComponentVariation(pedID, 3, isMale ? 0 : 14, 0, 0); // torso
   SetPedComponentVariation(pedID, 4, isMale ? 9 : 11, 0, 0); // leg
   SetPedComponentVariation(pedID, 6, isMale ? 24 : 72, 0, 0); // shoe
   if (withBlips) FISHING_BLIPS();
}

// ---
function FISHING_BLIPS() {
   for (let obj of FISHING_DATA.locations) {
      if (obj.name === 'outfit') continue;

      if (obj.name === 'hunting') {
         const blip = AddBlipForRadius(obj.gps[0], obj.gps[1], obj.gps[2], 227);

         SetBlipHighDetail(blip, true);
         SetBlipColour(blip, 38);
         SetBlipAlpha (blip, 50);
         FISHING_DATA.blips.push(blip);
      }
      
      const blip = createBlip(317, 'ﻙﺎﻤﺳﻷﺍ ﺪﻴﺻ', obj.gps, 3);
      FISHING_DATA.blips.push(blip);
   }
}

// ---
function QUIT_FISHING_JOB() {
   CLOSE_FISHING_OUTFIT();
   
   for (let blip of [...FISHING_DATA.blips, FISHING_DATA.blipMain]) {
      RemoveBlip(blip);
   }

   if (FISHING_DATA.vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: FISHING_DATA.vehID }));
   clearTick(FISHING_DATA.tickID);

   FISHING_DATA.blips = [];
   FISHING_DATA.tickID = null;
   FISHING_DATA.vehID = null;
}

// ---
function FISHING_PROGRESS_JOB({ itemID, receive, count, canMove = false }) {
   PlaySoundFrontend(-1, 'Select_Placed_Prop', 'DLC_Dmod_Prop_Editor_Sounds', false);

   const isReward = FISHING_DATA.currentName === 'reward';
   const countMax = isReward ? FISHING_DATA.maxSaleCount : FISHING_DATA.maxCount;
   const time = isReward ? FISHING_DATA.timeSale : FISHING_DATA.time;

   if (count > countMax) count = countMax;

   if (FISHING_DATA.currentName === 'hunting') {  
      const space = exports.NewStart_Inventory.staticData().find((i) => i.id === receive[0].id).space;
      const current = exports.NewStart_Inventory.info('currentItems').filter(i => receive.some(r => r.id === i.id)).reduce((t, i) => t + i.count, 0);

      if (current) {
         const result = (current * space) + (space * receive.length);

         if (result > FISHING_DATA.maxKG) {
            return exports.NewStart_Notifications.showAttention('error', `يسمح فقط بـ${FISHING_DATA.maxKG} كجم في اليد من المنتج النهائي، وأضبط عدد العدة!`);
         }
      }

      toggleAnim('fishing', true);
   }

   exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: `${(time * count / 1000).toFixed(1)}s`, status: true, canMove });
   SendNUIMessage({ type: 'closeUI' });

   // start progress
   FISHING_DATA.timeoutID = setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      if (state.objectID) toggleAnim('fishing', false);

      const find = FISHING_DATA.locations.find(obj => obj.name === FISHING_DATA.currentName);
      if (find) SendNUIMessage({ type: 'entranceOpen', text: find.text });

      let isLoseInv = 0, filter = null;

      if (FISHING_DATA.currentName === 'reward') {
         filter = exports.NewStart_Inventory.info('currentItems').filter(obj => FISHING_DATA.items.some(i => i.id === obj.id));
         isLoseInv = filter.reduce((a, b) => a + b.count, 0);

      } else if (FISHING_DATA.currentName) {
         isLoseInv = exports.NewStart_Inventory.info('currentItems').find(i => i.id === itemID)?.count;
      }
      
      isLoseInv = isLoseInv < count || !isLoseInv;

      // execute
      if (!isLoseInv) {
         if (filter) {
            let total = 0;
            filter.forEach(obj => (total < count) ? (obj.count = Math.min(count - total, obj.count), total += obj.count) : (obj.count = 0));

            const money = filter.reduce((a, b) => a + (FISHING_DATA.items.find(i => i.id === b.id).price * b.count), 0);
            const level = filter.reduce((a, b) => a + (FISHING_DATA.items.find(i => i.id === b.id).exp * b.count), 0);

            for (let item of filter) {
               if (item.count) exports.NewStart_Inventory.removeItem(JSON.stringify({ id: item.id, count: item.count }));
            }

            exports.NewStart_Bank.method('giveCash', { name: jobsList.find(i => i.id === state.currentJob.id).name, amount: money });
            exports.NewStart_MainMenu.levelUp(level);

         } else if (Array.isArray(receive)) {
            const filter = receive.reduce((arr, current) => {
               const existingItem = arr.find(item => item.id === current.id);
               
               if (existingItem) existingItem.count++;
               else arr.push({ id: current.id, count: 1, name: current.name });
               return arr;
            }, []);

            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: itemID, count }));
            for (let item of filter) exports.NewStart_Inventory.addItem(JSON.stringify({ id: item.id, count: item.count }));
            
            exports.NewStart_Notifications.showAttention('success', `صيد ناجح، لقد حصلت للتو على الأسماك!`);
         }
         
      } else {
         exports.NewStart_Notifications.showAttention('error', 'لقد فشلت العملية لفقدان بعض المواد اللازمة!');
      }

      FISHING_DATA.timeoutID = null;
      FISHING_DATA.isOpen = false;
   }, time * count);
}