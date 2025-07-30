/* ``````````` ## Development By el8rbawY ## ```````````*/
const initialize = {
   players: [/* { serverID: 0, customID: '', name: '', vip?: { name: '' }} */],
   adminRoles: ['1125477373152870482', '1125477199630311435', '1125477412738715658', '1126122338325372948', '1125479864577818655', '1099621068769079356'],
   blackListDiscordID: ['572791456628998165', '294182797944553483']
}

// ---
onNet('NewStart_Initialize:handleGeneral-server', (type, data) => {
   if (type === 'updatePlayer') {
      const index = initialize.players.findIndex(i => i.serverID === data.serverID);

      if (index >= 0) {
         initialize.players[index][data.refName] = data.value;
         emitNet('NewStart_Initialize:handleGeneral-client', -1, 'update', data);
      }
   }
});

// and edit all down => in NewStart_Initialize/client/customID.js
// ---
function joinPlayer(data) { 
   const index = initialize.players.findIndex(i => i.serverID === data.serverID);

   if (index >= 0) initialize.players.splice(index, 1);
   initialize.players.push(data);

   emitNet('NewStart_Initialize:handleGeneral-client', -1, 'add', data);
   emitNet('NewStart_Initialize:handleGeneral-client', data.serverID, 'first', JSON.stringify(initialize.players));
}

// ---
on('playerDropped', () => {
   const index = initialize.players.findIndex(i => i.serverID === source);
   if (index >= 0) initialize.players.splice(index, 1);

   emitNet('NewStart_Initialize:handleGeneral-client', -1, 'remove', { serverID: source });
});