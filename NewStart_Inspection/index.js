/* ``````````` ## Development By el8rbawY ## ```````````*/
let state = {
   info: {}
}

// ---
onNet('NewStart_Inspection:initial-client', data => {
   data = JSON.parse(data);
   const static = exports.NewStart_Inventory.staticData();
   const items = data.items.map(item => ({ ...static.find(obj => obj.id === item.id), ...item }));

   state.info.isItems = true;
   data.items = items;

   if (state.info.type === 'vehicle') {
      data.name = `مركبة ${GetVehicleNumberPlateText(state.info.distanceID)}`;  
      if (data.serverID) state.info.serverID;
   }

   SendNuiMessage(JSON.stringify({ 
      type: 'setData', 
      items: data.items, 
      info: {
         name: data.name,
         currentKG: exports.NewStart_Inventory.info('currentKG'),
         sumKG: exports.NewStart_Inventory.info('currentKG'),
         maxKG: exports.NewStart_Inventory.info('maxKG'),
      } 
   }));
});

// ---
onNet('NewStart_Inspection:closeUI-client', withNUI => {
   if (state.info.type === 'vehicle') {
      SetVehicleDoorShut(state.info.distanceID, 5, false);

   } else if (state.info.type === 'player') {
      const distance = getDistance();

      if (state.info.isItems && distance <= 10 && GetPlayerServerId(state.info.distanceID) === state.info.serverID) {
         emitNet('NewStart_Inspection:handleData-server', 'done', state.info.serverID);
      }
   }

   if (withNUI) SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
   SetNuiFocus(false, false);
   state.isOpen = false;
   state.info = {};
});

// ---
function getDistance() {
   const pedID = PlayerPedId();
   const coords = GetEntityCoords(pedID, true);
   const targetID = state.info.type === 'player' ? GetPlayerPed(state.info.distanceID) : state.info.distanceID;
   const [x, y, z] = GetEntityCoords(targetID, true);

   return GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);
}

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   if (data.type === 'dragging') {
      if (state.info.type === 'house') {
         if (exports.NewStart_RealEstate.method('getCurrent', 'insideCode') !== state.info.code) {
            exports.NewStart_Notifications.showAttention('error', 'فشل سحب العناصر لابتعادك عن العقار!');

         } else {
            emitNet(
               'NewStart_Inspection:handleData-server', 'dragging', 
               { type: 'house', code: state.info.code, items: data.choices, key: exports.NewStart_Factions.info().key }
            );
         }

      } else {
         const clientID = state.info.type === 'player' ? state.info.distanceID : state.info.clientID;
         const distance = getDistance();

         if (distance <= 10 && GetPlayerServerId(clientID) === state.info.serverID) {
            const info = { type: state.info.type, playerID: state.info.serverID, items: data.choices };         
            
            if (info.type === 'vehicle') {
               const private = exports.NewStart_VehicleSystem.method('vehiclePrivate', state.info.distanceID);

               if (private) {
                  info.plate = private;

               } else {
                  info.hash = GetEntityModel(state.info.distanceID);
                  info.hashOther = GetEntityArchetypeName(state.info.distanceID);
               }
            }

            emitNet('NewStart_Inspection:handleData-server', 'dragging', { ...info, key: exports.NewStart_Factions.info().key });

         } else {
            exports.NewStart_Notifications.showAttention('error', 'فشل سحب العناصر لابتعاد المصدر عنك!');
         }
      }
   }

   emit('NewStart_Inspection:closeUI-client');
   cb('OK!');
});

// ---
exports('data', _=> ({ handcuffed }));

// ---
exports('closeUI', () => {
   if (handcuffed) stopHandcuff();

   if (state.isOpen) {
      emit('NewStart_Inspection:closeUI-client', true);
   }
});

// ---
exports('method', (type) => {
   if (type === 'handcuffToggle') {
      policeToggleHandcuff();
   }
});