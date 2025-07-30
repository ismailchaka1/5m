/* ``````````` ## Development By el8rbawY ## ```````````*/
const policeData = {
   distress: [],
   vehWanted: [],
   subSeaPortClosed: true
}

// ---
setInterval(() => {
   const time = Date.now();
   policeData.distress = policeData.distress.filter(i => (time - i.id) <= 1800000) // 30 min

   policeData.vehWanted = policeData.vehWanted.filter(i => (time - i.date) <= 1800000) // 30 min
   emitNet('NewStart_Police:handleOther-client', -1, 'addVehWanted', JSON.stringify(policeData.vehWanted));

   // policeData.subSeaPortClosed = ([...factions.police.refPlayers, ...factions.facilities.refPlayers].filter(i => i.status === 'in' || i.status === 'out').length) < 50;
   emitNet('NewStart_Tools:handleGeneral-client', -1, 'subSeaPortClosed', { value: policeData.subSeaPortClosed });
}, 300000); // 5 min