/* ``````````` ## Development By el8rbawY ## ```````````*/
const ids = [
   { type: 'main', id: 1, name: 'mask' }, { type: 'main', id: 5, name: 'bag' }, 
   { type: 'main', id: 11, name: 'top', reset: 15 },{ type: 'prop', id: 0, name: 'hat' }, 
   { type: 'prop', id: 1, name: 'glass' }, { type: 'prop', id: 2, name: 'ear' },
   { type: 'main', id: 3, name: 'torso' }, { type: 'main', id: 8, name: 'undershirt', reset: 15 }, 
   { type: 'main', id: 10, name: 'badge' }, { type: 'prop', id: 6, name: 'watch' },
   { type: 'main', id: 7, name: 'accessory' }, { type: 'prop', id: 7, name: 'bracelet' },
   { type: 'main', id: 4, name: 'leg' }, { type: 'main', id: 6, name: 'shoe' }, 
   { type: 'main', id: 9, name: 'armor' }
];

// ---
function pedReset(withToggle, isMale) {
   if (!options.playerPed) return;
   const pedID = PlayerPedId();
   const toggles = exports.NewStart_Options.clothesItems(false, true);

   if (!isMale) isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');

   for (let key in options.playerPed) {
      const find = ids.find(obj => obj.name === key);
      let value = options.playerPed[key];

      if (typeof value === 'object') {
         value = value[isMale ? 'male' : 'female'];
         options.playerPed[key] = value;
      }

      if (withToggle) {
         const findToggle = toggles.find(obj => obj.name === key)?.isActive;
            
         if (find.name !== 'undershirt' && findToggle) {
            if (find.name === 'top') {
               SetPedComponentVariation(pedID, find.id, 15, 0, 0);
               setTimeout(_=> SetPedComponentVariation(pedID, 8, 15, 0, 0), 0);
               setTimeout(_=> SetPedComponentVariation(pedID, 3, 15, 0, 0), 10);
   
            } else if (find.name === 'leg') {
               SetPedComponentVariation(pedID, find.id, isMale ? 21 : 15, 0, 0);
   
            } else if (find.name === 'shoe') {
               SetPedComponentVariation(pedID, find.id, isMale ? 34 : 35, 0, 0);

            } else if (find.type === 'main') {
               SetPedComponentVariation(pedID, find.id, 0, 0, 0);

            } else if (find.type === 'prop') {
               ClearPedProp(pedID, find.id);
            }

            continue;
         }
      }

      if (find.type === 'main') {
         SetPedComponentVariation(pedID, find.id, value, options.textures[key], 0);
   
      } else {
         if (value !== 0) {
            SetPedPropIndex(pedID, find.id, value, options.textures[key], true);
   
         } else {
            ClearPedProp(pedID, find.id);
         }
      }
   }
}

// ---
function closeUI() {
   SendNUIMessage(JSON.stringify({ type: 'close' }));
   options.noCursor = false;
   options.isOpen = false;
   options.runClose = false;
   options.lastCam = 'face';
   SetNuiFocus(false, false);
   
   DestroyCam(options.cameraID, true);
   RenderScriptCams(false, false, 0, true, true);
   exports.NewStart_Phone.noticesToggle(false);

   if (!exports.NewStart_MainMenu.isOpen()) {
      DisplayRadar(true);
      exports.NewStart_HudSystem.openHud();
      exports.NewStart_MainMenu.toggleAds(true);
   }
}

// ---
RegisterNuiCallbackType('NUI:update');
RegisterNuiCallbackType('NUI:changes');
RegisterNuiCallbackType('NUI:payment');

