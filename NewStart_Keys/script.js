"use strict";
setTick(() => {
    const pedID = PlayerPedId();
    const pedCoord = GetEntityCoords(pedID, true);
    let isCurrent = 0;
    for (let item of state.offices) {
        const { x, y, z, h } = item;
        const distance = GetDistanceBetweenCoords(pedCoord[0], pedCoord[1], pedCoord[2], x, y, z, true);
        if (distance < 15) {
            DrawMarker(1, x, y, z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.5, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
            if (distance < 0.6)
                isCurrent = h;
            break;
        }
    }
    if (isCurrent &&
        !IsEntityDead(pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            const info = [
                ...exports.NewStart_RealEstate.method('getProperties').map((item) => ({
                    ref: 'house',
                    id: item.code,
                    type: item.type !== 'garage' ? 'house' : 'garage',
                    name: item.name
                })),
                ...exports.NewStart_VehicleSystem.method('GetMyVehicles').map((item) => ({
                    ref: 'vehicle',
                    id: item.plate,
                    type: item.vehType,
                    name: `${item.name.split(' ')[0]} (${item.plate})`
                }))
            ];
            TaskAchieveHeading(pedID, isCurrent, 0);
            SetNuiFocus(true, true);
            state.isOpen = true;
            SendNUIMessage(JSON.stringify({ type: 'openUI', info }));
        }
        else if (!state.isOpen && !state.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
        }
        state.runClose = true;
    }
    else if (state.runClose) {
        state.isOpen = false;
        state.runClose = false;
        ClearPedTasks(pedID);
        SetNuiFocus(false, false);
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    switch (data.type) {
        case 'payment':
            const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
            const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
            const info = { name: 'نسخ المفاتيح', price: 2500, from: 'cash' };
            if (cash >= info.price) {
                StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                info.from = 'cash';
            }
            else if (bank >= info.price) {
                StatSetInt('BANK_BALANCE', bank - info.price, false);
                info.from = 'bank';
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
                return;
            }
            emitNet('NewStart:moneyDecrease', info);
            if (info.from === 'cash')
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
            exports.NewStart_Notifications.showAttention('success', `لقد قمت بالدفع وتم نسخ المفتاح لل${data.itemType === 'house' ? 'عقار' : 'مركبة'}`);
            if (data.itemType === 'house') {
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 45, count: 1, features: { id: data.id } }));
            }
            else {
                const find = exports.NewStart_VehicleSystem.method('GetMyVehicles').find((v) => v.plate === data.id);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 27, count: 1, features: { plate: find.plate } }));
            }
            break;
        default:
            state.isOpen = false;
            state.runClose = false;
            SetNuiFocus(false, false);
    }
    cb('OK!');
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
(async function createEmployee() {
    const model = GetHashKey('cs_jimmyboston');
    RequestModel(model);
    while (!HasModelLoaded(model))
        await Delay(1000);
    const pedID = CreatePed(1, model, -136.9978, 6295.1738, 30.5040, 133.2283, false, false);
    FreezeEntityPosition(pedID, true);
    SetBlockingOfNonTemporaryEvents(pedID, true);
    SetEntityInvincible(pedID, true);
})();
exports('method', (type, data) => {
    if (type === 'changeLocks') {
        let vehInfo = { id: 0, plate: 0 };
        let houseCode = 0, error = '', heading = 0;
        const pedID = PlayerPedId();
        if (IsPedInAnyVehicle(pedID, false)) {
            exports.NewStart_Notifications.showAttention('error', 'يجب الخروج من المركبة والوقوف أمام الباب الأساسي!');
            emit('NewStart_Inventory:additem-client', JSON.stringify({ id: 46, count: 1 }), true);
            return false;
        }
        const [x, y, z] = GetEntityCoords(pedID, true);
        const vehicles = exports.NewStart_VehicleSystem.method('GetMyVehicles');
        for (let item of vehicles) {
            const vehCoords = GetEntityCoords(item.vehID, true);
            const distance = GetDistanceBetweenCoords(x, y, z, vehCoords[0], vehCoords[1], vehCoords[2], true);
            if (distance <= 10) {
                for (let name of ['doorlight_lf', 'wheel_lf', 'door_dside_f']) {
                    const index = GetEntityBoneIndexByName(item.vehID, name);
                    const coords = GetWorldPositionOfEntityBone(item.vehID, index);
                    const distanceBone = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);
                    if (distanceBone <= 1.5) {
                        vehInfo = { id: item.vehID, plate: item.plate };
                        heading = GetEntityHeading(item.vehID) - 90;
                        break;
                    }
                }
            }
        }
        if (!vehInfo.id) {
            const properties = exports.NewStart_RealEstate.method('getProperties');
            for (let item of properties) {
                const distance = GetDistanceBetweenCoords(x, y, z, item.coord.x, item.coord.y, item.coord.z, true);
                if ((item.type === 'garage' && distance < 2.4) || distance < 0.6) {
                    houseCode = item.code;
                    heading = -item.coord.h;
                    break;
                }
            }
        }
        if (vehInfo.id && GetVehicleEngineHealth(vehInfo.id) <= 0) {
            error = 'يجب تصليح المركبة أولاً قبل تغيير الأقفال!';
        }
        else if (!vehInfo.id && !houseCode) {
            error = 'أقترب من الباب الأساسي لمركبتك الخاصة أو من باب العقار من الخارج!';
        }
        if (error) {
            exports.NewStart_Notifications.showAttention('error', error);
            emit('NewStart_Inventory:additem-client', JSON.stringify({ id: 46, count: 1 }), true);
            return false;
        }
        const maskID = CreateObject(-1821801372, 0, 0, 0, true, true, false);
        AttachEntityToEntity(maskID, pedID, GetPedBoneIndex(pedID, 12844), 0.115, 0.02, 0, 0, 90, 180, true, true, false, true, 1, true);
        SetEntityHeading(pedID, heading);
        TaskStartScenarioInPlace(pedID, 'WORLD_HUMAN_WELDING', 0, false);
        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: true, custom: '15s' });
        setTimeout(() => {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
            ClearPedTasks(pedID);
            DeleteObject(maskID);
            exports.NewStart_Notifications.showAttention('success', 'تم حذف جميع المفاتيح التي مع اللاعبين الآخرين.');
        }, 15000);
        emitNet('NewStart_Keys:handleGeneral-server', 'changeLocks', JSON.stringify({ type: vehInfo.plate ? 'vehicle' : 'house', id: vehInfo.plate || houseCode }));
        return true;
    }
    else if (type === 'info') {
        return state[data];
    }
});
const state = {
    isOpen: false,
    runClose: false,
    offices: [{ x: -138.5010, y: 6293.7231, z: 31.5040, h: 317.4803 }]
};
const empty = null;
