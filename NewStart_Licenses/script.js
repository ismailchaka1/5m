"use strict";
const card = {
    tickID: 0, coords: { x: 0, y: 0, z: 0 },
    switches: { identifier: 'بطاقة الهوية', weapons: 'رخصة الأسلحة', car: 'رخصة السيارات', motor: 'رخصة الدراجات', truck: 'رخصة الشاحنات' }
};
function giveCard(data) {
    const features = {
        titleSwitch: card.switches[data.type],
        type: data.type || 'identifier',
        customID: data.user.customID,
        info: data.user.character.identifier,
        date: new Date(),
        image: data.image
    };
    if (features.type === 'identifier') {
        const faction = exports.NewStart_Factions.info();
        if (faction) {
            features.job = `${faction.rankName} - ${faction.name.slice(-1)}`;
        }
        else if (exports.NewStart_Mechanical.method('info', 'isActive')) {
            features.job = 'ميكانيكي مركبات';
        }
        else if (exports.NewStart_Jobs.currentJob(true)) {
            features.job = 'عامل بوظيفة عامة';
        }
        else {
            features.job = 'عاطل';
        }
    }
    exports.NewStart_Inventory.addItem(JSON.stringify({ id: 28, count: 1, features }));
}
function openCardPreview(data) {
    clearTick(card.tickID);
    card.coords = data.coords;
    SendNUIMessage(JSON.stringify({ type: 'openUI', isCard: true, info: { ...data, isPreview: true } }));
    SetNuiFocus(false, false);
    exports.NewStart_Inventory.closeUI();
    card.tickID = setTick(() => {
        const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], data.coords[0], data.coords[1], data.coords[2], true);
        if (IsControlJustPressed(0, 178) || distance > 7.5) {
            clearTick(card.tickID);
            closeUI(true);
        }
    });
}
RegisterNuiCallbackType('NUI:card');
on('__cfx_nui:NUI:card', (data, cb) => {
    const players = GetActivePlayers().filter((i) => i !== PlayerId());
    if (!players.length) {
        exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي شخص قريب منك كفاية!');
        return cb('OK!');
    }
    if (data.type === 'nearby') {
        const nearby = players.map(id => {
            const [x, y, z] = GetEntityCoords(GetPlayerPed(id), true);
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], x, y, z, true);
            return { id, distance };
        }).sort((a, b) => a.distance - b.distance)[0];
        if (nearby.distance > 2.5) {
            exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي شخص قريب منك كفاية!');
        }
        else {
            emitNet('NewStart_Licenses:handleGeneral-server', 'sendCard', { serverIDs: [GetPlayerServerId(nearby.id)], data: { ...data.info, coords: state.pedCoord } });
            exports.NewStart_Notifications.showAttention('success', 'تم إظهار البطاقة لأقرب شخص إليك الآن!');
        }
    }
    else if (data.type === 'group') {
        const group = players.filter(id => {
            const [x, y, z] = GetEntityCoords(GetPlayerPed(id), true);
            return GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], x, y, z, true) < 2.5;
        }).map(id => GetPlayerServerId(id));
        if (!group.length) {
            exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي شخص قريب منك كفاية!');
        }
        else {
            emitNet('NewStart_Licenses:handleGeneral-server', 'sendCard', { serverIDs: group, data: { ...data.info, coords: state.pedCoord } });
            exports.NewStart_Notifications.showAttention('success', 'تم إظهار البطاقة لكل الأشخاص القريبين منك الآن!');
        }
    }
    cb('OK!');
});
setTick(() => {
    state.pedID = PlayerPedId();
    state.pedCoord = GetEntityCoords(state.pedID, true);
    let currentCoord = null;
    for (let item of state.coords) {
        const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.x, item.y, item.z, true);
        if (distance < 25) {
            DrawMarker(1, item.x, item.y, item.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.5, 0.5, 0.25, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
            if (distance < 0.6) {
                currentCoord = item;
                break;
            }
        }
    }
    if (currentCoord &&
        !IsPauseMenuActive() &&
        !IsEntityDead(state.pedID)) {
        if (IsControlJustPressed(0, 38)) {
            emitNet('NewStart_Licenses:handleGeneral-server', 'getRecords');
            state.picturing.currentID = currentCoord.picturingID;
            TaskAchieveHeading(state.pedID, currentCoord.h, 0);
            SendNUIMessage(JSON.stringify({
                type: 'openUI',
                info: {
                    ...state.prices,
                    disabled: !!currentCoord.disabled,
                    isViolations: exports.NewStart_Bank.method('violations') >= 10,
                    vipWeaponsTax: state.vipWeaponsTax
                }
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
        case 'removeRecord':
            const ref = state.records[data.property];
            const index = ref.findIndex(i => i._id === data.id);
            if ((Date.now() - new Date(ref[index].date).getTime()) < 604800000) {
                SendNUIMessage(JSON.stringify({ type: 'backToHome' }));
                exports.NewStart_Notifications.showAttention('error', 'يجب أن يمر أسبوع كامل علي السجل للتسوية!');
                return cb('OK!');
            }
            const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
            const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
            const info = { name: 'تسوية السجل', price: data.property === 'jail' ? 1000 : 3500, from: 'cash' };
            if (cash >= info.price) {
                StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
            }
            else if (bank >= info.price) {
                StatSetInt('BANK_BALANCE', bank - info.price, false);
                info.from = 'bank';
            }
            else {
                SendNUIMessage(JSON.stringify({ type: 'backToHome' }));
                exports.NewStart_Notifications.showAttention('error', `للأسف لا تملك المال الكافي تحتاج ${info.price.toLocaleString()}$ للتسوية!`);
                return cb('OK!');
            }
            if (index >= 0)
                ref.splice(index, 1);
            SendNUIMessage(JSON.stringify({ type: 'setRecords', info: state.records }));
            emitNet('NewStart:moneyDecrease', info);
            emitNet('NewStart_Licenses:handleGeneral-server', data.type, data);
            break;
        case 'startSession':
            if (data.action === 'vehicles' && !vehicles.checkpoints[vehicles.checkpoints.length - 1]?.isEnd) {
                exports.NewStart_Notifications.showAttention('error', 'لم تقم بإجراء أي اختبارات قيادة بعد في مركز رخص المركبات!');
                return cb('OK!');
            }
            if (state.picturing.tickID)
                exports.NewStart_Notifications.showAttention('error', 'لا يمكن استخدامها حتي الانتهاء من السابق!');
            else if (data.action === 'weapons' && state.isWeapons)
                exports.NewStart_Notifications.showAttention('error', 'أنت لديك رخصة للأسلحة القانونية بالفعل!');
            else
                startSession(data.action);
            closeUI(data.action === 'vehicles');
            break;
        case 'getPhoto':
            state.picturing.handle = RegisterPedheadshot(state.pedID);
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true });
            setTimeout(() => {
                const txd = GetPedheadshotTxdString(state.picturing.handle);
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                SendNUIMessage(JSON.stringify({ type: 'picturing', info: { image: `https://nui-img/${txd}/${txd}?v=${Date.now()}` } }));
            }, 5000);
            break;
        case 'upload':
            exports.NewStart_Notifications.showAttention('success', data.info.type === 'weapons' ? 'أنت لديك رخصة حمل الأسلحة القانونية الآن!' :
                data.info.type === 'identifier' ? 'لقد تم تجديد الهوية الوطنية الخاصة بك!' :
                    `اصبح لديك رخصة لقيادة "${vehicles.currentTest === 'car' ? 'السيارات' : vehicles.currentTest === 'motor' ? 'الدراجات' : 'الشاحنات'}" الآن!`);
            if (data.info.type === 'identifier' && data.info.name) {
                emitNet('NewStart:updateUser', { 'character.identifier.name': data.info.name });
                emit('NewStart_MainMenu:handleGeneral-client', 'updateUser', { name: data.info.name });
                emitNet('NewStart_Initialize:handleGeneral-server', 'updatePlayer', { serverID: GetPlayerServerId(PlayerId()), refName: 'name', value: data.info.name });
            }
            else if (data.info.type === 'vehicles') {
                data.info.type = vehicles.currentTest;
                delete vehicles.checkpoints[vehicles.checkpoints.length - 1].isEnd;
            }
            emitNet('NewStart_Licenses:handleGeneral-server', 'upload', JSON.stringify(data.info));
            state.picturing.isDone = true;
            closeUI(true);
            break;
        case 'notification':
            exports.NewStart_Notifications.showAttention(data.action, data.text);
            break;
        case 'screenToggle':
            if (data.isRecords)
                SendNUIMessage(JSON.stringify({ type: 'setRecords', info: state.records }));
            screenBlankToggle(data.value);
            break;
        default:
            closeUI(data.withNUI);
    }
    cb('OK!');
});
exports('method', (type, data, more) => {
    if (type === 'info') {
        return state[data];
    }
    else if (type === 'setState') {
        state[data] = more;
    }
    else if (type === 'openCard') {
        SendNUIMessage(JSON.stringify({ type: 'openUI', isCard: true, info: data }));
        exports.NewStart_Inventory.closeUI();
        SetNuiFocus(true, true);
    }
    else if (type === 'closeUI') {
        closeUI(true);
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_Licenses:handleGeneral-client', (type, data) => {
    if (data)
        data = JSON.parse(data);
    if (type === 'setRecords') {
        state.records = data;
        SendNUIMessage(JSON.stringify({ type: 'setRecords', info: data }));
    }
    else if (type === 'giveCard') {
        giveCard(data);
    }
    else if (type === 'openCard') {
        openCardPreview(data);
    }
    else if (type === 'startTest') {
        startTest();
    }
});
function closeUI(withNUI) {
    ClearPedTasks(state.pedID);
    clearTick(card.tickID);
    if (withNUI)
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    SetNuiFocus(false, false);
    state.isOpen = false;
    state.runClose = false;
    state.picturing.isOpen = false;
    state.picturing.runClose = false;
    if (state.picturing.cameraID) {
        DestroyCam(state.picturing.cameraID, true);
        RenderScriptCams(false, true, 1000, false, false);
        UnregisterPedheadshot(state.picturing.handle);
        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
        if (state.picturing.isDone) {
            RemoveBlip(state.picturing.blipID);
            clearTick(state.picturing.tickID);
            state.picturing.tickID = 0;
            state.picturing.isDone = false;
        }
    }
}
function screenBlankToggle(value) {
    if (value) {
        exports.NewStart_HudSystem.closeUI();
        exports.NewStart_Phone.noticesToggle(true);
        exports.NewStart_MainMenu.toggleAds(false);
        DisplayRadar(false);
    }
    else {
        exports.NewStart_Phone.noticesToggle(false);
        if (!exports.NewStart_MainMenu.isOpen()) {
            DisplayRadar(true);
            exports.NewStart_HudSystem.openHud();
            exports.NewStart_MainMenu.toggleAds(true);
        }
    }
}
function startSession(type) {
    const find = state.picturing.items.find(i => i.id === state.picturing.currentID);
    if (!find)
        return;
    if ((type === 'weapons' && !state.vipWeaponsTax) || type !== 'vehicles') {
        const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
        const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
        const info = { name: 'رسوم استخراج', price: state.prices[`price_${type}`], from: 'cash' };
        if (cash >= info.price) {
            StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
        }
        else if (bank >= info.price) {
            StatSetInt('BANK_BALANCE', bank - info.price, false);
            info.from = 'bank';
        }
        else {
            return exports.NewStart_Notifications.showAttention('error', `للأسف لا تملك المال الكافي للاستخراج ${info.price.toLocaleString()}$!`);
        }
        emitNet('NewStart:moneyDecrease', info);
    }
    exports.NewStart_Notifications.showAttention('success', find.message);
    state.picturing.type = `picturing_${type}`;
    state.picturing.blipID = AddBlipForCoord(find.x, find.y, find.z);
    SetBlipSprite(state.picturing.blipID, 184);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(`<font face="A9eelsh">${type === 'identifier' ? 'ﺔﻳﻮﻬﻟﺍ ﺪﻳﺪﺠﺗ' : type === 'weapons' ? 'ﺔﺤﻠﺳﻷﺍ ﺔﺼﺧﺭ' : 'ﺕﺎﺒﻛﺮﻤﻟﺍ ﺔﺼﺧﺭ'}</font>`);
    EndTextCommandSetBlipName(state.picturing.blipID);
    state.picturing.tickID = setTick(() => {
        let currentCoord = null;
        for (let item of state.picturing.items) {
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.x, item.y, item.z, true);
            if (distance < 25) {
                if (!state.picturing.isOpen)
                    DrawMarker(1, item.x, item.y, item.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.5, 0.5, 0.25, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
                if (distance < 0.8) {
                    currentCoord = item;
                    break;
                }
            }
        }
        if (currentCoord &&
            !IsPauseMenuActive() &&
            !IsEntityDead(state.pedID)) {
            if (IsControlJustPressed(0, 38)) {
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
                    return exports.NewStart_Notifications.showAttention('error', 'يجب إزالة أي شئ علي وجهك لالتقاط صورة جيدة!');
                }
                SetEntityCoords(state.pedID, currentCoord.x, currentCoord.y, currentCoord.z - 1, false, false, false, true);
                TaskAchieveHeading(state.pedID, currentCoord.h, 0);
                state.picturing.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", currentCoord.camX, currentCoord.camY, currentCoord.camZ, 0, 0, currentCoord.rotZ, 50, false, 0);
                SetCamActive(state.picturing.cameraID, true);
                RenderScriptCams(true, true, 1000, true, true);
                SendNUIMessage(JSON.stringify({ type: 'openUI', info: { page: state.picturing.type } }));
                SetNuiFocus(true, true);
                state.picturing.isOpen = true;
            }
            else if (!state.picturing.isOpen && !state.picturing.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
            }
            state.picturing.runClose = true;
        }
        else if (state.picturing.runClose) {
            closeUI(true);
        }
    });
}
const state = {
    vipWeaponsTax: false,
    isWeapons: false,
    isCar: false,
    isMotor: false,
    isTruck: false,
    prices: {
        price_identifier: 3000,
        price_weapons: 15000
    },
    pedID: 0,
    pedCoord: [],
    isOpen: false,
    runClose: false,
    coords: [
        { picturingID: 1, x: -446.4923, y: 6012.8569, z: 32.2791, h: 45.3543 },
        { picturingID: 2, x: 1852.8264, y: 3686.4526, z: 34.2674, h: 31.1811, disabled: true }
    ],
    picturing: {
        type: '',
        currentID: 0,
        blipID: 0,
        tickID: 0,
        isOpen: false,
        runClose: false,
        cameraID: 0,
        handle: null,
        isDone: false,
        items: [
            {
                id: 1,
                x: -449.7758,
                y: 6015.5209,
                z: 32.2791,
                h: 226.7716,
                camX: -448.9758,
                camY: 6014.7209,
                camZ: 32.7791,
                rotZ: 45,
                message: 'قم بالدخول للمكتب للتصوير لإلتقاط صورة من أجل إتمام الإجراءات!'
            }
        ]
    },
    records: { jail: [], records: [] }
};
const empty = null;
const vehicles = {
    isOpen: false, runClose: false, blipID: 0, currentTest: 'truck', timer: 0, botID: 0,
    stages: {
        engine: { prevent: false, done: false },
        seatbelt: { prevent: false, done: false },
        bot: { prevent: false, done: false },
        checkpoint: { prevent: false, done: false }
    },
    checkpoints: [
        { x: 1718.9011, y: 3780.0527, z: 34.1662 }, { x: 1701.4681, y: 3825.7319, z: 34.6717 }, { x: 1655.7098, y: 3853.5693, z: 34.5538 },
        { x: 1584.8044, y: 3789.2966, z: 34.0988 }, { x: 1551.1252, y: 3743.9340, z: 33.7788 }, { x: 1594.0878, y: 3682.97143, z: 33.7619 },
        { x: 1635.5076, y: 3613.1340, z: 35.6827 }, { x: 1673.0241, y: 3545.0637, z: 35.8176 }, { x: 1717.2395, y: 3468.2768, z: 38.9685 },
        { x: 1762.7341, y: 3386.5451, z: 39.0695 }, { x: 1834.7076, y: 3294.3823, z: 42.9113 }, { x: 1966.1142, y: 3294.3427, z: 45.7421 },
        { x: 2085.6000, y: 3277.1867, z: 45.9611 }, { x: 2194.7868, y: 3245.1823, z: 47.9663 }, { x: 2219.9736, y: 3331.2131, z: 45.8769 },
        { x: 2165.5913, y: 3449.6572, z: 45.5062 }, { x: 2098.2592, y: 3663.4416, z: 38.6146 }, { x: 2021.6966, y: 3762.8308, z: 32.5150 },
        { x: 1937.23510, y: 3758.5715, z: 32.5318 }, { x: 1841.6702, y: 3722.6638, z: 33.3575 },
        { x: 1772.2153, y: 3714.9494, z: 34.4696 }, { x: 1704.5406, y: 3765.2307, z: 34.5875 }
    ],
    coords: { x: 1700.1791, y: 3779.1122, z: 34.7054, h: 121.8897 },
    items: [
        { title: 'رخصة السيارات', name: 'car', price: 1200 },
        { title: 'رخصة الدراجات', name: 'motor', price: 500 },
        { title: 'رخصة الشاحنات', name: 'truck', price: 2000 },
    ]
};
vehicles.blipID = AddBlipForCoord(vehicles.coords.x, vehicles.coords.y, vehicles.coords.z);
SetBlipSprite(vehicles.blipID, 498);
SetBlipAsShortRange(vehicles.blipID, true);
BeginTextCommandSetBlipName("STRING");
AddTextComponentString(`<font face="A9eelsh">ﺕﺎﺒﻛﺮﻤﻟﺍ ﺔﺼﺧﺭ</font>`);
EndTextCommandSetBlipName(vehicles.blipID);
setTick(() => {
    let isCurrent = false;
    const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], vehicles.coords.x, vehicles.coords.y, vehicles.coords.z, true);
    if (distance < 25) {
        DrawMarker(1, vehicles.coords.x, vehicles.coords.y, vehicles.coords.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.25, 0.25, 0.1, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
        if (distance < 1.2)
            isCurrent = true;
    }
    if (isCurrent &&
        !IsPauseMenuActive() &&
        !IsEntityDead(state.pedID)) {
        if (IsControlJustPressed(0, 38)) {
            if (vehicles.isTest) {
                return exports.NewStart_Notifications.showAttention('error', 'اتبع قائمة التعليمات الجانبية لتوجيهك!');
            }
            else if (vehicles.checkpoints[vehicles.checkpoints.length - 1]?.isEnd) {
                const isNotHave = state[`is${vehicles.currentTest.charAt(0).toUpperCase() + vehicles.currentTest.slice(1)}`];
                if (!isNotHave)
                    return exports.NewStart_Notifications.showAttention('success', 'لقد قمت بإنهاء الاختبار توجه لأقرب مركز شرطة لاستخراج الرخصة');
            }
            screenBlankToggle(true);
            TaskAchieveHeading(state.pedID, vehicles.coords.h, 0);
            SendNUIMessage(JSON.stringify({ type: 'setVehiclesData', info: vehicles.items }));
            SendNUIMessage(JSON.stringify({ type: 'openUI', isVehicles: true }));
            SetNuiFocus(true, true);
            vehicles.isOpen = true;
        }
        else if (!vehicles.isOpen && !vehicles.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
        }
        vehicles.runClose = true;
    }
    else if (vehicles.runClose) {
        closeVehiclesUI();
    }
});
function closeVehiclesUI() {
    screenBlankToggle(false);
    ClearPedTasks(state.pedID);
    SendNUIMessage(JSON.stringify({ type: 'closeVehiclesUI' }));
    SetNuiFocus(false, false);
    vehicles.isOpen = false;
    vehicles.runClose = false;
}
RegisterNuiCallbackType('NUI:vehicles');
on('__cfx_nui:NUI:vehicles', (data, cb) => {
    switch (data.type) {
        case 'payment':
            const isHave = state[`is${data.name.charAt(0).toUpperCase() + data.name.slice(1)}`];
            if (isHave) {
                closeVehiclesUI();
                exports.NewStart_Notifications.showAttention('error', 'لديك نفس الرخصة بالفعل من قبل لا يمكنك الحصول عليها مجدداً!');
                return cb('OK!');
            }
            const find = vehicles.items.find(i => i.name === data.name);
            if (find) {
                const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
                const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
                const info = { name: find.title, price: find.price, from: 'cash' };
                if (cash >= info.price) {
                    StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                    exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
                }
                else if (bank >= info.price) {
                    StatSetInt('BANK_BALANCE', bank - info.price, false);
                    info.from = 'bank';
                }
                else {
                    closeVehiclesUI();
                    exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي لبدء اختبار الرخصة!');
                    return cb('OK!');
                }
                emitNet('NewStart:moneyDecrease', info);
                SendNUIMessage(JSON.stringify({ type: 'questionsVehicles', info: questionsNormal.sort(() => Math.random() - 0.5) }));
                vehicles.currentTest = find.name;
            }
            break;
        case 'startTest':
            vehicles.isTest = true;
            emitNet('NewStart_Licenses:handleGeneral-server', data.type);
            closeVehiclesUI();
            break;
        case 'playSound':
            if (data.value === 1) {
                PlaySoundFrontend(-1, 'Blip_Pickup', 'GTAO_Magnate_Boss_Modes_Soundset', false);
            }
            else if (data.value === 2) {
                PlaySoundFrontend(-1, 'Enter_1st', 'GTAO_Magnate_Boss_Modes_Soundset', false);
            }
            else if (data.value === 3) {
                PlaySoundFrontend(-1, 'Lose_1st', 'GTAO_Magnate_Boss_Modes_Soundset', false);
            }
            break;
        default:
            closeVehiclesUI();
    }
    cb('OK!');
});
const questionsNormal = [
    {
        title: 'ماذا يعني إشارة المرور الحمراء',
        answers: ['السير بحذر دون التوقف', 'التوقف والإنتظار حتى تصبح إشارة المرور خضراء', 'الاستمرار في السير دون توقف'],
        correctInx: 1
    },
    {
        title: 'كيف تتصرف إذا فقدت السيطرة على المركبة وانحرفت عن المسار الصحيح',
        answers: ['إبطاء السرعة ببطء والعودة إلى المسار الصحيح', 'القفز من المركبة قبل وقوع الحادث', 'زيادة السرعة للتحكم في الانحراف'],
        correctInx: 0
    },
    {
        title: 'ما هي الطريقة الصحيحة للتصرف عند سماع صفارة إنذار الإسعاف أو مركبة الشرطة',
        answers: ['تجاهل الصفارة والمتابعة في السير', 'زيادة السرعة للابتعاد عن المركبة الطارئة', 'التحرك جانباً للسماح لها بالمرور'],
        correctInx: 2
    },
    {
        title: 'ما هو السلوك الصحيح عند التقاطع الذي لا يحتوي على إشارات مرور',
        answers: ['السير بسرعة ثابتة', 'السير بسرعة أبطأ ومراقبة المناطق المحيطة', 'العبور بسرعة كبيرة'],
        correctInx: 1
    },
    {
        title: 'ما هو الحد الأقصى للسرعة على الطرق التي داخل وخارج المدينة',
        answers: ['80 كم/س داخل المدينة و140  كم/س خارج المدينة', '50 كم/س داخل المدينة و200  كم/س خارج المدينة', '80 كم/س داخل المدينة و200  كم/س خارج المدينة'],
        correctInx: 0
    },
    {
        title: 'ما هي الإجراءات الصحيحة للاستعداد للقيادة',
        answers: ['التحقق من الرسائل على هاتفك النقال', 'ربط حزام الأمان أولاً وتشغيل المحرك', 'إجراء المكالمات الصوتية أولاً'],
        correctInx: 1
    },
    {
        title: 'ماهو التصرف الصحيح عن رؤية شرطي المرور يقوم بالحجز على مركبتك',
        answers: ['اعتراضه وإفتعال مشكلة معه', 'محاولة الحصول على المركبة بدون لفت الانتباه', 'الانتظار حتي يقوم بتسلم المركبة للحجز ثم دفع رسوم فك الحجز'],
        correctInx: 2
    },
];
RequestModel(176137803);
RequestAnimDict('amb@world_human_clipboard@male@idle_a');
async function startTest() {
    SendNUIMessage(JSON.stringify({ type: 'openUI', isProgressVehicle: true }));
    const refVehicle = {
        car: { hash: -1177863319, coords: [1704.2769, 3764.9670, 33.6439, 317.4803] },
        motor: { hash: 4180675781, coords: [1704.2769, 3764.9670, 33.6439, 317.4803] },
        truck: { hash: 1945374990, coords: [1704.5406, 3765.2307, 34.5875, 320.3149] }
    }[vehicles.currentTest];
    RequestModel(refVehicle.hash);
    while (!HasModelLoaded(refVehicle.hash))
        await Delay(150);
    vehicles.vehID = CreateVehicle(refVehicle.hash, refVehicle.coords[0], refVehicle.coords[1], refVehicle.coords[2], refVehicle.coords[3], true, false);
    SetVehicleEngineOn(vehicles.vehID, false, false, true);
    SetVehicleFuelLevel(vehicles.vehID, 100);
    SetVehicleDirtLevel(vehicles.vehID, 0);
    SetVehicleNumberPlateText(vehicles.vehID, exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).customID);
    FreezeEntityPosition(vehicles.vehID, true);
    SetVehicleMaxSpeed(vehicles.vehID, 60 / 3.6);
    const botModel = GetHashKey('mp_f_freemode_01');
    RequestModel(botModel);
    while (!HasModelLoaded(botModel))
        await Delay(1000);
    vehicles.botID = CreatePed(1, botModel, 1694.5582, 3776.4790, 33.7222, 206.9291, false, false);
    vehicles.objectID = CreateObject(176137803, 1694.5582, 3776.4790, 33.7222, false, false, false);
    TaskPlayAnim(vehicles.botID, 'amb@world_human_clipboard@male@idle_a', 'idle_c', 8.0, 1.0, -1, 1, 1.0, false, false, false);
    AttachEntityToEntity(vehicles.objectID, vehicles.botID, GetPedBoneIndex(vehicles.botID, 60309), 0, 0, 0, 0, 0, 0, true, true, false, true, 1.0, true);
    SetPedHeadBlendData(vehicles.botID, 29, 29, 0, 29, 29, 0, 1.0, 1.0, 0, true);
    SetEntityInvincible(vehicles.botID, true);
    SetBlockingOfNonTemporaryEvents(vehicles.botID, true);
    FreezeEntityPosition(vehicles.botID, true);
    SetPedComponentVariation(vehicles.botID, 2, 4, 0, 0);
    SetPedComponentVariation(vehicles.botID, 3, 14, 0, 0);
    SetPedComponentVariation(vehicles.botID, 11, 536, 2, 0);
    SetPedComponentVariation(vehicles.botID, 8, 15, 0, 0);
    SetPedComponentVariation(vehicles.botID, 4, 64, 1, 0);
    SetPedComponentVariation(vehicles.botID, 6, 27, 0, 0);
    SetPedComponentVariation(vehicles.botID, 9, 58, 0, 0);
    vehicles.timer = 600000;
    vehicles.intervalTestID = setInterval(() => {
        vehicles.timer -= 1000;
        if (vehicles.timer <= 0)
            exitFromTest();
        else
            SendNUIMessage(JSON.stringify({ type: 'setProgressTime', value: new Date(vehicles.timer).toISOString().slice(14, 19) }));
    }, 1000);
    for (let key in vehicles.stages) {
        vehicles.stages[key].prevent = false;
        vehicles.stages[key].done = false;
    }
    for (let key in vehicles.checkpoints) {
        delete vehicles.checkpoints[key].createID;
        delete vehicles.checkpoints[key].isEnd;
        delete vehicles.checkpoints[key].blipID;
    }
    vehicles.lastDamge = 1000;
    vehicles.tickTestID = setTick(async () => {
        if (((vehicles.stages.checkpoint.done && !IsPedInAnyVehicle(state.pedID, true))) || IsEntityDead(state.pedID))
            exitFromTest();
        const currentDamage = GetEntityHealth(vehicles.vehID);
        if (currentDamage !== vehicles.lastDamge) {
            const min = 850;
            SendNUIMessage(JSON.stringify({ type: 'setProgress', info: { damage: (currentDamage - min) / (1000 - min) * 100 } }));
            vehicles.lastDamge = currentDamage;
        }
        else if (currentDamage < 850) {
            exports.NewStart_Notifications.showAttention('error', 'لفد فشل اختبار القيادة بسبب ضرر المركبة!');
            exitFromTest();
        }
        if (GetVehiclePedIsIn(state.pedID, false) !== vehicles.vehID || vehicles.stages.checkpoint.done) {
            return;
        }
        else if (vehicles.stages.bot.done && !IsPedInAnyVehicle(vehicles.botID, true)) {
            const coords = GetEntityCoords(vehicles.botID, true);
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], coords[0], coords[1], coords[2], true);
            if (distance > 20) {
                exports.NewStart_Notifications.showAttention('error', 'لفد فشل اختبار القيادة بسبب ابتعاد الشرطي عنك!');
                exitFromTest();
            }
            else if (!GetIsTaskActive(vehicles.botID, 160)) {
                TaskEnterVehicle(vehicles.botID, vehicles.vehID, -1, 0, 3, 1, 0);
            }
        }
        if (!vehicles.stages.engine.done) {
            if (!vehicles.stages.engine.prevent) {
                SendNUIMessage(JSON.stringify({ type: 'setProgress', info: { message: 'قم بتشغيل المحرك بالضغط على حرف J أو ت' } }));
            }
            vehicles.stages.engine.prevent = true;
            if (GetIsVehicleEngineRunning(vehicles.vehID)) {
                vehicles.stages.engine.done = true;
                SetVehicleDoorsShut(vehicles.vehID, true);
            }
        }
        else if (!vehicles.stages.seatbelt.done && vehicles.currentTest !== 'motor') {
            if (!vehicles.stages.seatbelt.prevent) {
                SendNUIMessage(JSON.stringify({ type: 'setProgress', info: { message: 'قم بربط حزام الأمان من z أو ئ' } }));
            }
            vehicles.stages.seatbelt.prevent = true;
            if (IsControlJustPressed(0, 20)) {
                if (GetPedInVehicleSeat(vehicles.vehID, -1) !== state.pedID) {
                    SetPedIntoVehicle(state.pedID, vehicles.vehID, -1);
                    exports.NewStart_VehicleSystem.method('setSeatBelt');
                }
                vehicles.stages.seatbelt.done = true;
            }
        }
        else if (!vehicles.stages.bot.done) {
            if (!vehicles.stages.bot.prevent) {
                exports.NewStart_Tools.method('hasFocus', true);
                SendNUIMessage(JSON.stringify({ type: 'setProgress', info: { message: 'انتظر قدوم شرطي المرور إليك لبدء اختبار القيادة' } }));
                FreezeEntityPosition(vehicles.botID, false);
                DeleteObject(vehicles.objectID);
                TaskEnterVehicle(vehicles.botID, vehicles.vehID, -1, 0, 1, 1, 0);
            }
            vehicles.stages.bot.prevent = true;
            if (GetPedInVehicleSeat(vehicles.vehID, 0) === vehicles.botID) {
                FreezeEntityPosition(vehicles.vehID, false);
                exports.NewStart_Tools.method('hasFocus', false);
                vehicles.stages.bot.done = true;
            }
        }
        else if (!vehicles.stages.checkpoint.done) {
            if (!vehicles.stages.checkpoint.prevent) {
                SendNUIMessage(JSON.stringify({ type: 'setProgress', info: { message: 'تحرك الآن وقم بالتوجه للنقاط الصفراء على الخريطة' } }));
            }
            vehicles.stages.checkpoint.prevent = true;
            for (let index in vehicles.checkpoints) {
                const item = vehicles.checkpoints[index];
                const isCreate = Number.isInteger(item.createID);
                if (!isCreate && (vehicles.checkpoints[index - 1]?.isEnd || index == 0)) {
                    item.createID = CreateCheckpoint(47, item.x, item.y, item.z - 1.2, 0, 0, 0, 1.5, 255, 234, 146, 80, 0);
                }
                else if (isCreate && !item.blipID) {
                    item.blipID = AddBlipForCoord(item.x, item.y, item.z);
                    SetBlipRoute(item.blipID, true);
                }
                else if (item.createID && !item.isEnd) {
                    const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.x, item.y, item.z, true);
                    if (distance < 1.6) {
                        RemoveBlip(item.blipID);
                        DeleteCheckpoint(item.createID);
                        PlaySoundFrontend(-1, 'CHECKPOINT_AHEAD', 'HUD_MINI_GAME_SOUNDSET', false);
                        item.isEnd = true;
                    }
                }
                else if (item.isEnd && (parseInt(index) + 1) === vehicles.checkpoints.length) {
                    TaskLeaveVehicle(state.pedID, vehicles.vehID, 0);
                    exports.NewStart_Notifications.showAttention('success', 'لقد قمت بإنهاء الاختبار توجه لأقرب مركز شرطة لاستخراج الرخصة');
                    SendNUIMessage(JSON.stringify({ type: 'removeQuestions' }));
                    vehicles.stages.checkpoint.done = true;
                }
            }
        }
    });
}
function exitFromTest() {
    SendNUIMessage(JSON.stringify({ type: 'openUI', isProgressVehicle: false }));
    vehicles.isTest = false;
    DeletePed(vehicles.botID);
    DeleteObject(vehicles.objectID);
    clearInterval(vehicles.intervalTestID);
    clearTick(vehicles.tickTestID);
    for (let item of vehicles.checkpoints) {
        RemoveBlip(item.blipID);
        DeleteCheckpoint(item.createID);
    }
    if (vehicles.botID && !vehicles.stages.bot.done)
        exports.NewStart_Tools.method('hasFocus', false);
    vehicles.botID = 0;
    emitNet('NewStart:general-server', 'setBucket', 0);
    DeleteVehicle(vehicles.vehID);
}
