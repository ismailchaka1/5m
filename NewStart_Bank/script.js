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
const empty = null;
const state = {
    isOpen: false,
    runClose: false,
    violationsLength: 0,
    main: [
        { id: 'bank_1', mapName: 'باليتو', x: -113.3670, y: 6469.9252, z: 31.6219, h: 317.4803 },
    ],
    nameATMs: ['prop_atm_01', 'prop_atm_02', 'prop_atm_03', 'prop_fleeca_atm'],
    newATMs: [
        { x: -3008.023, y: 2676.12, z: 9.5823, h: 338.1574 }
    ],
    ATMsBlip: [
        { x: -386.7560, y: 6046.1010, z: 31.4871, h: 317.4803 },
        { x: -132.9758, y: 6366.5537, z: 31.4703, h: 314.6456 },
        { x: -3008.1230, y: 2676, z: 9.5823, h: 340.1574 },
        { x: 174.1318, y: 6637.9252, z: 31.5714, h: 45.3543 },
    ]
};
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_Bank:handleBalance-client', (type, data) => {
    data = JSON.parse(data);
    if (type === 'decrease') {
        SendNUIMessage(JSON.stringify({ type: 'pushToHistory', info: data.log, value: -data.log.amount }));
        emit('NewStart_Phone:bank-client', 'transfer', JSON.stringify(data.log));
        SendNUIMessage(JSON.stringify({ type: 'updateLoan', action: 'interest', id: data.loan.id, value: data.loan.interest }));
    }
});
(function createATMs() {
    return __awaiter(this, void 0, void 0, function* () {
        const model = -1126237515;
        RequestModel(model);
        while (!HasModelLoaded(model))
            yield Delay(1000);
        for (let item of state.newATMs) {
            let objectID = CreateObject(model, item.x, item.y, item.z, false, false, false);
            SetEntityHeading(objectID, item.h);
            FreezeEntityPosition(objectID, true);
            SetEntityInvincible(objectID, true);
        }
    });
})();
exports('closeUI', () => {
    if (state.isOpen) {
        SendNUIMessage(JSON.stringify({ type: 'toggleUI', value: false }));
        SetNuiFocus(false, false);
        state.isOpen = false;
        state.runClose = false;
    }
});
on('onClientGameTypeStart', () => {
    for (let item of state.ATMsBlip) {
        const blip = AddBlipForCoord(item.x, item.y, item.z);
        SetBlipSprite(blip, 207);
        SetBlipColour(blip, 2);
        SetBlipAsShortRange(blip, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">ﻲﻟﻵﺍ ﻑﺍﺮﺼﻟﺍ</font>`);
        EndTextCommandSetBlipName(blip);
    }
});
setTick(() => {
    const pedID = PlayerPedId();
    const coord = GetEntityCoords(pedID, true);
    let current = null;
    for (let name of state.nameATMs) {
        const atm = GetClosestObjectOfType(coord[0], coord[1], coord[2], 0.7, GetHashKey(name), true, true, true);
        if (atm) {
            const objCoords = GetEntityCoords(atm, true);
            const heading = GetHeadingFromVector_2d(objCoords[0] - coord[0], objCoords[1] - coord[1]);
            current = { heading: heading };
        }
    }
    for (let item of state.main) {
        const distance = GetDistanceBetweenCoords(coord[0], coord[1], coord[2], item.x, item.y, item.z, true);
        if (distance < 25) {
            DrawMarker(1, item.x, item.y, item.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.25, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
            if (distance < 0.65) {
                current = { id: item.id, mapName: item.mapName || null, heading: item.h };
                break;
            }
        }
    }
    if (current &&
        !IsPauseMenuActive() &&
        !IsEntityDead(pedID)) {
        if (IsControlJustPressed(0, 38)) {
            if (current.id) {
                const places = exports.NewStart_Robbery.method('places', 'bank');
                if (places.some((p) => { var _a; return p.id === (current === null || current === void 0 ? void 0 : current.id) && ((_a = p.alert) === null || _a === void 0 ? void 0 : _a.id); })) {
                    return exports.NewStart_Notifications.showAttention('error', 'فرع البنك مغلق حاليا بسبب عملية السرقة!');
                }
            }
            let info = {
                level: exports.NewStart_MainMenu.getLevel(),
                mapName: current.mapName
            };
            TaskAchieveHeading(pedID, current.heading, 0);
            emitNet('NewStart_Bank:initial-server');
            SetNuiFocus(true, true);
            state.isOpen = true;
            SendNUIMessage(JSON.stringify({ type: 'toggleUI', value: true, info }));
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
exports('method', (type, data) => {
    if (type === 'violations') {
        return state.violationsLength;
    }
    else if (type === 'giveCash') {
        StatSetInt('MP0_WALLET_BALANCE', StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1)[1] + data.amount, false);
        exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: data.amount }));
        emitNet('NewStart:giveMoney', { name: data.name, amount: data.amount, from: 'cash' }, true);
    }
});
onNet('NewStart_Bank:initial-client', (data) => {
    data = JSON.parse(data);
    state.violationsLength = data.violations.length;
    SendNUIMessage(JSON.stringify({ type: 'setInformation', info: data }));
});
onNet('NewStart_Bank:handleGeneral-client', (type) => {
    if (type === 'violations') {
        state.violationsLength += 1;
    }
});
onNet('NewStart_Bank:handleLoan-client', (type, data) => {
    data = JSON.parse(data);
    if (type === 'addToHistory') {
        SendNUIMessage(JSON.stringify({
            type: 'handleWarranties',
            value: 'addToHistory',
            info: {
                item: data,
                log: {
                    _id: Date.now(),
                    type: 'receive',
                    from: 'bank',
                    name: 'البنك الوطني',
                    amount: data.price,
                    date: new Date()
                }
            }
        }));
        emitNet('NewStart:giveMoney', { name: `قرض بضمان ${data.name}`, amount: data.price, from: 'bank' }, null, true);
        emit('NewStart_Phone:receiveMessage-client', JSON.stringify({ number: '-1', text: `قمنا بتحويل مبلغ ${data.price.toLocaleString()}$ لحسابك بغرض القرض بضمان ${data.name}.` }));
    }
    else if (type === 'payment') {
        const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
        const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
        let info = { name: 'سداد القرض', price: data.interest, from: 'cash' };
        if (cash >= info.price) {
            StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
            info.from = 'cash';
        }
        else if (bank >= info.price) {
            StatSetInt('BANK_BALANCE', bank - info.price, false);
            info.from = 'bank';
        }
        else {
            return exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي!');
        }
        emitNet('NewStart:moneyDecrease', info);
        emitNet('NewStart_Bank:handleLoan-server', JSON.stringify({ type: 'doneStatus', id: data.id }));
        if (info.from === 'cash') {
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
        }
        info = Object.assign(Object.assign({}, info), { _id: Date.now(), type: 'transfer', amount: info.price, date: new Date() });
        SendNUIMessage(JSON.stringify({ type: 'pushToHistory', info, value: -info.price }));
    }
    else if (type === 'doneStatus') {
        SendNUIMessage(JSON.stringify({ type: 'updateLoan', action: 'status', id: data.id, value: 2, interest: 0 }));
        exports.NewStart_Notifications.showAttention('success', 'رائع! لقد تم سداد كامل قيمة القرض.');
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
    const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
    switch (data.type) {
        case 'balance':
            const log = {
                _id: data.length.toString(),
                type: 'receive',
                from: 'bank',
                name: 'إيداع إلي الحساب',
                amount: data.value,
                date: new Date()
            };
            if (data.key === 'withdraw') {
                const inventoryKG = exports.NewStart_Inventory.info('currentKG');
                const inventoryMax = exports.NewStart_Inventory.info('maxKG');
                const cashWeight = exports.NewStart_Inventory.staticData().find((obj) => obj.id === 1).space;
                if (data.value > bank) {
                    exports.NewStart_Notifications.showAttention('error', 'للأسف رصيدك غير كافي للسحب!');
                    return cb('OK!');
                }
                else if ((inventoryKG + (cashWeight * data.value)) > inventoryMax) {
                    exports.NewStart_Notifications.showAttention('error', 'مساحة الحقيبة غير كافية لسحب كل هذه الأموال!');
                    return cb('OK!');
                }
                log.type = 'transfer';
                log.name = 'السحب من الحساب';
                StatSetInt('BANK_BALANCE', bank - data.value, false);
                StatSetInt('MP0_WALLET_BALANCE', cash + data.value, false);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: data.value }));
                emitNet('NewStart:moneyDecrease', { name: log.name, price: data.value, from: 'bank' });
                emitNet('NewStart:giveMoney', { name: log.name, amount: data.value, from: 'cash' }, true);
            }
            else {
                if (data.value > cash) {
                    exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي للإيداع.');
                    return cb('OK!');
                }
                StatSetInt('BANK_BALANCE', bank + data.value, false);
                StatSetInt('MP0_WALLET_BALANCE', cash - data.value, false);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -data.value }));
                emitNet('NewStart:moneyDecrease', { name: log.name, price: data.value, from: 'cash' });
                emitNet('NewStart:giveMoney', { name: log.name, amount: data.value, from: 'bank' }, true);
            }
            SendNUIMessage(JSON.stringify({
                type: 'updateBalance',
                info: {
                    balance: log.type === 'receive' ? bank + data.value : bank - data.value,
                    item: log
                }
            }));
            break;
        case 'loan':
            const level = exports.NewStart_MainMenu.method('validLevel', 'loan');
            if (!level.isCan) {
                exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${level.need} أولاً للتقديم على القروض!`);
                return cb('failed');
            }
            emitNet('NewStart_Bank:handleLoan-server', JSON.stringify(data));
            break;
        case 'violations':
            const info = { name: 'البنك الوطني', from: 'cash', price: data.price };
            if (cash >= info.price) {
                StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
            }
            else if (bank >= info.price) {
                StatSetInt('BANK_BALANCE', bank - info.price, false);
                info.from = 'bank';
            }
            else {
                exports.NewStart_Notifications.showAttention('للأسف لا تملك المال الكافي لدفع الغرامة!');
                SendNUIMessage(JSON.stringify({ type: 'handleViolations', action: 'reset' }));
                return cb('OK!');
            }
            state.violationsLength -= 1;
            emitNet('NewStart:moneyDecrease', info);
            emitNet('NewStart_Police:handleReports-server', 'removeViolation', { id: data.id, model: data.model });
            exports.NewStart_Notifications.showAttention('success', 'لقد قمت بسداد قيمة المخالفة بالكامل.');
            SendNUIMessage(JSON.stringify({ type: 'handleViolations', action: 'remove', id: data.id }));
            break;
        case 'notification':
            exports.NewStart_Notifications.showAttention(data.action, data.text);
            break;
        default:
            closeUI(false);
    }
    cb('OK!');
});
function closeUI(withNUI) {
    ClearPedTasks(PlayerPedId());
    if (withNUI)
        SendNUIMessage(JSON.stringify({ type: 'toggleUI', value: false }));
    SetNuiFocus(false, false);
    state.isOpen = false;
    state.runClose = false;
}
