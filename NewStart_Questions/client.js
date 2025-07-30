/* ``````````` ## Development By el8rbawY ## ```````````*/
let isOpen = false, isAgain = false, isFrist = false;

// ---
onNet('NewStart_Questions:handleGeneral-client', (type, data) => {
   if (type === 'again') {
      if (isOpen) return;
      
      if (exports.NewStart_DeathCounter.method('isOpen')) {
         emit('NewStart_DeathCounter:revivePlayer-client');
      }

      if (isFrist) {
         emitNet('NewStart:updateUser', { skipQuestions: false });
         emitNet('NewStart:general-server', 'disconnect', 'انتهاك القواعد والقوانين .. سيتم إعادة الاختبار لك ويرجي قراءة القوانين من خلال موقعنا أو الديسكورد قبل الدخول مرة أخري.');
         
      } else {
         SendNUIMessage(JSON.stringify({ type: 'open', playerName: data.name+'!', isAgain: true }));
         isOpen = true; isAgain = true; isFrist = true;
   
         exports.NewStart_DeathCounter.closeAll(true);
         exports.NewStart_HudSystem.closeUI();
         exports.NewStart_Phone.noticesToggle(true);
         exports.NewStart_MainMenu.toggleAds(false);
         DisplayRadar(false);
   
         // start
         emitNet('NewStart:updateUser', { skipQuestions: false });
         emitNet('NewStart:general-server', 'setBucket');
         SetNuiFocus(true, true);
      }
   }
});

// ---
exports('openUI', _=> {   
   SendNUIMessage(JSON.stringify({ type: 'open', playerName: GetPlayerName(PlayerId()) }));
   isFrist = true;
   isOpen = true;

   setTimeout(() => {
      exports.NewStart_Initialize.loadingScreen();
      ShutdownLoadingScreenNui();
      SetNuiFocus(true, true);
   }, 1000);
});

// ---
RegisterNuiCallbackType('NUI:examDone');
RegisterNuiCallbackType('NUI:character');

on('__cfx_nui:NUI:examDone', (_, cb) => {
   if (isAgain) {
      emitNet('NewStart:updateUser', { skipQuestions: true });

   } else {
      exports.NewStart_CharacterCreator.initialCharacter();
      emitNet('NewStart_Questions:skip-server');
   }

   cb('DONE!');
});

on('__cfx_nui:NUI:character', (_, cb) => {
   if (isAgain) {
      emitNet('NewStart:general-server', 'setBucket', 0);
      exports.NewStart_Phone.noticesToggle(false);

      if (!exports.NewStart_MainMenu.isOpen()) {
         DisplayRadar(true);
         exports.NewStart_HudSystem.openHud();
         exports.NewStart_MainMenu.toggleAds(true);
      }

   } else {
      exports.NewStart_CharacterCreator.openUI();
   }

   SetNuiFocus(false, false);
   isAgain = false;
   isOpen = false;
   cb('DONE!');
});

exports('isOpen', _=> isOpen);