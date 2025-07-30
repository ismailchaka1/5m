"use strict";
on('onClientGameTypeStart', () => {
    for (let item of blips) {
        const blip = AddBlipForCoord(item.x, item.y, item.z);
        SetBlipSprite(blip, item.id);
        SetBlipAsShortRange(blip, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">${item.name}</font>`);
        EndTextCommandSetBlipName(blip);
    }
});
setTick(() => {
    state.pedID = PlayerPedId();
    state.pedCoord = GetEntityCoords(state.pedID, true);
    const { x, y, z, h } = state.office.coord;
    const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], x, y, z, true);
    if (distance < 15) {
        DrawMarker(1, x, y, z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.5, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
    }
    if (distance < 0.6 &&
        !IsEntityDead(state.pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            ClearPedTasks(state.pedID);
            ghostPlayers(true);
            emitNet('NewStart_RealEstate:handleOffice-server', 'initial');
            SetNuiFocus(true, true);
            state.isOpen = true;
            DisplayRadar(false);
            exports.NewStart_HudSystem.closeUI();
            exports.NewStart_MainMenu.toggleAds(false);
            startConversation(state.pedID, { x, y, z, h });
            SendNUIMessage(JSON.stringify({ type: 'openUI', isHome: true }));
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
        case 'preview':
            const item = state.office.items.find(obj => obj.code === state.interior.currentEnter?.code);
            handleInSide(state.interior.currentEnter.type, item);
            break;
        case 'payment':
            let type = state.office.items.find(obj => obj.code === data.code)?.type;
            const level = exports.NewStart_MainMenu.method('validLevel', 'house');
            if (!level.isCan) {
                exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${level.need} أولاً لشراء العقارات!`);
                return cb('failed');
            }
            else if (state.properties.length >= 2) {
                exports.NewStart_Notifications.showAttention('error', 'لا يمكنك امتلاك أكثر من عقارين في جميع المدن!');
                return cb('failed');
            }
            if (type !== 'garage')
                type = 'normal';
            emitNet('NewStart_RealEstate:handleOffice-server', 'payment', JSON.stringify({ type, code: data.code }));
            break;
        case 'garage':
            const find = state.office.items.find(obj => obj.code === state.interior.insideCode);
            if (data.action === 'goHouse') {
                handleInSide('house', find);
            }
            else {
                const isLock = find.isOwned && find.isLock;
                exitInterior(find?.garageOut, isLock, true);
            }
            SetNuiFocus(false, false);
            state.interior.insideExit.isOpen = false;
            state.interior.insideExit.runClose = false;
            break;
        case 'location':
            for (let blip of state.office.blips)
                RemoveBlip(blip);
            state.office.blips = [];
            if (data.isAll) {
                if (data.value) {
                    exports.NewStart_Notifications.showAttention('success', 'تم إظهار كل العقارات المتاحة للبيع علي الخريطة.');
                    for (let item of state.office.items) {
                        if (item.isOwned)
                            continue;
                        const blip = createBlip(item.type, item.coord);
                        state.office.blips.push(blip);
                    }
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'تم إزلة كل مواقع العقارات من الخريطة!');
                }
            }
            else {
                const find = state.office.items.find(obj => obj.code === data.code);
                if (data.value) {
                    state.office.blips.push(createBlip(find.type, find.coord));
                    exports.NewStart_Notifications.showAttention('success', 'تم تحديد العقار علي الخريطة');
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'تم إزلة التحديد من الخريطة');
                }
            }
            break;
        default: closeUI(false);
    }
    cb('OK!');
});
exports('method', (type, data) => {
    switch (type) {
        case 'getCurrent':
            if (data === 'insideCode') {
                return state.interior.insideCode;
            }
            else {
                const find = state.office.items.find(i => i.code === state.interior.insideCode);
                return {
                    type: find?.type,
                    code: state.interior.insideCode,
                    marker: state.interior.currentEnter || state.interior.insideExit.current,
                    enterCoords: find?.coord,
                    inventory: {
                        canOpen: state.control.current && state.properties.some(p => p.code === find?.code),
                        code: state.interior.insideCode,
                        name: `خزنة ${find?.type === 'garage' ? 'الجراج' : 'المنزل'}`
                    }
                };
            }
        case 'updateInsideCode':
            emitNet('NewStart_RealEstate:handleBucket-server', { type: 'enter', code: data });
            const item = state.office.items.find(i => i.code === data);
            state.interior.insideCode = data;
            if (item?.isOwned) {
                state.control.tickID = controlBuild();
            }
            if (item?.garage || item?.type === 'garage') {
                const find = state.properties[state.properties.findIndex(p => p.code === data)];
                if (find) {
                    emitNet('NewStart_RealEstate:handleInterior-server', 'vehiclesGarage', JSON.stringify({ code: data }));
                    find.vehLoad = true;
                }
            }
            break;
        case 'toggleKey':
            const code = state.interior.currentEnter?.code || state.interior.insideExit.current?.code;
            const find = state.office.items.find(obj => obj.code === code);
            const findKey = exports.NewStart_Inventory.info('currentItems').some((obj) => obj.id === 45 && obj.features.id === code);
            if (!findKey || !find?.isOwned)
                return;
            const refExit = state.interior.insideExit.current;
            let exitType = null, value;
            if (refExit) {
                if (refExit.type === 'garage-exit')
                    exitType = 'garage';
                else if (refExit.type === 'house-exit')
                    exitType = 'house';
            }
            const info = { type: state.interior.currentEnter?.type || exitType, code };
            if (find) {
                if (find.type !== 'garage' && info.type === 'garage') {
                    value = !find.garage.isLock;
                    find.garage.isLock = value;
                }
                else {
                    value = !find.isLock;
                    find.isLock = value;
                }
                if (value)
                    exports.NewStart_Notifications.showAttention('error', `لقد قمت بإغلاق باب ${info.type === 'garage' ? 'الجراج' : 'المنزل'} الآن!`);
                else
                    exports.NewStart_Notifications.showAttention('success', `لقد قمت بفتح باب ${info.type === 'garage' ? 'الجراج' : 'المنزل'} الآن!`);
                SendNUIMessage(JSON.stringify({ type: 'sounds', action: 'lockDoor', volume: state.volume }));
                emitNet('NewStart_RealEstate:handleInterior-server', 'toggleKey', JSON.stringify({ ...info, value }));
            }
            break;
        case 'getProperties':
            const properties = state.properties.map(obj => {
                let find = state.office.items.find(i => i.code === obj.code);
                return { code: find.code, type: find.type, name: find.name, coord: find.coord };
            });
            return properties;
        case 'findHouse': return state.office.items.find(i => i.code === data);
        case 'setVolume':
            state.volume = data;
            break;
        case 'lockDoorSound':
            SendNUIMessage(JSON.stringify({ type: 'sounds', action: 'lockDoor', volume: state.volume }));
            break;
        case 'getData': return state.office.items;
        default: closeUI(true);
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_RealEstate:handleOffice-client', (data) => {
    data = JSON.parse(data);
    if (data.type === 'initial') {
        const properties = [];
        state.office.items = data.office;
        SendNUIMessage(JSON.stringify({ type: 'initial', info: { office: data.office.filter((obj) => !obj.isOwned), sale: data.sale } }));
        state.properties.forEach(item => {
            RemoveBlip(item.house);
            RemoveBlip(item.garage);
        });
        for (let code of data.properties) {
            const prev = state.properties.find(p => p.code === code);
            const find = state.office.items.find(obj => obj.code === code);
            const data = { code, house: 0, garage: 0, vehLoad: false };
            if (find.type !== 'garage') {
                data.house = createBlip('house', find.coord, 5, code);
                if (find.garage)
                    data.garage = createBlip('garage', find.garage, 5, code);
            }
            else {
                data.garage = createBlip('garage', find.coord, 5, code);
            }
            if (prev)
                data.vehLoad = prev.vehLoad;
            else if (find.type !== 'garage' && !find.garage)
                data.vehLoad = true;
            properties.push(data);
        }
        state.properties = properties;
        if (data.giveKey) {
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 45, count: 1, features: { id: data.giveKey } }));
        }
    }
    else if (data.type === 'existing') {
        SendNUIMessage(JSON.stringify({ type: 'removeFromOffice', code: data.code }));
        exports.NewStart_Notifications.showAttention('error', 'للإسف قام شخص اخر بشراء العقار قبلك');
    }
    else if (data.type === 'payment') {
        const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
        const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
        const info = { name: 'مكتب العقارات', price: data.price, from: 'cash' };
        if (cash >= info.price) {
            StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
            info.from = 'cash';
        }
        else if (bank >= info.price) {
            StatSetInt('BANK_BALANCE', bank - info.price, false);
            info.from = 'bank';
        }
        else {
            emitNet('NewStart_RealEstate:handleOffice-server', 'initial');
            exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
            return;
        }
        let type = state.office.items.find(obj => obj.code === data.code)?.type;
        if (type !== 'garage')
            type = 'normal';
        emitNet('NewStart_RealEstate:handleOffice-server', 'addProperty', JSON.stringify({ type, code: data.code }));
        emitNet('NewStart:moneyDecrease', info);
        if (info.from === 'cash')
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
        exports.NewStart_Notifications.showAttention('success', 'تمت عملية شراء العقار بنجاح');
    }
    else {
        const index = state.office.items.findIndex(obj => obj.code === data.code);
        state.office.items[index].isOwned = data.value;
    }
});
(async function createEmployee() {
    const model = GetHashKey('u_f_m_casinoshop_01');
    RequestModel(model);
    while (!HasModelLoaded(model))
        await Delay(1000);
    const pedID = CreatePed(1, model, -143.3538, 6281.9604, 30.4871, 315, false, false);
    FreezeEntityPosition(pedID, true);
    SetBlockingOfNonTemporaryEvents(pedID, true);
    SetEntityInvincible(pedID, true);
})();
(async function createDoors() {
    const model = 520341586;
    RequestModel(model);
    while (!HasModelLoaded(model))
        await Delay(1000);
    const LOW_OBJECT_ID = CreateObject(model, 265.1208 - 0.635, -1001.5516 - 0.03, -99.01464 - 1, false, false, true);
    const MUD_OBJECT_ID = CreateObject(model, 345.8648, -1003.1472, -100.1999, false, false, true);
    SetEntityHeading(LOW_OBJECT_ID, 179.8);
    FreezeEntityPosition(LOW_OBJECT_ID, true);
    SetEntityHeading(MUD_OBJECT_ID, 179.8);
    FreezeEntityPosition(MUD_OBJECT_ID, true);
})();
function startConversation(pedID, { x, y, z }) {
    SetEntityCoords(pedID, x, y, z - 1, false, false, false, false);
    TaskAchieveHeading(pedID, state.office.coord.h, 0);
    state.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", x - 0.35, y + 1.8, z + 1.1, -20, 0, 180, 50, false, 0);
    SetCamActive(state.cameraID, true);
    RenderScriptCams(true, true, 1000, true, true);
}
function createBlip(type, coord, color = 25, code) {
    const blip = AddBlipForCoord(coord.x, coord.y, coord.z);
    let text = '';
    if (code)
        text = type === 'garage' ? `ﺝﺍﺮﺟ ${code}` : `ﻝﺰﻨﻣ ${code}`;
    else
        text = type === 'garage' ? 'ﻊﻴﺒﻠﻟ ﺹﺎﺧ ﺝﺍﺮﺟ' : 'ﻊﻴﺒﻠﻟ ﻲﻨﻜﺳ ﺭﺎﻘﻋ';
    SetBlipSprite(blip, type === 'garage' ? 357 : 40);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(`<font face="A9eelsh">${text}</font>`);
    EndTextCommandSetBlipName(blip);
    SetBlipColour(blip, color);
    if (code)
        SetBlipCategory(blip, 11);
    else
        SetBlipAsShortRange(blip, true);
    return blip;
}
function ghostPlayers(isActive) {
    const transparency = isActive ? 50 : 255;
    for (let id of GetActivePlayers().filter((i) => i !== PlayerId())) {
        SetEntityAlpha(GetPlayerPed(id), transparency, false);
    }
}
function closeUI(isNUI) {
    if (state.isOpen) {
        ghostPlayers(false);
        ClearPedTasks(PlayerPedId());
        DestroyCam(state.cameraID, true);
        RenderScriptCams(false, true, 1000, false, false);
        if (!exports.NewStart_MainMenu.isOpen()) {
            DisplayRadar(true);
            exports.NewStart_HudSystem.openHud();
            exports.NewStart_MainMenu.toggleAds(true);
        }
    }
    if (isNUI)
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    SetNuiFocus(false, false);
    state.isOpen = false;
    state.runClose = false;
    state.interior.isOpen = false;
    state.interior.runClose = false;
    state.interior.currentEnter = null;
    state.interior.insideExit.isOpen = false;
    state.interior.insideExit.runClose = false;
    state.interior.garageCount = 0;
    if (state.control.isInventory)
        exports.NewStart_Inventory.closeUI();
    state.control.isOpen = false;
    state.control.runClose = false;
    state.control.isClothesPreview = false;
    state.control.isInventory = false;
}
exports('closeUI', closeUI);
let state = {
    volume: 0.8,
    properties: [],
    isOpen: false,
    runClose: false,
    cameraID: 0,
    interior: {
        isOpen: false,
        runClose: false,
        currentEnter: null,
        insideCode: '',
        insideExit: { current: null, isOpen: false, runClose: false },
        garageCount: 0
    },
    office: {
        coord: { x: -141.9560, y: 6283.4902, z: 31.4871, h: 133.2283 },
        blips: [],
        items: []
    },
    control: {
        current: null,
        tickID: 0,
        clothes: [],
        isClothesPreview: false,
        isOpen: false,
        runClose: false,
        isInventory: false,
    }
};
const empty = null;
const vehiclesBlocks = ['TOWTRUCK'];
const garages = {
    little: {
        spwan: { x: 175.0153, y: -1007.2351, z: -99.0146, h: 348.6614 },
        exit: { x: 172.7604, y: -1008.4483, z: -99.01464 },
        house: { x: 179.0241, y: -1000.0615, z: -99.0146, h: 0 },
        control: { x: 177.1252, y: -1000.3252, z: -99.0146, h: 153.0708 }
    },
    small: {
        spwan: { x: 195.6527, y: -1024.6549, z: -99.0146, h: 331.6535 },
        exit: { x: 194.595, y: -1027.1208, z: -99.0146 },
        house: { x: 207.4681, y: -1018.3512, z: -99.0146, h: 272.1259 },
        control: { x: 205.6483, y: -1014.2769, z: -99.0146, h: 150.2362 }
    },
    medium: {
        spwan: { x: 196.4967, y: -1006.0087, z: -99.0146, h: 345.8267 },
        exit: { x: 194.5714, y: -1007.8285, z: -99.0146 },
        house: { x: 212.4923, y: -999.0293, z: -99.0146, h: 269 },
        control: { x: 205.5428, y: -994.9714, z: -99.0146, h: 147.4015 }
    },
    large: {
        spwan: { x: 231.6527, y: -1003.3978, z: -99.0146, h: 2.8346 },
        exit: { x: 231.8901, y: -1006.7868, z: -99.0146 },
        house: { x: 240.3032, y: -1004.8351, z: -99.0146, h: 269 },
        control: { x: 234.6725, y: -976.5230, z: -99.0146, h: 147.4015 }
    }
};
const houses = {
    low: {
        spwan: { x: 264.7780, y: -1000.2725, z: -99.0146, h: 42.5196 },
        exit: { x: 265.1144, y: -1001.2747, z: -99.0146, h: 179 },
        control: { x: 259.8988, y: -1003.6483, z: -99.0146, h: 0 }
    },
    medium: {
        spwan: { x: 346.6285, y: -1001.3142, z: -99.1999, h: 11.3385 },
        exit: { x: 346.4771, y: -1002.8439, z: -99.1999, h: 178.582 },
        control: { x: 351.4153, y: -998.8615, z: -99.1999, h: 87.8740 }
    }
};
const blips = [
    { id: 475, name: 'ﻲﻨﻜﺳ ﻊﻤﺠﻣ', x: -93.5736, y: 6339.3496, z: 31.4871 },
    { id: 475, name: 'ﻲﻨﻜﺳ ﻊﻤﺠﻣ', x: -182.6385, y: 6431.0097, z: 31.9153 },
    { id: 475, name: 'ﻲﻨﻜﺳ ﻊﻤﺠﻣ', x: 1551.1564, y: 3561.2495, z: 35.4332 }
];
function controlBuild() {
    emitNet('NewStart_RealEstate:handleInterior-server', 'getClothes');
    return setTick(() => {
        if (state.interior.insideCode) {
            const find = state.office.items.find(obj => obj.code === state.interior.insideCode);
            if (find) {
                let coord;
                if (find.type === 'garage') {
                    coord = garages[find.garageType].control;
                }
                else {
                    coord = houses[find.coord.type].control;
                }
                const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], coord.x, coord.y, coord.z, true);
                if (distance < 30) {
                    const color = state.properties.some(i => i.code === find.code) ? [230, 184, 0] : [45, 101, 167];
                    DrawMarker(1, coord.x, coord.y, coord.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.5, color[0], color[1], color[2], 60, false, false, 2, false, empty, empty, false);
                }
                if (distance < 0.6) {
                    state.control.current = {
                        inJob: exports.NewStart_Employee.method('inJob') || exports.NewStart_Mechanical.method('info', 'isIn'),
                        code: find.code,
                        isLock: find.isLock,
                        noInventory: !state.properties.some(p => p.code === find.code),
                        heading: coord.h
                    };
                }
                else {
                    state.control.current = null;
                }
            }
        }
        if (state.control.current &&
            !IsEntityDead(state.pedID) &&
            !IsPauseMenuActive()) {
            if (IsControlJustPressed(0, 38)) {
                SendNUIMessage(JSON.stringify({ type: 'openUI', isControl: true, info: state.control.current }));
                SetNuiFocus(true, true);
                state.control.isOpen = true;
            }
            else if (!state.control.isInventory && exports.NewStart_Inventory.info('isOpenExchange')) {
                SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                state.control.isInventory = true;
            }
            else if (!state.control.isOpen && !state.control.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
            }
            state.control.runClose = true;
        }
        else if (state.control.runClose) {
            if (state.control.isClothesPreview)
                exports.NewStart_Clothes.pedReset();
            closeUI(true);
        }
    });
}
RegisterNuiCallbackType('NUI:control');
on('__cfx_nui:NUI:control', (data, cb) => {
    switch (data.type) {
        case 'sale':
            emitNet('NewStart_RealEstate:handleOffice-server', 'saleProperty', JSON.stringify({ code: data.id }));
            break;
        case 'inventory':
            const type = state.office.items.find(i => i.code === state.interior.insideCode)?.type;
            exports.NewStart_Inventory.method('openExchange', {
                type: 'house',
                id: state.interior.insideCode,
                name: `خزنة ${type === 'garage' ? 'الجراج' : 'المنزل'}`
            });
            SetNuiFocus(false, false);
            break;
        case 'clothesHeading':
            TaskAchieveHeading(state.pedID, state.control.current.heading, 0);
            break;
        case 'clothes':
            const saved = state.control.clothes.find((c) => c._id === data.id)?.features;
            if (data.action === 'set') {
                const items = exports.NewStart_Clothes.items();
                state.control.isClothesPreview = true;
                for (let key in saved) {
                    const item = items.find(i => i.name === key);
                    const drawableID = saved[key].drawableID;
                    const textureID = saved[key].textureID;
                    if (item.type === 'main') {
                        SetPedComponentVariation(state.pedID, item.id, drawableID, textureID, 0);
                    }
                    else {
                        if (drawableID !== 0) {
                            SetPedPropIndex(state.pedID, item.id, drawableID, textureID, true);
                        }
                        else {
                            ClearPedProp(state.pedID, item.id);
                        }
                    }
                }
            }
            else if (data.action === 'save') {
                exports.NewStart_Clothes.method('setClothes', JSON.stringify(saved));
            }
            else {
                exports.NewStart_Clothes.pedReset();
            }
            break;
        case 'notification':
            exports.NewStart_Notifications.showAttention('error', data.text);
            break;
        default:
            closeUI(false);
    }
    cb('OK!');
});
setTick(() => {
    let exitFind = null;
    if (state.interior.insideCode)
        exitFind = state.office.items.find(obj => obj.code === state.interior.insideCode);
    for (let key in garages) {
        const ref = garages[key];
        const distanceHouse = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], ref.house.x, ref.house.y, ref.house.z, true);
        const distanceExit = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], ref.exit.x, ref.exit.y, ref.exit.z, true);
        if (exitFind?.type !== 'garage' && distanceHouse < 30) {
            const color = state.properties.some(i => i.code === exitFind?.code) ? [230, 184, 0] : exitFind?.isOwned ? [45, 101, 167] : [51, 153, 102];
            DrawMarker(20, ref.house.x, ref.house.y, ref.house.z, 0, 0, 0, 0, 180, ref.house.h, 1.5, 1.5, 1, color[0], color[1], color[2], 70, false, false, 2, false, empty, empty, false);
        }
        if (exitFind?.type !== 'garage' && distanceHouse < 0.6) {
            state.interior.insideExit.current = { type: 'garage-house', distance: distanceHouse, code: exitFind.code };
            break;
        }
        else if ((distanceExit < 4.3 && state.vehID && state.vehClass !== 8) ||
            (distanceExit < 3.1 && state.vehClass === 8) || (distanceExit < 2.4)) {
            const color = state.properties.some(i => i.code === exitFind?.code) ? [230, 184, 0] : exitFind?.isOwned ? [45, 101, 167] : [51, 153, 102];
            DrawMarker(27, ref.exit.x, ref.exit.y, ref.exit.z - 0.98, 0.0, 0.0, 0.0, 0, 0, 0, 4.7, 4.7, 0.5, color[0], color[1], color[2], 50, false, false, 2, false, empty, empty, false);
            state.interior.insideExit.current = { type: 'garage-exit', distance: distanceExit, code: exitFind.code };
            break;
        }
        else {
            state.interior.insideExit.current = null;
        }
    }
    for (let key in houses) {
        const ref = houses[key];
        const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], ref.exit.x, ref.exit.y, ref.exit.z, true);
        if (distance < 0.8) {
            state.interior.insideExit.current = { type: 'house-exit', distance, code: exitFind.code };
            break;
        }
    }
    if (state.interior.insideExit.current &&
        !IsEntityDead(state.pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38) && !state.vehID) {
            if (state.interior.insideExit.current.type === 'house-exit') {
                const isLock = exitFind.isOwned && exitFind.isLock;
                exitInterior(exitFind?.outHouse, isLock, true);
            }
            else if (state.interior.insideExit.current.type === 'garage-house') {
                SendNUIMessage(JSON.stringify({
                    type: 'openUI',
                    isGarage: true,
                    value: state.properties.some(i => i.code === exitFind?.code) ? 'owned' : exitFind?.isOwned ? 'another' : 'sale'
                }));
                state.interior.insideExit.isOpen = true;
                SetNuiFocus(true, true);
            }
            else {
                const isLock = exitFind.isOwned && (exitFind.type === 'garage' ? exitFind.isLock : exitFind.garage.isLock);
                exitInterior(exitFind?.garageOut, isLock);
            }
        }
        else if (IsControlJustPressed(0, 245) && state.interior.insideExit.current.type === 'garage-exit' && state.vehID) {
            const isLock = exitFind.isOwned && (exitFind.type === 'garage' ? exitFind.isLock : exitFind.garage.isLock);
            exitInterior(exitFind?.garageOut, isLock);
        }
        else if (IsControlJustPressed(0, 23)) {
            state.interior.garageCount = 0;
        }
        else if (!state.interior.insideExit.isOpen && state.interior.garageCount !== 200) {
            SendNUIMessage(JSON.stringify({
                type: 'entranceOpen',
                isVeh: state.vehID && state.interior.insideExit.current.type === 'garage-exit',
                isExit: true
            }));
            state.interior.garageCount += 1;
        }
        state.interior.insideExit.runClose = true;
    }
    else if (state.interior.insideExit.runClose) {
        closeUI(true);
        exitFind = null;
    }
});
function exitInterior(coords, isLock, isHouse) {
    if (isLock) {
        return exports.NewStart_Notifications.showAttention('error', `باب ${isHouse ? 'المنزل' : 'الجراج'} مغلق يجب فتحه أولاً للدخول!`);
    }
    DoScreenFadeOut(0);
    emitNet('NewStart_RealEstate:handleBucket-server', { type: 'exit', code: state.interior.insideCode });
    if (!isHouse && state.vehID) {
        SetPedCoordsKeepVehicle(state.pedID, coords.x, coords.y, coords.z - 1);
        SetEntityHeading(state.vehID, coords.h);
    }
    else {
        SetEntityCoords(state.pedID, coords.x, coords.y, coords.z - 1, false, false, false, false);
        SetEntityHeading(state.pedID, coords.h);
    }
}
onNet('NewStart_RealEstate:handleInterior-client', async (type, data) => {
    if (data)
        data = JSON.parse(data);
    if (type === 'toggleKey') {
        const find = state.office.items.find(obj => obj.code === data.code);
        if (find) {
            if (find.type !== 'garage' && data.type === 'garage') {
                find.garage.isLock = data.value;
            }
            else {
                find.isLock = data.value;
            }
        }
    }
    else if (type === 'safeEnter') {
        clearTick(state.control.tickID);
        state.interior.insideCode = data.code;
        state.control.tickID = 0;
    }
    else if (type === 'safeExit' && state.interior.insideCode) {
        if (!data?.isDone) {
            emitNet('NewStart_RealEstate:handleBucket-server', { type: 'exit', code: state.interior.insideCode });
        }
        clearTick(state.control.tickID);
        state.interior.insideCode = '';
        state.control.tickID = 0;
    }
    else if (type === 'setClothes') {
        SendNUIMessage(JSON.stringify({ type: 'setClothes', items: data.map(({ _id, name }) => ({ _id, title: name })) }));
        state.control.clothes = data;
    }
    else if (type === 'saleProperty') {
        if (data.prevent) {
            const text = data.isLoan ?
                'لا يمكنك بيع العقار لأنه ضمان لقرض من البنك الوطني!' :
                'يجب صف المركبات المحفوظة خارج الجراج أولاً  قبل البيع!';
            exports.NewStart_Notifications.showAttention('error', text);
            SendNUIMessage(JSON.stringify({ type: 'preventSale' }));
        }
        else {
            emitNet('NewStart:giveMoney', data);
        }
    }
    else if (type === 'removeBlackScreen') {
        if (data.coord) {
            SetPedCoordsKeepVehicle(state.pedID, data.coord.x, data.coord.y, data.coord.z - 0.7);
            SetEntityHeading(state.vehID, data.coord.h);
        }
        if (IsEntityPositionFrozen(state.pedID)) {
            while (!IsEntityPositionFrozen(state.pedID)) {
                await Delay(0);
            }
        }
        DoScreenFadeIn(500);
    }
});
setTick(() => {
    state.vehID = GetVehiclePedIsIn(state.pedID, false);
    state.vehClass = GetVehicleClass(state.vehID);
    for (let item of state.office.items.filter(obj => ['special', 'normal'].includes(obj.type))) {
        const { x, y, z, h } = item.coord;
        const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], x, y, z, true);
        if (distance < 40) {
            const color = state.properties.some(i => i.code === item.code) ? [230, 184, 0] : item.isOwned ? [45, 101, 167] : [51, 153, 102];
            DrawMarker(20, x, y, z, 0, 0, 0, 0, 180, h, 1, 1, 0.7, color[0], color[1], color[2], 70, false, false, 2, false, empty, empty, false);
        }
        if (distance < 0.6) {
            state.interior.currentEnter = { type: item.type, code: item.code };
            break;
        }
        else {
            state.interior.currentEnter = null;
        }
    }
    if (!state.interior.currentEnter) {
        const items = state.office.items.filter(obj => obj.type === 'garage').concat(state.office.items.filter(obj => obj.garage));
        for (let item of items) {
            const { x, y, z, rotX = 0, rotY = 0 } = item.type === 'garage' ? item.coord : item.garage;
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], x, y, z, true);
            if ((distance < 6.6 && [10, 16, 17, 20].includes(state.vehClass)) ||
                (distance < 4.3 && state.vehID && state.vehClass !== 8) ||
                (distance < 3.1 && state.vehClass === 8) || (distance < 2.4)) {
                if (!item.isOwned && state.vehID)
                    break;
                const color = state.properties.some(i => i.code === item.code) ? [230, 184, 0] : item.isOwned ? [45, 101, 167] : [51, 153, 102];
                DrawMarker(27, x, y, z - 0.98, 0.0, 0.0, 0.0, rotX, rotY, 0, 4.7, 4.7, 0.5, color[0], color[1], color[2], 50, false, false, 2, false, empty, empty, false);
                state.interior.currentEnter = { type: 'garage', code: item.code };
                break;
            }
        }
    }
    if (state.interior.currentEnter &&
        !IsEntityDead(state.pedID) &&
        !IsPauseMenuActive() &&
        !exports.NewStart_Keys.method('info', 'isChangeLocks')) {
        if (IsControlJustPressed(0, 38) && !state.vehID) {
            const find = state.office.items.find(obj => obj.code === state.interior.currentEnter?.code);
            if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
                return exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس خاصة بمهمة تخلص منها أولاً.');
            }
            if (find.isOwned) {
                handleInSide(state.interior.currentEnter.type, find);
            }
            else {
                state.interior.isOpen = true;
                SetNuiFocus(true, true);
                SendNUIMessage(JSON.stringify({ type: 'openUI', isPreview: true, value: state.interior.currentEnter.type }));
            }
        }
        else if (IsControlJustPressed(0, 245) && (state.vehID && state.interior.currentEnter.type === 'garage')) {
            const find = state.office.items.find(obj => obj.code === state.interior.currentEnter?.code);
            const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', state.vehID);
            const isPrivate = exports.NewStart_VehicleSystem.method('info', 'plates').includes(plate);
            if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
                return exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس خاصة بمهمة تخلص منها أولاً.');
            }
            else if (!state.properties.some(p => p.code === find.code) && find.type !== 'garage') {
                return exports.NewStart_Notifications.showAttention('error', 'لا يمكنك إدخال أي مركبة لهذا الجراج!');
            }
            else if ([10, 16, 17, 20].includes(state.vehClass)) {
                return exports.NewStart_Notifications.showAttention('error', 'لا يمكن للجراجات استيعاب أي شاحنة عملاقة أو ماشابه!');
            }
            else if (!isPrivate) {
                return exports.NewStart_Notifications.showAttention('error', 'لا يمكنك الدخول للجراج إلا بالمركبات الخاصة فقط!');
            }
            else if (vehiclesBlocks.includes(GetDisplayNameFromVehicleModel(GetEntityModel(state.vehID)))) {
                return exports.NewStart_Notifications.showAttention('error', 'هذه المركبة ممنوعة من دخول الجراجات!');
            }
            handleInSide('garage', find);
        }
        else if (IsControlJustPressed(0, 23)) {
            state.interior.garageCount = 0;
        }
        else if (!state.interior.isOpen && state.interior.garageCount !== 200) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen', isVeh: state.vehID && state.interior.currentEnter.type === 'garage' }));
            state.interior.garageCount += 1;
        }
        state.interior.runClose = true;
    }
    else if (state.interior.runClose) {
        closeUI(true);
    }
});
async function handleInSide(type, interior) {
    let coords;
    if (type === 'garage') {
        if (interior.isOwned && ((interior.type === 'garage' && interior.isLock) || (interior.type !== 'garage' && interior.garage?.isLock))) {
            return exports.NewStart_Notifications.showAttention('error', 'باب الجراج مغلق يجب فتحه أولاً للدخول!');
        }
        coords = interior.type === 'garage' ? garages[interior.garageType].spwan : garages[interior.garage.type].spwan;
    }
    else {
        if (interior.isLock && interior.isOwned) {
            return exports.NewStart_Notifications.showAttention('error', 'باب المنزل مغلق يجب فتحه أولاً للدخول!');
        }
        coords = houses[interior.coord.type].spwan;
    }
    const urOwn = state.properties.find(p => p.code === interior.code);
    if (!state.interior.insideCode) {
        DoScreenFadeOut(0);
        emitNet('NewStart_RealEstate:handleBucket-server', { type: 'enter', code: interior.code, enterCoord: coords, urOwn: !!urOwn });
    }
    if (!state.control.tickID && interior.isOwned) {
        state.control.tickID = controlBuild();
    }
    state.interior.insideCode = interior.code;
    if (urOwn && !urOwn.vehLoad) {
        emitNet('NewStart_RealEstate:handleInterior-server', 'vehiclesGarage', JSON.stringify({ code: interior.code }));
        urOwn.vehLoad = true;
    }
    if (type === 'garage' && state.vehID) {
        if (urOwn)
            return;
        SetPedCoordsKeepVehicle(state.pedID, coords.x, coords.y, coords.z - 1);
        SetEntityHeading(state.vehID, coords.h);
    }
    else {
        SetEntityCoords(state.pedID, coords.x, coords.y, coords.z - 1, false, false, false, false);
        SetEntityHeading(state.pedID, coords.h);
    }
    FreezeEntityPosition(state.pedID, true);
    RequestCollisionAtCoord(coords.x, coords.y, coords.z);
    while (!HasCollisionLoadedAroundEntity(state.pedID)) {
        RequestCollisionAtCoord(coords.x, coords.y, coords.z);
        await Delay(1);
    }
    FreezeEntityPosition(state.pedID, false);
}
