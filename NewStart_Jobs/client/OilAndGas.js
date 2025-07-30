/* ``````````` ## Development By el8rbawY ## ```````````*/
const OIL_DATA = { 
   tickID: null, vehID: null, blips: [], blipMain: null,
   isOpen: false, runClose: false, currentName: null, timeoutID: null,
   time: 2000, money: 390, exp: 15, maxCount: 10, maxSaleCount: 20, maxKG: 50, finalID: 36,
   spawnVeh: [47.9868, 6527.6967, 31.3692, 56.6929],
   locations: [
      { type: 'chevron', name: 'outfit', gps: [36.1714, 6549.2836, 31.4197], distance: 0.7 },
      { type: 'cylinder', name: 'firstStage', gps: [606.2901, 2887.0285, 39.3897], distance: 1.73, scale: 3.5, text: 'لاستخراج النفط' },
      { type: 'cylinder', name: 'secondStage', gps: [2678.2812, 1554, 24.4945], distance: 1.73, scale: 3.5, text: 'لتكرير النفط' },
      { type: 'cylinder', name: 'lastStage',  gps: [2923.2395, 4300.5756, 50.3084], distance: 1.9, scale: 3, text: 'للتحويل إلى وقود' },
      { name: 'reward', blipID: 436, title: 'ﺯﺎﻐﻟﺍﻭ ﻂﻔﻨﻟﺍ ﻊﻴﺑ', gps: [-3220.4658, 2848.6665, 9.2332], distance: 7, text: 'لتسليم الصناديق' }
   ]
};

// ---
function START_OIL_AND_GAS_JOB() {
   RequestModel(GetHashKey('mtanker2')); // vehicle
   RequestModel(1360563376); // DRILL
   RequestAnimDict('amb@world_human_const_drill@male@drill@base');
   
   OIL_DATA.blipMain = createBlip(436, 'ﺯﺎﻐﻟﺍﻭ ﻂﻔﻨﻟﺍ', OIL_DATA.locations[0].gps, 3, false);
   if (state.currentJob?.isActive) OIL_AND_GAS_BLIPS();
   
   OIL_DATA.tickID = setTick(_=> {
      const pedID = PlayerPedId();
      const [x, y, z] = GetEntityCoords(pedID, true);
      const inVeh = GetVehiclePedIsIn(pedID, false);
      OIL_DATA.currentName = null;

      for (let data of OIL_DATA.locations) {
         const distance = GetDistanceBetweenCoords(x, y, z, data.gps[0], data.gps[1], data.gps[2], true);

         if (distance < 50) {
            if (data.type === 'chevron') {
               DrawMarker(
                  20, data.gps[0], data.gps[1], data.gps[2], 
                  0.0, 0.0, 0.0,
                  0, 180, 50, 
                  1.5, 1.5, 1, 
                  45, 101, 167, 100,
                  false, false, 2, null, null, false
               );

            } else if (data.type === 'cylinder' && state.currentJob?.isActive) {
               DrawMarker(
                  1, data.gps[0], data.gps[1], data.gps[2] - 1, 
                  0.0, 0.0, 0.0,
                  0.0, 0, 0.0, 
                  data.scale || 1.5, data.scale || 1.5, 0.5, 
                  45, 101, 167, 100,
                  false, false, 2, null, null, false
               );
            }
         }

         if ((data.distance >= distance && state.currentJob?.isActive) || (data.distance >= distance && data.name === 'outfit')) {
            OIL_DATA.currentName = data.name; continue;
         }
      }

      if (
         OIL_DATA.currentName && !inVeh && 
         !IsEntityDead(pedID) &&
         !IsPauseMenuActive()
      ) {
         if (IsControlJustPressed(0, 38)) {
            OIL_DATA.isOpen = true;

            if (OIL_DATA.currentName === 'outfit') {
               SetNuiFocus(true, true);
               SendNUIMessage({ type: 'outfit', isVehDisabled: true });

            } else if (!OIL_DATA.timeoutID) { // with progress
               if (exports.NewStart_Inventory.info('isRequest')) {
                  return exports.NewStart_Notifications.showAttention('error', 'من فضلك انتظر قليلاً حتي استعمال هذا!');
                  
               } else if (OIL_DATA.currentName === 'firstStage') { // ===========> firstStage
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 33)?.count; 
                     
                  if (!count || count < 1) {
                     OIL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي عدة النفط والغاز!');
                  }

                  OIL_AND_GAS_PROGRESS_JOB({ itemID: 33, count, receive: { id: 34, title: 'نفط خام' }});
                  toggleAnim('oilAndGas', true);

               } else if (OIL_DATA.currentName === 'secondStage') { // ===========> secondStage
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 34)?.count; 

                  if (!count || count < 1) {
                     OIL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي النفط الخام!');
                  }

                  OIL_AND_GAS_PROGRESS_JOB({ itemID: 34, count, receive: { id: 35, title: 'نفط مكرر' }, canMove: true });

               } else if (OIL_DATA.currentName === 'lastStage') { // ===========> lastStage
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 35)?.count; 

                  if (!count || count < 1) {
                     OIL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي نفط مكرر!');
                  }

                  // and edit finalID
                  OIL_AND_GAS_PROGRESS_JOB({ itemID: 35, count, bonus: 5, receive: { id: 36, title: 'وقود مستخرج من النفط' }, canMove: true});
                  
               } else { // ===========> reward
                  if (exports.NewStart_Tools.method('getInfo').seaPortClosed) {
                     return exports.NewStart_Notifications.showAttention('error', 'الميناء البحري مغلق يمكنك العودة عند السابعة صباحًا!');  
                  }

                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 36)?.count; 

                  if (!count || count < 1) {
                     OIL_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي وقود مستخرج من النفط!');
                  }

                  OIL_AND_GAS_PROGRESS_JOB({ itemID: 36, count, canMove: true });
               }               
            }

         } else if (!OIL_DATA.isOpen && !OIL_DATA.runClose && !exports.NewStart_Tools.method('isProgress')) {
            const find = OIL_DATA.locations.find(obj => obj.name === OIL_DATA.currentName);
            SendNUIMessage({ type: 'entranceOpen', text: find.text });
         }

         OIL_DATA.runClose = true;

      } else if (OIL_DATA.runClose) {
         CLOSE_OIL_AND_GAS_JOB();
      }
   });
}

