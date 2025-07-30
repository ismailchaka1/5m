/* ``````````` ## Development By el8rbawY ## ```````````*/
const Delay = (ms) => new Promise(res => setTimeout(res, ms));

// ---
async function takePhoto() {
   state.photo.handle = RegisterPedheadshot(PlayerPedId());
   while (!IsPedheadshotReady(state.photo.handle) || !IsPedheadshotValid(state.photo.handle)) await Delay(1000);

   const txd = GetPedheadshotTxdString(state.photo.handle);
   SendNUIMessage(JSON.stringify({ type: 'getPhoto', url: `https://nui-img/${txd}/${txd}?v=${Date.now()}` }));
}

// ---
// RegisterCommand('test111', () => {
//    takePhoto();
// }, true);