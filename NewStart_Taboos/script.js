"use strict";
const state = {
    pedID: 0,
    pedCoord: [],
    securityKeys: ['police', 'facilities'],
    isDead: false,
    isPauseMenu: false,
    isVeh: false,
    isDrunk: false,
    drunkTime: 0,
    lastDrunk: 0,
    drunkDelayID: 0,
    isOpen: false,
    runClose: false,
    coords: { x: 1971.4945, y: 4641.0200, z: 39.9230, h: 45 },
    diving: { tickID: 0, objectID: 0, isLight: false },
    boxs: {
        itemType: '',
        runClose: false,
        blip: 0,
        tickID: 0,
        items: [
            { blip: 0, objID: 0, x: 400.5758, y: 3940.2460, z: -8.4527 },
            { blip: 0, objID: 0, x: 228.8703, y: 4062.0527, z: -3.6673 },
            { blip: 0, objID: 0, x: 130.5758, y: 3979.5693, z: -12.9685 },
            { blip: 0, objID: 0, x: 62.7824, y: 4130.0043, z: -8.9000 }
        ]
    }
};
const empty = null;
on('onClientGameTypeStart', () => {
    createBlip(496, 'ﺕﺎﻋﻮﻨﻤﻤﻟﺍ', state.coords.x, state.coords.y, state.coords.z);
    RequestModel(1593773001);
    RequestModel(887694239);
});
setTick(() => {
    state.pedID = PlayerPedId();
    state.pedCoord = GetEntityCoords(state.pedID, true);
    state.isDead = IsEntityDead(state.pedID);
    state.isPauseMenu = IsPauseMenuActive();
    state.isVeh = IsPedInAnyVehicle(state.pedID, false);
    const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], state.coords.x, state.coords.y, state.coords.z, true);
    if (distance < 1.7 &&
        !exports.NewStart_Stores.method('isOpen') &&
        !state.isDead && !state.isPauseMenu && !state.isVeh) {
        if (IsControlJustPressed(0, 38)) {
            SendNUIMessage(JSON.stringify({ type: 'openUI' }));
            SetNuiFocus(true, true);
            state.isOpen = true;
        }
        else if (!state.isOpen && !state.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen', action: 'talk' }));
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
        case 'fullScreen':
            if (IsRadarHidden()) {
                exitFullScreen();
            }
            else {
                exports.NewStart_HudSystem.closeUI();
                exports.NewStart_Phone.noticesToggle(true);
                exports.NewStart_MainMenu.toggleAds(false);
                DisplayRadar(false);
            }
            break;
        case 'startMission':
            const level = exports.NewStart_MainMenu.method('validLevel', 'taboos');
            if (exports.NewStart_Factions.info()?.key && !exports.NewStart_Factions.info()?.isVacation) {
                exports.NewStart_Notifications.showAttention('error', 'ماذا تفعل؟ غير مسموح بتواجدك هنا!');
                exitFullScreen();
                closeUI(false);
                return cb('OK!');
            }
            else if (!level.isCan) {
                exports.NewStart_Notifications.showAttention('error', `تحتاج للوصول للمستوى ${level.need} أولاً قبل البدء!`);
                exitFullScreen();
                closeUI(false);
                return cb('OK!');
            }
            else if (!state.diving.tickID) {
                exports.NewStart_Notifications.showAttention('error', 'يجب عليك ارتداء ملابس الغوص أولاً قبل البدء!');
                exitFullScreen();
                closeUI(false);
                return cb('OK!');
            }
            clearTick(state.boxs.tickID);
            RemoveBlip(state.boxs.blip);
            state.boxs.itemType = data.active;
            state.boxs.blip = createBlip(496, 'ﺕﺎﻋﻮﻨﻤﻤﻟﺍ', 253.8461, 3975.7714, 4.0051);
            for (let item of state.boxs.items) {
                if (item.objID)
                    DeleteObject(item.objID);
                if (item.blip)
                    RemoveBlip(item.blip);
                item.objID = CreateObject(887694239, item.x, item.y, item.z, false, false, false);
                item.blip = AddBlipForRadius(item.x, item.y, item.z, 40);
                FreezeEntityPosition(item.objID, true);
                SetBlipHighDetail(item.blip, true);
                SetBlipColour(item.blip, 1);
                SetBlipAlpha(item.blip, 80);
            }
            state.boxs.tickID = setTick(() => {
                for (let item of state.boxs.items) {
                    if (!item.objID)
                        continue;
                    const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.x, item.y, item.z, true);
                    if (distance < 20) {
                        DrawMarker(20, item.x, item.y, item.z + 1, 0, 0, 0, 0, 180, 0, 0.5, 0.5, 0.3, 45, 101, 167, 100, true, true, 2, false, empty, empty, false);
                        if (distance < 2.5) {
                            if (IsControlJustPressed(0, 38)) {
                                const isOpiate = state.boxs.itemType === 'opiate';
                                const count = isOpiate ? 8 : 10;
                                const inventory = exports.NewStart_Inventory.addItem(JSON.stringify({ id: isOpiate ? 104 : 102, count }), true);
                                if (!inventory) {
                                    exports.NewStart_Notifications.showAttention('error', 'للإسف مساحة الحقيبة غير كافية لهذا!');
                                }
                                else {
                                    PlaySound(-1, "PICK_UP", "HUD_FRONTEND_DEFAULT_SOUNDSET", false, 0, false);
                                    DeleteObject(item.objID);
                                    RemoveBlip(item.blip);
                                    item.objID = 0;
                                    item.blip = 0;
                                    exports.NewStart_Notifications.showAttention('success', `لقد حصلت علي +${count} نبات ${isOpiate ? 'الأفيون' : 'الكوكا'}.`);
                                    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                                    if (!state.boxs.items.some(i => i.objID)) {
                                        clearTick(state.boxs.tickID);
                                        RemoveBlip(state.boxs.blip);
                                    }
                                }
                            }
                            else if (!state.boxs.runClose) {
                                SendNUIMessage(JSON.stringify({ type: 'entranceOpen', action: 'normal' }));
                                state.boxs.runClose = true;
                            }
                        }
                        else if (state.boxs.runClose) {
                            state.boxs.runClose = false;
                            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                        }
                        break;
                    }
                }
            });
            exitFullScreen();
            closeUI(false);
            if (data.active === 'meth') {
                exports.NewStart_Notifications.showAttention('success', 'تم إظهار مواقع صناديق نبات الكوكا أو عُد للواجهة وأختر الأفيون.');
            }
            else if (data.active === 'cocaine') {
                exports.NewStart_Notifications.showAttention('success', 'تم إظهار مواقع صناديق التهريب لنبات الكوكايين.');
            }
            else {
                exports.NewStart_Notifications.showAttention('success', 'تم إظهار مواقع صناديق التهريب لنبات الأفيون.');
            }
            break;
        case 'tools': exports.NewStart_Stores.method('openUI', 'teboos');
        default:
            closeUI(false);
            break;
    }
    cb('OK!');
});
exports('method', (type, data) => {
    if (type === 'divingSuit') {
        if (data?.isRun) {
            return !!state.diving.tickID;
        }
        else if (data?.isEnd) {
            if (!state.diving.tickID)
                return;
            const pedID = PlayerPedId();
            const hair = exports.NewStart_Hairdresser.method('playerPed').hair;
            exports.NewStart_Clothes.pedReset();
            SetPedComponentVariation(PlayerPedId(), 2, hair.style, 0, 0);
            SetPedHairColor(pedID, hair.color, 1);
            SetPedDiesInWater(pedID, true);
            SetEnableScuba(pedID, false);
            SetEnableScubaGearLight(pedID, false);
            emitNet('NewStart_Clothes:payment-server', JSON.stringify({ outfit: exports.NewStart_Clothes.playerPed() }));
            clearInterval(state.diving.tickID);
            DeleteObject(state.diving.objectID);
            state.diving = { tickID: 0, objectID: 0, isLight: false };
            clearTick(state.boxs.tickID);
            RemoveBlip(state.boxs.blip);
            for (let item of state.boxs.items) {
                DeleteObject(item.objID);
                RemoveBlip(item.blip);
            }
        }
        else {
            let error = '';
            if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
                error = 'أنت ترتدي ملابس الغوص بالفعل!';
            }
            else if (exports.NewStart_RealEstate.method('getCurrent', 'insideCode')) {
                error = 'لا يمكن ارتداء هذه الملابس داخل العقارات الخاصة!';
            }
            else if (exports.NewStart_Jobs.currentJob().isActive || (exports.NewStart_Employee.data().isActive && exports.NewStart_Employee.data().outfitID !== 1)) {
                error = 'انت ترتدي ملابس العمل تخلص منها أولاً!';
            }
            if (error) {
                emit('NewStart_Inventory:additem-client', JSON.stringify({ id: 107, count: 1 }), true);
                exports.NewStart_Notifications.showAttention('error', error);
                return false;
            }
            if (!data?.noNotice)
                exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: '5s', status: true });
            TaskPlayAnim(PlayerPedId(), 'missmic4', 'michael_tux_fidget', 8.0, -8.0, -1, 51, 0, false, false, false);
            setTimeout(() => {
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                ClearPedTasks(PlayerPedId());
                divingSuit();
                emitNet('NewStart_Clothes:payment-server', JSON.stringify({ outfit: { itemID: 107, ...exports.NewStart_Clothes.playerPed() } }));
                if (!data?.noNotice) {
                    exports.NewStart_Inventory.addItem(JSON.stringify({ id: 108, count: 1 }));
                    exports.NewStart_Notifications.showAttention('success', 'جيد .. أختر الآن نبات الممنوعات الذي ترغب بإيجاده.');
                }
            }, data?.noNotice ? 0 : 5000);
            return true;
        }
    }
    else if (type === 'drunkEffect') {
        if (data.isRun) {
            return !!state.isDrunk;
        }
        else {
            const pedID = PlayerPedId();
            if (data.isReset) {
                TaskPlayAnim(pedID, 'mp_player_intdrink', 'loop', 1.0, -1.0, 2000, 50, 0, false, false, false);
                setTimeout(() => resetDrunkEffect(pedID), 2000);
                return;
            }
            else if (state.isDrunk) {
                if (data.name === 'whiskey') {
                    TaskPlayAnim(pedID, 'mp_player_intdrink', 'loop', 1.0, -1.0, 2000, 50, 0, false, false, false);
                    state.lastDrunk = Date.now();
                }
                else {
                    exports.NewStart_DeathCounter.method('setKillBydrugs');
                    resetDrunkEffect(pedID);
                    SetEntityHealth(pedID, 0);
                }
                return;
            }
            else if (data.name === 'whiskey') {
                TaskPlayAnim(pedID, 'mp_player_intdrink', 'loop', 1.0, -1.0, 2000, 50, 0, false, false, false);
            }
            else {
                TaskPlayAnim(pedID, 'mp_player_inteat@burger', 'mp_player_int_eat_burger', 1.0, -1.0, 800, 50, 0, false, false, false);
            }
            state.lastDrunk = Date.now();
            state.drunkDelayID = setTimeout(() => {
                SetTimecycleModifier("spectator5");
                SetPedMotionBlur(pedID, true);
                SetPedMovementClipset(pedID, "MOVE_M@DRUNK@SLIGHTLYDRUNK", 1);
                SetPedIsDrunk(pedID, true);
            }, data.delay);
            state.isDrunk = setTimeout(() => resetDrunkEffect(pedID), data.end);
            state.drunkTime = data.end;
            const tickID = setInterval(() => {
                if (!state.isDrunk) {
                    clearInterval(tickID);
                    return;
                }
                state.drunkTime -= 5000;
                exports.NewStart_HudSystem.method('updateWine', (state.drunkTime / data.end) * 100);
            }, 5000);
            exports.NewStart_HudSystem.method('updateWine', 100);
        }
    }
    else if (type === 'lastDrunk') {
        if (data) {
            state.lastDrunk = data;
        }
        else {
            return state.lastDrunk;
        }
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
function createBlip(id, title, x, y, z) {
    const blip = AddBlipForCoord(x, y, z);
    SetBlipSprite(blip, id);
    SetBlipColour(blip, 6);
    SetBlipAsShortRange(blip, true);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(`<font face="A9eelsh">${title}</font>`);
    EndTextCommandSetBlipName(blip);
    return blip;
}
(async function createEmployee() {
    const model = GetHashKey('ig_malc');
    const anim = 'amb@world_human_stand_guard@male@base';
    RequestModel(model);
    RequestAnimDict(anim);
    while (!HasModelLoaded(model) || !HasAnimDictLoaded(anim))
        await Delay(1000);
    const pedID = CreatePed(1, model, state.coords.x, state.coords.y, state.coords.z, state.coords.h, false, false);
    FreezeEntityPosition(pedID, true);
    SetBlockingOfNonTemporaryEvents(pedID, true);
    SetEntityInvincible(pedID, true);
    TaskPlayAnim(pedID, anim, 'base', 8.0, 1.0, -1, 1, 1.0, false, false, false);
})();
function divingSuit() {
    const pedID = PlayerPedId();
    const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');
    const items = [...exports.NewStart_Clothes.items(), { type: 'main', id: 2, name: 'hair' }];
    let clothes = exports.NewStart_Clothes.playerPed(true);
    const bone = GetPedBoneIndex(pedID, 24818);
    if (isMale) {
        clothes = { ...clothes, hair: 0, glass: 26, mask: 122, torso: 44, top: 53, undershirt: 15, leg: 94, shoe: 67 };
        state.diving.objectID = CreateObject(1593773001, 1.0, 1.0, 1.0, true, true, false);
        AttachEntityToEntity(state.diving.objectID, pedID, bone, -0.3, -0.2265, 0, 180.0, 90.0, 0.0, true, true, false, false, 2, true);
    }
    else {
        clothes = { ...clothes, hair: 0, glass: 28, mask: 122, torso: 36, top: 46, undershirt: 15, leg: 97, shoe: 70 };
        state.diving.objectID = CreateObject(1569945555, 1.0, 1.0, 1.0, true, true, false);
        AttachEntityToEntity(state.diving.objectID, pedID, bone, -0.29, -0.2, 0, 180.0, 91.0, -2.0, true, true, true, true, 2, true);
    }
    SetPedDiesInWater(pedID, false);
    SetEnableScuba(pedID, true);
    for (let key in clothes) {
        const item = items.find((obj) => obj.name === key);
        const value = clothes[key];
        if (item.type === 'main') {
            SetPedComponentVariation(pedID, item.id, value, 0, 0);
        }
        else {
            if (value !== 0) {
                SetPedPropIndex(pedID, item.id, value, 0, true);
            }
            else {
                ClearPedProp(pedID, item.id);
            }
        }
    }
    state.diving.tickID = setInterval(() => {
        const isUnderWater = IsPedSwimmingUnderWater(pedID);
        if (!state.diving.isLight && isUnderWater) {
            SetEnableScubaGearLight(pedID, true);
            state.diving.isLight = true;
        }
        else if (state.diving.isLight && !isUnderWater) {
            SetEnableScubaGearLight(pedID, false);
            state.diving.isLight = false;
        }
    }, 2000);
}
async function resetDrunkEffect(pedID) {
    clearTimeout(state.drunkDelayID);
    clearTimeout(state.isDrunk);
    state.isDrunk = false;
    DoScreenFadeOut(1000);
    await Delay(1000);
    DoScreenFadeIn(1000);
    ClearTimecycleModifier();
    ResetPedMovementClipset(pedID, 1);
    SetPedIsDrunk(pedID, false);
    SetPedMotionBlur(pedID, false);
    exports.NewStart_HudSystem.method('updateWine', 0);
}
function exitFullScreen() {
    exports.NewStart_Phone.noticesToggle(false);
    if (!exports.NewStart_MainMenu.isOpen()) {
        DisplayRadar(true);
        exports.NewStart_HudSystem.openHud();
        exports.NewStart_MainMenu.toggleAds(true);
    }
}
function closeUI(isNUI) {
    if (state.isOpen) {
        state.isOpen = false;
        SetNuiFocus(false, false);
    }
    if (isNUI)
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    state.runClose = false;
}
exports('other', (type) => {
    if (type === 'resetCurrentSale') {
        seaport.currentSale = 0;
    }
});
const seaport = {
    isActive: false,
    isReverse: false,
    lastSubSeaPortClosed: true,
    runClose: false,
    timeoutID: 0,
    currentSale: 0, maxSale: 100,
    delivered: [
        { id: 22, name: 'meth', ar: 'الميث', price: 2600, exp: 35, time: 1000, maxCount: 10, available: 35 },
        { id: 43, name: 'coca', ar: 'الكوكايين', price: 750, exp: 10, time: 1000, maxCount: 10, available: 10 },
        { id: 91, name: 'opiate', ar: 'الأفيون', price: 1600, exp: 20, time: 1000, maxCount: 10, available: 20 }
    ],
    items: [
        { type: 'meth', locType: 'main', name: 'ﺚﻴﻤﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 499, coords: { x: -3366.8308, y: 2814.7912, z: 9.2453 } },
        { type: 'meth', locType: 'main', name: 'ﺚﻴﻤﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 499, coords: { x: -3445.2263, y: 2841.7055, z: 9.2453 } },
        { type: 'meth', locType: 'sub', name: 'ﺚﻴﻤﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 499, coords: { x: -3754.9714, y: 2761.9384, z: 116.2204 } },
        { type: 'meth', locType: 'sub', name: 'ﺚﻴﻤﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 499, coords: { x: -3595.2395, y: 2809.7143, z: 9.2285 } },
        { type: 'coca', locType: 'main', name: 'ﻦﻴﻳﺎﻛﻮﻜﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 501, coords: { x: -3467.4592, y: 2877.4416, z: 9.2453 } },
        { type: 'coca', locType: 'main', name: 'ﻦﻴﻳﺎﻛﻮﻜﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 501, coords: { x: -3399.1384, y: 2753.7231, z: 9.3802 } },
        { type: 'coca', locType: 'sub', name: 'ﻦﻴﻳﺎﻛﻮﻜﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 501, coords: { x: -3857.3010, y: 2722.9318, z: 9.2285 } },
        { type: 'coca', locType: 'sub', name: 'ﻦﻴﻳﺎﻛﻮﻜﻟﺍ ﻊﻴﺑ', blipID: 0, blipType: 501, coords: { x: -3739.0417, y: 2705.9604, z: 9.3802 } },
        { type: 'opiate', locType: 'main', name: 'ﻥﻮﻴﻓﻷﺍ ﻊﻴﺑ', blipID: 0, blipType: 51, coords: { x: -3295.5693, y: 2771.9868, z: 9.2285 } },
        { type: 'opiate', locType: 'main', name: 'ﻥﻮﻴﻓﻷﺍ ﻊﻴﺑ', blipID: 0, blipType: 51, coords: { x: -3412.9055, y: 2907.8901, z: 9.2285 } },
        { type: 'opiate', locType: 'sub', name: 'ﻥﻮﻴﻓﻷﺍ ﻊﻴﺑ', blipID: 0, blipType: 51, coords: { x: -3791.2087, y: 2656.8132, z: 8.2343 } },
        { type: 'opiate', locType: 'sub', name: 'ﻥﻮﻴﻓﻷﺍ ﻊﻴﺑ', blipID: 0, blipType: 51, coords: { x: -3597.3361, y: 2966.6901, z: 9.2285 } },
    ]
};
setInterval(() => {
    const subSeaPortClosed = exports.NewStart_Tools.method('getInfo').subSeaPortClosed;
    seaport.isActive = !exports.NewStart_Factions.info()?.key || exports.NewStart_Factions.info()?.isVacation;
    if (seaport.isReverse && subSeaPortClosed !== seaport.lastSubSeaPortClosed) {
        seaport.lastSubSeaPortClosed = subSeaPortClosed;
        seaport.isReverse = false;
    }
    if (seaport.isActive && !seaport.isReverse) {
        removeBuild();
        let filterMain = seaport.items.filter(i => i.locType === 'main');
        let filterSub = seaport.items.filter(i => i.locType === 'sub');
        const maxMain = subSeaPortClosed ? 3 : (Math.floor(Math.random() * 2) + 1);
        const maxSub = maxMain === 1 ? 2 : 1;
        const randomTypes = [];
        for (let i = 0; i < maxMain; i++) {
            const index = Math.floor(Math.random() * filterMain.length);
            const item = filterMain[index];
            filterMain = filterMain.filter(i => i.type !== item.type);
            item.blipID = createBlip(item.blipType, item.name, item.coords.x, item.coords.y, item.coords.z);
            randomTypes.push(item.type);
        }
        if (!subSeaPortClosed) {
            filterSub = filterSub.filter(i => !randomTypes.includes(i.type));
            if (filterSub.length) {
                for (let i = 0; i < maxSub; i++) {
                    const index = Math.floor(Math.random() * filterSub.length);
                    const item = filterSub[index];
                    filterSub = filterSub.filter(i => i.type !== item.type);
                    item.blipID = createBlip(item.blipType, item.name, item.coords.x, item.coords.y, item.coords.z);
                }
            }
        }
        seaport.isReverse = true;
    }
    else if (!seaport.isActive && seaport.isReverse) {
        removeBuild();
        seaport.isReverse = false;
    }
}, 5000);
setTick(() => {
    if (seaport.isActive) {
        let currentType = '';
        for (let item of seaport.items.filter(i => i.blipID)) {
            const distance = GetDistanceBetweenCoords(state.pedCoord[0], state.pedCoord[1], state.pedCoord[2], item.coords.x, item.coords.y, item.coords.z, true);
            if (distance < 25) {
                DrawMarker(1, item.coords.x, item.coords.y, item.coords.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.5, 0.5, 0.25, 146, 46, 39, 100, false, false, 2, false, empty, empty, false);
                if (distance < 1.1) {
                    currentType = item.type;
                    break;
                }
            }
        }
        if (currentType && !state.isDead && !state.isPauseMenu && !state.isVeh) {
            if (IsControlJustPressed(0, 38) && !seaport.timeoutID) {
                const seaPortClosed = exports.NewStart_Tools.method('getInfo').seaPortClosed;
                const find = seaport.delivered.find(i => i.name === currentType);
                let count = exports.NewStart_Inventory.info('currentItems').find((i) => i.id === find?.id)?.count || 0;
                const securityLength = exports.NewStart_PoliceTools.method('getPlayersFactions').filter((i) => state.securityKeys.includes(i.key)).length;
                if (exports.NewStart_Admin.method('info').isComfort) {
                    exports.NewStart_Notifications.showAttention('error', 'وقت راحة! لا يمكنك  بيع أي ممنوعات أو الإجرام');
                }
                else if (seaPortClosed) {
                    exports.NewStart_Notifications.showAttention('error', 'الميناء البحري بالكامل مغلق الآن لا يمكنك البيع!');
                }
                else if (seaport.currentSale >= seaport.maxSale) {
                    exports.NewStart_Notifications.showAttention('error', `يمكنك بيع ${seaport.maxSale} فقط انتظر افتتاح الميناء مره اخري عند السابعة صباحا!`);
                }
                else if (securityLength < find?.available) {
                    exports.NewStart_Notifications.showAttention('error', `يجب تواجد ${find?.available} عسكري على الأقل من الشرطة وأمن المنشآت!`);
                }
                else if (find && count && count >= 1) {
                    if (count > find.maxCount)
                        count = find.maxCount;
                    if ((seaport.currentSale + count) > seaport.maxSale) {
                        count -= (seaport.currentSale + count) - seaport.maxSale;
                    }
                    exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: `${(find.time * count / 1000).toFixed(1)}s`, status: true, canMove: true });
                    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
                    seaport.timeoutID = setTimeout(() => {
                        exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                        SendNUIMessage(JSON.stringify({ type: 'entranceOpen', action: 'normal' }));
                        if (exports.NewStart_Inventory.info('currentItems').find((i) => i.id === find.id)?.count >= count) {
                            seaport.currentSale += count;
                            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: find.id, count }));
                            const price = exports.NewStart_Admin.method('info').isDoubleTaboo ? (find.price * count) * 2 : find.price * count;
                            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 106, count: price }));
                            exports.NewStart_MainMenu.levelUp(find.exp * count);
                            exports.NewStart_Notifications.showAttention('success', `لقد حصلت علي ${price.toLocaleString()}$ غير شرعي.`);
                            emitNet('NewStart_MainMenu:handleGeneral-server', 'setFavorite', { crime: 0.1 * count }, true);
                        }
                        else {
                            exports.NewStart_Notifications.showAttention('error', 'لقد فشلت العملية لفقدان المواد اللازمة!');
                        }
                        seaport.timeoutID = 0;
                    }, find.time * count);
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', `أنت ليس لديك مخدر ${find?.ar} في الحقيبة!`);
                }
            }
            else if (!seaport.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen', action: 'normal' }));
            }
            seaport.runClose = true;
        }
        else if (seaport.runClose) {
            if (seaport.timeoutID) {
                clearTimeout(seaport.timeoutID);
                seaport.timeoutID = 0;
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
            }
            seaport.runClose = false;
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
        }
    }
});
function removeBuild() {
    for (let item of seaport.items.filter(i => i.blipID)) {
        RemoveBlip(item.blipID);
        item.blipID = 0;
    }
}
