/* ``````````` ## Development By el8rbawY ## ```````````*/
const METAL_DATA = { 
   tickID: null, vehID: null, blips: [], blipMain: null,
   isOpen: false, runClose: false, currentName: null, timeoutID: null,
   time: 4500, timeSale: 2000, maxCount: 2, maxNextCount: 20,
   items: [
      { id: 82, title: 'ألماس ', price: 6250, exp: 20, pct: 1 },   // diamond 
      { id: 83, title: 'ذهب', price: 3780, exp: 38, pct: 1 },      // gold
      { id: 84, title: 'بلاتينيوم', price: 2500, exp: 12, pct: 5 }, // platinum
      { id: 85, title: 'فولاذ', price: 860, exp: 12, pct: 13 },     // steel
      { id: 86, title: 'ألومنيوم', price: 300, exp: 14, pct: 15 }, // aluminum
      { id: 87, title: 'حديد', price: 80, exp: 13, pct: 28 },      // iron
      { id: 88, title: 'نحاس', price: 100, exp: 10, pct: 37 },     // copper
   ],
   spawnVeh: [2560.5363, 2745.6264, 42.0520, 283.4645],
   locations: [
      { type: 'chevron', name: 'outfit', gps: [2569.3186, 2720.4526, 43, -31.1811], distance: 0.7 },
      { type: 'cylinder', name: 'rocks', gps: [-593.1123, 2079.0129, 131.3492], distance: 1.5, scale: 2.5, text: 'لاستخراج الصخور' },
      { type: 'cylinder', name: 'drop', gps: [2681.9208, 2798.8220, 40.3165, 178.5826], distance: 1.8, scale: 3.5, text: 'لوضع الصخور والاتربة' },
      { type: 'cylinder', name: 'slug', gps: [2654.9143, 2812.8264, 34.1325, 184.2519], distance: 1.8, scale: 3.5, text: 'للحصول علي المعادن' },
      { name: 'reward', blipID: 618, title: 'ﻥﺩﺎﻌﻤﻟﺍ ﻊﻴﺑ', gps: [-3099.0578, 2701.9645, 9.6793], distance: 5.5, text: 'لتسليم الصناديق' },
      // { name: 'reward', blipID: 618, title: 'ﻥﺩﺎﻌﻤﻟﺍ ﻊﻴﺑ', gps: [-3280.2329, 2801.0505, 9.2285], distance: 4.5, text: 'لتسليم الصناديق' },
      // { name: 'reward', blipID: 618, title: 'ﻥﺩﺎﻌﻤﻟﺍ ﻊﻴﺑ', gps: [-3710.8747, 2845.8593, 9.2285], subSeaPort: true, distance: 4.5, text: 'لتسليم الصناديق' }
   ]
};

