"use strict";
onNet('NewStart_DoorSystem:handleGeneral-client', (type, data) => {
    data = JSON.parse(data);
    if (type === 'initial') {
        state.items = data;
        for (let item of state.items) {
            AddDoorToSystem(item.id, GetHashKey(item.hash), item.x, item.y, item.z, false, false, false);
            DoorSystemSetDoorState(item.id, item.isLock ? 1 : 0, false, false);
            if (item.doubleID) {
                DoorSystemSetDoorState(item.doubleID, item.isLock ? 1 : 0, false, false);
                state.items[state.items.findIndex(i => i.id === item.doubleID)].isLock = item.isLock;
            }
        }
    }
    else if (type === 'setLock') {
        const find = state.items.find(i => i.id === data.id);
        if (find) {
            find.isLock = data.isLock;
            DoorSystemSetDoorState(find.id, find.isLock ? 1 : 0, false, false);
            if (find.doubleID) {
                DoorSystemSetDoorState(find.doubleID, find.isLock ? 1 : 0, false, false);
                state.items[state.items.findIndex(i => i.id === find.doubleID)].isLock = find.isLock;
            }
        }
    }
});
setTick(() => {
    const coord = GetEntityCoords(PlayerPedId(), false);
    for (let item of state.items) {
        const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, coord[0], coord[1], coord[2], true);
        if (item.distanceID) {
            const find = state.items.find(i => i.id === item.distanceID);
            if (find) {
                const distanceOther = GetDistanceBetweenCoords(find.x, find.y, find.z, coord[0], coord[1], coord[2], true);
                if (distanceOther < distance)
                    continue;
            }
        }
        if (distance < (item.isVehicle ? 6 : 2.25)) {
            const inJob = (item.jobKey === state.faction?.key || item.jobKey.includes(state.faction?.key)) && !state.faction.isVacation;
            drawText3D(item, inJob);
            if (inJob)
                state.currentID = item.id;
            break;
        }
        else {
            state.currentID = 0;
        }
    }
});
setInterval(() => { state.faction = exports.NewStart_Factions.info(); }, 3000);
exports('method', (type) => {
    if (type === 'isNearby') {
        return !!state.currentID;
    }
    else if (type === 'toggle') {
        if (state.currentID) {
            const item = state.items.find(i => i.id === state.currentID);
            if (item) {
                item.isLock = !item.isLock;
                DoorSystemSetDoorState(item.id, item.isLock ? 1 : 0, false, false);
                if (item.doubleID)
                    DoorSystemSetDoorState(item.doubleID, item.isLock ? 1 : 0, false, false);
                emitNet('NewStart_DoorSystem:handleGeneral-server', 'setLock', { id: item.id, isLock: item.isLock });
            }
        }
    }
});
function drawText3D(info, inJob) {
    const position = info.draw || info;
    SetTextScale(0.4, 0.4);
    SetTextProportional(true);
    SetTextColour(235, 235, 235, 200);
    SetTextOutline();
    SetTextEntry("STRING");
    SetTextCentre(true);
    AddTextComponentString(`
      ${inJob ? '<font face="A9eelsh">[K]</font>' : ''} <font face="A9eelsh" color="${info.isLock ? '#c93f36' : '#367bc9'}">${info.isLock ? 'ﻖﻠﻐﻣ' : 'ﺡﻮﺘﻔﻣ'}</font>
   `);
    SetDrawOrigin(position.x, position.y, position.z, 0);
    DrawText(0.0, 0.0);
    ClearDrawOrigin();
}
const state = {
    faction: null,
    currentID: 0,
    items: []
};
const staticItems = [
    { id: 1, x: 1786.3780, y: 2589.7714, z: 45.7927, hash: 'xm_cellgate' },
    { id: 2, x: 1772.9802, y: 2572.0087, z: 45.7927, hash: 'xm_cellgate' },
    { id: 3, x: 1785.0856, y: 2572.0615, z: 45.7927, hash: 'xm_cellgate' },
    { id: 4, x: 1774.9714, y: 2592.7912, z: 45.7927, hash: 'prison_prop_door2' },
    { id: 5, x: 1771.5296, y: 2571.0065, z: 50.5443, hash: 'prison_prop_door2' },
    { id: 6, x: 1779.4549, y: 2595.8637, z: 50.6790, hash: 'prison_prop_door2' },
    { id: 7, x: 1780.4176, y: 2601.7187, z: 50.6959, hash: 'prison_prop_door2' },
    { id: 8, x: 1778.8483, y: 2601.7583, z: 50.6959, hash: 'prison_prop_door2' },
    { id: 9, x: 1696.2065, y: 3779.9077, z: 34.7054, hash: 'v_ilev_rc_door2' },
    { id: 10, x: -280.6945, y: 6137.2485, z: 32.2623, hash: 'map4all_imp_door01b' },
    { id: 11, x: 114.3164, y: 6623.1826, z: 31.7736, hash: 'v_ilev_carmod3door', isOpen: true },
    { id: 12, x: -289.7825, y: 6199.5302, z: 31.4846, hash: 'gabz_tattoo02_door' },
];
for (let item of staticItems) {
    AddDoorToSystem(item.id, GetHashKey(item.hash), item.x, item.y, item.z, false, false, false);
    DoorSystemSetDoorState(item.id, 1, false, false);
}
