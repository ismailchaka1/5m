"use strict";
let timeTickID = null;
RegisterCommand('kill', () => {
    SetEntityHealth(GetPlayerPed(-1), 0);
}, true);
RegisterCommand('pos', () => {
    const pedID = GetPlayerPed(-1);
    const [x, y, z] = GetEntityCoords(pedID, true);
    console.log(JSON.stringify({ x, y, z, h: GetEntityHeading(pedID) }));
}, false);
RegisterCommand('item', (_, arr) => {
    if (arr.length && arr[0] <= 121 && arr[0] > 1) {
        const count = parseInt(arr[1]) || 1;
        exports.NewStart_Inventory.addItem(JSON.stringify({ id: parseInt(arr[0]) || 2, count: count < 1 ? 1 : count }));
    }
}, true);
RegisterCommand('setTime', (_, arr) => {
    if (!exports.NewStart_Plain.method('environmentTest'))
        return;
    clearTick(timeTickID);
    const nums = arr[0].split(',');
    timeTickID = setTick((_) => {
        SetClockTime(parseInt(nums[0]), parseInt(nums[1]), 0);
        NetworkOverrideClockTime(parseInt(nums[0]), parseInt(nums[1]), 0);
    });
}, true);
RequestAnimDict('facials@gen_male@variations@normal');
RequestAnimDict('mp_facial');
onNet('NewStart_Initialize:handleGeneral-client', (type, data) => {
    if (type === 'first') {
        state.players = JSON.parse(data);
    }
    else if (type === 'add' && state.players.length) {
        const index = state.players.findIndex(i => i === data.serverID);
        if (index >= 0)
            state.players.splice(index, 1);
        state.players.push(data);
    }
    else if (type === 'remove') {
        const index = state.players.findIndex(i => i.serverID === data.serverID);
        if (index >= 0)
            state.players.splice(index, 1);
    }
    else if (type === 'update') {
        const find = state.players.find(i => i.serverID === data.serverID);
        if (find) {
            find[data.refName] = data.value;
            if (data.refName === 'vip' && find.tagID)
                createTag(find.serverID);
        }
    }
});
RegisterCommand('+identifier', () => {
    for (let item of state.players) {
        const clientID = GetPlayerFromServerId(item.serverID);
        if (!NetworkIsPlayerActive(clientID))
            continue;
        const targetPed = GetPlayerPed(clientID);
        if (!DoesEntityExist(targetPed))
            continue;
        if (item && !item.voiceToggle) {
            if ((HasEntityClearLosToEntity(state.pedID, targetPed, 17) && (IsEntityVisible(targetPed) || !item.adminRole)) || NetworkIsInSpectatorMode()) {
                const coord = GetEntityCoords(targetPed, true);
                const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], coord[0], coord[1], coord[2], true);
                if (distance <= 30) {
                    createTag(item.serverID, targetPed);
                    if (item.vip?.name)
                        SetMpGamerTagVisibility(item.tagID, 7, true);
                    SetMpGamerTagVisibility(item.tagID, 0, true);
                    item.tagToggle = true;
                }
            }
        }
    }
}, false);
RegisterCommand('-identifier', () => {
    for (let item of state.players) {
        if (item.tagID && !item.voiceToggle) {
            SetMpGamerTagVisibility(item.tagID, 0, false);
            SetMpGamerTagVisibility(item.tagID, 7, false);
        }
        item.tagToggle = false;
    }
}, false);
RegisterKeyMapping('+identifier', 'Identifier', 'keyboard', 'b');
setTick(() => {
    state.pedID = PlayerPedId();
    state.coords = GetEntityCoords(state.pedID, true);
    if (!state.players.length)
        return;
    for (let item of state.players) {
        const clientID = GetPlayerFromServerId(item.serverID);
        if (!NetworkIsPlayerActive(clientID))
            continue;
        const targetPed = GetPlayerPed(clientID);
        if (!DoesEntityExist(targetPed))
            continue;
        const coord = GetEntityCoords(targetPed, true);
        const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], coord[0], coord[1], coord[2], true);
        const isTalk = NetworkIsPlayerTalking(clientID);
        if (distance <= 30 && isTalk && !item.voiceToggle &&
            HasEntityClearLosToEntity(state.pedID, targetPed, 17) && (IsEntityVisible(targetPed) || !item.adminRole)) {
            createTag(item.serverID, targetPed);
            PlayFacialAnim(targetPed, 'mic_chatter', 'mp_facial');
            if (item.vip?.name)
                SetMpGamerTagVisibility(item.tagID, 7, true);
            SetMpGamerTagVisibility(item.tagID, 9, true);
            SetMpGamerTagVisibility(item.tagID, 0, true);
            item.voiceToggle = true;
        }
        else if (!isTalk && item.tagID && item.voiceToggle) {
            if (!item.tagToggle) {
                SetMpGamerTagVisibility(item.tagID, 7, false);
                SetMpGamerTagVisibility(item.tagID, 0, false);
            }
            PlayFacialAnim(targetPed, 'mood_normal_1', 'facials@gen_male@variations@normal');
            SetMpGamerTagVisibility(item.tagID, 9, false);
            item.voiceToggle = false;
        }
    }
});
function createTag(serverID, pedID) {
    const data = state.players.find(i => i.serverID === serverID);
    if (data) {
        if (!pedID)
            pedID = GetPlayerPed(GetPlayerFromServerId(serverID));
        const colors = exports.NewStart_MainMenu.method('vipColors').filter((i) => i.isCustomIDColor);
        data.tagID = CreateFakeMpGamerTag(pedID, data.customID, false, false, '', 0);
        const colorID = colors.find((i) => i.name === data.vip?.name)?.id;
        if (colorID) {
            SetMpGamerTagColour(data.tagID, 0, colorID);
            SetMpGamerTagColour(data.tagID, 7, colorID);
            SetMpGamerTagColour(data.tagID, 9, colorID);
        }
    }
}
const Delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
on('onClientGameTypeStart', () => {
    AddTextEntry('FE_THDR_GTAO', 'NewStart Life (Beta)');
    StartAudioScene('CHARACTER_CHANGE_IN_SKY_SCENE');
    SetAudioFlag('PoliceScannerDisabled', true);
    RegisterFontFile('A9eelsh');
    SetTextFont(RegisterFontId('A9eelsh'));
});
on('playerSpawned', () => {
    if (state.isFirst) {
        NetworkSetFriendlyFireOption(true);
        SetCanAttackFriendly(state.pedID, true, true);
        state.isFirst = false;
    }
});
const initialCharacter = (parents, face, age) => {
    const pedID = GetPlayerPed(-1);
    SetPedHeadBlendData(pedID, parents.mother.id, parents.father.id, 0, parents.mother.id, parents.father.id, 0, parents.shapeMix, parents.skinMix, 0, true);
    if (face) {
        for (let key in face)
            SetPedFaceFeature(pedID, face[key].ref, face[key].value);
    }
    if (age) {
        for (let key in age)
            SetPedHeadOverlay(pedID, age[key].ref, age[key].id, age[key].opacity);
    }
};
onNet('NewStart_Initialize:playerSpawn-client', async (data) => {
    data = JSON.parse(data);
    if (data.character) {
        const model = data.character.identifier.gender === 'male' ? 'mp_m_freemode_01' : 'mp_f_freemode_01';
        if (!data.location.position.x && !data.location.position.y) {
            emitNet('NewStart:general-server', 'setBucket', 0);
            data.location.position = { x: 109.3582, y: 6605.5385, z: 30.8579 };
        }
        exports.spawnmanager.spawnPlayer({ ...data.location.position, model }, () => {
            if (data.prison && data.prison.jailed > 5000) {
                emit('NewStart_Police:handleGeneral-client', 'startJail', JSON.stringify({ count: data.prison.jailed, reason: data.prison.jail[0].reason, code: data.prison.jail[0].from, isBack: true }));
            }
            else {
                emit('NewStart_Clothes:firstLoad-client');
            }
            initialCharacter(data.character.parents, data.character.face, data.character.age);
            exports.NewStart_Tattoos.method('setSave', data.tattoos);
            exports.NewStart_CharacterCreator.method('setOld', { parents: data.character.parents, face: data.character.face, age: data.character.age, isEdit: data.character.isEdit });
            exports.NewStart_Plain.method('setModel', model);
            StatSetInt("MP0_WALLET_BALANCE", parseInt(data.cash), false);
            StatSetInt("BANK_BALANCE", parseInt(data.bank), false);
            exports.NewStart_HudSystem.method('setStateNUI', { money: { cash: parseInt(data.cash), bank: parseInt(data.bank) } });
            if (data.noJob)
                exports.NewStart_HudSystem.updateJob({});
            if (data.location.code)
                exports.NewStart_RealEstate.method('updateInsideCode', data.location.code);
            if (data.mode?.radio)
                exports.NewStart_Radio.method('setFrequency', data.mode.radio);
            if (data.mode?.isDie)
                exports.NewStart_DeathCounter.method('executeHospital');
            if (data.distress)
                emit('NewStart_Police:handleGeneral-client', 'distress', JSON.stringify(data.distress));
            emit('NewStart_MainMenu:handleGeneral-client', 'setTaxes', data.vip.taxes);
            emit('NewStart_MainMenu:handleGeneral-client', 'pushToStore', [...data.vip.doubleExp, ...data.vip.sponsors, ...data.vip.other]);
            emit('NewStart_Admin:methods-client', 'changeGeneral', data.adminChangeGeneral);
            exports.spawnmanager.setAutoSpawn(false);
            state.isLoadingScreen = false;
            exports.NewStart_HudSystem.openHud('first', data.hud);
            exports.NewStart_MainMenu.toggleAds(true);
            exports.NewStart_Tools.method('setState', 'customID', data.customID);
            if (!data.skipQuestions) {
                emit('NewStart_Questions:handleGeneral-client', 'again', { name: data.character.identifier.name });
            }
            ShutdownLoadingScreenNui();
        });
    }
    else {
        emitNet('NewStart:general-server', 'setBucket');
        exports.spawnmanager.spawnPlayer({
            x: 240.55384826660156,
            y: -1373.221923828125,
            z: 38.5245361328125,
            heading: 215.43309020996094,
            model: 'mp_m_freemode_01'
        }, () => {
            exports.spawnmanager.setAutoSpawn(false);
            exports.NewStart_HudSystem.updateJob({});
            if (data.skipQuestions) {
                setTimeout(() => { exports.NewStart_CharacterCreator.initialCharacter(); }, 50);
                exports.NewStart_CharacterCreator.openUI();
            }
            emit('NewStart_Admin:methods-client', 'changeGeneral', data.adminChangeGeneral);
        });
        if (!data.skipQuestions) {
            exports.NewStart_Questions.openUI();
        }
    }
    const ID = PlayerId();
    for (let value of pickupList) {
        ToggleUsePickupsForPlayer(ID, GetHashKey(value), false);
    }
});
setTick(() => {
    const playerID = PlayerId();
    HideHudComponentThisFrame(1);
    HideHudComponentThisFrame(2);
    HideHudComponentThisFrame(3);
    HideHudComponentThisFrame(4);
    HideHudComponentThisFrame(6);
    HideHudComponentThisFrame(7);
    HideHudComponentThisFrame(9);
    HideHudComponentThisFrame(13);
    HideHudComponentThisFrame(20);
    RemoveMultiplayerWalletCash();
    RemoveMultiplayerBankCash();
    SetPlayerWantedLevel(playerID, 0, false);
    DisablePlayerVehicleRewards(playerID);
    const isPauseMenuActive = IsPauseMenuActive() || IsWarningMessageActive();
    if (isPauseMenuActive && !state.pauseMenuOpen) {
        exports.NewStart_Phone.noticesToggle(true);
        exports.NewStart_HudSystem.closeUI();
        exports.NewStart_MainMenu.toggleAds(false);
        exports.NewStart_Options.closeUI();
        exports.NewStart_Inventory.closeUI();
        exports.NewStart_Police.method('timerToggle', false);
        if (exports.NewStart_MainMenu.isOpen())
            state.showNoticesPhone = true;
        state.pauseMenuOpen = true;
    }
    else if (!isPauseMenuActive && state.pauseMenuOpen) {
        if (!exports.NewStart_MainMenu.isOpen()) {
            exports.NewStart_HudSystem.openHud();
            exports.NewStart_MainMenu.toggleAds(true);
            exports.NewStart_Phone.noticesToggle(false);
        }
        exports.NewStart_Police.method('timerToggle', true);
        state.pauseMenuOpen = false;
    }
    else if (state.showNoticesPhone && !state.pauseMenuOpen) {
        exports.NewStart_Phone.noticesToggle(false);
        state.showNoticesPhone = false;
    }
});
setInterval(() => {
    if (exports.NewStart_Questions.isOpen() ||
        exports.NewStart_CharacterCreator.isOpen() ||
        IsPedSwimming(state.pedID) ||
        exports.NewStart_Police.method('info').isJailed)
        return;
    const code = exports.NewStart_RealEstate.method('getCurrent').code;
    const location = {
        name: GetLabelText(GetNameOfZone(state.coords[0], state.coords[1], state.coords[2])),
        position: { x: state.coords[0], y: state.coords[1], z: state.coords[2] }
    };
    if (code)
        location.code = code;
    exports.NewStart_Inventory.method('weaponsLoad', true);
    emitNet('NewStart:updateUser', { location });
    emitNet('NewStart:updateUser', { playTime: 60000 / (60 * 1000) }, true);
}, 90000);
setInterval(() => {
    InvalidateIdleCam();
    InvalidateVehicleIdleCam();
}, 1000);
exports('loadingScreen', (isGet) => {
    if (isGet) {
        return state.isLoadingScreen;
    }
    else {
        state.isLoadingScreen = false;
    }
});
exports('method', (type, data) => {
    if (type === 'getPlayer') {
        return state.players.find(i => i.serverID === data);
    }
    else if (type === 'getPlayers') {
        return state.players;
    }
    else if (type === 'blankScreen') {
        if (data) {
            exports.NewStart_HudSystem.closeUI();
            exports.NewStart_Phone.noticesToggle(true);
            exports.NewStart_MainMenu.toggleAds(false);
            DisplayRadar(false);
        }
        else {
            exports.NewStart_Phone.noticesToggle(false);
            if (!exports.NewStart_MainMenu.isOpen()) {
                DisplayRadar(true);
                exports.NewStart_HudSystem.openHud();
                exports.NewStart_MainMenu.toggleAds(true);
            }
        }
    }
    else if (type === 'getClosestPlayer') {
        return getClosestPlayer(data);
    }
});
function getClosestPlayer(info) {
    let factions = [];
    if (info.noFactions)
        factions = exports.NewStart_PoliceTools.method('getPlayersFactions');
    const players = [];
    for (const id of GetActivePlayers()) {
        const targetPed = GetPlayerPed(id);
        if (targetPed === state.pedID)
            continue;
        const [x, y, z] = GetEntityCoords(targetPed, true);
        const distance = GetDistanceBetweenCoords(x, y, z, state.coords[0], state.coords[1], state.coords[2], true);
        if ((distance > (info.maxDistance || 2.5)) || !IsEntityVisible(targetPed))
            continue;
        const serverID = GetPlayerServerId(id);
        if (info.noFactions && factions.some(i => i.serverID === serverID))
            continue;
        else if (info.noCuffs && IsEntityPlayingAnim(targetPed, 'mp_arresting', 'idle', 1))
            continue;
        else if (info.noDead && (IsEntityDead(targetPed) || IsEntityPlayingAnim(targetPed, 'random@dealgonewrong', 'idle_a', 1)))
            continue;
        else if (info.isCuffs && !IsEntityPlayingAnim(targetPed, 'mp_arresting', 'idle', 1))
            continue;
        else if (info.noVehicle && IsPedInAnyVehicle(targetPed, false))
            continue;
        players.push({ clientID: id, pedID: targetPed, serverID, distance });
    }
    return players.sort((a, b) => a.distance - b.distance)[0] || 0;
}
const places = {
    AIRP: 'مطار لوس سانتوس الدولي',
    ARMYB: 'مقر القوات المسلحة',
    BEACH: 'شاطئ المدينة',
    DELBE: 'شاطئ المدينة',
    DOWNT: 'وسط المدينة',
    ELGORL: 'منطقة المنارة',
    ELYSIAN: 'منطقة الميناء',
    HUMLAB: 'منقطة المعمل',
    JAIL: 'منطقة السجن',
    LEGSQU: 'منطقة الملكية',
    MTCHIL: 'منطقة الجبل الكبير',
    PBOX: 'منطقة المستشفي',
    ROCKF: 'منطقة مركز المدينة',
    SKID: 'منطقة مركز الشرطة',
    TERMINA: 'منطقة الميناء',
    ZP_ORT: 'منطقة الميناء'
};
exports('getPlace', () => {
    const zone = GetNameOfZone(state.coords[0], state.coords[1], state.coords[2]);
    return places[zone] || GetLabelText(zone);
});
const state = {
    pedID: 0,
    coords: [],
    isLoadingScreen: true,
    pauseMenuOpen: false,
    showNoticesPhone: false,
    isFirst: true,
    players: []
};
const pickupList = [
    "PICKUP_AMMO_BULLET_MP",
    "PICKUP_AMMO_FIREWORK",
    "PICKUP_AMMO_FLAREGUN",
    "PICKUP_AMMO_GRENADELAUNCHER",
    "PICKUP_AMMO_GRENADELAUNCHER_MP",
    "PICKUP_AMMO_HOMINGLAUNCHER",
    "PICKUP_AMMO_MG",
    "PICKUP_AMMO_MINIGUN",
    "PICKUP_AMMO_MISSILE_MP",
    "PICKUP_AMMO_PISTOL",
    "PICKUP_AMMO_RIFLE",
    "PICKUP_AMMO_RPG",
    "PICKUP_AMMO_SHOTGUN",
    "PICKUP_AMMO_SMG",
    "PICKUP_AMMO_SNIPER",
    "PICKUP_ARMOUR_STANDARD",
    "PICKUP_CAMERA",
    "PICKUP_CUSTOM_SCRIPT",
    "PICKUP_GANG_ATTACK_MONEY",
    "PICKUP_HEALTH_SNACK",
    "PICKUP_HEALTH_STANDARD",
    "PICKUP_MONEY_CASE",
    "PICKUP_MONEY_DEP_BAG",
    "PICKUP_MONEY_MED_BAG",
    "PICKUP_MONEY_PAPER_BAG",
    "PICKUP_MONEY_PURSE",
    "PICKUP_MONEY_SECURITY_CASE",
    "PICKUP_MONEY_VARIABLE",
    "PICKUP_MONEY_WALLET",
    "PICKUP_PARACHUTE",
    "PICKUP_PORTABLE_CRATE_FIXED_INCAR",
    "PICKUP_PORTABLE_CRATE_UNFIXED",
    "PICKUP_PORTABLE_CRATE_UNFIXED_INCAR",
    "PICKUP_PORTABLE_CRATE_UNFIXED_INCAR_SMALL",
    "PICKUP_PORTABLE_CRATE_UNFIXED_LOW_GLOW",
    "PICKUP_PORTABLE_DLC_VEHICLE_PACKAGE",
    "PICKUP_PORTABLE_PACKAGE",
    "PICKUP_SUBMARINE",
    "PICKUP_VEHICLE_ARMOUR_STANDARD",
    "PICKUP_VEHICLE_CUSTOM_SCRIPT",
    "PICKUP_VEHICLE_CUSTOM_SCRIPT_LOW_GLOW",
    "PICKUP_VEHICLE_HEALTH_STANDARD",
    "PICKUP_VEHICLE_HEALTH_STANDARD_LOW_GLOW",
    "PICKUP_VEHICLE_MONEY_VARIABLE",
    "PICKUP_VEHICLE_WEAPON_APPISTOL",
    "PICKUP_VEHICLE_WEAPON_ASSAULTSMG",
    "PICKUP_VEHICLE_WEAPON_COMBATPISTOL",
    "PICKUP_VEHICLE_WEAPON_GRENADE",
    "PICKUP_VEHICLE_WEAPON_MICROSMG",
    "PICKUP_VEHICLE_WEAPON_MOLOTOV",
    "PICKUP_VEHICLE_WEAPON_PISTOL",
    "PICKUP_VEHICLE_WEAPON_PISTOL50",
    "PICKUP_VEHICLE_WEAPON_SAWNOFF",
    "PICKUP_VEHICLE_WEAPON_SMG",
    "PICKUP_VEHICLE_WEAPON_SMOKEGRENADE",
    "PICKUP_VEHICLE_WEAPON_STICKYBOMB",
    "PICKUP_WEAPON_ADVANCEDRIFLE",
    "PICKUP_WEAPON_APPISTOL",
    "PICKUP_WEAPON_ASSAULTRIFLE",
    "PICKUP_WEAPON_ASSAULTSHOTGUN",
    "PICKUP_WEAPON_ASSAULTSMG",
    "PICKUP_WEAPON_AUTOSHOTGUN",
    "PICKUP_WEAPON_BAT",
    "PICKUP_WEAPON_BATTLEAXE",
    "PICKUP_WEAPON_BOTTLE",
    "PICKUP_WEAPON_BULLPUPRIFLE",
    "PICKUP_WEAPON_BULLPUPSHOTGUN",
    "PICKUP_WEAPON_CARBINERIFLE",
    "PICKUP_WEAPON_COMBATMG",
    "PICKUP_WEAPON_COMBATPDW",
    "PICKUP_WEAPON_COMBATPISTOL",
    "PICKUP_WEAPON_COMPACTLAUNCHER",
    "PICKUP_WEAPON_COMPACTRIFLE",
    "PICKUP_WEAPON_CROWBAR",
    "PICKUP_WEAPON_DAGGER",
    "PICKUP_WEAPON_DBSHOTGUN",
    "PICKUP_WEAPON_FIREWORK",
    "PICKUP_WEAPON_FLAREGUN",
    "PICKUP_WEAPON_FLASHLIGHT",
    "PICKUP_WEAPON_GRENADE",
    "PICKUP_WEAPON_GRENADELAUNCHER",
    "PICKUP_WEAPON_GUSENBERG",
    "PICKUP_WEAPON_GOLFCLUB",
    "PICKUP_WEAPON_HAMMER",
    "PICKUP_WEAPON_HATCHET",
    "PICKUP_WEAPON_HEAVYPISTOL",
    "PICKUP_WEAPON_HEAVYSHOTGUN",
    "PICKUP_WEAPON_HEAVYSNIPER",
    "PICKUP_WEAPON_HOMINGLAUNCHER",
    "PICKUP_WEAPON_KNIFE",
    "PICKUP_WEAPON_KNUCKLE",
    "PICKUP_WEAPON_MACHETE",
    "PICKUP_WEAPON_MACHINEPISTOL",
    "PICKUP_WEAPON_MARKSMANPISTOL",
    "PICKUP_WEAPON_MARKSMANRIFLE",
    "PICKUP_WEAPON_MG",
    "PICKUP_WEAPON_MICROSMG",
    "PICKUP_WEAPON_MINIGUN",
    "PICKUP_WEAPON_MINISMG",
    "PICKUP_WEAPON_MOLOTOV",
    "PICKUP_WEAPON_MUSKET",
    "PICKUP_WEAPON_NIGHTSTICK",
    "PICKUP_WEAPON_PETROLCAN",
    "PICKUP_WEAPON_PIPEBOMB",
    "PICKUP_WEAPON_PISTOL",
    "PICKUP_WEAPON_PISTOL50",
    "PICKUP_WEAPON_POOLCUE",
    "PICKUP_WEAPON_PROXMINE",
    "PICKUP_WEAPON_PUMPSHOTGUN",
    "PICKUP_WEAPON_RAILGUN",
    "PICKUP_WEAPON_REVOLVER",
    "PICKUP_WEAPON_RPG",
    "PICKUP_WEAPON_SAWNOFFSHOTGUN",
    "PICKUP_WEAPON_SMG",
    "PICKUP_WEAPON_SMOKEGRENADE",
    "PICKUP_WEAPON_SNIPERRIFLE",
    "PICKUP_WEAPON_SNSPISTOL",
    "PICKUP_WEAPON_SPECIALCARBINE",
    "PICKUP_WEAPON_STICKYBOMB",
    "PICKUP_WEAPON_STUNGUN",
    "PICKUP_WEAPON_SWITCHBLADE",
    "PICKUP_WEAPON_VINTAGEPISTOL",
    "PICKUP_WEAPON_WRENCH",
    "PICKUP_WEAPON_RAYCARBINE"
];
