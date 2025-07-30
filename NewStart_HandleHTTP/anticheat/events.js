/* ``````````` ## Development By el8rbawY ## ```````````*/
on('ptFxEvent', (playerID, data) => {
   console.log('ptFxEvent', playerID, data);
});

// ---
on('clearPedTasksEvent', (playerID, data) => {
   console.log('clearPedTasksEvent', playerID, data);
});

// ---
on('removeAllWeaponsEvent', (playerID, data) => {
   console.log('removeAllWeaponsEvent', playerID, data);
   if (GetPlayerName(playerID)) CancelEvent();
});

// ---
on('giveWeaponEvent', (playerID, data) => {
   console.log('giveWeaponEvent', playerID, data);
});

// ---
on('RemoveWeaponEvent', (playerID, data) => {
   console.log('RemoveWeaponEvent', playerID, data);
   if (GetPlayerName(playerID)) CancelEvent();
});