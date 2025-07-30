"use strict";
const Delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const state = {
    cameraID: 0,
    isOpen: false,
    pedID: 0,
    edit: {
        isIn: false,
        isOpen: false,
        runClose: false,
        price: 25000,
        isFirst: true,
        coords: { x: 1824.5474, y: 3686.9306, z: 33.2749, h: 397.6902 },
        spwan: [],
        cameraID: 0,
        old: null
    }
};
const items = [
    { x: -261.9242, y: 6326.3320, z: 31.4272, h: 223.6007 },
    { x: 1835.7271, y: 3690.5073, z: 33.2749, h: 112.5839 }
];
(async function createEmployee() {
    const pedModel = GetHashKey('s_m_m_doctor_01');
    RequestModel(pedModel);
    while (!HasModelLoaded(pedModel))
        await Delay(1000);
    for (const item of items) {
        const pedID = CreatePed(1, pedModel, item.x, item.y, item.z, item.h, false, false);
        const blip = AddBlipForCoord(item.x, item.y, item.z);
        FreezeEntityPosition(pedID, true);
        SetBlockingOfNonTemporaryEvents(pedID, true);
        SetEntityInvincible(pedID, true);
        TaskStartScenarioInPlace(pedID, 'WORLD_HUMAN_CLIPBOARD', 0, true);
        SetBlipSprite(blip, 839);
        SetBlipAsShortRange(blip, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">ﻞﻴﻤﺠﺘﻟﺍ ﺕﺎﻴﻠﻤﻋ</font>`);
        EndTextCommandSetBlipName(blip);
    }
})();
setTick(() => {
    state.pedID = PlayerPedId();
    if (state.isOpen) {
        SetEntityHeading(state.pedID, 215.43309020996094);
    }
    else if (state.edit.isIn && state.edit.cameraID && IsEntityPositionFrozen(state.pedID)) {
        ClearPedTasksImmediately(state.pedID);
    }
    else {
        const coords = GetEntityCoords(state.pedID, true);
        let isCurrent = false;
        for (const item of items) {
            const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], item.x, item.y, item.z, true);
            if (distance < 2.25) {
                isCurrent = true;
                state.edit.spwan = [...coords, GetEntityHeading(state.pedID)];
                break;
            }
        }
        if (isCurrent &&
            !IsPauseMenuActive() &&
            !IsPedInAnyVehicle(state.pedID, false) &&
            !IsEntityDead(state.pedID)) {
            if (IsControlJustPressed(0, 38)) {
                SendNUIMessage(JSON.stringify({
                    type: 'openBot',
                    info: {
                        playerName: exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).name.split(' ')[0],
                        priceBot: state.edit.isFirst ? 0 : state.edit.price
                    }
                }));
                SetNuiFocus(true, true);
                state.edit.isOpen = true;
            }
            else if (!state.edit.isOpen && !state.edit.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
            }
            state.edit.runClose = true;
        }
        else if (state.edit.runClose) {
            state.edit.isOpen = false;
            state.edit.runClose = false;
            if (!state.edit.isIn) {
                SetNuiFocus(false, false);
                SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            }
        }
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', async (data, cb) => {
    switch (data.type) {
        case 'startEdit':
            let isClearHead = true;
            for (let item of exports.NewStart_Clothes.items()) {
                if (['mask', 'glass', 'hat', 'ear'].includes(item.name)) {
                    let value;
                    if (item.type === 'main')
                        value = GetPedDrawableVariation(state.pedID, item.id);
                    else
                        value = GetPedPropIndex(state.pedID, item.id);
                    if (value > 0) {
                        isClearHead = false;
                        break;
                    }
                }
            }
            if (!isClearHead) {
                exports.NewStart_Notifications.showAttention('error', 'يجب إزالة أي شئ على وجهك قبل البدء في العملية!');
                closeUI();
                return cb('OK!');
            }
            else if (!state.edit.isFirst) {
                const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
                const info = { name: 'البقالة', price: state.edit.price, from: 'cash' };
                if (cash >= info.price) {
                    StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                    exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في الحقيبة!');
                    closeUI();
                    return cb('OK!');
                }
                emitNet('NewStart:moneyDecrease', info);
            }
            state.edit.isIn = true;
            DoScreenFadeOut(1000);
            exports.NewStart_HudSystem.closeUI();
            exports.NewStart_Phone.noticesToggle(true);
            exports.NewStart_MainMenu.toggleAds(false);
            DisplayRadar(false);
            await Delay(1000);
            state.edit.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", state.edit.coords.x + 0.25, state.edit.coords.y - 0.35, state.edit.coords.z + 1.65, 0.00, 0.00, 30, 65.00, false, 0);
            SetCamActive(state.edit.cameraID, true);
            RenderScriptCams(true, false, 0, true, true);
            FreezeEntityPosition(state.pedID, true);
            SetEntityCoords(state.pedID, state.edit.coords.x, state.edit.coords.y, state.edit.coords.z, true, false, false, false);
            SetEntityHeading(state.pedID, state.edit.coords.h);
            emitNet('NewStart:general-server', 'setBucket');
            SendNUIMessage(JSON.stringify({ type: 'openEdit', old: state.edit.old }));
            SetNuiFocus(true, true);
            DoScreenFadeIn(1000);
            break;
        case 'setData':
            DoScreenFadeOut(500);
            await Delay(1000);
            DestroyCam(state.edit.cameraID, true);
            RenderScriptCams(false, false, 1000, false, false);
            exports.NewStart_Phone.noticesToggle(false);
            if (!exports.NewStart_MainMenu.isOpen()) {
                DisplayRadar(true);
                exports.NewStart_HudSystem.openHud();
                exports.NewStart_MainMenu.toggleAds(true);
            }
            SetEntityCoords(state.pedID, state.edit.spwan[0], state.edit.spwan[1], state.edit.spwan[2] - 1, true, false, false, false);
            SetEntityHeading(state.pedID, state.edit.spwan[3]);
            FreezeEntityPosition(state.pedID, false);
            emitNet('NewStart:general-server', 'setBucket', 0);
            SetNuiFocus(false, false);
            state.edit.isIn = false;
            state.edit.isFirst = false;
            DoScreenFadeIn(1000);
            const character = { [`character.parents`]: data.info.parents, [`character.isEdit`]: true };
            if (data.info.face)
                character[`character.face`] = data.info.face;
            if (data.info.age)
                character[`character.age`] = data.info.age;
            state.edit.old = data;
            emitNet('NewStart:updateUser', character);
            break;
        default:
            state.edit.isOpen = false;
            state.edit.runClose = false;
            SetNuiFocus(false, false);
            break;
    }
    cb('OK!');
});
function closeUI() {
    state.edit.isOpen = false;
    state.edit.runClose = false;
    SetNuiFocus(false, false);
    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
}
const money = 5000, bank = 20000;
onNet('NewStart_CharacterCreator:firstAddInventory-client', (data) => {
    data = JSON.parse(data);
    const action = [
        { id: 1, count: money }
    ];
    if (typeof data.phone === 'object')
        action.push(data.phone);
    for (let index in action) {
        if (index === 0) {
            exports.NewStart_Inventory.addItem(JSON.stringify(action[index]));
        }
        else {
            setTimeout(() => exports.NewStart_Inventory.addItem(JSON.stringify(action[index])), index * 100);
        }
    }
    emit('NewStart_HudSystem:handleGeneral-client', 'setMoney');
});
on('initialCharacter', (isMale = true) => {
    SetPedHeadBlendData(state.pedID, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0, true);
    exports.NewStart_Clothes.pedReset();
    SetPedComponentVariation(state.pedID, 2, isMale ? 1 : 2, 0, 0);
    SetPedHeadOverlay(state.pedID, 2, 0, 1);
    SetPedHeadOverlayColor(state.pedID, 2, 1, 0, 0);
    SetPedHairColor(state.pedID, 3, 0);
    SetEntityHeading(state.pedID, 215.43309020996094);
});
const createCam = (type) => {
    let values;
    if (state.cameraID) {
        DestroyCam(state.cameraID, true);
        RenderScriptCams(false, false, 0, false, false);
    }
    if (type === 'body') {
        values = { x: 241.08, y: -1373.88, z: 40 };
        SetEntityHeading(state.pedID, 215.43309020996094);
    }
    else {
        values = { x: 240.9, y: -1373.50, z: 40.13 };
        SetEntityHeading(state.pedID, 228.5);
    }
    state.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", values.x, values.y, values.z, 0.00, 0.00, 37.50, 65.00, false, 0);
    SetCamActive(state.cameraID, true);
    RenderScriptCams(true, false, 0, true, true);
};
exports('openUI', () => {
    state.isOpen = true;
    DisplayRadar(false);
    createCam('body');
    ShutdownLoadingScreenNui();
    exports.NewStart_Initialize.loadingScreen();
    SendNUIMessage(JSON.stringify({ type: 'open' }));
    SetNuiFocus(true, true);
    SetEntityHeading(state.pedID, 215.43309020996094);
});
RegisterNuiCallbackType('NUI:changes');
RegisterNuiCallbackType('NUI:changeCam');
RegisterNuiCallbackType('NUI:closeUI');
on('__cfx_nui:NUI:changeCam', (data, cb) => {
    createCam(data.type);
    cb('DONE!');
});
on('__cfx_nui:NUI:closeUI', async (data, cb) => {
    DestroyCam(state.cameraID, true);
    const spawn = { x: 109.3582, y: 6605.5385, z: 30.8579, heading: 266.4566 };
    exports.spawnmanager.spawnPlayer(spawn, () => {
        exports.NewStart_TheStart.method('showMessage', data.identifier.name);
    });
    await Delay(600);
    SetNuiFocus(false, false);
    RenderScriptCams(false, false, 0, false, false);
    exports.NewStart_HudSystem.openHud('create');
    exports.NewStart_HudSystem.openHud();
    exports.NewStart_MainMenu.toggleAds(true);
    DisplayRadar(true);
    data.identifier.name = data.identifier.name.trim();
    emitNet('NewStart_CharacterCreator:dataSave-server', JSON.stringify({ character: data, spawn }));
    emit('NewStart_MainMenu:initial-client', { info: { name: data.identifier.name } });
    StatSetInt("MP0_WALLET_BALANCE", money, false);
    StatSetInt("BANK_BALANCE", bank, false);
    state.isOpen = false;
    cb('DONE!');
});
on('__cfx_nui:NUI:changes', (data, cb) => {
    switch (data.key) {
        case 'father':
        case 'mother':
        case 'shapeMix':
        case 'skinMix':
            SetPedHeadBlendData(state.pedID, data.mother.id, data.father.id, 0, data.mother.id, data.father.id, 0, data.shapeMix, data.skinMix, 0, true);
            break;
        case 'gender':
            const model = data.value === 'male' ? 'mp_m_freemode_01' : 'mp_f_freemode_01';
            exports.spawnmanager.spawnPlayer({
                x: '240.55384826660156',
                y: '-1373.221923828125',
                z: '39.5245361328125',
                model
            }, () => emit('initialCharacter', data.value === 'male'));
            break;
        case 'age':
            SetPedHeadOverlay(state.pedID, data.ref, data.id, data.opacity);
            break;
        default:
            SetPedFaceFeature(state.pedID, data.ref, data.value);
    }
    cb('DONE!');
});
exports('isOpen', () => state.isOpen);
exports('initialCharacter', () => emit('initialCharacter'));
exports('method', (type, data) => {
    if (type === 'setOld') {
        state.edit.isFirst = !data.isEdit;
        delete data.isEdit;
        state.edit.old = data;
    }
});
