/* ``````````` ## Development By el8rbawY ## ```````````*/
function closeUI() {
   options.isOpen = false;
   options.runClose = false;

   SendNUIMessage(JSON.stringify({ type: 'close' }));
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

function pedReset() {
   if (!options.playerPed) return;
   const pedID = PlayerPedId();

   if (!exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
      SetPedComponentVariation(pedID, 2, options.playerPed.hair.style, 0, 0);
      SetPedHairColor(pedID, options.playerPed.hair.color, 1);
   }
   
   SetPedHeadOverlay(pedID, 4, options.playerPed.eyes.style, options.playerPed.eyes.opacity);
   SetPedEyeColor(pedID, options.playerPed.eyes.color);

   SetPedHeadOverlay(pedID, 2, options.playerPed.eyebrows.style, options.playerPed.eyebrows.opacity);
   SetPedHeadOverlayColor(pedID, 2, 1, options.playerPed.eyebrows.color);

   SetPedHeadOverlay(pedID, 8, options.playerPed.lipstick.style, options.playerPed.lipstick.opacity);
   SetPedHeadOverlayColor(pedID, 8, 2, options.playerPed.lipstick.color);
   
   SetPedHeadOverlay(pedID, 1, options.playerPed.facial.style, options.playerPed.facial.opacity);
   SetPedHeadOverlayColor(pedID, 1, 1, options.playerPed.facial.color);

   SetPedHeadOverlay(pedID, 5, options.playerPed.blusher.style, options.playerPed.blusher.opacity);
   SetPedHeadOverlayColor(pedID, 5, 2, options.playerPed.blusher.color);
}

// ---
RegisterNuiCallbackType('NUI:changes');
RegisterNuiCallbackType('NUI:payment');
RegisterNuiCallbackType('NUI:closeUI');

on('__cfx_nui:NUI:changes', (data, cb) => {
   const pedID = GetPlayerPed(-1);

   switch(data.key) {
      case 'hair':
         if (data.type === 'style') {
            const id = data.id > -1 ? data.id : options.playerPed.hair.style;
            SetPedComponentVariation(pedID, 2, id, 0, 0);
            
         } else {
            const id = data.id > -1 ? data.id : options.playerPed.hair.color;
            SetPedHairColor(pedID, id, 1);
         }
         break;
      
      case 'eyes':
         if (data.type === 'style') {
            const id = data.id > -1 ? data.id : options.playerPed.eyes.style;
            SetPedHeadOverlay(pedID, 4, id, data.opacity);
            
         } else {
            const id = data.id > -1 ? data.id : options.playerPed.eyes.color;
            SetPedEyeColor(pedID, id);
         }
         break;
      
      case 'eyebrows':
         if (data.type === 'style') {
            const id = data.id > -1 ? data.id : options.playerPed.eyebrows.style;
            SetPedHeadOverlay(pedID, 2, id, data.opacity);
            
         } else {
            const id = data.id > -1 ? data.id : options.playerPed.eyebrows.color;
            SetPedHeadOverlayColor(pedID, 2, 1, id);
         }
         break;
      
      case 'lipstick':
         if (data.type === 'style') {
            let id = data.id, opacity = data.opacity;

            if (data.id === -1) {
               id = options.playerPed.lipstick.style;
               opacity = options.playerPed.lipstick.opacity
            }

            SetPedHeadOverlay(pedID, 8, id, opacity); 
         }

         if (data.type === 'color' || data.id === -1) {
            const id = data.id > -1 ? data.id : options.playerPed.lipstick.color;
            SetPedHeadOverlayColor(pedID, 8, 2, id);
         }

         break;

      case 'facial':
         if (data.type === 'style') {
            let id = data.id, opacity = data.opacity;

            if (data.id === -1) {
               id = options.playerPed.facial.style;
               opacity = options.playerPed.facial.opacity
            }

            SetPedHeadOverlay(pedID, 1, id, opacity);  
         }

         if (data.type === 'color' || data.id === -1) {
            const id = data.id > -1 ? data.id : options.playerPed.facial.color;
            SetPedHeadOverlayColor(pedID, 1, 1, id);
         }

         break;
      
      case 'blusher':
         if (data.type === 'style') {
            let id = data.id, opacity = data.opacity;

            if (data.id === -1) {
               id = options.playerPed.blusher.style;
               opacity = options.playerPed.blusher.opacity
            }

            SetPedHeadOverlay(pedID, 5, id, opacity);  
         }

         if (data.type === 'color' || data.id === -1) {
            const id = data.id > -1 ? data.id : options.playerPed.blusher.color;
            SetPedHeadOverlayColor(pedID, 5, 2, id);
         }

         break;
   }
   
   cb('DONE!');
});

on('__cfx_nui:NUI:payment', (data, cb) => {
   const purchases = {};
   const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
   const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
   const info = { name: 'الحلاق', price: data.price };

   if (cash >= data.price) {
      StatSetInt('MP0_WALLET_BALANCE', cash - data.price);
      exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }))
      info.from = 'cash';

   } else if (bank >= data.price) {
      StatSetInt('BANK_BALANCE', bank - data.price);
      info.from = 'bank';

   } else { // Failed
      pedReset(); closeUI(); cb('OK!');
      exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
      return;
   }

   // Success
   for (let key in data.values) {
      const style = data.values[key].style;
      const color = data.values[key].color;
      const opacity = data.values[key].opacity;

      if (!purchases.hasOwnProperty(key)) purchases[key] = {};
      if (style) purchases[key].style = style.id;
      if (color) purchases[key].color = color.id;
      purchases[key].opacity = opacity || 1;
   }

   for (let key in purchases) {
      for (let child in purchases[key]) options.playerPed[key][child] = purchases[key][child];
   }
   
   emitNet('NewStart_Hairdresser:payment-server', JSON.stringify({ ped: options.playerPed, ...info }));
   closeUI(); cb('OK!');
   exports.NewStart_Notifications.showAttention('success', 'لقد قمت للتو بدفع المال.');
});

on('__cfx_nui:NUI:closeUI', (_, cb) => {
   pedReset(); closeUI(); cb('OK!'); 
});

// ---
exports('isOpen', _=> options.isOpen);