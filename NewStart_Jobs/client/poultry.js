/* ``````````` ## Development By el8rbawY ## ```````````*/
const POULTRY_DATA = { 
   tickID: null, vehID: null, blips: [], blipMain: null,
   isOpen: false, runClose: false, currentName: null, timeoutID: null,
   time: 2000, money: 135, exp: 4, maxCount: 20, maxKG: 40, finalID: 79,
   spawnVeh: [-64.8659, 6277.5957, 30.6446, 121.8897],
   locations: [
      { type: 'cylinder', name: 'outfit', gps: [-68.8370, 6254.9624, 31.0827], distance: 1.5, scale: 2.8 },
      { type: 'chevron', name: 'chicken', gps: [-68.3736, 6248.5053, 31.0827, -35], distance: 3.2, text: 'للحصول علي دجاج' },
      { type: 'cylinder', name: 'hanging', gps: [-88.0747, 6235.4638, 31.0827], distance: 3.5, scale: 1.2, text: 'ذبح وسلخ الدجاج' },
      { type: 'cylinder', name: 'fill', gps: [-99.9164, 6210.4482, 31.0153], distance: 3.5, scale: 1.2, text: 'للتقطيع والتعبئة' },
      { name: 'reward', blipID: 171, title: 'ﻦﺟﺍﻭﺪﻟﺍ ﻊﻴﺑ', gps: [-3339.4548, 2888.9802, 9.2285], distance: 6.5, text: 'لتسليم الصناديق' }
   ]
};

