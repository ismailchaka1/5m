/* ``````````` ## Development By el8rbawY ## ```````````*/
const Delay = (ms) => new Promise(res => setTimeout(res, ms));

// ---
onNet('NewStart_Jobs:handleGeneral-client', (type, data) => {
   if (type === 'createJobVehicle') {
      createVehicleJob(data);
   }
});

// ---
function vehicleBuild(hash, color, coords) {
   emitNet('NewStart_VehicleSystem:handleGlobal-server', 'createVehicle', JSON.stringify({
      family: 'job', model: hash, type: exports.NewStart_VehicleSystem.method('getVehicleType', hash), coords, 
      data: { hash, color }
   }));
}

// ---
async function createVehicleJob(data) {
   while (!NetworkDoesEntityExistWithNetworkId(data.netID)) {
      await Delay(0);
   }

   const vehID = NetToVeh(data.netID);
   SetPedIntoVehicle(PlayerPedId(), vehID, -1);
   exports.NewStart_Tools.method('passiveModeVehicle');

   const plate = exports.NewStart_Initialize.method('getPlayer', GetPlayerServerId(PlayerId())).customID;
   SetVehicleNumberPlateText(vehID, plate);

   emitNet('NewStart_VehicleSystem:handleGlobal-server', 'asMission', JSON.stringify({ id: data.netID }));

   if (state.currentJob.id === 1) {
      FARMING_DATA.vehID = data.netID;

   } else if (state.currentJob.id === 2)  {
      WEST_DATA.vehID = data.netID;

   } else if (state.currentJob.id === 3) {
      POULTRY_DATA.vehID = data.netID;

   } else if (state.currentJob.id === 5) {
      FISHING_DATA.vehID = data.netID;
   }

   while (GetVehicleNumberPlateText(vehID).trim() !== plate || NetworkGetEntityOwner(vehID) !== PlayerId()) {
      SetVehicleNumberPlateText(vehID, plate);
      await Delay(0);
   }

   SetEntityAsMissionEntity(vehID, true, true);
   SetVehicleHasBeenOwnedByPlayer(vehID, true);
   SetVehicleColours(vehID, data.color, data.color);
   SetVehicleEngineOn(vehID, true, false, true);
   SetVehicleCanLeakPetrol(vehID, false);
   emitNet('NewStart_VehicleSystem:handleGlobal-server', 'syncFuel', JSON.stringify({ id: data.netID, level: 100 }));
}

// ---
function toggleAnim(job, value) {
   const pedID = PlayerPedId();

   if (value) {
      const names = {
         oilAndGas: { hash: 1360563376, dictionary: 'amb@world_human_const_drill@male@drill@base', name: 'base' },
         metal: { hash: 260873931, dictionary: 'melee@large_wpn@streamed_core', name: 'ground_attack_on_spot' },
         farming: { hash: -1934174148, dictionary: 'amb@world_human_gardener_plant@male@base', name: 'base' },
         westShipping: { hash: 176137803, dictionary: 'amb@world_human_clipboard@male@idle_a', name: 'idle_c' },
         poultry: { hash: 652737713, dictionary: 'anim@heists@ornate_bank@grab_cash_heels', name: 'grab' },
         poultry2: { hash: 436978267, dictionary: 'anim@amb@business@coc@coc_unpack_cut_left@', name: 'coke_cut_v1_coccutter' },
         fishing: { hash: -1910604593, dictionary: 'amb@world_human_stand_fishing@base', name: 'base' }
      };
      
      const [x, y, z] = GetEntityCoords(pedID, true);
      state.objectID = CreateObject(names[job].hash, x, y, z, true, true, true);
      
      TaskPlayAnim(pedID, names[job].dictionary, names[job].name, 8.0, 1.0, -1, 1, 1.0, false, false, false);

      if (job === 'poultry') {
         AttachEntityToEntity(state.objectID, pedID, GetPedBoneIndex(pedID, 57005), 0.13, 0.0, -0.16, 250.0, -50, 0.0, false, false, false, false, 2, true);
         
      } else if (job === 'poultry2') {
         AttachEntityToEntity(state.objectID, pedID, GetPedBoneIndex(pedID, 57005), 0.13, 0.14, 0.09, 40.0, 0.0, 0.0, false, false, false, false, 2, true);

      } else if (job === 'metal') { 
         AttachEntityToEntity(state.objectID, pedID, GetPedBoneIndex(pedID, 57005), 0.09, 0.03, -0.02, -78.0, 13.0, 28.0, true, true, false, true, 1, true);

      } else {
         const bone = GetPedBoneIndex(pedID, ['westShipping', 'fishing'].includes(job) ? 60309 : 28422);
         AttachEntityToEntity(state.objectID, pedID, bone, 0, 0, 0, 0, 0, 0, true, true, false, true, 1.0, true);
      }
      
      SetCurrentPedWeapon(pedID, GetHashKey('weapon_unarmed'), true);

   } else {
      ClearPedTasks(pedID);
      DeleteEntity(state.objectID);
      state.objectID = null;
   }
}

// ---
function randomByPercentage(data) {    
   const expanded = data.flatMap(obj => Array(obj.pct).fill(obj));

   expanded.sort(_=> 0.5 - Math.random());
   return {...expanded[Math.floor(Math.random() * expanded.length)]};
}

// ---
function removeSubBlips() {
   const data = [...OIL_DATA.blips, ...WEST_DATA.blips, ...FARMING_DATA.blips, ...POULTRY_DATA.blips, ...METAL_DATA.blips, ...FISHING_DATA.blips];

   for (let blip of data) {
      RemoveBlip(blip);
   }

   OIL_DATA.blips = [];
   WEST_DATA.blips = [];
   FARMING_DATA.blips = [];
   POULTRY_DATA.blips = [];
   METAL_DATA.blips = [];
   FISHING_DATA.blips = [];
}