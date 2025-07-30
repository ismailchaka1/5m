/* ``````````` ## Development By el8rbawY ## ```````````*/
function closeUI(withNUI, withIsOpen = true) {
   if (withNUI) { // full close
      SendNUIMessage({ type: 'close' });
      exports.NewStart_Tools.sendToNUI({ type: 'progress', status: false });
      clearTimeout(options.fillID);
      options.fillID = null;
   }

   if (withIsOpen) options.isOpen = false;

   SetNuiFocus(!withIsOpen, false);
   SendNUIMessage({ type: 'close' });
   options.runClose = false;
}