// ---
function CLOSE_OIL_AND_GAS_JOB() {
   OIL_DATA.isOpen = false;
   OIL_DATA.runClose = false;

   SetNuiFocus(false, false);
   SendNUIMessage({ type: 'closeUI' });

   if (OIL_DATA.timeoutID) exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
   if (state.objectID) toggleAnim('oilAndGas', false);

   clearTimeout(OIL_DATA.timeoutID);
   OIL_DATA.timeoutID = null;
}

// --- 
function QUIT_OIL_AND_GAS_JOB() {
   CLOSE_OIL_AND_GAS_JOB();
   
   for (let blip of [...OIL_DATA.blips, OIL_DATA.blipMain]) {
      RemoveBlip(blip);
   }

   if (OIL_DATA.vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: OIL_DATA.vehID }));
   clearTick(OIL_DATA.tickID);

   OIL_DATA.blips = [];
   OIL_DATA.tickID = null;
   OIL_DATA.vehID = null;
}

// ---
function OIL_AND_GAS_OUTFIT(withBlips) {
   const pedID =  PlayerPedId();
   const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');

   SetPedComponentVariation(pedID, 11, isMale ? 65 : 59, 0, 0); // top
   SetPedComponentVariation(pedID, 8, 15, 0, 0); // undershirt
   SetPedComponentVariation(pedID, 3, 1, 0, 0); // torso - with male
   SetPedComponentVariation(pedID, 4, 38, 0, 0); // leg
   SetPedComponentVariation(pedID, 6, 24, 0, 0); // shoe
   if (withBlips) OIL_AND_GAS_BLIPS();
}

// ---
function OIL_AND_GAS_BLIPS() {
   for (let obj of OIL_DATA.locations) {
      if (obj.name === 'outfit') continue;

      const blip = createBlip(436, 'ﺯﺎﻐﻟﺍﻭ ﻂﻔﻨﻟﺍ', obj.gps, 3);
      OIL_DATA.blips.push(blip);
   }
}

// ---
function OIL_AND_GAS_PROGRESS_JOB({ itemID, receive, count, bonus, canMove = false }) {
   PlaySoundFrontend(-1, 'Select_Placed_Prop', 'DLC_Dmod_Prop_Editor_Sounds', false);

   const countMax = OIL_DATA.currentName === 'reward' ? OIL_DATA.maxSaleCount : OIL_DATA.maxCount;
   if (count > countMax) count = countMax;

   if (OIL_DATA.currentName === 'lastStage') {
      const space = exports.NewStart_Inventory.staticData().find((i) => i.id === receive.id).space;
      const current = exports.NewStart_Inventory.info('currentItems').find(i => i.id === receive.id);

      if (current) {
         const result = (current.count * space) + (space * (bonus * count));

         if (result > OIL_DATA.maxKG) {
            return exports.NewStart_Notifications.showAttention('error', `يسمح فقط بـ${OIL_DATA.maxKG} كجم في اليد من المنتج النهائي، وأضبط عدد النفط!`);
         }
      }
   }

   exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: `${(OIL_DATA.time * count / 1000).toFixed(1)}s`, status: true, canMove });
   SendNUIMessage({ type: 'closeUI' });

   OIL_DATA.timeoutID = setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      if (state.objectID) toggleAnim('oilAndGas', false);

      const find = OIL_DATA.locations.find(obj => obj.name === OIL_DATA.currentName);
      if (find) SendNUIMessage({ type: 'entranceOpen', text: find.text });

      let isLoseInv = exports.NewStart_Inventory.info('currentItems').find(i => i.id === itemID)?.count;
      isLoseInv = isLoseInv < count || !isLoseInv;

      // execute
      if (!isLoseInv) {
         exports.NewStart_Inventory.removeItem(JSON.stringify({ id: itemID, count }));

         if (!receive) {
            exports.NewStart_Bank.method('giveCash', { name: jobsList.find(i => i.id === state.currentJob.id).name, amount: OIL_DATA.money * count });
            exports.NewStart_MainMenu.levelUp(OIL_DATA.exp * count);

         } else {
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: receive.id, count: bonus ? parseInt(bonus * count) : count }));
            exports.NewStart_Notifications.showAttention('success', `لقد حصلت للتو على +${count} ${ receive.title }.`);
         }
         
      } else {
         exports.NewStart_Notifications.showAttention('error', 'لقد فشلت العملية لفقدان بعض المواد اللازمة!');
      }

      OIL_DATA.timeoutID = null;
      OIL_DATA.isOpen = false;
   }, OIL_DATA.time * count);
}