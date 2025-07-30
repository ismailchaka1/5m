/* ``````````` ## Development By el8rbawY ## ```````````*/
const admins = {
   channelMain: 'admin-main-log',
   channelPlayer: 'admin-player-log',
   comfort: {
      isActive: false
   },
   doubleTaboo: {
      isActive: false,
      timeoutID: null
   },
   doubleLevel: {
      isActive: false,
      timeoutID: null
   }
};

// ---
function stopDoubleLevel() {
   emitNet('NewStart_Admin:methods-client', -1, 'changeGeneral', [{ name: 'doubleLevel', isActive: false }]);   
   emitNet('NewStart_MainMenu:handleGeneral-client', -1, 'setDoubleLevel', false);

   emitNet(
      'NewStart_MainMenu:addToAds-client', -1,
      { type: 'admin', text: 'إنتهاء الحصول على ضعف الخبرة .. انتظرو إشعار آخر', from: 'النظام' }
   );
}

// ---
function stopDoubleTaboo() {
   emitNet('NewStart_Admin:methods-client', -1, 'changeGeneral', [{ name: 'doubleTaboo', isActive: false }]);   

   emitNet(
      'NewStart_MainMenu:addToAds-client', -1,
      { type: 'admin', text: 'إنتهاء الحصول على ضعف الأجر ممنوعات .. انتظرو إشعار آخر', from: 'النظام' }
   );
}

// ---
function getPlayerIdFromGame(license) {
   let playerID = 0;

   for (let id of getPlayers()) {
      const licenseOther = GetPlayerIdentifier(id)?.replace('license:', '');

      if (licenseOther === license) {
         playerID = id; break;
      }
   }

   return playerID;
}