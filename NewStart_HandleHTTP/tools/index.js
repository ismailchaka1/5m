/* ``````````` ## Development By el8rbawY ## ```````````*/
const TIME_MAIN = 2.44; let TIME_LAST_UPDATE = 0;
const tools = { time: { current: 0, max: TIME_MAIN * 3600 * 1000 }, items: [] }; // 4392000

// ---
setInterval(() => {
   tools.time.current += 4000;
   if (tools.time.current >= tools.time.max) tools.time.current = 0;

   let currentTime = Date.now();

   if (currentTime - TIME_LAST_UPDATE >= 36000) {
      emitNet('NewStart_Tools:handleGeneral-client', -1, 'setTime', tools.time.current);
      TIME_LAST_UPDATE = currentTime;
   }
}, 4000); // 4s

// ---
setInterval(() => {
   const tiem = Date.now();
   const removes = tools.items.filter(i => (tiem - i.id) >= 900000).map(i => i.id);

   if (removes.length) {
      emitNet('NewStart_Tools:handleGeneral-client', -1, 'items', { type: 'endTime', removes });
      tools.items = tools.items.filter(i => (tiem - i.id) < 900000);
   }
}, 900000); // 15m

// ---
onNet('NewStart_Tools:handleGeneral-server', (type, data) => {
   data = JSON.parse(data);
   const currentID = source;

   if (type === 'dropItem') {
      if (GetPlayerRoutingBucket(currentID)) return;
      
      const id = Date.now();
      const pedID = GetPlayerPed(currentID);
      const vehID = GetVehiclePedIsIn(pedID, false);
      const item = { id: id, coords: GetEntityCoords(vehID || pedID), info: data };

      if (vehID) item.coords = [item.coords[0] - 1, item.coords[1] + 1, item.coords[2] - 0.3];
      else item.coords = [item.coords[0] - 0.4, item.coords[1] + 0.4, item.coords[2] - 1];

      tools.items.push(item);
      emitNet('NewStart_Tools:handleGeneral-client', -1, 'items', { type: 'set', id, refID: data.id, count: data.count, coords: item.coords });

   } else if (type === 'dragItems') {
      if (data.every(id => tools.items.some(i => i.id === id))) { // give and remove 
         const items = [];

         for (let id of data) {
            const find = tools.items.find(i => i.id === id);
            const index = items.findIndex(i => i.id === find.info.id && !find.info.features)

            if (index >= 0) items[index].count += find.info.count;
            else items.push({ id: find.info.id, count: find.info.count, features: find.info.features });
         }

         tools.items = tools.items.filter(i => !data.includes(i.id));
         
         emitNet('NewStart_Tools:handleGeneral-client', -1, 'items', { type: 'remove', IDs: data });
         emitNet('NewStart_Tools:handleGeneral-client', currentID, 'items', { type: 'give', items });

      } else { // failed
         emitNet('NewStart_Tools:handleGeneral-client', currentID, 'items', { type: 'failed' });
      }
   }
});

// ---
on('playerJoining', id => {
   emitNet('NewStart_Tools:handleGeneral-client', id, 'setTime', { ...tools.time, main: TIME_MAIN });
});