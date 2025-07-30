"use strict";
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_Tools:handleGeneral-client', (type, data) => {
    if (type === 'setTime') {
        if (!time.max) {
            time = data;
            startTime();
        }
        else
            time.current = data;
    }
    else if (type === 'items') {
        handleItems(data.type, data);
    }
    else if (type === 'subSeaPortClosed') {
        time.subSeaPortClosed = data.value;
        if (data.isInitial)
            time.lastSubSeaPortClosed = data.value;
        if (!data.isInitial && !time.seaPortClosed && time.subSeaPortClosed !== time.lastSubSeaPortClosed) {
            const text = `نحيطكم علماً أنه تم ${time.subSeaPortClosed ? 'غلق' : 'فتح'} التوسعة الفرعية للميناء البحري`;
            emit('NewStart_Phone:receiveMessage-client', JSON.stringify({ number: '-3', text: text + '.' }));
            emit('NewStart_MainMenu:addToAds-client', { type: 'public', from: 'هيئة الموانئ', text });
        }
        time.lastSubSeaPortClosed = data.value;
    }
    else if (type === 'disconnect') {
        handleDisconnect(data.type, data.info);
    }
    else if (type === 'inventory') {
        exports.NewStart_Tools.inventory(data.type, data);
    }
    else if (type === 'startAdminScreen') {
        exports.NewStart_HudSystem.closeUI();
        exports.NewStart_Phone.noticesToggle(true);
        exports.NewStart_MainMenu.toggleAds(false);
        DisplayRadar(false);
        SendNUIMessage({ type: 'screen', text: data });
        PlaySoundFrontend(-1, 'Enter_1st', 'GTAO_Magnate_Boss_Modes_Soundset', false);
        state.screenToogle = true;
    }
});
exports('sendToNUI', (data) => {
    if (data.type === 'progress') {
        state.progress.status = data.status;
        if (data.status) {
            if (!data.canMove) {
                exports.NewStart_Inventory.closeUI();
                SetNuiFocus(true, false);
                state.progress.tickID = setTick(() => {
                    DisableControlAction(0, 38, true);
                    DisableControlAction(0, 73, true);
                    DisableControlAction(state.pedID, 243, true);
                    DisableControlAction(state.pedID, 16, true);
                    DisableControlAction(state.pedID, 17, true);
                    DisableControlAction(state.pedID, 24, true);
                    DisableControlAction(state.pedID, 19, true);
                    DisableControlAction(state.pedID, 25, true);
                    SetPauseMenuActive(false);
                });
            }
        }
        else {
            SetPauseMenuActive(true);
            SetNuiFocus(false, false);
            clearTick(state.progress.tickID);
        }
    }
    SendNUIMessage(data);
});
exports('method', (type, data, more, more2) => {
    if (type === 'getInfo') {
        return {
            zoneType: zone.type,
            isZone: state.isZone,
            time: time.result,
            weather: time.weatherType,
            attachID: flatbed.attachID,
            seaPortClosed: time.seaPortClosed,
            subSeaPortClosed: time.subSeaPortClosed,
            isCrawling: crouch.isCrawling
        };
    }
    else if (type === 'data') {
        return { zones: zone.greens }[data];
    }
    else if (type === 'isProgress') {
        return state.progress.status;
    }
    else if (type === 'reset') {
        if (data === 'attachID')
            flatbed.attachID = 0;
    }
    else if (type === 'setZone') {
        const vehID = GetVehiclePedIsIn(state.pedID, false);
        if (data) {
            if (!((state.keys.includes(exports.NewStart_Factions.info()?.key) && exports.NewStart_Employee.data().isActive) &&
                GetCurrentPedWeapon(state.pedID, false)[1] === 911657153))
                SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
            if (vehID && !more2)
                SetEntityMaxSpeed(vehID, 40 / 3.6);
            if (!more)
                state.isZone = true;
        }
        else {
            if (vehID && !more2) {
                if (GetEntityHealth(vehID) < 850)
                    SetEntityMaxSpeed(vehID, GetVehicleModelEstimatedMaxSpeed(GetEntityArchetypeName(vehID)) / 3.5);
                else
                    SetEntityMaxSpeed(vehID, GetVehicleHandlingFloat(vehID, 'CHandlingData', 'fInitialDriveMaxFlatVel'));
            }
            if (!more)
                state.isZone = false;
        }
    }
    else if (type === 'setDiscord') {
        SetTitleDiscord(data);
    }
    else if (type === 'getMinimapPosition') {
        return getMinimapPosition();
    }
    else if (type === 'setState') {
        state[data] = more;
    }
    else if (type === 'crouchReset') {
        if (crouch.isActive)
            crouchReset();
    }
    else if (type === 'hasFocus') {
        SetNuiFocus(data, false);
    }
    else if (type === 'passiveModeVehicle') {
        passiveModeVehicle(data);
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    switch (data.type) {
        case 'screenCloseUI':
            exports.NewStart_Phone.noticesToggle(false);
            if (!exports.NewStart_MainMenu.isOpen()) {
                DisplayRadar(true);
                exports.NewStart_HudSystem.openHud();
                exports.NewStart_MainMenu.toggleAds(true);
            }
            SetNuiFocus(false, false);
            state.screenToogle = false;
            break;
    }
    cb('OK!');
});
function draw3Dtext(text, coords) {
    SetTextScale(0.2, 0.2);
    SetTextProportional(true);
    SetTextColour(210, 210, 210, 200);
    SetTextOutline();
    SetTextEntry("STRING");
    SetTextCentre(true);
    AddTextComponentString(`<font face="A9eelsh">${text}</font>`);
    SetDrawOrigin(coords[0], coords[1], coords[2] + 0.8, 0);
    DrawText(0.0, 0.0);
    ClearDrawOrigin();
}
const state = {
    pedID: 0,
    clientID: 0,
    keys: ['police', 'facilities'],
    coords: [],
    progress: { status: false, tickID: 0 },
    isVeh: false,
    isZone: false,
    screenToogle: false
};
const empty = null;
;
;
;
;
;
const anydoor = { isEnter: false, lastDoor: 0, runAuto: false, timeoutID: 0 };
RegisterCommand('+vehicle', () => {
    if (exports.NewStart_VehicleSystem.method('meter', 'seatBelt')) {
        return exports.NewStart_Notifications.showAttention('error', 'يجب عليك أن تزيل حزام الأمان قبل النزول!');
    }
}, false);
RegisterKeyMapping('+vehicle', 'Vehicle', 'keyboard', 'f');
setTick(async () => {
    if (!state.isVeh && IsControlJustReleased(0, 23) && !anydoor.isEnter) {
        const vehID = GetVehiclePedIsTryingToEnter(state.pedID);
        const doors = GetNumberOfVehicleDoors(vehID);
        if (vehID && doors) {
            const items = [];
            for (let i = 0; i < doors; i++) {
                const doorPos = GetEntryPositionOfDoor(vehID, i);
                items.push({ id: i - 1, distance: GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], doorPos[0], doorPos[1], doorPos[2], false) });
            }
            let find = items.find(i => IsVehicleSeatFree(vehID, i.id) && i.distance === Math.min(...items.map(i => i.distance)));
            if (find) {
                const vehModel = GetEntityArchetypeName(vehID);
                if (vehModel === 'bronxambo' && find.id > 0) {
                    const filter = items.filter(i => i.id <= 0);
                    find = filter.find(i => i.distance === Math.min(...filter.map(i => i.distance)));
                }
                else if (find.id === 1 && IsVehicleSeatFree(vehID, -1) && !exports.NewStart_VehicleSystem.method('meter', 'skip').includes(vehModel)) {
                    find.id = -1;
                }
                ClearPedTasks(state.pedID);
                TaskEnterVehicle(state.pedID, vehID, -1, find.id, 1.0, 1, 0);
                anydoor.lastDoor = find.id;
                anydoor.isEnter = true;
            }
        }
    }
    if (anydoor.isEnter) {
        if (IsControlPressed(0, 21) && anydoor.lastDoor !== 100) {
            TaskEnterVehicle(state.pedID, GetVehiclePedIsTryingToEnter(state.pedID), -1, anydoor.lastDoor, 2.0, 1, 0);
            anydoor.lastDoor = 100;
        }
        else if (IsControlJustReleased(0, 33) || IsControlJustReleased(0, 34) || IsControlJustReleased(0, 35)) {
            ClearPedTasks(state.pedID);
            anydoor.isEnter = false;
        }
        else if (state.isVeh) {
            anydoor.isEnter = false;
            anydoor.lastDoor = 0;
        }
    }
    if (state.isVeh && !anydoor.runAuto) {
        SetPedConfigFlag(state.pedID, 184, true);
        anydoor.runAuto = true;
    }
    else if (!state.isVeh && anydoor.runAuto) {
        anydoor.runAuto = false;
    }
});
setTick(async () => {
    if (state.isVeh) {
        if (IsControlPressed(2, 75)) {
            const vehID = GetVehiclePedIsIn(state.pedID, false);
            if (!['f350offroadspec'].includes(GetEntityArchetypeName(vehID))) {
                TaskLeaveVehicle(state.pedID, vehID, 0);
                if (GetIsVehicleEngineRunning(vehID)) {
                    await Delay(150);
                    SetVehicleEngineOn(vehID, true, true, false);
                }
            }
        }
        else if (IsControlJustPressed(0, 21)) {
            const vehID = GetVehiclePedIsIn(state.pedID, false);
            if (IsVehicleSeatFree(vehID, -1)) {
                if (exports.NewStart_Employee.method('vehicles').some((i) => i.hash === GetEntityModel(vehID) || i.hash === GetEntityArchetypeName(vehID))) {
                    const faction = exports.NewStart_Factions.info();
                    if (!faction?.key || faction?.isVacation) {
                        return exports.NewStart_Notifications.showAttention('error', 'لا يمكن قيادة مركبة من مركبات الهيئات الرسمية!');
                    }
                }
                SetPedConfigFlag(state.pedID, 184, false);
            }
        }
    }
});
const crouch = { isActive: false, isCrawling: false };
RequestAnimSet('move_ped_crouched');
RequestAnimDict('amb@world_human_sunbathe@male@front@enter');
RequestAnimDict('move_crawl');
setTick(() => {
    state.isVeh = IsPedInAnyVehicle(state.pedID, true);
    if (IsControlJustPressed(0, 21)) {
        toggleCrawling();
    }
    else if (state.isVeh && crouch.isActive) {
        crouchReset();
    }
});
setTick(async () => {
    if (crouch.isCrawling) {
        if (IsControlPressed(0, 32)) {
            TaskPlayAnim(state.pedID, 'move_crawl', 'onfront_fwd', 8.0, -8.0, -1, 2, 0.0, false, false, false);
            await Delay(820);
        }
        else if (IsControlPressed(0, 31)) {
            TaskPlayAnim(state.pedID, 'move_crawl', 'onfront_bwd', 8.0, -8.0, -1, 2, 0.0, false, false, false);
            await Delay(990);
        }
    }
});
RegisterCommand('+crouch', () => {
    if (state.isVeh || exports.NewStart_Medicine.limited('get'))
        return;
    DisableControlAction(0, 36, true);
    if (crouch.isCrawling)
        crawlReset();
    if (!crouch.isActive && IsPedOnFoot(state.pedID) && !IsPedJumping(state.pedID) && !IsPedFalling(state.pedID) && !IsPedDeadOrDying(state.pedID, false)) {
        crouch.isActive = true;
        SetPedUsingActionMode(state.pedID, false, -1, 'DEFAULT_ACTION');
        SetPedMovementClipset(state.pedID, 'move_ped_crouched', 0.55);
        SetPedStrafeClipset(state.pedID, 'move_ped_crouched_strafing');
    }
    else if (crouch.isActive) {
        crouchReset();
    }
}, false);
RegisterKeyMapping('+crouch', 'Crouch', 'keyboard', 'LCONTROL');
async function toggleCrawling() {
    await Delay(300);
    if (!IsControlPressed(0, 21)) {
        if (crouch.isActive && !crouch.isCrawling) {
            ClearPedTasks(state.pedID);
            ClearPedTasksImmediately(state.pedID);
            crouch.isCrawling = true;
            TaskPlayAnim(state.pedID, 'amb@world_human_sunbathe@male@front@enter', 'enter', 8.0, -8.0, -1, 2, 0.0, false, false, false);
            crouchReset();
        }
        else if (!crouch.isActive && crouch.isCrawling) {
            crawlReset();
        }
    }
}
function crouchReset() {
    crouch.isActive = false;
    ResetPedMovementClipset(state.pedID, 0.55);
    ResetPedStrafeClipset(state.pedID);
    SetPedCanPlayAmbientAnims(state.pedID, true);
    SetPedCanPlayAmbientBaseAnims(state.pedID, true);
    ResetPedWeaponMovementClipset(state.pedID);
}
function crawlReset() {
    crouch.isCrawling = false;
    ClearPedTasks(state.pedID);
}
const disconnect = { items: [] };
setTick(() => {
    for (let item of disconnect.items) {
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], item.coords[0], item.coords[1], item.coords[2], true);
        if (distance < 20) {
            DrawMarker(27, item.coords[0], item.coords[1], item.coords[2] - 0.975, 0, 0, 0, 0, 0, 0, 1.1, 1.1, 0, 141, 44, 37, 150, false, false, 2, false, empty, empty, false);
            if (distance < 7.5) {
                disconnectDrawText3D('ﻡﺩﺎﺨﻟﺍ ﻦﻣ ﺝﺮﺧ ﺪﻘﻟ', [item.coords[0], item.coords[1], item.coords[2]], [201, 63, 54, 255]);
                disconnectDrawText3D(`(${item.customID}) :ﻑﺮﻌﻤﻟﺍ`, [item.coords[0], item.coords[1], item.coords[2] - 0.2], [235, 235, 235, 200]);
                disconnectDrawText3D(`${item.reason.length > 30 ? '...' : ''}${item.reason.slice(0, 30)} :ﺐﺒﺴﻟﺍ`, [item.coords[0], item.coords[1], item.coords[2] - 0.35], [235, 235, 235, 200]);
            }
        }
    }
});
function handleDisconnect(type, item) {
    if (type === 'push' && typeof item === 'object') {
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], item.coords[0], item.coords[1], item.coords[2], true);
        if (distance < 250) {
            item.reason = item.reason.replace('.', '');
            disconnect.items.push({ ...item, date: Date.now() });
        }
    }
    else if (type === 'check' && typeof item === 'string') {
        const index = disconnect.items.findIndex(i => i.customID === item);
        if (index >= 0) {
            disconnect.items.splice(index, 1);
        }
    }
}
setInterval(() => {
    if (disconnect.items.length) {
        const time = Date.now();
        for (let index in disconnect.items) {
            if ((time - disconnect.items[index].date) >= 150000)
                disconnect.items.splice(index, 1);
        }
    }
}, 300000);
function disconnectDrawText3D(title, coords, color) {
    SetTextScale(0.3, 0.3);
    SetTextProportional(true);
    SetTextColour(...color);
    SetTextOutline();
    SetTextEntry("STRING");
    SetTextCentre(true);
    AddTextComponentString(`<font face="A9eelsh">${title}</font>`);
    SetDrawOrigin(coords[0], coords[1], coords[2], 0);
    DrawText(0.0, 0.0);
    ClearDrawOrigin();
}
const flatbed = { attachID: 0, isLoading: false };
setTick(async () => {
    if (state.isVeh && IsControlJustReleased(0, 22)) {
        if (exports.NewStart_Police.method('info').isReservation)
            return;
        const vehID = GetVehiclePedIsIn(state.pedID, false);
        if ((IsVehicleModel(vehID, 1353720154) || IsVehicleModel(vehID, 'flatbed3')) && !flatbed.isLoading) {
            if (NetworkGetEntityOwner(vehID) !== PlayerId()) {
                return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون مالك المركبة للتحكم في السحب!');
            }
            else if (GetIsVehicleEngineRunning(vehID)) {
                return exports.NewStart_Notifications.showAttention('error', flatbed.attachID ? 'قم بإطفاء محرك السطحة أولا قبل الإنزال!' : 'قم بإطفاء محرك السطحة أولا قبل السحب!');
            }
            if (flatbed.attachID) {
                exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true });
                flatbed.isLoading = true;
                SetNuiFocus(true, false);
                setTimeout(async () => {
                    exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                    flatbed.isLoading = false;
                    SetNuiFocus(false, false);
                    let timeout = 2000;
                    NetworkRequestControlOfEntity(flatbed.attachID);
                    SetEntityAsMissionEntity(flatbed.attachID, true, true);
                    while (timeout > 0 && !NetworkHasControlOfEntity(flatbed.attachID)) {
                        await Delay(100);
                        timeout = timeout - 100;
                    }
                    AttachEntityToEntity(flatbed.attachID, vehID, 20, -0.5, -12.3, 0, 0.0, 0.0, 0.0, false, false, false, false, 20, true);
                    DetachEntity(flatbed.attachID, true, true);
                    flatbed.attachID = 0;
                }, 10000);
            }
            else {
                const index = GetEntityBoneIndexByName(vehID, 'bumper_r');
                const [x, y, z] = GetWorldPositionOfEntityBone(vehID, index);
                const nearbyID = exports.NewStart_VehicleSystem.method('getClosestVeh', 4.5, false, [x, y, z]);
                const isNet = NetworkDoesEntityExistWithNetworkId(NetworkGetNetworkIdFromEntity(nearbyID));
                let seatFree = true;
                for (let i = -1; i < (GetVehicleModelNumberOfSeats(GetEntityModel(nearbyID)) - 1); i++) {
                    if (!IsVehicleSeatFree(nearbyID, i)) {
                        seatFree = false;
                        break;
                    }
                }
                if (nearbyID && isNet && seatFree) {
                    const nearbyCoords = GetEntityCoords(nearbyID, true);
                    const distance = GetDistanceBetweenCoords(x, y, z, nearbyCoords[0], nearbyCoords[1], nearbyCoords[2], true);
                    if ([10, 14, 15, 16, 17, 20, 21].includes(GetVehicleClass(nearbyID))) {
                        return exports.NewStart_Notifications.showAttention('error', 'يصعب وضع هذه المركبة علي السطحة!');
                    }
                    else if (distance < 4.5) {
                        NetworkRequestControlOfEntity(nearbyID);
                        SetEntityAsMissionEntity(nearbyID, true, true);
                        exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '12s', status: true });
                        flatbed.isLoading = true;
                        SetNuiFocus(true, false);
                        setTimeout(async () => {
                            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                            flatbed.isLoading = false;
                            SetNuiFocus(false, false);
                            let seatFree = true;
                            for (let i = -1; i < (GetVehicleModelNumberOfSeats(GetEntityModel(nearbyID)) - 1); i++) {
                                if (!IsVehicleSeatFree(nearbyID, i)) {
                                    seatFree = false;
                                    break;
                                }
                            }
                            if (!seatFree) {
                                return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون المركبة فارغة للسحب!');
                            }
                            let timeout = 2000;
                            NetworkRequestControlOfEntity(nearbyID);
                            SetEntityAsMissionEntity(nearbyID, true, true);
                            while (timeout > 0 && !NetworkHasControlOfEntity(nearbyID)) {
                                await Delay(100);
                                timeout = timeout - 100;
                            }
                            if (NetworkHasControlOfEntity(nearbyID)) {
                                AttachEntityToEntity(nearbyID, vehID, 20, -0.5, -5.7, 1.0, 0.0, 0.0, 0.0, false, true, false, false, 20, true);
                                flatbed.attachID = nearbyID;
                            }
                            else {
                                return exports.NewStart_Notifications.showAttention('error', 'لقد فشل سحب المركبة للسطحة يرجي المحاولة مرة أخرى!');
                            }
                        }, 11000);
                    }
                }
                else if (nearbyID && !isNet) {
                    return exports.NewStart_Notifications.showAttention('error', 'غير مسموح لك بسحب هذه المركبة!');
                }
                else if (!seatFree) {
                    return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون المركبة فارغة للسحب!');
                }
                else {
                    return exports.NewStart_Notifications.showAttention('error', 'لا يوجد مركبة قريبة كفاية من خلف السحطة!');
                }
            }
        }
    }
});
const inventory = { items: [], lastExe: 0 };
setTick(() => {
    if (inventory.items.length) {
        for (let index = 0; index < inventory.items.length; index++) {
            const item = inventory.items[index];
            if ((time.lastExecuted - (item.date || item.id)) >= 11000) {
                inventory.items.splice(index, 1);
                index--;
                SendNUIMessage({ type: 'inventory', info: inventory.items });
                if (!inventory.items.length) {
                    exports.NewStart_Phone.noticesToggle(false);
                }
            }
        }
        if (IsPauseMenuActive()) {
            inventory.items = [];
            SendNUIMessage({ type: 'inventory', info: [] });
        }
    }
});
exports('inventory', (type, data) => {
    const staticItems = exports.NewStart_Inventory.staticData();
    if (type === 'removeAll') {
        const currentItems = exports.NewStart_Inventory.info('currentItems');
        const filter = staticItems.filter((i) => currentItems.some((c) => c.id === i.id) && i.isTaboo);
        inventory.items = [...inventory.items, ...filter.map((i) => ({
                id: i.id, type: 'remove', title: i.title.length > 5 ? `${i.title.slice(0, 5)}...` : i.title,
                image: 'nui://NewStart_Inventory/ui_page/build/' + i.image, count: currentItems.find((c) => c.id === i.id).count, date: time.lastExecuted
            }))];
    }
    else {
        if (data.id === 1)
            return;
        const item = staticItems.find((i) => i.id === data.id);
        inventory.items.push({
            id: Date.now(), type,
            title: item.title.length > 6 ? `${item.title.slice(0, 5)}...` : item.title,
            image: 'nui://NewStart_Inventory/ui_page/build/' + item.image,
            count: data.count
        });
    }
    SendNUIMessage({ type: 'inventory', info: inventory.items.slice(0, 10) });
    setTimeout(() => exports.NewStart_Phone.noticesToggle(true), 150);
});
const items = { isRequest: false, mainDis: 1.6, currentID: 0, lastCurrentID: null, isOpen: false, runClose: false, model: 289396019, data: [] };
RequestModel(items.model);
setTick(() => {
    items.currentID = 0;
    const distanceAll = [];
    for (let item of items.data) {
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], item.coords[0], item.coords[1], item.coords[2], true);
        if (distance < 10) {
            if (distance > items.mainDis || state.isVeh) {
                DrawMarker(20, item.coords[0], item.coords[1], item.coords[2] + 0.7, 0, 0, 0, 0, 180, 0, 0.2, 0.2, 0.15, 45, 101, 167, 100, false, true, 2, false, empty, empty, false);
            }
            else if (distance < items.mainDis) {
                distanceAll.push({ id: item.id, distance, coords: item.coords });
            }
        }
    }
    if (distanceAll.length) {
        const data = distanceAll.reduce((a, b) => b.distance < a.distance ? b : a);
        draw3Dtext(items.isOpen ? 'ﺐﺤﺴﻠﻟ ﻱﺮﺧﺃ ﺓﺮﻣ ﻂﻐﺿﺍ' : 'ﺓ ﻭﺃ M ىﻮﺘﺤﻤﻟﺍ ﺔﻳﺅﺮﻟ', data.coords);
        items.currentID = data.id;
        if (!items.isOpen)
            items.lastCurrentID = data.id;
    }
    if (items.currentID && (items.currentID === items.lastCurrentID) && !IsEntityDead(state.pedID)) {
        if (IsControlJustPressed(0, 244)) {
            if (items.isOpen) {
                if (!items.isRequest) {
                    const currentKG = exports.NewStart_Inventory.info('currentKG');
                    const maxKG = exports.NewStart_Inventory.info('maxKG');
                    const reshape = itemsReshape();
                    const data = reshape.filter((i) => !i.level).map((item) => ({ id: item.id, refID: item.refID, space: item.space * item.count, count: item.count }));
                    if (!data.length) {
                        exports.NewStart_Notifications.showAttention('error', 'لا يمكنك سحب أي شئ متواجد هنا!');
                    }
                    else {
                        const staticData = exports.NewStart_Inventory.staticData();
                        const currentItems = exports.NewStart_Inventory.info('currentItems');
                        const filter = [];
                        let canError = true;
                        for (let item of data) {
                            if ((item.space + currentKG) <= maxKG) {
                                if ([40, 79, 89, 90, 36].includes(item.refID)) {
                                    const find = staticData.find((i) => i.id === item.refID);
                                    const job = exports.NewStart_Jobs.method('finalIDs').find((i) => Array.isArray(i.id) ? i.id.some((s) => s.id === item.refID) : i.id === item.refID);
                                    let result = 0;
                                    if ([89, 90].includes(item.refID)) {
                                        const current = currentItems.filter((i) => job.id.some((r) => r.id === i.id)).reduce((t, i) => t + i.count, 0);
                                        result = (current ? (current * find.space) : 0) + (find.space * item.count);
                                    }
                                    else {
                                        const current = currentItems.find((i) => i.id === item.refID);
                                        const allSum = data.filter(i => i.refID === item.refID).reduce((a, b) => a + (find.space * b.count), 0);
                                        result = (current ? (current.count * find.space) : 0) + allSum;
                                    }
                                    if (result > job.maxKG) {
                                        canError = false;
                                        exports.NewStart_Notifications.showAttention('error', `لا يمكن سحب "${find.title}" ستتخطي كمية اليد للمنتج!`);
                                        continue;
                                    }
                                }
                                filter.push(item);
                            }
                        }
                        if (!filter.length && canError) {
                            exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي مساحة كافية داخل حقيبتك للسحب!');
                        }
                        else {
                            items.isRequest = true;
                            emitNet('NewStart_Tools:handleGeneral-server', 'dragItems', JSON.stringify(filter.map(i => i.id)));
                        }
                    }
                }
            }
            else {
                SendNUIMessage({ type: 'items', info: itemsReshape() });
                items.isOpen = true;
                items.lastCurrentID = items.currentID;
            }
        }
        items.runClose = true;
    }
    else if (items.runClose) {
        items.isOpen = false;
        items.runClose = false;
        items.lastCurrentID = null;
        SendNUIMessage({ type: 'items', info: [] });
    }
    if (items.isOpen) {
        DisableControlAction(0, 200, true);
    }
});
function handleItems(type, data) {
    if (type === 'set' && 'coords' in data) {
        if (exports.NewStart_RealEstate.method('getCurrent', 'insideCode'))
            return;
        const index = items.data.findIndex(i => GetDistanceBetweenCoords(data.coords[0], data.coords[1], data.coords[2], i.coords[0], i.coords[1], i.coords[2], true) < items.mainDis);
        delete data.type;
        if (index >= 0) {
            if (!items.data[index].group)
                items.data[index].group = [];
            items.data[index].group.push(data);
            if (items.isOpen && items.data.some(i => i.id === items.currentID && i.group?.some(g => g.id === data.id))) {
                SendNUIMessage({ type: 'items', info: itemsReshape() });
            }
        }
        else {
            const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], data.coords[0], data.coords[1], data.coords[2], true);
            if (distance < 150) {
                data.objectID = CreateObject(items.model, data.coords[0], data.coords[1], data.coords[2], false, false, false);
                FreezeEntityPosition(data.objectID, true);
                SetEntityInvincible(data.objectID, true);
                SetEntityCollision(data.objectID, false, false);
                items.data.push(data);
            }
        }
    }
    else if (type === 'remove' && 'IDs' in data) {
        const find = items.data.find(i => data.IDs.includes(i.id) || i.group?.some(g => data.IDs.includes(g.id)));
        if (find) {
            const isEvery = data.IDs.includes(find.id) && (find.group ? find.group.every(g => data.IDs.includes(g.id)) : true);
            let info = [];
            if (isEvery) {
                DeleteObject(find.objectID);
                items.data.splice(items.data.findIndex(i => i.id === find.id), 1);
            }
            else {
                const isMain = !data.IDs.includes(find.id);
                find.group = find.group?.filter(i => !data.IDs.includes(i.id));
                if (isMain && !find.group?.length) {
                    delete find.group;
                }
                else if (!isMain) {
                    if (find.group?.length) {
                        const newMain = { ...find.group[0] };
                        const canOpen = items.isOpen && find.id === items.currentID;
                        find.id = newMain.id;
                        find.count = newMain.count;
                        find.refID = newMain.refID;
                        if (canOpen) {
                            items.currentID = newMain.id;
                            items.lastCurrentID = newMain.id;
                        }
                        if (find.group.length === 1) {
                            delete find.group;
                        }
                        else if (find.group.length > 1) {
                            find.group.splice(0, 1);
                        }
                    }
                }
            }
            if (items.isOpen && items.data.some(i => i.id === find.id && i.id === items.currentID)) {
                if (!isEvery)
                    info = itemsReshape();
                SendNUIMessage({ type: 'items', info });
            }
        }
    }
    else if (type === 'give' && 'items' in data) {
        for (let item of data.items) {
            if (!item.features)
                delete item.features;
            exports.NewStart_Inventory.addItem(JSON.stringify(item));
        }
        items.isRequest = false;
    }
    else if (type === 'failed') {
        exports.NewStart_Notifications.showAttention('error', 'لقد فشل سحب المحتوي إلى حقيبتك!');
        items.isRequest = false;
    }
    else if (type === 'endTime' && 'removes' in data) {
        for (let id of data.removes) {
            const find = items.data.find(i => i.id === id);
            if (find)
                DeleteObject(find.objectID);
        }
        items.data = items.data.filter(i => !data.removes.includes(i.id));
    }
}
function itemsReshape() {
    if (!items.currentID)
        return [];
    const staticItems = exports.NewStart_Inventory.staticData();
    const item = { ...items.data.find(i => i.id === items.currentID) };
    let info = [];
    if (item?.group) {
        info = [...item.group];
        delete item.group;
        info.unshift(item);
    }
    else {
        info.push(item);
    }
    info = info.map((i) => {
        const item = staticItems.find((s) => s.id === i.refID);
        return {
            id: i.id,
            refID: i.refID,
            path: 'nui://NewStart_Inventory/ui_page/build/' + item.image,
            level: item.level > exports.NewStart_MainMenu.getLevel() ? item.level : 0,
            space: item.space, count: i.count
        };
    });
    return info.splice(0, 6);
}
const objects = [
    { id: 1, refID: 0, model: -1137432939, x: -3387.2725, y: 2637.0702, z: 33.4080, pitch: 90, yaw: 200 },
    { id: 2, refID: 0, model: -1948789270, x: -3309.1120, y: 2843.9077, z: 8.2285, h: 123.7244 },
    { id: 4, refID: 0, model: 10609342, x: -284.3340, y: 6108.9360, z: 30.2197, h: 0 },
    { id: 5, refID: 0, model: 334531408, x: -89.9354, y: 6234.5443, z: 30.0200, h: 0, pitch: 90, yaw: -65 },
    { id: 6, refID: 0, model: -227275508, x: -2724.35166, y: 2628.38033, z: 8.377, h: 0, yaw: -52.9998 },
    { id: 7, refID: 0, model: -227275508, x: -2727.1394, y: 2632.0966, z: 8.404, h: 0, yaw: 126.9995 },
    { id: 8, refID: 0, model: -227275508, x: -3040.20, y: 2671.066, z: 8.167, h: 0, pitch: 2.4, yaw: -110.9999 },
    { id: 9, refID: 0, model: -227275508, x: -3535.4206, y: 2732.3842, z: 8.2490, h: 0, yaw: -109.9999 },
    { id: 10, refID: 0, model: -227275508, x: -2998.7546, y: 2661.9091, z: 8.060, h: 0, yaw: 69.9997 },
    { id: 11, refID: 0, model: -227275508, x: -3003.9, y: 2648.6249, z: 8.060, h: 0, yaw: 247.9997 },
];
setTimeout(() => {
    (async function () {
        for (let item of objects) {
            RequestModel(item.model);
            while (!HasModelLoaded(item.model))
                await Delay(250);
            item.refID = CreateObject(item.model, item.x, item.y, item.z, false, false, false);
            FreezeEntityPosition(item.refID, true);
            SetEntityInvincible(item.refID, true);
            if (item.h)
                SetEntityHeading(item.refID, item.h);
            if (item.yaw)
                SetEntityRotation(item.refID, item.pitch || 0, 0, item.yaw, 1, true);
        }
    })();
}, 5000);
on('onResourceStop', () => {
    for (let item of objects)
        DeleteObject(item.refID);
});
const other = { passiveID: 0 };
setTick(() => {
    if (state.screenToogle && !IsNuiFocused()) {
        SetNuiFocus(true, true);
    }
});
function passiveModeVehicle(end = 6000) {
    clearTick(other.passiveID);
    const start = Date.now();
    const vehID = GetVehiclePedIsIn(state.pedID, false);
    other.passiveID = setTick(() => {
        const currentID = GetVehiclePedIsIn(state.pedID, false);
        for (let id of GetGamePool('CVehicle')) {
            SetEntityNoCollisionEntity(currentID, id, true);
            SetEntityNoCollisionEntity(id, currentID, true);
        }
        SetEntityAlpha(currentID, 100, false);
        if (vehID !== currentID || (time.lastExecuted - start) >= end) {
            ResetEntityAlpha(vehID);
            return clearTick(other.passiveID);
        }
    });
}
setInterval(() => {
    if (exports.NewStart_Plain.method('environmentTest'))
        return;
    try {
        exports.NewStart_Plain.method('youGood?');
        exports.NewStart_Police.method('youGood?');
    }
    catch {
        emitNet('NewStart_Plain:handleGeneral-sevrer', 'love', '4');
    }
}, 2500);
SetDiscordAppId('1088025998638989352');
SetDiscordRichPresenceAsset('logooo');
SetDiscordRichPresenceAssetText('NewStart Life For Roleplay');
SetDiscordRichPresenceAssetSmall('fivem');
SetDiscordRichPresenceAssetSmallText('FiveM');
SetDiscordRichPresenceAction(0, 'دخول السيرفر', 'https://newstart.one/goplay');
SetDiscordRichPresenceAction(1, 'الديسكورد', 'https://discord.gg/Qyxntq6Aeb');
function SetTitleDiscord({ type, title }) {
    const extra = type === 'faction' ? `\n [${exports.NewStart_Factions.info().code} الكود الوظيفي]` : '';
    SetRichPresence(type ? `[${title}]` + extra : '[عاطل عن العمل]');
}
function getMinimapPosition() {
    const safezone = GetSafeZoneSize();
    const safezone_x = 1.0 / 20.0;
    const safezone_y = 1.0 / 20.0;
    const aspect_ratio = GetAspectRatio(false);
    const [res_x, res_y] = GetActiveScreenResolution();
    const xscale = 1.0 / res_x;
    const yscale = 1.0 / res_y;
    const scaleData = {};
    const pixelData = {};
    scaleData.width = xscale * (res_x / (4 * aspect_ratio));
    scaleData.height = yscale * (res_y / 5.674);
    scaleData.left_x = xscale * (res_x * (safezone_x * ((Math.abs(safezone - 1.0)) * 10)));
    scaleData.bottom_y = 1.0 - yscale * (res_y * (safezone_y * ((Math.abs(safezone - 1.0)) * 10)));
    scaleData.right_x = scaleData.left_x + scaleData.width;
    scaleData.top_y = scaleData.bottom_y - scaleData.height;
    scaleData.x = scaleData.left_x;
    scaleData.y = scaleData.top_y;
    scaleData.xunit = xscale;
    scaleData.yunit = yscale;
    pixelData.width = res_x * scaleData.width;
    pixelData.height = res_y * scaleData.height;
    pixelData.left_x = res_x * scaleData.left_x;
    pixelData.bottom_y = res_y * scaleData.bottom_y;
    pixelData.right_x = res_x * scaleData.right_x;
    pixelData.top_y = res_y * scaleData.top_y;
    pixelData.x = res_x * scaleData.x;
    pixelData.y = res_y * scaleData.y;
    pixelData.xunit = res_x * scaleData.xunit;
    pixelData.yunit = res_y * scaleData.yunit;
    return { scale: scaleData, pixel: pixelData };
}
const shooting = { isArmour: false, isPerson: false, camView: 0, isReload: false, stunned: false };
SetWeaponsNoAutoswap(true);
SetPlayerCanDoDriveBy(PlayerId(), false);
SetWeaponDamageModifier(GetHashKey('WEAPON_UNARMED'), 0.1);
SetWeaponDamageModifier(GetHashKey('WEAPON_BAT'), 0.2);
SetWeaponDamageModifier(GetHashKey('WEAPON_FLASHLIGHT'), 0.2);
SetWeaponDamageModifier(GetHashKey('WEAPON_PUMPSHOTGUN'), 0.75);
StatSetInt(`MP0_SHOOTING_ABILITY`, 140, true);
setTick(() => {
    state.pedID = PlayerPedId();
    state.clientID = PlayerId();
    if (!shooting.isReload && IsPedReloading(state.pedID)) {
        exports.NewStart_Employee.method('saveCurrentAmmo');
        exports.NewStart_Inventory.method('weaponsLoad', true);
        shooting.isReload = true;
    }
    else if (shooting.isReload && !IsPedReloading(state.pedID)) {
        shooting.isReload = false;
    }
    const armour = GetPedArmour(state.pedID);
    if (shooting.isArmour && armour > 2 && !exports.NewStart_Employee.data().isActive) {
        SetPedComponentVariation(state.pedID, 9, 12, 0, 0);
        exports.NewStart_Clothes.method('setClothes', JSON.stringify({ ...exports.NewStart_Clothes.playerPed(), armor: 12 }));
        shooting.isArmour = false;
    }
    else if (!shooting.isArmour && armour < 2) {
        SetPedComponentVariation(state.pedID, 9, 0, 0, 0);
        exports.NewStart_Clothes.method('setClothes', JSON.stringify({ ...exports.NewStart_Clothes.playerPed(), armor: 0 }));
        shooting.isArmour = true;
    }
    const isAiming = IsAimCamActive();
    if (!shooting.isPerson && IsPlayerFreeAiming(state.clientID)) {
        if (!timeWeaponID && !IsPedArmed(state.pedID, 1) &&
            ![1233104067].includes(GetSelectedPedWeapon(state.pedID))) {
            shooting.camView = GetFollowPedCamViewMode();
            if (crouch.isActive)
                crouchReset();
            else if (crouch.isCrawling)
                crawlReset();
            SetFollowPedCamViewMode(4);
            StopAnimTask(state.pedID, 'random@mugging3', 'handsup_standing_base', 8);
            StopAnimTask(state.pedID, 'rcmnigel1c', 'hailing_whistle_waive_a', 8);
            shooting.isPerson = true;
        }
    }
    else if (shooting.isPerson && !IsPlayerFreeAiming(state.clientID)) {
        SetFollowPedCamViewMode(shooting.camView);
        shooting.isPerson = false;
    }
    if ((isAiming || shooting.camView === 4) && !state.isVeh) {
        HideHudComponentThisFrame(14);
    }
    if (shooting.isPerson) {
        DisableControlAction(0, 0, true);
        DisableControlAction(0, 73, true);
        DisableControlAction(0, 289, true);
    }
    else if (!shooting.isPerson && IsPedArmed(state.pedID, 4)) {
        DisablePlayerFiring(state.clientID, true);
    }
});
setTick(() => {
    const targetID = GetMeleeTargetForPed(state.pedID) || GetPlayerTargetEntity(state.clientID)[1];
    if ((targetID && IsEntityPlayingAnim(targetID, 'random@dealgonewrong', 'idle_a', 1)) || weapon.swapping) {
        DisableControlAction(0, 24, true);
        DisableControlAction(0, 140, true);
        DisablePlayerFiring(state.clientID, true);
    }
    if (!shooting.stunned && IsPedBeingStunned(state.pedID, 0)) {
        SetPedMinGroundTimeForStungun(state.pedID, 15000);
        SetNuiFocus(true, false);
        shooting.stunned = true;
    }
    else if (shooting.stunned && !IsPedBeingStunned(state.pedID, 0)) {
        shooting.stunned = false;
        SetNuiFocus(false, false);
    }
    SetWeaponDamageModifier(-1553120962, 0.0);
    SetWeaponDamageModifier(133987706, 0.0);
});
let time = {
    current: 0, main: 0, max: 0, lastExecuted: 0, result: '', weatherType: 'sun',
    seaPortClosed: false, subSeaPortClosed: false, lastSubSeaPortClosed: false
};
function startTime() {
    time.lastExecuted = Date.now();
    setInterval(() => {
        time.current += 62.5;
        if (time.current >= time.max)
            time.current = 0;
        const hourMilliseconds = getHourMilliSeconds();
        let hours = time.current / hourMilliseconds;
        const minutes = Math.floor((hours - Math.floor(hours)) * 60);
        hours = Math.floor(hours);
        NetworkOverrideClockTime(hours, minutes, 0);
        if (time.current >= (hourMilliseconds * 7) && time.current <= (hourMilliseconds * 19)) {
            time.seaPortClosed = false;
        }
        else if (!time.seaPortClosed) {
            exports.NewStart_Taboos.other('resetCurrentSale');
            time.seaPortClosed = true;
        }
        if (time.current === (hourMilliseconds * 7)) {
            let text = `نحيطكم علماً أنه تم فتح الميناء البحري وأن جميع الخدمات متاحة الآن `;
            if (time.subSeaPortClosed)
                text += 'بالتوسعة الرئيسية فقط';
            else
                text += 'بالتوسعة الرئيسية والفرعية';
            emit('NewStart_Phone:receiveMessage-client', JSON.stringify({ number: '-3', text: text + '.' }));
            emit('NewStart_MainMenu:addToAds-client', { type: 'public', from: 'هيئة الموانئ', text });
        }
        else if (time.current === (hourMilliseconds * 19)) {
            emit('NewStart_Phone:receiveMessage-client', JSON.stringify({
                number: '-3', text: 'نحيطكم علماً أنه تم غلق الميناء البحري وإعادة الفتح فى الساعة 7 صباحًا'
            }));
            emit('NewStart_MainMenu:addToAds-client', { type: 'public', from: 'هيئة الموانئ', text: 'نحيطكم علماً أنه تم غلق الميناء البحري وإعادة الفتح فى الساعة 7 صباحًا' });
        }
        let currentTime = Date.now();
        if (currentTime - time.lastExecuted >= 1000) {
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12;
            hours = hours ? hours : 12;
            time.result = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}${ampm}`;
            exports.NewStart_HudSystem.method('setStateNUI', { gameTime: time.result });
            time.lastExecuted = currentTime;
            if (GetRainLevel()) {
                time.weatherType = 'rain';
            }
            else if (time.current >= (hourMilliseconds * 5.10) && time.current <= (hourMilliseconds * 21)) {
                time.weatherType = 'sun';
            }
            else {
                time.weatherType = 'night';
            }
        }
    }, 62.5);
}
function getHourMilliSeconds() {
    return (time.main * 60 * 60 * 1000) / 24;
}
const water = { cupID: 0, runClose: false, hashs: ['prop_watercooler', 'prop_watercooler_dark', 'watercooler_bottle001'] };
setTick(() => {
    let currentID = null;
    for (let hash of water.hashs) {
        const findID = GetClosestObjectOfType(state.coords[0], state.coords[1], state.coords[2], 0.7, hash, true, true, true);
        if (findID) {
            currentID = findID;
            break;
        }
    }
    if (currentID &&
        !IsPauseMenuActive() &&
        !IsEntityDead(state.pedID)) {
        if (IsControlJustPressed(0, 38) && !water.cupID) {
            water.cupID = CreateObject(1151364435, state.coords[0], state.coords[1], state.coords[2] + 0.2, true, true, true);
            AttachEntityToEntity(water.cupID, state.pedID, GetPedBoneIndex(state.pedID, 18905), 0.12, 0.008, 0.03, 240.0, -60.0, 0.0, true, true, false, true, 1, true);
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen', value: false }));
            setTimeout(() => {
                DeleteObject(water.cupID);
                ClearPedTasks(state.pedID);
                water.cupID = 0;
                if (water.runClose)
                    SendNUIMessage(JSON.stringify({ type: 'entranceOpen', value: true }));
            }, 2000);
            exports.NewStart_HudSystem.update({ water: 20 }, true);
        }
        else if (!water.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen', value: true }));
        }
        water.runClose = true;
    }
    else if (water.runClose) {
        SendNUIMessage(JSON.stringify({ type: 'entranceOpen', value: false }));
        water.runClose = false;
    }
});
const weapon = { swapping: false, timeID: 0, lastHash: 0, isBuild: false, climbing: 0 };
let timeWeaponID = 0;
RequestAnimDict('reaction@intimidation@cop@unarmed');
RequestAnimDict('reaction@intimidation@1h');
RequestAnimDict('combat@combat_reactions@pistol_1h_gang');
setTick(() => {
    if (IsPedClimbing(state.pedID) || IsPedJumping(state.pedID)) {
        weapon.climbing = Date.now();
    }
    if (!weapon.swapping && IsPedSwappingWeapon(state.pedID)) {
        const currentWeapon = GetCurrentPedWeapon(state.pedID, false)[1];
        if (state.isZone && currentWeapon !== 883325847 &&
            !((state.keys.includes(exports.NewStart_Factions.info()?.key) && exports.NewStart_Employee.data().isActive) &&
                (exports.NewStart_Admin.method('info').isComfort ? currentWeapon === 911657153 : true))) {
            return SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
        }
        else if (weapon.climbing) {
            if ((Date.now() - weapon.climbing) > 900)
                weapon.climbing = 0;
            return;
        }
        const coords = GetEntityCoords(state.pedID, true);
        const heading = GetEntityHeading(state.pedID);
        let hash = GetSelectedPedWeapon(state.pedID), fromLast = false;
        if (hash === GetHashKey('WEAPON_UNARMED')) {
            hash = weapon.lastHash;
            fromLast = true;
        }
        const isPistol = GetWeapontypeGroup(hash) === 416676503 || hash === 911657153;
        const isKnife = hash === -1716189206 || hash === -1834847097;
        if (isKnife && fromLast)
            return;
        weapon.swapping = true;
        clearTimeout(timeWeaponID);
        if (isPistol) {
            if (fromLast) {
                SetCurrentPedWeapon(state.pedID, hash, true);
                TaskPlayAnimAdvanced(state.pedID, "reaction@intimidation@1h", "outro", coords[0], coords[1], coords[2], 0, 0, heading, 8.0, 3.0, -1, 50, 0.125, 0, 0);
            }
            else {
                TaskPlayAnimAdvanced(state.pedID, 'reaction@intimidation@1h', 'intro', coords[0], coords[1], coords[2], 0, 0, heading, 8.0, 3.0, -1, 50, 0.325, 0, 0);
            }
        }
        else if (isKnife) {
            SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
            TaskPlayAnimAdvanced(state.pedID, 'combat@combat_reactions@pistol_1h_gang', '0', coords[0], coords[1], coords[2], 0, 0, heading, 8.0, 3.0, -1, 50, 0.125, 0, 0);
        }
        else {
            TaskPlayAnim(state.pedID, 'reaction@intimidation@cop@unarmed', 'intro', 8.0, 2.0, -1, 50, 2.0, false, false, false);
        }
        timeWeaponID = setTimeout(() => {
            if (isKnife)
                SetCurrentPedWeapon(state.pedID, hash, true);
            else if (isPistol && fromLast)
                SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
            ClearPedTasks(state.pedID);
            weapon.lastHash = hash;
            weapon.swapping = false;
            timeWeaponID = 0;
        }, isKnife || isPistol ? 1000 : exports.NewStart_Employee.data().isActive ? 500 : GetCurrentPedWeapon(state.pedID, false)[1] === hash ? 2000 : 1000);
    }
});
const zone = {
    type: '',
    isComfort: false,
    seaPortClosed: { blipID: 0, blipSubID: 0, lastwarning: 0, coords: { x: -3488.4658, y: 2744.9143, z: 9.2116 } },
    greens: [
        { distance: 50, coords: { x: -462.4615, y: 6006.13183, z: 30.3355 }, inside: false },
        { distance: 20, coords: { x: -144.5274, y: 6293.0639, z: 30.4871 } },
        { distance: 30, coords: { x: -256.0747, y: 6323.5253, z: 31.41394 } },
        { distance: 60, coords: { x: 150.0791, y: 6606.0527, z: 30.9758 } },
        { distance: 50, coords: { x: 84.4857, y: 6367.1735, z: 31.2674 } },
        { distance: 50, coords: { x: 1848.3988, y: 3673.6511, z: 33.2674 } },
        { distance: 200, coords: { x: 1724.1625, y: 2606.2021, z: 44.5567 } },
        { distance: 110, coords: { x: 2722.5231, y: 3480.8439, z: 56.4586 } },
        { distance: 23, coords: { x: -3008.5231, y: 2695.8439, z: 9.4586 } },
        { distance: 65, coords: { x: 153.5231, y: 6408.8439, z: 31.4586 } },
    ]
};
function createZone(ref, save, color, alpha, distance) {
    zone[ref][save] = AddBlipForRadius(zone[ref].coords.x, zone[ref].coords.y, zone[ref].coords.z, distance);
    if (save === 'blipSubID')
        SetRadiusBlipEdge(zone[ref][save], true);
    SetBlipHighDetail(zone[ref][save], true);
    SetBlipColour(zone[ref][save], color);
    SetBlipAlpha(zone[ref][save], alpha);
}
setTick(() => {
    state.coords = GetEntityCoords(state.pedID, true);
    if (exports.NewStart_Admin.method('info').isComfort) {
        if (!zone.isComfort) {
            zone.type = 'green';
            exports.NewStart_HudSystem.method('setStateNUI', { zoneType: 'green' });
            exports.NewStart_Tools.method('setZone', true, false, true);
            zone.isComfort = true;
            SetEntityHealth(state.pedID, 200);
        }
        SetEntityInvincible(state.pedID, true);
        SetPlayerInvincible(state.clientID, true);
    }
    else {
        if (zone.isComfort) {
            zone.isComfort = false;
            SetEntityInvincible(state.pedID, false);
            SetPlayerInvincible(state.clientID, false);
            if (!zone.greens.some(i => i.inside)) {
                zone.type = '';
                exports.NewStart_HudSystem.method('setStateNUI', { zoneType: '' });
                exports.NewStart_Tools.method('setZone', false, false, true);
            }
        }
        for (let item of zone.greens) {
            const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], item.coords.x, item.coords.y, item.coords.z, true);
            if (distance < item.distance) {
                if (!item.inside) {
                    zone.type = 'green';
                    item.inside = true;
                    exports.NewStart_HudSystem.method('setStateNUI', { zoneType: 'green' });
                    exports.NewStart_Tools.method('setZone', true, false, true);
                }
                SetEntityInvincible(state.pedID, true);
                SetPlayerInvincible(state.clientID, true);
                break;
            }
            else if (item.inside) {
                zone.type = '';
                item.inside = false;
                exports.NewStart_HudSystem.method('setStateNUI', { zoneType: '' });
                exports.NewStart_Tools.method('setZone', false, false, true);
                SetEntityInvincible(state.pedID, false);
                SetPlayerInvincible(state.clientID, false);
                break;
            }
        }
    }
    if (!zone.seaPortClosed.blipID && time.seaPortClosed) {
        createZone('seaPortClosed', 'blipID', 72, 50, 560);
        createZone('seaPortClosed', 'blipSubID', 72, 255, 565);
    }
    else if (zone.seaPortClosed.blipID && !time.seaPortClosed) {
        RemoveBlip(zone.seaPortClosed.blipID);
        RemoveBlip(zone.seaPortClosed.blipSubID);
        zone.seaPortClosed.blipID = 0;
        zone.seaPortClosed.lastwarning = 0;
    }
    if (time.seaPortClosed) {
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], zone.seaPortClosed.coords.x, zone.seaPortClosed.coords.y, zone.seaPortClosed.coords.z, false);
        const time = Date.now();
        if (distance < 558) {
            if (!zone.seaPortClosed.lastwarning) {
                zone.seaPortClosed.lastwarning = time;
                if (![...state.keys, 'health'].includes(exports.NewStart_Factions.info()?.key) || exports.NewStart_Factions.info()?.isVacation) {
                    exports.NewStart_Notifications.showAttention('error', 'هذه المنطقة مغلقة حاليا والتواجد بها يعرضك لخصم الخبرة!');
                }
            }
            else if (((time - zone.seaPortClosed.lastwarning) > 300000)) {
                zone.seaPortClosed.lastwarning = time;
                if ((![...state.keys, 'health'].includes(exports.NewStart_Factions.info()?.key) || exports.NewStart_Factions.info()?.isVacation) &&
                    exports.NewStart_MainMenu.getLevel() > 1) {
                    emit('NewStart_MainMenu:handleGeneral-client', 'expLose', 50);
                    exports.NewStart_Notifications.showAttention('error', 'لقد تم خصم 50 خبرة منك للتواجد في منطقة مغلقة!');
                }
            }
        }
        else if (zone.seaPortClosed.lastwarning) {
            zone.seaPortClosed.lastwarning = time;
        }
    }
});
