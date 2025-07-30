/* ``````````` ## Development By el8rbawY ## ```````````*/
const serverType = GetConvar('serverType', 'changeme');

// ---
if (serverType === 'test') {
	RegisterCommand('getWeapon', async (source, arr) => {
		const ped = GetPlayerPed(source);

		if (arr[0] === '1') {
			GiveWeaponToPed(ped, -1312131151, 1000, false, true);

		} else if (arr[0] === '2') {
			GiveWeaponToPed(ped, 911657153, 1000, false, true);

		} else if (arr[0] === '3') {
			GiveWeaponToPed(ped, 600439132, 1000, false, true);

		} else if (arr[0] === '4') {
			GiveWeaponToPed(ped, 101631238, 1000, false, true);

		} else {
			GiveWeaponToPed(ped, 736523883, 1000, false, true);
		}
		
	}, true);

	// ---
	RegisterCommand('getPos', async (source, arr) => {
		const pedID = GetPlayerPed(source);
		console.log('hello!');

		if (arr[0] === 'veh') {
			const vehID = GetVehiclePedIsIn(pedID, false);
			console.log(GetEntityCoords(vehID, true), GetEntityHeading(vehID));

		} else {
			console.log(GetEntityCoords(pedID, true), GetEntityHeading(pedID));
		}
	}, true);

	// ---
	RegisterCommand('goPos', (source, arr) => {
		const pedID = GetPlayerPed(source);
		let coord = arr[0].split(',');
		coord = coord.map(c => parseFloat(c));

		SetEntityCoords(pedID, coord[0], coord[1], coord[2], false, false, false, false);
		SetEntityHeading(pedID, coord[3] || 0);
		// FreezeEntityPosition(pedID, true);
	}, true);

	// ---
	RegisterCommand('getVeh_', async (source, arr) => {
		const ped = GetPlayerPed(source);
		const [x, y, z] = GetEntityCoords(ped, true);
		let vehID;

		if (arr[0] === '1') {
			vehID = CreateVehicle(2123327359, x, y, z, GetEntityHeading(ped), true, true);

		} else if (arr[0] === '2') {
			vehID = CreateVehicle(GetHashKey('eheli'), x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '3') {
			vehID = CreateVehicle(GetHashKey('mammatus'), x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '4') { // ---
			vehID = CreateVehicle(GetHashKey('unimog'), x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '5') {
			vehID = CreateVehicle(GetHashKey('a90pit'), x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '6') {// ---
			vehID = CreateVehicle(GetHashKey('m121'), x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '7') { // ---
			vehID = CreateVehicle(GetHashKey('towncar79li'), x, y, z, GetEntityHeading(ped), true, false);
			
		} else if (arr[0] === '8') { // --
			vehID = CreateVehicle(GetHashKey('rs6+'), x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '9') {
			vehID = CreateVehicle(GetHashKey('f812'), x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '10') {
			vehID = CreateVehicle(1939284556, x, y, z, GetEntityHeading(ped), true, false);

		} else if (arr[0] === '11') {
			vehID = CreateVehicle(3296789504, x, y, z, GetEntityHeading(ped), true, false);
		}

		SetVehicleNumberPlateText(vehID, '1');
	}, true);
}