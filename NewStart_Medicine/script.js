"use strict";
exports('treatment', (type) => {
    if (exports.NewStart_Factions.info()?.key !== 'health' || !exports.NewStart_Employee.data(true).isActive)
        return;
    const pedID = PlayerPedId();
    const isBag = exports.NewStart_Inventory.info('currentItems').some((i) => i.id === 9);
    if (IsPedInAnyVehicle(pedID, true)) {
        return exports.NewStart_Notifications.showAttention('error', 'يجب ترك المركبة أولاً قبل إسعاف شخص!');
    }
    else if (state.stretcherObjID) {
        return exports.NewStart_Notifications.showAttention('error', 'يجب عليك وضع الناقلة أولاً قبل تنفيذ المعالجة!');
    }
    else if (type === 'revive' && !isBag) {
        return exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون معك حقيبة الصحة أولاً.');
    }
    else if (type === 'health' && (Date.now() - state.lastHealth) <= 30000) {
        return exports.NewStart_Notifications.showAttention('error', `يمكنك إعادة استخدامها مرة كل 30 ثانية!`);
    }
    const targetID = getNearbyPlayer(type === 'revive');
    if (!targetID) {
        return exports.NewStart_Notifications.showAttention('error', `أنت لست قريب بما يكفي من شخص ${type === 'health' ? 'لعلاجه' : 'في حالة حرجة'}!`);
    }
    if (type === 'revive') {
        if (!getNearbyPlayer(null, true)) {
            emitNet('NewStart_Medicine:handleGeneral-server', 'startResuscitation', targetID);
            exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true });
            SetCurrentPedWeapon(pedID, GetHashKey('weapon_unarmed'), true);
            TaskPlayAnim(pedID, 'mini@cpr@char_a@cpr_str', 'cpr_pumpchest', 3.0, 3.0, -1, 1, 0, false, false, false);
            state.reviveID = setTimeout(() => {
                exports.NewStart_Inventory.removeItem(JSON.stringify({ id: 9, count: 1 }));
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
                emitNet('NewStart_DeathCounter:revivePlayer-server', targetID);
                StopAnimTask(pedID, 'mini@cpr@char_a@cpr_str', 'cpr_pumpchest', 1.8);
                state.reviveID = null;
            }, 10000);
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'يوجد طبيب آخر يقوم بالمعالجة بالقرب منك!');
        }
    }
    else {
        state.lastHealth = Date.now();
        emitNet('NewStart_Medicine:handleGeneral-server', 'healthIncrease', targetID);
        exports.NewStart_Notifications.showAttention('success', 'لقد قمت بمعالجة شخص قريب منك وزيادة صحته.');
    }
});
exports('method', (type, data) => {
    if (type === 'info') {
        if (data?.key)
            state[data.key] = data.value;
        else
            return { isDead: state.isDead || state.waitDead, stretcher: !!state.stretcherObjID };
    }
    else if (type === 'stretcher') {
        const employee = exports.NewStart_Employee.data();
        if (exports.NewStart_Factions.info()?.key !== 'health' || !exports.NewStart_Employee.data().isActive) {
            return;
        }
        else if (IsPedInAnyVehicle(state.pedID, true)) {
            return exports.NewStart_Notifications.showAttention('error', 'يجب الاقتراب من حقيبة مركبة الوظيفة لإخراج ناقلة!');
        }
        const [x, y, z] = GetEntityCoords(state.pedID, true);
        let vehID = 0;
        for (let item of employee.spawnIDs) {
            if (vehID)
                break;
            for (let name of ['taillight_l', 'taillight_r', 'wheel_lr', 'wheel_rr']) {
                const index = GetEntityBoneIndexByName(item.id, name);
                const coords = GetWorldPositionOfEntityBone(item.id, index);
                const distanceBone = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);
                if (distanceBone <= 2.9) {
                    vehID = item.id;
                    SetVehicleDoorOpen(item.id, 5, false, false);
                    break;
                }
            }
        }
        if (vehID) {
            if (state.stretcherObjID) {
                deleteStretcher();
            }
            else {
                state.stretcherObjID = CreateObject(GetHashKey('prop_ld_binbag_01'), 0, 0, 0, true, true, false);
                SetCurrentPedWeapon(state.pedID, GetHashKey('weapon_unarmed'), true);
                AttachEntityToEntity(state.stretcherObjID, state.pedID, GetPedBoneIndex(state.pedID, 28422), 0.0, -0.6, -1.43, 180.0, 195.0, 90.0, false, false, true, false, 2, true);
            }
            setTimeout(() => SetVehicleDoorShut(vehID, 5, false), 1000);
        }
        else {
            exports.NewStart_Notifications.showAttention('error', state.stretcherObjID ? 'يجب الاقتراب من حقيبة المركبة لإرجاع الناقل.' : 'يجب الاقتراب من حقيبة مركبة الوظيفة بما يكفي.');
        }
    }
    else if (type === 'startDeath') {
        if (data) {
            (async function () {
                if (state.waitDead || state.isDead)
                    return;
                const time = Date.now();
                state.waitDead = true;
                emitNet('NewStart_Factions:handleVoice-server', 'mute', true);
                while (!IsPedStopped(state.pedID) && state.waitDead && !state.isDead && !(IsPedSwimming(state.pedID) || IsPedSwimmingUnderWater(state.pedID))) {
                    if ((time + 15000) < Date.now())
                        break;
                    await Delay(500);
                }
                if (state.waitDead && !state.isDead) {
                    const isWater = IsPedSwimming(state.pedID) || IsPedSwimmingUnderWater(state.pedID);
                    const coords = GetEntityCoords(state.pedID, true);
                    const heading = GetEntityHeading(state.pedID);
                    const vehID = GetVehiclePedIsIn(state.pedID, false);
                    (async function () {
                        DoScreenFadeOut(1000);
                        await Delay(1000);
                        SetEntityCoordsNoOffset(state.pedID, coords[0], coords[1], coords[2], false, false, true);
                        NetworkResurrectLocalPlayer(coords[0], coords[1], coords[2], heading || 0, true, false);
                        if (state.waitDead) {
                            if (vehID) {
                                const [x, y, z] = GetEntityCoords(vehID, true);
                                SetEntityCoords(state.pedID, x - 2, y + 2, z, false, false, false, false);
                                emitNet('NewStart_Medicine:handleGeneral-server', 'updateCoords');
                            }
                            else if (isWater && state.isDead) {
                                const [, closest, heading] = GetNthClosestVehicleNodeWithHeading(coords[0], coords[1], coords[2], 8, 0, 0, 0);
                                const [, [x, y, z]] = GetRoadBoundaryUsingHeading(closest[0], closest[1], closest[2], heading);
                                SetEntityCoords(state.pedID, x, y, z, false, false, false, false);
                                SetEntityHeading(state.pedID, heading);
                                emitNet('NewStart_Medicine:handleGeneral-server', 'updateCoords');
                            }
                            state.waitDead = false;
                        }
                        DoScreenFadeIn(1000);
                    })();
                    state.isDead = true;
                    exports.NewStart_Radio.setActive(false);
                }
            })();
        }
        else {
            state.isDead = false;
            state.isResuscitation = false;
            SetEntityInvincible(state.pedID, false);
            StopAnimTask(state.pedID, 'random@dealgonewrong', 'idle_a', 2);
            emitNet('NewStart_Factions:handleVoice-server', 'mute', false);
            exports.NewStart_Radio.setActive(true);
        }
    }
    else if (type === 'report') {
        const targetID = getNearbyPlayer(true);
        if (targetID) {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', level: 'low', status: true });
            SetCurrentPedWeapon(state.pedID, GetHashKey('weapon_unarmed'), true);
            TaskPlayAnim(state.pedID, 'amb@medic@standing@tendtodead@idle_a', 'idle_c', 2, 2, -1, 1, 0.0, false, false, false);
            setTimeout(() => {
                emitNet('NewStart_Medicine:handleGeneral-server', 'deathReason', targetID);
                ClearPedTasks(state.pedID);
                exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
            }, 10000);
        }
        else {
            exports.NewStart_Notifications.showAttention('error', 'أنت لست قريب بما يكفي من شخص في حالة حرجة!');
        }
    }
    else if (type === 'getPlayerDead') {
        return getNearbyPlayer(true);
    }
    else if (type === 'closeUI') {
        if (state.stretcherObjID) {
            deleteStretcher();
        }
        if (state.reviveID) {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
            clearTimeout(state.reviveID);
            state.reviveID = null;
        }
        if (data) {
            for (let id of state.blips)
                RemoveBlip(id);
            state.blips = [];
        }
    }
});
RequestAnimDict('mini@cpr@char_a@cpr_str');
RequestModel(GetHashKey('prop_ld_binbag_01'));
RequestAnimDict('amb@medic@standing@tendtodead@idle_a');
RequestAnimDict('anim@heists@box_carry@');
RequestAnimDict('random@dealgonewrong');
RequestAnimDict('dead');
setTick(() => {
    state.pedID = PlayerPedId();
    if (state.isDead) {
        HideHudComponentThisFrame(19);
        if (!state.isResuscitation && !IsEntityPlayingAnim(state.pedID, 'random@dealgonewrong', 'idle_a', 1) && !exports.NewStart_Police.method('playerDrag', true)) {
            ClearPedTasks(state.pedID);
            TaskPlayAnim(state.pedID, 'random@dealgonewrong', 'idle_a', 8.0, -8.0, -1, 1, 0, false, false, false);
        }
    }
    if (state.isDead || state.waitDead) {
        DisableControlAction(0, 249, true);
        SetEntityInvincible(state.pedID, true);
    }
    if (state.stretcherObjID) {
        const coords = GetEntityCoords(state.stretcherObjID, true);
        draw3Dtext({ x: coords[0], y: coords[1], z: coords[2] });
        if (IsControlJustPressed(0, 246)) {
            if (!state.isAttachStretcher) {
                const targetID = getNearbyPlayer(true);
                if (targetID) {
                    emitNet('NewStart_Medicine:handleGeneral-server', 'attachStretcher', targetID);
                    state.isAttachStretcher = true;
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'أنت لست قريب بما يكفي من شخص مصاب!');
                }
            }
            else {
                deleteStretcher();
            }
        }
        if (!IsEntityPlayingAnim(state.pedID, 'anim@heists@box_carry@', 'idle', 1)) {
            TaskPlayAnim(state.pedID, 'anim@heists@box_carry@', 'idle', 8.0, 8.0, -1, 50, 0, false, false, false);
        }
        DisableControlAction(0, 38, true);
        DisableControlAction(0, 73, true);
        DisableControlAction(0, 289, true);
        DisableControlAction(0, 23, true);
        DisableControlAction(0, 37, true);
        DisablePlayerFiring(PlayerId(), true);
    }
});
const tools = { isLimited: false, isLimitedSimple: false, timeoutID: 0, isBusted: false, isBlood: false };
RequestAnimSet('move_injured_generic');
setTick(() => {
    if (!tools.isBusted && IsEntityPlayingAnim(state.pedID, 'random@arrests@busted', 'idle_a', 1)) {
        tools.isBusted = true;
        exports.NewStart_Medicine.limited('set', false);
    }
    else if (tools.isBusted && !IsEntityPlayingAnim(state.pedID, 'random@arrests@busted', 'idle_a', 1) &&
        !exports.NewStart_Medicine.method('info').isDead && !IsEntityDead(state.pedID)) {
        tools.isBusted = false;
        exports.NewStart_Medicine.limited('set', true);
        exports.NewStart_MainMenu.closeUI(true);
    }
    if (!tools.isBlood && !IsEntityDead(state.pedID) && (GetEntityHealth(state.pedID) - 100) <= 20) {
        SendNUIMessage(JSON.stringify({ type: 'bloodEffect', value: true }));
        tools.isBlood = true;
    }
    else if (tools.isBlood && !tools.isLimited && (GetEntityHealth(state.pedID) - 100) > 20) {
        SendNUIMessage(JSON.stringify({ type: 'bloodEffect', value: false }));
        tools.isBlood = false;
    }
    if (tools.isLimited) {
        DisableControlAction(0, 38, true);
        DisableControlAction(0, 37, true);
        DisableControlAction(0, 25, true);
        DisableControlAction(0, 140, true);
        DisableControlAction(0, 21, true);
        DisableControlAction(0, 23, true);
        DisableControlAction(0, 22, true);
        DisablePlayerFiring(PlayerId(), true);
    }
});
function resetLimited() {
    clearTimeout(tools.timeoutID);
    tools.isLimited = false;
    ResetPedMovementClipset(state.pedID, 1);
    exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
    if (!tools.isBlood)
        SendNUIMessage(JSON.stringify({ type: 'bloodEffect', value: false }));
}
exports('limited', (type, data, more, more2, more3) => {
    if (type === 'get') {
        return tools.isLimited;
    }
    else if (type === 'set') {
        if (tools.isLimited) {
            resetLimited();
        }
        if (data) {
            exports.NewStart_Tools.sendToNUI({ type: 'progress', custom: more2 || '45s', status: true, text: 'جميع قدراتك محدودة', canMove: true, isRed: true });
            if (more) {
                SetPedMovementClipset(state.pedID, 'move_injured_generic', 1);
                SendNUIMessage(JSON.stringify({ type: 'bloodEffect', value: true }));
            }
            SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
            tools.isLimited = true;
            tools.timeoutID = setTimeout(resetLimited, more3 || 44000);
        }
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet('NewStart_Medicine:handleGeneral-client', (type, data) => {
    if (type === 'deadBlipsBuild') {
        if (exports.NewStart_Factions.info()?.key !== 'health' || !exports.NewStart_Employee.data(true).isActive)
            return;
        for (let id of state.blips)
            RemoveBlip(id);
        state.blips = [];
        for (let player of data) {
            const blip = AddBlipForCoord(player.coords[0], player.coords[1], player.coords[2]);
            SetBlipSprite(blip, 280);
            BeginTextCommandSetBlipName("STRING");
            AddTextComponentString('<font face="A9eelsh">ﺔﺟﺮﺣ ﺔﻟﺎﺣ</font>');
            EndTextCommandSetBlipName(blip);
            SetBlipColour(blip, 1);
            SetBlipScale(blip, 1.2);
            state.blips.push(blip);
        }
    }
    else if (type === 'startResuscitation') {
        TaskPlayAnim(state.pedID, 'dead', 'dead_a', 8.0, 8.0, -1, 1, 0, false, false, false);
        state.isResuscitation = true;
    }
    else if (type === 'attachStretcher') {
        const [x, y, z] = GetEntityCoords(state.pedID, true);
        const objectID = GetClosestObjectOfType(x, y, z, 3, GetHashKey('prop_ld_binbag_01'), true, false, false);
        if (objectID)
            AttachEntityToEntity(state.pedID, objectID, 0, 0, 0.0, 2.1, 0.0, 0.0, 270.0, false, false, false, false, 2, true);
    }
    else if (type === 'deathReason') {
        exports.NewStart_Notifications.sendAlert(`سبب الإصابة ${data}.`);
    }
    else if (type === 'healthIncrease') {
        SetEntityHealth(state.pedID, 200);
        ClearPedBloodDamage(state.pedID);
        exports.NewStart_HudSystem.update({ health: 200 });
    }
    else if (type === 'doctorReward') {
        const faction = exports.NewStart_Factions.info();
        const money = (((faction.ranks.length - 1) - faction.rankID) * 500) + 4000;
        emitNet('NewStart:giveMoney', { name: 'مكافأة الوظيفة', amount: money });
        exports.NewStart_MainMenu.levelUp((((faction.ranks.length - 1) - faction.rankID) * 5.91) + 35);
        exports.NewStart_Notifications.showAttention('success', `لقد تم تحويل مبلغ $${money.toLocaleString()} لحسابك البنكي!`);
    }
});
function draw3Dtext(info) {
    SetTextScale(0.3, 0.3);
    SetTextProportional(true);
    SetTextColour(207, 83, 74, 255);
    SetTextOutline();
    SetTextEntry("STRING");
    SetTextCentre(true);
    AddTextComponentString(`<font face="A9eelsh">${state.isAttachStretcher ? '[غ] ﻭﺃ [Y] ﻂﻐﺿﺍ ﺔﻠﻗﺎﻨﻟﺍ ﺔﻟﺍﺯﻹ' : '[غ] ﻭﺃ [Y] ﻂﻐﺿﺍ ﺏﺎﺼﻣ ﻊﺿﻮﻟ'}</font>`);
    SetDrawOrigin(info.x, info.y, info.z + 1.4, 0);
    DrawText(0.0, 0.0);
    ClearDrawOrigin();
}
function getNearbyPlayer(isDead, isDoctor) {
    let targetID = 0;
    const coords = GetEntityCoords(state.pedID, true);
    for (let id of GetActivePlayers().filter((id) => id !== PlayerId())) {
        const targetPed = GetPlayerPed(id);
        const [x, y, z] = GetEntityCoords(targetPed, true);
        const distance = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);
        const entityDead = !!IsEntityPlayingAnim(targetPed, 'random@dealgonewrong', 'idle_a', 1);
        const entityDoctor = !!IsEntityPlayingAnim(targetPed, 'amb@medic@standing@tendtodead@idle_a', 'idle_c', 1);
        if (distance < 2 && (entityDead === isDead || entityDoctor === isDoctor)) {
            targetID = GetPlayerServerId(id);
            break;
        }
    }
    return targetID;
}
function deleteStretcher() {
    DeleteObject(state.stretcherObjID);
    state.stretcherObjID = 0;
    state.isAttachStretcher = false;
    ClearPedTasks(state.pedID);
    setTimeout(() => ClearPedTasks(state.pedID), 250);
}
const state = {
    waitDead: false,
    isDead: false,
    pedID: 0,
    stretcherObjID: 0,
    isAttachStretcher: false,
    isResuscitation: false,
    blips: [],
    lastHealth: 0,
    reviveID: null
};
