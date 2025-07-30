"use strict";
setTick(() => {
    const pedID = PlayerPedId();
    const pedCoord = GetEntityCoords(pedID, true);
    for (let item of state.offices) {
        const { x, y, z } = item;
        const distance = GetDistanceBetweenCoords(pedCoord[0], pedCoord[1], pedCoord[2], x, y, z, true);
        if (distance < 15) {
            DrawMarker(1, x, y, z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.5, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
            if (distance < 0.6)
                state.current = item;
            else
                state.current = null;
            break;
        }
        else {
            state.current = null;
        }
    }
    if (state.current &&
        !IsEntityDead(pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            ClearPedTasks(pedID);
            ghostPlayers(true);
            SetNuiFocus(true, true);
            state.isOpen = true;
            DisplayRadar(false);
            exports.NewStart_HudSystem.closeUI();
            exports.NewStart_MainMenu.toggleAds(false);
            startConversation(pedID, state.current);
            SendNUIMessage(JSON.stringify({ type: 'openUI', info: state.requests }));
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
        case 'sendRequest':
            const level = exports.NewStart_MainMenu.method('validLevel', 'transfer');
            const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
            const time = Date.now();
            if (exports.NewStart_Bank.method('violations') >= 10) {
                exports.NewStart_Notifications.showAttention('error', 'يجب عليك سداد جميع المخالفات التي عليك أولا!');
                return cb('OK!');
            }
            else if (!level.isCan) {
                exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${level.need} أولاً لتقديم الطلبات!`);
                return cb('OK!');
            }
            else if (state.lastRequest > time) {
                exports.NewStart_Notifications.showAttention('error', 'تسنطيع إرسال طلب كل 15 دقيقة فقط!');
                return cb('OK!');
            }
            else if (data.info.price < 10000) {
                exports.NewStart_Notifications.showAttention('error', 'لا يمكن إرسال طلب بأقل من 10,000$');
                return cb('OK!');
            }
            else if (data.info.price > bank) {
                exports.NewStart_Notifications.showAttention('error', 'المبلغ المرفق في الطلب ليس لديك في حسابك البنكي!');
                return cb('OK!');
            }
            else if (data.info.type === 'house') {
                const house = exports.NewStart_RealEstate.method('findHouse', data.info.id.toUpperCase());
                const properties = exports.NewStart_RealEstate.method('getProperties');
                const min = house.price - (house.price * (25 / 100));
                const max = house.price + (house.price * (50 / 100));
                if (!house) {
                    exports.NewStart_Notifications.showAttention('error', 'رمز العقار غير صحيح برجاء التأكد أولاً!');
                    return cb('OK!');
                }
                else if (properties.length >= 2) {
                    exports.NewStart_Notifications.showAttention('error', 'لقد وصلت للحد الأقصي لامتلاك العقارات!');
                    return cb('OK!');
                }
                else if (data.info.price < min) {
                    exports.NewStart_Notifications.showAttention('error', `لا يمكن بيع هذا العقار بمبلغ أقل من ${min.toLocaleString()}$`);
                    return cb('OK!');
                }
                else if (data.info.price > max) {
                    exports.NewStart_Notifications.showAttention('error', `لا يمكن بيع هذا العقار بمبلغ أكبر من ${max.toLocaleString()}$`);
                    return cb('OK!');
                }
            }
            else if (data.info.type === 'jobVehicle') {
                const vehInfo = exports.NewStart_Employee.method('getVehInfo', data.info.extra);
                if (vehInfo) {
                    const currentJob = exports.NewStart_Factions.info()?.key;
                    const min = vehInfo.refPrice - (vehInfo.refPrice * (25 / 100));
                    const max = vehInfo.refPrice + (vehInfo.refPrice * (50 / 100));
                    if (vehInfo.nameJob !== currentJob) {
                        exports.NewStart_Notifications.showAttention('error', `يجب أن تكون في وظيفة ${vehInfo.nameAr} لطلب شراء هذه المركبة!`);
                        return cb('OK!');
                    }
                    else if (exports.NewStart_MainMenu.getLevel() < vehInfo.level) {
                        exports.NewStart_Notifications.showAttention('error', 'مستوي هذه المركبة أعلي من مستواك الحالي!');
                        return cb('OK!');
                    }
                    else if (!vehInfo?.count) {
                        exports.NewStart_Notifications.showAttention('error', 'لديك مثلها بالفعل لا يمكن الحصول عليها مرة أخرى!');
                        return cb('OK!');
                    }
                    else if (data.info.price < min) {
                        exports.NewStart_Notifications.showAttention('error', `لا يمكن بيع هذه المركبة بمبلغ أقل من ${min.toLocaleString()}$`);
                        return cb('OK!');
                    }
                    else if (data.info.price > max) {
                        exports.NewStart_Notifications.showAttention('error', `لا يمكن بيع هذه المركبة بمبلغ أكبر من ${max.toLocaleString()}$`);
                        return cb('OK!');
                    }
                    data.info.originalExtra = data.info.extra;
                    data.info.extra = vehInfo.hash;
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'لا يوجد مركبة وظيفية بهذا المعرف!');
                    return cb('OK!');
                }
            }
            emitNet('NewStart_TransferOwnership:handleGeneral-server', 'sendRequest', JSON.stringify({ ref: time, ...data.info }));
            break;
        case 'acceptRequest':
            const request = state.requests.find(r => r.ref === data.ref);
            state.requests = state.requests.filter(r => !(r.id === request.id && r.type === request.type));
            emitNet('NewStart_TransferOwnership:handleGeneral-server', 'acceptRequest', JSON.stringify(request));
            break;
        default: closeUI(false);
    }
    cb('OK!');
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_TransferOwnership:handleGeneral-client', (type, data) => {
    if (data)
        data = JSON.parse(data);
    if (type === 'setWaiting') {
        state.lastRequest = Date.now() + 900000;
        state.waits.push(data);
        exports.NewStart_Notifications.showAttention('success', 'تم إرسال الطلب للمالك بنجاح.');
    }
    else if (type === 'setRequest') {
        const price = data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const names = {
            house: 'العقار الذي يحمل الرمز',
            vehicle: 'المركبة الخاصة التي تحمل رقم اللوحة',
            jobVehicle: 'مركبة وظيفة التي لديها المعرف'
        };
        state.requests.push({ ...data });
        SendNUIMessage(JSON.stringify({ type: 'setData', info: state.requests }));
        if (data.type === 'jobVehicle')
            data.id = data.originalExtra;
        emit('NewStart_Phone:receiveMessage-client', JSON.stringify({
            number: '-2',
            text: `تم إرسال لك طلب شراء ${names[data.type]} "${data.id}" بمبلغ ${price}$ .. يرجي التوجه لمكتب نقل الممتلكات لمزيد من التفاصيل.`
        }));
    }
    else if (type === 'startConvert') {
        const index = state.waits.findIndex(w => w.ref === data.ref);
        if (index < 0)
            return;
        const find = state.waits[index];
        const nameType = find.type === 'house' ? 'العقار' : find.type === 'jobVehicle' ? 'مركبة الوظيفة' : 'المركبة';
        const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
        const info = { name: 'نقل الملكيات', price: find.price, from: 'bank' };
        if (bank >= info.price) {
            StatSetInt('BANK_BALANCE', bank - info.price, false);
        }
        else {
            return emit('NewStart_Phone:receiveMessage-client', JSON.stringify({ number: '-2', text: `فشل قبول طلب شراء ${nameType} لعدم وجود الرصيد الكافي للسداد.` }));
        }
        emitNet('NewStart:moneyDecrease', info);
        emitNet('NewStart_TransferOwnership:handleGeneral-server', 'convert', JSON.stringify({ ...find, serverID: data.serverID }));
        if (find.type === 'vehicle') {
            exports.NewStart_VehicleSystem.method('addPlate', find.id);
        }
        else if (find.type === 'jobVehicle') {
            find.id = find.originalExtra;
            exports.NewStart_Employee.method('zeroPriceVeh', find.originalExtra);
        }
        emit('NewStart_Phone:receiveMessage-client', JSON.stringify({
            number: '-2',
            text: `تم تحويل ملكية \n ${nameType} "${find.id}" لك الان بمبلغ ${find.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}$`
        }));
        state.waits = state.waits.filter(r => !(r.id === find.id && r.type === find.type));
    }
    else if (type === 'doneConvert') {
        if (data.type === 'house') {
            emitNet('NewStart_RealEstate:handleOffice-server', 'initial');
        }
        else if (data.type === 'vehicle') {
            emit('NewStart_VehicleSystem:removePrivate-client', JSON.stringify([data.id]), true);
        }
        else if (data.type === 'jobVehicle') {
            if (exports.NewStart_Employee.data().spawnIDs.some((i) => i.hash === data.extra)) {
                exports.NewStart_Employee.method('resetPriceVeh', data.extra);
            }
        }
        SendNUIMessage(JSON.stringify({ type: 'setData', info: state.requests }));
        emitNet('NewStart:giveMoney', { name: 'نقل الملكيات', amount: data.price - ((15 / 100) * data.price) });
        emit('NewStart_Phone:receiveMessage-client', JSON.stringify({
            number: '-2',
            text: `تم تحويل مبلغ ${data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}$ إلى حسابك البنكي.`
        }));
    }
    else if (type === 'resetRequests') {
        SendNUIMessage(JSON.stringify({ type: 'setData', info: state.requests }));
    }
});
(async function createEmployee() {
    const model = GetHashKey('csb_reporter');
    RequestModel(model);
    while (!HasModelLoaded(model))
        await Delay(1000);
    const pedID = CreatePed(1, model, -149.0769, 6287.9077, 30.4871, 313, false, false);
    FreezeEntityPosition(pedID, true);
    SetBlockingOfNonTemporaryEvents(pedID, true);
    SetEntityInvincible(pedID, true);
})();
function startConversation(pedID, { x, y, z, h }) {
    SetEntityCoords(pedID, x, y, z - 1, false, false, false, false);
    TaskAchieveHeading(pedID, h, 0);
    state.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", x + 1.6, y - 1, z + 1.1, -20, 0, 80, 50, false, 0);
    SetCamActive(state.cameraID, true);
    RenderScriptCams(true, true, 1000, true, true);
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
}
const state = {
    isOpen: false,
    runClose: false,
    current: null,
    cameraID: 0,
    lastRequest: 0,
    offices: [{ city: 'paleto', x: -147.6791, y: 6289.2529, z: 31.4871, h: 133.2283 }],
    waits: [],
    requests: [],
};
const empty = null;