function START_METAL_JOB() {
   RequestModel(-1207771834); // vehicle
   RequestModel(260873931); // tool
   RequestAnimDict('melee@large_wpn@streamed_core');

   METAL_DATA.blipMain = createBlip(618, 'ﻥﺩﺎﻌﻤﻟﺍ ﻢﺠﻨﻣ', METAL_DATA.locations[0].gps, 3, false);
   if (state.currentJob?.isActive) METAL_BLIPS();

   METAL_DATA.tickID = setTick(_=> {
      const pedID = PlayerPedId();
      const coords = GetEntityCoords(pedID, true);
      const inVeh = IsPedInAnyVehicle(pedID, false);
      let subSeaPort = false;
      METAL_DATA.currentName = null;

      for (let data of METAL_DATA.locations) {
         const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], data.gps[0], data.gps[1], data.gps[2], true);

         if (distance < 50) {
            if (data.type === 'cylinder' && state.currentJob?.isActive) {
               DrawMarker(
                  1, data.gps[0], data.gps[1], data.gps[2] - 1, 
                  0.0, 0.0, 0.0, 0.0, 0, 0.0, 
                  data.scale || 1.5, data.scale || 1.5, 0.5, 45, 101, 167, 100,
                  false, false, 2, null, null, false
               );

            } else if (data.type === 'chevron') {
               DrawMarker(
                  20, data.gps[0], data.gps[1], data.gps[2], 
                  0.0, 0.0, 0.0, 0, 180, data.gps[3], 
                  1.5, 1.5, 1, 45, 101, 167, 100,
                  false, false, 2, null, null, false
               );
            }
         }

         if ((data.distance >= distance && state.currentJob?.isActive) || (data.distance >= distance && data.name === 'outfit')) {
            subSeaPort = data.subSeaPort;
            METAL_DATA.currentName = data.name; continue;
         }
      }

      if (
         METAL_DATA.currentName && !inVeh && 
         !IsEntityDead(pedID) &&
         !IsPauseMenuActive()
      ) {
         if (IsControlJustPressed(0, 38)) {
            METAL_DATA.isOpen = true;

            if (METAL_DATA.currentName === 'outfit') {
               SetNuiFocus(true, true);
               SendNUIMessage({ type: 'outfit', isVehDisabled: true });

            } else if (!METAL_DATA.timeoutID) {
               if (METAL_DATA.currentName === 'rocks') { // =========> rocks
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 75)?.count; 

                  if (!count || count < 1) {
                     METAL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي عدة المعادن!');
                  }

                  METAL_PROGRESS_JOB({ itemID: 75, count, receive: { id: 80, title: 'صخرة' }});
                  toggleAnim('metal', true);

               } else if (METAL_DATA.currentName === 'drop') { // =========> drop
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 80)?.count; 

                  if (!count || count < 1) {
                     METAL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون لديك الصخور لتنفيذ العملية!');
                  }

                  METAL_PROGRESS_JOB({ itemID: 80, count, receive: { id: 81, title: 'صخرة معدن' }, canMove: true });
                  TaskAchieveHeading(pedID, METAL_DATA.locations.find(l => l.name === METAL_DATA.currentName).gps[3], 0);

               } else if (METAL_DATA.currentName === 'slug') { // =========> slug
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 81)?.count; 

                  if (!count || count < 1) {
                     METAL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون لديك صخور المعادن لتنفيذ العملية!');
                  }

                  METAL_PROGRESS_JOB({ itemID: 81, count, canMove: true, receive: Array.from(
                     { length: count > METAL_DATA.maxNextCount ? METAL_DATA.maxNextCount : count }, () => randomByPercentage(METAL_DATA.items)
                  )});
                  TaskAchieveHeading(pedID, 184.2519, 0);

               } else { // ===========> reward
                  if (exports.NewStart_Tools.method('getInfo').seaPortClosed) {
                     return exports.NewStart_Notifications.showAttention('error', 'الميناء البحري مغلق يمكنك العودة عند السابعة صباحًا!');
                     
                  } else if (!exports.NewStart_Tools.method('getInfo').subSeaPortClosed && !subSeaPort) {
                     return exports.NewStart_Notifications.showAttention('error', 'التسليم مغلق هنا يمكنك التسليم فى التوسعة الفرعية!');

                  } else if (exports.NewStart_Tools.method('getInfo').subSeaPortClosed && subSeaPort) {
                     return exports.NewStart_Notifications.showAttention('error', 'التسليم مغلق هنا يمكنك التسليم فى التوسعة الرئيسية!');
                  }

                  const count = exports.NewStart_Inventory.info('currentItems').filter(obj => METAL_DATA.items.some(i => i.id === obj.id)).reduce((a, b) => a + b.count, 0);

                  if (!count || count < 1) {
                     METAL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي المعادن للتسليم!');
                  }

                  METAL_PROGRESS_JOB({ count, canMove: true });
               }
            }

         } else if (!METAL_DATA.isOpen && !METAL_DATA.runClose && !exports.NewStart_Tools.method('isProgress')) {
            const find = METAL_DATA.locations.find(obj => obj.name === METAL_DATA.currentName);
            SendNUIMessage({ type: 'entranceOpen', text: find.text });
         }

         METAL_DATA.runClose = true;

      } else if (METAL_DATA.runClose) {
         CLOSE_METAL_OUTFIT();
      }
   });
}

// ---
function CLOSE_METAL_OUTFIT() {
   METAL_DATA.isOpen = false;
   METAL_DATA.runClose = false;

   SetNuiFocus(false, false);
   SendNUIMessage({ type: 'closeUI' });

   if (METAL_DATA.timeoutID) exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
   if (state.objectID) toggleAnim('metal', false);

   clearTimeout(METAL_DATA.timeoutID);
   METAL_DATA.timeoutID = null;
}

