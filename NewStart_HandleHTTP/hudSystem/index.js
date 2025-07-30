/* ``````````` ## Development By el8rbawY ## ```````````*/
// ---
onNet('NewStart_HudSystem:getHudValues-server', async _=> {
   const currentID = source;
   const license = licenseEncrypt(currentID);
   const { data } = await axios.get(`${URL}/users/${license}?filter=hud`);

   delete data.hud._id;
   emitNet('NewStart_HudSystem:initial-client', currentID, data.hud);
});

// ---
onNet('NewStart_HudSystem:saveHudValues-server', async hud => {   
   const license = licenseEncrypt(source);
	await axios.put(`${URL}/users/${license}`, { hud });
});

// ---
onNet('NewStart_HudSystem:getProximity-server', _=> {
   emitNet('NewStart_HudSystem:handleGeneral-client', source, 'setProximity', Player(source).state['proximity']);
});