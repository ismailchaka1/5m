"use strict";
const animation = { itemActive: null };
function handleAnimation(data) {
    const pedID = PlayerPedId();
    if (IsPedInAnyVehicle(pedID, true)) {
        return exports.NewStart_Notifications.showAttention('error', 'يعتذر استخدام قائمة الحركات داخل المركبة!');
    }
    if (data.action === 'start') {
        animation.itemActive = data.item;
        if (data.item.type === 'scenarios') {
            ClearPedTasks(pedID);
            const coords = GetOffsetFromEntityInWorldCoords(pedID, 0.0, 0 - 0.5, -0.5);
            if (animation.itemActive?.scenarios.sex === 'position') {
                TaskStartScenarioAtPosition(pedID, animation.itemActive?.scenarios.scene, coords[0], coords[1], coords[2], GetEntityHeading(pedID), 0, true, false);
            }
            else {
                TaskStartScenarioInPlace(pedID, animation.itemActive?.scenarios.scene, 0, true);
            }
            exports.NewStart_MainMenu.closeUI(true);
        }
        else if (data.item.type === 'dances') {
            runNormalAnimation(pedID, data.isUpper, data.isLoop);
        }
        else if (data.item.type === 'walks') {
            runNormalAnimation(pedID);
        }
    }
    else if (data.action === 'favourites') {
        emitNet('NewStart_MainMenu:handleGeneral-server', 'setFavorite', { animations: data.info });
    }
    else if (data.action === 'stop') {
        ClearPedTasks(pedID);
        ClearPedTasksImmediately(pedID);
        ResetPedMovementClipset(pedID, 0);
        animation.itemActive = null;
        if (data.withClose)
            exports.NewStart_MainMenu.closeUI(true);
    }
}
async function runNormalAnimation(pedID, isUpper, isLoop) {
    if (!animation.itemActive)
        return;
    if (animation.itemActive.type === 'dances') {
        RequestAnimDict(animation.itemActive.dances?.dict);
        while (!HasAnimDictLoaded(animation.itemActive.dances?.dict))
            await Delay(10);
        ClearPedTasks(pedID);
        if (animation.itemActive.id === 372) {
            startSlapped();
        }
        else if (animation.itemActive.id === 149) {
            const result = startHostage();
            if (!result)
                return exports.NewStart_MainMenu.closeUI(true);
        }
        if (animation.itemActive?.dances?.dict === 'random@arrests@busted')
            isLoop = true;
        TaskPlayAnim(pedID, animation.itemActive.dances?.dict, animation.itemActive.dances?.anim, 1.5, 1.5, !isLoop && !isUpper ? 15000 : -1, isUpper ? 51 : isLoop ? 1 : 0, 0, false, false, false);
        RemoveAnimDict(animation.itemActive.dances?.dict);
    }
    else if (animation.itemActive.type === 'walks') {
        ResetPedMovementClipset(pedID, 0);
        RequestAnimDict(animation.itemActive.walks?.style);
        while (!HasAnimDictLoaded(animation.itemActive.walks?.style))
            await Delay(10);
        SetPedMovementClipset(pedID, animation.itemActive.walks?.style, 0);
        RemoveAnimDict(animation.itemActive.walks?.style);
    }
    exports.NewStart_MainMenu.closeUI(true);
}
async function startSlapped(serverID) {
    if (!serverID) {
        const target = exports.NewStart_Initialize.method('getClosestPlayer', { noDead: true, noCuffs: true, noVehicle: true });
        if (target) {
            emitNet('NewStart_MainMenu:handleGeneral-server', 'animShared', { action: 'slapped', playerID: target.serverID });
            exports.NewStart_Medicine.limited('set', true, false, '6s', 6000);
        }
    }
    else {
        if (state.isAnimShared)
            return;
        SetNuiFocus(true, false);
        exports.NewStart_MainMenu.closeUI(true);
        state.isAnimShared = true;
        const pedID = PlayerPedId();
        RequestAnimDict('melee@unarmed@streamed_variations');
        while (!HasAnimDictLoaded('melee@unarmed@streamed_variations'))
            await Delay(0);
        TaskPlayAnim(pedID, 'melee@unarmed@streamed_variations', 'victim_takedown_front_backslap', 8.0, 2.0, 4000, 2, 0, false, false, false);
        setTimeout(() => { state.isAnimShared = false; SetNuiFocus(false, false); }, 4000);
    }
}
function startHostage(serverID) {
    if (state.isAnimShared)
        return;
    let canTick = false, target;
    if (!serverID) {
        target = exports.NewStart_Initialize.method('getClosestPlayer', { noDead: true, noCuffs: true, noVehicle: true });
        if (exports.NewStart_Employee.data().isActive) {
            exports.NewStart_Notifications.showAttention('error', 'لا يمكن للموظف المعتمد استخدام تهديد الرهائن!');
            return null;
        }
        else if (GetWeapontypeGroup(GetSelectedPedWeapon(PlayerPedId())) !== 416676503) {
            exports.NewStart_Notifications.showAttention('error', 'يجب وضع مسدس ناري في يدك قبل تنفيذ التهديد!');
            return null;
        }
        else if (target && !IsEntityPlayingAnim(target.pedID, 'anim@gangops@hostage@', 'perp_idle', 1) && !IsEntityPlayingAnim(target.pedID, 'anim@gangops@hostage@', 'victim_idle', 1)) {
            emitNet('NewStart_MainMenu:handleGeneral-server', 'animShared', { action: 'hostage', playerID: target.serverID });
            state.isAnimShared = true;
            SetNuiFocus(false, false);
            canTick = true;
            state.hostage = { type: 'one', serverID: target.serverID, isNUI: false, dete: Date.now(), canEnd: false, isKilling: false };
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'لم يتم إيجاد أي شخص يمكن تهديده بالقرب منك كفاية!');
        }
    }
    else {
        RequestAnimDict('anim@gangops@hostage@');
        RequestAnimDict('reaction@shove');
        state.isAnimShared = true;
        SetNuiFocus(true, false);
        exports.NewStart_DeathCounter.closeAll(true);
        AttachEntityToEntity(PlayerPedId(), GetPlayerPed(GetPlayerFromServerId(serverID)), 0, -0.24, 0.11, 0.0, 0.5, 0.5, 10, false, false, false, false, 2, false);
        state.hostage = { type: 'two', serverID, isNUI: false, canEnd: false, isKilling: false };
        canTick = true;
    }
    if (canTick) {
        state.hostage.tickID = setTick(() => {
            const targetPed = GetPlayerPed(GetPlayerFromServerId(state.hostage.serverID));
            if (state.hostage.canEnd || !DoesEntityExist(targetPed) || IsEntityDead(targetPed) || IsEntityDead(PlayerPedId())) {
                console.log(state.hostage.canEnd, !DoesEntityExist(targetPed), IsEntityDead(targetPed), IsEntityDead(PlayerPedId()));
                SendNuiMessage(JSON.stringify({ type: 'hostage', value: false }));
                ClearPedTasks(PlayerPedId());
                clearTick(state.hostage.tickID);
                state.isAnimShared = false;
                SetNuiFocus(false, false);
                if (state.hostage.type === 'two') {
                    DetachEntity(PlayerPedId(), true, false);
                    if (state.hostage.canEnd)
                        TaskPlayAnim(PlayerPedId(), "reaction@shove", "shoved_back", 8.0, -8.0, -1, 0, 0, false, false, false);
                }
            }
            else if (state.hostage.type === 'one' && !IsEntityPlayingAnim(PlayerPedId(), 'anim@gangops@hostage@', 'perp_idle', 1)) {
                TaskPlayAnim(PlayerPedId(), 'anim@gangops@hostage@', 'perp_idle', 8.0, -8.0, -1, 51, 0, false, false, false);
            }
            else if (state.hostage.type === 'two' && !IsEntityPlayingAnim(PlayerPedId(), 'anim@gangops@hostage@', 'victim_idle', 1)) {
                TaskPlayAnim(PlayerPedId(), 'anim@gangops@hostage@', 'victim_idle', 8.0, -8.0, -1, 51, 0, false, false, false);
            }
            if (state.hostage.type === 'one') {
                if (!state.hostage.isNUI && (Date.now() - state.hostage.dete) > 2000) {
                    SendNuiMessage(JSON.stringify({ type: 'hostage', value: true }));
                    state.hostage.isNUI = true;
                }
                else if (state.hostage.isNUI) {
                    if (IsControlJustPressed(0, 74)) {
                        SetPedShootsAtCoord(PlayerPedId(), 0.0, 0.0, 0.0, false);
                        emitNet('NewStart_MainMenu:handleGeneral-server', 'animShared', { action: 'kill', playerID: state.hostage.serverID });
                        state.hostage.canEnd = true;
                        state.hostage.isKilling = true;
                    }
                    else if (IsControlJustPressed(0, 47)) {
                        emitNet('NewStart_MainMenu:handleGeneral-server', 'animShared', { action: 'unHostage', playerID: state.hostage.serverID });
                        state.hostage.canEnd = true;
                    }
                }
            }
            DisableControlAction(0, 24, true);
            DisableControlAction(0, 25, true);
            DisableControlAction(0, 37, true);
            DisableControlAction(0, 23, true);
            DisableControlAction(0, 38, true);
            DisableControlAction(0, 21, true);
            DisableControlAction(0, 22, true);
        });
    }
    return !!target;
}
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
on('playerSpawned', () => {
    SendNuiMessage(JSON.stringify({ type: 'openUI' }));
    SetNuiFocus(true, true);
    SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
    SetNuiFocus(false, false);
});
RegisterCommand('+mainMenu', () => {
    if (IsPauseMenuActive() ||
        state.isAnimShared ||
        exports.NewStart_Jobs.isOpen() ||
        exports.NewStart_Medicine.method('info').stretcher ||
        exports.NewStart_Inventory.method('smoking', 'get') ||
        exports.NewStart_Phone.isOpen() ||
        exports.NewStart_Police.method('info').jailProgress ||
        exports.NewStart_PoliceTools.method('info').isPolmav ||
        exports.NewStart_Police.method('info').isInjuredDrag ||
        exports.NewStart_Medicine.limited('get'))
        return;
    emitNet('NewStart_MainMenu:handleGeneral-server', 'getData');
    emitNet('NewStart_Business:handleGeneral-server', 'getCommercial');
    const seaport = !exports.NewStart_Tools.method('getInfo').seaPortClosed;
    const factions = exports.NewStart_PoliceTools.method('getPlayersFactions');
    SendNuiMessage(JSON.stringify({
        type: 'openUI',
        isDoubleLevel: LEVEL_ITEMS.isDouble,
        user: {
            customID: exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).customID,
            seaport, subSeaport: seaport && !exports.NewStart_Tools.method('getInfo').subSeaPortClosed,
            factions: {
                police: factions.filter((i) => i.key === 'police').length,
                facilities: factions.filter((i) => i.key === 'facilities').length,
                health: factions.filter((i) => i.key === 'health').length
            }
        }
    }));
    SetNuiFocus(true, true);
    AnimpostfxPlay('MenuMGIn', 1, true);
    exports.NewStart_HudSystem.closeUI();
    exports.NewStart_Phone.noticesToggle(true);
    exports.NewStart_VehicleSystem.method('setHideUI', true);
    DisplayRadar(false);
    state.isOpen = true;
    state.isToggleAds = false;
}, false);
RegisterCommand('+animation', () => {
    if (IsPauseMenuActive() ||
        state.isAnimShared ||
        exports.NewStart_Jobs.isOpen() ||
        exports.NewStart_Medicine.method('info').stretcher ||
        exports.NewStart_Inventory.method('smoking', 'get') ||
        exports.NewStart_Phone.isOpen() ||
        exports.NewStart_Police.method('info').jailProgress ||
        exports.NewStart_PoliceTools.method('info').isPolmav ||
        exports.NewStart_Police.method('info').isInjuredDrag ||
        exports.NewStart_Medicine.limited('get'))
        return;
    SendNuiMessage(JSON.stringify({ type: 'shortcuts', value: true }));
    SetNuiFocus(true, true);
    state.shortcutsOpen = true;
}, false);
RegisterKeyMapping('+mainMenu', 'Main Menu', 'keyboard', 'f1');
RegisterKeyMapping('+animation', 'Animation', 'keyboard', 'OEM_3');
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    if (data.type === 'settings') {
        switch (data.name) {
            case 'hideAll':
                state.isHideAll = data.value;
                break;
            case 'rockstar':
                if (data.value)
                    StartRecording(1);
                else
                    StopRecordingAndSaveClip();
                break;
            case 'controls':
                exports.NewStart_HudSystem.method('setStateNUI', { isControls: !data.value });
                break;
            case 'radioVolume':
                exports['pma-voice'].setRadioVolume(data.value * 100);
                break;
            case 'alertsVolume':
                exports.NewStart_VehicleSystem.method('setVolume', data.value);
                exports.NewStart_RealEstate.method('setVolume', data.value);
                break;
        }
        if (!['hideAll', 'rockstar'].includes(data.name)) {
            if (state.timeoutID)
                clearTimeout(state.timeoutID);
            state.timeoutID = setTimeout(() => { emitNet('NewStart:updateUser', { [`settings.${data.name}`]: data.value }); }, 1000);
        }
    }
    else if (data.type === 'animation') {
        handleAnimation(data);
    }
    else if (data.type === 'onlyFocus') {
        SetNuiFocus(false, false);
    }
    else if (data.type === 'invite') {
        emitNet('NewStart_MainMenu:handleGeneral-server', data.type, data.value.trim());
        exports.NewStart_MainMenu.closeUI(true);
    }
    else if (data.type === 'reward') {
        exports.NewStart_MainMenu.closeUI(true);
        emitNet('NewStart:giveMoney', { name: 'المكافأة اليومية', amount: 15000 });
        exports.NewStart_MainMenu.levelUp(250);
        emitNet('NewStart_MainMenu:handleGeneral-server', 'setFavorite', { rewardDate: Date.now() });
    }
    else if (data.type === 'business') {
        exports.NewStart_Business.method('actions', data.info);
    }
    else if (data.type === 'closeUI' && (state.isOpen || data.isPurchase || state.shortcutsOpen)) {
        if ((data.isMain && state.shortcutsOpen) || (data.fromShortcuts && state.isOpen))
            return cb('OK!');
        if (data.withNUI)
            SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
        if (!state.isAnimShared)
            SetNuiFocus(false, false);
        AnimpostfxStop('MenuMGIn');
        state.isOpen = false;
        state.shortcutsOpen = false;
        exports.NewStart_Phone.noticesToggle(false);
        exports.NewStart_VehicleSystem.method('setHideUI', false);
        if (!state.isHideAll) {
            DisplayRadar(true);
            exports.NewStart_HudSystem.openHud();
            exports.NewStart_MainMenu.toggleAds(true);
        }
    }
    cb('OK!');
});
exports('method', (type, data) => {
    if (type === 'data') {
        return { isAnimShared: state.isAnimShared };
    }
    else if (type === 'setNoticesHistory') {
        SendNuiMessage(JSON.stringify({ type: 'addToNotices', info: data }));
    }
    else if (type === 'getIsDouble') {
        return LEVEL_ITEMS.isDouble;
    }
    else if (type === 'validLevel') {
        const find = LEVEL_ITEMS.items.find(i => i.ref === data);
        if (find)
            return { isCan: exports.NewStart_MainMenu.getLevel() >= find.name, need: find.name };
        return {};
    }
    else if (type === 'vipColors') {
        return VIP_ITEMS.reference;
    }
    else if (type === 'setBusiness') {
        SendNuiMessage(JSON.stringify({ type: 'setBusinessData', info: data }));
    }
});
let LEVEL_ITEMS = {
    exp: 0,
    isDouble: false,
    items: [
        { name: 1, ref: 'industry', receive: 'القدرة على التصنيع' },
        { name: 4, ref: 'house', receive: 'أمتلاك العقارات' },
        { name: 5, ref: 'twitter', receive: 'النشر في تويتر' },
        { name: 6, ref: 'transfer', receive: 'طلب ونقل الممتلكات' },
        { name: 10, ref: 'mechanical', receive: 'رخصة الميكانيكي' },
        { name: 12, ref: 'business', receive: 'الأعمال الخاصة' },
        { name: 15, ref: 'taboos', receive: 'فتح الممنوعات' },
        { name: 16, ref: 'robbery', receive: 'السرقات والسطو' },
        { name: 20, ref: 'loan', receive: 'الحصول على القروض البنكية' },
    ],
    reference: [
        800, 2100, 3800, 6100, 9500, 12500, 16000, 19800, 24000, 28500,
        33400, 38700, 44200, 50200, 56400, 63000, 69900, 77100, 84700, 92500,
        100700, 109200, 118000, 127100, 136500, 146200, 156200, 166500, 177100, 188000,
        199200, 210700, 222400, 234500, 246800, 259400, 272300, 285500, 299000, 312700,
        326800, 341000, 355600, 370500, 385600, 401000, 416600, 432600, 448800, 465200,
        482000, 499000, 516300, 533800, 551600, 569600, 588000, 606500, 625400, 644500,
        663800, 683400, 703300, 723400, 743800, 764500, 785400, 806500, 827900, 849600,
        871500, 893600, 916000, 938700, 961600, 984700, 1008100, 1031800, 1055700, 1079800,
        1104200, 1128800, 1153700, 1178800, 1204200, 1229800, 1255600, 1281700, 1308100, 1334600,
        1361400, 1388500, 1415800, 1443300, 1471100, 1499100, 1527300, 1555800, 1584350,
        1612950, 1641600, 1670300, 1699050, 1727850, 1756700, 1785600, 1814550, 1843550, 1872600,
        1901700, 1930850, 1960050, 1989300, 2018600, 2047950, 2077350, 2106800, 2136300, 2165850,
        2195450, 2225100, 2254800, 2284550, 2314350, 2344200, 2374100, 2404050, 2434050, 2464100,
        2494200, 2524350, 2554550, 2584800, 2615100, 2645450, 2675850, 2706300, 2736800, 2767350,
        2797950, 2828600, 2859300, 2890050, 2920850, 2951700, 2982600, 3013550, 3044550, 3075600,
        3106700, 3137850, 3169050, 3200300, 3231600, 3262950, 3294350, 3325800, 3357300, 3388850,
        3420450, 3452100, 3483800, 3515550, 3547350, 3579200, 3611100, 3643050, 3675050, 3707100,
        3739200, 3771350, 3803550, 3835800, 3868100, 3900450, 3932850, 3965300, 3997800, 4030350,
        4062950, 4095600, 4128300, 4161050, 4193850, 4226700, 4259600, 4292550, 4325550, 4358600,
        4391700, 4424850, 4458050, 4491300, 4524600, 4557950, 4591350, 4624800, 4658300, 4691850
    ]
};
exports('levelUp', (exp, skipDouble) => {
    if ((LEVEL_ITEMS.isDouble || VIP_ITEMS.store.some(i => i.type === 'exp' && i.timer)) && !skipDouble)
        exp = exp * 2;
    exp = parseInt(exp);
    LEVEL_ITEMS.exp += exp;
    SendNuiMessage(JSON.stringify({ type: 'levelUp', exp }));
    emitNet('NewStart:updateUser', { 'mode.level': exp }, true);
});
exports('getLevel', (exp) => {
    const index = LEVEL_ITEMS.reference.findIndex(i => i > (exp || LEVEL_ITEMS.exp));
    return (index >= 0) ? index + 1 : (!exp && !LEVEL_ITEMS.exp) ? 1 : LEVEL_ITEMS.reference.length + 1;
});
onNet('NewStart_MainMenu:initial-client', (data) => {
    const vipObj = data.vip || {};
    LEVEL_ITEMS = { ...LEVEL_ITEMS, ...data.level };
    if (data.level?.isDouble)
        exports.NewStart_HudSystem.method('setDoubleLevel', data.level.isDouble);
    if (data.info.hasOwnProperty('isWeapons'))
        exports.NewStart_Licenses.method('setState', 'isWeapons', data.info.isWeapons);
    if (data.info.hasOwnProperty('isCar'))
        exports.NewStart_Licenses.method('setState', 'isCar', data.info.isCar);
    if (data.info.hasOwnProperty('isMotor'))
        exports.NewStart_Licenses.method('setState', 'isMotor', data.info.isMotor);
    if (data.info.hasOwnProperty('isTruck'))
        exports.NewStart_Licenses.method('setState', 'isTruck', data.info.isTruck);
    SendNuiMessage(JSON.stringify({
        type: 'initial', page: 'home',
        info: {
            user: {
                ...data.info,
                vip: { ...vipObj, items: VIP_ITEMS.reference },
                level: LEVEL_ITEMS
            },
            settings: data.settings,
            isReward: data.isReward
        }
    }));
    if (data.settings) {
        exports['pma-voice'].setRadioVolume(data.settings.radioVolume * 100);
        exports['pma-voice'].setCallVolume(data.settings.phoneVolume * 100);
        exports.NewStart_Phone.volume(data.settings.phoneVolume);
        exports.NewStart_VehicleSystem.method('setVolume', data.settings.alertsVolume);
        exports.NewStart_RealEstate.method('setVolume', data.settings.alertsVolume);
        exports.NewStart_HudSystem.method('setStateNUI', { isControls: !data.settings.controls });
    }
});
onNet('NewStart_MainMenu:handleGeneral-client', (type, data) => {
    if (type === 'setDoubleLevel') {
        LEVEL_ITEMS.isDouble = data;
        exports.NewStart_HudSystem.method('setDoubleLevel', data);
        vipExecuteInterval();
    }
    else if (type === 'expLose') {
        LEVEL_ITEMS.exp -= data;
        SendNuiMessage(JSON.stringify({ type: 'levelUp', exp: data, isLose: true }));
        emitNet('NewStart:updateUser', { 'mode.level': -data }, true);
    }
    else if (type === 'updateUser') {
        if (data.isVip) {
            SendNuiMessage(JSON.stringify({ type: 'initial', info: { vip: data } }));
        }
        else {
            SendNuiMessage(JSON.stringify({ type: 'initial', info: { user: data } }));
            if (data.hasOwnProperty('isWeapons'))
                exports.NewStart_Licenses.method('setState', 'isWeapons', data.isWeapons);
            if (data.hasOwnProperty('isCar'))
                exports.NewStart_Licenses.method('setState', 'isCar', data.isCar);
            if (data.hasOwnProperty('isMotor'))
                exports.NewStart_Licenses.method('setState', 'isMotor', data.isMotor);
            if (data.hasOwnProperty('isTruck'))
                exports.NewStart_Licenses.method('setState', 'isTruck', data.isTruck);
        }
    }
    else if (type === 'levelUp') {
        exports.NewStart_MainMenu.levelUp(data, true);
    }
    else if (type === 'pushToStore') {
        handleStore(data);
    }
    else if (type === 'purchaseFromStore') {
        PlaySoundFrontend(-1, "PICK_UP", "HUD_FRONTEND_DEFAULT_SOUNDSET", false);
        SendNuiMessage(JSON.stringify({ type: 'purchase', info: data }));
        if (!IsNuiFocused())
            SetNuiFocus(true, false);
    }
    else if (type === 'setTaxes') {
        exports.NewStart_Licenses.method('setState', 'vipWeaponsTax', data.weapons);
        exports.NewStart_Jobs.method('setVipTax', data.jobs);
        exports.NewStart_Police.method('setVipTax', 'reservation', data.reservation);
    }
    else if (type === 'setData') {
        data.statistics.level = data.statistics.level.map((i) => ({ ...i, value: exports.NewStart_MainMenu.getLevel(i.value) }));
        SendNuiMessage(JSON.stringify({ type, info: data }));
    }
    else if (type === 'animShared') {
        if (data.action === 'slapped')
            startSlapped(data.serverID);
        else if (data.action === 'hostage')
            startHostage(data.serverID);
        else if (data.action === 'unHostage')
            state.hostage.canEnd = true;
        else if (data.action === 'kill')
            SetEntityHealth(PlayerPedId(), 0);
    }
});
onNet('NewStart_MainMenu:addToAds-client', (info, more) => {
    if (info) {
        const length = info.text.length;
        info.text = info.text.slice(0, 140);
        if (length > 140)
            info.text += '...';
        SendNuiMessage(JSON.stringify({ type: 'addToAds', info: { ...info, date: new Date() } }));
    }
    else {
        SendNuiMessage(JSON.stringify({ type: 'clearAds', more }));
    }
});
exports('isOpen', (withMain) => {
    if (withMain)
        return state.isOpen;
    else
        return state.isOpen || state.isHideAll;
});
exports('toggleAds', (value) => {
    if (state.isToggleAds !== value) {
        SendNuiMessage(JSON.stringify({ type: 'toggleAds', value }));
        state.isToggleAds = value;
    }
});
exports('closeUI', (isNormal) => {
    if (isNormal && state.shortcutsOpen) {
        SendNuiMessage(JSON.stringify({ type: 'shortcuts', value: false }));
        if (!state.isAnimShared)
            SetNuiFocus(false, false);
        state.shortcutsOpen = false;
    }
    if (state.isOpen) {
        if (!state.isAnimShared)
            SetNuiFocus(false, false);
        SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
        AnimpostfxStop('MenuMGIn');
        state.isOpen = false;
        if (!isNormal && state.isHideAll) {
            state.isHideAll = false;
            SendNuiMessage(JSON.stringify({ type: 'changeSettings', name: 'hideAll', value: false }));
        }
        else if (isNormal && !state.isHideAll) {
            DisplayRadar(true);
            exports.NewStart_HudSystem.openHud();
            exports.NewStart_MainMenu.toggleAds(true);
        }
        exports.NewStart_VehicleSystem.method('setHideUI', false);
        exports.NewStart_Phone.noticesToggle(false);
    }
    else if (state.isHideAll && !isNormal) {
        state.isHideAll = false;
        SendNuiMessage(JSON.stringify({ type: 'changeSettings', name: 'hideAll', value: false }));
    }
    else {
        SendNuiMessage(JSON.stringify({ type: 'purchaseClose' }));
    }
});
const state = {
    isOpen: false,
    isHideAll: false,
    timeoutID: null,
    isToggleAds: false,
    shortcutsOpen: false,
    isAnimShared: false,
    hostage: { type: '', serverID: 0, tickID: 0, isNUI: false, dete: 0, canEnd: false, isKilling: false }
};
const VIP_ITEMS = {
    intervalID: 0,
    store: [],
    reference: [
        { id: 6, name: 'season', translate: 'راعي سيزون', color: 'rgba(224, 50, 50, 255)', isCustomIDColor: true },
        { id: 64, name: 'strategic', translate: 'راعي استراتيجي', color: 'rgba(240, 160, 0, 255)', isCustomIDColor: true },
        { id: 118, name: 'official', translate: 'راعي رسمي', color: 'rgba(93, 182, 229, 255)', isCustomIDColor: true },
        { id: 11, name: 'diamond', translate: 'راعي ألماسي', color: 'rgba(47, 92, 115, 255)', isCustomIDColor: true },
        { id: 29, name: 'platinum', translate: 'راعي بلاتيني', color: 'rgba(156, 110, 175, 255)', isCustomIDColor: true },
        { id: 131, name: 'gold', translate: 'راعي ذهبي', color: 'rgba(214, 189, 97, 255)' },
        { id: 35, name: 'silver', translate: 'راعي فضي', color: 'rgba(211, 209, 231, 255)' },
        { id: 53, name: 'bronze', translate: 'راعي برونزي', color: 'rgba(186, 157, 125, 255)' }
    ]
};
function handleStore(data) {
    const isOther = data.type === 'other';
    if (!Array.isArray(data))
        data = [data];
    if (!data.length)
        return;
    if (isOther) {
        VIP_ITEMS.store = [...data, ...VIP_ITEMS.store];
        vipExecuteInterval(false, true);
    }
    else {
        const now = Date.now();
        VIP_ITEMS.store = [...data, ...VIP_ITEMS.store].map(i => {
            let timer = i.timer;
            if (i.type === 'vip') {
                timer = new Date(i.end).getTime();
                timer = timer - now;
                if (timer < 60000)
                    timer = 0;
            }
            return ({ ...i, timer });
        });
        clearInterval(VIP_ITEMS.intervalID);
        vipExecuteInterval();
        VIP_ITEMS.intervalID = setInterval(() => vipExecuteInterval(true), 60000);
    }
}
function vipExecuteInterval(isDecrease = false, isOther = false) {
    if (!VIP_ITEMS.store.length)
        return;
    VIP_ITEMS.store.sort((a, b) => {
        const typeOrder = { vip: 1, exp: 2, other: 3 };
        const aTimerIndex = a.timer ? 0 : 1;
        const bTimerIndex = b.timer ? 0 : 1;
        const typeComparison = typeOrder[a.type] - typeOrder[b.type];
        return (aTimerIndex - bTimerIndex) || (typeComparison !== 0 ? typeComparison : new Date(a.date).getTime() - new Date(b.date).getTime() || (a.timer || 0) - (b.timer || 0));
    });
    if (!isOther) {
        const firstExpIndex = VIP_ITEMS.store.findIndex(i => i.type === 'exp');
        for (let index in VIP_ITEMS.store) {
            const item = VIP_ITEMS.store[index];
            const isFirstExp = parseInt(index) === firstExpIndex;
            if (isFirstExp)
                item.noPause = !LEVEL_ITEMS.isDouble;
            if (((isFirstExp && !LEVEL_ITEMS.isDouble) || item.type === 'vip') && item.timer && isDecrease) {
                let isZero = false;
                item.timer -= 60000;
                if (item.timer < 60000) {
                    item.timer = 0;
                    item.noPause = false;
                    isZero = true;
                    if (item.type === 'vip') {
                        emitNet('NewStart_MainMenu:handleGeneral-server', 'setVip', { type: 'endVip', id: item.refID });
                    }
                }
                if (item.type !== 'vip')
                    emitNet('NewStart_MainMenu:handleGeneral-server', 'setVip', { type: 'doubleExp', id: item._id, isZero });
            }
            if (item.timer) {
                let days = Math.floor(item.timer / 86400000);
                days = days < 10 ? '0' + days : days;
                item.timerText = `${days}:${('0' + Math.floor(item.timer / 3600000) % 24).slice(-2)}:${('0' + Math.floor(item.timer / 60000) % 60).slice(-2)}`;
            }
        }
    }
    SendNuiMessage(JSON.stringify({ type: 'openUI', onlyStore: true, store: VIP_ITEMS.store }));
}
