"use strict";
const config = {
    normal: {
        name: 'المواد الغذائية والأدوات',
        business: ['store', 'small-store'],
        coords: [
            { id: 'store_1', x: 162.2901, y: 6640.5361, z: 31.6051 },
            { id: 'store_2', x: 1392.316, y: 3604.562, z: 34.975 },
            { id: 'store_3', x: 1729.8593, y: 6414.7910, z: 35.025 },
            { id: 'store_4', x: 1698.527, y: 4924.457, z: 42.052 },
            { id: 'store_5', x: 1961.6043, y: 3741.4020, z: 32.329 },
            { id: 'store_6', x: 2678.5979, y: 3281.3142, z: 55.228 },
            { id: 'store_7', x: 1166.452, y: 2709.059, z: 38.142 },
            { id: 'store_8', x: 547.1472, y: 2670.5935, z: 42.153 },
            { id: 'store_9', x: -1821.019, y: 792.936, z: 138.112 },
            { id: 'store_10', x: -3040.0483, y: 586.2988, z: 7.897 },
            { id: 'store_11', x: 1802.2550, y: 4505.2353, z: 32.0095, h: 19.8425 },
        ],
        items: [
            { id: 2, price: 100 },
            { id: 29, price: 100 },
            { id: 7, price: 300 },
            { id: 13, price: 300, explain: 'لاستخدامه ضع الوقود بيدك وتوجه لاخزان الوقود للمركبة واضغط حرف E أو ث.' },
            { id: 37, price: 500, explain: 'للاستخدام اذهب امام محرك المركبة وافتح حقيبتك واستخدم عدة التصليح.' },
            { id: 46, price: 5000, explain: 'غير أقفال ممتلكاتك سواء المركبة الخاصة أو المنزل والجراج.' },
            { id: 47, price: 335, explain: 'للاستخدام قف بجانب أي مركبة وافتح الحقيبة وقم باستخدامها.' },
            { id: 33, price: 400, title: 'عدة النفط', explain: 'عدة مخصصة لوظيفة النفط والغاز.' },
            { id: 75, price: 480, explain: 'عدة مخصصة لوظيفة المعادن ولأعمال أخري.' },
            { id: 16, price: 6000, explain: 'عدة مخصصة لوظيفة الشحن الجوي ونقل البضائع.' },
            { id: 12, price: 45, explain: 'عدة مخصصة لوظيفة الزراعة ولأعمال أخري.' },
            { id: 3, price: 315, explain: 'عدة مخصصة لوظيفة الدواجن فقط.' },
            { id: 76, price: 150, explain: 'عدة مخصصة لوظيفة صيد الأسماك.' },
            { id: 96, price: 50, explain: 'مكعب الثلج - أداة مخصصة لعمليات التصنيع.' },
            { id: 97, title: 'البلاستيك', price: 30, explain: 'البلاستيك الخام - أداة مخصصة لعمليات التصنيع.' },
            { id: 99, price: 150, explain: 'الأقمشة - أداة مخصصة لعمليات التصنيع.' },
            { id: 111, price: 1500, explain: 'يمكنك استخدامها لاشعال جميع أنواع السجائر' }
        ]
    },
    bar: {
        name: 'حانة المدينة للمشروبات',
        title: 'ﺕﺎﻧﺎﺤﻟﺍ',
        blip: 93,
        coords: [
            { x: -21.7714, y: 6479.3803, z: 31.4871 },
            { x: 1985.0637, y: 3051.8505, z: 47.2080, h: 59.5275 }
        ],
        items: [
            { id: 2, title: 'مياه', price: 150 },
            { id: 29, price: 150 },
            { id: 7, price: 350 },
            { id: 42, title: 'حشيش', price: 500, explain: 'للإضفاء استخدم علامة السيجارة فى F5 أو انتظر دقيقة ونصف للإطفاء التلقائي.' },
            { id: 111, price: 1500, explain: 'يمكنك استخدامها لاشعال جميع أنواع السجائر' },
            { id: 41, title: 'ويسكي', price: 1000, explain: 'ينتهي تأثير شرب الويسكي بعد 5 دقائق تلقائيا.' },
        ]
    },
    weapons: {
        name: 'متجر الأسلحة النارية',
        title: 'ﺔﺤﻠﺳﻻﺍ ﺮﺠﺘﻣ',
        blip: 110,
        coords: [
            { x: -328.4967, y: 6080.7822, z: 31.4534, h: 320.3149 },
            { x: 1695.5736, y: 3756.9362, z: 34.6885, h: 320.3149 },
            { x: -3169.0681, y: 1085.6702, z: 20.8381, h: 340.1574 },
        ],
        items: [
            { id: 113, price: 1000, explain: 'يستخدم من الحقيبة لإضافته لقائمة الأسلحة ويجب استخدامه في نفس الوقت' },
            { id: 32, price: 10000 },
            { id: 110, price: 350, explain: 'تستخدم لمهام خاصة جدا ومهمة!' },
            { id: 13, price: 300, explain: 'يستخدم من الحقيبة لإضافته لقائمة الأسلحة ويجب استخدامه في نفس الوقت' },
            { id: 26, title: 'رصاص خفيف', price: 4000, explain: 'استخدمها لإضافة رصاص لاسلحتك الخفيفة الحالية' },
            { id: 25, title: 'رصاص ثقيل', price: 10100, explain: 'استخدمها لإضافة رصاص لاسلحتك الثقيلة الحالية' },
            { id: 95, price: 1500, explain: 'أداة مخصصة لعمليات التصنيع.' },
            { id: 21, price: 2550 },
            { id: 115, price: 10000, explain: 'يجب وصول مستواك إلى 10 لإمكانية الشراء.' },
            { id: 6, title: 'مسدس', price: 15000, explain: 'يجب وصول مستواك إلى 15 لإمكانية الشراء.' },
            { id: 112, title: 'كلاسيك', price: 21000, explain: 'يجب وصول مستواك إلى 20 لإمكانية الشراء.' },
            { id: 92, title: 'درع 25%', price: 2000, explain: 'يملئ الدرع الخاص بك ل25% فقط' },
            { id: 93, title: 'درع 50%', price: 5000, explain: 'يملئ الدرع الخاص بك ل50% فقط' },
            { id: 100, price: 800, explain: 'البارود - أداة مخصصة لعمليات التصنيع' },
            { id: 19, price: 750 },
            { id: 114, price: 100, explain: 'يستخدم من الحقيبة لإضافته لقائمة الأسلحة ويجب استخدامه في نفس الوقت' },
        ]
    },
    blackMarket: {
        name: 'السوق السوداء (غير شرعي)',
        title: 'ﺀﺍﺩﻮﺴﻟﺍ ﻕﻮﺴﻟﺍ',
        removeOwner: true,
        blip: 310,
        coords: [
            { x: -1114.8395, y: 2696.8088, z: 18.5465, h: 320.3149, bot: [-1112.8758, 2698.7954, 17.5647, 130], isCreateBot: false },
        ],
        items: [
            { id: 4, price: 30000 },
            { id: 121, price: 1000 },
            { id: 18, price: 5000 },
            { id: 105, price: 5000 },
            { id: 11, price: 30000 },
            { id: 15, price: 8000 },
            { id: 14, price: 25000 },
            { id: 20, price: 50000 },
            { id: 116, price: 75000 },
            { id: 117, price: 65000 },
            { id: 118, price: 80000 },
            { id: 119, price: 4500 },
            { id: 109, price: 10000 },
            { id: 120, price: 2500, explain: 'أداة أساسية مهمة للسرقات مثل سرقة البنوك' }
        ]
    },
    mechanical: {
        name: 'متجر أدوات الميكانيكي',
        title: 'ﻲﻜﻴﻧﺎﻜﻴﻤﻟﺍ ﺕﺍﻭﺩﺃ',
        blip: 446,
        removeOwner: true,
        coords: [
            { x: -3371.0241, y: 2609.6572, z: 9.2453 }
        ],
        items: [
            { id: 70, price: 15000 },
            { id: 71, price: 20000 },
            { id: 72, price: 30000 },
            { id: 73, price: 40000 },
            { id: 74, price: 50000 },
            { id: 50, price: 15000 },
            { id: 51, price: 25000 },
            { id: 52, price: 38000 },
            { id: 53, price: 60000 },
            { id: 48, title: "نوع المكابح", price: 30000 },
            { id: 49, price: 10000 },
            { id: 54, title: "تغيير العادم", price: 10000 },
            { id: 55, title: "الصدام الأمامي", price: 10000 },
            { id: 56, title: "الشبك الأمامي", price: 10000 },
            { id: 57, title: "غطاء المحرك", price: 10000 },
            { id: 58, price: 10000 },
            { id: 59, title: "الصدام الخلفي", price: 10000 },
            { id: 60, title: "تركيب النيون", price: 15000 },
            { id: 61, title: "القفص الداخلي", price: 10000 },
            { id: 62, price: 10000 },
            { id: 63, title: "الدواسة الجانبية", price: 10000 },
            { id: 64, price: 10000 },
            { id: 65, price: 10000 },
            { id: 66, title: "تظليل نوافذ", price: 10000 },
            { id: 67, title: "نظام ناقل الحركة", price: 20000 },
            { id: 68, price: 25000 },
            { id: 69, price: 15000 },
        ]
    },
    pharmacy: {
        name: 'صيدلية مدينة بوليتو',
        title: 'ﺔﻴﻟﺪﻴﺻ',
        blip: 51,
        coords: [
            { x: -176.3208, y: 6383.5385, z: 31.4871, h: 42.5196 }
        ],
        items: [
            { id: 8, price: 500, explain: 'تقوم بتعبئة صحتك بنسبة تصل إلى 75% كاملة' },
            { id: 9, price: 500, explain: 'حقيبة مخصصة للمختصين في مجال الطب فقط' },
            { id: 98, price: 1000, explain: 'كيس الدم - أداة مخصصة لعمليات التصنيع.' },
            { id: 103, price: 50, explain: 'المواد الكيميائية - أداة مخصصة لعمليات التصنيع.' },
            { id: 101, price: 250, explain: 'الكحول الإيثيلي - أداة مخصصة لعمليات التصنيع.' },
            { id: 5, price: 500, explain: 'لعلاج تأثيرات تناول المواد المخدرة والكحول' }
        ]
    },
    teboos: {
        name: 'متجر أدوات الممنوعات',
        removeOwner: true,
        items: [
            { id: 107, title: 'أدوات الغوص', price: 2500, explain: 'ملابس وأدوات مهمة لبدء عملية جلب صناديق النباتات' },
            { id: 108, title: 'ملابسك', price: 1500, explain: 'استخدمها لاستراجع ملابسك الأصلية عند ارتداء ملابس مؤقتة مثل ملابس الغوص' },
            { id: 19, price: 1000 },
            { id: 8, price: 950, explain: 'تقوم بتعبئة صحتك بنسبة تصل إلى 75% كاملة' },
            { id: 103, price: 100, explain: 'المواد الكيميائية - أداة مخصصة لعمليات التصنيع.' },
            { id: 97, title: 'البلاستيك', price: 60, explain: 'البلاستيك الخام - أداة مخصصة لعمليات التصنيع.' },
            { id: 2, price: 300 },
            { id: 29, price: 300 },
            { id: 26, title: 'رصاص خفيف', price: 11000, explain: 'استخدمها لإضافة رصاص لاسلحتك الخفيفة الحالية' }
        ]
    }
};
const state = {
    coords: [],
    isOpen: false,
    runClose: false,
    currentShop: ''
};
const empty = null;
on('onClientGameTypeStart', () => {
    for (let key in config) {
        const ref = config[key];
        if (!ref.blip)
            continue;
        for (let coords of ref.coords) {
            const blip = AddBlipForCoord(coords.x, coords.y, coords.z);
            SetBlipSprite(blip, ref.blip);
            SetBlipAsShortRange(blip, true);
            BeginTextCommandSetBlipName("STRING");
            AddTextComponentString(`<font face="A9eelsh">${ref.title}</font>`);
            EndTextCommandSetBlipName(blip);
            if (key === 'blackMarket')
                SetBlipColour(blip, 6);
        }
    }
});
setTick(() => {
    const pedID = PlayerPedId();
    state.coords = GetEntityCoords(pedID, true);
    let currentMarker = null;
    for (let key in config) {
        const color = key === 'blackMarket' ? [146, 46, 39, 255] : [22, 24, 29, 255];
        if (!config[key].coords)
            continue;
        for (let coords of config[key].coords) {
            const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], coords.x, coords.y, coords.z, true);
            if (distance < 20) {
                DrawMarker(1, coords.x, coords.y, coords.z - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.0, 1.0, 0.25, ...color, false, false, 2, false, empty, empty, false);
                currentMarker = { id: coords.id, key, distance };
                break;
            }
        }
        if (currentMarker)
            break;
    }
    if (currentMarker && currentMarker.distance < 0.6 &&
        !IsEntityDead(pedID) &&
        !IsPauseMenuActive()) {
        if (IsControlJustPressed(0, 38)) {
            if (currentMarker.id) {
                const places = exports.NewStart_Robbery.method('places', 'store');
                if (places.some((p) => p.id === currentMarker?.id && p.alert?.id)) {
                    return exports.NewStart_Notifications.showAttention('error', 'المتجر مغلق حاليا بسبب عملية السرقة!');
                }
            }
            else if (currentMarker.key === 'mechanical') {
                if (exports.NewStart_Tools.method('getInfo').seaPortClosed) {
                    return exports.NewStart_Notifications.showAttention('error', 'الميناء البحري مغلق يمكنك العودة عند السابعة صباحًا!');
                }
                else if (!exports.NewStart_Mechanical.method('info', 'isActive')) {
                    return exports.NewStart_Notifications.showAttention('error', 'يجب أن يكون لديك رخصة الميكانيكي للإطلاع على هذا!');
                }
            }
            openUI(currentMarker.key);
        }
        else if (!state.isOpen && !state.runClose) {
            SendNUIMessage({ type: 'entranceOpen', key: currentMarker.key });
        }
        state.runClose = true;
    }
    else if (state.runClose) {
        closeUI(true);
    }
});
setTimeout(() => {
    const createBotsID = setTick(async () => {
        if (config.blackMarket.coords.every(i => i.isCreateBot))
            clearTick(createBotsID);
        for (let item of config.blackMarket.coords) {
            const distance = GetDistanceBetweenCoords(state.coords[0], state.coords[1], state.coords[2], item.x, item.y, item.z, true);
            if (distance < 30 && !item.isCreateBot) {
                item.isCreateBot = true;
                setTimeout(() => {
                    const pedID = CreatePed(1, -1275859404, item.bot[0], item.bot[1], item.bot[2], item.bot[3], false, false);
                    GiveWeaponToPed(pedID, -1075685676, 1000, false, true);
                    SetCurrentPedWeapon(pedID, -1075685676, true);
                    FreezeEntityPosition(pedID, true);
                    SetBlockingOfNonTemporaryEvents(pedID, true);
                    SetEntityInvincible(pedID, true);
                    TaskPlayAnim(pedID, 'amb@world_human_stand_guard@male@base', 'base', 8.0, 1.0, -1, 1, 1.0, false, false, false);
                }, 5000);
            }
        }
    });
}, 5000);
RegisterNuiCallbackType('NUI:payment');
on('__cfx_nui:NUI:payment', (data, cb) => {
    const currentKG = exports.NewStart_Inventory.info('currentKG');
    const maxKG = exports.NewStart_Inventory.info('maxKG');
    const staticItems = exports.NewStart_Inventory.staticData();
    const space = data.reduce((total, item) => total + (staticItems.find((i) => i.id === item.id).space * item.count), 0);
    if ((space + currentKG) >= maxKG) {
        exports.NewStart_Notifications.showAttention('error', 'الحقيبة ممتلئ لا يمكن وضع عناصر بها أكثر من ذلك!');
        closeUI(true);
        return cb('OK!');
    }
    const price = data.reduce((total, obj) => total + (config[state.currentShop].items.find((item) => item.id === obj.id).price * obj.count), 0);
    if (state.currentShop === 'blackMarket') {
        const moneyRed = exports.NewStart_Inventory.info('currentItems').find((i) => i.id === 106)?.count;
        if (moneyRed < price || !moneyRed) {
            exports.NewStart_Notifications.showAttention('error', 'للأسف لا تملك الأموال الغير شرعية الكافية للشراء!');
            closeUI(true);
            return cb('OK!');
        }
        else {
            exports.NewStart_Inventory.removeItem(JSON.stringify({ id: 106, count: price }));
        }
    }
    else {
        const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
        const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
        const info = { name: 'البقالة', price, from: 'cash' };
        const withBank = ['mechanical'];
        if (cash >= price) {
            StatSetInt('MP0_WALLET_BALANCE', cash - price, false);
            exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -price }));
        }
        else if (bank >= price && withBank.includes(state.currentShop)) {
            StatSetInt('BANK_BALANCE', bank - price, false);
            info.from = 'bank';
        }
        else {
            exports.NewStart_Notifications.showAttention('error', withBank.includes(state.currentShop) ? 'للأسف لا تملك المال الكافي في حسابك البنكي أو الحقيبة!' : 'للأسف لا تملك المال الكافي في الحقيبة!');
            closeUI(true);
            return cb('OK!');
        }
        emitNet('NewStart:moneyDecrease', info);
    }
    const level = exports.NewStart_MainMenu.getLevel();
    for (let index in data) {
        const find = config[state.currentShop].items.find((i) => i.id === data[index].id);
        if (find && level >= (find.level || 0)) {
            exports.NewStart_Inventory.addItem(JSON.stringify(data[index]));
        }
        else
            return;
    }
    exports.NewStart_Notifications.showAttention('success', 'لقد قمت للتو بدفع بعض المال.');
    closeUI(true);
    cb('success');
});
RegisterNuiCallbackType('NUI:closeUI');
on('__cfx_nui:NUI:closeUI', (_, cb) => { closeUI(false); cb('OK!'); });
exports('method', (type, data) => {
    if (type === 'openUI') {
        openUI(data);
    }
    else if (type === 'isOpen') {
        return state.isOpen;
    }
    else if (state.isOpen) {
        closeUI(true);
    }
    else if (type === 'runClose') {
        return state.runClose;
    }
    else if (type === 'getItems') {
        return config[data].items;
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
function openUI(key) {
    SendNUIMessage({ type: 'open', storeKey: key, info: getInfo(key) });
    SetNuiFocus(true, true);
    state.isOpen = true;
    state.currentShop = key;
    setTimeout(() => {
        exports.NewStart_HudSystem.closeUI();
        exports.NewStart_MainMenu.toggleAds(false);
    }, 0);
    DisplayRadar(false);
}
function getInfo(key) {
    let data = exports.NewStart_Inventory.staticData().filter((obj) => config[key].items.find((item) => item.id === obj.id));
    data = data.map((obj) => {
        const find = config[key].items.find((item) => item.id === obj.id);
        return {
            ...obj, count: 0, title: find.title || obj.title, ...find,
            level: obj.level ? exports.NewStart_MainMenu.getLevel() < obj.level ? obj.level : null : null
        };
    });
    data = data.sort((a, b) => {
        return config[key].items.findIndex((p) => p.id === a.id) - config[key].items.findIndex((p) => p.id === b.id);
    });
    return {
        removeOwner: config[key].removeOwner,
        current: exports.NewStart_Inventory.info('currentKG'),
        max: exports.NewStart_Inventory.info('maxKG'), items: data,
        title: config[key].name
    };
}
function closeUI(isNUI) {
    if (state.isOpen) {
        if (!exports.NewStart_MainMenu.isOpen()) {
            DisplayRadar(true);
            exports.NewStart_HudSystem.openHud();
            exports.NewStart_MainMenu.toggleAds(true);
        }
        state.isOpen = false;
        SetNuiFocus(false, false);
    }
    if (isNUI)
        SendNUIMessage({ type: 'closeUI' });
    state.runClose = false;
}
