"use strict";
const state = {
    data: null,
    commercialPrice: 10000,
    licensePrice: 10000,
    tax: 14,
    pedID: 0,
    coords: [],
    isOpen: false,
    runClose: false,
    cameraID: 0,
    offices: [
        {
            x: -138.4127, y: 6296.4096, z: 31.5149, h: 45.3167,
            bot: { x: -139.9351, y: 6297.7348, z: 30.5149, h: 225.3379 },
            cam: { posX: -139.4127, posY: 6294.8096, posZ: 32.5149, rotZ: -5 }
        }
    ]
};
const empty = null;
onNet('NewStart_Business:handleGeneral-client', (type, data, more) => {
    data = JSON.parse(data);
    if (type === 'setCommercial') {
        state.data = data;
        if (!data.chart)
            data.chart = { labels: [], data: [] };
        if (data.licInfo.type)
            state.licensePrice = 0;
        state.commercialPrice = 0;
        data.log.reverse();
        exports.NewStart_MainMenu.method('setBusiness', { ...data, tax: state.tax });
        if (state.data?.licInfo.type === 'materials') {
            materialsOpenUI(true);
            if (more)
                SendNUIMessage(JSON.stringify({ type: 'materialsSetState', name: 'isRequest', info: false }));
        }
        console.log(data.licInfo);
    }
});
exports('method', (type, data) => {
    if (type === 'actions') {
        if (data.action === 'money') {
            handeleMoney(data);
        }
        else if (data.action === 'invite') {
        }
    }
    else if (type === 'materialsUpdate') {
        materialsOpenUI(true);
    }
});
setTick(() => {
    state.pedID = PlayerPedId();
    state.coords = GetEntityCoords(state.pedID, true);
    let officeCurr = null;
    for (let item of state.offices) {
        const { x, y, z } = item;
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], x, y, z, true);
        if (distance < 15) {
            if (!state.isOpen)
                DrawMarker(1, x, y, z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.5, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
            if (distance < 0.6) {
                officeCurr = item;
                break;
            }
        }
    }
    if (officeCurr && !IsEntityDead(state.pedID) && !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            const level = exports.NewStart_MainMenu.method('validLevel', 'business');
            if (!level.isCan) {
                return exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${level.need} أولاً لبدء الأعمال الخاصة!`);
            }
            ClearPedTasks(state.pedID);
            ghostPlayers(true);
            SetNuiFocus(true, true);
            state.isOpen = true;
            DisplayRadar(false);
            exports.NewStart_HudSystem.closeUI();
            exports.NewStart_MainMenu.toggleAds(false);
            startConversation(officeCurr);
            const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
            const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
            SendNUIMessage(JSON.stringify({
                type: 'openUI',
                info: {
                    license: {
                        isVeh: exports.NewStart_Parking.method('getItems').some((i) => i.hash === 'taco'),
                        isMoney: bank >= state.licensePrice || cash >= state.licensePrice,
                        price: state.licensePrice
                    },
                    commercialPrice: state.commercialPrice
                }
            }));
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
        case 'commercial':
            if (data.value.trim() !== exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).name) {
                exports.NewStart_Notifications.showAttention('error', 'لم تقم بكتابة اسمك الصحيح كما هو بالهوية في التوقيع!');
            }
            else {
                const status = handlePayment('إنشاء سجل تجاري', state.commercialPrice);
                if (status) {
                    exports.NewStart_Notifications.showAttention('success', 'لقد تم إنشاء سجل تجاري جديد متبقي الآن الرخصة!');
                    state.commercialPrice = 0;
                    emitNet('NewStart_Business:handleGeneral-server', 'crateCommercial');
                    return cb('SUCCESS!');
                }
                else
                    return cb('PRICE!');
            }
            break;
        case 'license':
            if (!exports.NewStart_Parking.method('getItems').some((i) => i.hash === 'taco'))
                return;
            const status = handlePayment('رخصة البقالة المتنقلة', state.licensePrice);
            if (status) {
                exports.NewStart_Notifications.showAttention('success', 'لقد حصلت على الرخصة يمكنك الآن مباشرة العمل!');
                emitNet('NewStart_Business:handleGeneral-server', 'smallStoreLic', { price: state.licensePrice });
                state.licensePrice = 0;
            }
            closeUI(true);
            break;
        case 'notification':
            exports.NewStart_Notifications.showAttention('error', data.text);
            break;
        default: closeUI(false);
    }
    cb('OK!');
});
const materials = { priceChangeName: 15000, isOpen: false, runClose: false, timeoutID_1: 0, timeoutID_2: 0 };
setTick(() => {
    const tacoClosest = GetClosestVehicle(state.coords[0], state.coords[1], state.coords[2], 15, 'taco', 70);
    let isCurrent = false;
    if (tacoClosest) {
        const index = GetEntityBoneIndexByName(tacoClosest, 'boot');
        const [x, y, z] = GetWorldPositionOfEntityBone(tacoClosest, index);
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], x, y, z - 2.1, true);
        DrawMarker(1, x, y, z - 2.1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.9, 1.9, 0.35, 45, 101, 167, 150, false, false, 2, false, empty, empty, false);
        if (distance < 1.85 && !IsPedInAnyVehicle(state.pedID, true))
            isCurrent = true;
    }
    if (isCurrent && !IsEntityDead(state.pedID) && !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            clearTimeout(materials.timeoutID_1);
            clearTimeout(materials.timeoutID_2);
            emitNet('NewStart_Business:handleGeneral-server', 'getStoreData', { id: tacoClosest ? GetVehicleNumberPlateText(tacoClosest) : null, type: tacoClosest ? 'vehicle' : 'store' });
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '3s', status: true, canMove: true });
            SendNUIMessage(JSON.stringify({ type: 'materialsCloseUI' }));
            materials.timeoutID_1 = setTimeout(() => {
                if (false) {
                }
            }, 3000);
            materials.timeoutID_2 = setTimeout(() => {
                if (true) {
                    exports.NewStart_Notifications.showAttention('error', 'فشل في فتح المتجر تأكد من الاتصال!');
                }
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                materials.timeoutID_2 = 0;
            }, 5000);
        }
        else if (IsControlJustPressed(0, 74) && getIsOwner(tacoClosest)) {
            SetNuiFocus(true, true);
            materials.isOpen = true;
            materials.runClose = true;
            materialsOpenUI();
        }
        else if (!materials.isOpen && !materials.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen', isOwner: getIsOwner(tacoClosest) }));
        }
        materials.runClose = true;
    }
    else if (materials.runClose) {
        materialsCloseUI(true);
    }
});
function getIsOwner(id) {
    if (state.data?.licInfo.subType === 'small-store') {
        return exports.NewStart_VehicleSystem.method('GetMyVehicles').some((i) => i.plate === GetVehicleNumberPlateText(id));
    }
}
function materialsOpenUI(isUpdate = false) {
    if (!materials.isOpen)
        return;
    const staticItems = exports.NewStart_Inventory.staticData();
    const itemsReshape = (data) => staticItems.filter((i) => data.some((c) => c.id === i.id)).map((i) => {
        const find = data.find((c) => c.id === i.id);
        return { _id: find._id, ...i, image: 'nui://NewStart_Inventory/ui_page/build/' + i.image, count: find.count, price: find.price || '', value: '' };
    });
    const items = [...itemsReshape(state.data.licInfo.items), ...Array(20 - state.data.licInfo.items.length).fill(null)];
    const storeType = state.data?.licInfo.subType.includes('store') ? 'normal' : state.data?.licInfo.subType;
    const storesRef = exports.NewStart_Stores.method('getItems', storeType);
    const invCurr = exports.NewStart_Inventory.info('currentItems').filter((i) => storesRef.some((s) => s.id === i.id));
    const inventory = itemsReshape(invCurr);
    SendNUIMessage(JSON.stringify({
        isUpdate, type: 'materialsOpenUI',
        subType: state.data?.licInfo.subType,
        money: state.data?.money,
        name: { title: state.data?.licInfo.name, price: materials.priceChangeName },
        employees: [], robberies: [], items, inventory
    }));
}
function materialsCloseUI(isNUI) {
    if (materials.isOpen)
        ClearPedTasks(state.pedID);
    if (isNUI)
        SendNUIMessage(JSON.stringify({ type: 'materialsCloseUI' }));
    SetNuiFocus(false, false);
    materials.isOpen = false;
    materials.runClose = false;
    if (materials.timeoutID_2) {
        clearTimeout(materials.timeoutID_1);
        clearTimeout(materials.timeoutID_2);
        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
    }
}
RegisterNuiCallbackType('NUI:materials');
on('__cfx_nui:NUI:materials', (data, cb) => {
    switch (data.type) {
        case 'changeName':
            if (materials.priceChangeName > state.data?.money) {
                exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في رأس المال!');
                return cb('failed');
            }
            emitNet('NewStart_Business:handleGeneral-server', 'money', { type: 'money', action: 'withdraw', name: 'other', value: materials.priceChangeName, reason: 'تغيير الاسم التجاري' });
            emitNet('NewStart_Business:handleGeneral-server', 'changeInfo', { 'licInfo.name': data.value });
            exports.NewStart_Notifications.showAttention('success', 'لقد تم تغيير اسم المتجر بنجاح وسحب المبلغ!');
            break;
        case 'addItem':
            const item = exports.NewStart_Inventory.info('currentItems').find((i) => i._id === data._id);
            if (item) {
                if (data.value > item.count) {
                    exports.NewStart_Notifications.showAttention('error', 'ليس لديك هذه الكمية من هذا المنتج للإضافة!');
                    SendNUIMessage(JSON.stringify({ type: 'materialsSetState', name: 'isRequest', info: false }));
                }
                else {
                    exports.NewStart_Inventory.removeItem(JSON.stringify({ id: item.id, count: data.value || item.count }));
                    emitNet('NewStart_Business:handleGeneral-server', 'items', { action: 'add', ...item });
                }
            }
            break;
        case 'removeItem':
            const find = state.data?.licInfo.items.find(i => i._id === data.value);
            if (find) {
                const staticItems = exports.NewStart_Inventory.staticData();
                const currKG = exports.NewStart_Inventory.info('currentKG');
                const maxKG = exports.NewStart_Inventory.info('maxKG');
                if (((staticItems.find((i) => i.id === find.id).space * find.count) + currKG) > maxKG) {
                    exports.NewStart_Notifications.showAttention('error', 'الحقيبة الشخصية لا يمكنها استعاب كمية هذا المنتج!');
                }
                else {
                    emitNet('NewStart_Business:handleGeneral-server', 'items', { action: 'remove', ...find });
                    exports.NewStart_Inventory.addItem(JSON.stringify({ id: find.id, count: find.count }));
                    exports.NewStart_Notifications.showAttention('success', 'تمت إزالة المنتج والإضافة للحقيبة الشخصية!');
                }
            }
            break;
        case 'moneyRed':
            const moneyRed = exports.NewStart_Inventory.info('currentItems').find((i) => i.id === 106)?.count;
            if (moneyRed < data.value || !moneyRed) {
                exports.NewStart_Notifications.showAttention('error', 'ليس لديك الأموال الغير شرعية الكافية لإتمام التحويل!');
            }
            else {
                const value = parseInt((80 / 100) * data.value);
                exports.NewStart_Inventory.removeItem(JSON.stringify({ id: 106, count: data.value }));
                emitNet('NewStart_Business:handleGeneral-server', 'money', { type: 'money', action: 'deposit', name: 'capital_1', value });
                exports.NewStart_Notifications.showAttention('success', `لقد تم إضافة مبلغ ${value.toLocaleString()}$ لرأس مال النشاط التجاري`);
                console.log(data.value, value);
            }
            break;
        case 'savePrices':
            const items = data.info.filter((i) => i);
            for (let item of items)
                if (!item.price || item.price === '0')
                    delete item.price;
            emitNet('NewStart_Business:handleGeneral-server', 'items', { action: 'updateAll', items });
            exports.NewStart_Notifications.showAttention('success', 'تم تطبيق جميع الأسعار داخل المتجر!');
            break;
        default:
            materialsCloseUI(false);
    }
    cb('OK!');
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
(async function createEmployee() {
    const model = 'a_f_y_business_04';
    RequestModel(model);
    while (!HasModelLoaded(model))
        await Delay(1000);
    for (const item of state.offices) {
        const botID = CreatePed(1, model, item.bot.x, item.bot.y, item.bot.z, item.bot.h, false, false);
        FreezeEntityPosition(botID, true);
        SetBlockingOfNonTemporaryEvents(botID, true);
        SetEntityInvincible(botID, true);
    }
})();
function ghostPlayers(isActive) {
    const transparency = isActive ? 50 : 255;
    for (let id of GetActivePlayers().filter((i) => i !== PlayerId())) {
        SetEntityAlpha(GetPlayerPed(id), transparency, false);
    }
}
function startConversation(data) {
    SetEntityCoords(state.pedID, data.x, data.y, data.z - 1, false, false, false, false);
    TaskAchieveHeading(state.pedID, data.h, 0);
    state.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", data.cam.posX, data.cam.posY, data.cam.posZ, -20, 0, data.cam.rotZ, 50, false, 0);
    SetCamActive(state.cameraID, true);
    RenderScriptCams(true, true, 1000, true, true);
}
function handlePayment(name, price) {
    const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
    const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
    const info = { name, price, from: 'cash' };
    if (cash >= price) {
        StatSetInt('MP0_WALLET_BALANCE', cash - price, false);
        exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -price }));
    }
    else if (bank >= price) {
        StatSetInt('BANK_BALANCE', bank - price, false);
        info.from = 'bank';
    }
    else {
        exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في حسابك البنكي أو الحقيبة!');
        return false;
    }
    emitNet('NewStart:moneyDecrease', info);
    return true;
}
function handeleMoney(data) {
    let name = 'capital_2';
    if (data.type === 'deposit') {
        const info = { name: 'إيداع لرأس المال', price: data.value, from: 'bank' };
        const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
        if (bank < info.price) {
            exports.NewStart_MainMenu.closeUI(true);
            return exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في حسابك البنكي!');
        }
        StatSetInt('BANK_BALANCE', bank - info.price, false);
        emitNet('NewStart:moneyDecrease', info);
        name = 'capital_1';
    }
    emitNet('NewStart_Business:handleGeneral-server', 'money', { type: 'money', action: data.type, name, value: data.value });
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
}
