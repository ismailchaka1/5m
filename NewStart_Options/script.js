"use strict";
RegisterCommand('+options', () => {
    if (IsPauseMenuActive() ||
        exports.NewStart_Jobs.isOpen() ||
        exports.NewStart_Tools.method('isProgress') ||
        exports.NewStart_Phone.isOpen() ||
        exports.NewStart_Police.method('info').isJailed ||
        exports.NewStart_PoliceTools.method('info').isPolmav)
        return;
    const playerPed = exports.NewStart_Clothes.playerPed();
    const options = { inspection: false, revive: false, mechanical: false };
    const pedID = PlayerPedId();
    const isJob = getIsJob();
    const virtualClothesItems = JSON.parse(JSON.stringify(clothesItems));
    if (exports.NewStart_Employee.data().isActive) {
        options.inspection = ['facilities', 'police'].includes(exports.NewStart_Factions.info()?.key);
        options.revive = exports.NewStart_Factions.info()?.key === 'health';
    }
    else if (exports.NewStart_Mechanical.method('info', 'isIn')) {
        options.mechanical = true;
    }
    console.log(state.virtualToggle);
    for (let key in playerPed) {
        const item = isJob ? virtualClothesItems.find(i => i.name === key) : clothesItems.find(i => i.name === key);
        if (item) {
            const skip = key !== 'top' && key !== 'leg';
            if (isJob) {
                if (item.type === 'main')
                    playerPed[key] = GetPedDrawableVariation(pedID, item.id);
                else
                    playerPed[key] = GetPedPropIndex(pedID, item.id);
                item.isActive = !!state.virtualToggle[item.name];
                if (!item.isActive && skip)
                    item.isDisabled = playerPed[key] < 1;
            }
            else if (skip) {
                item.isDisabled = playerPed[key] < 1;
            }
        }
    }
    SendNuiMessage(JSON.stringify({
        type: 'openUI', clothesItems: isJob ? virtualClothesItems : clothesItems,
        options: { ...options, smoking: exports.NewStart_Inventory.method('smoking', 'get') }
    }));
    state.isOpen = true;
    SetNuiFocus(true, true);
}, false);
RegisterKeyMapping('+options', 'Character Options', 'keyboard', 'f5');
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    switch (data.type) {
        case 'external':
            state.isOpen = false;
            state.showCursor = false;
            SetNuiFocus(false, false);
            if (data.action === 'radio') {
                exports.NewStart_Radio.openUI();
            }
            else if (data.action === 'handcuff') {
                exports.NewStart_Inspection.handcuff(data.value);
            }
            else if (data.action === 'inspection') {
                exports.NewStart_Inspection.openUI(data.value);
            }
            else if (data.action === 'smoking') {
                exports.NewStart_Inventory.method('smoking', 'done');
            }
            else if (data.action === 'mechanical') {
                if (data.isFlip) {
                    exports.NewStart_Mechanical.method('vehicleFlip');
                }
                else {
                    exports.NewStart_Mechanical.method('openPanel');
                }
            }
            else if (data.action === 'health') {
                exports.NewStart_Medicine.treatment('health');
            }
            else if (data.action === 'revive') {
                exports.NewStart_Medicine.treatment('revive');
            }
            else if (data.action === 'report' || data.action === 'stretcher') {
                exports.NewStart_Medicine.method(data.action);
            }
            else if (data.action === 'playerDrag' || data.action === 'unlock' || data.action === 'drugs') {
                exports.NewStart_Police.method(data.action);
            }
            break;
        case 'clothes':
            if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
                exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس خاصة بمهمة تخلص منها أولاً.');
                state.isOpen = false;
                state.showCursor = false;
                SetNuiFocus(false, false);
                return cb('Failed');
            }
            break;
        case 'clothesToggle':
            const pedID = PlayerPedId();
            const playerPed = exports.NewStart_Clothes.playerPed();
            const isJob = getIsJob();
            const ref = clothesItems.find(obj => obj.name === data.info.name);
            const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');
            const isPedInVeh = IsPedInAnyVehicle(pedID, false);
            const delay = (ref.name === 'glass' && !data.info.isActive) || isPedInVeh ? 0 : ref.animation.dur / 2;
            if (!isPedInVeh) {
                if (ref.name !== 'glass' || (ref.name === 'glass' && data.info.isActive)) {
                    TaskPlayAnim(pedID, ref.animation.dict, ref.animation.anim, 3.0, 3.0, ref.animation.dur, ref.animation.move, 0, false, false, false);
                }
            }
            setTimeout(() => {
                if (data.info.isActive) {
                    if (isJob)
                        state.virtualToggle[data.info.name] = getClothesData(pedID, ref.name);
                    if (data.info.name === 'top') {
                        if (isJob) {
                            state.virtualToggle['undershirt'] = getClothesData(pedID, 'undershirt');
                            state.virtualToggle['torso'] = getClothesData(pedID, 'torso');
                        }
                        SetPedComponentVariation(pedID, ref.id, 15, 0, 0);
                        SetPedComponentVariation(pedID, 3, 15, 0, 0);
                        SetPedComponentVariation(pedID, 8, 15, 0, 0);
                    }
                    else if (data.info.name === 'leg') {
                        SetPedComponentVariation(pedID, ref.id, isMale ? 21 : 15, 0, 0);
                    }
                    else if (data.info.name === 'shoe') {
                        SetPedComponentVariation(pedID, ref.id, isMale ? 34 : 35, 0, 0);
                    }
                    else if (ref.type === 'main') {
                        SetPedComponentVariation(pedID, ref.id, 0, 0, 0);
                    }
                    else {
                        ClearPedProp(pedID, ref.id);
                    }
                }
                else {
                    if (isJob) {
                        if (ref.type === 'main') {
                            SetPedComponentVariation(pedID, ref.id, state.virtualToggle[ref.name].drawableID, state.virtualToggle[ref.name].textureID, 0);
                            if (data.info.name === 'top') {
                                SetPedComponentVariation(pedID, 3, state.virtualToggle['torso'].drawableID, 0, 0);
                                SetPedComponentVariation(pedID, 8, state.virtualToggle['undershirt'].drawableID, state.virtualToggle['undershirt'].textureID, 0);
                            }
                        }
                        else {
                            SetPedPropIndex(pedID, ref.id, state.virtualToggle[ref.name].drawableID, state.virtualToggle[ref.name].textureID, true);
                        }
                        delete state.virtualToggle[ref.name];
                    }
                    else {
                        const value = playerPed[data.info.name];
                        const textureID = exports.NewStart_Clothes.method('getTextures')[data.info.name];
                        if (ref.type === 'main') {
                            SetPedComponentVariation(pedID, ref.id, value, textureID, 0);
                            if (data.info.name === 'top') {
                                const undershirtTextureID = exports.NewStart_Clothes.method('getTextures').undershirt;
                                SetPedComponentVariation(pedID, 3, playerPed.torso, 0, 0);
                                SetPedComponentVariation(pedID, 8, playerPed.undershirt, undershirtTextureID, 0);
                            }
                        }
                        else {
                            SetPedPropIndex(pedID, ref.id, value, textureID, true);
                        }
                    }
                }
            }, delay);
            if (!isJob) {
                if (data.info.name !== 'armor')
                    emitNet('NewStart:updateUser', { [`character.outfitToggle.${data.info.name}`]: data.info.isActive });
                state.normalToggle[data.info.name] = data.info.isActive;
                ref.isActive = data.info.isActive;
            }
            break;
        case 'hideCursor':
            if (!state.showCursor)
                SetNuiFocus(false, false);
            break;
        default:
            state.showCursor = false;
            state.isOpen = false;
            SetNuiFocus(false, false);
    }
    cb('OK!');
});
onNet('NewStart_Options:setOutfitActive-client', (data) => {
    if (data) {
        for (let key in data) {
            const index = clothesItems.findIndex(obj => obj.name === key);
            clothesItems[index].isActive = data[key];
        }
        state.normalToggle = data;
    }
    for (let obj of clothesItems) {
        RequestAnimDict(obj.animation.dict);
    }
});
function getIsJob() {
    return exports.NewStart_Employee.data().isActive || exports.NewStart_Mechanical.method('info', 'isIn') || exports.NewStart_Jobs.currentJob().isActive;
}
function getClothesData(pedID, name) {
    const item = exports.NewStart_Clothes.items().find((i) => i.name === name);
    return {
        name,
        drawableID: item.type === 'main' ? GetPedDrawableVariation(pedID, item.id) : GetPedPropIndex(pedID, item.id),
        textureID: item.type === 'main' ? GetPedTextureVariation(pedID, item.id) : GetPedPropTextureIndex(pedID, item.id)
    };
}
exports('clothesReset', (isLocal) => {
    const data = {};
    for (let obj of clothesItems) {
        data[obj.name] = false;
        obj.isActive = false;
    }
    SendNuiMessage(JSON.stringify({ type: 'clothesReset', clothesItems }));
    if (!isLocal)
        emitNet('NewStart:updateUser', { 'character.outfitToggle': data });
});
exports('clothesItems', (isReset, more) => {
    if (isReset) {
        for (let key in state.normalToggle) {
            const index = clothesItems.findIndex(obj => obj.name === key);
            if (clothesItems[index].name !== 'armor')
                clothesItems[index].isActive = state.normalToggle[key];
        }
    }
    else {
        if (more)
            state.virtualToggle = {};
        return clothesItems;
    }
});
exports('closeUI', (type) => {
    if (type === 'isOpen') {
        return state.isOpen;
    }
    else if (type === 'showCursor') {
        state.showCursor = true;
        SetNuiFocus(true, true);
        setTimeout(() => { state.showCursor = false; }, 150);
    }
    else {
        state.isOpen = false;
        state.showCursor = false;
        SetNuiFocus(false, false);
        SendNuiMessage(JSON.stringify({ type: 'closeUI' }));
    }
});
const state = {
    normalToggle: {},
    virtualToggle: {},
    isOpen: false,
    showCursor: false
};
const clothesItems = [
    {
        type: 'prop',
        id: 0,
        name: 'hat',
        animation: { dict: 'mp_masks@standard_car@ds@', anim: 'put_on_mask', move: 51, dur: 600 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'main',
        id: 1,
        name: 'mask',
        animation: { dict: 'mp_masks@standard_car@ds@', anim: 'put_on_mask', move: 51, dur: 800 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'prop',
        id: 1,
        name: 'glass',
        animation: { dict: 'clothingspecs', anim: 'take_off', move: 51, dur: 1400 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'main',
        id: 5,
        name: 'bag',
        animation: { dict: 'anim@heists@ornate_bank@grab_cash', anim: 'intro', move: 51, dur: 1600 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'main',
        id: 11,
        name: 'top',
        animation: { dict: 'missmic4', anim: 'michael_tux_fidget', move: 51, dur: 1500 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'main',
        id: 4,
        name: 'leg',
        animation: { dict: 're@construction', anim: 'out_of_breath', move: 51, dur: 1300 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'main',
        id: 6,
        name: 'shoe',
        animation: { dict: 'random@domestic', anim: 'pickup_low', move: 0, dur: 1200 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'main',
        id: 7,
        name: 'accessory',
        animation: { dict: 'clothingtie', anim: 'try_tie_positive_a', move: 51, dur: 2100 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'main',
        id: 9,
        name: 'armor',
        animation: { dict: 'clothingtie', anim: 'try_tie_negative_a', move: 51, dur: 1200 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'prop',
        id: 2,
        name: 'ear',
        animation: { dict: 'mp_cp_stolen_tut', anim: 'b_think', move: 51, dur: 900 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'prop',
        id: 6,
        name: 'watch',
        animation: { dict: 'nmt_3_rcm-10', anim: 'cs_nigel_dual-10', move: 51, dur: 1200 },
        isActive: false,
        isDisabled: false
    },
    {
        type: 'prop',
        id: 7,
        name: 'bracelet',
        animation: { dict: 'nmt_3_rcm-10', anim: 'cs_nigel_dual-10', move: 51, dur: 1200 },
        isActive: false,
        isDisabled: false
    }
];
