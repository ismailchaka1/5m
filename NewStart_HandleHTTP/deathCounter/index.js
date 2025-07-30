/* ``````````` ## Development By el8rbawY ## ```````````*/
const PLAYERS_DEAD_LIST = [];

// ---
async function playerDied (_, coords) {
   const find = PLAYERS_DEAD_LIST.find(obj => obj.id === source);
   const bucketID = GetPlayerRoutingBucket(source);

   if (!find) {
      let house = bucketID ? realEstate.items.find((_, i) => (i + 1) === bucketID)?.coord : null;
      coords = house ? Object.values(house).filter(i => parseFloat(i)) : Array.isArray(coords) ? coords : coords.killerpos;

      PLAYERS_DEAD_LIST.push({ id: source, coords, time: Date.now() });
      emitNet('NewStart_Medicine:handleGeneral-client', -1, 'deadBlipsBuild', PLAYERS_DEAD_LIST);
   }
}

onNet('baseevents:onPlayerKilled', playerDied);
onNet('baseevents:onPlayerDied', playerDied);

// ---
onNet('NewStart_DeathCounter:revivePlayer-server', async (id, onlyRemoveInList, goHospital) => {
   const currentID = source;
   removeFromDeadList(id || currentID);

   if (onlyRemoveInList && goHospital) {
      const license = licenseEncrypt(currentID);
      const user = (await axios.get(`${URL}/users/${license}?filter=character.identifier.name`)).data;

      emitNet('NewStart_MainMenu:addToAds-client', -1, { type: 'public', text: `انتقال "${user.character.identifier.name}" لمستشفى ${goHospital} بعد حالة نزيف`, from: 'النظام' });

   } else if (!onlyRemoveInList) {
      emitNet('NewStart_DeathCounter:revivePlayer-client', id, currentID);
   }
});

// ---
onNet('NewStart_Medicine:handleGeneral-server', async (type, id) => {
   const currentID = source;

   if (['doctorReward', 'healthIncrease', 'attachStretcher', 'startResuscitation'].includes(type)) {
      emitNet('NewStart_Medicine:handleGeneral-client', id, type);

   } else if (type === 'deathReason') {
      const license = licenseEncrypt(id);
      const reason = (await axios.get(`${URL}/users/${license}?filter=mode.isDie`)).data.mode.isDie;

      emitNet('NewStart_Medicine:handleGeneral-client', currentID, type, reason);

   } else if (type === 'updateCoords') {
      const index = PLAYERS_DEAD_LIST.findIndex(obj => obj.id === currentID);

      if (index >= 0) {
         PLAYERS_DEAD_LIST[index].coords = GetEntityCoords(GetPlayerPed(currentID));
         emitNet('NewStart_Medicine:handleGeneral-client', -1, 'deadBlipsBuild', PLAYERS_DEAD_LIST);
      }
   }
});

// ---
on('playerDropped', _=> { removeFromDeadList(source); });

// ---
function removeFromDeadList(id) {
   const index = PLAYERS_DEAD_LIST.findIndex(obj => obj.id === parseInt(id));

   if (index >= 0) PLAYERS_DEAD_LIST.splice(index, 1);
   emitNet('NewStart_Medicine:handleGeneral-client', -1, 'deadBlipsBuild', PLAYERS_DEAD_LIST);
}