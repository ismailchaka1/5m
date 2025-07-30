/* ``````````` ## Development By el8rbawY ## ```````````*/
const state = {
   extraKG: 0, isFirst: true, isOpen: false, isOpenExchange: false, isRequest: false,
   smoking: null, currentWeapons: [], showCursor: false
}

let staticData = [], currentKG = 0, maxKG = 150, currentItems = [];

// ---
function setCurrentKG() {
   sum = currentItems.reduce((total, obj) => {
      return total + (obj.count * staticData.find(res => res.id === obj.id).space);
   }, 0);

   currentKG = parseFloat((sum).toFixed(1)) + state.extraKG;
}

// ---
on('playerSpawned', _=> {
   if (state.isFirst) {
      RequestAnimDict('nmt_3_rcm-10');
      RequestAnimDict('clothingtie');
      RequestAnimDict('amb@prop_human_parking_meter@female@base');
      weaponsLoad(); state.isFirst = false;
   }
});

// ---
onNet('NewStart_Inventory:initial-client', data => {
   data = JSON.parse(data);
   staticData = data.itemsData;
   RequestAnimDict('weapon@w_sp_jerrycan');
   RequestAnimSet('MOVE_M@DRUNK@VERYDRUNK');
   RequestAnimDict('amb@world_human_aa_smoke@male@idle_a');
   
   if (data.current) {
      currentItems = data.current;
      setCurrentKG();
   }

   SendNUIMessage(JSON.stringify({ 
      type: 'initialStatic', 
      itemsData: staticData, maxKG,
      load: { main: data.current, other: null }
   }));
});

// ---
onNet('NewStart_Inventory:update-client', (name, data) => {
   data = JSON.parse(data);

   if (name === 'currentItems') {
      currentItems = data;

      SendNUIMessage(JSON.stringify({ type: 'setData', action: 'main', items: data }));
      exports.NewStart_Industry.methods('currentUpdate', data);
      exports.NewStart_Radio.setActive();
      exports.NewStart_Business.method('materialsUpdate');
      weaponsLoad(false, true); setCurrentKG();

      for (let item of currentItems) { // remove
         if (item.count < 1) {
            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: item.id, count: item.count }));
         }
      }

      state.isRequest = false;

   } else if (name === 'getItemsOther') {
      SendNUIMessage(JSON.stringify({ type: 'setData', action: 'other', items: data.items, maxKG: data.maxKG }));

   } else if (name === 'getPlayers') {
      // const need = exports.NewStart_MainMenu.method('validLevel', 'inventory').need;

      for (let item of data) {
         // const level = exports.NewStart_MainMenu.getLevel(item.level);
         // item.level = level < need ? need : 0;
         item.level = 0;
      }

      SendNUIMessage(JSON.stringify({ type: 'playerList', items: data }));

   } else if (name === 'addMoney') {
      const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
      StatSetInt('MP0_WALLET_BALANCE', cash + data);
      emit('NewStart_HudSystem:handleGeneral-client', 'setMoney');
   }
});

