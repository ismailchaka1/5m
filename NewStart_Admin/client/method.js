/* ``````````` ## Development By el8rbawY ## ```````````*/
const Wait = ms => new Promise(res => setTimeout(res, ms));

// ---
onNet('NewStart_Admin:methods-client', async (type, data) => {
   const pedID = PlayerPedId();

   switch (type) {
      case 'addBigAds':
         SendNUIMessage(JSON.stringify({ type, item: data.extra || data.type || data }));

         if (state.adminRole && data === 'level') {
            SendNUIMessage(JSON.stringify({ type: 'openUI', info: { general: [{ name: 'doubleLevel', isActive: true }] }, isUpdate: true }));

         } else if (state.adminRole && data.type === 'comfort') {
            SendNUIMessage(JSON.stringify({ type: 'openUI', info: { general: [{ name: 'comfort', isActive: data.value }] }, isUpdate: true }));
         }

         if (data.type === 'comfort') {
            state.isComfort = data.value;
            exports.NewStart_HudSystem.method('setStateNUI', { isComfort: data.value });

         } else if (data.type === 'doubleTaboo') {
            state.isDoubleTaboo = data.value;
            exports.NewStart_HudSystem.method('setStateNUI', { isDoubleTaboo: data.value });
         }
         break;

      case 'changeGeneral':
         const comfort = data.find(i => i.name === 'comfort');
         const doubleTaboo = data.find(i => i.name === 'doubleTaboo');

         SendNUIMessage(JSON.stringify({ type: 'openUI', info: { general: data }, isUpdate: true }));

         if (comfort) {
            exports.NewStart_HudSystem.method('setStateNUI', { isComfort: comfort.isActive });
            state.isComfort = comfort.isActive;
         }
         
         if (doubleTaboo) {
            exports.NewStart_HudSystem.method('setStateNUI', { isDoubleTaboo: doubleTaboo.isActive });
            state.isDoubleTaboo = doubleTaboo.isActive;
         }
         break;

      case 'goToPlace':
         // state.goPlaceTimeID = setTimeout(() => { state.goPlaceTimeID = 0 }, 5000);
         SetEntityCoords(pedID, data[0] + 1, data[1] + 1, data[2] - 0.3);
         break;

      case 'console': console.log(data); break;

      default:
         state.spectate.lastCoords = GetEntityCoords(pedID);
         const [x, y, z] = data.coords;
         let targetID = 0; 

         RequestCollisionAtCoord(x, y, z);
         SetNuiFocus(true, false);
         HIDE_NUI_FROM_SCREEN(true);
         NetworkSetEntityInvisibleToNetwork(pedID, true);
         SetEntityVisible(pedID, false);
         SetEntityInvincible(pedID, true);
         SetEntityCoords(pedID, x, y, z + 10.0);
         FreezeEntityPosition(pedID, true);

         await Wait(1500);
         if (!state.spectate.complement) return;
         SetEntityCoords(pedID, x, y, z - 10.0);

         for (let clientID of GetActivePlayers()) {
            if (NetworkIsPlayerActive(clientID) && GetPlayerServerId(clientID) == data.serverID) {
               targetID = clientID; break;
            }
         }

         if (targetID) {
            state.spectate.targetPed = GetPlayerPed(targetID);
            state.spectate.isActive = true;

            RequestCollisionAtCoord(x, y, z);
            NetworkSetInSpectatorMode(true, state.spectate.targetPed);
            NetworkOverrideReceiveRestrictions(PlayerId(), true);
            // NetworkOverrideReceiveRestrictionsAll(true);
            SetNuiFocus(true, false);

            state.spectate.intervalID = setInterval(_=> {
               const coords = GetEntityCoords(state.spectate.targetPed);
               
               if (coords.every(num => !num)) {
                  exports.NewStart_Notifications.showAttention('error', 'هناك صعوبة للوصول للاعب قد يكون خرج من الخادم.');
                  endSpectate(true);
               }

               ExecuteCommand('+identifier');
            }, 1000);

         } else {
            exports.NewStart_Notifications.showAttention('error', 'هناك صعوبة للوصول للاعب قد يكون خرج من الخادم.');
            endSpectate(true);
         }
   }
});

// ---
async function goToWaypoint(value) {
   const waypoint = GetFirstBlipInfoId(8);

   if (DoesBlipExist(waypoint)) {
      const pedID = PlayerPedId();
      const [x, y, z] = GetBlipCoords(waypoint);

      SetNuiFocus(false, false);
      state.isOpen = false;
      SendNUIMessage(JSON.stringify({ type: 'closeUI' }));

      if (exports.NewStart_RealEstate.method('getCurrent', 'insideCode')) {
         emit('NewStart_RealEstate:handleInterior-client', 'safeExit');
      }

      SetPedCoordsKeepVehicle(pedID, x, y, z+1);
      emitNet('NewStart_Admin:handleGeneral-sevrer', { message: `← باستعمال انتقال الخريطة\nالسبب: ${value}` });

   } else {
      exports.NewStart_Notifications.showAttention('error', 'لم تقم بتحديد أي علامة على الخريطة!');
   }
}

// ---
function invisibility(value) {
   const pedID = PlayerPedId();

   if (value) {
      SetEntityAlpha(pedID, 100, false);
      state.visibleTick1 = setTick(() => {
         SetLocalPlayerVisibleLocally(true);
      });
      state.visibleTick2 = setInterval(_=> { 
         SetEntityVisible(pedID, false, false);
      }, 1000);

   } else {
      SetEntityAlpha(pedID, 255, false);
      SetEntityVisible(pedID, true, false);
      SetLocalPlayerVisibleLocally(false);
      clearTick(state.visibleTick1);
      clearInterval(state.visibleTick2);
   }
}

// ---
function endSpectate(noPed) {
   if (!state.spectate.lastCoords) return;
   const pedID = PlayerPedId();
   const [x, y, z] = state.spectate.lastCoords;

   if (!noPed) NetworkSetInSpectatorMode(false, state.spectate.targetPed);
   // NetworkOverrideReceiveRestrictions(PlayerId(), false);
   // NetworkOverrideReceiveRestrictionsAll(false);
   ExecuteCommand('-identifier');
   clearInterval(state.spectate.intervalID);
   SetEntityCoords(pedID, x, y, z);
   HIDE_NUI_FROM_SCREEN(false);
   NetworkSetEntityInvisibleToNetwork(pedID, false);
   SetEntityVisible(pedID, true);
   SetEntityInvincible(pedID, false);
   FreezeEntityPosition(pedID, false);

   if (noPed) {
      SetNuiFocus(true, true);
      SendNUIMessage(JSON.stringify({ type: 'endSpectate' }));
   }

   const code = exports.NewStart_RealEstate.method('getCurrent', 'insideCode');
   state.spectate = {};

   emitNet('NewStart_RealEstate:handleBucket-server', { type: code ? 'enter' : 'exit', code });
}

// ---
function HIDE_NUI_FROM_SCREEN(value) {
   if (!exports.NewStart_MainMenu.isOpen()) {
      if (value) {
         exports.NewStart_HudSystem.closeUI();
   
      } else {
         exports.NewStart_HudSystem.openHud();
      }
   
      DisplayRadar(!value);
      exports.NewStart_MainMenu.toggleAds(!value);
   }

   exports.NewStart_Phone.noticesToggle(value);
}