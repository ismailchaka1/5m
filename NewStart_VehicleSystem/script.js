"use strict";
function createCustomVehicle(data) {
    emitNet('NewStart_VehicleSystem:handleGlobal-server', 'createVehicle', JSON.stringify({
        family: 'private', model: data.hash, type: getVehicleType(data.hash), coords: Object.values(data.location), data
    }));
}
async function buildCustomVehicle(data) {
    while (!NetworkDoesEntityExistWithNetworkId(data.netID)) {
        await Delay(0);
    }
    const vehID = NetToVeh(data.netID);
    SetVehicleNumberPlateText(vehID, data.plate.name);
    if (data.isInto) {
        SetPedIntoVehicle(state.pedID, vehID, -1);
        exports.NewStart_Tools.method('passiveModeVehicle');
    }
    else {
        SetVehicleDoorsLocked(vehID, 4);
    }
    emitNet('NewStart_VehicleSystem:handleGlobal-server', 'asMission', JSON.stringify({ id: data.netID }));
    const find = exports.NewStart_VehicleDealership.getData('vehicles').find((obj) => obj.hash === data.hash);
    state.myVehicles.push({
        id: data._id,
        vehID: data.netID,
        vehType: find.vehType,
        hash: data.hash,
        plate: data.plate.name,
        name: data.name,
    });
    while (GetVehicleNumberPlateText(vehID) !== data.plate.name || NetworkGetEntityOwner(vehID) !== PlayerId()) {
        SetVehicleNumberPlateText(vehID, data.plate.name);
        await Delay(0);
    }
    if (data.features) {
        exports.NewStart_Mechanical.method('setFeatures', { items: data.features, vehID });
    }
    else {
        if (data.hash === 1353720154) {
            SetVehicleCustomPrimaryColour(vehID, 74, 16, 0);
        }
        else {
            SetVehicleCustomPrimaryColour(vehID, 255, 255, 255);
            SetVehicleCustomSecondaryColour(vehID, 255, 255, 255);
        }
    }
    SetEntityAsMissionEntity(vehID, true, true);
    SetVehicleHasBeenOwnedByPlayer(vehID, true);
    SetVehicleLivery(vehID, 0);
    SetVehicleEngineOn(vehID, data.isInto, false, true);
    emitNet('NewStart_VehicleSystem:handleGlobal-server', 'syncFuel', JSON.stringify({ id: data.netID, level: data.fuel }));
    SetVehicleEngineHealth(vehID, data.damage);
    SetVehicleDirtLevel(vehID, data.dirt);
    SetVehicleNumberPlateText(vehID, data.plate.name);
    SetVehicleCanLeakPetrol(vehID, false);
}
function getMyVehicles() {
    const vehicles = JSON.parse(JSON.stringify(state.myVehicles));
    for (let item of vehicles) {
        item.netID = item.vehID;
        if (NetworkDoesNetworkIdExist(item.vehID)) {
            item.vehID = NetworkGetEntityFromNetworkId(item.vehID);
        }
        else {
            item.vehID = 0;
        }
    }
    return vehicles;
}
function getClosestVeh(distance, withInside = false, coords) {
    if (!distance)
        distance = 5;
    const vehicles = [];
    const pedID = PlayerPedId();
    coords = coords || GetEntityCoords(pedID, true);
    for (let id of GetGamePool('CVehicle')) {
        if (!withInside && GetVehiclePedIsIn(pedID, false) === id)
            continue;
        const vehCoords = GetEntityCoords(id, true);
        const result = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], vehCoords[0], vehCoords[1], vehCoords[2], true);
        if (result < distance && NetworkDoesEntityExistWithNetworkId(VehToNet(id)))
            vehicles.push({ id, result });
    }
    return vehicles.length ? vehicles.reduce((a, b) => b.result < a.result ? b : a).id : 0;
}
setInterval(() => {
    if (state.vehID) {
        const plate = vehiclePrivate(state.vehID);
        if (!plate)
            return;
        const damage = parseInt(GetVehicleEngineHealth(state.vehID));
        const dirt = parseInt(GetVehicleDirtLevel(state.vehID));
        emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate, damage: damage < 200 ? 200 : damage, dirt }));
    }
}, 60000);
function getVehicleType(model) {
    if (IsThisModelACar(model))
        return 'automobile';
    else if (IsThisModelABike(model) || IsThisModelABicycle(model))
        return 'bike';
    else if (IsThisModelAPlane(model))
        return 'plane';
    else if (IsThisModelABoat(model) || IsThisModelAJetski(model))
        return 'boat';
    else if (IsThisModelAHeli(model))
        return 'heli';
    else if (IsThisModelATrain(model))
        return 'train';
    else
        return 'trailer';
}
RequestAnimDict('anim@mp_player_intmenu@key_fob@');
onNet('NewStart_VehicleSystem:handleGeneral-client', (type, data) => {
    if (type === 'createPrivateVehicle') {
        buildCustomVehicle(data);
    }
    else if (type === 'setPrivateVehicle') {
        state.myVehicles = data;
    }
    else if (type === 'checkPolice') {
        const faction = exports.NewStart_Factions.info();
        if (!faction?.key || faction?.isVacation) {
            const hash1 = GetEntityModel(data);
            const hash2 = GetEntityArchetypeName(data);
            if (exports.NewStart_Employee.method('vehicles').some((i) => i.hash === hash1 || i.hash === hash2)) {
                TaskLeaveVehicle(state.pedID, data, 0);
                exports.NewStart_Notifications.showAttention('error', 'لا يمكن قيادة مركبة من مركبات الهيئات الرسمية!');
            }
        }
        if (!exports.NewStart_Factions.method('isSecurityKey')) {
            SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
        }
    }
    else if (type === 'leftVehicle') {
        if (!exports.NewStart_Factions.method('isSecurityKey') || exports.NewStart_Factions.info()?.isVacation) {
            SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
        }
    }
    else if (type === 'syncFuel') {
        if (NetworkDoesEntityExistWithNetworkId(data.id))
            SetVehicleFuelLevel(NetToVeh(data.id), data.level);
    }
    else if (type === 'asMission') {
        if (NetworkDoesEntityExistWithNetworkId(data.id))
            SetEntityAsMissionEntity(NetToVeh(data.id), true, true);
    }
    else if (type === 'syncLock') {
        if (NetworkDoesEntityExistWithNetworkId(data.id))
            SetVehicleDoorsLocked(NetToVeh(data.id), data.value);
    }
});
onNet('NewStart_VehicleSystem:spawning-client', async (data) => {
    let isBucket = false;
    data = JSON.parse(data);
    if (Array.isArray(data))
        isBucket = true;
    else
        data = [data];
    for (let item of data) {
        if (isBucket) {
            state.plates.push(item.plate.name);
        }
        else {
            createCustomVehicle(item);
        }
    }
});
function lockToggle(info) {
    if (info.vehID && GetVehicleEngineHealth(info.vehID) > 0) {
        if (!info.noNeedKey) {
            const findKey = exports.NewStart_Inventory.info('currentItems').find((i) => i.id === 27 && i.features.plate === vehiclePrivate(info.vehID));
            if (!findKey)
                return;
        }
        const isLooked = GetVehicleDoorLockStatus(info.vehID) === 4;
        SetVehicleDoorsLocked(info.vehID, isLooked ? 1 : 4);
        emitNet('NewStart_VehicleSystem:handleGlobal-server', 'syncLock', JSON.stringify({ id: VehToNet(info.vehID), value: isLooked ? 1 : 4 }));
        if (!isLooked) {
            exports.NewStart_Notifications.showAttention('error', 'لقد قمت الآن بإغلاق المركبة بالكامل!');
        }
        else {
            exports.NewStart_Notifications.showAttention('success', 'لقد قمت الآن بفتح المركبة بالكامل!');
        }
        if (!IsPedInAnyVehicle(state.pedID, false)) {
            SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
            TaskPlayAnim(state.pedID, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 8.0, 8.0, 900, 48, 0, false, false, false);
        }
        if (IsPedInAnyVehicle(state.pedID, true) && ![8, 13].includes(state.vehClass)) {
            if (isLooked)
                PlayVehicleDoorOpenSound(info.vehID, 0);
            else
                PlayVehicleDoorCloseSound(info.vehID, 0);
        }
        else {
            SendNUIMessage(JSON.stringify({ type: 'playSound', name: 'lock' }));
        }
        if (isLooked) {
            SetVehicleAlarm(info.vehID, false);
        }
    }
}
setInterval(() => {
    state.pedID = PlayerPedId();
    state.vehID = GetVehiclePedIsIn(state.pedID, false);
    state.vehClass = state.vehID ? GetVehicleClass(state.vehID) : 0;
    state.vehModel = state.vehID ? GetEntityArchetypeName(state.vehID) : '';
    state.engineRunning = state.vehID && GetIsVehicleEngineRunning(state.vehID);
    if (state.vehID && !state.isDamage && GetEntityHealth(state.vehID) < 850) {
        if (exports.NewStart_Employee.method('vehicles').some((i) => i.hash === state.vehModel)) {
            SetVehicleEngineHealth(state.vehID, 1000);
            SetEntityInvincible(state.vehID, true);
            state.isDamage = true;
        }
        else {
            meter.cruise.isActive = false;
            SetVehicleEngineHealth(state.vehID, 200);
            SetEntityMaxSpeed(state.vehID, GetVehicleModelEstimatedMaxSpeed(state.vehModel) / 3.5);
            state.isDamage = true;
        }
    }
    else if (!state.vehID && state.isDamage) {
        state.isDamage = false;
    }
    if (state.vehID) {
        const roll = GetEntityRoll(state.vehID);
        if ((roll > 75.0 || roll < -75.0) && GetEntitySpeed(state.vehID) < 5) {
            DisableControlAction(2, 59, true);
            DisableControlAction(2, 60, true);
        }
    }
    if (state.vehID && ([8, 13].includes(state.vehClass) || state.vehModel === 'policeb')) {
        const isLooked = GetVehicleDoorLockStatus(state.vehID) === 4;
        if (isLooked) {
            TaskLeaveVehicle(state.pedID, state.vehID, 1);
            exports.NewStart_Notifications.showAttention('error', 'هذه الدراجة مغلقة يجب فتحها أولاً!');
        }
        SetPedConfigFlag(state.pedID, 35, false);
    }
    if (IsControlJustPressed(0, 311)) {
        if (exports.NewStart_RealEstate.method('getCurrent').marker) {
            exports.NewStart_RealEstate.method('toggleKey');
        }
        else if (exports.NewStart_DoorSystem.method('isNearby')) {
            exports.NewStart_DoorSystem.method('toggle');
        }
        else {
            const keys = exports.NewStart_Inventory.info('currentItems').filter((obj) => obj.id === 27).map((item) => item.features.plate.toString());
            const jobVeh = [exports.NewStart_Jobs.currentJob().vehID, ...exports.NewStart_Employee.data().spawnIDs.map((i) => i.id)];
            const rentVeh = exports.NewStart_Phone.method('vehRent');
            const vehID = getClosestVeh(null, true);
            const plate = GetVehicleNumberPlateText(vehID);
            const noNeedKey = jobVeh.includes(vehID) || rentVeh === vehID;
            if (keys.includes(plate) || noNeedKey) {
                lockToggle({ vehID, noNeedKey });
            }
            else if (vehID && !keys.includes(plate)) {
                return exports.NewStart_Notifications.showAttention('error', 'ليس لديك مفاتيح المركبة للتحكم بها!');
            }
        }
    }
    if (IsPedTryingToEnterALockedVehicle(state.pedID)) {
        const vehID = GetVehiclePedIsTryingToEnter(state.pedID);
        if (!state.isClearTasks && !IsVehicleAlarmSet(vehID)) {
            SetVehicleAlarmTimeLeft(vehID, 15000);
            SetVehicleNeedsToBeHotwired(vehID, false);
            if ([20, 17].includes(state.vehClass)) {
                setTimeout(() => { state.isClearTasks = false; ClearPedTasks(state.pedID); }, 1000);
            }
            else {
                setTimeout(() => { state.isClearTasks = false; ClearPedTasks(state.pedID); }, 1500);
            }
            state.isClearTasks = true;
        }
    }
}, 0);
exports('method', (type, data, more, more2) => {
    switch (type) {
        case 'addPlate':
            if (Array.isArray(data))
                state.plates = [...new Set([...state.plates, ...data])];
            else
                state.plates.push(data);
            break;
        case 'bones': return state.bones;
        case 'GetMyVehicles': return getMyVehicles();
        case 'vehiclePrivate': return vehiclePrivate(data);
        case 'setVolume':
            SendNUIMessage(JSON.stringify({ type: 'volume', number: data }));
            break;
        case 'setSeatBelt':
            meter.seatBelt = true;
            break;
        case 'setHideUI':
            meter.hideUI = data;
            break;
        case 'meter': return meter[data];
        case 'getClosestVeh': return getClosestVeh(data, more, more2);
        case 'hideCursor':
            SetNuiFocus(false, false);
            break;
        case 'getVehicleType': return getVehicleType(data);
        default: return state[data];
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
const meter = {
    cruise: {},
    seatBelt: false,
    turnOffRadio: false,
    seatCurrent: null,
    isOther: false,
    runClose: false,
    hideUI: false,
    skip: ['ambo', 'riot', 'emsnspeedo', 'bronxambo', 'burrito3']
};
setInterval(() => {
    if (!meter.turnOffRadio && state.engineRunning) {
        SetVehRadioStation(state.vehID, 'OFF');
        SetUserRadioControlEnabled(false);
        meter.turnOffRadio = true;
    }
    if (!state.engineRunning) {
        DisableControlAction(0, 71, true);
    }
    if (meter.hideUI || IsPauseMenuActive()) {
        SendNUIMessage(JSON.stringify({ type: 'hideUI' }));
    }
    else if (state.engineRunning && state.vehClass !== 13 && !IsEntityDead(state.pedID) &&
        !(meter.skip.includes(state.vehModel) && meter.seatCurrent > 0)) {
        const vehHash = GetEntityModel(state.vehID);
        const fuelLevel = GetVehicleFuelLevel(state.vehID);
        const [, lightsOn, highbeamsOn] = GetVehicleLightsState(state.vehID);
        const info = {
            speed: GetEntitySpeed(state.vehID),
            speedMax: GetVehicleModelEstimatedMaxSpeed(vehHash),
            isNotDriver: GetPedInVehicleSeat(state.vehID, -1) !== state.pedID
        };
        meter.runClose = true;
        if (meter.seatCurrent === null) {
            for (let i = -1; i <= 2; i++) {
                if (GetPedInVehicleSeat(state.vehID, i) === state.pedID) {
                    meter.seatCurrent = i;
                    break;
                }
            }
        }
        if (IsControlJustPressed(0, 244) && !info.isNotDriver) {
            meter.isOther = true;
            SetNuiFocus(true, true);
            SendNUIMessage(JSON.stringify({ type: 'other' }));
        }
        else if (IsControlJustPressed(0, 182) && !info.isNotDriver && GetVehicleEngineHealth(state.vehID) > 300) {
            meter.cruise.maxSpeed = GetVehicleHandlingFloat(state.vehID, 'CHandlingData', 'fInitialDriveMaxFlatVel');
            if (meter.cruise.isActive) {
                SetEntityMaxSpeed(state.vehID, meter.cruise.maxSpeed);
                meter.cruise.isActive = false;
            }
            else {
                const current = GetEntitySpeed(state.vehID);
                if (current >= 1) {
                    meter.cruise.current = current;
                    SetEntityMaxSpeed(state.vehID, current);
                    meter.cruise.isActive = true;
                }
            }
        }
        const badges = {
            light: lightsOn || highbeamsOn,
            key: GetVehicleDoorLockStatus(state.vehID) === 4,
            handbrake: GetVehicleHandbrake(state.vehID),
            anchor: IsEntityPositionFrozen(state.vehID),
            cruise: !!meter.cruise.isActive,
            window: IsVehicleWindowIntact(state.vehID, meter.seatCurrent + 1),
            belt: meter.seatBelt
        };
        SendNUIMessage(JSON.stringify({
            type: 'openUI', badges, vehClass: state.vehClass, vehModel: state.vehModel,
            cruise: meter.cruise, fuelLevel,
            info: { kph: Math.round(info.speed * 3.6), ...info },
        }));
    }
    else {
        if (meter.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            meter.runClose = false;
        }
        if (!state.vehID) {
            meter.turnOffRadio = false;
            meter.seatBelt = false;
            meter.seatCurrent = null;
        }
        if (meter.cruise.isActive) {
            SetEntityMaxSpeed(state.vehID, meter.cruise.maxSpeed);
            meter.cruise = {};
        }
    }
}, 0);
const prevent1 = [13, 8, 14];
const prevent2 = ['policeb'];
setTick(async () => {
    if (state.engineRunning && !meter.seatBelt && !prevent1.includes(state.vehClass) && !prevent2.includes(state.vehModel)) {
        const vehSpeed = GetEntitySpeed(state.vehID);
        const velocity = GetEntityVelocity(state.vehID);
        await Delay(50);
        const vehSpeedDiff = GetEntitySpeed(state.vehID);
        if (vehSpeed > (120 / 3.6) && (vehSpeed - vehSpeedDiff) > (vehSpeed * 0.255)) {
            const coords = GetEntityCoords(state.pedID, true);
            let heading = GetEntityHeading(state.pedID) + 90;
            if (heading < 0)
                heading = 360 + heading;
            heading = { x: Math.cos(heading) * 2.0, y: Math.sin(heading) * 2.0 };
            SetEntityCoords(state.pedID, coords[0] + heading.x, coords[1] + heading.y, coords[2] - 0.47, true, true, true, false);
            SetEntityVelocity(state.pedID, velocity[0], velocity[1], velocity[2]);
            await Delay(0);
            SetPedToRagdoll(state.pedID, 1e3, 1e3, 0, false, false, false);
        }
    }
});
setTick(() => {
    if (IsControlJustPressed(0, 20) && !prevent1.includes(state.vehClass) && !prevent2.includes(state.vehModel)) {
        meter.seatBelt = !meter.seatBelt;
    }
    if (meter.seatBelt) {
        DisableControlAction(0, 75, true);
        DisableControlAction(27, 75, true);
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    const pedID = GetPlayerPed(-1);
    const vehID = GetVehiclePedIsIn(pedID, false);
    switch (data.type) {
        case 'hideCursor':
            SetNuiFocus(false, false);
            meter.isOther = false;
            break;
        case 'handbrake':
            SetVehicleHandbrake(vehID, !GetVehicleHandbrake(vehID));
            break;
        case 'anchor':
            FreezeEntityPosition(vehID, !IsEntityPositionFrozen(vehID));
            break;
        case 'park':
            const plate = vehiclePrivate(vehID);
            if (plate) {
                const find = state.myVehicles.some(i => i.plate === plate);
                if (find) {
                    if (exports.NewStart_RealEstate.method('getCurrent').code) {
                        exports.NewStart_Notifications.showAttention('error', 'لا يمكن التنفيذ داخل المباني فقط بالخارج!');
                    }
                    else {
                        exports.NewStart_Notifications.showAttention('success', 'يمكنك استخراجها فيما بعد من استدعاء المركبات.');
                        emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate }), 'garage');
                    }
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون مالك المركبة للنقل للاستدعاء!');
                }
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'لا يمكن الحفظ مع هذه المركبة فقط المركبات الخاصة!');
            }
            break;
        case 'window':
            if (data.status)
                RollUpWindow(vehID, meter.seatCurrent + 1);
            else
                RollDownWindow(vehID, meter.seatCurrent + 1);
            break;
        case 'hood':
            if (data.status)
                SetVehicleDoorOpen(vehID, 4, false, false);
            else
                SetVehicleDoorShut(vehID, 4, false);
            break;
        case 'trunk':
            if (data.status)
                SetVehicleDoorOpen(vehID, 5, false, false);
            else
                SetVehicleDoorShut(vehID, 5, false);
            break;
        case 'door1':
        case 'door2':
        case 'door3':
            const value = parseInt(data.type.slice(-1));
            if (data.status)
                SetVehicleDoorOpen(vehID, value, false, false);
            else
                SetVehicleDoorShut(vehID, value, false);
            break;
    }
    cb('OK!');
});
let tickID = null;
onNet('NewStart_VehicleSystem:removePrivate-client', (data, withRemove = false) => {
    data = JSON.parse(data);
    for (let id of data) {
        const index = state.myVehicles.findIndex(obj => obj.id === id || obj.plate === id);
        state.plates.splice(state.plates.findIndex(p => p === state.myVehicles[index]?.plate || p === id), 1);
        if (index < 0)
            continue;
        if (withRemove)
            emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: state.myVehicles[index].vehID }));
        exports.NewStart_Parking.method('removeFromFilter', state.myVehicles[index].id);
        state.myVehicles.splice(index, 1);
    }
});
function vehiclePrivate(id) {
    const plate = GetVehicleNumberPlateText(id);
    if (new RegExp(/^[A-Z]{3} \d{4}$/).test(plate))
        return plate;
    else
        return null;
}
RegisterCommand('+engine', () => {
    if (state.vehClass === 13)
        return;
    const vehID = GetVehiclePedIsIn(PlayerPedId(), false);
    const engineRunning = vehID && GetIsVehicleEngineRunning(vehID);
    if (vehID && !GetVehicleFuelLevel(vehID)) {
        exports.NewStart_Notifications.showAttention('error', 'لا يوجد بنزين كافي لتشغيل المركبة!');
    }
    else if (vehID) {
        const plate = vehiclePrivate(vehID);
        const findKey = exports.NewStart_Inventory.info('currentItems').find((obj) => obj.id === 27 && obj.features.plate === plate);
        if (findKey || !plate || GetVehicleNumberPlateText(vehID) === exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).customID) {
            SetVehicleEngineOn(vehID, !engineRunning, false, true);
        }
        else if (plate && !findKey) {
            exports.NewStart_Notifications.showAttention('error', 'ليس لديك مفتاح المركبة للتحكم بها!');
        }
    }
}, false);
RegisterKeyMapping('+engine', 'Engine Toggle', 'keyboard', 'j');
setInterval(() => {
    for (let item of getMyVehicles()) {
        if (item.vehID) {
            const index = state.myVehicles.findIndex(i => i.id === item.id);
            if (GetVehicleEngineHealth(item.vehID) < -2500) {
                if (!state.myVehicles[index].destroyTime) {
                    state.myVehicles[index].destroyTime = Date.now();
                    exports.NewStart_Notifications.showAttention('error', `سيتم إعادة مركبتك "${GetVehicleNumberPlateText(item.vehID).trim()}" للجراج بعد 60 ثانية بسبب الانفجار!`);
                }
                else if ((Date.now() - state.myVehicles[index].destroyTime) >= 60000) {
                    const plate = GetVehicleNumberPlateText(item.vehID).trim();
                    emit('NewStart_VehicleSystem:removePrivate-client', JSON.stringify([plate]), true);
                    exports.NewStart_Notifications.showAttention('error', `تم إعادة مركبتك ${plate} للجراج!`);
                }
            }
            else {
                state.myVehicles[index].destroyTime = 0;
            }
        }
    }
}, 5000);
exports('repairItem', () => {
    const [x, y, z] = GetEntityCoords(state.pedID, true);
    const vehID = getClosestVeh();
    let canStart = false;
    if (vehID) {
        const index = GetEntityBoneIndexByName(vehID, 'engine');
        const coords = GetWorldPositionOfEntityBone(vehID, index);
        const distanceBone = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);
        if ((state.vehClass === 15 && distanceBone <= 2.3) || distanceBone <= 1.8) {
            canStart = true;
        }
    }
    if (canStart) {
        const vehCoords = GetEntityCoords(vehID, true);
        const heading = GetHeadingFromVector_2d(vehCoords[0] - x, vehCoords[1] - y);
        const fuel = GetVehicleFuelLevel(vehID);
        SetEntityHeading(state.pedID, heading);
        SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
        SetVehicleDoorOpen(vehID, 4, false, true);
        TaskStartScenarioInPlace(state.pedID, "PROP_HUMAN_BUM_BIN", 0, true);
        exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true });
        SetVehicleHandbrake(vehID, true);
        setTimeout(() => {
            const plate = vehiclePrivate(vehID);
            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
            SetVehicleFixed(vehID);
            SetVehicleEngineHealth(vehID, 1000);
            SetVehicleDoorShut(vehID, 4, false);
            SetVehicleHandbrake(vehID, false);
            SetEntityMaxSpeed(vehID, GetVehicleHandlingFloat(vehID, 'CHandlingData', 'fInitialDriveMaxFlatVel'));
            SetVehicleFuelLevel(vehID, fuel);
            if (!IsEntityDead(state.pedID))
                ClearPedTasksImmediately(state.pedID);
            if (plate)
                emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate, damage: 1000 }));
        }, 10000);
        return true;
    }
    else {
        emit('NewStart_Inventory:additem-client', JSON.stringify({ id: 37, count: 1 }), true);
        exports.NewStart_Notifications.showAttention('error', 'قف أمام محرك المركبة للاستخدام الأداة!');
        return false;
    }
});
const state = {
    isFirst: true,
    pedID: 0,
    vehID: 0,
    vehClass: 0,
    vehModel: '',
    engineRunning: false,
    plates: [],
    myVehicles: [],
    isClearTasks: false,
    isDamage: false,
    bones: [
        'taillight_l', 'taillight_r', 'boot', 'petrolcap', 'petroltank', 'petroltank_r',
        'petroltank_l', 'chassis_dummy', 'engine', 'wheel_lr', 'wheel_rr', 'wheel_lf', 'wheel_rf'
    ]
};
