/* ``````````` ## Development By el8rbawY ## ```````````*/
const moment = require('moment');

// ---
on('playerConnecting', async (name, _, deferrals) => { // Check the whitelist
	deferrals.defer()
	const currentID = source;
	if (!currentID) return deferrals.done(`خطأ غير متوقع! يرجي غلق وإعادة فتح الفايف ام مرة أخري`);

	deferrals.update(`يتم التحقق من الديسكورد الخاص بك.`);
	const license = licenseEncrypt(currentID)
	let discord = null;

	for (let i = 0; i <= 10; i++) { // get id
		const value = GetPlayerIdentifier(currentID, i);

		if (value?.startsWith('discord')) {
			discord = value.replace('discord:', '');
			break;
		}
	}
	
	// check block
	const data = (await axios.get(`${URL}/admin/ban?license=${license}&discord=${discord}`)).data;
	
	if (data.isActive || data.isForever) {
		const duration = data.isForever ? 'مدي الحياة' : moment(data.end).locale('ar').fromNow();
		
		deferrals.done(` لقد تم رفض دخولك للخادم
			
			السبب: ${ data.reason }

			بواسطة: ${ data.from } 
			ينتهي: ${ duration } 

			(إذا كنت تعتقد أن هناك خطأ لا تتردد بالتواصل معنا)
		`);
		return;
	}

	if (!discord) {
		deferrals.done(`\n
			- يجب عليك ربط حسابك الديسكورد بالفايف ام 
			- يجب عليك الدخول للديسكورد الخاص بنا
			
			أو قم بفتح برنامج الديسكورد إذا كان مغلقا وإعادة فتح الفايف ام
		`);

	} else {			
		const DISCORD_API = `https://discord.com/api/v10/guilds/955495908462706688/members/${discord}`;
		
		try {
			const response = await axios.get(
				DISCORD_API,
				{ headers: { 'Authorization': 'Bot MTA4ODAyNTk5ODYzODk4OTM1Mg.GTJgaJ.E7y4aoLwpeMD9qdNDZW5nvRpSjoCWUq_5dCdRw' } }
			);

			if (!response.data.roles.some(r => initialize.adminRoles.includes(r))) {
				return deferrals.done('غير مسموح لك بدخول الخادم!');

			} /* else if (initialize.blackListDiscordID.includes(response.data.user.id)) {
				return deferrals.done('الاصدار الخاص بك قديم جدا يرجي تحديثه أولاً أو تواصل معنا');
			} */

			const sameDiscord = (await axios.get(`${URL}/users/${license}?filter=discord`)).data?.discord;
			const otherDiscord = (await axios.get(`${URL}/users/${license}?discord=${discord}&filter=discord`)).data?.discord;
			let message = `\n\nlicenseID: ${license}\nsameDiscordID: ${sameDiscord}\notherDiscordID: ${otherDiscord}`;
			let sendFailed = false;

			if (sameDiscord && sameDiscord !== discord) { // check discord in database
				sendFailed = true;
				message = `فشل الدخول ← بسبب عدم تطابق حسابات الديسكورد` + message;

				deferrals.done(`
					حسابك الديسكورد الحالي لا يطابق المسجل لدينا!
					
					- قم بفتح نفس حساب الديسكورد عند تسجيلك الأول في الخادم
					- بعد ذلك قم بإعادة تشغيل برنامج الفايف ام
					- وتأكد من حساب الديسكورد الموجود في إعدادات الفايف ام
				`);

			} else if (!sameDiscord && otherDiscord) {
				sendFailed = true;
				message = `فشل الدخول ← بسبب عدم تطابق الترخيص مع حساب الديسكورد` + message;
				
				deferrals.done(`
					حسابك الديسكورد الحالي مسجل لدينا من قبل ولكن لا يرتبط مع ترخيصك في جراند ثفت أوتو 5 الحالي
					
					- قم بالغاء ربط حسابك الديسكورد الحالي بالفايف ام وتسجيل حساب جديد
					- أو العودة للترخيص اللعبة السابق لنفس المسجل لدينا
					- أو تواصل معنا لإجراء عملية نقل الحساب لعدم خسارة تقدمك
				`);

			} else {
				deferrals.done();
			}

			if (sendFailed) {
				await axios.post(`${URL}/other/discord_log`, { type: 'custom', isLog: true, license, channel: 'failed-log', message });
			}

		} catch (err) {
			console.log(err);
			deferrals.done(`يجب عليك الدخول للديسكورد الخاص بنا`);
		}
	}
});

