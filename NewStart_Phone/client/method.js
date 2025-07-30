/* ``````````` ## Development By el8rbawY ## ```````````*/
let tickID = null;
const Delay = (ms) => new Promise(res => setTimeout(res, ms));

// ---
onNet('NewStart_Phone:handleGeneral-client', (type, data) => {
   data = JSON.parse(data);

   if (type === 'mechanical') {
      SendNuiMessage(JSON.stringify({ type: 'setMechanical', info: data }));
   }
});

// ---
function openUI() {
   const phone = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 30);

   if (!phone) {
      return exports.NewStart_Notifications.showAttention('error', 'لا يوجد في حقيبتك أي هاتف ذكي!');
   }

   information = { ...phone.features, name: exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).name };
   const pedID = PlayerPedId();
   const [x, y, z] = GetEntityCoords(pedID, true);
   // const withReports = ['health'].includes(exports.NewStart_Factions.info()?.key) && exports.NewStart_Employee.data().isActive;

   const tools = exports.NewStart_Tools.method('getInfo');

   SendNuiMessage(JSON.stringify({ 
      type: 'openUI', info: information, withReports: false,
      rentData: exports.NewStart_TheStart.method('getRentItems'),
      time: tools.time, weather: tools.weather
   }));

   SetNuiFocus(true, true);
   playAnim('cellphone_text_in');

   options.phoneModel = CreateObject(-1038739674, x, y, z + 0.2, true, true, true);
   const bone = GetPedBoneIndex(pedID, 28422);

   SetCurrentPedWeapon(pedID, GetHashKey('weapon_unarmed'), true);
   AttachEntityToEntity(options.phoneModel, pedID, bone, 0.0, 0.0, 0.0, 0.0, 0.0, -0.0, true, true, false, true, 1.0, true);
   options.isOpen = true;
}

// ---
function playAnim(name, turnOff) {
   const pedID = PlayerPedId();
   const isVeh = IsPedInAnyVehicle(pedID, true);
   const dictionary = isVeh ? 'anim@cellphone@in_car@ps' : 'cellphone@';
   
   if (turnOff) StopAnimTask(pedID, dictionary, name, 1.0);
   else TaskPlayAnim(pedID, dictionary, name, 3, -1, -1, 50, 0, false, false, false);
}

// ---
function closeUI(isExit) {
   SetPauseMenuActive(true);
   DeleteEntity(options.phoneModel);
   const pedID = PlayerPedId();

   SetNuiFocus(false, false);
   options.isOpen = false;
   SetEnableHandcuffs(pedID, false);

   if (!isExit) {
      playAnim('cellphone_text_out');
   }

   setTimeout(_=> {
      if (isExit) playAnim('cellphone_call_out', true);
      else playAnim('cellphone_text_out', true);
   }, 100);
}

// ---
function closeForce() {
   SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
   if (options.isOpen) closeUI(true);
}

// ---
function startCall() {
   exports.NewStart_Radio.setActive(false);
   
   tickID = setTick(_=> {
      DisableControlAction(0, 38, true);  // E
      DisableControlAction(0, 166, true); // Options
      DisableControlAction(0, 57, true);  // Radio - F10
      DisableControlAction(0, 73, true);  // X
      DisableControlAction(0, 36, true);  // Ctrl
   });

   SetNuiFocus(false, false);
}

// ---
exports('method', (type, data) => {
   if (type === 'getData') {
      return options[data];

   } else if (type === 'setOptions') {
      SendNuiMessage(JSON.stringify({ type: 'setOptions', info: data }));

   } else if (type === 'call') {
      openUI();
      setTimeout(_=> SendNuiMessage(JSON.stringify({ type: 'goPath', name: `/call?number=${data}`, noFirst: true })), 500);

   } else if (type === 'vehRent') {
      return NetworkDoesNetworkIdExist(stateRent.vehID) ? NetToVeh(stateRent.vehID) : exports.NewStart_TheStart.method('vehRent');
   }
});