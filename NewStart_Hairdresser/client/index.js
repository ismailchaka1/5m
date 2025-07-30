/* ``````````` ## Development By el8rbawY ## ```````````*/
let options = {
   cameraID: null, playerPed: null, isFirst: true,
   isOpen: false, runClose: false
};

const coordinates = [
   // { id: 1, x: -815.512, y: -183.903, z: 37.553, h: 220 },
   // { id: 2, x: -1282.984, y: -1117.635, z: 6.987, h: 2.834 },
   // { id: 3, x: -33.428, y: -152.123, z: 57.065, h: 249.448 },
   // { id: 4, x: 137.353, y: -1708.509, z: 29.279, h: 50 },
   // { id: 5, x: 1212.118, y: -473.380, z: 66.197, h: 342.5 },
   { id: 6, type: 'main', x: 1932.7252, y: 3730.2856, z: 32.8352, h: 126 },
   { id: 7, x: 1931.3143, y: 3732.8308, z: 32.8352, h: 126 },
   { id: 8, type: 'main', x: -279.2694, y: 6227.8286, z: 31.6893, h: 320 },
   { id: 9, x: -277.1276, y: 6225.7451, z: 31.6893, h: 320 }
];

// -- Barber Shops In Map
onNet('NewStart_Hairdresser:initial-client', data => {
   data = JSON.parse(data);

   for (let item of coordinates.filter(i => i.type === 'main')) {
      const blip = AddBlipForCoord(item.x, item.y, item.z);

      SetBlipSprite(blip, 71);
      BeginTextCommandSetBlipName("STRING");
      AddTextComponentString('<font face="A9eelsh">ﺔﻗﻼﺣ ﻥﻮﻟﺎﺻ</font>');
      EndTextCommandSetBlipName(blip);
      SetBlipAsShortRange(blip, true);
   }

   if (data.ped) { // from database
      options.playerPed = data.ped;

   } else {
      options.playerPed = {
         hair: { color: 3, style: data.gender === 'male' ? 1 : 2 },
         eyes: { color: 0, style: -1, opacity: 1 },
         eyebrows: { color: 1, style: 0, opacity: 1 },
         lipstick: { color: 0, style: -1, opacity: 1 },
         facial: { color: 3, style: -1, opacity: 1 },
         blusher: { color: 0, style: -1, opacity: 1 }
      }
   }
});

// ---
on('playerSpawned', _=> { 
   if (options.isFirst) {
      setTimeout(_=> pedReset(), 0);
      options.isFirst = false;
   }
});

// --
setTick(_=> {
   let currentMarker = null;
   const pedID = PlayerPedId();
   const player = GetEntityCoords(pedID, true);

   for (let item of coordinates) {
      const distance = GetDistanceBetweenCoords(player[0], player[1], player[2], item.x, item.y, item.z, true);

      if (distance < 20) {
         DrawMarker(1, item.x, item.y, item.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1, 1, 0.25, 22, 24, 29, 255, false, false, 2, null, null, false);
         if (distance < 0.8) { currentMarker = item; break; }
      }
   }

   if (
      currentMarker && 
      !IsEntityDead(pedID) &&
      !IsPauseMenuActive()
   ) {
      if (IsControlJustPressed(0, 38)) {
         let isClearHead = true;

         for (let item of exports.NewStart_Clothes.items()) {
            if (['mask', 'glass', 'hat', 'ear'].includes(item.name)) {
               let value;

               if (item.type === 'main') value = GetPedDrawableVariation(pedID, item.id);
               else value = GetPedPropIndex(pedID, item.id);

               if (value > 0) { isClearHead = false; break; }
            }
         }

         if (!isClearHead) {
            return exports.NewStart_Notifications.showAttention('error', 'من فضلك يجب إزالة أي شئ علي وجهك أولاً!');

         } else if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
            return exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس خاصة بمهمة تخلص منها أولاً.');

         }
         
         const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');
         
         SendNUIMessage(JSON.stringify({ type: 'open', isMale }));
         SetNuiFocus(true, true);

         options.isOpen = true;
         SetEntityCoords(pedID, currentMarker.x, currentMarker.y, currentMarker.z - 1, false, false, false, true);

         DisplayRadar(false);
         exports.NewStart_HudSystem.closeUI();
         exports.NewStart_MainMenu.toggleAds(false);
         exports.NewStart_Phone.noticesToggle(true);
         
         setTimeout(_=> {
            createCam(currentMarker);
            SetEntityHeading(pedID, currentMarker.h);
         }, 0);

      } else if (!options.isOpen && !options.runClose) {
         SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
         DisableControlAction(pedID, 21, true);
      }

      options.runClose = true;

   } else if (options.runClose) {
      SendNUIMessage(JSON.stringify({ type: 'close' }));
      options.runClose = false;
      
      if (options.isOpen) {
         closeUI(); pedReset();
      }
   }
});

// ---
exports('method', (type) => {
   if (type === 'playerPed') {
      return options.playerPed;

   } else if (options.isOpen) { // closeUI
      SendNUIMessage(JSON.stringify({ type: 'close' }));
      closeUI(); pedReset();
   }
});