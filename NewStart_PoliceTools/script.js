"use strict";
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
setInterval(() => {
    state.faction = exports.NewStart_Factions.info();
    state.isActive = state.jobKeys.includes(state.faction?.key) && exports.NewStart_Employee.data().isActive;
}, 5000);
setTick(async () => {
    if (!state.faction?.key || state.faction?.isVacation)
        return;
    let current = null;
    for (let item of state.teleport.items) {
        const distance = GetDistanceBetweenCoords(state.coord[0], state.coord[1], state.coord[2], item.x, item.y, item.z, true);
        if (distance < 25) {
            DrawMarker(1, item.x, item.y, item.z, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 0.25, 0.25, 0.15, 45, 101, 167, 100, false, false, 2, false, empty, empty, false);
            if (distance < 1.2) {
                current = state.teleport.items.find(i => i.id === item.id && i.type !== item.type);
                break;
            }
        }
    }
    if (current &&
        !IsEntityDead(state.pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            SendNUIMessage(JSON.stringify({ type: 'entrance', isClose: true }));
            DoScreenFadeOut(1000);
            await Delay(1000);
            SetEntityCoords(state.pedID, current.x, current.y, current.z, true, false, false, false);
            SetEntityHeading(state.pedID, current.h);
            DoScreenFadeIn(1000);
            SendNUIMessage(JSON.stringify({ type: 'entrance', isNormal: true }));
        }
        else if (!state.teleport.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entrance', isNormal: true }));
        }
        state.teleport.runClose = true;
    }
    else if (state.teleport.runClose) {
        SendNUIMessage(JSON.stringify({ type: 'entrance', isClose: true }));
        state.teleport.runClose = false;
    }
});
exports('method', (type, data) => {
    if (type === 'info') {
        return { isPolmav: polmav.toggle };
    }
    else if (type === 'radarToggle') {
        radarToggle(data);
    }
    else if (type === 'getPlayersFactions') {
        let players = [];
        for (const key in FACTIONS_DATA.items)
            players = players.concat(FACTIONS_DATA.items[key].refPlayers);
        return players.filter((i) => i.status === 'in' || i.status === 'out');
    }
});
const state = {
    isActive: false,
    faction: null,
    jobKeys: ['police', 'facilities'],
    pedID: 0,
    vehID: 0,
    coord: [],
    teleport: {
        runClose: false,
        items: [
            { id: 1, type: 'from', x: -450.1278, y: 6010.4306, z: 31.2791, h: 229.6062 },
            { id: 1, type: 'to', x: -449.2483, y: 6009.1045, z: 35.9802, h: 229.6062 }
        ]
    }
};
const empty = null;
const enquiry = { isOpen: false, runClose: false, price: 5000, coords: [{ x: -286.8659, y: 6147.7451, z: 32.2623, h: 314.6456 }] };
(async function () {
    for (let item of enquiry.coords) {
        const blipID = AddBlipForCoord(item.x, item.y, item.z);
        SetBlipSprite(blipID, 461);
        SetBlipAsShortRange(blipID, true);
        BeginTextCommandSetBlipName("STRING");
        AddTextComponentString(`<font face="A9eelsh">ﺭﻭﺮﻤﻟﺍ ﺔﻃﺮﺷ</font>`);
        EndTextCommandSetBlipName(blipID);
    }
})();
setTick(() => {
    let currentHeading = 0;
    for (let item of enquiry.coords) {
        const distance = GetDistanceBetweenCoords(item.x, item.y, item.z, state.coord[0], state.coord[1], state.coord[2], true);
        if (distance < 15) {
            DrawMarker(1, item.x, item.y, item.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.25, 22, 24, 29, 200, false, false, 2, false, empty, empty, false);
            if (distance < 0.65) {
                currentHeading = item.h;
                break;
            }
        }
    }
    if (currentHeading &&
        !IsEntityDead(state.pedID) &&
        !IsPauseMenuActive() &&
        !IsPedInAnyVehicle(state.pedID, false)) {
        if (IsControlJustPressed(0, 38)) {
            const player = exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId()));
            TaskAchieveHeading(state.pedID, currentHeading, 0);
            SetNuiFocus(true, true);
            SendNUIMessage(JSON.stringify({
                type: 'openUIEnquiry',
                reservation: exports.NewStart_Police.reports('getReservation'),
                vehicles: exports.NewStart_VehicleSystem.method('GetMyVehicles').map((i) => ({ ...i, price: enquiry.price })),
                info: { customID: player.customID, name: player.name }
            }));
            SendNUIMessage(JSON.stringify({ type: 'entrance', isClose: true }));
            exports.NewStart_Initialize.method('blankScreen', true);
            enquiry.isOpen = true;
        }
        else if (!enquiry.isOpen && !enquiry.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entrance', isNormal: true }));
        }
        enquiry.runClose = true;
    }
    else if (enquiry.runClose) {
        if (enquiry.isOpen) {
            exports.NewStart_Initialize.method('blankScreen', true);
            SendNUIMessage(JSON.stringify({ type: 'closeUIEnquiry' }));
        }
        SendNUIMessage(JSON.stringify({ type: 'entrance', isClose: true }));
        enquiry.isOpen = false;
        enquiry.runClose = false;
        SetNuiFocus(false, false);
        ClearPedTasks(state.pedID);
    }
});
RegisterNuiCallbackType('NUI:enquiry');
on('__cfx_nui:NUI:enquiry', (data, cb) => {
    switch (data.type) {
        case 'reservation':
            exports.NewStart_Police.reports('UnReservation', data.plate);
        case 'vehicles':
            const vehicle = exports.NewStart_VehicleSystem.method('GetMyVehicles').find((i) => i.plate === data.plate);
            if (vehicle)
                emitNet('NewStart_VehicleSystem:handleGlobal-server', 'enquiry', JSON.stringify(vehicle));
        default:
            exports.NewStart_Initialize.method('blankScreen', false);
            enquiry.isOpen = false;
            enquiry.runClose = false;
            SetNuiFocus(false, false);
            ClearPedTasks(state.pedID);
    }
    cb('OK!');
});
const FACTIONS_DATA = {
    colors: { facilities: 21, health: 6 },
    items: {},
    blips: []
};
function handlePlayersMap() {
    for (const item of FACTIONS_DATA.blips)
        RemoveBlip(item.id);
    FACTIONS_DATA.blips = [];
    for (const key in FACTIONS_DATA.items) {
        if ((!state.faction?.key || state.faction?.isVacation) && ['police', 'facilities'].includes(key))
            continue;
        for (const item of FACTIONS_DATA.items[key].refPlayers) {
            if (!item.serverID || !item.coords || item.status !== 'in')
                continue;
            const clientID = GetPlayerFromServerId(item.serverID);
            const isExists = GetPlayerServerId(clientID);
            const targetID = GetPlayerPed(clientID);
            if (isExists && (state.pedID === targetID || !IsEntityVisible(targetID)))
                continue;
            let blipID = 0;
            if (isExists)
                blipID = AddBlipForEntity(targetID);
            else
                blipID = AddBlipForCoord(item.coords[0], item.coords[1], item.coords[2]);
            ShowHeadingIndicatorOnBlip(blipID, true);
            SetBlipAsFriendly(blipID, true);
            SetBlipAsShortRange(blipID, true);
            if (FACTIONS_DATA.colors[key])
                SetBlipColour(blipID, FACTIONS_DATA.colors[key]);
            BeginTextCommandSetBlipName("STRING");
            AddTextComponentString(`<font face="A9eelsh">${item.code}</font>`);
            EndTextCommandSetBlipName(blipID);
            SetBlipCategory(blipID, 7);
            FACTIONS_DATA.blips.push({ id: blipID, license: item.user.license });
        }
    }
}
const liveries = {
    runClose: false,
    coords: [
        { jobKey: 'facilities', x: -3007.8410, y: 2707.6652, z: 9.6415 },
        { jobKey: 'police', x: -482.4811, y: 6024.5966, z: 31.3404 },
        { jobKey: 'police', x: 1876.7978, y: 3693.3056, z: 33.3891 }
    ]
};
setTick(() => {
    if (state.isActive) {
        let isCurrent = false;
        for (let item of liveries.coords) {
            const distance = GetDistanceBetweenCoords(state.coord[0], state.coord[1], state.coord[2], item.x, item.y, item.z, true);
            if (distance < 35) {
                DrawMarker(42, item.x, item.y, item.z, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.25, 1.25, 1.25, 45, 101, 167, 100, false, true, 2, false, empty, empty, false);
                if (distance < 2.5)
                    isCurrent = true;
            }
        }
        if (isCurrent &&
            !IsEntityDead(state.pedID) &&
            !IsPauseMenuActive()) {
            if (IsControlJustPressed(0, 38) && !state.vehID) {
                exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون معك مركبة الوظيفة لتغيير الملصق!');
            }
            else if (IsControlJustPressed(0, 246) && state.vehID) {
                const vehicle = exports.NewStart_Employee.method('getVehInfo', GetEntityArchetypeName(state.vehID), true);
                if (vehicle && vehicle.liveries) {
                    SendNuiMessage(JSON.stringify({ type: 'setStateLiveries', info: { code: state.faction.code, items: vehicle.liveries } }));
                    SendNUIMessage(JSON.stringify({ type: 'entrance', isClose: true }));
                    SetNuiFocus(true, true);
                }
                else {
                    exports.NewStart_Notifications.showAttention('error', 'لا يوجد أي ملصقات أخري لهذه المركبة!');
                }
            }
            else if (!liveries.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entrance', isNormal: !state.vehID }));
            }
            liveries.runClose = true;
        }
        else if (liveries.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entrance', isClose: true }));
            SendNuiMessage(JSON.stringify({ type: 'setStateLiveries', info: { items: [] } }));
            liveries.runClose = false;
            SetNuiFocus(false, false);
        }
    }
});
RegisterNuiCallbackType('NUI:liveries');
on('__cfx_nui:NUI:liveries', (data, cb) => {
    switch (data.type) {
        case 'setLivery':
            SetVehicleLivery(state.vehID, data.id);
            if (data.name === 'empty') {
                SetVehicleCustomPrimaryColour(state.vehID, 0, 0, 0);
                SetVehicleCustomSecondaryColour(state.vehID, 0, 0, 0);
            }
            SetNuiFocus(false, false);
            liveries.runClose = false;
            break;
        default:
            SetNuiFocus(false, false);
            liveries.runClose = false;
    }
    cb('OK!');
});
const methodState = { isKtackle: false };
onNet('NewStart_PoliceTools:handleGeneral-client', (type, data) => {
    if (type === 'setPolmavData') {
        polmav.data = { ...polmav.data, ...data };
    }
    else if (type === 'ktackle') {
        if (!methodState.isKtackle && !exports.NewStart_Police.method('info').isJailed) {
            methodState.isKtackle = true;
            SetNuiFocus(true, false);
            AttachEntityToEntity(state.pedID, GetPlayerPed(GetPlayerFromServerId(data)), 11816, 0.25, 0.5, 0.0, 0.5, 0.5, 180.0, false, false, false, false, 2, false);
            TaskPlayAnim(state.pedID, 'missmic2ig_11', 'mic_2_ig_11_intro_p_one', 8.0, 2.0, 5000, 0, 0, false, false, false);
            setTimeout(() => DetachEntity(state.pedID, true, false), 3000);
            setTimeout(() => {
                methodState.isKtackle = false;
                SetNuiFocus(false, false);
            }, 5000);
            exports.NewStart_DeathCounter.closeAll(true);
        }
    }
    else if (type === 'enquiry') {
        const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
        const info = { name: 'شرطة المرور', from: 'cash', price: enquiry.price };
        if (cash >= info.price) {
            StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
        }
        else {
            return exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك المال الكافي في الحقيبة للدفع!');
        }
        emitNet('NewStart:moneyDecrease', info);
        SetNewWaypoint(data[0], data[1]);
        exports.NewStart_Notifications.showAttention('success', 'تم إيجاد المركبة بنجاح وتم تحديد الموقع على الخريطة!');
    }
    else if (type === 'setFactionsData') {
        FACTIONS_DATA.items = JSON.parse(data);
        handlePlayersMap();
    }
});
const FOV_MAX = 80, FOV_MIN = 5, DISTANCE_MAX = 700;
const polmav = { toggle: false, camID: 0, scaleform: 0, tickID: 0, fov: (FOV_MAX + FOV_MIN) * 0.5, vision: 0, pointID: 0, timeoutID: 0, shooting: false };
setTick(() => {
    const isEheli = state.vehID && IsVehicleModel(state.vehID, 'eheli');
    if (state.isActive && !polmav.toggle && isEheli &&
        IsControlJustPressed(0, 38) &&
        (GetPedInVehicleSeat(state.vehID, -1) === state.pedID || GetPedInVehicleSeat(state.vehID, 0) === state.pedID) &&
        GetEntityHeightAboveGround(state.vehID) > 1.5) {
        exports.NewStart_VehicleSystem.method('setSeatBelt');
        PlaySoundFrontend(-1, 'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false);
        exports.NewStart_HudSystem.closeUI();
        exports.NewStart_Phone.noticesToggle(true);
        exports.NewStart_MainMenu.toggleAds(false);
        setTimeout(() => exports.NewStart_VehicleSystem.method('setHideUI', true), 0);
        startPolmavCam();
        SetVehicleSearchlight(state.vehID, false, false);
        polmav.toggle = true;
    }
    else if (polmav.toggle && (!state.vehID || IsEntityDead(state.pedID) || GetEntityHeightAboveGround(state.vehID) < 1.4 || IsControlJustPressed(0, 38))) {
        if (!exports.NewStart_Medicine.method('info').isDead && !IsEntityDead(state.pedID)) {
            exports.NewStart_Phone.noticesToggle(false);
            if (!exports.NewStart_MainMenu.isOpen()) {
                exports.NewStart_HudSystem.openHud();
                exports.NewStart_MainMenu.toggleAds(true);
            }
        }
        exports.NewStart_VehicleSystem.method('setHideUI', false);
        SetVehicleSearchlight(state.vehID, false, false);
        SendNuiMessage(JSON.stringify({ type: 'closeUIPolmav' }));
        clearTick(polmav.tickID);
        clearTimeout(polmav.timeoutID);
        ClearTimecycleModifier();
        RenderScriptCams(false, false, 0, false, false);
        SetScaleformMovieAsNoLongerNeeded(polmav.scaleform);
        DestroyCam(polmav.camID, false);
        SetNightvision(false);
        SetSeethrough(false);
        polmav.toggle = false;
        polmav.fov = (FOV_MAX + FOV_MIN) * 0.5;
        polmav.vision = 0;
        polmav.pointID = 0;
    }
    if (state.vehID &&
        IsControlJustPressed(0, 24) &&
        IsVehicleModel(state.vehID, GetHashKey('eheli')) &&
        (GetPedInVehicleSeat(state.vehID, -1) === state.pedID || GetPedInVehicleSeat(state.vehID, 1) === state.pedID) &&
        GetIsVehicleEngineRunning(state.vehID)) {
        SetVehicleSearchlight(state.vehID, !IsVehicleSearchlightOn(state.vehID), false);
        PlaySoundFrontend(-1, 'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false);
    }
    if (state.isActive && !polmav.shooting && isEheli && [GetPedInVehicleSeat(state.vehID, 1), GetPedInVehicleSeat(state.vehID, 2)].includes(state.pedID)) {
        SetPlayerCanDoDriveBy(PlayerId(), true);
        polmav.shooting = true;
    }
    else if (polmav.shooting && !isEheli) {
        SetPlayerCanDoDriveBy(PlayerId(), false);
        polmav.shooting = false;
    }
    if (isEheli && IsControlJustPressed(0, 73) && GetEntityHeightAboveGround(state.vehID) > 8 && [GetPedInVehicleSeat(state.vehID, 1), GetPedInVehicleSeat(state.vehID, 2)].includes(state.pedID)) {
        TaskRappelFromHeli(state.pedID, 1);
    }
});
async function startPolmavCam() {
    SetTimecycleModifier('heliGunCam');
    SetTimecycleModifierStrength(0.3);
    polmav.scaleform = RequestScaleformMovie("HELI_CAM");
    while (!HasScaleformMovieLoaded(polmav.scaleform))
        await Delay(0);
    polmav.camID = CreateCam("DEFAULT_SCRIPTED_FLY_CAMERA", true);
    AttachCamToEntity(polmav.camID, state.vehID, 0.0, 0.0, -1.5, true);
    SetCamRot(polmav.camID, 0.0, 0.0, 0, GetEntityHeading(state.vehID));
    SetCamFov(polmav.camID, polmav.fov);
    RenderScriptCams(true, false, 0, true, false);
    PushScaleformMovieFunction(polmav.scaleform, "SET_CAM_LOGO");
    PushScaleformMovieFunctionParameterInt(0);
    PopScaleformMovieFunctionVoid();
    SetVehicleRadioEnabled(state.vehID, false);
    polmav.tickID = setTick(() => {
        const zoomvalue = (1.0 / (FOV_MAX - FOV_MIN)) * (polmav.fov - FOV_MIN);
        const rightAxisX = GetDisabledControlNormal(0, 220);
        const rightAxisY = GetDisabledControlNormal(0, 221);
        const rotation = GetCamRot(polmav.camID, 2);
        if (rightAxisX !== 0 || rightAxisY !== 0) {
            const new_z = rotation[2] + rightAxisX * -1.0 * (4.0) * (zoomvalue + 0.1);
            const new_x = Math.max(Math.min(20.0, rotation[0] + rightAxisY * -1.0 * (4.0) * (zoomvalue + 0.1)), -89.5);
            SetCamRot(polmav.camID, new_x, 0.0, new_z, 2);
        }
        if (IsControlJustPressed(0, 241)) {
            polmav.fov = Math.max(polmav.fov - 3.0, FOV_MIN);
        }
        else if (IsControlJustPressed(0, 242)) {
            polmav.fov = Math.min(polmav.fov + 3.0, FOV_MAX);
        }
        const current_fov = GetCamFov(polmav.camID);
        if (Math.abs(polmav.fov - current_fov) < 0.1)
            polmav.fov = current_fov;
        SetCamFov(polmav.camID, current_fov + (polmav.fov - current_fov) * 0.05);
        if (IsControlJustPressed(0, 25)) {
            if (polmav.vision == 0) {
                SetNightvision(true);
                polmav.vision = 1;
            }
            else if (polmav.vision == 1) {
                SetNightvision(false);
                SetSeethrough(true);
                polmav.vision = 2;
            }
            else {
                SetSeethrough(false);
                polmav.vision = 0;
            }
        }
        const isTab = IsControlJustPressed(0, 37);
        let distance = 0;
        if (polmav.pointID) {
            const lock = GetEntityCoords(polmav.pointID, false);
            distance = GetDistanceBetweenCoords(state.coord[0], state.coord[1], state.coord[2], lock[0], lock[1], lock[2], false);
        }
        if (!polmav.pointID && isTab) {
            handleEntity();
        }
        else if (polmav.pointID && (isTab || distance > DISTANCE_MAX)) {
            clearTimeout(polmav.timeoutID);
            DestroyCam(polmav.camID, false);
            polmav.camID = CreateCam('DEFAULT_SCRIPTED_FLY_CAMERA', true);
            AttachCamToEntity(polmav.camID, state.vehID, 0.0, 0.0, -1.5, true);
            SetCamRot(polmav.camID, rotation[0], rotation[1], rotation[2], 2);
            SetCamFov(polmav.camID, polmav.fov);
            RenderScriptCams(true, false, 0, true, false);
            polmav.pointID = 0;
            SendNuiMessage(JSON.stringify({ type: 'setStatePolmav', info: { isLoading: false, info: null } }));
        }
        HideHudComponentThisFrame(19);
        DisableControlAction(state.pedID, 200, true);
    });
    SendNuiMessage(JSON.stringify({ type: 'setStatePolmav', info: { toggleUI: true } }));
}
function handleEntity() {
    const entityID = exports.NewStart_Other.getEntityInView(polmav.camID, state.vehID);
    const isVeh = IsEntityAVehicle(entityID);
    if (entityID && (isVeh || IsEntityAPed(entityID))) {
        let id, isOtherData = false;
        polmav.data = {};
        if (isVeh) {
            const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', entityID);
            if (plate) {
                polmav.data = { type: 'vehicle', id: plate, isWanted: exports.NewStart_Police.method('vehWanted').some((i) => i.plate === plate) };
            }
            else {
                id = GetVehicleNumberPlateText(entityID);
                isOtherData = true;
            }
        }
        else {
            const targetID = NetworkGetPlayerIndexFromPed(entityID);
            if (NetworkIsPlayerActive(targetID)) {
                emitNet('NewStart_Police:handleOther-server', 'getWanted', GetPlayerServerId(targetID));
            }
        }
        PointCamAtEntity(polmav.camID, entityID, 0.0, 0.0, 0.0, true);
        polmav.pointID = entityID;
        PlaySoundFrontend(-1, 'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false);
        SendNuiMessage(JSON.stringify({ type: 'scanPolmav' }));
        exports['screenshot-basic'].requestScreenshot({ encoding: 'jpg', quality: 0.8 }, (base64) => { if (polmav.data)
            polmav.data.image = base64; });
        polmav.timeoutID = setTimeout(() => {
            PlaySoundFrontend(-1, 'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false);
            if (isOtherData) {
                SendNuiMessage(JSON.stringify({
                    type: 'setStatePolmav', info: { isLoading: false, info: { type: isVeh ? 'vehicle' : 'player', id, isWanted: false, image: polmav.data?.image } }
                }));
            }
            else {
                SendNuiMessage(JSON.stringify({
                    type: 'setStatePolmav',
                    info: { isLoading: false, info: polmav.data?.id ? polmav.data : { isNoData: true, image: polmav.data?.image } }
                }));
            }
        }, 5000);
    }
    else {
        exports.NewStart_Notifications.showAttention('error', 'لقد فشل إجراء المسح يرجي التحديد بشكل صحيح والأقتراب أكثر!');
    }
}
const radar = { intervalID: 0, isPin: false, isHide: false, outVeh: false, directione: {}, maxSpeed: 100, lastSound: { plate: '', time: 0 } };
setTick(() => {
    state.pedID = PlayerPedId();
    state.vehID = GetVehiclePedIsIn(state.pedID, false);
    state.coord = GetEntityCoords(state.pedID, false);
    if (radar.intervalID) {
        if (!state.vehID && !radar.outVeh) {
            SendNuiMessage(JSON.stringify({ type: 'hide', value: true }));
            radar.outVeh = true;
        }
        else if (state.vehID && radar.outVeh && exports.NewStart_Employee.method('getVehInfo', GetEntityArchetypeName(state.vehID), true)) {
            SendNuiMessage(JSON.stringify({ type: 'hide', value: false }));
            radar.outVeh = false;
        }
        if (!radar.outVeh) {
            if (!radar.isHide && IsPauseMenuActive()) {
                SendNuiMessage(JSON.stringify({ type: 'hide', value: true }));
                radar.isHide = true;
            }
            else if (radar.isHide && !IsPauseMenuActive()) {
                SendNuiMessage(JSON.stringify({ type: 'hide', value: false }));
                radar.isHide = false;
            }
        }
        if (IsControlJustPressed(0, 36)) {
            SendNuiMessage(JSON.stringify({ type: 'isFirstClick' }));
            SetNuiFocus(true, true);
        }
        else if (IsControlJustPressed(0, 137)) {
            radar.isPin = !radar.isPin;
            SendNuiMessage(JSON.stringify({ type: 'setState', info: { isPin: radar.isPin } }));
        }
    }
});
function radarToggle(value) {
    if (value && !radar.intervalID) {
        runRadar(true, true);
        radar.intervalID = setInterval(runRadar, 1000);
    }
    else {
        clearInterval(radar.intervalID);
        SetNuiFocus(false, false);
        runRadar(true, false);
        radar.intervalID = 0;
        radar.isPin = false;
    }
}
function runRadar(isReset, toggleUI) {
    if (!isReset) {
        if (radar.isHide || radar.outVeh || radar.isPin)
            return;
        const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh', 50);
        if (vehID && HasEntityClearLosToEntity(state.pedID, vehID, 17)) {
            const plate = GetVehicleNumberPlateText(vehID);
            const keyRef = (GetEntityHeading(state.pedID) - GetEntityHeading(vehID)) < 90 ? 'front' : 'back';
            const another = keyRef === 'front' ? 'back' : 'front';
            radar.directione[keyRef] = {
                id: GetVehicleNumberPlateTextIndex(vehID),
                title: plate,
                speed: Math.round(GetEntitySpeed(vehID) * 3.6),
                isWanted: !!exports.NewStart_Police.method('vehWanted').some((i) => i.plate == plate)
            };
            if (radar.directione[another]?.title === radar.directione[keyRef]?.title) {
                radar.directione[another] = { id: 0, title: '', speed: '', isWanted: false };
            }
            if ((radar.directione[keyRef]?.speed > radar.maxSpeed || radar.directione[keyRef]?.isWanted) &&
                (plate !== radar.lastSound.plate && (Date.now() - radar.lastSound.time) > 15000)) {
                SendNUIMessage(JSON.stringify({ type: 'sounds', action: 'alert' }));
                radar.lastSound.plate = plate;
                radar.lastSound.time = Date.now();
            }
            SendNuiMessage(JSON.stringify({
                type: 'setState',
                info: {
                    isRight: exports.NewStart_Phone.method('getData', 'isNotifications'),
                    isPin: radar.isPin, ...radar.directione
                }
            }));
        }
        else {
            SendNuiMessage(JSON.stringify({ type: 'setState', info: { isRight: exports.NewStart_Phone.method('getData', 'isNotifications') } }));
        }
    }
    else {
        SendNuiMessage(JSON.stringify({
            type: 'setState',
            info: {
                toggleUI,
                isRight: exports.NewStart_Phone.method('getData', 'isNotifications'),
                isPin: false,
                code: exports.NewStart_Factions.info()?.code,
                front: { id: 0, title: '', speed: '', isWanted: false },
                back: { id: 0, title: '', speed: '', isWanted: false }
            }
        }));
    }
}
RegisterNuiCallbackType('NUI:radar');
on('__cfx_nui:NUI:radar', (data, cb) => {
    switch (data.type) {
        case 'maxSpeed':
            radar.maxSpeed = data.value;
            break;
        case 'pin':
            radar.isPin = !radar.isPin;
            SendNuiMessage(JSON.stringify({ type: 'setState', info: { isPin: radar.isPin } }));
            break;
        default:
            SetNuiFocus(false, false);
    }
    cb('OK!');
});
setTick(() => {
    if (state.vehID) {
        if (IsControlJustPressed(0, 44)) {
            if (!exports.NewStart_Employee.method('vehicles').some((i) => i.hash === GetEntityArchetypeName(state.vehID)))
                return;
            SetVehicleSiren(state.vehID, !IsVehicleSirenOn(state.vehID));
            SetVehicleHasMutedSirens(state.vehID, true);
            PlaySoundFrontend(-1, 'Select_Placed_Prop', 'DLC_Dmod_Prop_Editor_Sounds', false);
        }
        else if (IsControlJustPressed(0, 19)) {
            if (!IsVehicleSirenOn(state.vehID) || !exports.NewStart_Employee.method('vehicles').some((i) => i.hash === GetEntityArchetypeName(state.vehID)))
                return;
            SetVehicleHasMutedSirens(state.vehID, IsVehicleSirenAudioOn(state.vehID));
            PlaySoundFrontend(-1, 'Select_Placed_Prop', 'DLC_Dmod_Prop_Editor_Sounds', false);
        }
        else if (IsControlJustPressed(0, 86)) {
            if (!exports.NewStart_Employee.method('vehicles').some((i) => i.hash === GetEntityArchetypeName(state.vehID)))
                return;
            if (!IsVehicleSirenOn(state.vehID))
                SetVehicleHasMutedSirens(state.vehID, false);
            PlaySoundFrontend(-1, 'SELECT', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false);
        }
    }
});
RequestAnimDict('random@mugging3');
RequestAnimDict('missmic2ig_11');
RequestAnimDict('rcmnigel1c');
RequestAnimDict('anim@mp_player_intincarsalutestd@ds@');
setTick(async () => {
    if (state.isActive && !state.vehID) {
        if (!methodState.isKtackle && IsControlPressed(0, 21) && IsControlJustPressed(0, 47) && !exports.NewStart_Police.method('info').isInjuredDrag) {
            methodState.isKtackle = true;
            const target = exports.NewStart_Initialize.method('getClosestPlayer', { maxDistance: 2, noFactions: true, noDead: true, noCuffs: true, noVehicle: true });
            if (target && HasEntityClearLosToEntity(state.pedID, target.pedID, 17)) {
                emitNet('NewStart_PoliceTools:handleGeneral-server', 'ktackle', target.serverID);
                TaskPlayAnim(state.pedID, 'missmic2ig_11', 'mic_2_ig_11_intro_goon', 8.0, 2.0, 3000, 0, 0, false, false, false);
                setTimeout(() => { methodState.isKtackle = false; }, 3000);
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون قريب من مواطن طبيعي للامساك به!');
                methodState.isKtackle = false;
            }
        }
        else if (IsControlPressed(0, 19) && IsControlJustPressed(0, 47)) {
            if (IsEntityPlayingAnim(state.pedID, 'anim@mp_player_intincarsalutestd@ds@', 'idle_a', 1)) {
                ClearPedTasks(state.pedID);
            }
            else if (!IsPlayerFreeAiming(PlayerId())) {
                TaskPlayAnim(state.pedID, 'anim@mp_player_intincarsalutestd@ds@', 'idle_a', 3.0, 3.0, -1, 49, 0, false, false, false);
                SetCurrentPedWeapon(state.pedID, GetHashKey('WEAPON_UNARMED'), true);
            }
        }
    }
    if (!state.vehID) {
        if (IsControlJustPressed(0, 20) && !exports.NewStart_Tools.method('getInfo').isCrawling && !exports.NewStart_Police.method('info').isInjuredDrag) {
            if (IsEntityPlayingAnim(state.pedID, 'random@mugging3', 'handsup_standing_base', 1)) {
                ClearPedTasks(state.pedID);
            }
            else if (!IsPlayerFreeAiming(PlayerId())) {
                TaskPlayAnim(state.pedID, 'random@mugging3', 'handsup_standing_base', 3.0, 3.0, -1, 49, 0, false, false, false);
            }
        }
        else if (IsControlPressed(0, 19) && IsControlJustPressed(0, 38) && !IsPlayerFreeAiming(PlayerId()) &&
            !exports.NewStart_Medicine.method('info').isDead && !exports.NewStart_Police.method('info').isInjuredDrag) {
            TaskPlayAnim(state.pedID, 'rcmnigel1c', 'hailing_whistle_waive_a', 1.5, 1.5, -1, 48, 0, false, false, false);
        }
        else if (state.isActive && IsControlJustPressed(0, 38)) {
            await Delay(500);
            if (IsControlPressed(0, 38))
                exports.NewStart_Inspection.method('handcuffToggle');
        }
    }
});
