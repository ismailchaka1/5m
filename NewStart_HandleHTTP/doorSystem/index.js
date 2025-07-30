/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_DoorSystem:handleGeneral-server', (type, info) => {
   if (type === 'setLock') {
      const index = doorSystem.findIndex(i => i.id === info.id);

      if (index >= 0) {
         doorSystem[index].isLock = info.isLock;
         emitNet('NewStart_DoorSystem:handleGeneral-client', -1, 'setLock', JSON.stringify(info));
      }
   }
});

// ---
on('playerJoining', id => {
   emitNet('NewStart_DoorSystem:handleGeneral-client', id, 'initial', JSON.stringify(doorSystem));
});