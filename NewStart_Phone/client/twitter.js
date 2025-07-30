/* ``````````` ## Development By el8rbawY ## ```````````*/
let screenshot = false, base64 = null;

// ---
onNet('NewStart_Phone:handleTweets-client', (type, data) => {
   if (type === 'setTweets') {
      SendNuiMessage(JSON.stringify({ type: 'setTweets', info: JSON.parse(data) }));

   } else if (type === 'addToAds') {
      const advertisement = {
         type: 'twitter', 
         from: 'تغريدة من تويتر', 
         text: data.text,
         from: data.name,
         name: data.customID
      }
   
      emit('NewStart_MainMenu:addToAds-client', advertisement);
      SendNuiMessage(JSON.stringify({ type: 'setTweets', info: data, isOne: true }));

   } else { // imageUpload
      SendNuiMessage(JSON.stringify({ type: 'imageUpload', info: { ...data, base64 } }));
      base64 = null;
   }
});

// ---
RegisterNuiCallbackType('NUI:twitter');

on('__cfx_nui:NUI:twitter', async (data, cb) => {
   switch (data.type) {
      case 'add':
         if (exports.NewStart_MainMenu.getLevel() < 7) {
            exports.NewStart_Notifications.showAttention('error', 'مستوي الشخصية غير كافي للنشر علي تويتر!');
            return cb('OK!');
         }

         data.info.processing = !!data.info.image;

         if (data.info.image) {
            base64 = data.info.image;
            delete data.info.image;
         }
         
         emitNet('NewStart_Phone:addTweet-server', JSON.stringify({ ...information, ...data.info }), data.info.processing);
         cb('OK!'); break;

      case 'imageUploadDone':
         emitNet('NewStart_Phone:handleTweets-server', 'afterProcess', data.info);
         cb('OK!'); break;
         
      case 'location':
         const [x, y, z] = GetEntityCoords(GetPlayerPed(-1), true);
         const zone = GetNameOfZone(x, y, z);
         const name = exports.NewStart_Initialize.getPlace(zone) || GetLabelText(zone);

         cb({ name, coord: { x, y } });
         break;

      case 'screenshot':
         const mode = GetFollowPedCamViewMode();

         screenshot = true;
         SetFollowPedCamViewMode(4);
         exports.NewStart_HudSystem.closeUI();
         exports.NewStart_MainMenu.toggleAds(false);
         DisplayRadar(false);

         await Delay(800);

         exports['screenshot-basic'].requestScreenshot({ encoding: 'jpg', quality: 0.5 }, base64 => {
            SetFollowPedCamViewMode(mode);

            if (!exports.NewStart_MainMenu.isOpen()) {
               DisplayRadar(true);
               exports.NewStart_HudSystem.openHud();
               exports.NewStart_MainMenu.toggleAds(true);
            }

            screenshot = false;
            cb(base64);
         });
         break;
      
      default: // getTweets
         const level = exports.NewStart_MainMenu.method('validLevel', 'twitter');

         emitNet('NewStart_Phone:handleTweets-server', data.type, data.id);
         cb(level.isCan ? 0 : level.need); 
         break;
   }
});