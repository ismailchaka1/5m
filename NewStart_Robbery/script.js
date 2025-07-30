"use strict";
let interfaces = { pauseMenu: false, isDead: false, loadingScreen: false };
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
on('onClientGameTypeStart', () => {
    for (let item of [...state.places, ...state.bots.coords.map(i => ({ blipID: 500, title: 'ﺕﺎﻗﺮﺴﻟﺍ ﻡﻼﺘﺳﺍ', coordMain: i }))]) {
        const blip = AddBlipForCoord(item.coordMain.x, item.coordMain.y, item.coordMain.z);
        SetBlipSprite(blip, item.blipID);
        SetBlipAsShortRange(blip, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">${item.title}</font>`);
        EndTextCommandSetBlipName(blip);
        if (item.blipID === 500)
            SetBlipColour(blip, 6);
    }
});
(async function createBot() {
    const model = -1275859404;
    const anim = 'amb@world_human_stand_guard@male@base';
    RequestModel(model);
    RequestAnimDict(anim);
    while (!HasModelLoaded(model) || !HasAnimDictLoaded(anim))
        await Delay(1000);
    for (let item of state.bots.coords) {
        const pedID = CreatePed(1, model, item.x, item.y, item.z, item.h, false, false);
        FreezeEntityPosition(pedID, true);
        SetBlockingOfNonTemporaryEvents(pedID, true);
        SetEntityInvincible(pedID, true);
        TaskPlayAnim(pedID, anim, 'base', 8.0, 1.0, -1, 1, 1.0, false, false, false);
    }
})();
setTick(() => {
    state.pedID = PlayerPedId();
    state.pedCoord = GetEntityCoords(state.pedID, true);
    const faction = exports.NewStart_Factions.info();
    state.job = {
        isOfficial: faction?.type === 'official',
        isPolice: state.keys.includes(faction?.key),
        isActive: exports.NewStart_Employee.data(true).isActive,
        isVacation: faction?.isVacation
    };
    interfaces = {
        pauseMenu: IsPauseMenuActive(),
        isDead: IsEntityDead(state.pedID),
        loadingScreen: exports.NewStart_Initialize.loadingScreen(true)
    };
    if (state.team.items.length) {
        const otherUI = Object.values({ ...interfaces, inventory: exports.NewStart_Inventory.info('isOpen') }).some(i => i);
        if (!state.teamNUI && otherUI) {
            state.teamNUI = true;
            SendNUIMessage(JSON.stringify({ type: 'team', show: false }));
        }
        else if (state.teamNUI && !otherUI) {
            state.teamNUI = false;
            SendNUIMessage(JSON.stringify({
                type: 'team',
                show: true,
                isPolice: !state.job.isVacation && state.job.isPolice,
                showBlock: state.team.isLeader && !state.places.find(p => p.id === state.team.id)?.isBlock
            }));
        }
        if (state.team.isLeader && IsControlJustPressed(0, 303) && !state.places.find(p => p.id === state.team.id)?.isBlock) {
            state.places[state.places.findIndex(p => p.id === state.team.id)].isBlock = false;
            SendNUIMessage(JSON.stringify({ type: 'state', info: { showBlock: false } }));
            emitNet('NewStart_Robbery:handleGeneral-server', 'isBlock', { id: state.team.id });
        }
    }
    if (!state.job.isOfficial || state.job.isVacation) {
        let isCurrent = false;
        for (let item of state.bots.coords) {
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.x, item.y, item.z, true);
            if (distance < 1.7) {
                isCurrent = true;
                break;
            }
        }
        if (isCurrent &&
            !Object.values(interfaces).some(i => i) &&
            !IsPedInAnyVehicle(state.pedID, false)) {
            if (IsControlJustPressed(0, 38)) {
                SendNUIMessage(JSON.stringify({ type: 'state', info: { isBot: true, isReward: state.progress === 100 } }));
                SetNuiFocus(true, true);
                state.bots.isOpen = true;
            }
            else if (!state.bots.isOpen && !state.bots.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen', isTalk: true }));
            }
            state.bots.runClose = true;
        }
        else if (state.bots.runClose) {
            state.bots.isOpen = false;
            state.bots.runClose = false;
            SendNUIMessage(JSON.stringify({ type: 'state', info: { isBot: false } }));
            SetNuiFocus(false, false);
        }
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    switch (data.type) {
        case 'reward':
            if (state.progress !== 100)
                return cb('OK!');
            resetRobbery(true);
        default:
            state.bots.isOpen = false;
            state.bots.runClose = false;
            SetNuiFocus(false, false);
    }
    cb('OK!');
});
onNet('NewStart_Robbery:handleGeneral-clinet', (type, data) => {
    if (data)
        data = JSON.parse(data);
    if (type === 'setTeam') {
        if (data.id) {
            if (!state.team.items.length) {
                SendNUIMessage(JSON.stringify({
                    type: 'team',
                    show: true,
                    isPolice: !state.job.isVacation && state.job.isPolice,
                    showBlock: data.isLeader
                }));
            }
            state.robberyLoading = false;
            state.team = data;
            if (state.team.type === 'criminals') {
                if (state.team.isLeader) {
                    if (state.team.id.includes('store') || state.team.id.includes('yacht')) {
                        exports.NewStart_Notifications.showAttention('success', 'قف أمام الخزنة وابدأ بتكسيرها باستخدام الطلقات النارية.');
                    }
                    else if (state.team.id.includes('bank')) {
                        startBankRobbery();
                    }
                }
                else if (state.team.items.length > 1) {
                    exports.NewStart_Notifications.showAttention('success', 'لقد انضممت إلى فريق السرقة قم بمساعدة قائد الفريق.');
                }
                state.progress = 0;
            }
            if (state.team.type === 'police') {
                exports.NewStart_Notifications.showAttention('success', 'لقد انضممت إلى فريق شرطة للتعامل مع عملية سرقة.');
                state.entranceOpen = false;
            }
            state.team.time.tickID = setInterval(() => {
                state.team.time.current -= 1000;
                exports.NewStart_HudSystem.method('setStateNUI', { timeRobbery: createTime(state.team.time.current) });
            }, 1000);
        }
        else {
            state.team.items = data.items;
        }
        SendNUIMessage(JSON.stringify({ type: 'team', items: state.team.items }));
    }
    else if (type === 'isDone' && state.team.id === data.id && !interfaces.isDead) {
        state.progress = 100;
        state.places[state.places.findIndex(p => p.id === data.id)].isBlock = true;
        exports.NewStart_Notifications.showAttention('success', 'اهرب سريعًا واذهب للموقع التالي للحصول علي حصتك من السرقة!');
        SendNUIMessage(JSON.stringify({ type: 'state', info: { showBlock: false } }));
    }
    else if (type === 'joinFailed') {
        state.robberyLoading = false;
        if (data.by === 'full') {
            exports.NewStart_Notifications.showAttention('error', 'لا يمكن الانضمام للسرقة للوصول للحد الاقصي!');
        }
        else if (data.by === 'available') {
            exports.NewStart_Notifications.showAttention('error', `يجب تواجد ${data.value} عسكري على الأقل من الشرطة وأمن المنشآت!`);
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'لا يمكنك الانضمام لعملية السرقة!');
        }
    }
    else if (type === 'reward') {
        if (data.isPolice) {
            exports.NewStart_Notifications.showAttention('success', 'لقد حصلت على مكافأة إفشال هذه السرقة!');
            exports.NewStart_Bank.method('giveCash', { name: 'مكافآت السرقة', amount: data.money });
            exports.NewStart_MainMenu.levelUp(data.exp);
        }
        else {
            let money = parseInt(Math.floor(Math.random() * (data.to - data.from + 1)) + data.from);
            if (exports.NewStart_Admin.method('info').isDoubleTaboo)
                money = money * 2;
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 106, count: money }));
            exports.NewStart_Notifications.showAttention('success', `لقد حصلت علي ${money.toLocaleString()}$ غير شرعي.`);
        }
    }
    else {
        if (state.team.id === data.id) {
            SendNUIMessage(JSON.stringify({ type: 'team', show: false }));
            resetRobbery(false, false);
            emit('NewStart_Admin:methods-client', 'addBigAds', 'endRobbery');
        }
        const find = state.places.find(p => p.id === data.id);
        RemoveBlip(find.alert?.id);
        clearInterval(find.alert?.tickID);
        if (find.id.includes('bank') && bankState.trolleyID) {
            DeleteObject(bankState.trolleyID);
        }
        find.time = {
            current: data.lull,
            tickID: setInterval(() => {
                if (!find.time?.current || find.time.current <= 0) {
                    clearInterval(find.time?.tickID);
                    find.isBlock = false;
                    delete find.time;
                    if (find.id.includes('bank')) {
                        SetEntityRotation(find.objectID, 0, 0, find.coordRobbery.yaw, 0, true);
                        SetEntityCoords(find.objectID, find.coordRobbery.x, find.coordRobbery.y, find.coordRobbery.endZ, false, false, false, false);
                    }
                }
                else {
                    find.time.current -= 1000;
                }
            }, 1000)
        };
        delete find.alert;
    }
});
function createTime(ms, withHours = false) {
    if (withHours) {
        const hou = Math.floor(ms / 3600000);
        const min = Math.floor((ms % 3600000) / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return (hou < 10 ? `0${hou}:` : `${hou}:`) + (min < 10 ? `0${min}:` : `${min}:`) + (sec < 10 ? `0${sec}` : sec);
    }
    else {
        const min = Math.floor(ms / 60000);
        const sec = ((ms % 60000) / 1000).toFixed(0);
        return (min < 10 ? `0${min}:` : `${min}:`) + (sec < 10 ? `0${sec}` : sec);
    }
}
function draw3DTime(info) {
    const cam = GetGameplayCamCoords();
    const dist = GetDistanceBetweenCoords(cam[0], cam[1], cam[2], info.x, info.y, info.z, true);
    const scale = ((1 / dist) * 20) * (1 / GetGameplayCamFov()) * 100;
    SetTextScale(info.scaleX * scale, info.scaleY * scale);
    SetTextProportional(true);
    SetTextColour(181, 57, 48, 200);
    SetTextOutline();
    SetTextEntry("STRING");
    SetTextCentre(true);
    AddTextComponentString(`<font face="A9eelsh">ﺔﻗﺮﺴﻟﺍ ﺀﺪﺒﻟ ${createTime(info.time, true)} ﻲﻘﺒﺘﻣ</font>`);
    SetDrawOrigin(info.x, info.y, info.z + 1.8, 0);
    DrawText(0.0, 0.0);
    ClearDrawOrigin();
}
function resetRobbery(isReward = false, withServer = true) {
    if (!state.team.id)
        return;
    if (withServer)
        emitNet('NewStart_Robbery:handleGeneral-server', 'removeFromTeam', { id: state.team.id, isReward });
    clearInterval(state.team.time.tickID);
    exports.NewStart_HudSystem.method('setStateNUI', { timeRobbery: '' });
    SendNUIMessage(JSON.stringify({ type: 'progress', value: 0 }));
    state.progress = 0;
    state.teamNUI = false;
    state.team = { type: '', id: '', time: { current: 0, tickID: 0 }, isLeader: false, max: 0, items: [] };
}
exports('method', (type, data) => {
    if (type === 'reset') {
        resetRobbery(false, data);
        SendNUIMessage(JSON.stringify({ type: 'team', show: false }));
    }
    else if (type === 'places') {
        return data ? state.places.filter(p => p.id.includes(data)) : state.places;
    }
    else if (type === 'isRobbery') {
        return state.team.type === 'criminals';
    }
});
const state = {
    isWater: false,
    keys: ['police', 'facilities'],
    job: { isOfficial: false, isPolice: false, isActive: false, isVacation: false },
    bots: {
        isOpen: false,
        runClose: false,
        coords: [
            { x: -3046.4438, y: 3331.7011, z: 10.9245, h: 283.4645 },
            { x: 1998.2133, y: 508.1006, z: 162.7030, h: 96.3988 }
        ]
    },
    pedID: 0,
    pedCoord: [],
    entranceOpen: false,
    robberyLoading: false,
    isProgress: false,
    progress: 0,
    team: { type: '', id: '', time: { current: 0, tickID: 0 }, isLeader: false, max: 0, items: [] },
    teamNUI: false,
    places: [
        { id: 'store_1', blipID: 59, name: 'store', level: 15, title: 'ﺕﻻﺎﻘﺒﻟﺍ', coordMain: { x: 162.2637, y: 6641.0112, z: 31.6051 } },
        { id: 'store_2', blipID: 59, name: 'store', level: 15, title: 'ﺕﻻﺎﻘﺒﻟﺍ', coordMain: { x: 1392.316, y: 3604.562, z: 34.975 } },
        {
            id: 'store_3',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: 1729.648, y: 6415.187, z: 35.025 },
            coordRobbery: { x: 1737.3494, y: 6419.3935, z: 34.0256, h: 243.7795, d: 1.8 }
        },
        {
            id: 'store_4',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: 1698.527, y: 4924.457, z: 42.052 },
            coordRobbery: { x: 1707.2043, y: 4919.2089, z: 41.0520, h: 235.2755, d: 1.8 }
        },
        {
            id: 'store_5',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: 1961.010, y: 3741.520, z: 32.329 },
            coordRobbery: { x: 1961.8813, y: 3750.1845, z: 31.3297, h: 300.4724, d: 1.8 }
        },
        {
            id: 'store_6',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: 2678.030, y: 3281.156, z: 55.228 },
            coordRobbery: { x: 2674.2329, y: 3289.1340, z: 54.2285, h: 330.9189, d: 1.8 }
        },
        {
            id: 'store_7',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: 1166.452, y: 2709.059, z: 38.142 },
            coordRobbery: { x: 1165.6351, y: 2714.2944, z: 37.1428, h: 90.7086, d: 1.8 }
        },
        {
            id: 'store_8',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: 547.701, y: 2670.276, z: 42.153 },
            coordRobbery: { x: 543.5659, y: 2662.5363, z: 41.1530, h: 97.5433, d: 1.8 }
        },
        {
            id: 'store_9',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: -1821.019, y: 792.936, z: 138.112 },
            coordRobbery: { x: -1828.6153, y: 798.7911, z: 137.1801, h: 82.2047, d: 1.8 }
        },
        {
            id: 'store_10',
            blipID: 59,
            name: 'store',
            level: 15,
            title: 'ﺕﻻﺎﻘﺒﻟﺍ',
            coordMain: { x: -3040.312, y: 585.718, z: 7.897 },
            coordRobbery: { x: -3048.6171, y: 588.4219, z: 6.8974, h: 18.1732, d: 1.8 }
        },
        { id: 'store_11', blipID: 59, name: 'store', level: 40, title: 'ﺕﻻﺎﻘﺒﻟﺍ', coordMain: { x: 1802.2550, y: 4505.2353, z: 32.0095 } },
        {
            id: 'yacht_1',
            blipID: 455,
            name: 'yacht',
            level: 25,
            title: 'ﻮﺘﻴﻟﺎﺑ ﺖﺨﻳ',
            coordMain: { x: -1378.1801, y: 6738.8437, z: 5.8754, d: 1.8 },
            coordRobbery: { x: -1427.0637 + 0.2, y: 6762.1845 - 0.015, z: 4.8754, h: 344.1574, d: 2 }
        },
        {
            id: 'bank_1',
            blipID: 431,
            name: 'bank',
            level: 40,
            title: 'ﻚﻨﺒﻟﺍ ﻉﺮﻓ',
            coordMain: { x: -113.3670, y: 6469.9252, z: 31.6219 },
            coordRobbery: { x: -104.6048, y: 6473.4433, z: 30.6253, h: 45.0000, d: 3.5, yaw: 45, endZ: 31.7863 },
            coordObject: { x: -105.1247, y: 6472.8652, z: 31.8219, h: 55.5196 },
            coordBomb: { x: -105.0548, y: 6473.7933, z: 31.8219 },
            rotation: { x: -107.1048, y: 6473.9433, z: 31.8253, pitch: -15, yaw: 131.9219 },
            direction: { x: -104.5714, y: 6472.1669, z: 30.6219, h: 43.5196 },
            firstStage: { type: 'first', x: -107.4725, y: 6475.4375, z: 30.6219, h: 62.5196 },
            secondStage: {
                type: 'second', x: -102.7516, y: 6476.6635, z: 30.6219, h: 314.6456,
                additional: { x: -102.4396, y: 6477.1049, z: 30.6267, h: 136.0629 }
            },
            timeCoord: { x: -104.4659, y: 6476.9936, z: 30, d: 4 }
        }
    ]
};
const empty = null;
;
const bankState = {
    trolleyID: 0, emptyTrolley: 0, maskID: 0, tickID: 0, tiemID: 0,
    trolleyScenes: { bag: 0, cash: 0, start: 0, middle: 0, third: 0 },
    items: state.places.filter(s => s.id.includes('bank'))
};
function startBankRobbery() {
    const place = state.places.find(p => p.id === state.team.id);
    const direction = place.direction;
    const coordObject = place.coordObject;
    bankState.trolleyScenes.bag = 0;
    bankState.tickID = 0;
    bankState.tiemID = 0;
    TaskGoToCoordAnyMeans(state.pedID, direction.x, direction.y, direction.z, 1.0, 0, false, 0, 0);
    const timeID = setTimeout(() => clearInterval(tickID), 25000);
    const tickID = setInterval(() => {
        if (!GetIsTaskActive(state.pedID, 224)) {
            SetEntityHeading(state.pedID, coordObject.h);
            SetEntityCoords(state.pedID, direction.x, direction.y, direction.z, false, false, false, false);
            TaskPlayAnim(state.pedID, 'anim@heists@ornate_bank@thermal_charge', 'thermal_charge', 8.0, 1.0, -1, 0, 0, false, false, false);
            const objectID = CreateObject(929047740, 0, 0, 0, true, true, false);
            AttachEntityToEntity(objectID, state.pedID, GetPedBoneIndex(state.pedID, 28422), -0.1, 0, -0.05, -100, -20, 0.0, true, true, false, true, 1, true);
            setTimeout(() => {
                DetachEntity(objectID, true, true);
                SetEntityCoords(objectID, coordObject.x, coordObject.y, coordObject.z, false, false, false, false);
                SetEntityHeading(objectID, direction.h);
                FreezeEntityPosition(objectID, true);
                ClearPedTasks(state.pedID);
                SetPtfxAssetNextCall('scr_ornate_heist');
                const effectID = StartParticleFxLoopedAtCoord('scr_heist_ornate_thermal_burn', place.coordBomb.x, place.coordBomb.y, place.coordBomb.z, 0.0, 0.0, 0.0, 1.0, false, false, false, false);
                emit('NewStart_Admin:methods-client', 'addBigAds', 'bankRobbery');
                setTimeout(() => {
                    emitNet('NewStart_Robbery:handleGeneral-server', 'openBankSafe', { id: place.id });
                    AddExplosion(coordObject.x, coordObject.y, coordObject.z, 0, 10, true, true, 2.5);
                    SetEntityRotation(place.objectID, place.rotation.pitch, 0, place.rotation.yaw, 0, true);
                    SetEntityCoords(place.objectID, place.rotation.x, place.rotation.y, place.rotation.z, false, false, false, false);
                    StopParticleFxLooped(effectID, false);
                    DeleteObject(objectID);
                    SetEntityVisible(bankState.emptyTrolley, false, false);
                    bankState.trolleyID = CreateObject(269934519, place.secondStage.additional.x, place.secondStage.additional.y, place.secondStage.additional.z, true, true, false);
                    SetEntityHeading(bankState.trolleyID, place.secondStage.additional.h);
                }, 15000);
            }, 4600);
            clearInterval(tickID);
            clearTimeout(timeID);
        }
    }, 50);
}
(async function createObjects() {
    const models = { emptyTrolley: 769923921, paleto: -1185205679, };
    RequestModel(1246356548);
    RequestModel(269934519);
    RequestModel(-1821801372);
    RequestModel(-944468481);
    RequestNamedPtfxAsset('scr_ornate_heist');
    RequestAnimDict('anim@heists@ornate_bank@thermal_charge');
    RequestAnimDict('anim@heists@ornate_bank@grab_cash');
    for (let model of Object.values(models)) {
        RequestModel(model);
        while (!HasModelLoaded(model))
            await Delay(1000);
    }
    for (let item of bankState.items) {
        const model = item.id === 'bank_1' ? models.paleto : 0;
        const robbery = item.coordRobbery;
        bankState.emptyTrolley = CreateObject(models.emptyTrolley, item.secondStage.additional.x, item.secondStage.additional.y, item.secondStage.additional.z, false, false, false);
        item.objectID = CreateObject(model, robbery.x, robbery.y, robbery.z, false, false, true);
        SetEntityHeading(bankState.emptyTrolley, item.secondStage.additional.h);
        SetEntityHeading(item.objectID, robbery.h);
        FreezeEntityPosition(bankState.emptyTrolley, true);
        FreezeEntityPosition(item.objectID, true);
        SetEntityInvincible(item.objectID, true);
    }
})();
setTick(() => {
    if ((!state.job.isOfficial || state.job.isVacation) &&
        state.team.id.includes('bank') &&
        state.progress !== 100 &&
        state.team.isLeader) {
        const find = bankState.items.find(b => b.id === state.team.id);
        if (GetEntityRotation(find.objectID, 0)[0] === 0)
            return;
        let current = null;
        for (let item of [find.firstStage, find.secondStage]) {
            if (!item ||
                (item.type === 'first' && (bankState.tiemID && !DoesEntityExist(bankState.maskID))) ||
                (item.type === 'second' && bankState.tickID && !DoesEntityExist(bankState.trolleyScenes.bag))) {
                continue;
            }
            ;
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.x, item.y, item.z, true);
            if (distance < 1.2 && ((item.type === 'first' && bankState.tiemID) || (item.type === 'second' && bankState.trolleyScenes.bag))) {
                current = item;
            }
            else if (distance < 10) {
                DrawMarker(1, item.x, item.y, item.z, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.5, 0.5, 0.25, 146, 46, 39, 100, false, false, 2, false, empty, empty, false);
                if (distance < 1.3)
                    current = item;
            }
        }
        if (current &&
            !Object.values(interfaces).some(i => i) && ((current.type === 'first' && !bankState.tiemID) ||
            current.type === 'second' && !bankState.tickID)) {
            if (IsControlJustPressed(0, 38)) {
                if (!GetPedDrawableVariation(state.pedID, 5)) {
                    return exports.NewStart_Notifications.showAttention('error', 'قم بإرتداء الحقيبة أولاً لبدء النهب!');
                }
                else if (current.type === 'first') {
                    const inventory = exports.NewStart_Inventory.staticData();
                    const maxKG = exports.NewStart_Inventory.info('maxKG');
                    const currentKG = exports.NewStart_Inventory.info('currentKG');
                    const space = inventory.find((i) => i.id === 83).space;
                    const weldKG = inventory.find((i) => i.id === 110).space;
                    if ((maxKG - (currentKG - weldKG)) < space) {
                        return exports.NewStart_Notifications.showAttention('error', `يجب إفراغ مساحة تخزينة من الحقيبة تقدر بـ${((space - weldKG) - (maxKG - currentKG)).toFixed(1)} كغم للنهب.`);
                    }
                    bankState.maskID = CreateObject(-1821801372, 0, 0, 0, true, true, false);
                    AttachEntityToEntity(bankState.maskID, state.pedID, GetPedBoneIndex(state.pedID, 12844), 0.115, 0.02, 0, 0, 90, 180, true, true, false, true, 1, true);
                    SetEntityCoords(state.pedID, current.x, current.y, current.z, false, false, false, false);
                    SetEntityHeading(state.pedID, current.h);
                    TaskStartScenarioInPlace(state.pedID, 'WORLD_HUMAN_WELDING', 0, true);
                    exports.NewStart_Tools.sendToNUI({ type: 'progress', status: true, level: 'high' });
                    bankState.tiemID = setTimeout(() => {
                        const random = [{ id: 83, name: 'سبيكة ذهب' }, { id: 82, name: 'ألماس' }][Math.floor(Math.random() * 2)];
                        ClearPedTasks(state.pedID);
                        DeleteObject(bankState.maskID);
                        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                        exports.NewStart_Inventory.addItem(JSON.stringify({ id: random.id, count: 1 }));
                        exports.NewStart_Inventory.removeItem(JSON.stringify({ id: 110, count: 1 }));
                        if (bankState.trolleyScenes.third)
                            emitNet('NewStart_Robbery:handleGeneral-server', 'isDone', { id: state.team.id });
                        else
                            exports.NewStart_Notifications.showAttention('success', `لقد وجد +1 ${random.name} في الداخل.`);
                    }, 59000);
                }
                else {
                    moneyLoot(current.additional);
                }
                SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            }
            else if (!state.entranceOpen) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen', text: 'لبدء النهب اضغط E أو ث.' }));
                state.entranceOpen = true;
            }
        }
        else if (state.entranceOpen) {
            state.entranceOpen = false;
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            if (interfaces.isDead) {
                if (current?.type === 'first' && bankState.tiemID) {
                    exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                    DeleteObject(bankState.maskID);
                    clearTimeout(bankState.tiemID);
                }
                else if (current?.type === 'second' && bankState.trolleyScenes.bag) {
                    exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                    for (let id of Object.values(bankState.trolleyScenes)) {
                        NetworkStopSynchronisedScene(id);
                    }
                    DeleteObject(bankState.trolleyScenes.bag);
                    DeleteObject(bankState.trolleyScenes.cash);
                }
            }
        }
    }
});
async function moneyLoot(location) {
    bankState.trolleyScenes.bag = CreateObject(-944468481, location.x, location.y, location.z, true, true, false);
    const COORD = GetEntityCoords(bankState.trolleyID, true);
    const ROTATION = GetEntityRotation(bankState.trolleyID, 0);
    exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '40s', status: true });
    NetworkRequestControlOfEntity(bankState.trolleyID);
    while (!NetworkHasControlOfEntity(bankState.trolleyID))
        await Delay(50);
    bankState.trolleyScenes.start = NetworkCreateSynchronisedScene(COORD[0], COORD[1], COORD[2], ROTATION[0], ROTATION[1], ROTATION[2], 2, false, false, 1065353216, 0, 1.3);
    NetworkAddPedToSynchronisedScene(state.pedID, bankState.trolleyScenes.start, "anim@heists@ornate_bank@grab_cash", "intro", 1.5, -4.0, 1, 16, 1148846080, 0);
    NetworkAddEntityToSynchronisedScene(bankState.trolleyScenes.bag, bankState.trolleyScenes.start, "anim@heists@ornate_bank@grab_cash", "bag_intro", 4.0, -8.0, 1);
    SetPedComponentVariation(state.pedID, 5, 0, 0, 0);
    NetworkStartSynchronisedScene(bankState.trolleyScenes.start);
    await Delay(1500);
    bankState.trolleyScenes.cash = CreateObject(1246356548, location.x, location.y, location.z, true, true, false);
    FreezeEntityPosition(bankState.trolleyScenes.cash, true);
    SetEntityInvincible(bankState.trolleyScenes.cash, true);
    SetEntityNoCollisionEntity(bankState.trolleyScenes.cash, state.pedID, false);
    SetEntityVisible(bankState.trolleyScenes.cash, false, false);
    AttachEntityToEntity(bankState.trolleyScenes.cash, state.pedID, GetPedBoneIndex(state.pedID, 60309), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, false, false, false, false, 0, true);
    const started = GetGameTimer();
    bankState.tickID = setTick(() => {
        if ((GetGameTimer() - started) < 37000) {
            if (HasAnimEventFired(state.pedID, GetHashKey('CASH_APPEAR')) && !IsEntityVisible(bankState.trolleyScenes.cash)) {
                SetEntityVisible(bankState.trolleyScenes.cash, true, false);
            }
            if (HasAnimEventFired(state.pedID, GetHashKey('RELEASE_CASH_DESTROY')) && IsEntityVisible(bankState.trolleyScenes.cash)) {
                SetEntityVisible(bankState.trolleyScenes.cash, false, false);
            }
        }
        else {
            clearTick(bankState.tickID);
            DeleteObject(bankState.trolleyScenes.cash);
        }
    });
    bankState.trolleyScenes.middle = NetworkCreateSynchronisedScene(COORD[0], COORD[1], COORD[2], ROTATION[0], ROTATION[1], ROTATION[2], 2, false, false, 1065353216, 0, 1.3);
    NetworkAddPedToSynchronisedScene(state.pedID, bankState.trolleyScenes.middle, "anim@heists@ornate_bank@grab_cash", "grab", 1.5, -4.0, 1, 16, 1148846080, 0);
    NetworkAddEntityToSynchronisedScene(bankState.trolleyScenes.bag, bankState.trolleyScenes.middle, "anim@heists@ornate_bank@grab_cash", "bag_grab", 4.0, -8.0, 1);
    NetworkAddEntityToSynchronisedScene(bankState.trolleyID, bankState.trolleyScenes.middle, "anim@heists@ornate_bank@grab_cash", "cart_cash_dissapear", 4.0, -8.0, 1);
    NetworkStartSynchronisedScene(bankState.trolleyScenes.middle);
    await Delay(37000);
    bankState.trolleyScenes.third = NetworkCreateSynchronisedScene(COORD[0], COORD[1], COORD[2], ROTATION[0], ROTATION[1], ROTATION[2], 2, false, false, 1065353216, 0, 1.3);
    NetworkAddPedToSynchronisedScene(state.pedID, bankState.trolleyScenes.third, "anim@heists@ornate_bank@grab_cash", "exit", 1.5, -4.0, 1, 16, 1148846080, 0);
    NetworkAddEntityToSynchronisedScene(bankState.trolleyScenes.bag, bankState.trolleyScenes.third, "anim@heists@ornate_bank@grab_cash", "bag_exit", 4.0, -8.0, 1);
    NetworkStartSynchronisedScene(bankState.trolleyScenes.third);
    DeleteObject(bankState.trolleyID);
    SetEntityVisible(bankState.emptyTrolley, true, false);
    await Delay(2000);
    DeleteObject(bankState.trolleyScenes.bag);
    exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
    exports.NewStart_Clothes.pedReset();
    if (bankState.maskID)
        emitNet('NewStart_Robbery:handleGeneral-server', 'isDone', { id: state.team.id });
    else
        exports.NewStart_Notifications.showAttention('success', 'ارجع واستخدم أداة اللحام مع المرحلة الأولي!');
}
onNet('NewStart_Robbery:handleMore-clinet', (type, data) => {
    data = JSON.parse(data);
    if (type === 'setTime') {
        for (let item of data) {
            const find = state.places.find(p => p.id === item.id);
            find.time = {
                current: item.lull,
                tickID: setInterval(() => {
                    if (!find.time?.current || find.time.current <= 0) {
                        clearInterval(find.time?.tickID);
                        find.isBlock = false;
                        delete find.time;
                    }
                    else {
                        find.time.current -= 1000;
                    }
                }, 1000)
            };
        }
    }
    else if (type === 'setBlips') {
        if (Array.isArray(data)) {
            for (let item of data) {
                if (item.shooting)
                    startShooting(item);
                else
                    setEntrance(item);
                if (item.isBlock)
                    state.places[state.places.findIndex(p => p.id === item.id)].isBlock = true;
            }
        }
        else if (data.type === 'entrance') {
            setEntrance(data);
            if (state.job.isPolice && state.job.isActive) {
                exports.NewStart_Notifications.sendAlert(`وصول بلاغ جديد بسرقة ${data.name} الآن`);
            }
        }
        else {
            startShooting(data);
            state.entranceOpen = false;
        }
    }
    else if (type === 'openBankSafe') {
        const find = state.places.find(p => p.id === data.id);
        SetEntityRotation(find.objectID, find.rotation.pitch, 0, find.rotation.yaw, 0, true);
        SetEntityCoords(find.objectID, find.rotation.x, find.rotation.y, find.rotation.z, false, false, false, false);
    }
    else if (type === 'isBlock') {
        state.places[state.places.findIndex(p => p.id === data.id)].isBlock = true;
    }
});
function setEntrance(data) {
    const find = state.places.find(p => p.id === data.id);
    if (find) {
        if (find.alert)
            return;
        find.entrance = data.text;
        find.alert = { type: 'normal', id: AddBlipForCoord(find.coordMain.x, find.coordMain.y, find.coordMain.z), tickID: 0 };
        SetBlipAsShortRange(find.alert.id, true);
        SetBlipSprite(find.alert.id, 161);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">ﺔﻗﺮﺳ ﺔﻴﻠﻤﻋ</font>`);
        EndTextCommandSetBlipName(find.alert.id);
        SetBlipScale(find.alert.id, 1.5);
        SetBlipColour(find.alert.id, 1);
        SetBlipAlpha(find.alert.id, 70);
    }
}
function startShooting(data) {
    const find = state.places.find(p => p.id === data.id);
    if (find) {
        if (data.text)
            find.entrance = data.text;
        const blip = AddBlipForRadius(find.coordMain.x, find.coordMain.y, find.coordMain.z, 120);
        SetBlipColour(blip, 1);
        SetBlipHighDetail(blip, true);
        SetBlipAlpha(blip, 80);
        if (find.alert) {
            RemoveBlip(find.alert.id);
            clearInterval(find.alert.tickID);
        }
        find.alert = {
            type: 'shooting',
            id: blip,
            tickID: setInterval(() => {
                SetBlipColour(blip, GetBlipColour(blip) === 38 ? 1 : 38);
            }, 500)
        };
    }
}
const starting = { police: { isLastVeh: false } };
const places = state.places.filter(s => s.coordRobbery);
setTick(() => {
    if (state.job.isPolice && state.job.isActive) {
        let current = null;
        for (let item of state.places) {
            if (!item.alert)
                continue;
            const { x, y, z } = item.coordMain;
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], x, y, z, true);
            if (distance < 30) {
                current = item;
                break;
            }
        }
        if (current && !exports.NewStart_Stores.method('runClose') && !Object.values(interfaces).some(i => i)) {
            const shooting = current.alert?.type === 'shooting';
            if (IsControlJustPressed(0, 303) && !shooting) {
                emitNet('NewStart_Robbery:handleGeneral-server', 'startShooting', { id: current.id });
            }
            else if (IsControlJustPressed(0, 246) && !state.team.id) {
                emitNet('NewStart_Robbery:handleGeneral-server', 'starting', { id: current.id });
            }
            else if (!state.entranceOpen) {
                if (state.team.id && shooting) {
                    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                }
                else {
                    starting.police.isLastVeh = IsPedInAnyVehicle(state.pedID, true);
                    SendNUIMessage(JSON.stringify({
                        type: 'entranceOpen', isPolice: true, disabled: shooting ? 'first' : state.team.id ? 'last' : '',
                        withVeh: starting.police.isLastVeh
                    }));
                }
                state.entranceOpen = true;
            }
            if (IsPedInAnyVehicle(state.pedID, true) !== starting.police.isLastVeh)
                state.entranceOpen = false;
        }
        else if (state.entranceOpen) {
            state.entranceOpen = false;
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
        }
    }
    else if (!state.job.isOfficial || state.job.isVacation) {
        let current = null;
        for (let item of places) {
            const { x, y, z, d } = (item.time && item.timeCoord ? item.timeCoord : item.coordRobbery);
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], x, y, z, true);
            if (distance < 125 && item.id !== state.team.id && item.alert?.type === 'shooting' && !item.alert.isMassage) {
                exports.NewStart_Notifications.sendAlert('أحذر منطقة استنفار ستعرض نفسك للخطر!');
                exports.NewStart_Tools.method('setZone', true, true);
                item.alert.isMassage = true;
            }
            else if (distance > 125 && item.alert?.isMassage) {
                exports.NewStart_Tools.method('setZone', false, true);
                item.alert.isMassage = false;
            }
            if (distance < 20) {
                const type = item.id.includes('store') ? 'store' : item.id.includes('bank') ? 'bank' : 'yacht';
                if (type === 'store' || type === 'yacht') {
                    DrawMarker(27, x, y, z + 0.02, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.5, 1.5, 0, 22, 24, 29, 130, false, false, 2, false, empty, empty, false);
                }
                if (distance < d) {
                    if (item.time?.current) {
                        const coord = type === 'store' || type === 'yacht' ? item.coordRobbery : item.timeCoord;
                        draw3DTime({ ...coord, time: item.time.current, scaleX: 0, scaleY: 0.05 });
                    }
                    else if (!item.isBlock) {
                        current = item;
                    }
                }
                break;
            }
        }
        if (!state.robberyLoading && !state.team.items.length) {
            if (current && !Object.values(interfaces).some(i => i)) {
                if (IsControlJustPressed(0, 38)) {
                    if (exports.NewStart_Admin.method('info').isComfort) {
                        return exports.NewStart_Notifications.showAttention('error', 'وقت راحة! لا يمكنك  بيع أي ممنوعات أو الإجرام');
                    }
                    else if (exports.NewStart_MainMenu.getLevel() < current.level) {
                        return exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${current.level} أولاً قبل القيام بذلك!`);
                    }
                    else if (!current.alert && !exports.NewStart_Taboos.method('drunkEffect', { isRun: true })) {
                        return exports.NewStart_Notifications.showAttention('error', 'أنت بصدد القيام بجريمة! يجب عليك شرب الخمر أو أي نوع من المخدرات.');
                    }
                    if (current.id.includes('bank') && !current.alert) {
                        const isHaveBomb = exports.NewStart_Inventory.info('currentItems').some((i) => i.id === 109);
                        const isHaveWeld = exports.NewStart_Inventory.info('currentItems').some((i) => i.id === 110);
                        if (!isHaveBomb || !isHaveWeld) {
                            return exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون معكك أداة تفجير الأبواب المصفحة وأداة اللحام!');
                        }
                        else if (!GetPedDrawableVariation(state.pedID, 5)) {
                            return exports.NewStart_Notifications.showAttention('error', 'قم بإرتداء الحقيبة أو توجه لمحل الملابس واشتري واحدة!');
                        }
                        exports.NewStart_Inventory.removeItem(JSON.stringify({ id: 109, count: 1 }));
                    }
                    emitNet('NewStart_Robbery:handleGeneral-server', 'starting', { id: current.id, isVacation: state.job.isVacation });
                    state.robberyLoading = true;
                    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                }
                else if (!state.entranceOpen) {
                    SendNUIMessage(JSON.stringify({ type: 'entranceOpen', text: current.entrance || 'لبدء السرقة اضغط E أو ث.' }));
                    state.entranceOpen = true;
                }
            }
            else if (state.entranceOpen) {
                state.entranceOpen = false;
                SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            }
        }
    }
});
const stores = state.places.filter(s => (s.id.includes('store') || s.id.includes('yacht')) && s.coordRobbery);
const yachts = state.places.filter(s => s.id.includes('yacht'));
(async function createObjects() {
    const model = 1089807209;
    RequestModel(model);
    while (!HasModelLoaded(model))
        await Delay(1000);
    for (let item of stores) {
        const robbery = item.coordRobbery;
        item.objectID = CreateObject(model, robbery.x, robbery.y, robbery.z, false, false, false);
        SetEntityHeading(item.objectID, robbery.h);
        FreezeEntityPosition(item.objectID, true);
        SetEntityInvincible(item.objectID, true);
    }
})();
on('onResourceStop', () => {
    for (let item of stores) {
        DeleteObject(item.objectID);
    }
});
setTick(() => {
    if ((!state.job.isOfficial || state.job.isVacation) &&
        (state.team.id.includes('store') || state.team.id.includes('yacht')) &&
        state.progress !== 100 &&
        state.team.isLeader) {
        const isTarget = stores.some(i => i.id === state.team.id && i.objectID === GetEntityPlayerIsFreeAimingAt(PlayerId())[1]);
        if (isTarget && !state.isProgress) {
            SendNUIMessage(JSON.stringify({ type: 'progress', show: true }));
            state.isProgress = true;
        }
        else if (!isTarget && state.isProgress) {
            SendNUIMessage(JSON.stringify({ type: 'progress', show: false }));
            state.isProgress = false;
        }
        if (isTarget && IsPedShooting(state.pedID)) {
            state.progress = state.progress + (GetWeaponDamage(GetSelectedPedWeapon(state.pedID), 0) / 100) + 0.10;
            state.progress = state.progress > 100 ? 100 : state.progress;
            if (state.progress === 100) {
                emitNet('NewStart_Robbery:handleGeneral-server', 'isDone', { id: state.team.id });
                SendNUIMessage(JSON.stringify({ type: 'progress', value: 0 }));
            }
            else {
                SendNUIMessage(JSON.stringify({ type: 'progress', value: state.progress }));
            }
        }
    }
    let isWater = false;
    for (let item of yachts) {
        const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.coordMain.x, item.coordMain.y, item.coordMain.z, true);
        if (distance < 100) {
            isWater = true;
            break;
        }
    }
    if (isWater && !state.isWater) {
        WaterOverrideSetStrength(0.4);
        state.isWater = true;
    }
    else if (state.isWater && !isWater) {
        WaterOverrideSetStrength(0.0);
        state.isWater = false;
    }
});