// -- 
on('playerJoining', async _=> {
	const currentID = source;
	const license = licenseEncrypt(currentID);

	if (serverType === 'main') { 
		let count = 0;

		for (let id of getPlayers()) {
			if (licenseEncrypt(id) === license) {
				count += 1;
				if (count === 2) return DropPlayer(currentID, 'غير مسموح بالدخول بنفس الشخصية أكثر من مرة!');
			}
		}
	}
	
	const { data } = await axios.get(`${URL}/users/${license}?isInitialize=true`);
	const info = { ...data.user, ...data.money };
	const identifier = info.character?.identifier;

	emitNet(
		'NewStart_Initialize:playerSpawn-client', currentID, 
		JSON.stringify({
			customID: info.customID,
			character: info.character,
			location: info.location,
			mode: info.mode,
			cash: info.cash, bank: info.bank,
			skipQuestions: info.skipQuestions,
			hud: info.hud,
			prison: data.prison,
			distress: policeData.distress.length ? { action: 'add', items: policeData.distress } : null,
			noJob: !info.job?.type && !info.job2?.type,
			vip: data.vip,
			tattoos: data.favorite?.tattoos,
			adminChangeGeneral: [
				{ name: 'comfort', isActive: admins.comfort.isActive },
				{ name: 'doubleTaboo', isActive: admins.doubleTaboo.isActive },
			]
		})
	);

	emitNet('NewStart_Clothes:initial-client', currentID, JSON.stringify({ outfit: info.character?.outfit, textures: info.character?.textures }));
	emitNet('NewStart_Hairdresser:initial-client', currentID, JSON.stringify({ ped: info.character?.ped, gender: identifier?.gender }));
	emitNet('NewStart_Inventory:initial-client', currentID, JSON.stringify(data.inventory));
	emitNet('NewStart_Tools:handleGeneral-client', currentID, 'subSeaPortClosed', { isInitial: true, value: policeData.subSeaPortClosed });

	if (identifier?.name) {
		emitNet(
			'NewStart_MainMenu:initial-client', currentID, 
			{ 
				info: { 
					name: identifier.name,
					playersCount: getPlayers().length,
					isWeapons: data.prison.isWeapons, 
					isCar: data.prison.isCar, 
					isTruck: data.prison.isTruck, 
					isMotor: data.prison.isMotor, 
					favourites: data.favorite.animations
				},
				level: { exp: info.mode?.level || 0, isDouble: admins.doubleLevel.isActive }, 
				vip: info.vip, 
				settings: info.settings,
				isReward: !data.favorite.rewardDate || ((new Date(data.favorite.rewardDate) - new Date()) / (1000 * 60 * 60)) >= 24
			}
		);
		emitNet(
			'NewStart_MainMenu:addToAds-client', currentID,
			{ type: 'login', from: 'النظام', text: `مرحبا بك "${identifier.name}" في خادم نيوستارت` }
		);

		joinPlayer({ serverID: currentID, customID: info.customID, name: identifier.name, vip: info.vip, adminRole: info.adminRole });
		
	} else if (admins.doubleLevel.isActive) {
		emitNet('NewStart_MainMenu:handleGeneral-client', -1, 'setDoubleLevel', true);
	}

	emitNet('NewStart_Options:setOutfitActive-client', currentID, info.character?.outfitToggle);
		
	if (info.job?.type === 'faction') {
		const vehicles = data.factionVehicles;
		const currentPlayers = getPlayers().map(p => ({ id: p, license: GetPlayerIdentifier(p)?.replace('license:', '') }));

		data.faction.players.find(item => item.user.customID === info.customID).isCurrent = true;
		data.faction.players = data.faction.players.map(item => {
			const ref = currentPlayers.find(p => p.license === item.user.license);
			const serverID = ref?.id ? parseInt(ref.id) : null;
	
			return { 
				...item, serverID,
				status: !ref && item.status !== 'vacation' ? 'offline' : item.status,
				coords: serverID ? GetEntityCoords(GetPlayerPed(serverID)) : null
			};
		});

		emitNet('NewStart_Factions:initial-client', currentID, JSON.stringify({ type: 'main', faction: data.faction, other: { ...info.job, vehicles } }));
		factions[data.faction.key].id = data.faction._id;
		factions[data.faction.key].refPlayers = data.faction.players.map(p => ({ ...p, key: data.faction.key, login: Date.now() }));
		factions[data.faction.key].ranks = data.faction.ranks;

	} else if (info.job?.type === 'mechanical') {
		emitNet('NewStart_Mechanical:handleGeneral-client', currentID, 'active', JSON.stringify({ isIn: info.job.isIn }));
	}

	if (info.job2?.type === 'general') {
		emitNet('NewStart_Jobs:currentUpdate-client', currentID, info.job2);
	}

	emitNet('NewStart_Plain:handleGeneral-client', currentID, 'environment', serverType);
	emitNet('NewStart_Tools:handleGeneral-client', -1, 'disconnect', { type: 'check', info: info.customID });
	if (data.business) emitNet('NewStart_Business:handleGeneral-client', currentID, 'setCommercial', JSON.stringify(data.business));
});