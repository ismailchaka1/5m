/* ``````````` ## Development By el8rbawY ## ```````````*/
const config = {
   general: [
      { name: 'admins', title: 'جميع الإدارة الحالية', icon: 'images/admins.svg', allow: ['adminplus', 'admin', 'supervisorplus', 'supervisor'] },
      { name: 'sendAds', title: 'إرسال إعلان عام', icon: 'images/ads.svg', allow: ['adminplus', 'admin'] },
      { name: 'clearAds', title: 'مسح كل الإعلانات العامة', icon: 'images/remove.svg', allow: ['adminplus', 'admin', 'supervisorplus', 'supervisor'] },
      // { name: 'clearVehicles', title: 'إرجاع جميع المركبات ', subTitle: 'القريبة', icon: 'images/car.png', allow: ['adminplus'] },
      { name: 'waypoint', title: 'الانتقال إلى العلامة', icon: 'images/gps.svg', allow: ['adminplus', 'admin', 'supervisorplus', 'supervisor'] },
      { name: 'comfort', title: 'تفعيل وقت الراحة', icon: 'images/hourglass.png', isActive: false, allow: ['adminplus'] },
      { name: 'godMode', title: 'الوضع الخارق', icon: 'images/god.svg', isActive: false, allow: ['adminplus', 'admin', 'supervisorplus', 'supervisor'] },
      { name: 'invisibility', title: 'وضع التخفي', icon: 'images/mask.svg', isActive: false, allow: ['adminplus', 'admin', 'supervisorplus', 'supervisor'] },
      { name: 'doubleLevel', title: 'مضاعفة الخبرة ', subTitle: '3 ساعات', icon: 'images/level.svg', isActive: false, allow: [] },
      { name: 'doubleTaboo', title: 'الأجر ممنوعات ', subTitle: '3 ساعات', icon: 'images/level.svg', isActive: false, allow: [] }
   ]
}

// ---
RegisterCommand('reVeh', () => {
   const vehID = exports.NewStart_VehicleSystem.method('getClosestVeh', 5, true);
   if (vehID) emitNet('NewStart_Admin:handleGeneral-sevrer', { action: 'removeVeh', vehID: NetworkGetNetworkIdFromEntity(vehID) });
}, false);