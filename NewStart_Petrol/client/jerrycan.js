/* ``````````` ## Development By el8rbawY ## ```````````*/
setInterval(_=> {
   const pedID = PlayerPedId();
   const model = 883325847;

   if (!IsControlJustPressed(0, 38) || GetVehiclePedIsIn(pedID, false) || GetCurrentPedWeapon(pedID)[1] !== model) return;

   const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh');
   const vehCoords = GetEntityCoords(vehID);
   const tankBones = ['petrolcap', 'petroltank', 'petroltank_r', 'petroltank_l', 'wheel_lr', 'wheel_rr'];

   if ([14, 16, 15].includes(GetVehicleClass(vehID))) {
      tankBones.push('engine');
   }

   const [x, y, z] = GetEntityCoords(pedID);
   let canStart = false;

   for (let name of tankBones) {
      const index = GetEntityBoneIndexByName(vehID, name);
      const coords = GetWorldPositionOfEntityBone(vehID, index);
      const distanceBone = GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true);

      if (distanceBone <= 1.5) {
         canStart = true; break;
      }
   }

   if (GetVehicleEngineHealth(vehID) <= 0) {
      exports.NewStart_Notifications.showAttention('error', 'المركبة غير صالحة يجب تصليحها أولاً!');
      return;

   } else if (canStart && vehID && !IsPedInAnyVehicle(pedID, false)) {
      const heading = GetHeadingFromVector_2d(vehCoords[0] - x, vehCoords[1] - y);

      SetEntityHeading(pedID, heading);
      TaskPlayAnim(pedID, 'weapon@w_sp_jerrycan', 'fire_intro', 8, -8, -1, 50, 0, 0, 0, 0);
      SetVehicleEngineOn(vehID, false, false, true);
      SetVehicleUndriveable(vehID, true);
      SetVehicleHandbrake(vehID, true);
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: true, custom: '15s' });

      setTimeout(_=> {
         const fuel = GetVehicleFuelLevel(vehID);
         exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
         StopAnimTask(pedID, 'weapon@w_sp_jerrycan', 'fire_intro', 1.0);
         SetVehicleUndriveable(vehID, false);
         SetVehicleHandbrake(vehID, false);
         emitNet('NewStart_VehicleSystem:handleGlobal-server', 'syncFuel', JSON.stringify({ id: VehToNet(vehID), level: (fuel > 50 ? 50 : fuel) + 50 }));
         RemoveWeaponFromPed(pedID, model);
         SetCurrentPedWeapon(pedID, GetHashKey('weapon_unarmed'), true);
         exports.NewStart_Notifications.showAttention('success', 'لقد قمت بتعبئة الوقود بالكامل للمركبة.');

         const plate = exports.NewStart_VehicleSystem.method('vehiclePrivate', vehID);

         if (plate) {
            emitNet('NewStart_Petrol:saveDate-server', JSON.stringify({ fuel: 100, isUnique: true, plate }));
         }
      }, 15000);

   } else {
      exports.NewStart_Notifications.showAttention('error', 'قف أمام خزان وقود السيارة أو الدراجة النارية للاستخدام!');
   }
}, 0);