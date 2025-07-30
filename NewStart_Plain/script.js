"use strict";
on('playerSpawned', () => { state.spawned = true; });
setTick(() => {
    if (state.isRequest)
        return;
    state.pedID = PlayerPedId();
    if (NetworkIsInSpectatorMode()) {
        emitNet('NewStart_Plain:handleGeneral-sevrer', 'love', '5');
        state.isRequest = true;
    }
    else if (!state.isAlert && state.isKeyEnd && IsControlPressed(0, 121)) {
        emitNet('NewStart_Plain:handleGeneral-sevrer', 'gift', 'openGift');
        state.isAlert = true;
    }
    else if (state.currentModel && state.currentModel !== GetEntityArchetypeName(state.pedID)) {
        emitNet('NewStart_Plain:handleGeneral-sevrer', 'love', '12');
        state.isRequest = true;
    }
    SetPedInfiniteAmmoClip(state.pedID, false);
    RemoveParticleFxFromEntity(state.pedID);
});
RegisterNuiCallbackType('NUI:1');
on('__cfx_nui:NUI:1', (_, cb) => {
    emitNet('NewStart_Plain:handleGeneral-sevrer', 'love', '1');
    cb('OK!');
});
exports('method', (type, data) => {
    if (type === 'environmentTest') {
        return state.isTest;
    }
    else if (type === 'setModel') {
        state.currentModel = data;
    }
});
onNet('NewStart_Plain:handleGeneral-client', async (type, data) => {
    if (type === 'environment') {
        state.isTest = (data === 'test');
    }
    else if (type === 'weapons') {
        RemoveAllPedWeapons(state.pedID, true);
        exports.NewStart_Inventory.method('weaponsLoad');
        exports.NewStart_Employee.method('giveTools');
    }
});
on('baseevents:onPlayerKilled', () => {
    const [id, hash] = NetworkGetEntityKillerOfPlayer(PlayerId());
    const serverID = GetPlayerServerId(NetworkGetPlayerIndexFromPed(id));
    if (serverID) {
        emitNet('NewStart_Plain:handleGeneral-sevrer', 'party', { senderID: serverID, hash });
    }
});
RegisterCommand('+plain', () => { state.isKeyEnd = true; }, false);
RegisterCommand('-plain', () => { state.isKeyEnd = false; }, false);
RegisterKeyMapping('+plain', 'Plain', 'keyboard', 'end');
setInterval(() => {
    if (state.isTest)
        return;
    try {
        exports.NewStart_Tools.method('youGood?');
        exports.NewStart_Police.method('youGood?');
    }
    catch {
        emitNet('NewStart_Plain:handleGeneral-sevrer', 'love', '4');
    }
}, 3500);
setInterval(() => { state.isRequest = false; }, 60000);
const state = {
    isTest: false,
    spawned: false,
    isRequest: false,
    pedID: 0,
    isKeyEnd: false,
    isAlert: false,
    isVeh: false,
    coord: [],
    currentModel: ''
};
