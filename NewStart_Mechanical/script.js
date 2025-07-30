"use strict";
on('playerSpawned', () => {
    if (state.isFirst) {
        if (state.login.isIn)
            startOutfit();
        createBlip(498, 'ﻲﻜﻴﻧﺎﻜﻴﻤﻟﺍ ﺔﺼﺧﺭ', [state.coords.x, state.coords.y, state.coords.z]);
        for (let item of state.places)
            createBlip(779, item.name, item.coords);
        state.isFirst = false;
    }
});
setTick(() => {
    state.pedID = PlayerPedId();
    state.pedCoords = GetEntityCoords(state.pedID, true);
    const distance = GetDistanceBetweenCoords(state.pedCoords[0], state.pedCoords[1], state.pedCoords[2], state.coords.x, state.coords.y, state.coords.z, true);
    if (distance < 15) {
        DrawMarker(1, state.coords.x, state.coords.y, state.coords.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.2, 1.2, 0.25, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
    }
    if (distance < 0.7 &&
        !IsEntityDead(state.pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            TaskAchieveHeading(state.pedID, state.coords.h, 0);
            SendNUIMessage(JSON.stringify({
                type: 'openUI', typeUI: 'license', isHave: state.isActive, price: state.priceLicense, priceVeh: state.priceVehicle
            }));
            SetNuiFocus(true, true);
            state.isOpen = true;
        }
        else if (!state.isOpen && !state.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
        }
        state.runClose = true;
    }
    else if (state.runClose)
        closeUI(true);
});
setTick(() => {
    if (!state.isActive)
        return;
    const distance = GetDistanceBetweenCoords(state.pedCoords[0], state.pedCoords[1], state.pedCoords[2], state.login.coords[0], state.login.coords[1], state.login.coords[2], true);
    if (distance < 15) {
        DrawMarker(20, state.login.coords[0], state.login.coords[1], state.login.coords[2], 0.0, 0.0, 0.0, 0.0, 180, state.login.coords[3], 0.6, 0.6, 0.4, 45, 101, 167, 100, false, false, 2, false, empty, empty, false);
    }
    if (distance < 0.7 &&
        !IsEntityDead(state.pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            TaskPlayAnim(state.pedID, 'missmic4', 'michael_tux_fidget', 8.0, -8.0, -1, 51, 0, false, false, false);
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true });
            setTimeout(() => {
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                ClearPedTasks(state.pedID);
                if (!state.login.isIn) {
                    exports.NewStart_Notifications.showAttention('success', 'انت الآن يمكنك بدء العمل ويمكنك العودة للراحة!');
                    startOutfit();
                    state.login.isIn = true;
                    emitNet('NewStart:updateUser', { 'job.isIn': true });
                }
                else {
                    exports.NewStart_Clothes.pedReset();
                    state.login.isIn = false;
                    emitNet('NewStart:updateUser', { 'job.isIn': false });
                }
                if (state.login.runClose)
                    SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
            }, 5000);
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
        }
        else if (!state.login.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
        }
        state.login.runClose = true;
    }
    else if (state.login.runClose) {
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
        state.login.runClose = false;
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    if (data.type === 'apply') {
        const level = exports.NewStart_MainMenu.method('validLevel', 'mechanical');
        if (!level.isCan) {
            exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${level.need} أولاً للحصول على الرخصة!`);
            closeUI(false);
            return cb('OK!');
        }
        else if (exports.NewStart_Factions.info() || exports.NewStart_Jobs.currentJob().type) {
            exports.NewStart_Notifications.showAttention('error', 'يجب الاستقالة من عملك الحالي أولاً!');
            closeUI(false);
            cb('OK!');
            return;
        }
        emitNet('NewStart_Mechanical:handleGeneral-server', data.type);
    }
    if (data.type === 'waiver') {
        if (!state.isActive)
            return;
        if (state.login.isIn) {
            exports.NewStart_Clothes.pedReset();
            state.login.isIn = false;
        }
        RemoveBlip(state.login.blipID);
        exports.NewStart_HudSystem.updateJob({});
        emitNet('NewStart:updateUser', { job: {} });
        emitNet('NewStart_Mechanical:handleGeneral-server', data.type);
        state.isActive = false;
        closeUI(false);
    }
    else if (data.type === 'invoice') {
        handleInvoice(data.info);
    }
    else if (data.type === 'buyVehicle') {
        if (data.isActive) {
            exports.NewStart_HudSystem.closeUI();
            exports.NewStart_Phone.noticesToggle(true);
            exports.NewStart_MainMenu.toggleAds(false);
            DisplayRadar(false);
        }
        else if (data.noActive) {
            exports.NewStart_Phone.noticesToggle(false);
            if (!exports.NewStart_MainMenu.isOpen()) {
                DisplayRadar(true);
                exports.NewStart_HudSystem.openHud();
                exports.NewStart_MainMenu.toggleAds(true);
            }
        }
        else {
            if (!state.isActive)
                exports.NewStart_Notifications.showAttention('error', 'يجب الحصول على رخصة الميكانيكي أولاً!');
            else
                exports.NewStart_VehicleDealership.method('buyVehicle', data.id === 1 ? 'towtruck' : 'flatbed');
            closeUI(false);
        }
    }
    else {
        closeUI(false);
    }
    cb('OK!');
});
exports('method', (type, data) => {
    if (type === 'info') {
        return { isPanel: state.isPanel, isActive: state.isActive, isIn: state.login.isIn }[data];
    }
    else if (type === 'openPanel') {
        openPanel();
    }
    else if (type === 'setFeatures') {
        SetVehicleModKit(data.vehID, 0);
        for (let name in data.items) {
            const find = itemsRef.find(i => i.name === name);
            if (find && data.items[name] !== -1) {
                setVehicleFeature({ type: find.type, name, mainID: find.mainID, value: data.items[name] }, data.vehID);
            }
        }
    }
    else if (type === 'washKit') {
        return washKit();
    }
    else if (type === 'vehicleFlip') {
        vehicleFlip();
    }
    else if (type === 'getItems') {
        return itemsRef;
    }
    else {
        if (state.current.ref && !state.isActive) {
            emitNet('NewStart_Mechanical:handleGeneral-server', 'cancelInvoice', JSON.stringify({ ref: state.current.ref, fromMechanical: false, playerID: state.current.ownerID }));
        }
        closeUI(true);
    }
});
function handleInvoice(data) {
    const pedID = PlayerPedId();
    const coords = GetEntityCoords(pedID, true);
    if (data.type === 'send') {
        let errorType = 'notFound';
        for (let id of GetActivePlayers()) {
            const targetPed = GetPlayerPed(id);
            const [x, y, z] = GetEntityCoords(targetPed, true);
            const distance = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);
            if (GetPlayerServerId(id) === state.current.ownerID) {
                if (distance > 10)
                    errorType = 'distance';
                else if (IsEntityPlayingAnim(targetPed, 'random@dealgonewrong', 'idle_a', 1))
                    errorType = 'dead';
                else
                    errorType = '';
                break;
            }
        }
        if (errorType) {
            exports.NewStart_Notifications.showAttention('error', errorType === 'dead' ?
                'صاحب المركبة في حالة حرجة لا يمكنه استقبال أي فواتير!' :
                'يجب أن يكون صاحب المركبة قريب بما يكفي لإرسال الفاتورة!');
            SendNUIMessage(JSON.stringify({ type: 'setInvoice', info: { waiting: false } }));
        }
        else {
            emitNet('NewStart_Mechanical:handleGeneral-server', 'sendInvoice', JSON.stringify({
                ref: state.current.ref,
                ownerID: state.current.ownerID,
                price: data.price,
                changes: data.changes
            }));
        }
    }
    else if (data.type === 'accept') {
        const info = { name: 'فاتورة الميكانيكي', price: state.current.offer, from: 'cash' };
        if (info.price) {
            const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
            const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
            if (cash >= info.price) {
                StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
            }
            else if (bank >= info.price) {
                StatSetInt('BANK_BALANCE', bank - info.price, false);
                info.from = 'bank';
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
                emitNet('NewStart_Mechanical:handleGeneral-server', 'cancelInvoice', JSON.stringify({ ref: state.current.ref, fromMechanical: false, playerID: state.current.ownerID }));
                return closeUI(true);
            }
            emitNet('NewStart:moneyDecrease', info);
        }
        emitNet('NewStart_Mechanical:handleGeneral-server', 'acceptInvoice', JSON.stringify({ ref: state.current.ref, playerID: state.current.ownerID, price: state.current.offer }));
        closeUI(true);
    }
    else {
        if (data.waiting && data.sender) {
            emitNet('NewStart_Mechanical:handleGeneral-server', 'cancelInvoice', JSON.stringify({ ref: state.current.ref, fromMechanical: true, playerID: state.current.ownerID }));
        }
        else if (!data.sender) {
            emitNet('NewStart_Mechanical:handleGeneral-server', 'cancelInvoice', JSON.stringify({ ref: state.current.ref, fromMechanical: false, playerID: state.current.ownerID }));
            closeUI(true);
        }
    }
}
function saveChanges(vehID) {
    if (!vehID)
        vehID = GetVehiclePedIsIn(PlayerPedId(), false);
    const inventory = exports.NewStart_Inventory.info('currentItems');
    const features = [];
    const colors = {
        resprayColor: GetVehicleCustomPrimaryColour(vehID).join(','),
        resprayExtraColor: GetVehicleCustomSecondaryColour(vehID).join(','),
        wheelColor: GetVehicleExtraColours(vehID)[1],
        effectColor: GetVehicleExtraColours(vehID)[0],
        neonColor: GetVehicleNeonLightsColour(vehID).join(',')
    };
    for (let obj of itemsRef) {
        const find = state.current.items.find(i => i.name === obj.name);
        const item = { name: obj.name, itemID: obj.itemID, value: 0, skipInv: false };
        if (obj.type === 'normal') {
            item.value = GetVehicleMod(vehID, obj.mainID);
        }
        else if (obj.type === 'color') {
            item.value = colors[obj.name];
        }
        else {
            if (obj.name === 'neon') {
                item.value = IsVehicleNeonLightEnabled(vehID, 0) ? 0 : -1;
            }
            else {
                item.value = GetVehicleWindowTint(vehID);
            }
        }
        item.itemID = (obj.isLayers && item.value >= 0 ? obj.itemID + item.value : obj.isLayers ? 0 : obj.itemID);
        item.skipInv = item.value === -1 || item.value === find.value;
        if (state.current.items.some(i => i.name === obj.name && i.value !== item.value) &&
            (item.skipInv || inventory.find((i) => i.id === item.itemID))) {
            features.push(item);
        }
    }
    const featureSave = {};
    const noLoop = [49, 69];
    for (let item of state.current.items)
        featureSave[item.name] = item.value;
    for (let index in features) {
        const item = features[index];
        const refInx = state.current.items.findIndex(i => i.name === item.name);
        featureSave[item.name] = item.value;
        state.current.items.splice(refInx, 1);
        if (!item.skipInv &&
            !features.some(i => noLoop.includes(i.itemID) && i.skipInv)) {
            if (noLoop.includes(item.itemID))
                item.skipInv = true;
            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: item.itemID, count: 1 }));
        }
    }
    const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
    exports.NewStart_Notifications.showAttention('success', 'تم حفظ جميع تغييرات المركبة.');
    emitNet('NewStart_Mechanical:handleGeneral-server', 'sendLog', JSON.stringify({ plate, changes: state.current.changes, price: state.current.price }));
    emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate, features: featureSave }));
    closeUI(true);
}
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_Mechanical:handleGeneral-client', (type, data) => {
    if (data && typeof data === 'string')
        data = JSON.parse(data);
    if (type === 'apply') {
        const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
        const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
        const info = { name: 'رسوم توظيف', price: state.priceLicense, from: 'cash' };
        if (cash >= info.price) {
            StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
        }
        else if (bank >= info.price) {
            StatSetInt('BANK_BALANCE', bank - info.price, false);
            info.from = 'bank';
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في حسابك البنكي أو الحقيبة!');
            return closeUI(false);
        }
        emit('NewStart_Mechanical:handleGeneral-client', 'active', JSON.stringify({ isNew: true }));
        closeUI(false);
        emitNet('NewStart:moneyDecrease', info);
        emitNet('NewStart:updateUser', { job: { type: 'mechanical' } });
        emitNet('NewStart_Mechanical:handleGeneral-server', 'sendAds');
    }
    else if (type === 'active') {
        state.isActive = true;
        state.login.blipID = createBlip(525, 'ﺔﻣﺪﺨﻟﺍ ﺀﺪﺑ', state.login.coords, true);
        exports.NewStart_HudSystem.updateJob({ type: 'general', title: 'عمل حر - ميكانيكي المركبات' });
        if (data.isNew) {
            exports.NewStart_Notifications.showAttention('success', 'لديك الآن رخصة الميكانيكي يمكنك مباشرة العمل!');
        }
        else if (data.isIn) {
            state.login.isIn = true;
        }
    }
    else if (type === 'setInfo') {
        state.current.ownerID = parseInt(data.to.ownerID);
        SendNUIMessage(JSON.stringify({ type: 'setInvoice', info: data }));
    }
    else if (type === 'saveChanges') {
        if (state.current.ref === data.ref) {
            saveChanges();
            if (data.price) {
                emitNet('NewStart:giveMoney', { name: 'فاتورة ميكانيكي', amount: data.price });
                if (data >= 5000) {
                    const exp = Math.ceil(data.price / 200);
                    exports.NewStart_MainMenu.levelUp(exp > 2000 ? 2000 : exp);
                }
            }
        }
    }
    else if (type === 'receiveInvoice') {
        SetNuiFocus(true, true);
        SendNUIMessage(JSON.stringify({ type: 'setInvoice', info: { ...data, toggle: true, sender: false } }));
        state.current = { ref: data.ref, ownerID: data.ownerID, offer: data.price, items: [], price: 0, changes: [] };
    }
    else if (type === 'cancelInvoice') {
        if (state.current.ref === data.ref) {
            if (data.fromMechanical) {
                SetNuiFocus(false, false);
                SendNUIMessage(JSON.stringify({ type: 'setInvoice', info: { toggle: false, sender: false } }));
                state.current = { ref: 0, ownerID: 0, offer: 0, items: [], price: 0, changes: [] };
                exports.NewStart_Notifications.showAttention('error', 'تم إلغاء الفاتورة من قبل الميكانيكي!');
            }
            else {
                SendNUIMessage(JSON.stringify({ type: 'setInvoice', info: { waiting: false } }));
                exports.NewStart_Notifications.showAttention('error', 'تم رفض الفاتورة من قبل مالك المركبة!');
            }
        }
    }
    else if (type === 'setMaxSpeed') {
        SetVehicleMaxSpeed(GetVehiclePedIsIn(PlayerPedId(), false), data.value);
    }
    else if (type === 'quit') {
        exports.NewStart_HudSystem.updateJob({});
        closeUI(false);
        state.isActive = false;
        RemoveBlip(state.login.blipID);
        if (state.login.isIn) {
            exports.NewStart_Clothes.pedReset();
            state.login.isIn = false;
        }
    }
});
(async function () {
    const model = GetHashKey('cs_joeminuteman');
    RequestModel(model);
    while (!HasModelLoaded(model))
        await Delay(1000);
    const pedID = CreatePed(1, model, 114.1318, 6631.7802, 30.9589, 314.6456, false, false);
    FreezeEntityPosition(pedID, true);
    SetBlockingOfNonTemporaryEvents(pedID, true);
    SetEntityInvincible(pedID, true);
})();
function setVehicleFeature(item, vehID = 0, isTest = false) {
    if (!vehID)
        vehID = GetVehiclePedIsIn(PlayerPedId(), false);
    if (item.type === 'normal') {
        SetVehicleMod(vehID, item.mainID, item.value, false);
        if (item.name === 'horn' && isTest) {
            const time = Date.now();
            clearInterval(state.hornTickID);
            state.hornTickID = setInterval(() => {
                if ((time + 1000) < Date.now())
                    clearInterval(state.hornTickID);
                SoundVehicleHornThisFrame(vehID);
            }, 0);
        }
    }
    else if (item.type === 'other') {
        if (item.name === 'neon') {
            if (item.value === 0) {
                DisableVehicleNeonLights(vehID, false);
                for (let i = 0; i <= 3; i++)
                    SetVehicleNeonLightEnabled(vehID, i, true);
            }
            else {
                DisableVehicleNeonLights(vehID, true);
                for (let i = 0; i <= 3; i++)
                    SetVehicleNeonLightEnabled(vehID, i, false);
            }
        }
        else {
            if (item.value === -1)
                item.value = 0;
            SetVehicleWindowTint(vehID, item.value);
        }
    }
    else {
        const color = !['effectColor', 'wheelColor'].includes(item.name) ? item.value.split(',').map((v) => parseInt(v)) : [];
        if (item.name === 'resprayColor') {
            SetVehicleCustomPrimaryColour(vehID, color[0], color[1], color[2]);
        }
        else if (item.name === 'resprayExtraColor') {
            SetVehicleCustomSecondaryColour(vehID, color[0], color[1], color[2]);
        }
        else if (item.name === 'effectColor') {
            SetVehicleExtraColours(vehID, item.value, GetVehicleExtraColours(vehID)[1]);
        }
        else if (item.name === 'neonColor') {
            SetVehicleNeonLightsColour(vehID, color[0], color[1], color[2]);
        }
        else if (item.name === 'wheelColor') {
            SetVehicleExtraColours(vehID, GetVehicleExtraColours(vehID)[0], item.value);
        }
    }
}
function createBlip(id, name, coords, isColor) {
    const blipID = AddBlipForCoord(coords[0], coords[1], coords[2]);
    SetBlipSprite(blipID, id);
    SetBlipAsShortRange(blipID, true);
    if (isColor)
        SetBlipColour(blipID, 3);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(`<font face="A9eelsh">${name}</font>`);
    EndTextCommandSetBlipName(blipID);
    return blipID;
}
function startOutfit() {
    exports.NewStart_Clothes.pedReset(false);
    const isMale = GetEntityModel(state.pedID) === GetHashKey('mp_m_freemode_01');
    SetPedComponentVariation(state.pedID, 11, isMale ? 65 : 59, 2, 0);
    SetPedComponentVariation(state.pedID, 8, 15, 0, 0);
    SetPedComponentVariation(state.pedID, 3, 1, 0, 0);
    SetPedComponentVariation(state.pedID, 4, 38, 2, 0);
    SetPedComponentVariation(state.pedID, 6, 24, 0, 0);
}
function closeUI(isNUI) {
    if (isNUI)
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    exports.NewStart_Phone.noticesToggle(false);
    if (state.isOpen)
        ClearPedTasks(PlayerPedId());
    if ((state.isPanel || state.isOpen) && !exports.NewStart_MainMenu.isOpen()) {
        DisplayRadar(true);
        exports.NewStart_HudSystem.openHud();
        exports.NewStart_MainMenu.toggleAds(true);
    }
    if (state.isPanel) {
        exports.NewStart_VehicleSystem.method('setHideUI', false);
        if (state.current.items.length) {
            for (let item of state.current.items)
                setVehicleFeature(item);
        }
    }
    SetNuiFocus(false, false);
    state.isPanel = false;
    state.isOpen = false;
    state.runClose = false;
    state.current = { ref: 0, ownerID: 0, offer: 0, items: [], price: 0, changes: [] };
}
function openPanel() {
    if (!state.login.isIn)
        return;
    const vehID = GetVehiclePedIsIn(state.pedID, false);
    const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
    if (!vehID || GetPedInVehicleSeat(vehID, -1) !== state.pedID) {
        return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون داخل مركبة وفي مقعد السائق لفتح اللوحة!');
    }
    else if (!plate) {
        return exports.NewStart_Notifications.showAttention('error', 'لا يمكن تعديل إلا المركبات الخاصة فقط!');
    }
    exports.NewStart_VehicleSystem.method('setHideUI', true);
    const vehicle = exports.NewStart_VehicleDealership.getData('vehicles').find((i) => i.hash === GetEntityModel(vehID) || (typeof i.hash === 'string' && (i.hash.toLowerCase() === GetEntityArchetypeName(vehID))));
    if (vehicle) {
        if (vehicle.vehType === 'car' || vehicle.vehType === 'motorcycle') {
            if (exports.NewStart_RealEstate.method('getCurrent').type !== 'garage') {
                return exports.NewStart_Notifications.showAttention('error', 'لا يمكن تعديل هذا النوع إلا داخل الجراجات المنفصلة!');
            }
        }
        else {
            const place = state.places.find(i => i.type === vehicle.vehType);
            if (place) {
                const distance = GetDistanceBetweenCoords(state.pedCoords[0], state.pedCoords[1], state.pedCoords[2], place.coords[0], place.coords[1], place.coords[2], true);
                if (distance > place.distance)
                    return exports.NewStart_Notifications.showAttention('error', 'يجب التواجد بالقرب من المكان المخصص لتعديل هذا النوع!');
            }
        }
    }
    else {
        return exports.NewStart_Notifications.showAttention('error', 'هذه المركبة غير موجودة في نظامنا!');
    }
    const items = JSON.parse(JSON.stringify(itemsRef));
    const engineHeal = GetVehicleEngineHealth(vehID);
    const vehClass = GetVehicleClass(vehID);
    emitNet('NewStart_Mechanical:handleGeneral-server', 'getInfo', JSON.stringify({ plate }));
    SetVehicleModKit(vehID, 0);
    state.isPanel = true;
    const inventory = exports.NewStart_Inventory.info('currentItems');
    const colors = {
        resprayColor: GetVehicleCustomPrimaryColour(vehID).join(','),
        resprayExtraColor: GetVehicleCustomSecondaryColour(vehID).join(','),
        wheelColor: GetVehicleExtraColours(vehID)[1],
        effectColor: GetVehicleExtraColours(vehID)[0],
        neonColor: GetVehicleNeonLightsColour(vehID).join(',')
    };
    exports.NewStart_HudSystem.closeUI();
    exports.NewStart_Phone.noticesToggle(true);
    exports.NewStart_MainMenu.toggleAds(false);
    DisplayRadar(false);
    for (let obj of items) {
        const currentLevel = exports.NewStart_MainMenu.getLevel();
        obj.disabled = currentLevel < obj.level;
        if (currentLevel >= obj.level)
            delete obj.level;
        if (obj.type === 'normal') {
            const currentID = GetVehicleMod(vehID, obj.mainID);
            const values = Array(GetNumVehicleMods(vehID, obj.mainID)).fill(null).map((_, index) => ({
                id: index,
                isBefore: currentID === index,
                isHave: inventory.some((i) => i.id === (obj.isLayers ? obj.itemID + index : obj.itemID))
            }));
            if (!values.length ||
                (obj.name === 'horn' && vehClass === 8) ||
                ('wheel' === obj.name && [14, 15, 16].includes(vehClass)) ||
                (vehicle.vehType === 'truck' && ['rollCage', 'roof', 'spoiler'].includes(obj.name))) {
                obj.skipNUI = true;
            }
            else {
                obj.values.push(...values);
                if (currentID >= 0) {
                    const index = obj.values.findIndex(v => v.id === currentID);
                    obj.values[index].isActive = true;
                    obj.values[index].isBefore = true;
                }
                else {
                    obj.values[0].isActive = true;
                    obj.values[0].isBefore = true;
                }
            }
            state.current.items.push({ type: obj.type, name: obj.name, mainID: obj.mainID, value: currentID });
        }
        else if (obj.type === 'color') {
            if ((obj.name === 'resprayExtraColor' && !GetIsVehicleSecondaryColourCustom(vehID)) || (obj.name === 'neonColor' && vehClass === 8)) {
                obj.skipNUI = true;
            }
            else {
                obj.values.push({ id: colors[obj.name] });
                state.current.items.push({ type: obj.type, name: obj.name, value: colors[obj.name] });
            }
        }
        else {
            let value = -1;
            if (obj.name === 'neon') {
                if (vehClass === 8) {
                    obj.skipNUI = true;
                }
                else if (IsVehicleNeonLightEnabled(vehID, 0)) {
                    obj.values[1] = { ...obj.values[1], isActive: true, isBefore: true };
                    value = 0;
                }
                else {
                    obj.values[0].isActive = true;
                    obj.values[0].isBefore = true;
                    value = -1;
                }
                obj.values[1].isHave = inventory.some((i) => i.id === obj.itemID);
            }
            else {
                value = GetVehicleWindowTint(vehID);
                obj.values = obj.values.map(v => ({
                    ...v, isActive: value === v.id, isBefore: value === v.id, isHave: inventory.some((i) => i.id === obj.itemID)
                }));
                if (!obj.values.some(v => v.isActive)) {
                    obj.values[0].isActive = true;
                    obj.values[0].isBefore = true;
                }
            }
            state.current.items.push({ type: obj.type, name: obj.name, value });
        }
    }
    state.current.ref = Date.now();
    SendNUIMessage(JSON.stringify({
        type: 'openUI',
        typeUI: 'panel',
        repair: engineHeal < 995 ? 1000 - (parseInt(engineHeal) * 1) : 0,
        info: items.filter(i => !i.skipNUI),
        isHaveItemColor: inventory.some((i) => i.id === 49),
        isPrivate: exports.NewStart_VehicleSystem.method('GetMyVehicles').some((v) => v.vehID === vehID),
        invoice: {
            ref: state.current.ref,
            sender: true,
            price: 0,
            to: { name: '', customID: 0 }
        }
    }));
    SetNuiFocus(true, true);
}
RegisterNuiCallbackType('NUI:panel');
on('__cfx_nui:NUI:panel', (data, cb) => {
    const vehID = GetVehiclePedIsIn(PlayerPedId(), false);
    if (data.type === 'change') {
        const find = itemsRef.find(obj => obj.name === data.info.name);
        if (['effectColor', 'wheelColor'].includes(find.name))
            data.info.value = data.info.id;
        setVehicleFeature({ type: find.type, name: find.name, mainID: find.mainID, value: data.info.value }, vehID, true);
    }
    else if (data.type === 'execute') {
        if (data.action === 'notification') {
            exports.NewStart_Notifications.showAttention('error', data.text);
        }
        else if (data.action === 'engine') {
            SetVehicleEngineOn(vehID, true, false, true);
        }
        else if (data.action === 'freeCam') {
            SetNuiFocus(true, !data.value);
        }
        else if (data.action === 'wash') {
            SetVehicleDirtLevel(vehID, 0);
            exports.NewStart_Notifications.showAttention('success', 'تم تنظيف المركبة بالكامل من الخارج.');
        }
        else {
            const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
            const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
            const info = { name: 'مواد تصليح', price: (1000 - (parseInt(GetVehicleEngineHealth(vehID)) * 1)), from: 'cash' };
            if (cash >= info.price) {
                StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
            }
            else if (bank >= info.price) {
                StatSetInt('BANK_BALANCE', bank - info.price, false);
                info.from = 'bank';
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
                return;
            }
            const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
            emitNet('NewStart:moneyDecrease', info);
            SetVehicleFixed(vehID);
            SetVehicleEngineHealth(vehID, 1000);
            SetEntityMaxSpeed(vehID, GetVehicleHandlingFloat(vehID, 'CHandlingData', 'fInitialDriveMaxFlatVel'));
            if (plate)
                emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate, damage: 1000 }));
        }
    }
    else if (data.type === 'getTotal') {
        let price = 0;
        const store = exports.NewStart_Stores.method('getItems', 'mechanical');
        const filter = itemsRef.filter(i => data.info.some((t) => t.includes(i.title)));
        for (let item of filter) {
            const itemID = item.isLayers ? item.itemID + (data.info.find((i) => i.includes(item.title)).match(/\((\d+)\/(\d+)\)/)[2] - 1) : item.itemID;
            price += store.find((i) => i.id === itemID).price;
        }
        price += parseInt((price * 50) / 100);
        return cb(price);
    }
    else if (data.type === 'setCurrent') {
        state.current = { ...state.current, ...data.info };
    }
    else if (data.type === 'saveChanges') {
        if (data.info)
            state.current.changes = data.info;
        saveChanges(vehID);
    }
    cb('OK!');
});
const state = {
    isFirst: true,
    isActive: false,
    login: { isIn: false, blipID: 0, runClose: false, coords: [111.7805, 6632.6985, 32.1589, -130.3937] },
    priceLicense: 100000,
    priceVehicle: 150000,
    current: {
        ref: 0,
        ownerID: 0,
        offer: 0,
        items: [],
        changes: [],
        price: 0
    },
    pedID: 0,
    pedCoords: [],
    coords: { x: 115.9516, y: 6633.6264, z: 31.9926, h: 133.2283 },
    places: [
        { type: 'truck', name: 'ﺕﺎﻨﺣﺎﺸﻟﺍ ﻞﻳﺪﻌﺗ', coords: [2386.2065, 3087.9165, 48.1516], distance: 80 },
        { type: 'boat', name: 'ﺏﺭﺍﻮﻘﻟﺍ ﻞﻳﺪﻌﺗ', coords: [1813.5692, 4486.6547, 32.0432], distance: 50 },
        { type: 'plane', name: 'ﺕﺍﺮﺋﺎﻄﻟﺍ ﻞﻳﺪﻌﺗ', coords: [-1821.2703, 2971.1999, 32.8015], distance: 75 },
    ],
    isPanel: false,
    hornTickID: 0,
    isOpen: false,
    runClose: false
};
const empty = null;
const itemsRef = [
    {
        type: 'color',
        name: 'resprayColor',
        title: 'لون الطلاء',
        itemID: 49,
        level: 0,
        disabled: false,
        values: []
    },
    {
        type: 'color',
        name: 'resprayExtraColor',
        title: 'الطلاء الإضافي',
        itemID: 49,
        level: 0,
        disabled: false,
        values: []
    },
    {
        type: 'normal',
        itemID: 70,
        name: 'armour',
        title: 'قوة الهيكل',
        mainID: 16,
        isLayers: true,
        level: 0,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 50,
        name: 'engine',
        title: 'قوة المحرك',
        mainID: 11,
        isLayers: true,
        level: 0,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 48,
        name: 'break',
        title: 'نوع المكابح',
        mainID: 12,
        level: 10,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 67,
        name: 'transmission',
        title: 'نظام ناقل الحركة',
        mainID: 13,
        level: 10,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 65,
        name: 'suspension',
        title: 'نظام التعليق',
        mainID: 15,
        level: 10,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 55,
        name: 'frontBumper',
        title: 'الصدام الأمامي',
        mainID: 1,
        level: 10,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 56,
        name: 'grille',
        title: 'الشبك الأمامي',
        mainID: 6,
        level: 10,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 57,
        name: 'hood',
        title: 'غطاء المحرك',
        mainID: 7,
        level: 10,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 62,
        name: 'roof',
        title: 'تغيير السقف',
        mainID: 10,
        level: 10,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 68,
        name: 'turbo',
        title: 'التوربين (Turbo)',
        mainID: 18,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 61,
        name: 'rollCage',
        title: 'القفص الداخلي',
        mainID: 5,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 63,
        name: 'skirt',
        title: 'الدواسة الجانبية',
        mainID: 3,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 59,
        name: 'rearBumper',
        title: 'الصدام الخلفي',
        mainID: 2,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 64,
        name: 'spoiler',
        title: 'شكل الجناح',
        mainID: 0,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 54,
        name: 'exhaust',
        title: 'شكل العادم',
        mainID: 4,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 58,
        name: 'horn',
        title: 'صوت البوق',
        mainID: 14,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 69,
        name: 'wheel',
        title: 'شكل العجلات',
        mainID: 23,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'normal',
        itemID: 69,
        name: 'wheel2',
        title: 'شكل العجلات الإضافي',
        image: 'wheel',
        mainID: 24,
        level: 20,
        disabled: false,
        values: [{ id: -1 }]
    },
    {
        type: 'color',
        name: 'wheelColor',
        title: 'لون الجنوط أو أخرى',
        itemID: 49,
        level: 20,
        disabled: false,
        values: []
    },
    {
        type: 'color',
        name: 'effectColor',
        title: 'تأثير الطلاء',
        itemID: 49,
        level: 20,
        disabled: false,
        values: []
    },
    {
        type: 'other',
        name: 'neon',
        title: 'النيون (Neon)',
        itemID: 60,
        level: 30,
        disabled: false,
        values: [{ id: -1 }, { id: 0 }]
    },
    {
        type: 'color',
        name: 'neonColor',
        title: "لون النيون (Neon)",
        itemID: 49,
        mainID: 16,
        level: 30,
        disabled: false,
        values: []
    },
    {
        type: 'other',
        name: 'tinting',
        title: 'تظليل النوافذ',
        itemID: 66,
        level: 30,
        disabled: false,
        values: [{ id: -1 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
    }
];
RequestAnimDict('amb@world_human_maid_clean@');
RequestModel(-678752633);
function washKit() {
    const pedID = PlayerPedId();
    if (IsPedInAnyVehicle(pedID, true)) {
        exports.NewStart_Notifications.showAttention('error', 'يجب ترك المركبة أولاً قبل الاستخدام!');
        emit('NewStart_Inventory:additem-client', JSON.stringify({ id: 47, count: 1 }), true);
        return false;
    }
    const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh');
    const vehCoords = GetEntityCoords(vehID, true);
    const [x, y, z] = GetEntityCoords(pedID, false);
    const vehType = GetVehicleClass(vehID);
    let canStart = false;
    for (let name of exports.NewStart_VehicleSystem.method('bones')) {
        const index = GetEntityBoneIndexByName(vehID, name);
        const coords = GetWorldPositionOfEntityBone(vehID, index);
        const distanceBone = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);
        if (distanceBone <= 1.8 || ([16, 17, 20].includes(vehType) && distanceBone <= 2.5)) {
            canStart = true;
            break;
        }
    }
    if (!vehID || !canStart) {
        exports.NewStart_Notifications.showAttention('error', 'يجب عليك الاقتراب كفاية من أي مركبة للاستخدام العدة!');
        emit('NewStart_Inventory:additem-client', JSON.stringify({ id: 47, count: 1 }), true);
        return false;
    }
    const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
    exports.NewStart_Tools.sendToNUI({ type: 'progress', status: true, custom: '15s' });
    const objectID = CreateObject(-678752633, 0, 0, 0, true, true, false);
    AttachEntityToEntity(objectID, pedID, GetPedBoneIndex(pedID, 28422), 0, 0, -0.03, 120, 0, 0, true, true, false, true, 1, true);
    const heading = GetHeadingFromVector_2d(vehCoords[0] - x, vehCoords[1] - y);
    SetEntityHeading(pedID, heading);
    TaskPlayAnim(pedID, "amb@world_human_maid_clean@", "idle_b", 3.0, 3.0, -1, 1, 0, false, false, false);
    setTimeout(() => {
        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
        exports.NewStart_Notifications.showAttention('success', 'لقد قمت بغسل المركبة بالكامل هي نظيفة الآن.');
        DeleteObject(objectID);
        ClearPedTasks(pedID);
        SetVehicleDirtLevel(vehID, 0);
    }, 15000);
    if (plate)
        emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate, dirt: 0 }));
    return true;
}
function vehicleFlip() {
    const pedID = PlayerPedId();
    if (!state.login.isIn)
        return;
    const find = exports.NewStart_VehicleSystem.method('GetMyVehicles').find((v) => v.hash === 2971866336);
    const [x, y, z] = GetEntityCoords(pedID, false);
    if (!find) {
        return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون سيارة السحب الخاصة بك قريبة منك كفاية!');
    }
    else {
        const vehCoords = GetEntityCoords(find.vehID, false);
        const distance = GetDistanceBetweenCoords(x, y, z, vehCoords[0], vehCoords[1], vehCoords[2], true);
        if (distance > 10) {
            return exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون سيارة السحب قريبة منك كفاية!');
        }
    }
    if (IsPedInAnyVehicle(pedID, false)) {
        return exports.NewStart_Notifications.showAttention('error', 'انزل من المركبة وأقترب كفاية من المركية المستهدفة!');
    }
    const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh');
    if (vehID === find.vehID || !vehID) {
        exports.NewStart_Notifications.showAttention('error', 'أقترب كفاية من المركية التي تريد ارجعها لوضعها الطبيعي!');
    }
    else {
        const vehCoords = GetEntityCoords(vehID, false);
        const distance = GetDistanceBetweenCoords(x, y, z, vehCoords[0], vehCoords[1], vehCoords[2], true);
        if (distance < 6.5) {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: true, custom: '3s' });
            setTimeout(() => {
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                const rotation = GetEntityRotation(vehID, 2);
                SetEntityRotation(vehID, rotation[1], 0, rotation[3], 2, true);
                SetVehicleOnGroundProperly(vehID);
            }, 3000);
        }
        else {
            return exports.NewStart_Notifications.showAttention('error', 'أقترب كفاية من المركية التي تريد ارجعها لوضعها الطبيعي!');
        }
    }
}