on('__cfx_nui:NUI:update', (data, cb) => {
   switch (data?.type) {
      case 'changeCam':
         createCam(data.value, options.currentMarker);
         options.lastCam = data.value;
         break;

      case 'cursor':
         const pedID = PlayerPedId();
         options.noCursor = !options.noCursor;

         if (options.noCursor) {
            SetNuiFocus(true, false);
            DestroyCam(options.cameraID, true);
            RenderScriptCams(false, false, 0, true, true);

            options.tickID = setTick(_=> {
               DisableControlAction(pedID, 16, true);
               DisableControlAction(pedID, 17, true);
               DisableControlAction(pedID, 24, true);
            });

         } else {
            clearTick(options.tickID);
            EnableControlAction(pedID, 16, true);
            EnableControlAction(pedID, 17, true);
            EnableControlAction(pedID, 24, true);
            SetNuiFocus(true, true);
            createCam(options.lastCam, options.currentMarker);
         }
         
      break;

      case 'save':
         const features = {};

         for (let key in options.playerPed) {
            const find = ids.find(i => i.name === key);
            const textureID = find.type === 'main' ? GetPedTextureVariation(PlayerPedId(), find.id) : GetPedPropTextureIndex(PlayerPedId(), find.id);
            features[key] = { drawableID: options.playerPed[key], textureID };
         }

         emitNet('NewStart_Clothes:saveOutfit-server', JSON.stringify({ name: data.value, features }));
         closeUI(); 
         break;

      case 'unsave': closeUI(); break;
      case 'reset': pedReset(); break;

      default: // closeUI
         if (Object.keys(data?.items || {}).length) {
            for (let key in data.items) {

               if (key === 'shoe' && !data.items.shoe) options.playerPed.shoe = 1;
               else if (key === 'undershirt' && !data.items.undershirt) options.playerPed.shoe = 15;
               else options.playerPed[key] = data.items[key];

               options.textures[key] = 0;
            }

            emitNet('NewStart_Clothes:payment-server', JSON.stringify({ outfit: options.playerPed, textures: options.textures }));
         }
         
         pedReset(); closeUI();
   }

   cb('OK!'); 
});

on('__cfx_nui:NUI:changes', (data, cb) => {
   const pedID = GetPlayerPed(-1); 
   const find  = ids.find(obj => obj.name === data.name);

   if (!data.isTexture) {
      if (find.type === 'main') {
         if (data.name === 'shoe' && data.value === 0) {
            SetPedComponentVariation(pedID, find.id, 1, 0, 0);
   
         } else if (data.name === 'undershirt' && data.value === 0) {
            SetPedComponentVariation(pedID, find.id, find.reset, 0, 0);

         } else {
            SetPedComponentVariation(pedID, find.id, data.value, 0, 0);
         }
   
      } else {
         if (data.value !== 0) {
            SetPedPropIndex(pedID, find.id, data.value, 0, true);
   
         } else {
            ClearPedProp(pedID, find.id);
         }
      }

   } else {
      if (find.type === 'main') {
         const drawableID = GetPedDrawableVariation(pedID, find.id);
         const max = GetNumberOfPedTextureVariations(pedID, find.id, drawableID);

         if (max <= 1) {
            exports.NewStart_Notifications.showAttention('error', 'لا يوجد المزيد من الألوان المتاحة لهذا!');
            return cb('OK!');
         }

         const textureID = GetPedTextureVariation(pedID, find.id);
         let next = textureID + 1;

         if (next >= max) next = 0;
         SetPedComponentVariation(pedID, find.id, drawableID, next, 0);

      } else {
         const drawableID = GetPedPropIndex(pedID, find.id);
         const max = GetNumberOfPedPropTextureVariations(pedID, find.id, drawableID);

         if (max <= 1) {
            exports.NewStart_Notifications.showAttention('error', 'لا يوجد المزيد من الألوان المتاحة لهذا!');
            return cb('OK!');
         }

         const textureID = GetPedPropTextureIndex(pedID, find.id);
         let next = textureID + 1;

         if (next >= max) next = 0;
         SetPedPropIndex(pedID, find.id, drawableID, next, true);
      }
   }

   cb('OK!'); 
});

on('__cfx_nui:NUI:payment', async (data, cb) => {
   const pedID = PlayerPedId();
   const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
   const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
   const info = { name: 'متجر الملابس', price: data.price };

   if (info.price) {
      if (cash >= data.price) {
         StatSetInt('MP0_WALLET_BALANCE', cash - data.price);
         exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
         info.from = 'cash';
   
      } else if (bank >= data.price) {
         StatSetInt('BANK_BALANCE', bank - data.price);
         info.from = 'bank';
   
      } else {
         exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
         cb('Failed');
         return;
      }
   }
   
   for (let key in data.items) {
      options.playerPed[key] = data.items[key];
   }

   for (let item of ids) {
      const textureID = item.type === 'main' ? GetPedTextureVariation(pedID, item.id) : GetPedPropTextureIndex(pedID, item.id);
      options.textures[item.name] = textureID;
   }
   
   emitNet('NewStart_Clothes:payment-server', JSON.stringify({ outfit: options.playerPed, textures: options.textures, ...info }));
   exports.NewStart_Notifications.showAttention('success', 'لقد قمت للتو بدفع المال مقابل الملابس.');
   cb(JSON.stringify(options.playerPed));
});

// ---x
exports('isOpen', _=> options.isOpen);
exports('items', _=> ids);