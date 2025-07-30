/* ``````````` ## Development By el8rbawY ## ```````````*/
let settings = { messageBlock: false, callBlock: false, locationBlock: false };
let information = null;
const options = { 
   phoneModel: null, isOpen: false, isCalling: false, callType: null,
   isLoadModel: false, requestCall: null, isVip: false, timeoutID: null, isNotifications: false
};

// ---
on('playerSpawned', _=> {
   if (options.isLoadModel) return;

   RequestAnimDict('cellphone@');
   RequestAnimDict('anim@cellphone@in_car@ps');
   RequestModel(-1038739674);

   options.isLoadModel = true;

   const phone = exports.NewStart_Inventory.info('currentItems').find(obj => obj.id === 30);
   if (phone) emitNet('NewStart_Phone:initial-server', phone.features.number);
});

// ---
onNet('NewStart_Phone:initial-client', data => {
   data = JSON.parse(data);
   SendNuiMessage(JSON.stringify({ type: 'initial', ...data }));
});

// ---
onNet('NewStart_Phone:requestCall-client', (data, sender) => {
   if (options.isCalling || settings.callBlock || options.requestCall || exports.NewStart_Police.method('info').isJailed) return;

   options.requestCall = JSON.parse(data);
   if (!sender) SendNuiMessage(JSON.stringify({ type: 'requestCall', number: options.requestCall.number }));
});

// ---
onNet('NewStart_Phone:acceptCall-client', data => {
   options.requestCall = data;
   SendNuiMessage(JSON.stringify({ type: 'acceptCall', number: data.to }));
});

// ---
onNet('NewStart_Phone:hangUp-client', data => {
   console.log('hangUp', options.isCalling);

   if (options.isCalling) {
      console.log('hangUp', data);
      SendNuiMessage(JSON.stringify({ type: 'goPath', name: '/' }))
   }
});

// ---
onNet('NewStart_Phone:receiveMessage-client', data => {
   if (settings.messageBlock) return;
    
   data = JSON.parse(data);
   data.isYou = false;
   SendNuiMessage(JSON.stringify({ type: 'receiveMessage', info: data }));
});

// ---
setTick(_=> {
   if (IsControlJustPressed(0, 289)) { 
      if (
         IsPauseMenuActive() ||
         exports.NewStart_Inventory.method('smoking', 'get') ||
         exports.NewStart_Police.method('info').isJailed ||
         exports.NewStart_PoliceTools.method('info').isPolmav ||
         exports.NewStart_Medicine.limited('get') ||
         exports.NewStart_MainMenu.method('data').isAnimShared
      ) return;

      if (!options.isOpen) {
         openUI();

      } else {
         if (options.isCalling && options.callType === 'outgoing') {
            SendNuiMessage(JSON.stringify({ type: 'goPath', name: '/' }));
            exports.NewStart_Radio.setActive(true);
            clearTick(tickID);
            
         } else {
            closeForce();
         }
      }

   } else if (IsControlJustPressed(0, 200)) {
      if (options.isCalling) {
         SendNuiMessage(JSON.stringify({ type: 'goPath', name: -1 }));
      }
   }

   if (options.isOpen) SetPauseMenuActive(false);
});

// ---
RegisterNuiCallbackType('NUI:update');

on('__cfx_nui:NUI:update', (data, cb) => {   
   switch(data?.type) {
      case 'startCall':
         options.callType = data.procedure;
         options.isCalling = true;
         playAnim('cellphone_text_to_call');
         startCall();
         
         if (data.procedure === 'outgoing') {            
            emitNet('NewStart_Phone:sendData-server', 'requestCall',  JSON.stringify(data.info));
         }
         break;

      case 'acceptCall': emitNet('NewStart_Phone:acceptCall-server', options.requestCall); break;

      case 'endCall':
         if (!options.isCalling) return cb('OK!');

         options.isCalling = false;
         console.log('endCall', options.requestCall);
         emitNet('NewStart_Phone:hangUp-server', options.requestCall);

         if (options.isOpen) {
            playAnim('cellphone_call_to_text');
            setTimeout(_=> SetNuiFocus(true, true), 250);

         } else {
            playAnim('cellphone_call_out');
         }
         
         clearTick(tickID);
         exports['pma-voice'].removePlayerFromCall();
         options.requestCall = null;
         break;

      case 'sendMessage':
         const [x, y, z] = GetEntityCoords(PlayerPedId(), true);
         const name = exports.NewStart_Initialize.getPlace();

         if (data.info.isEmergency) {
            const time = Date.now();

            if ((time - reportsData.lastMessage) >= 900000) { // 15min
               const info = { ...data.info };

               info.number = data.info.to;
               delete info.to; delete info.from;
               SendNuiMessage(JSON.stringify({ type: 'receiveMessage', info }));

               data.info.location = { name, coords: [x, y, z] };
               emitNet('NewStart_Phone:EmergencyMessage-server', JSON.stringify(data.info));
               reportsData.lastMessage = time;

            } else {
               exports.NewStart_Notifications.showAttention('error', 'يمكن إرسال رسالة واحدة فقط كل 15 دقيقة للطوارئ.');
            }

         } else {
            if (data.info.type === 'location') {
               data.info.text = `موقعي (${name})`;
               data.info.coord = { x, y };
   
               const info = { ...data.info };
   
               info.number = data.info.to;
               delete info.to; delete info.from;
               SendNuiMessage(JSON.stringify({ type: 'receiveMessage', info }));
            }
   
            emitNet('NewStart_Phone:sendData-server', 'receiveMessage', JSON.stringify(data.info));
         }
         break;

      case 'settings':
         if (!options.isVip) return;
         settings = { ...settings, ...data.info };
         break;

      case 'volume':
         if (options.timeoutID) clearTimeout(options.timeoutID);
         options.timeoutID = setTimeout(_=> { emitNet('NewStart:updateUser', { 'settings.phoneVolume': data.value }) }, 5000); 
         break;

      case 'hendleContact': emitNet('NewStart_Phone:handleGeneral-server', 'contact', { number: data.number, save: data.info }); break;
      case 'mechanical': emitNet('NewStart_Phone:handleGeneral-server', data.type); break;
      case 'location': SetNewWaypoint(data.coord.x, data.coord.y); break;
      case 'isNotifications': options.isNotifications = data.value; break;
      default: closeUI();
   }

   cb('OK!');
});

// ---
exports('closeUI', _=> {
   if (!options.isOpen) return;

   SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
   closeUI();
});

exports('volume', value => SendNuiMessage(JSON.stringify({ type: 'volume', value })));
exports('isOpen', _=> options.isOpen);
exports('noticesToggle', isHide => {   
   if (isHide !== options.noticesToggle) {
      SendNuiMessage(JSON.stringify({ type: 'noticesToggle', isHide }));
      options.noticesToggle = isHide;
   }
});