/* ``````````` ## Development By el8rbawY ## ```````````*/
let options = {
   isOpen: false, cameraID: null, runClose: false, tickID: null,
   currentMarker: null, playerPed: null, textures: null, noCursor: false, lastCam: 'face',
   pedDefault: {
      mask: 0, bag: 0, top: { male: 7, female: 1 }, hat: 0, 
      glass: 0, ear: 0, torso: 1, shoe: { male: 1, female: 3 },
      undershirt: { male: 16, female: 26 }, badge: 0, watch: 0, 
      accessory: 0, bracelet: 0, leg: { male: 1, female: 74 }, armor: 0
   }
}

// ---
onNet('NewStart_Clothes:initial-client', data => {
   data = JSON.parse(data);

   for (let item of coordinates.filter(i => i.type === 'main')) {
      const blip = AddBlipForCoord(item.marker.x, item.marker.y, item.marker.z);

      SetBlipSprite(blip, 73);
      SetBlipAsShortRange(blip, true);
      BeginTextCommandSetBlipName("STRING");
      AddTextComponentString('<font face="A9eelsh">ﺲﺑﻼﻤﻟﺍ ﺮﺠﺘﻣ</font>');
      EndTextCommandSetBlipName(blip);
   }

   if (data.outfit) options.playerPed = data.outfit;
   else options.playerPed = { ...options.pedDefault };

   if (data.textures) options.textures = data.textures;
   else options.textures = ids.reduce((o, i) => ({ ...o, [i.name]: 0 }), {});
});

// ---
on('NewStart_Clothes:firstLoad-client', _=> { 
   if (!exports.NewStart_Jobs.currentJob().isActive && !exports.NewStart_Employee.data().isActive && !exports.NewStart_Mechanical.method('info', 'isIn')) {
      if (options.playerPed.itemID === 107) { // diving
         exports.NewStart_Taboos.method('divingSuit', { noNotice: true });
         delete options.playerPed.itemID;

      } else {
         const isMale = GetEntityModel(PlayerPedId()) === GetHashKey('mp_m_freemode_01');
         pedReset(true, isMale);
      }
   }
});

// ---
setTick(_=> {
   const pedID = PlayerPedId(); 
   const player = GetEntityCoords(pedID, true);

   for (let item of coordinates) {
      const distance = GetDistanceBetweenCoords(player[0], player[1], player[2], item.marker.x, item.marker.y, item.marker.z, true);

      if (distance < 25 && !options.isOpen) {
         DrawMarker(1, item.marker.x, item.marker.y, item.marker.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.7, 0.7, 0.25, 22, 24, 29, 200, false, false, 2, null, null, false);

         if (distance < 0.85) {
            options.currentMarker = { id: item.id, coord: item.marker };
            break;

         } else {
            options.currentMarker = null;
         }
      }
   }

   if (
      options.currentMarker && 
      !IsPauseMenuActive() &&
      !IsEntityDead(pedID)
   ) {
      if (IsControlJustPressed(0, 38)) {
         if (exports.NewStart_Mechanical.method('info', 'isIn') || exports.NewStart_Employee.method('inJob')) {
            return exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس العمل تخلص منها أولاً!');

         } else if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
            return exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس خاصة بمهمة تخلص منها أولاً.');
         }

         SetNuiFocus(true, true);

         options.isOpen = true;
         SetEntityCoords(pedID, options.currentMarker.coord.x, options.currentMarker.coord.y, options.currentMarker.coord.z - 1, false, false, false, true);
         exports.NewStart_Options.clothesReset();
         pedReset();
         DisplayRadar(false);
         SendNUIMessage(JSON.stringify({ 
            type: 'open', 
            info: data, 
            isMale: GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01'), 
            playerPed: options.playerPed 
         }));
         
         exports.NewStart_HudSystem.closeUI();
         exports.NewStart_MainMenu.toggleAds(false);
         exports.NewStart_Phone.noticesToggle(true);

         setTimeout(_=> {
            createCam('face', options.currentMarker);
            SetEntityHeading(pedID, options.currentMarker.coord.h);
         }, 0);

      } else if (!options.isOpen && !options.runClose) {
         DisableControlAction(pedID, 21, true);
         SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
      }

      options.runClose = true;

   } else if (options.runClose) {
      SendNUIMessage(JSON.stringify({ type: 'close' }));
      options.runClose = false;

      if (options.isOpen) {
         exports.NewStart_Options.clothesReset();
         closeUI(); pedReset();
      }         
   }
});

// ---
exports('method', (type, data) => {
   if (data) data = JSON.parse(data);

   if (type === 'setClothes') {
      if (typeof Object.values(data)[0] !== 'object') {
         options.playerPed = data;

      } else {
         const drawables = {}, textures = {};

         for (let key in data) {
            drawables[key] = data[key].drawableID;
            textures[key] = data[key].textureID;
         }
   
         options.playerPed = drawables;
         options.textures = textures;
   
         emitNet('NewStart_Clothes:payment-server', JSON.stringify({ outfit: drawables, textures }));
         exports.NewStart_Options.clothesReset();
      }

   } else if (type === 'getTextures') {
      return options.textures;
   }
});

// ---
exports('playerPed', isDefault => {
   if (isDefault) {
      if (Object.values(options.pedDefault).some(i => typeof i === 'object')) {
         const gender = GetEntityModel(PlayerPedId()) === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';

         for (let key in options.pedDefault) {
            if (typeof options.pedDefault[key] === 'object') options.pedDefault[key] = options.pedDefault[key][gender];
         }
      }

      return options.pedDefault;

   } else {
      return options.playerPed;
   }
});
exports('pedReset', (withToggle = true) => {
   const isMale = GetEntityModel(PlayerPedId()) === GetHashKey('mp_m_freemode_01');
   pedReset(withToggle, isMale);
});

// ---
exports('closeUI', _=> {
   if (options.isOpen) {
      SendNUIMessage(JSON.stringify({ type: 'close' }));
      exports.NewStart_Options.clothesReset();
      closeUI(); pedReset();
   }
});