function START_POULTRY_JOB() {
   RequestModel(-1207771834); // vehicle
   RequestModel(652737713); // box
   RequestModel(436978267); // knife
   RequestAnimDict('anim@heists@ornate_bank@grab_cash_heels');
   RequestAnimDict('anim@amb@business@coc@coc_unpack_cut_left@')

   POULTRY_DATA.blipMain = createBlip(171, "ﺔﻴﻨﻃﻮﻟﺍ ﻦﺟﺍﻭﺪﻟﺍ", POULTRY_DATA.locations[0].gps, 3, false);
   if (state.currentJob?.isActive) POULTRY_BLIPS();

   POULTRY_DATA.tickID = setTick(_=> {
      const pedID = PlayerPedId();
      const coords = GetEntityCoords(pedID, true);
      const inVeh = IsPedInAnyVehicle(pedID, false);
      POULTRY_DATA.currentName = null;

      for (let data of POULTRY_DATA.locations) {
         const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], data.gps[0], data.gps[1], data.gps[2], true);

         if (distance < 25 && !POULTRY_DATA.timeoutID) {
            if (data.type === 'cylinder' && (data.name === 'outfit' || state.currentJob?.isActive)) {
               DrawMarker(
                  1, data.gps[0], data.gps[1], data.gps[2] - 1, 
                  0.0, 0.0, 0.0, 0.0, 0, 0.0, 
                  data.scale || 1.5, data.scale || 1.5, 0.5, 45, 101, 167, 100,
                  false, false, 2, null, null, false
               );

            } else if ((data.type === 'chevron' && state.currentJob?.isActive)) {
               DrawMarker(
                  20, data.gps[0], data.gps[1], data.gps[2], 
                  0.0, 0.0, 0.0, 0, 180, data.gps[3], 
                  1, 1, 0.7, 45, 101, 167, 100,
                  false, false, 2, null, null, false
               );
            }
         }

         if ((data.distance >= distance && state.currentJob?.isActive) || (data.distance >= distance && data.name === 'outfit')) {
            POULTRY_DATA.currentName = data.name; continue;
         }
      }

      if (
         POULTRY_DATA.currentName && !inVeh && 
         !IsEntityDead(pedID) &&
         !IsPauseMenuActive()
      ) {
         if (IsControlJustPressed(0, 38)) {
            POULTRY_DATA.isOpen = true;

            if (POULTRY_DATA.currentName === 'outfit') {
               SetNuiFocus(true, true);
               SendNUIMessage({ type: 'outfit' });

            } else if (!POULTRY_DATA.timeoutID) {
               if (exports.NewStart_Inventory.info('isRequest')) {
                  return exports.NewStart_Notifications.showAttention('error', 'من فضلك انتظر قليلاً حتي استعمال هذا!');
                  
               } else if (POULTRY_DATA.currentName === 'chicken') { // =========> chicken
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 3)?.count; 

                  if (!count || count < 1) {
                     POULTRY_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك على عدة الدواجن!');
                  }

                  POULTRY_PROGRESS_JOB({ itemID: 3, count, receive: { id: 77, title: 'دجاجة' }});
                  SetEntityHeading(pedID, 35);
                  SetEntityCoords(pedID, -68.0881, 6248.125, 30.0827, false, false, false, false);
                  TaskStartScenarioInPlace(pedID, 'CODE_HUMAN_MEDIC_KNEEL', 0, true);

               } else if (POULTRY_DATA.currentName === 'hanging') { // =========> hanging
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 77)?.count;

                  if (!count || count < 1) {
                     POULTRY_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون لديك الدجاج لتنفيذ العملية!');
                  }

                  POULTRY_PROGRESS_JOB({ itemID: 77, count, receive: { id: 78, title: 'دجاج مذبوح' }});
                  SetEntityHeading(pedID, 119.0551);
                  SetEntityCoords(pedID, -88.6661, 6235.2211, 30.090, false, false, false, false);
                  toggleAnim('poultry2', true);

               } else if (POULTRY_DATA.currentName === 'fill') { // =========> fill
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 78)?.count;

                  if (!count || count < 1) {
                     POULTRY_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون لديك الدجاج المذبوح لتنفيذ العملية!');
                  }

                  // and edit finalID
                  POULTRY_PROGRESS_JOB({ itemID: 78, count, bonus: 5, receive: { id: 79, title: 'صندوق الدجاج' }});

               } else { // ===========> reward
                  if (exports.NewStart_Tools.method('getInfo').seaPortClosed) {
                     return exports.NewStart_Notifications.showAttention('error', 'الميناء البحري مغلق يمكنك العودة عند السابعة صباحًا!');  
                  }
                  
                  const count = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 79)?.count;

                  if (!count || count < 1) {
                     POULTRY_DATA.isOpen = false;
                     return exports.NewStart_Notifications.showAttention('error', 'يجب أن تحتوي حقيبتك علي صناديق الدجاج!');
                  }

                  POULTRY_PROGRESS_JOB({ itemID: 79, count, canMove: true });
               }
            }

         } else if (!POULTRY_DATA.isOpen && !POULTRY_DATA.runClose && !exports.NewStart_Tools.method('isProgress')) {
            const find = POULTRY_DATA.locations.find(obj => obj.name === POULTRY_DATA.currentName);
            SendNUIMessage({ type: 'entranceOpen', text: find.text });
         }

         POULTRY_DATA.runClose = true;

      } else if (POULTRY_DATA.runClose) {
         CLOSE_POULTRY_OUTFIT();
      }
   });
}

// ---
function CLOSE_POULTRY_OUTFIT() {
   POULTRY_DATA.isOpen = false;
   POULTRY_DATA.runClose = false;

   SetNuiFocus(false, false);
   SendNUIMessage({ type: 'closeUI' });

   if (POULTRY_DATA.timeoutID) exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
   if (state.objectID) toggleAnim('poultry', false);

   clearTimeout(POULTRY_DATA.timeoutID);
   POULTRY_DATA.timeoutID = null;
}

// ---
function POULTRY_OUTFIT(withBlips) {
   const pedID =  PlayerPedId();
   const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');

   SetPedComponentVariation(pedID, 11, isMale ? 22 : 14, 0, 0); // top
   SetPedComponentVariation(pedID, 8, 15, 0, 0); // undershirt
   SetPedComponentVariation(pedID, 3, isMale ? 63 : 83, 0, 0); // torso
   SetPedComponentVariation(pedID, 4, isMale ? 36 : 35, 0, 0); // leg
   SetPedComponentVariation(pedID, 6, 24, 0, 0); // shoe
   if (withBlips) POULTRY_BLIPS();
}