// ---
function METAL_OUTFIT(withBlips) {
   const pedID =  PlayerPedId();
   const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');

   SetPedPropIndex(pedID, 0, isMale ? 145 : 144, 0, true); // hat
   SetPedComponentVariation(pedID, 11, isMale ? 22 : 73, 0, 0); // top
   SetPedComponentVariation(pedID, 8, isMale? 59 : 36, 0, 0); // undershirt
   SetPedComponentVariation(pedID, 3, isMale ? 63 : 83, 0, 0); // torso
   SetPedComponentVariation(pedID, 4, isMale ? 36 : 35, 0, 0); // leg
   SetPedComponentVariation(pedID, 6, 24, 0, 0); // shoe
   if (withBlips) METAL_BLIPS();
}

// ---
function METAL_BLIPS() {
   for (let obj of METAL_DATA.locations) {
      if (obj.name === 'outfit') continue;

      const blip = createBlip(618, 'ﻥﺩﺎﻌﻤﻟﺍ ﻢﺠﻨﻣ', obj.gps, 3);
      METAL_DATA.blips.push(blip);
   }
}

// ---
function QUIT_METAL_JOB() {
   CLOSE_METAL_OUTFIT();
   
   for (let blip of [...METAL_DATA.blips, METAL_DATA.blipMain]) {
      RemoveBlip(blip);
   }

   if (METAL_DATA.vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: METAL_DATA.vehID }));
   clearTick(METAL_DATA.tickID);

   METAL_DATA.blips = [];
   METAL_DATA.tickID = null;
   METAL_DATA.vehID = null;
}

// ---
function METAL_PROGRESS_JOB({ itemID, receive, count, canMove = false }) {  
   const countMax = METAL_DATA.currentName === 'rocks' ? METAL_DATA.maxCount : METAL_DATA.maxNextCount;
   const time = METAL_DATA.currentName === 'reward' ? METAL_DATA.timeSale : METAL_DATA.time;

   if (count > countMax) count = countMax;
   exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: `${(time * count / 1000).toFixed(1)}s`, status: true, canMove });
   SendNUIMessage({ type: 'closeUI' });

   console.log(`${(time * count / 1000).toFixed(1)}s`);

   // start progress
   METAL_DATA.timeoutID = setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      
      if (state.objectID) toggleAnim('metal', false);
      else ClearPedTasks(PlayerPedId());

      const find = METAL_DATA.locations.find(obj => obj.name === METAL_DATA.currentName);
      if (find) SendNUIMessage({ type: 'entranceOpen', text: find.text });

      let isLoseInv = 0, filter = null;

      if (METAL_DATA.currentName === 'reward') {
         filter = exports.NewStart_Inventory.info('currentItems').filter(obj => METAL_DATA.items.some(i => i.id === obj.id));
         isLoseInv = filter.reduce((a, b) => a + b.count, 0);

      } else if (METAL_DATA.currentName) {
         isLoseInv = exports.NewStart_Inventory.info('currentItems').find(i => i.id === itemID)?.count;
      }
      
      isLoseInv = isLoseInv < count || !isLoseInv;

      // execute
      if (!isLoseInv) {
         if (filter) {
            let total = 0;
            filter.forEach(obj => (total < count) ? (obj.count = Math.min(count - total, obj.count), total += obj.count) : (obj.count = 0));

            const money = filter.reduce((a, b) => a + (METAL_DATA.items.find(i => i.id === b.id).price * b.count), 0);
            const level = filter.reduce((a, b) => a + (METAL_DATA.items.find(i => i.id === b.id).exp * b.count), 0);

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
            
            exports.NewStart_Notifications.showAttention('success', `تعدين ناجح، لقد حصلت للتو على المعادن!`);
            
         } else {
            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: itemID, count }));
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: receive.id, count: METAL_DATA.currentName === 'rocks' ? count * 10 : count }));
            exports.NewStart_Notifications.showAttention('success', `لقد حصلت للتو على +${count} ${ receive.title }.`);
         }
         
      } else {
         exports.NewStart_Notifications.showAttention('error', 'لقد فشلت العملية لفقدان بعض المواد اللازمة!');
      }

      METAL_DATA.timeoutID = null;
      METAL_DATA.isOpen = false;
   }, time * count);
}