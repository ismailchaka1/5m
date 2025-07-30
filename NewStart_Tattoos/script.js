"use strict";
const state = {
    pedID: 0,
    coords: [
        { x: 1865.9587, y: 3746.5048, z: 33.0293, h: 50.8095, hBack: 230, cam: { posX: 1864.5587, posY: 3747.7048, posZ: 33.5593, rotX: -15, rotZ: 230 } },
        { x: -3170.1662, y: 1078.9156, z: 20.8306, h: 184.1012, hBack: 0, cam: { posX: -3170.1662, posY: 1076.9956, posZ: 21.3306, rotX: -15, rotZ: 0 } },
        { x: 325.7663, y: 180.9934, z: 103.5880, h: 107.9031, hBack: -70, cam: { posX: 323.9663, posY: 180.2934, posZ: 104.0980, rotX: -15, rotZ: -70 } },
        { x: -1155.5465, y: -1428.7421, z: 4.9559, h: 330.3583, hBack: 150, cam: { posX: -1154.6465, posY: -1427.1421, posZ: 5.4559, rotX: -15, rotZ: 150 } },
        { x: 1321.5603, y: -1655.2967, z: 52.2770, h: 340.4573, hBack: -200, cam: { posX: 1322.2603, posY: -1653.4967, posZ: 52.8770, rotX: -15, rotZ: 158 } },
    ],
    current: null,
    isOpen: false,
    runClose: false,
    cameraID: 0,
    save: [],
    timeoutID: 0
};
const empty = null;
(async function () {
    for (const item of state.coords) {
        const blipID = AddBlipForCoord(item.x, item.y, item.z);
        SetBlipSprite(blipID, 75);
        SetBlipAsShortRange(blipID, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">ﻡﻮﺷﻮﻟﺍ</font>`);
        EndTextCommandSetBlipName(blipID);
    }
})();
setTick(() => {
    state.pedID = PlayerPedId();
    const coords = GetEntityCoords(state.pedID, true);
    for (let item of state.coords) {
        const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, coords[0], coords[1], coords[2], true);
        if (distance < 25) {
            if (!state.isOpen)
                DrawMarker(1, item.x, item.y, item.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.5, 0.5, 0.2, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
            if (distance < 0.7) {
                state.current = item;
                break;
            }
            else
                state.current = null;
        }
        else {
            state.current = null;
        }
    }
    if (state.current && !IsPauseMenuActive() && !IsEntityDead(state.pedID)) {
        if (IsControlJustPressed(0, 38)) {
            if (exports.NewStart_Mechanical.method('info', 'isIn') || exports.NewStart_Employee.method('inJob')) {
                return exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس العمل تخلص منها أولاً!');
            }
            else if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
                return exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس خاصة بمهمة تخلص منها أولاً.');
            }
            exports.NewStart_Initialize.method('blankScreen', true);
            SetEntityCoords(state.pedID, state.current.x, state.current.y, state.current.z - 1, true, false, false, false);
            SetEntityHeading(state.pedID, state.current.h);
            createCamera();
            const isMale = GetEntityModel(state.pedID) === GetHashKey('mp_m_freemode_01');
            if (isMale) {
                SetPedComponentVariation(state.pedID, 8, 15, 0, 0);
                SetPedComponentVariation(state.pedID, 3, 15, 0, 0);
                SetPedComponentVariation(state.pedID, 11, 91, 0, 0);
                SetPedComponentVariation(state.pedID, 4, 21, 0, 0);
            }
            else {
                SetPedComponentVariation(state.pedID, 8, 15, 0, 0);
                SetPedComponentVariation(state.pedID, 3, 15, 0, 0);
                SetPedComponentVariation(state.pedID, 11, 15, 0, 0);
                SetPedComponentVariation(state.pedID, 4, 15, 0, 0);
            }
            SendNUIMessage(JSON.stringify({
                type: 'openUI',
                info: {
                    level: exports.NewStart_MainMenu.getLevel(),
                    gender: isMale ? 'male' : 'female'
                },
                categories: state.save
            }));
            SetNuiFocus(true, true);
            state.isOpen = true;
        }
        else if (!state.isOpen && !state.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
        }
        state.runClose = true;
    }
    else if (state.runClose) {
        closeUI(true);
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    switch (data.type) {
        case 'change':
            drawTattoos(data.info);
            break;
        case 'camera':
            if (state.current) {
                const heading = data.action === 'front' ? state.current.h : state.current.hBack;
                TaskAchieveHeading(state.pedID, heading, 0);
                clearTimeout(state.timeoutID);
                if (data.action === 'front') {
                    state.timeoutID = setTimeout(() => {
                        if (state.current) {
                            SetEntityCoords(state.pedID, state.current.x, state.current.y, state.current.z - 1, true, false, false, false);
                            SetEntityHeading(state.pedID, heading);
                        }
                    }, 2000);
                }
            }
            break;
        case 'save':
            const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
            const info = { name: 'الوشوم', from: 'cash', price: data.price };
            if (cash >= info.price) {
                StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في الحقيبة للدفع!');
                closeUI(false);
                return cb('OK!');
            }
            emitNet('NewStart:moneyDecrease', info);
            emitNet('NewStart_MainMenu:handleGeneral-server', 'setFavorite', { tattoos: data.info });
            exports.NewStart_Notifications.showAttention('success', 'لقد قمت بالدفع مقابل وضع الوشوم بنجاح!');
            state.save = data.info;
        default:
            closeUI(false);
    }
    cb('OK!');
});
function createCamera() {
    if (state.current) {
        state.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", state.current.cam.posX, state.current.cam.posY, state.current.cam.posZ, state.current.cam.rotX, 0, state.current.cam.rotZ, 60, false, 0);
        SetCamActive(state.cameraID, true);
        RenderScriptCams(true, true, 1000, true, true);
    }
}
function drawTattoos(data) {
    ClearPedDecorations(state.pedID);
    for (let item of (data || state.save))
        AddPedDecorationFromHashes(state.pedID, GetHashKey(item.collection), GetHashKey(item.overlay));
}
function closeUI(withNUI) {
    if (state.isOpen) {
        clearTimeout(state.timeoutID);
        ClearPedTasks(state.pedID);
        exports.NewStart_Clothes.pedReset();
        DestroyCam(state.cameraID, true);
        RenderScriptCams(false, false, 0, false, false);
        exports.NewStart_Initialize.method('blankScreen', false);
        SetNuiFocus(false, false);
        drawTattoos();
    }
    if (withNUI)
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    state.isOpen = false;
    state.runClose = false;
}
exports('method', (type, data) => {
    if (type === 'setSave') {
        state.save = data;
        if (state.save.length)
            drawTattoos();
    }
});
