/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_HudSystem:handleGeneral-client', (type, data) => {
   if (type === 'setProximity') {
      SendNUIMessage(JSON.stringify({ type: 'volume', mode: data.mode }));

   } else if (type === 'setMoney') {
      SendNUIMessage(JSON.stringify({ 
         type: 'setState', 
         info: { money: { cash: StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1)[1], bank: StatGetInt(GetHashKey('BANK_BALANCE'), -1)[1]}} 
      }));
   }
});

setTick(_=> {
   if (IsControlJustPressed(0, 344)) {
      emitNet('NewStart_HudSystem:getProximity-server');
   }
});

setInterval(_=> {
   SendNUIMessage(JSON.stringify({ type: 'setState', info: { minimapPosition: exports.NewStart_Tools.method('getMinimapPosition').pixel }}));
}, 2500);