// ---
function POULTRY_BLIPS() {
   for (let obj of POULTRY_DATA.locations) {
      if (obj.name === 'outfit') continue;

      const blip = createBlip(171, "ﺔﻴﻨﻃﻮﻟﺍ ﻦﺟﺍﻭﺪﻟﺍ", obj.gps, 3);
      POULTRY_DATA.blips.push(blip);
   }
}

// ---
function QUIT_POULTRY_JOB() {
   CLOSE_POULTRY_OUTFIT();
   
   for (let blip of [...POULTRY_DATA.blips, POULTRY_DATA.blipMain]) {
      RemoveBlip(blip);
   }

   if (POULTRY_DATA.vehID) emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: POULTRY_DATA.vehID }));
   clearTick(POULTRY_DATA.tickID);

   POULTRY_DATA.blips = [];
   POULTRY_DATA.tickID = null;
   POULTRY_DATA.vehID = null;
}

// ---
function POULTRY_PROGRESS_JOB({ itemID, receive, count, bonus, canMove = false }) {
   PlaySoundFrontend(-1, 'Select_Placed_Prop', 'DLC_Dmod_Prop_Editor_Sounds', false);

   if (count > POULTRY_DATA.maxCount) count = POULTRY_DATA.maxCount;

   if (POULTRY_DATA.currentName === 'fill') {
      const space = exports.NewStart_Inventory.staticData().find((i) => i.id === receive.id).space;
      const current = exports.NewStart_Inventory.info('currentItems').find(i => i.id === receive.id);

      if (current) {
         const result = (current.count * space) + (space * (bonus * count));

         if (result > POULTRY_DATA.maxKG) {
            return exports.NewStart_Notifications.showAttention('error', `يسمح فقط بـ${POULTRY_DATA.maxKG} كجم في اليد من المنتج النهائي، وأضبط عدد الدجاج!`);
         }
      }

      const pedID = PlayerPedId();
      SetEntityHeading(pedID, 50);
      SetEntityCoords(pedID, -100.1406, 6210.7514, 30.0153, false, false, false, false);
      toggleAnim('poultry', true);
   }

   exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: `${(POULTRY_DATA.time * count / 1000).toFixed(1)}s`, status: true, canMove });
   SendNUIMessage({ type: 'closeUI' });

   POULTRY_DATA.timeoutID = setTimeout(_=> {
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });

      if (state.objectID) toggleAnim('poultry', false);
      else if (IsPedUsingAnyScenario(PlayerPedId())) ClearPedTasksImmediately(PlayerPedId());
      
      const find = POULTRY_DATA.locations.find(obj => obj.name === POULTRY_DATA.currentName);
      if (find) SendNUIMessage({ type: 'entranceOpen', text: find.text });

      let isLoseInv = exports.NewStart_Inventory.info('currentItems').find(i => i.id === itemID)?.count;
      isLoseInv = isLoseInv < count || !isLoseInv;

      // execute
      if (!isLoseInv) {
         exports.NewStart_Inventory.removeItem(JSON.stringify({ id: itemID, count }));

         if (!receive) {
            exports.NewStart_Bank.method('giveCash', { name: jobsList.find(i => i.id === state.currentJob.id).name, amount: POULTRY_DATA.money * count });
            exports.NewStart_MainMenu.levelUp(POULTRY_DATA.exp * count);

         } else {
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: receive.id, count: bonus ? parseInt(bonus * count) : count }));
            exports.NewStart_Notifications.showAttention('success', `لقد حصلت للتو على +${count} ${ receive.title }.`);
         }
         
      } else {
         exports.NewStart_Notifications.showAttention('error', 'لقد فشلت العملية لفقدان بعض المواد اللازمة!');
      }

      POULTRY_DATA.timeoutID = null;
      POULTRY_DATA.isOpen = false;
   }, POULTRY_DATA.time * count);
}