/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Phone:bank-client', (type, data) => {
   const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);

   if (type === 'transfer') {
      if (data === 'Balance') {
         exports.NewStart_Notifications.showAttention('error', 'رصيد حسابك غير كافي للتحويل!');

      } else if (data === 'User') {
         exports.NewStart_Notifications.showAttention('error', 'رقم الحساب غير موجود تأكد أولاً!');

      } else {
         const info = JSON.parse(data);

         SendNuiMessage(JSON.stringify({ type: 'pushBankLog', info }));
         StatSetInt('BANK_BALANCE', bank - info.amount);
         emit('NewStart_HudSystem:handleGeneral-client', 'setMoney');
      }

   } else if (type === 'receive') {
      SendNuiMessage(JSON.stringify({ type: 'pushBankLog', info: data }));
      StatSetInt('BANK_BALANCE', bank + data.amount);
      emit('NewStart_HudSystem:handleGeneral-client', 'setMoney');

   } else {
      SendNuiMessage(JSON.stringify({ type: 'setBankData', info: JSON.parse(data) }));
   }
});

// ---
RegisterNuiCallbackType('NUI:bank');

on('__cfx_nui:NUI:bank', async (data, cb) => {
   if (data.type === 'getData') {
      emitNet('NewStart_Phone:bank-server');

   } else if (data.type === 'transfer') {
      // const level = exports.NewStart_MainMenu.method('validLevel', 'money');

      // if (!level.isCan) {
      //    exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${level.need} أولاً لإتمام التحويل!`);
      //    return cb('OK!');
      // }

      emitNet('NewStart_Phone:bank-server', { to: data.to, amount: parseInt(data.amount) });

   } else {
      exports.NewStart_Notifications.showAttention(data.status, data.text);
   }

   cb('OK!');
});
