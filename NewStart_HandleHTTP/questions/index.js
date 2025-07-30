/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Questions:skip-server', _=> {
   const currentID = source;
   const license = licenseEncrypt(currentID);
   let discord, fivem;

	for (let i = 0; i <= 10; i++) {
		const value = GetPlayerIdentifier(currentID, i);

		if (value?.startsWith('discord')) {
			discord = value.replace('discord:', '');

		} else if (value?.startsWith('fivem')) {
			fivem = value.replace('fivem:', '');
		}
	}

   axios.post(`${URL}/users`, { license, discord, fivem });
});