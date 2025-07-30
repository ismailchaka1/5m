"use strict";
RequestAnimSet('amb@code_human_in_bus_passenger_idles@female@tablet@base');
RequestAnimDict('mp_character_creation@customise@male_a');
RequestAnimDict('amb@world_human_muscle_free_weights@male@barbell@base');
RequestModel(1943210810);
RequestModel(-1623189257);
RequestModel(-486823720);
setInterval(() => {
    state.faction = exports.NewStart_Factions.info();
    state.isActive = state.jobKeys.includes(state.faction?.key) && exports.NewStart_Employee.data().isActive;
    state.isActiveExtra = state.jobKeysExtra.includes(state.faction?.key) && exports.NewStart_Employee.data().isActive;
    if (state.isActive && !timer.execute.blipID) {
        timer.execute.blipID = createBlip(188, 'ﻦﻴﻤﻬﺘﻤﻟﺍ ﻢﻴﻠﺴﺗ', timer.execute.coords[0], 3);
        for (let item of reservation.delivery.items)
            item.blipID = createBlip(461, 'ﺰﺠﺤﻠﻟ ﻢﻴﻠﺴﺘﻟﺍ', item, 3);
        for (let item of taboos.coords.filter(obj => obj.jobKey === state.faction.key))
            item.blipID = createBlip(140, 'ﺕﺎﻋﻮﻨﻤﻤﻟﺍ ﻢﻴﻠﺴﺗ', item, 3);
    }
    else if (!state.isActive && timer.execute.blipID) {
        RemoveBlip(timer.execute.blipID);
        timer.execute.blipID = 0;
        for (let item of [...reservation.delivery.items, ...taboos.coords])
            RemoveBlip(item.blipID);
        reports.items = [];
        exports.NewStart_PoliceTools.method('radarToggle', false);
        SendNuiMessage(JSON.stringify({ type: 'setState', isMain: true, info: { isRadar: false } }));
    }
    if (state.isActive || state.isActiveExtra) {
        state.phone = state.faction?.key === 'police' ? '911' : state.faction.key === 'facilities' ? '997' : '999';
        SendNuiMessage(JSON.stringify({ type: 'setState', isMain: true, info: { type: state.faction.key } }));
    }
}, 2500);
RegisterCommand('+police', () => {
    if ((state.isActive || state.isActiveExtra) && !IsPauseMenuActive() && !IsWarningMessageActive()) {
        emitNet('NewStart_Factions:initial-server', state.faction.id);
        if (state.isActive)
            emitNet('NewStart_Police:handleReports-server', 'getHome');
        if (!IsPedInAnyVehicle(state.pedID, true)) {
            TaskPlayAnim(state.pedID, 'amb@code_human_in_bus_passenger_idles@female@tablet@base', 'base', 2.0, 2.0, -1, 49, 0.0, false, false, false);
            SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
            state.tabletID = CreateObject(1943210810, state.coords[0], state.coords[1], state.coords[2], true, false, false);
            AttachEntityToEntity(state.tabletID, state.pedID, GetPedBoneIndex(state.pedID, 28422), 0.0, 0.01, -0.05, 0.0, 0.0, -0.0, true, true, false, true, 1.0, true);
        }
        state.isOpen = true;
        SetNuiFocus(true, true);
        SendNuiMessage(JSON.stringify({
            type: 'setState',
            isOpen: true,
            isNearby: state.isActive ? isPlayerNearby() : false,
            info: {
                type: state.faction.key,
                name: state.faction.playerName,
                code: state.faction.code,
                time: exports.NewStart_Tools.method('getInfo').time,
                rankID: state.faction.rankID
            }
        }));
    }
}, false);
RegisterKeyMapping('+police', 'Police MDT', 'keyboard', 'f4');
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    if (!state.isActive && !state.isActiveExtra) {
        closeUI(true);
        return cb('OK!');
    }
    ;
    switch (data.type) {
        case 'getPlayer':
            if (data.isFast) {
                data.value = exports.NewStart_Initialize.method('getClosestPlayer', { noFactions: true })?.serverID;
            }
            if (data.value) {
                emitNet('NewStart_Police:handleGeneral-server', data.type, { isFast: data.isFast, value: data.value });
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي مواطن متواجد بالقرب منك كفاية!');
                SendNuiMessage(JSON.stringify({ type: 'setState', info: { isLoading: false } }));
            }
            break;
        case 'getData':
            if (data.activeKey === 'vehicle') {
                if ((!data.value && !data.isFast) || !new RegExp(/^[a-zA-Z0-9\s]+$/).test(data.value)) {
                    exports.NewStart_Notifications.showAttention('error', 'لم يتم إيجاد المركبة المطلوبة تأكد من رقم اللوحة أولا!');
                    SendNuiMessage(JSON.stringify({ type: 'setState', info: { isLoading: false } }));
                }
                else if (data.isFast) {
                    const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh');
                    if (vehID) {
                        const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
                        if (plate) {
                            emitNet('NewStart_Police:handleGeneral-server', 'getData', plate);
                        }
                        else {
                            exports.NewStart_Notifications.showAttention('error', 'يمكنك فقط الاستعلام عن المركبات الخاصة!');
                            SendNuiMessage(JSON.stringify({ type: 'setState', info: { isLoading: false } }));
                        }
                    }
                    else {
                        exports.NewStart_Notifications.showAttention('error', 'لا يوجد مركبة يمكن الاستعلام عنها قريبة كفاية!');
                        SendNuiMessage(JSON.stringify({ type: 'setState', info: { isLoading: false } }));
                    }
                }
                else {
                    emitNet('NewStart_Police:handleGeneral-server', 'getData', data.value);
                }
            }
            break;
        case 'editPlayer':
            if (state.player?.isProtected) {
                exports.NewStart_Notifications.showAttention('error', 'لديه حماية قانونية يمكنك رفع شكوى ضده بدلاً من ذلك!');
                return cb('OK!');
            }
            if (data.info.type !== 'status')
                data.info.item.from = state.faction.code;
            if (data.info.type === 'jail') {
                if (!isPlayerNearby()) {
                    exports.NewStart_Notifications.showAttention('error', 'المتهم يجب أن يكون قريب منك لتنفيذ أمر السجن!');
                    return cb('OK!');
                }
                else if (!timer.execute.typeCurrent) {
                    const booth = GetClosestObjectOfType(state.coords[0], state.coords[1], state.coords[2], 2, GetHashKey("prop_air_sechut_01"), true, true, true);
                    if (!booth) {
                        exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون في مدخل مبني A2 أو زنزانات المراكز والأكشاك!');
                        return cb('OK!');
                    }
                }
                if (timer.execute.typeCurrent === 'main') {
                    emitNet('NewStart:giveMoney', { name: 'السجون الفيدرالية', amount: 15000 });
                    exports.NewStart_MainMenu.levelUp(250);
                }
                SendNuiMessage(JSON.stringify({ type: 'addToOther', info: { _id: Date.now().toString(), ...data.info.item, date: new Date() } }));
            }
            else if (['records', 'violations'].includes(data.info.type)) {
                if (!isPlayerNearby()) {
                    exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون قريب منك لتنفيذ الأمر!');
                    return cb('OK!');
                }
                else {
                    SendNuiMessage(JSON.stringify({ type: 'setState', arrPlayerType: data.info.type, info: { _id: Date.now().toString(), from: data.info.item.from, title: data.info.item.title || data.info.item.name, date: new Date() } }));
                }
            }
            emitNet('NewStart_Police:handleGeneral-server', data.type, { ...data.info, ...state.player, phone: state.phone, key: state.faction.key, rankName: state.faction.rankName });
            break;
        case 'editVehicle':
            const code = state.faction.code;
            if (data.info.type === 'wanted') {
                emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate: data.plate, wanted: { title: data.info.value, lastEdit: new Date() } }));
                emitNet('NewStart_Police:handleOther-server', 'addVehWanted', { plate: data.plate, isRemove: !data.info.value, date: Date.now(), key: state.faction.key });
            }
            else if (data.info.type === 'violations') {
                const item = { id: data.info.id, from: code, title: data.info.value.trim(), price: reservation.price, attachID: 0 };
                if (reservation.delivery.runClose) {
                    const attachID = IsVehicleModel(state.vehID, FLATBED_MODEL) ? exports.NewStart_Tools.method('getInfo').attachID : GetEntityAttachedToTowTruck(state.vehID);
                    const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', attachID);
                    if (attachID && plate === data.plate) {
                        const type = exports.NewStart_VehicleDealership.getData('vehicles').find((v) => v.hash === GetEntityModel(attachID) || v.hash === GetEntityArchetypeName(attachID))?.vehType;
                        if (type) {
                            item.price = type === 'truck' ? item.price * 2 : item.price;
                            item.attachID = NetworkGetNetworkIdFromEntity(attachID);
                            reservationReward(attachID);
                            emitNet('NewStart_Police:handleGeneral-server', data.type, { phone: state.phone, pushType: 'violations', ...item, plate: data.plate });
                            SendNuiMessage(JSON.stringify({ type: 'addToOther', info: { _id: Date.now().toString(), ...item, date: new Date() } }));
                        }
                    }
                    else {
                        exports.NewStart_Notifications.showAttention('error', 'ليس لديك المركبة لتسليمها للحجز!');
                    }
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'يجب التواجد في مكان التسليم مع المركبة بالسطحة أو السحب!');
                }
            }
            break;
        case 'license':
            if (!isPlayerNearby()) {
                exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون قريب منك لتنفيذ الأمر!');
            }
            else {
                SendNuiMessage(JSON.stringify({ type: 'setState', isPlayer: true, info: data.info }));
                emitNet('NewStart_Police:handleReports-server', 'update', { license: state.player?.license, serverID: state.player?.serverID, key: state.faction.key, phone: state.phone, data: data.info });
            }
            break;
        case 'radarToggle':
            if (data.value) {
                if (IsVehicleModel(state.vehID, 353883353)) {
                    exports.NewStart_Notifications.showAttention('error', 'لا يمكن تشغيل هذا النوع من الرادارات داخل الطائرات!');
                }
                else if (state.vehID && exports.NewStart_Employee.method('getVehInfo', GetEntityArchetypeName(state.vehID), true)) {
                    SendNuiMessage(JSON.stringify({ type: 'setState', isMain: true, info: { isRadar: true } }));
                    exports.NewStart_PoliceTools.method('radarToggle', data.value);
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون داخل مركبة تابعة لوظيفتك الحالية!');
                }
            }
            else {
                exports.NewStart_PoliceTools.method('radarToggle', data.value);
                SendNuiMessage(JSON.stringify({ type: 'setState', isMain: true, info: { isRadar: false } }));
            }
            break;
        case 'resetPlayer':
            state.player = null;
            break;
        case 'notification':
            exports.NewStart_Notifications.showAttention(data.action, data.text);
            break;
        default:
            closeUI(false, true);
            break;
    }
    cb('OK!');
});
exports('method', (type, data, more) => {
    if (type === 'info') {
        return { isReservation: reservation.isCurrent, jailProgress: timer.isProgress, isJailed: timer.isJailed || timer.isProgress, isInjuredDrag: !!injured.timeoutID };
    }
    else if (type === 'timerToggle') {
        if (timer.isJailed) {
            if (data)
                SendNuiMessage(JSON.stringify({ type: 'setTimer', removeHide: true }));
            else
                SendNuiMessage(JSON.stringify({ type: 'setTimer', isHide: true }));
        }
    }
    else if (type === 'playerDrag') {
        if (data)
            return injured.isAttach;
        else
            toggleDragPed();
    }
    else if (type === 'unlock') {
        unlockDoors();
    }
    else if (type === 'drugs') {
        drugTest();
    }
    else if (type === 'vehWanted') {
        return state.vehWanted;
    }
    else if (type === 'setVipTax') {
        if (data === 'reservation')
            reservation.vipTax = more;
    }
    else if (type === 'closeUI') {
        if (state.isOpen)
            closeUI(true);
        if (injured.timeoutID)
            toggleDragPed();
        DeleteObject(state.tabletID);
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_Police:handleGeneral-client', (type, data) => {
    if (data)
        data = JSON.parse(data);
    if (type === 'setHome') {
        SendNuiMessage(JSON.stringify({ type, info: data }));
    }
    else if (type === 'setPlayer') {
        if (data) {
            let serverID = 0, clientID = -1;
            if (typeof data.job !== 'string') {
                if (Number.isInteger(data.job2?.id))
                    data.job = exports.NewStart_Jobs.method('getJob', data.job2.id).name;
                else
                    data.job = 'عاطل عن العمل';
            }
            if (data.serverID) {
                for (let id of GetActivePlayers()) {
                    const value = GetPlayerServerId(id);
                    if (value == data.serverID) {
                        serverID = value;
                        clientID = id;
                        break;
                    }
                }
            }
            state.player = { customID: data.customID, license: data.license, serverID, clientID, isProtected: data.isProtected };
            const isNearby = isPlayerNearby();
            if (isNearby && data.vehicles.length) {
                const vehID = GetVehiclePedIsIn(GetPlayerPed(state.player.clientID), false);
                const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);
                const index = data.vehicles.findIndex((v) => v.plate === plate);
                if (index >= 0)
                    data.vehicles[index].isCurrent = true;
            }
            SendNuiMessage(JSON.stringify({ type: 'setState', info: { isLoading: false, player: { ...data, isNearby, isProtected: !!data.isProtected } } }));
        }
        else {
            SendNuiMessage(JSON.stringify({ type: 'setState', info: { isLoading: false } }));
            exports.NewStart_Notifications.showAttention('error', 'لم يتم إيجاد المواطن المطلوب تأكد أولا!');
        }
    }
    else if (type === 'setOther') {
        if (data) {
            SendNuiMessage(JSON.stringify({ type: 'addToOther', key: 'vehicle', info: data }));
        }
        else {
            SendNuiMessage(JSON.stringify({ type: 'setState', info: { isLoading: false } }));
            exports.NewStart_Notifications.showAttention('error', 'لم يتم إيجاد المركبة المطلوبة تأكد من رقم اللوحة أولا!');
        }
    }
    else if (type === 'setReservation') {
        reservation.save = data.map((i) => ({ ...i, price: i.vehType === 'truck' ? reservation.price * 2 : reservation.price }));
    }
    else if (type === 'startJail') {
        if (data.isEnd)
            endJail();
        else if (!timer.isJailed)
            startJail(data);
    }
    else if (type === 'circulate') {
        if ([...state.jobKeys, ...state.jobKeysExtra].includes(state.faction?.key) && !exports.NewStart_Factions.info().isVacation) {
            const length = reports.circulate.length;
            if (length >= 10) {
                reports.circulate.splice(length - 1, 1);
            }
            reports.circulate.unshift(data);
            SendNuiMessage(JSON.stringify({ type: 'setCirculate', info: reports.circulate }));
            if (exports.NewStart_Employee.data().isActive) {
                exports.NewStart_Notifications.sendAlert(`تعميم - ${data.title}`);
            }
            else {
                emit('NewStart_Phone:receiveMessage-client', JSON.stringify({ number: state.phone, text: `تعميم - ${data.title}، ${data.content}` }));
            }
        }
    }
    else if (type === 'distress') {
        if (data.action === 'add') {
            const time = Date.now();
            for (let item of (data.items ? data.items.filter((i) => (time - i.id) < distress.maxTime) : [data])) {
                item.blipID = AddBlipForRadius(item.location.coord[0], item.location.coord[1], item.location.coord[2], distress.info[item.type].size);
                const distance = GetDistanceBetweenCoords(item.location.coord[0], item.location.coord[1], item.location.coord[2], state.coords[0], state.coords[1], state.coords[2], true);
                item.skipZone = distance <= distress.info[item.type].size;
                SetBlipColour(item.blipID, distress.info[item.type].color1);
                SetBlipHighDetail(item.blipID, true);
                SetBlipAlpha(item.blipID, 80);
                item.isOwner = item.ownerID === GetPlayerServerId(PlayerId());
                distress.items.push(item);
                if (!data.items && item.isOwner)
                    distress.isLoading = false;
                if (!data.items && state.isActive && !item.isOwner)
                    exports.NewStart_Notifications.sendAlert(`تم رفع ${distress.info[item.type].name} يبعد عنك ${distance} متر`);
            }
        }
        else {
            const index = distress.items.findIndex(i => i.id === data.id);
            if (exports.NewStart_Tools.method('getInfo').isZone) {
                const item = distress.items[index];
                const distance = GetDistanceBetweenCoords(item.location.coord[0], item.location.coord[1], item.location.coord[2], state.coords[0], state.coords[1], state.coords[2], true);
                if (distance <= distress.info[item.type].size) {
                    exports.NewStart_Tools.method('setZone', false);
                    item.isZone = false;
                }
            }
            if (index >= 0) {
                RemoveBlip(distress.items[index].blipID);
                distress.items.splice(index, 1);
            }
        }
        SendNuiMessage(JSON.stringify({ type: 'setHome', info: { distress: distress.items } }));
    }
});
function isPlayerNearby() {
    let isNearby = false;
    if (state.player?.serverID) {
        const target = GetEntityCoords(GetPlayerPed(state.player.clientID), true);
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], target[0], target[1], target[2], true);
        if (distance < 5)
            isNearby = true;
    }
    return isNearby;
}
function createBlip(id, name, coords, color) {
    const blip = AddBlipForCoord(coords.x, coords.y, coords.z);
    SetBlipSprite(blip, id);
    SetBlipAsShortRange(blip, true);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(`<font face="A9eelsh">${name}</font>`);
    EndTextCommandSetBlipName(blip);
    if (color)
        SetBlipColour(blip, color);
    if (id === 188)
        SetBlipScale(blip, 1.4);
    return blip;
}
function drawText3D(coord, text) {
    SetTextScale(0.26, 0.26);
    SetTextProportional(true);
    SetTextColour(255, 255, 255, 200);
    SetTextOutline();
    SetTextEntry("STRING");
    SetTextCentre(true);
    AddTextComponentString(`<font face="A9eelsh">${text}</font>`);
    SetDrawOrigin(coord[0], coord[1], coord[2], 0);
    DrawText(0.0, 0.0);
    ClearDrawOrigin();
}
function closeUI(withNUI = false, isOther = false) {
    if (withNUI) {
        SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
    }
    else if (isOther) {
        if (reservation.delivery.runClose) {
            SendNUIMessage(JSON.stringify({
                type: 'entranceOpen', info: { type: 'normal', isMoreTop: !!IsVehicleModel(GetVehiclePedIsIn(state.pedID, false), TOWTRUCK_MODEL) }
            }));
        }
    }
    state.isOpen = false;
    reservation.delivery.runClose = false;
    SetNuiFocus(false, false);
    DeleteObject(state.tabletID);
    ClearPedTasks(state.pedID);
}
onNet('NewStart_Police:handleOther-client', (type, data) => {
    if (type === 'playerDrag') {
        if (!data.value) {
            DetachEntity(state.pedID, true, true);
            ClearPedTasks(state.pedID);
            TaskPlayAnim(state.pedID, 'combat@drag_ped@', 'injured_putdown_ped', 2.0, 2.0, -1, 2, 0, false, false, false);
            clearTimeout(injured.timeoutID);
            injured.timeoutID = setTimeout(() => {
                injured.isAttach = false;
                injured.timeoutID = 0;
            }, 5000);
        }
        else {
            clearTimeout(injured.timeoutID);
            injured.isAttach = true;
            ClearPedTasks(state.pedID);
            const targetPed = GetPlayerPed(GetPlayerFromServerId(data.id));
            SetEntityHeading(state.pedID, GetEntityHeading(targetPed));
            AttachEntityToEntity(state.pedID, targetPed, 11816, 0.05, 0.5, 0.05, 0, 0, 0, false, false, true, false, 2, false);
            TaskPlayAnim(state.pedID, 'combat@drag_ped@', 'injured_pickup_back_ped', 2.0, 2.0, -1, 2, 0, false, false, false);
            injured.timeoutID = setTimeout(() => {
                TaskPlayAnim(state.pedID, 'combat@drag_ped@', 'injured_drag_ped', 2.0, 2.0, -1, 1, 0, false, false, false);
                injured.timeoutID = 0;
            }, 5700);
        }
    }
    else if (type === 'follow') {
        if (IsEntityAttached(state.pedID)) {
            DetachEntity(state.pedID, true, true);
        }
        else {
            AttachEntityToEntity(state.pedID, GetPlayerPed(GetPlayerFromServerId(data)), 11816, -0.1, 0.6, 0.0, 0.0, 0.0, 20.0, false, false, false, false, 20, false);
        }
    }
    else if (type === 'setSeat') {
        if (state.vehID) {
            const coord = GetEntityCoords(GetPlayerPed(GetPlayerFromServerId(data.policeID)), false);
            SetEntityCoords(state.pedID, coord[0], coord[1], coord[2] - 1, false, false, false, false);
            setTimeout(() => TaskPlayAnim(state.pedID, 'mp_arresting', 'idle', 8, -8, -1, 17, 0, false, false, false), 500);
        }
        else {
            const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh');
            DetachEntity(state.pedID, true, true);
            for (let i = (GetVehicleModelNumberOfSeats(GetEntityModel(vehID)) - 2); i >= 0; i--) {
                if (IsVehicleSeatFree(vehID, i)) {
                    SetPedIntoVehicle(state.pedID, vehID, i);
                    break;
                }
            }
            exports.NewStart_VehicleSystem.method('setSeatBelt');
        }
    }
    else if (type === 'drugTest') {
        let result = '';
        if ((Date.now() - exports.NewStart_Taboos.method('lastDrunk')) < 1800000) {
            result = 'negative';
        }
        else {
            result = 'positive';
        }
        emitNet('NewStart_Police:handleOther-server', 'drugResult', { id: data, result });
    }
    else if (type === 'drugResult') {
        state.drugResult = data;
    }
    else if (type === 'addVehWanted') {
        state.vehWanted = JSON.parse(data);
    }
    else if (type === 'reward') {
        emitNet('NewStart:giveMoney', { name: 'إعطاء المخالفات', amount: data.price });
    }
});
function unlockDoors() {
    if (!exports.NewStart_Inventory.info('currentItems').some((i) => i.id === 110)) {
        return exports.NewStart_Notifications.showAttention('error', 'يتطلب هذا وجود معك أداة اللحام في الحقيبة!');
    }
    else if (state.vehID) {
        return exports.NewStart_Notifications.showAttention('error', 'اخرج من المركبة أولا قبل استخدام هذا!');
    }
    const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh');
    let house = null;
    if (!vehID) {
        for (let item of exports.NewStart_RealEstate.method('getData').filter((i) => i.isOwned)) {
            const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], item.coord.x, item.coord.y, item.coord.z, true);
            if ((item.type === 'garage' && distance < 2.4) || distance < 0.6) {
                house = item;
                break;
            }
        }
    }
    if (house) {
        if (!house.isLock) {
            return exports.NewStart_Notifications.showAttention('error', 'لا حاجه لاستخدام هذا أبواب العقار مفتوحة بالفعل!');
        }
        unlockTypes('house', house.code, -house.coord.h);
    }
    else if (vehID) {
        let isNext = false, heading = 0;
        for (let name of ['doorlight_lf', 'wheel_lf', 'door_dside_f']) {
            const index = GetEntityBoneIndexByName(vehID, name);
            const coords = GetWorldPositionOfEntityBone(vehID, index);
            const distanceBone = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], coords[0], coords[1], coords[2], true);
            if (distanceBone <= 1.7) {
                isNext = true;
                heading = GetEntityHeading(vehID);
                break;
            }
        }
        if (!isNext)
            return exports.NewStart_Notifications.showAttention('error', 'يجب الافتراب من الباب الأساسي للمركبة!');
        if (GetVehicleDoorLockStatus(vehID) === 4) {
            unlockTypes('vehicle', vehID, heading - 90);
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'لا حاجه لاستخدام هذا أبواب المركبة مفتوحة بالفعل!');
        }
    }
    else {
        exports.NewStart_Notifications.showAttention('error', 'أقترب من الباب الأساسي للمركبة أو من باب العقار من الخارج!');
    }
}
function unlockTypes(type, id, heading, more) {
    const maskID = CreateObject(-1821801372, 0, 0, 0, true, true, false);
    AttachEntityToEntity(maskID, state.pedID, GetPedBoneIndex(state.pedID, 12844), 0.115, 0.02, 0, 0, 90, 180, true, true, false, true, 1, true);
    exports.NewStart_Inventory.removeItem(JSON.stringify({ id: 110, count: 1 }));
    SetEntityHeading(state.pedID, heading);
    TaskStartScenarioInPlace(state.pedID, 'WORLD_HUMAN_WELDING', 0, false);
    exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '15s', status: true });
    setTimeout(() => {
        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
        ClearPedTasks(state.pedID);
        DeleteObject(maskID);
        if (type === 'house') {
            emitNet('NewStart_RealEstate:handleInterior-server', 'toggleKey', JSON.stringify({ type: more, code: id, value: false }));
            exports.NewStart_Notifications.showAttention('success', 'لقد قمت للتو بفتح الباب الرئيسي للعقار!');
        }
        else if (type === 'vehicle') {
            SetVehicleDoorsLocked(id, 1);
            PlayVehicleDoorOpenSound(id, 0);
            exports.NewStart_Notifications.showAttention('success', 'لقد قمت للتو بفتح جميع أبواب المركبة!');
        }
    }, 15000);
}
function drugTest() {
    const player = exports.NewStart_Initialize.method('getClosestPlayer', { noFactions: true });
    if (player) {
        emitNet('NewStart_Police:handleOther-server', 'drugTest', player.serverID);
        exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true, canMove: true });
        setTimeout(() => {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
            if (state.drugResult)
                exports.NewStart_Notifications.sendAlert(state.drugResult === 'positive' ? 'نتيجة التحليل سلبية لا يتعاطي الممنوعات.' : 'نتيجة التحليل إيجابية يتعاطي الممنوعات.');
            state.drugResult = '';
        }, 5000);
    }
    else {
        exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي مواطن متواجد بالقرب منك كفاية!');
    }
}
const state = {
    phone: '911',
    pedID: 0,
    vehID: 0,
    coords: [],
    faction: null,
    isActive: false,
    isActiveExtra: false,
    jobKeys: ['police', 'facilities'],
    jobKeysExtra: ['health'],
    isOpen: false,
    tabletID: 0,
    player: null,
    drugResult: '',
    vehWanted: []
};
const empty = null;
const distress = {
    pressedTime: 0,
    isDone: false,
    isLoading: false,
    maxTime: 1800000,
    items: [],
    info: {
        normal: { name: 'نداء الاستغاثة', size: 100, distance: 110, color1: 76, color2: 72 },
        alert: { name: 'الاستنفار الأمني', size: 120, distance: 130, color1: 1, color2: 38 }
    }
};
setTick(() => {
    if (state.isActive) {
        if (IsControlPressed(0, 56) && !distress.isDone && !distress.isLoading) {
            if (!distress.pressedTime)
                distress.pressedTime = Date.now();
            if ((Date.now() - distress.pressedTime) >= 2000) {
                distress.isDone = true;
                distress.isLoading = true;
                handleDistress('normal');
            }
        }
        else if (IsControlJustReleased(0, 56)) {
            distress.isDone = false;
            distress.pressedTime = 0;
        }
    }
    else {
        for (let item of distress.items) {
            if (item.skipZone)
                continue;
            const distance = GetDistanceBetweenCoords(item.location.coord[0], item.location.coord[1], item.location.coord[2], state.coords[0], state.coords[1], state.coords[2], true);
            const isDistance = distance <= distress.info[item.type].size;
            if (!item.isZone && isDistance) {
                exports.NewStart_Notifications.sendAlert('أحذر منطقة استنفار ستعرض نفسك للخطر!');
                exports.NewStart_Tools.method('setZone', true);
                item.isZone = true;
            }
            else if (item.isZone && !isDistance) {
                exports.NewStart_Tools.method('setZone', false);
                item.isZone = false;
            }
        }
    }
});
function handleDistress(type, reason) {
    let isAway = false;
    const find = distress.items.find(item => {
        let distance = GetDistanceBetweenCoords(item.location.coord[0], item.location.coord[1], item.location.coord[2], state.coords[0], state.coords[1], state.coords[2], true);
        distance = distress.info[type].distance >= distance;
        isAway = item.isOwner && !distance;
        return distance || isAway;
    });
    if (find) {
        if (type === 'alert') {
            exports.NewStart_Notifications.showAttention('error', `سبق وأن قمت بإطلاق ${distress.info[find.type].name} استخدم F9 للإلغاء أولا!`);
        }
        else {
            emitNet('NewStart_Police:handleReports-server', 'distress', { id: find.id, type, action: 'remove', key: state.faction.key, code: state.faction.code });
            if (isAway)
                exports.NewStart_Notifications.showAttention('error', `تم حذف ${distress.info[find.type].name} الذي لك من هناك!`);
            else
                exports.NewStart_Notifications.showAttention('error', `تم حذف ${distress.info[find.type].name} من هذه المنطقة!`);
        }
        distress.isLoading = false;
    }
    else {
        const zoneGreen = exports.NewStart_Tools.method('data', 'zones');
        let isGreen = false;
        for (let item of zoneGreen) {
            const distance = GetDistanceBetweenCoords(item.coords.x, item.coords.y, item.coords.z, state.coords[0], state.coords[1], state.coords[2], true);
            if (distance <= item.distance) {
                isGreen = true;
                break;
            }
        }
        if (isGreen) {
            distress.isLoading = false;
            return exports.NewStart_Notifications.showAttention('error', `لا يمكن رفع ${distress.info[type].name} بالقرب من منطقة أمنة!`);
        }
        else {
            const robberies = exports.NewStart_Robbery.method('places');
            let isRobbery = false;
            for (let item of robberies) {
                if (item.alert) {
                    const distance = GetDistanceBetweenCoords(item.coordMain.x, item.coordMain.y, item.coordMain.z, state.coords[0], state.coords[1], state.coords[2], true);
                    if (distance <= 125) {
                        isRobbery = true;
                        break;
                    }
                }
            }
            if (isRobbery) {
                distress.isLoading = false;
                return exports.NewStart_Notifications.showAttention('error', `لا يمكن رفع ${distress.info[type].name} بالقرب من منطقة سرقة!`);
            }
        }
        const item = {
            action: 'add', type, reason,
            key: state.faction.key,
            time: exports.NewStart_Tools.method('getInfo').time,
            location: { name: exports.NewStart_Initialize.getPlace(), coord: state.coords },
            code: state.faction.code
        };
        emitNet('NewStart_Police:handleReports-server', 'distress', item);
        exports.NewStart_Notifications.showAttention('success', `تم رفع ${distress.info[type].name} في هذه المنطقة!`);
    }
}
setInterval(() => {
    const length = distress.items.length;
    if (length) {
        for (let item of distress.items) {
            if ((Date.now() - item.id) >= distress.maxTime) {
                RemoveBlip(item.blipID);
                distress.items.splice(distress.items.findIndex(i => i.id === item.id), 1);
            }
            else {
                SetBlipColour(item.blipID, GetBlipColour(item.blipID) === distress.info[item.type].color1 ? distress.info[item.type].color2 : distress.info[item.type].color1);
            }
        }
        if (length !== distress.items.length)
            SendNuiMessage(JSON.stringify({ type: 'setHome', info: { distress: distress.items } }));
    }
}, 500);
const injured = { timeoutID: 0, targetID: 0, isAttach: false };
RequestAnimDict('combat@drag_ped@');
function toggleDragPed(isEnd) {
    if (!injured.timeoutID && !isEnd) {
        injured.targetID = exports.NewStart_Medicine.method('getPlayerDead');
        if (injured.targetID) {
            emitNet('NewStart_Police:handleOther-server', 'playerDrag', { id: injured.targetID, value: true });
            TaskPlayAnim(state.pedID, 'combat@drag_ped@', 'injured_pickup_back_plyr', 2.0, 2.0, -1, 2, 0, false, false, false);
            injured.timeoutID = setTimeout(() => {
                ClearPedTasks(state.pedID);
                TaskPlayAnim(state.pedID, 'combat@drag_ped@', 'injured_drag_plyr', 2.0, 2.0, -1, 33, 0, false, false, false);
            }, 5700);
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'أنت لست قريب بما يكفي من شخص مصاب!');
        }
    }
    else {
        clearTimeout(injured.timeoutID);
        ClearPedTasks(state.pedID);
        emitNet('NewStart_Police:handleOther-server', 'playerDrag', { id: injured.targetID, value: false });
        TaskPlayAnim(state.pedID, 'combat@drag_ped@', 'injured_putdown_plyr', 2.0, 2.0, -1, 0, 0, false, false, false);
        injured.timeoutID = 0;
    }
}
const timer = {
    isJailed: false,
    isProgress: false,
    isEscape: false,
    intervalID: 0,
    timeoutID: 0,
    isEndFromAdmin: false,
    execute: {
        typeCurrent: '', blipID: 0,
        coords: [
            { type: 'main', x: 1787.4197, y: 2594.8088, z: 45.7927, d: 5.8 },
            { type: 'sub', x: -445.7670, y: 6015.1254, z: 26.5780, d: 5.77 },
            { type: 'sub', x: 1862.7692, y: 3692.3603, z: 30.2572, d: 7.4 },
            { type: 'sub', x: -2997.0197, y: 2705.4460, z: 9.8352, d: 8 },
        ]
    },
    dungeons: [
        { x: 1789.5692, y: 2585.8945, z: 44.7927, h: 87.8740 }, { x: 1789.6351, y: 2582.0043, z: 44.7927, h: 87.8740 },
        { x: 1789.6614, y: 2578.1406, z: 44.7927, h: 87.8740 }, { x: 1789.6087, y: 2574.1450, z: 44.7927, h: 87.8740 },
        { x: 1769.3011, y: 2573.8549, z: 44.7927, h: 269.2913 }, { x: 1769.2879, y: 2577.8374, z: 44.7927, h: 269.2913 },
        { x: 1769.3538, y: 2581.7802, z: 44.7927, h: 269.2913 }, { x: 1769.2615, y: 2585.6835, z: 44.7927, h: 269.2913 }
    ],
    activities: {
        isActive: false,
        objectID: 0,
        runClose: false,
        items: [
            { type: 'chin', x: 1773.1779, y: 2594.9406, z: 44.7927, h: 270.1259 }, { type: 'chin', x: 1773.1716, y: 2596.7509, z: 44.7927, h: 270.1259 },
            { type: 'weights', x: 1767.3099, y: 2598.7780, z: 44.7927, h: 181.4173 }, { type: 'weights', x: 1769.5252, y: 2598.6330, z: 44.7927, h: 181.4173 },
            { type: 'weights', x: 1772.3736, y: 2598.5012, z: 44.7927, h: 181.4173 }
        ]
    }
};
setTick(() => {
    if (state.isActive) {
        for (let item of timer.execute.coords) {
            const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, state.coords[0], state.coords[1], state.coords[2], true);
            if (distance < item.d) {
                timer.execute.typeCurrent = item.type;
                break;
            }
            else {
                timer.execute.typeCurrent = '';
            }
        }
    }
    else if (timer.isProgress) {
        DisableAllControlActions(0);
    }
    if (timer.isJailed) {
        let currentIndex;
        for (let item of timer.activities.items) {
            const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, state.coords[0], state.coords[1], state.coords[2], true);
            if (distance < 15) {
                if (!timer.activities.isActive) {
                    DrawMarker(1, item.x, item.y, item.z, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.3, 0.3, 0.2, 45, 101, 167, 30, false, false, 2, false, empty, empty, false);
                }
                if (distance <= 1.2 && currentIndex === undefined) {
                    currentIndex = timer.activities.items.findIndex(i => i.x === item.x);
                }
            }
        }
        if (currentIndex >= 0 && (!IsPauseMenuActive() || timer.activities.isActive)) {
            if (IsControlJustPressed(0, 38)) {
                if (!timer.activities.isActive) {
                    const item = timer.activities.items[currentIndex];
                    SetEntityHeading(state.pedID, item.h);
                    SetEntityCoords(state.pedID, item.x, item.y, item.z, false, false, false, false);
                    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                    timer.activities.isActive = true;
                    if (item.type === 'chin') {
                        TaskStartScenarioInPlace(state.pedID, 'PROP_HUMAN_MUSCLE_CHIN_UPS', 0, true);
                        SetEntityHeading(state.pedID, item.h);
                    }
                    else {
                        timer.activities.objectID = CreateObject(-486823720, state.coords[0], state.coords[1], state.coords[2], true, false, false);
                        AttachEntityToEntity(timer.activities.objectID, state.pedID, GetPedBoneIndex(state.pedID, 28422), 0, -0.01, -0.05, 0.0, 0.0, -0.0, true, true, false, true, 1.0, true);
                        TaskPlayAnim(state.pedID, 'amb@world_human_muscle_free_weights@male@barbell@base', 'base', 8.0, -8.0, -1, 1, 0, false, false, false);
                    }
                }
                else {
                    SendNUIMessage(JSON.stringify({ type: 'entranceOpen', info: { type: 'jail' } }));
                    DeleteObject(timer.activities.objectID);
                    ClearPedTasks(state.pedID);
                    timer.activities.isActive = false;
                }
            }
            else if (!timer.activities.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen', info: { type: 'jail' } }));
            }
            timer.activities.runClose = true;
        }
        else if (timer.activities.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            DeleteObject(timer.activities.objectID);
            ClearPedTasks(state.pedID);
            timer.activities.isActive = false;
            timer.activities.runClose = false;
        }
        if (timer.isEscape) {
            const inside = GetDistanceBetweenCoords(1779.0329, 2585.0109, 45.7927, state.coords[0], state.coords[1], state.coords[2], true);
            if (inside > 23) {
                SetEntityCoords(state.pedID, 1779.6658, 2578.7736, 45.7927, false, false, false, false);
                SetEntityHeading(state.pedID, 2.8346);
            }
        }
        DisableControlAction(0, 37, true);
        DisableControlAction(0, 25, true);
        DisableControlAction(0, 140, true);
        DisablePlayerFiring(PlayerId(), true);
    }
});
async function startJail(data) {
    const isMale = GetEntityModel(state.pedID) === GetHashKey('mp_m_freemode_01');
    timer.isEscape = false;
    if (!data.isBack) {
        SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
        if (exports.NewStart_Employee.data().isActive)
            exports.NewStart_Employee.method('relaxation');
        exports.NewStart_DeathCounter.method('closeAll');
        exports.NewStart_Taboos.method('divingSuit', { isEnd: true });
        DoScreenFadeOut(1000);
        timer.isProgress = true;
        exports.NewStart_Inspection.closeUI();
        exports.NewStart_HudSystem.openHud('revive');
        exports.NewStart_HudSystem.closeUI();
        exports.NewStart_Phone.noticesToggle(true);
        exports.NewStart_MainMenu.toggleAds(false);
        DisplayRadar(false);
        exports.NewStart_Radio.method('kick');
        SetEntityHealth(state.pedID, 200);
        SetEntityInvincible(state.pedID, true);
        ClearPedBloodDamage(state.pedID);
        await Delay(1000);
        emitNet('NewStart:general-server', 'setBucket');
        SetEntityCoords(state.pedID, 406.2066, -997.2395, -100.00, false, false, false, true);
        SetEntityHeading(state.pedID, 90.00);
        prisonerClothes(isMale);
        await Delay(1000);
        DoScreenFadeIn(1000);
        const cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", 403.2000, -1000.9318, -98.5146, 0.00, 0.00, 0.00, 50.00, false, 0);
        SetCamActive(cam, true);
        RenderScriptCams(true, false, 0, true, true);
        const objectID = CreateObject(-1623189257, state.coords[0], state.coords[1], state.coords[2], false, false, false);
        AttachEntityToEntity(objectID, state.pedID, GetPedBoneIndex(state.pedID, 28422), 0.0, 0, 0, 0.0, 0.0, -0.0, true, true, false, true, 1.0, true);
        TaskPlayAnim(state.pedID, 'mp_character_creation@customise@male_a', 'intro', 8.0, -8.0, -1, 2, 0, false, false, false);
        await Delay(5000);
        const customID = exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).customID;
        const tickID = setTick(() => {
            const [x, y, z] = GetEntityCoords(objectID, true);
            drawText3D([x, y, z + 0.03], customID);
        });
        await Delay(2000);
        DoScreenFadeOut(1000);
        await Delay(1000);
        clearTick(tickID);
        ClearPedTasks(state.pedID);
        DeleteObject(objectID);
        DestroyCam(cam, true);
        RenderScriptCams(false, false, 0, true, true);
        emitNet('NewStart:general-server', 'setBucket', 0);
        await Delay(1000);
        DoScreenFadeIn(1000);
        timer.isProgress = false;
    }
    else {
        prisonerClothes(isMale);
        SetEntityInvincible(state.pedID, true);
        exports.NewStart_Phone.noticesToggle(true);
    }
    if (!exports.NewStart_MainMenu.isOpen() && !data.isBack) {
        DisplayRadar(true);
        exports.NewStart_HudSystem.openHud();
        exports.NewStart_MainMenu.toggleAds(true);
    }
    if (!timer.isEndFromAdmin) {
        const coord = timer.dungeons[Math.floor(Math.random() * 8)];
        SendNuiMessage(JSON.stringify({ type: 'setTimer', info: data }));
        SetEntityCoords(state.pedID, coord.x, coord.y, coord.z, true, false, false, false);
        SetEntityHeading(state.pedID, coord.h);
        timer.intervalID = setInterval(() => {
            emitNet('NewStart_Police:handleReports-server', 'jailed', 120000);
        }, 120000);
        timer.timeoutID = setTimeout(endJail, data.count);
        timer.isJailed = true;
        setTimeout(() => { timer.isEscape = true; }, 5000);
    }
    else {
        endJail();
    }
    timer.isEndFromAdmin = false;
}
function prisonerClothes(isMale) {
    for (let item of exports.NewStart_Clothes.items()) {
        if (['top', 'leg', 'shoe', 'torso'].includes(item.name))
            continue;
        if (item.type === 'main')
            SetPedComponentVariation(state.pedID, item.reset || item.id, 0, 0, 0);
        else
            ClearPedProp(state.pedID, item.id);
    }
    SetPedComponentVariation(state.pedID, 11, isMale ? 237 : 118, 0, 0);
    SetPedComponentVariation(state.pedID, 8, 15, 0, 0);
    SetPedComponentVariation(state.pedID, 3, isMale ? 5 : 11, 0, 0);
    SetPedComponentVariation(state.pedID, 4, isMale ? 7 : 3, 15, 0);
    SetPedComponentVariation(state.pedID, 6, isMale ? 7 : 1, 0, 0);
}
async function endJail() {
    if (!timer.isProgress) {
        clearTimeout(timer.timeoutID);
        SendNuiMessage(JSON.stringify({ type: 'setTimer', info: { count: 0 } }));
        DoScreenFadeOut(1000);
        await Delay(1000);
        exports.NewStart_Inspection.closeUI();
        clearInterval(timer.intervalID);
        emitNet('NewStart_Police:handleReports-server', 'jailed', 0);
        timer.isJailed = false;
        exports.NewStart_Phone.noticesToggle(false);
        SetEntityInvincible(state.pedID, false);
        SetEntityCoords(state.pedID, 1850.6900, 2585.8286, 44.6578, true, false, false, false);
        SetEntityHeading(state.pedID, 272.1259);
        DeleteObject(timer.activities.objectID);
        if (exports.NewStart_Jobs.currentJob(true)?.isActive) {
            exports.NewStart_Jobs.method('outfit');
        }
        else {
            exports.NewStart_Clothes.pedReset();
        }
        DoScreenFadeIn(1000);
    }
    else {
        timer.isEndFromAdmin = true;
    }
}
const parts = { items: [] };
onNet('NewStart_Police:handleParts-client', (type, data, more) => {
    data = JSON.parse(data);
    if (type === 'setData') {
        parts.items = data;
        partsGetData();
        if (state.isOpen && more && more !== GetPlayerServerId(PlayerId()))
            exports.NewStart_Notifications.showAttention('info', 'قام أحد بإجراء تحديثات على التوزيع الميداني!');
    }
});
function partsGetData() {
    const players = exports.NewStart_PoliceTools.method('getPlayersFactions').filter((i) => i.key === state.faction.key).map((i) => ({
        code: i.code, name: i.user.character.identifier.name, rankID: i.rankID,
        status: parts.items.some((p) => p.refID === i.code || p.refs?.some((r) => r.id === i.code)) ? 'yes' : 'no'
    }));
    SendNuiMessage(JSON.stringify({ type: 'setParts', items: parts.items, players }));
}
RegisterNuiCallbackType('NUI:parts');
on('__cfx_nui:NUI:parts', (data, cb) => {
    switch (data.type) {
        case 'getData':
            partsGetData();
            break;
        case 'saveData':
            emitNet('NewStart_Factions:general-server', JSON.stringify({ type: 'parts', key: state.faction.key, items: data.info }));
            exports.NewStart_Notifications.showAttention('success', 'لقد تم إرسال التوزيعة للجميع وعبر القنوات الرسمية!');
            break;
    }
    cb('OK!');
});
const reports = {
    timeAgain: 25000,
    lastShooting: 0,
    lastTaboos: 0,
    types: { fire: 'إطلاق نار من مجهول يبعد عنك', taboo: 'تمت مشاهدة تبادل الممنوعات', death: 'شخص في حالة حرجة يبعد عنك' },
    items: [],
    circulate: [],
    fires: []
};
setTick(() => {
    const time = Date.now();
    if (state.isActive) {
        const fireExpired = reports.fires.find(i => (time - i.date) >= 60000);
        if (fireExpired) {
            RemoveBlip(fireExpired.blipID);
            reports.fires.splice(reports.fires.findIndex(i => i.blipID === fireExpired.blipID), 1);
        }
    }
    else {
        if ((!reports.lastShooting || (time - reports.lastShooting) >= reports.timeAgain) &&
            IsPedShooting(state.pedID) && ![883325847, 600439132].includes(GetCurrentPedWeapon(state.pedID, false)[1]) &&
            !exports.NewStart_RealEstate.method('getCurrent', 'insideCode')) {
            const data = {
                type: 'unknown', unique: 'fire', name: 'مجهول', text: 'سماع دوي إطلاق نيران',
                location: { name: exports.NewStart_Initialize.getPlace(), coords: state.coords },
            };
            reports.lastShooting = time;
            emitNet('NewStart_Phone:EmergencyMessage-server', JSON.stringify({ ...data, to: 911 }));
            emitNet('NewStart_Phone:EmergencyMessage-server', JSON.stringify({ ...data, to: 997 }));
        }
    }
});
RegisterNuiCallbackType('NUI:reports');
on('__cfx_nui:NUI:reports', (data, cb) => {
    switch (data.type) {
        case 'reset':
            reports.items = [];
            break;
        case 'location':
            SetNewWaypoint(data.value[0], data.value[1]);
            exports.NewStart_Notifications.showAttention('success', 'تم تحديد الموقع علي الخريطة!');
            break;
        case 'phone':
            closeUI(true);
            exports.NewStart_Phone.method('call', data.value);
            break;
        case 'circulate':
            if (data.isGet) {
                SendNuiMessage(JSON.stringify({ type: 'setCirculate', info: reports.circulate }));
            }
            else {
                emitNet('NewStart_Police:handleReports-server', data.type, { id: Date.now(), from: state.faction.code, ...data, key: state.faction?.key });
            }
            break;
        case 'distress':
            handleDistress('alert', data.value);
            break;
        case 'reservation':
            UnReservation(data.plate);
            break;
    }
    cb('OK!');
});
exports('reports', (type, data) => {
    if (type === 'setData') {
        const distance = GetDistanceBetweenCoords(data.location.coords[0], data.location.coords[1], data.location.coords[2], state.coords[0], state.coords[1], state.coords[2], true).toFixed();
        const length = reports.items.length;
        if (length >= 20) {
            reports.items.splice(length - 1, 1);
        }
        const text = data.type === 'normal' ? `مواطن - ${data.details}` : `${reports.types[data.unique]} ${distance} متر`;
        reports.items.unshift({ ...data, time: exports.NewStart_Tools.method('getInfo').time });
        SendNuiMessage(JSON.stringify({ type: 'setHome', info: { reports: reports.items } }));
        if (!exports.NewStart_Medicine.method('info').isDead && !IsEntityDead(state.pedID)) {
            exports.NewStart_Notifications.sendAlert(text);
        }
        if (data.unique === 'fire') {
            const sameArea = reports.fires.some(i => GetDistanceBetweenCoords(i.coords[0], i.coords[1], i.coords[2], data.location.coords[0], data.location.coords[1], data.location.coords[2], false) < 80);
            if (!sameArea) {
                const blipID = AddBlipForRadius(data.location.coords[0], data.location.coords[1], data.location.coords[2], 45);
                SetBlipAsShortRange(blipID, true);
                BeginTextCommandSetBlipName("STRING");
                AddTextComponentString(`<font face="A9eelsh">ﺭﺎﻧ ﻕﻼﻃﺇ</font>`);
                EndTextCommandSetBlipName(blipID);
                SetBlipHighDetail(blipID, true);
                SetBlipColour(blipID, 1);
                SetBlipAlpha(blipID, 100);
                reports.fires.push({ blipID, date: data.id, coords: data.location.coords });
            }
        }
        PlaySoundFrontend(-1, 'Lose_1st', 'GTAO_Magnate_Boss_Modes_Soundset', false);
    }
    else if (type === 'taboos') {
        if (!state.isActive) {
            const time = Date.now();
            if ((!reports.lastTaboos || (time - reports.lastTaboos) >= reports.timeAgain) &&
                !exports.NewStart_RealEstate.method('getCurrent', 'insideCode')) {
                const data = {
                    type: 'unknown', unique: 'taboo', name: 'مجهول', text: reports.types.taboo,
                    location: { name: exports.NewStart_Initialize.getPlace(), coords: state.coords }
                };
                reports.lastTaboos = time;
                emitNet('NewStart_Phone:EmergencyMessage-server', JSON.stringify({ ...data, to: 911 }));
                emitNet('NewStart_Phone:EmergencyMessage-server', JSON.stringify({ ...data, to: 997 }));
            }
        }
    }
    else if (type === 'UnReservation') {
        UnReservation(data);
    }
    else if (type === 'getReservation') {
        return reservation.save.map((i) => ({ ...i, price: reservation.vipTax ? 0 : i.price }));
    }
});
const FLATBED_MODEL = 'flatbed3', TOWTRUCK_MODEL = 2971866336;
const reservation = {
    vipTax: false,
    isCurrent: false,
    save: [],
    price: 1000,
    delivery: {
        runClose: false,
        items: [
            { x: -307.0813, y: 6103.4770, z: 31.4871, blipID: 0 }, { x: 1763.4593, y: 3661.3977, z: 34.3685, blipID: 0 },
            { x: -3167.734, y: 2642.6352, z: 9.2396, blipID: 0 }
        ]
    }
};
setTick(() => {
    state.pedID = PlayerPedId();
    state.coords = GetEntityCoords(state.pedID, false);
    state.vehID = GetVehiclePedIsIn(state.pedID, false);
    if (state.isActive) {
        for (let item of reservation.delivery.items) {
            const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, state.coords[0], state.coords[1], state.coords[2], true);
            if (distance < 30) {
                DrawMarker(1, item.x, item.y, item.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 3, 3, 0.5, 45, 101, 167, 100, false, false, 2, false, empty, empty, false);
                if (distance < 5.7)
                    reservation.isCurrent = true;
                else
                    reservation.isCurrent = false;
                break;
            }
            else
                reservation.isCurrent = false;
        }
        if (reservation.isCurrent &&
            !IsEntityDead(state.pedID) &&
            !IsPauseMenuActive() &&
            (IsVehicleModel(state.vehID, FLATBED_MODEL) || IsVehicleModel(state.vehID, TOWTRUCK_MODEL))) {
            if (IsControlJustPressed(0, 76) && !IsNuiFocused()) {
                const isFlatbed = IsVehicleModel(state.vehID, FLATBED_MODEL);
                const attachID = isFlatbed ? exports.NewStart_Tools.method('getInfo').attachID : GetEntityAttachedToTowTruck(state.vehID);
                if (GetIsVehicleEngineRunning(state.vehID)) {
                    return exports.NewStart_Notifications.showAttention('error', 'قم بإطفاء المحرك أولا قبل التسليم!');
                }
                else if (!attachID) {
                    return exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي مركبة لديك لتسليمها للحجز!');
                }
                const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', attachID);
                if (plate) {
                    ExecuteCommand('+police');
                    SetNuiFocus(true, true);
                    SendNUIMessage(JSON.stringify({ type: 'toPage', info: { path: 'other', data: { type: 'vehicle', value: plate } } }));
                }
                else {
                    exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true });
                    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                    setTimeout(() => {
                        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                        SendNUIMessage(JSON.stringify({ type: 'entranceOpen', info: { type: 'normal', isMoreTop: !isFlatbed } }));
                        reservationReward(attachID);
                    }, 10000);
                }
            }
            else if (!reservation.delivery.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen', info: { type: 'normal', isMoreTop: !!IsVehicleModel(state.vehID, TOWTRUCK_MODEL) } }));
            }
            reservation.delivery.runClose = true;
        }
        else if (reservation.delivery.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            reservation.delivery.runClose = false;
        }
    }
});
function reservationReward(vehID) {
    DeleteEntity(vehID);
    exports.NewStart_Tools.method('reset', 'attachID');
    emitNet('NewStart:giveMoney', { name: 'شرطة المرور', amount: 5800 });
    exports.NewStart_MainMenu.levelUp(80);
}
function UnReservation(plate) {
    const index = reservation.save.findIndex((v) => v.plate.name === plate);
    if (!reservation.vipTax) {
        const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
        const info = {
            name: 'شرطة المرور',
            from: 'cash',
            price: reservation.save[index]?.price || reservation.price
        };
        if (cash >= info.price) {
            StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في الحقيبة لدفع الغرامة!');
            SendNUIMessage(JSON.stringify({ type: 'handleViolations', action: 'reset' }));
            return false;
        }
        emitNet('NewStart:moneyDecrease', info);
    }
    if (index >= 0)
        reservation.save.splice(index, 1);
    SendNUIMessage(JSON.stringify({ type: 'setReservation', info: reservation.save.map((i) => ({ ...i, price: reservation.vipTax ? 0 : i.price })) }));
    exports.NewStart_Notifications.showAttention('success', 'تم فك حجز المركبة يمكنك الذهاب للاستدعاء الان لاستخدامها.');
    emitNet('NewStart_VehicleSystem:saveData-server', JSON.stringify({ plate, isReservation: false }));
    if (!reservation.save.length)
        closeUI(false, true);
    return true;
}
const taboos = {
    runClose: false,
    timeoutID: 0,
    coords: [
        { jobKey: 'facilities', blipID: 0, x: -3000.4218 - 0.2, y: 2699.5517 + 0.1, z: 9.8352 + 0.25, h: 68.1968 },
        { jobKey: 'police', blipID: 0, x: -449.4329, y: 6015.2309, z: 36.9802, h: 45.5196 },
        { jobKey: 'police', blipID: 0, x: 1862.9083, y: 3689.0891, z: 34.3674, h: 210.5984 }
    ]
};
setTick(() => {
    if (state.isActive) {
        let isCurrent = false;
        for (let item of taboos.coords.filter(obj => obj.jobKey === state.faction.key)) {
            const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, state.coords[0], state.coords[1], state.coords[2], true);
            if (distance < 15) {
                DrawMarker(20, item.x, item.y, item.z, 0.0, 0.0, 0.0, 0.0, 180, -item.h, 0.6, 0.6, 0.4, 45, 101, 167, 100, false, false, 2, false, empty, empty, false);
                if (distance < 0.8) {
                    isCurrent = true;
                    break;
                }
            }
        }
        if (isCurrent &&
            !IsEntityDead(state.pedID) &&
            !IsPauseMenuActive()) {
            if (IsControlJustPressed(0, 38)) {
                const itemsRef = exports.NewStart_Inventory.staticData();
                const current = exports.NewStart_Inventory.info('currentItems').map((i) => ({ ...itemsRef.find((r) => r.id === i.id), ...i })).filter((i) => i.isTaboo);
                if (current.length) {
                    exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true, canMove: true });
                    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                    taboos.timeoutID = setTimeout(() => {
                        taboos.timeoutID = 0;
                        const itemsRef = exports.NewStart_Inventory.staticData();
                        const current = exports.NewStart_Inventory.info('currentItems');
                        const moneyRedRef = current.find((i) => i.id === 106);
                        let moneyRed = moneyRedRef?.count || 0;
                        const filter = current.map((i) => ({ ...itemsRef.find((r) => r.id === i.id), ...i }))
                            .filter((i) => i.isTaboo && i.id !== 106);
                        if (moneyRed)
                            moneyRed = moneyRed > 1 ? moneyRed / 2 : 1;
                        if (filter.length) {
                            const count = filter.reduce((total, obj) => total + obj.count, 0);
                            exports.NewStart_MainMenu.levelUp((moneyRed >= 1000 ? parseInt(moneyRed / 1000) * 20 : 0) + (count * 7));
                            emitNet('NewStart:giveMoney', { name: 'تسليم الممنوعات', amount: (count * 250) + moneyRed });
                        }
                        else if (moneyRed > 1 || moneyRedRef?.count === 2) {
                            if (moneyRed >= 1000)
                                exports.NewStart_MainMenu.levelUp(parseInt(moneyRed / 1000) * 20);
                            emitNet('NewStart:giveMoney', { name: 'تسليم الممنوعات', amount: moneyRed });
                        }
                        const items = (moneyRedRef ? [...filter, { title: 'أموال غير شرعية', ...moneyRedRef }] : filter).map((i) => ({
                            id: i.id, title: i.title, count: i.count
                        }));
                        for (let item of items) {
                            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: item.id, count: item.count }));
                        }
                        emitNet('NewStart_PoliceTools:handleGeneral-server', 'taboosLog', JSON.stringify({ key: state.faction.key, items }));
                        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                    }, 10000);
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي ممنوعات في الحقيبة يمكن تسليمها!');
                }
            }
            else if (!taboos.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen', info: { type: 'general' } }));
            }
            taboos.runClose = true;
        }
        else if (taboos.runClose) {
            if (taboos.timeoutID) {
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                clearTimeout(taboos.timeoutID);
            }
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            taboos.runClose = false;
        }
    }
});
