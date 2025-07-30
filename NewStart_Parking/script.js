"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
on('onClientGameTypeStart', () => {
    for (let item of state.locations) {
        const blip = AddBlipForCoord(item.x, item.y, item.z);
        SetBlipSprite(blip, 728);
        SetBlipAsShortRange(blip, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">${item.name}</font>`);
        EndTextCommandSetBlipName(blip);
    }
    createPeds();
});
setTick(() => {
    const pedID = PlayerPedId();
    const coord = GetEntityCoords(pedID, true);
    for (let item of state.locations) {
        const distance = GetDistanceBetweenCoords(coord[0], coord[1], coord[2], item.x, item.y, item.z, true);
        if (distance < 1.7) {
            state.current = { type: item.type, city: item.city };
            break;
        }
        else {
            state.current = null;
        }
    }
    if (state.current &&
        !IsEntityDead(pedID) &&
        !IsPauseMenuActive() &&
        !IsPedInAnyVehicle(pedID, false)) {
        if (IsControlJustPressed(0, 38)) {
            emitNet('NewStart_Parking:handleGloble-server', { type: 'initial' });
            state.isOpen = true;
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '3s', status: true });
            SetNuiFocus(true, false);
            state.timeoutID = setTimeout(() => {
                var _a;
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                SetNuiFocus(true, true);
                state.isOpen = true;
                state.timeoutID = 0;
                SendNUIMessage(JSON.stringify({ type: 'openUI', itemsType: (_a = state.current) === null || _a === void 0 ? void 0 : _a.type, items: itemsFitler() }));
            }, 3000);
        }
        else if (!state.isOpen && !state.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
        }
        state.runClose = true;
    }
    else if (state.runClose) {
        state.isOpen = false;
        state.runClose = false;
        SetNuiFocus(false, false);
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
        if (state.timeoutID) {
            clearTimeout(state.timeoutID);
            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
        }
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    var _a;
    switch (data.type) {
        case 'restore':
            const info = exports.NewStart_VehicleSystem.method('GetMyVehicles').find((v) => v.id === data.id);
            info.type = 'checkRestore';
            emitNet('NewStart_Parking:handleGloble-server', info);
            break;
        case 'spawn':
            const spawned = exports.NewStart_VehicleSystem.method('GetMyVehicles').some((v) => v.id === data.id);
            if (state.filter.includes(data.id) || spawned)
                return;
            const find = state.items.find(i => i._id === data.id);
            if (['towtruck', 'flatbed'].includes(find.hash) && !exports.NewStart_Mechanical.method('info', 'isActive')) {
                exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون لديك رخصة الميكانيكي لاستعمال هذه المركبة!');
                return cb('Failed');
            }
            else if (find === null || find === void 0 ? void 0 : find.isReservation) {
                exports.NewStart_Notifications.showAttention('error', 'تم حجز المركبة من قبل المرور اذهب لشرطة المرور للاستعادة!');
                return cb('Failed');
            }
            else {
                const location = (_a = state.locations.find(i => i.type === state.current.type && i.city === state.current.city)) === null || _a === void 0 ? void 0 : _a.spawn;
                emit('NewStart_VehicleSystem:spawning-client', JSON.stringify(Object.assign(Object.assign({}, find), { location, isInto: true })));
                if (!['truck', 'boat', 'car', 'motorcycle', 'plane'].includes(find === null || find === void 0 ? void 0 : find.vehType)) {
                    state.filter.push(data.id);
                }
            }
        default:
            state.isOpen = false;
            state.runClose = false;
            SetNuiFocus(false, false);
            break;
    }
    cb('OK!');
});
exports('method', (type, data) => {
    if (type === 'getItems') {
        return state.items;
    }
    else if (type === 'addToFilter') {
        state.filter.push(data);
    }
    else if (type === 'removeFromFilter') {
        const index = state.filter.findIndex(f => f === data);
        if (index >= 0)
            state.filter.splice(index, 1);
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
function createPeds() {
    return __awaiter(this, void 0, void 0, function* () {
        const models = state.locations.map(item => (Object.assign(Object.assign({}, item), { pedKey: GetHashKey(item.pedKey) })));
        for (let item of models)
            RequestModel(item.pedKey);
        while (!models.every(i => HasModelLoaded(i.pedKey)))
            yield Delay(1000);
        for (let item of models) {
            const pedID = CreatePed(1, item.pedKey, item.x, item.y, item.z, item.h, false, false);
            FreezeEntityPosition(pedID, true);
            SetBlockingOfNonTemporaryEvents(pedID, true);
            SetEntityInvincible(pedID, true);
        }
    });
}
onNet('NewStart_Parking:handleGloble-client', (type, data) => {
    data = JSON.parse(data);
    if (type === 'initial') {
        state.items = data;
        SendNUIMessage(JSON.stringify({ type: 'initial', items: itemsFitler() }));
        exports.NewStart_VehicleSystem.method('addPlate', data.map((d) => d.plate.name));
    }
    else if (type === 'checkRestore') {
        const info = exports.NewStart_VehicleSystem.method('GetMyVehicles').find((v) => v.id === data.id);
        if (info) {
            const [x, y, z] = GetEntityCoords(PlayerPedId(), false);
            const vehCoords = GetEntityCoords(info.vehID, false);
            const distance = GetDistanceBetweenCoords(x, y, z, vehCoords[0], vehCoords[1], vehCoords[2], true);
            if (distance < 25 || !data.isExist) {
                if (data.isExist)
                    emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: info.netID }));
                exports.NewStart_Notifications.showAttention('success', 'يمكنك استدعائها مرة أخري في أي وقت.');
                emit('NewStart_VehicleSystem:removePrivate-client', JSON.stringify([data.id]));
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون المركبة قريبة بما يكفي!');
            }
            SetNuiFocus(false, false);
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            state.isOpen = false;
            state.runClose = false;
        }
        SendNUIMessage(JSON.stringify({ type: 'setRequest', value: false }));
    }
});
function itemsFitler() {
    const vehicles = exports.NewStart_VehicleSystem.method('GetMyVehicles');
    let data = state.items;
    const jetskiInx = data.findIndex(v => v.hash === 3983945033);
    if (jetskiInx >= 0)
        data[jetskiInx].image = 'jetski';
    if (state.current) {
        data = state.items.filter(i => {
            return ((i.vehType === state.current.type) || (state.current.type === 'car' && i.vehType === 'motorcycle')) && !state.filter.includes(i._id);
        });
    }
    return data.map(d => (Object.assign(Object.assign({}, d), { spawned: vehicles.some((v) => v.id === d._id) })));
}
const state = {
    timeoutID: 0,
    current: null,
    isOpen: false,
    runClose: false,
    items: [],
    filter: [],
    locations: [
        {
            type: 'car',
            city: 'paleto',
            pedKey: 'cs_josef',
            name: 'ﺕﺎﺒﻛﺮﻤﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: 81.1384, y: 6396.3295, z: 30.4930, h: 133.2283 },
            x: 86.3604,
            y: 6389.5517,
            z: 30.3692,
            h: 232.4409
        },
        {
            type: 'car',
            city: 'sandy',
            pedKey: 'cs_josef',
            name: 'ﺕﺎﺒﻛﺮﻤﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: 1711.2791, y: 3598.6286, z: 34.6380, h: 209.7637 },
            x: 1705.5296,
            y: 3598.7473,
            z: 34.4132,
            h: 221.1023
        },
        {
            type: 'car',
            city: 'sandy2',
            pedKey: 'cs_josef',
            name: 'ﺕﺎﺒﻛﺮﻤﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: 211.4501, y: 2784.8642, z: 44.9339, h: 11.7973 },
            x: 205.0481,
            y: 2781.0820,
            z: 44.6552,
            h: 11.7301
        },
        {
            type: 'truck',
            city: 'paleto',
            pedKey: 'ig_russiandrunk',
            name: 'ﺕﺎﻨﺣﺎﺸﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: -307.4373, y: 6037.2001, z: 31.4366, h: 314.6456 },
            x: -302.4923,
            y: 6034.4042,
            z: 30.4703,
            h: 317.4803
        },
        {
            type: 'truck',
            city: 'sandy',
            pedKey: 'ig_russiandrunk',
            name: 'ﺕﺎﻨﺣﺎﺸﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: 194.2962, y: 2787.8725, z: 45.7062, h: 277.9910 },
            x: 200.4253,
            y: 2780.2065,
            z: 44.6552,
            h: 11.7301
        },
        {
            type: 'boat',
            city: 'sandy',
            pedKey: 'u_m_m_bikehire_01',
            name: 'ﺏﺭﺍﻮﻘﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: 1565.6307, y: 3887.1691, z: 30.4761, h: 101.9770 },
            x: 1567.2923,
            y: 3897.1516,
            z: 30.62,
            h: 289.1338
        },
        {
            type: 'boat',
            city: 'paleto',
            pedKey: 'u_m_m_bikehire_01',
            name: 'ﺏﺭﺍﻮﻘﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: -769.7538, y: 6060.2768, z: 1.0227, h: 39.6850 },
            x: -757.8593,
            y: 6050.9008,
            z: 0.8820,
            h: 260.7874
        },
        {
            type: 'plane',
            city: 'sandy',
            pedKey: 'csb_ortega',
            name: 'ﺕﺍﺮﺋﺎﻄﻟﺍ ﺀﺎﻋﺪﺘﺳﺍ',
            spawn: { x: 2112.1450, y: 4797.2705, z: 41.6812, h: 113.3858 },
            x: 2100.1977,
            y: 4778.6503,
            z: 40.1252,
            h: 25.5118
        }
    ]
};
