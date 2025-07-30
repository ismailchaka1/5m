/* ``````````` ## Development By el8rbawY ## ```````````*/
const reportsData = { lastMessage: null, items: [] };

// ---
onNet('NewStart_Phone:EmergencyMessage-client', info => {
   info = JSON.parse(info);
   
   const isMDT = ['police', 'facilities', 'health'].includes(exports.NewStart_Factions.info()?.key) && exports.NewStart_Employee.data().isActive;
   if (isMDT) return exports.NewStart_Police.reports('setData', info);

   const length = reportsData.items.length;

   if (length >= 20) {
      reportsData.items.splice(length - 1, 1);
   }

   reportsData.items.unshift(info);
   SendNuiMessage(JSON.stringify({ type: 'setReportData', info: reportsData.items }));
});

// ---
RegisterNuiCallbackType('NUI:reports');

on('__cfx_nui:NUI:reports', (data, cb) => {
   const index = reportsData.items.findIndex(obj => obj.id === data.id);
   const [x, y] = reportsData.items[index].location.coords;

   SetNewWaypoint(x, y);
   exports.NewStart_Notifications.showAttention('success', 'تم تحديد الموقع علي الخريطة.');

   reportsData.items.splice(index, 1);
   SendNuiMessage(JSON.stringify({ type: 'setReportData', info: reportsData.items, isRead: true }));
   cb('OK!');
});

exports('RESET_READ_REPORTS', _=> {
   if (reportsData.items.length) {
      SendNuiMessage(JSON.stringify({ type: 'setReportData', isReset: true}));
   }
});