// ---
onNet('NewStart_Inventory:additem-client', (info, isLocal = false) => {
   info = JSON.parse(info);

   if (info.id === 1) {
      emit('NewStart_HudSystem:handleGeneral-client', 'setMoney');
   }

   if (isLocal) {
      SendNUIMessage(JSON.stringify({ type: 'addItem', info }));
      
   } else {      
      if (info.id === 1) {
         const find = currentItems.find(i => i.id === 1);

         if (find) {
            const cash = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1)[1];
            if (cash !== (find.count + info.count)) { info.count = cash; info.noInc = true; }
         }
      }

      emitNet('NewStart_Inventory:addItem-server', JSON.stringify(info));
   }
});

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {
   switch (data?.type) {
      case 'useItem': useItem(data.info); break;

      case 'removeItem':         
         handleRemove(data.info.drop);
         delete data.info.drop;
         
         emitNet('NewStart_Inventory:removeItem-server', JSON.stringify(data.info));

         if (currentItems.find(obj => obj._id === data.info._id)?.id === 32) {
            exports.NewStart_Radio.method('temporaryKick');
         }
         break;

      case 'transfer':
         if (data.from.name === 'main' && !currentItems.some(obj => obj.id === data.item.id)) return;
         const find = staticData.find(i => i.id === data.item.id);

         if (data.other.type === 'player') {
            const myPed = GetEntityCoords(GetPlayerPed(-1), true);
            const coord = GetEntityCoords(GetPlayerPed(data.other.clientID), true);
            const distance = GetDistanceBetweenCoords(myPed[0], myPed[1], myPed[2], coord[0], coord[1], coord[2], true);

            if (data.item.id === 30) return cb('OK!'); // phone

            if (distance > 2.5) {
               emit('NewStart_Inventory:additem-client', JSON.stringify(data.item), true);
               exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون قريب من اللاعب، أقترب وأعِد فتح القائمة.');
               
               return cb('OK!');
            }

            if (data.item.id === 1) {
               const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);

               StatSetInt('MP0_WALLET_BALANCE', cash - data.item.count);
               emit('NewStart_HudSystem:handleGeneral-client', 'setMoney');
               if ((cash - data.item.count) < 0) return cb('OK!');
            }

            SendNUIMessage(JSON.stringify({ type: 'playerList', isClose: true }));

            // if (find.isTaboo && !find.skipTaboo) {
            //    exports.NewStart_Police.reports('taboos');
            // }   

         } else if (data.other.type === 'faction' && find.isTaboo) {
            const vehicle = exports.NewStart_VehicleDealership.getData('vehicles').find(obj => obj.hash === data.other.id).name;
            emitNet('NewStart_PoliceTools:handleGeneral-server', 'inventoryLog', JSON.stringify({ key: exports.NewStart_Factions.info().key, vehName: vehicle, action: data.from.name, title: find.title, ...data.item }));
         }

         if (data.from.name === 'other' && [40, 79, 89, 90, 36].includes(data.item.id)) { // jobs limit
            const job = exports.NewStart_Jobs.method('finalIDs').find(i => Array.isArray(i.id) ? i.id.some(s => s.id === data.item.id) : i.id === data.item.id);
            let result = 0;

            if (job) {
               if ([89, 90].includes(data.item.id)) { // fishing
                  const current = currentItems.filter(i => job.id.some(r => r.id === i.id)).reduce((t, i) => t + i.count, 0);
                  result = (current ? (current * find.space) : 0) + (find.space * data.item.count);
   
               } else { // other
                  const current = currentItems.find(i => i.id === data.item.id);
                  result = (current ? (current.count * find.space) : 0) + (find.space * data.item.count);
               }
            }

            if (result > job.maxKG) {
               // and edit in => RegisterCommand('+inventory', _=> {
               emitNet('NewStart_Inventory:getItemsOther-server', JSON.stringify(
                  data.other.type === 'vehicle' ? { id: data.other.id, type: 'vehicle' } : { type: data.other.type, id: data.other.id, otherID: data.other.otherID }
               ));

               exports.NewStart_Notifications.showAttention('error', `مسموح فقط بـ${job.maxKG} كجم في اليد لهذا المنتج، أضبط الكمية المحوله أولاً!`);
               return cb('OK!');
            }
         }

         SendNUIMessage(JSON.stringify({ type: 'disableAll', value: true }));
         exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '3s', status: true, canMove: true });

         if (data.item.id === 32) {
            const find = currentItems.find(obj => obj.id === 32)?.count;

            if (data.from.name === 'main') {
               const count = (find || 0) - data.item.count;

               if (count < 1) {
                  exports.NewStart_Radio.method('temporaryKick');
               }
            }
         }

         emitNet('NewStart_Inventory:transfer-server', JSON.stringify(data));

         setTimeout(() => {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
            SendNUIMessage(JSON.stringify({ type: 'disableAll', value: false }));
         }, 3000);
         break;

      case 'notification':
         exports.NewStart_Notifications.showAttention('error', data.text);
         break;

      case 'players':
         const ids = [];
         const pedID = PlayerPedId();
         const myPedCoords = GetEntityCoords(pedID, true);

         for (let value of GetActivePlayers()) {
            const playerPedID = GetPlayerPed(value);

            // if (playerPedID !== pedID) {
               const coord = GetEntityCoords(playerPedID, true);
               const distance = GetDistanceBetweenCoords(myPedCoords[0], myPedCoords[1], myPedCoords[2], coord[0], coord[1], coord[2], true);
   
               if (distance <= 3) ids.push({ clientID: value, serverID: GetPlayerServerId(value) });
            // }
         }

         if (ids.length) emitNet('NewStart_Inventory:getPlayers-server', JSON.stringify(ids));
         break;

      case 'hideCursor': if (!state.showCursor) SetNuiFocus(false, false); break;

      default: // closeUI
         state.isOpen = false;
         state.isOpenExchange = false;
         SetNuiFocus(false, false);
         state.showCursor = false;
         vehOpenID = null;

         if (vehTrunkID) {
            SetVehicleDoorShut(vehTrunkID, 5, false);
            vehTrunkID = null;
         }
   }

   cb('OK!');
});

