/* ``````````` ## Development By el8rbawY ## ```````````*/
const options = { isOpen: false, frequency: null, radioObj: null, radioHash: null, isActive: false, forceNoActive: false };

// ---
on('playerSpawned', _=> {
   if (options.radioHash) return;
   
   options.radioHash = GetHashKey('prop_cs_hand_radio');
   RequestModel(options.radioHash);
   RequestAnimDict('random@arrests');
});

// ---
on('pma-voice:radioActive', isTalking => {
   if (isTalking) {
      if (!exports.NewStart_Medicine.method('info').stretcher) {
         TaskPlayAnim(PlayerPedId(), 'random@arrests', 'generic_radio_enter', 8.0, 2.0, -1, 50, 2.0, false, false, false);
      }

      if (options.isOpen) {
         SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
         closeUI();

      } else {
         exports.NewStart_Phone.closeUI();
      }

   } else {
      StopAnimTask(PlayerPedId(), 'random@arrests', 'generic_radio_enter', -4.0);
   }

   handleTalking(GetPlayerServerId(PlayerId()), isTalking);
});

// ---
setTick(_=> {
   if (IsControlJustPressed(0, 57) && options.frequency && LocalPlayer.state.radioChannel && !exports.NewStart_Medicine.method('info').isDead) {
      const findRadio = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 32);

      if (!findRadio) {
         exports.NewStart_Notifications.showAttention('error', 'ليس لديك راديو في الحقيبة!');
         return;
      }

      options.forceNoActive = options.isActive;
      options.isActive = !options.isActive;
      
      exports.NewStart_HudSystem.radio({ isActive: options.isActive });
      exports['pma-voice'].setVoiceProperty('radioEnabled', options.isActive);
      
      if (options.isActive) {
         exports.NewStart_Notifications.showAttention('success', 'لقد قمت بإعادة فتح الراديو!');

      } else {
         exports.NewStart_Notifications.showAttention('error', 'لقد قمت بإغلاق الراديو للتو!');
      }
   }
});

// ---
RegisterNuiCallbackType('NUI:action');

on('__cfx_nui:NUI:action', (data, cb) => {
   switch (data.type) {
      case 'setFrequency':
         const number = parseInt(data.number);
         const setting = setFrequency(number);

         if (setting) {
            emitNet('NewStart:updateUser', { 'mode.radio': number });   
            exports.NewStart_Notifications.showAttention('success', `تم تعيين تردد الراديو (${number})!`);
            cb('OK'); 

         } else {
            exports.NewStart_Notifications.showAttention('error', 'التردد مشفر لا يمكن الدخول له!');
            return cb('Failed');
         }

         closeUI();
         break;

      default: 
         cb(options.frequency); closeUI();
   }
});

exports('setActive', (notDown = true) => {
   if (notDown && options.frequency && !options.forceNoActive) {
      if (!options.isActive) {
         exports['pma-voice'].setVoiceProperty('radioEnabled', true);
         setFrequency();
      }
      
   } else if (!notDown && (options.forceNoActive || exports.NewStart_Medicine.method('info').isDead)) {
      const findRadio = exports.NewStart_Inventory.info('currentItems').some(obj => obj.id === 32);

      if (findRadio && options.isActive) {
         options.isActive = false;
         exports.NewStart_HudSystem.radio({ isActive: false });
         exports['pma-voice'].setVoiceProperty('radioEnabled', false);
      }
   }
});

exports('openUI', _=> {
   const findRadio = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 32);

   if (!findRadio) {
      exports.NewStart_Notifications.showAttention('error', 'ليس لديك راديو في الحقيبة!');
      return;
   }

   const pedID = PlayerPedId();
   const bone = GetPedBoneIndex(pedID, 28422);

   options.isOpen = true;
   SendNuiMessage(JSON.stringify({ type: 'openUI', frequency: options.frequency }));
   SetNuiFocus(true, true);

   TaskPlayAnim(pedID, 'cellphone@', 'cellphone_text_in', 4.0, -1, -1, 50, 0, false, false, false);
   options.radioObj = CreateObject(options.radioHash, 0, 0, 0, true, true, false);
   
   SetCurrentPedWeapon(pedID, GetHashKey('weapon_unarmed'), true);
   AttachEntityToEntity(options.radioObj, pedID, bone, 0, 0, 0, 0, 0, 0, true, false, false, false, 2, true);
});

exports('method', (type, data) => {
   if (type === 'setFrequency') {
      setFrequency(data);

   } else if (type === 'kick') {
      handleKick(false, data);

   } else if (type === 'temporaryKick') {
      handleKick(true);
      
   } else { // closeUI
      if (options.isOpen) {
         SetNuiFocus(false, false);
         SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
         DeleteEntity(options.radioObj);
      }
   }
});