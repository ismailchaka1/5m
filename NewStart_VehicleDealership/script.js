"use strict";
const defaultColor = { id: 134, rgb: '255,255,255' };
const state = {
    current: null,
    isOpen: false,
    runClose: false,
    coords: [
        {
            id: 488, bot: 'a_f_y_business_04', type: 'normal', vehType: 'car', title: 'ﺕﺍﺭﺎﻴﺴﻟﺍ ﺽﺮﻌﻣ', x: -56.5979, y: -1098.5616, z: 25.4223, h: 23.20761,
            cam: { x: -43.4924, y: -1094.8218, z: 25.7013, h: 170, posX: -42.6924, posY: -1100.8218, posZ: 27.7013, rotX: -10, rotZ: 10 }
        },
        {
            id: 488, bot: 'g_m_m_armgoon_01', type: 'normal', vehType: 'motorcycle', title: 'ﺕﺎﺟﺍﺭﺪﻟﺍ ﺽﺮﻌﻣ', x: 1253.0392, y: 2707.7956, z: 37.00575, h: 91.6528,
            cam: { x: 1245.5045, y: 2713.3979, z: 37.4145, h: 160.1415, posX: 1246.1045, posY: 2710.2979, posZ: 37.9145, rotX: 0, rotZ: 10 }
        },
        {
            id: 488, bot: 's_m_m_autoshop_01', type: 'normal', vehType: 'truck', title: 'ﺕﺎﻨﺣﺎﺸﻟﺍ ﺽﺮﻌﻣ', x: -264.1811, y: 6048.8442, z: 30.8798, h: 53.3011,
            cam: { x: -269.9090, y: 6039.3076, z: 31.8250, h: 30.6351, posX: -277.9090, posY: 6045.3076, posZ: 32.8250, rotX: 0, rotZ: 235 }
        },
        {
            id: 43, bot: 's_m_m_autoshop_02', type: 'normal', vehType: 'plane', title: 'ﺕﺍﺮﺋﺎﻄﻟﺍ ﺽﺮﻌﻣ', x: 1742.9968, y: 3311.8015, z: 40.2235, h: 106.7398,
            cam: { x: 1730.6436, y: 3313.1179, z: 40.0023, h: 174.5486, posX: 1732.6436, posY: 3305.1179, posZ: 41.8023, rotX: 0, rotZ: 12 }
        },
        {
            id: 43, bot: 's_m_m_autoshop_02', type: 'normal', vehType: 'plane', title: 'ﺕﺍﺮﺋﺎﻄﻟﺍ ﺽﺮﻌﻣ', x: -1290.2592, y: -3374.4450, z: 12.9401, h: 244.5082,
            cam: { x: -1280.9548, y: -3378.8188, z: 12.2206, h: 310.6846, posX: -1277.0548, posY: -3371.8188, posZ: 15.5206, rotX: -10, rotZ: 150 }
        },
        {
            id: 780, bot: 'ig_money', type: 'normal', vehType: 'boat', title: 'ﺏﺭﺍﻮﻘﻟﺍ ﺽﺮﻌﻣ', x: 1437.8005, y: 3805.3034, z: 30.7458, h: 248.5228,
            cam: { x: 1452.7253, y: 3789.3093, z: 28.8798, h: 275.0031, posX: 1462.5253, posY: 3793.3093, posZ: 32.0798, rotX: -10, rotZ: 115 }
        },
    ],
    vehicles: [],
    cameraID: 0,
    vehSave: [],
    lastColor: defaultColor
};
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
const empty = null;
const categories = {
    car: [
        { name: 'classic', title: 'كلاسيك' },
        { name: 'classic_sport', title: 'ك سبورت' },
        { name: 'small', title: 'صغيرة' },
        { name: 'coupe', title: 'كوبيه' },
        { name: 'luxury', title: 'الفاخرة' },
        { name: 'off_road', title: 'اوف رود' },
        { name: 'sedan', title: 'سيدان' },
        { name: 'van', title: 'فان' },
        { name: 'sport', title: 'سبورت' },
        { name: 'super', title: 'سوبر' },
        { name: 'big', title: 'كبيرة' },
        { name: 'cargo40', title: 'حمولة 40' },
        { name: 'cargo60', title: 'حمولة 60' },
        { name: 'cargo80', title: 'حمولة 80' },
        { name: 'cargo120', title: 'حمولة 120' }
    ],
    motorcycle: [
        { name: 'sport', title: 'رياضية' },
        { name: 'cruiser', title: 'كروزر' },
        { name: 'dirt', title: 'ديرت' },
        { name: 'scooters', title: 'سكوترز' },
        { name: 'other', title: 'أخرى' }
    ],
    truck: [
        { name: 'head', title: 'الرأس' },
        { name: 'trailer', title: 'مقطورة' },
        { name: 'caravan', title: 'كرفان' },
        { name: 'bus', title: 'حافلة' },
        { name: 'other', title: 'أخرى' },
        { name: 'cargo200', title: 'حمولة 200' },
        { name: 'cargo250', title: 'حمولة 250' },
        { name: 'cargo350', title: 'حمولة 350' },
        { name: 'cargo520', title: 'حمولة 520' },
        { name: 'trailer250', title: 'مقطورة 250' },
        { name: 'trailer350', title: 'مقطورة 350' }
    ],
    plane: [
        { name: 'helicopters', title: 'المروحيات' },
        { name: 'turbo', title: 'التوربو' },
        { name: 'hydro', title: 'المائية' },
        { name: 'other', title: 'أخرى' }
    ],
    boat: [
        { name: 'jetski', title: 'جيت سكي' },
        { name: 'kayaks', title: 'الزوارق' },
        { name: 'luxury', title: 'الفاخرة' },
        { name: 'other', title: 'أخرى' }
    ]
};
const names = {
    truck: 'الشاحنات',
    motorcycle: 'المركبات',
    car: 'المركبات',
    boat: 'القوارب',
    plane: 'الطائرات'
};
function buyVehicle(data, isExternal = false) {
    if (!data)
        return;
    const faction = exports.NewStart_Factions.info();
    if (data.vehType === 'car' && !exports.NewStart_Licenses.method('info', 'isCar') ||
        data.vehType === 'truck' && !exports.NewStart_Licenses.method('info', 'isTruck') ||
        data.vehType === 'motorcycle' && !exports.NewStart_Licenses.method('info', 'isMotor')) {
        return exports.NewStart_Notifications.showAttention('error', `يجب ان تحصل على رخصة القيادة أولاً الخاصة بهذا النوع!`);
    }
    else if (exports.NewStart_MainMenu.getLevel() < data.level) {
        return exports.NewStart_Notifications.showAttention('error', `تحتاج الوصول أولا لمستوي ${data.level} للحصول علي هذه المركبة!`);
    }
    else if (data.type !== 'faction' && exports.NewStart_VehicleSystem.method('info', 'plates').length >= 15) {
        return exports.NewStart_Notifications.showAttention('error', 'لا يمكن امتلاك المزيد من المركبات للوصول للعدد الاقصي للامتلاك!');
    }
    else if (data.type === 'faction' && !exports.NewStart_Employee.method('getVehInfo', data.hash, true).count) {
        return exports.NewStart_Notifications.showAttention('error', 'لديك مثلها بالفعل لا يمكن الحصول عليها مرة أخرى!');
    }
    else if (data.type === 'faction' && !faction) {
        return;
    }
    const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
    const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
    const info = { name: isExternal ? 'شراء مركبة' : 'معرض المركبات', from: 'cash', price: data.price };
    if (cash >= info.price) {
        StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
        exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
    }
    else if (bank >= info.price) {
        StatSetInt('BANK_BALANCE', bank - info.price, false);
        info.from = 'bank';
    }
    else {
        return exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي للشراء!');
    }
    if (data.type === 'faction') {
        exports.NewStart_Employee.method('zeroPriceVeh', data.hash);
        emitNet('NewStart:moneyDecrease', info);
        emitNet('NewStart_Factions:general-server', JSON.stringify({ type: 'vehicle', jobID: faction.id, hash: data.hash }));
    }
    else {
        emitNet('NewStart_VehicleDealership:payment-server', JSON.stringify({
            vehicle: { type: data.type, name: `${data.name} ${data.release}`, hash: data.hash },
            money: info
        }));
    }
    exports.NewStart_Notifications.showAttention('success', data.type === 'faction' ?
        `تمت عملية الدفع يمكنك الذهاب لجراج الوظيفة لاستخدامها.` :
        `تمت عملية الدفع يمكنك الذهاب لاستدعاء ${names[data.vehType]} لاستخدامها.`);
}
(async function () {
    for (const item of state.coords) {
        RequestModel(item.bot);
        while (!HasModelLoaded(item.bot))
            await Delay(100);
        const pedID = CreatePed(1, item.bot, item.x, item.y, item.z, item.h, false, false);
        FreezeEntityPosition(pedID, true);
        SetBlockingOfNonTemporaryEvents(pedID, true);
        SetEntityInvincible(pedID, true);
        const blipID = AddBlipForCoord(item.x, item.y, item.z);
        SetBlipSprite(blipID, item.id);
        SetBlipAsShortRange(blipID, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">${item.title}</font>`);
        EndTextCommandSetBlipName(blipID);
    }
})();
setTick(() => {
    const pedID = PlayerPedId();
    const coords = GetEntityCoords(pedID, true);
    for (let item of state.coords) {
        const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, coords[0], coords[1], coords[2], true);
        if (distance < 2.5) {
            state.current = item;
            break;
        }
        else
            state.current = null;
    }
    if (state.current &&
        !IsPauseMenuActive() &&
        !IsPedInAnyVehicle(pedID, false) &&
        !IsEntityDead(pedID)) {
        if (IsControlJustPressed(0, 38)) {
            const vehicles = state.vehicles.filter(i => i.type === state.current.type && i.vehType === state.current.vehType);
            createLocalVehicle(state.current.cam.x, state.current.cam.y, state.current.cam.z, state.current.cam.h, vehicles[0].hash);
            SendNUIMessage(JSON.stringify({
                type: 'openUI',
                vehicles: vehicles.map((i, index) => ({ ...i, speed: parseInt(GetVehicleModelEstimatedMaxSpeed(i.hash) * 3.6) + 5, isActive: index === 0 })),
                categories: [{ name: "all", title: "الكل", isActive: true }, ...categories[state.current.vehType]].map(c => ({ ...c,
                    count: vehicles.filter(i => i.category === c.name).length
                }))
            }));
            state.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", state.current.cam.posX, state.current.cam.posY, state.current.cam.posZ, state.current.cam.rotX, 0, state.current.cam.rotZ, 60, false, 0);
            SetCamActive(state.cameraID, true);
            RenderScriptCams(true, true, 2000, true, true);
            exports.NewStart_Initialize.method('blankScreen', true);
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
        case 'changeVehicle':
            if (state.current)
                createLocalVehicle(state.current.cam.x, state.current.cam.y, state.current.cam.z, state.current.cam.h, data.hash);
            break;
        case 'changeColor':
            const color = data.info.rgb.split(',').map((v) => parseInt(v));
            state.lastColor = data.info;
            const vehID = state.vehSave[state.vehSave.length - 1];
            SetVehicleCustomPrimaryColour(vehID, color[0], color[1], color[2]);
            SetVehicleCustomSecondaryColour(vehID, color[0], color[1], color[2]);
            break;
        case 'buyNow':
            closeUI(true);
            buyVehicle(state.vehicles.find(i => i.id === data.info));
            break;
        default:
            closeUI(false);
    }
    cb('OK!');
});
onNet('NewStart_VehicleDealership:handleGeneral-client', (type, data) => {
    data = JSON.parse(data);
    if (type === 'initial') {
        state.vehicles = data.vehicles;
    }
});
onNet('NewStart_VehicleDealership:payment-client', (data) => {
    if (data.plate) {
        exports.NewStart_Inventory.addItem(JSON.stringify({ id: 27, count: 1, features: { plate: data.plate } }));
        exports.NewStart_VehicleSystem.method('addPlate', data.plate);
    }
    else {
        exports.NewStart_Notifications.showAttention('error', 'فشل النظام في تحويل المركبة لك يرجي التواصل معنا! (تم رد المبلغ)');
        StatSetInt('BANK_BALANCE', parseInt(StatGetInt(GetHashKey('BANK_BALANCE'), -1)[1] + data.price), false);
    }
});
async function createLocalVehicle(x, y, z, h, hash) {
    for (const id of state.vehSave)
        DeleteVehicle(id);
    if (state.vehSave.length >= 5)
        state.vehSave.splice(0, 1);
    RequestModel(hash);
    while (!HasModelLoaded(hash))
        await Delay(150);
    const find = state.vehicles.find(i => i.hash === hash);
    if (find) {
        const vehID = CreateVehicle(hash, x, y, (find.upCoordZ || 0) + z, h, false, false);
        const color = state.lastColor.rgb.split(',').map((v) => parseInt(v));
        state.vehSave.push(vehID);
        SetEntityCollision(vehID, false, false);
        SetVehicleCustomPrimaryColour(vehID, color[0], color[1], color[2]);
        SetVehicleCustomSecondaryColour(vehID, color[0], color[1], color[2]);
        SetVehicleEngineOn(vehID, false, false, false);
        SetVehicleDirtLevel(vehID, 0);
        SetEntityCanBeDamaged(vehID, false);
        FreezeEntityPosition(vehID, true);
        getMechanicalInfo(vehID);
    }
}
function getMechanicalInfo(vehID) {
    SetVehicleModKit(vehID, 0);
    const info = [];
    for (const item of exports.NewStart_Mechanical.method('getItems')) {
        if (item.type === 'normal') {
            const isPlaneBoat = item.name === 'wheel' && [14, 15, 16].includes(GetVehicleClass(vehID));
            info.push({ name: item.name, title: item.title, result: !isPlaneBoat && GetNumVehicleMods(vehID, item.mainID) ? 'yes' : 'no' });
        }
    }
    SendNUIMessage(JSON.stringify({ type: 'setMechanical', info: info.sort((a, b) => (a.result === 'yes') ? -1 : (b.result === 'yes') ? 1 : 0) }));
}
function closeUI(withNUI) {
    if (state.isOpen) {
        DestroyCam(state.cameraID, true);
        RenderScriptCams(false, false, 0, false, false);
        for (const id of state.vehSave)
            DeleteVehicle(id);
        state.vehSave = [];
        exports.NewStart_Initialize.method('blankScreen', false);
        state.lastColor = defaultColor;
        SetNuiFocus(false, false);
    }
    if (withNUI)
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    state.isOpen = false;
    state.runClose = false;
}
exports('getData', (name) => state[name]);
exports('method', (type, data) => {
    if (type === 'buyVehicle') {
        const find = state.vehicles.find(v => v.hash === data && v.type === 'job');
        if (find)
            buyVehicle(find, true);
    }
    else {
        if (state.isOpen)
            closeUI(true);
    }
});