// ---
exports('staticData', _=> staticData);
exports('info', type => ({ maxKG, currentKG, currentItems, isOpenExchange: state.isOpenExchange, isOpen: state.isOpen, extraKG: state.extraKG, isRequest: state.isRequest })[type]);
exports('addItem', (info, validKG) => {
   const item = JSON.parse(info);

   if (validKG) {   
      const space = staticData.find(i => i.id === item.id).space;
      if (currentKG + (space * item.count) > maxKG) return false;
   }

   state.isRequest = true;
   emit('NewStart_Inventory:additem-client', info);
   exports.NewStart_Tools.inventory('add', item);
   return true;
});

exports('removeItem', info => {
   info = JSON.parse(info);
   const index = currentItems.findIndex(obj => obj.id === info.id);
   const isClear = currentItems[index].count === info.count;

   emitNet(
      'NewStart_Inventory:removeItem-server', 
      JSON.stringify({ _id: currentItems[index]._id, from: 'main', count: info.count, isClear })
   );

   // for safe
   if (isClear) currentItems.splice(index, 1);
   else currentItems[index].count -= info.count;

   exports.NewStart_Tools.inventory('remove', info);
});

exports('method', (type, data, more) => {
   if (type === 'setExtraKG') {
      state.extraKG = data;
      setCurrentKG();

   } else if (type === 'smoking') {
      if (data === 'done') {
         ClearPedTasks(PlayerPedId());
         clearTimeout(state.smoking);
         state.smoking = null;

      } else return !!state.smoking;

   } else if (type === 'weaponsLoad') {
      if (more?.isGet) {
         return state.currentWeapons;

      } else {
         weaponsLoad(data);
      }

   } else if (type === 'openExchange') {
      state.isOpen = true;
      SetNuiFocus(true, true);
      state.isOpenExchange = true;

      SendNUIMessage(JSON.stringify({ 
         type: 'openExchange', extraKG: state.extraKG, noKeyBoard: true,
         info: { type: data.type, id: data.id, title: data.name }
      }));

      emitNet('NewStart_Inventory:getItemsOther-server', JSON.stringify({ type: data.type, id: data.id }));

   } else if (type === 'showCursor') {
      state.showCursor = true;
      SetNuiFocus(true, true);
      setTimeout(_=> { state.showCursor = false }, 150);

   } else { // removeAll
      const findRadio = currentItems.find(obj => obj.id === 32);

      if (findRadio) {
         setTimeout(_=> exports.NewStart_Radio.method('temporaryKick'), 500);
      }
   
      if (!data) { // skip or no
         const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
         const money = parseInt(cash / 2);
         
         if (money > 1) {
            emitNet('NewStart:moneyDecrease', { name: 'الانتقال للمستشفي', from: 'cash', price: money });
            StatSetInt('MP0_WALLET_BALANCE', cash - money);
            emit('NewStart_Inventory:additem-client', JSON.stringify({ id: 1, count: -money }));
         }         
      }

      exports.NewStart_Tools.inventory('removeAll');
      emitNet('NewStart_Inventory:removeItem-server', JSON.stringify({ from: 'removeAll' }));
   }
});

exports('closeUI', _=> {
   state.isOpen = false;
   state.isOpenExchange = false;
   state.showCursor = false;
   SetNuiFocus(false, false);
   SendNUIMessage(JSON.stringify({ type: 'close' }));
   vehOpenID = null;

   if (vehTrunkID) {
      SetVehicleDoorShut(vehTrunkID, 5, false);
      vehTrunkID = null;
   }
});