function useItem(data) {
   const pedID = PlayerPedId();
   const find = staticData.find(obj => obj.id === data.id);

   if (!currentItems.some(obj => obj.id === data.id)) {
      return;

   } else if (exports.NewStart_Tools.method('isProgress')) {
      if (find.continuous) {
         exports.NewStart_Notifications.showAttention('error', 'لا يمكن استخدام أي شئ في الحقيبة الآن!');

      } else {
         return restoreItem(find.id, 'لا يمكن استخدام أي شئ في الحقيبة الآن!');
      }
   }
   
   switch(find.id) {
      case 2: case 7: // water
         exports.NewStart_HudSystem.update({ water: find.effect });
         break;

      case 5: // reset drugs
         exports.NewStart_Taboos.method('drunkEffect', { isReset: true });
         break;

      case 6: case 29: // food
         exports.NewStart_HudSystem.update({ food: find.effect });
         break;

      case 8: // health
         handleHealth(pedID);
         break;

      case 13: // petrol
         if (HasPedGotWeapon(pedID, 883325847)) return restoreItem(13, 'تمتلك وقود بالفعل تحقق من قائمة الأسلحة.');
         else GiveWeaponToPed(pedID, 883325847, 3000, false, true);
         break;
   
      case 22: // meth
         exports.NewStart_Taboos.method('drunkEffect', { delay: 3500, end: 300000 });
         break;

      case 25: case 26: // ammo
         const ammo = weaponAmmo(pedID, find.id, find.effect);
         if (!ammo) return;
         break;

      case 28: // licenses
         exports.NewStart_Licenses.method('openCard', data.features);
         break;

      case 37: // repairKit
         const repairKit = exports.NewStart_VehicleSystem.repairItem();
         if (!repairKit) return;
         break;

      case 41: // whiskey
         exports.NewStart_Taboos.method('drunkEffect', { name: 'whiskey', delay: 3500, end: 300000 });
         break;

      case 42: // weed
         if (!currentItems.some(obj => obj.id === 111)) return restoreItem(find.id, 'يجب أن يكون معك ولاعة سجائر داخل الحقيبة!');
         startSmoking(pedID);
         break;

      case 43: case 91: // cocaine & opium
         exports.NewStart_Taboos.method('drunkEffect', { delay: 3500, end: 300000 });
         break;

      case 46: // changeLocks
         const changeLocks = exports.NewStart_Keys.method('changeLocks');
         if (!changeLocks) return;
         break;

      case 47: // washKit
         const washKit = exports.NewStart_Mechanical.method('washKit');
         if (!washKit) return;
         break;

      case 92: case 93: case 94: // armour
         if (GetPedArmour(pedID) >= find.effect) return restoreItem(find.id, 'يجب أن يكون مستوي هذا الدرع أكبر من المستوي الحالي لدرعك!');
         handleArmour(pedID, find.effect);
         break;

      case 107: // diving
         const diving = exports.NewStart_Taboos.method('divingSuit');
         if (!diving) return;
         break;

      case 108: // reClothes
         if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
            exports.NewStart_Taboos.method('divingSuit', { isEnd: true });
         } else return restoreItem(108, 'أنت لا ترتدي أي ملابس مؤقتة حاليا!');
         break;

      case 113:
         if (HasPedGotWeapon(pedID, -72657034)) return restoreItem(find.id, 'تمتلك مظلة هبوط بالفعل تحقق من قائمة الأسلحة!');
         GiveWeaponToPed(pedID, -72657034, 1, false, false);
         break;

      case 114:
         if (HasPedGotWeapon(pedID, 600439132)) return restoreItem(find.id, 'تمتلك كرة بالفعل تحقق من قائمة الأسلحة!');
         GiveWeaponToPed(pedID, 600439132, 1, false, true);
         break;
   }

   if (!find.continuous) emitNet('NewStart_Inventory:useItem-server', JSON.stringify(data));
}

// ---
function restoreItem (id, text) {
   exports.NewStart_Notifications.showAttention('error', text);
   emit('NewStart_Inventory:additem-client', JSON.stringify({ id, count: 1 }), true);
}

function startSmoking(pedID) {
   if (state.smoking) return;
   state.smoking = true;

   exports.NewStart_Inventory.closeUI();
   TaskStartScenarioInPlace(pedID, 'WORLD_HUMAN_SMOKING_POT', 0, true);
   exports.NewStart_Notifications.showAttention('info', 'قم بالضغط علي F5 لإطفاء السيجارة.');

   state.smoking = setTimeout(_=> {
      ClearPedTasks(pedID);
      clearTick(state.smokingTickID);
      state.smoking = null;
   }, 90000);
}