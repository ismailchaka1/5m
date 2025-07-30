"use strict";
const state = {
    isOpen: false,
    runClose: false,
    coords: { x: 2329.8657, y: 2571.5688, z: 45.6786, h: -20 },
    isInitial: true,
    reshape: []
};
state.reshape = [
    {
        id: 105,
        give: 1,
        price: { type: 'taboo', value: 1500 },
        isImageSmall: true,
        explain: 'انتبه من الساطور، الضربة منه تعني النهاية',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 87, count: 5, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 97, count: 3, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 18,
        give: 1,
        price: { type: 'taboo', value: 1000 },
        isImageSmall: true,
        explain: 'تبدو كأي أداة عادية! ولكن جربها بنفسك وستبهرك النتيجة',
        items: [
            { id: 86, count: 5, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 10, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 97, count: 10, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 4,
        give: 1,
        price: { type: 'taboo', value: 15000 },
        explain: 'مسدس صاعق طلقة واحدة منه تشل الضحية عن الحركة لفترة من الوقت ولكن احذر من استخدامه مرات عدة',
        items: [
            { id: 85, count: 1, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 86, count: 5, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 10, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 88, count: 5, explain: 'النحاس يمكن الحصول عليه من وظيفة المعادن' },
            { id: 97, count: 15, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 11,
        give: 1,
        price: { type: 'taboo', value: 5000 },
        explain: 'مسدس الشعلة يمكنك استخدامها في الفعاليات المتنوعة والاحتفال به في كافة التجمعات',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 86, count: 5, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 100, count: 15, explain: 'البارود يمكن الحصول عليه من متجر الأسلحة' }
        ]
    },
    {
        id: 15,
        give: 1,
        price: { type: 'taboo', value: 1500 },
        isImageSmall: true,
        explain: 'انتبه من الفأس، الضربة منه تعني النهاية',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 87, count: 5, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 88, count: 15, explain: 'النحاس يمكن الحصول عليه من وظيفة المعادن' },
            { id: 97, count: 10, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 14,
        give: 1,
        price: { type: 'taboo', value: 10000 },
        explain: 'لديه طلقات سريعة جداً وسيبهرك حقاً، صديق جيد للمراوغة في المعارك التي تحتاج لهروب سريع',
        items: [
            { id: 95, count: 2, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 85, count: 3, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 86, count: 15, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 20, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 97, count: 5, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 8,
        give: 1,
        explain: 'هذه الجرعة تساعد علي استعادة صحتك المفقودة علي الفور ولا تحتاج لأي خبرة مسبقة لاستخدامها',
        items: [
            { id: 98, count: 1, explain: 'أكياس الدم يمكن الحصول عليها من الصيدلية' },
            { id: 97, count: 2, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 9,
        give: 1,
        explain: 'حقيبة احترافية للتعامل مع الحالات الحرجة .. لا يمكن استخدامها إلا من قبل الخبراء المختصين في مجال الطب فقط',
        items: [
            { id: 101, count: 1, explain: 'الكحول يمكن الحصول عليه من الصيدلية' },
            { id: 99, count: 1, explain: 'الأقمشة يمكن الحصول عليها من المتجر' }
        ]
    },
    {
        id: 11,
        give: 1,
        price: { type: 'normal', value: 20000 },
        explain: 'مسدس يطق طلقات مشتعله يمكن استخدامها لمساعدة الطيارين علي تحديد الموقع والهبوط بسلام او حتي اسخدامها في الاحتفالات',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 84, count: 1, explain: 'البلاتينيوم معدن نادر يمكن الحصول عليه من وظيفة المعادن' },
            { id: 85, count: 1, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
        ]
    },
    {
        id: 15,
        give: 1,
        price: { type: 'normal', value: 5000 },
        explain: 'مسدس غير تقليدي لديه اختلافات جذرية عن أي نظير له .. رفيق جيد في أي معركة قتالية',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 86, count: 1, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 1, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 20,
        price: { type: 'taboo', value: 20000 },
        isImageSmall: true,
        give: 1,
        explain: 'بندقية قريبة المدي ستسحق أي شئ أمامها .. مفيدة للدفاع عن النفس ولحماية ممتلكاتك الخاصة',
        items: [
            { id: 95, count: 5, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 84, count: 1, explain: 'البلاتينيوم معدن نادر يمكن الحصول عليه من وظيفة المعادن' },
            { id: 85, count: 3, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 86, count: 20, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 20, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 116,
        price: { type: 'taboo', value: 35000 },
        give: 1,
        isImageSmall: true,
        explain: 'بندقية للمعارك القوية قريبة المدي ولكن ستسحق أي شئ أمامها وأي عدو لك ومهما كان',
        items: [
            { id: 95, count: 5, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 84, count: 2, explain: 'البلاتينيوم معدن نادر يمكن الحصول عليه من وظيفة المعادن' },
            { id: 85, count: 4, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 86, count: 25, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 25, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 117,
        price: { type: 'taboo', value: 20000 },
        give: 1,
        isImageSmall: true,
        explain: 'اسم معروف في عالم الأسلحة النارية لا يحتاج للحديث عنه أفضل رفيق للعمليات السريعة والهروب',
        items: [
            { id: 95, count: 5, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 84, count: 3, explain: 'البلاتينيوم معدن نادر يمكن الحصول عليه من وظيفة المعادن' },
            { id: 85, count: 4, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 86, count: 30, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 25, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 118,
        price: { type: 'taboo', value: 35000 },
        give: 1,
        isImageSmall: true,
        explain: 'لا تهتم بالشكل بمجرد أن تبدأ المعركة سينشر وابل من الرصاص سيسحق جميع أعداءك',
        items: [
            { id: 95, count: 5, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 84, count: 4, explain: 'البلاتينيوم معدن نادر يمكن الحصول عليه من وظيفة المعادن' },
            { id: 85, count: 5, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 86, count: 25, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 25, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 119,
        price: { type: 'taboo', value: 500 },
        give: 1,
        isImageSmall: true,
        explain: 'خنجر فاخر مصنوع بعناية فائقة، جيد للتباهي وفعّال جدا واحتفظ به ستحتاجه دائمًا وفي أي وقت',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 87, count: 6, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 120,
        give: 1,
        isImageSmall: true,
        explain: 'أداة جيدة حقاً لمعارك الشوارع وفعّالة سيكون من الجيد الاحتفاظ بها في الحقيبة دائمًا',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 86, count: 1, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
        ]
    },
    {
        id: 22,
        give: 1,
        explain: 'برغم من صعوبة إنتاجها ولكنها المادة الأغلي على الإطلاق ويمكنك استخدامها أو بيعها للحصول علي الأموال غير الشرعية',
        items: [
            { id: 102, count: 1, explain: 'نبات الكوكا، اتبع إرشادات رجل العصابات الخاص بالممنوعات' },
            { id: 104, count: 1, explain: 'نبات الأفيون، اتبع إرشادات رجل العصابات الخاص بالممنوعات' },
            { id: 103, count: 4, explain: 'المواد الكيميائية يمكن الحصول عليها من الصيدلية' },
            { id: 97, count: 3, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 24,
        give: 1,
        explain: 'عقد مبهر وغالي الثمن مطلوب لإتمام أي زواج أو قم بإهدائها إلى حبيبتك .. تحب بعض النساء هذا النوع من الهدايا لا تكن بخيلا',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 82, count: 2, explain: 'الألماس يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 25,
        give: 1,
        explain: 'رصاص مخصص للأسلحة بعيدة المدي والعنيفة فقط ولكن كن حذر من استخدامك لها',
        items: [
            { id: 85, count: 1, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 86, count: 5, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 88, count: 5, explain: 'النحاس يمكن الحصول عليه من وظيفة المعادن' },
            { id: 100, count: 4, explain: 'البارود يمكن الحصول عليه من متجر الأسلحة' }
        ]
    },
    {
        id: 26,
        give: 1,
        explain: 'رصاص مخصص للأسلحة قريبة المدي ومتوسطة المدي وتعتبر من الأنواع الأكثر انتشاراً هنا',
        items: [
            { id: 87, count: 10, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 88, count: 4, explain: 'النحاس يمكن الحصول عليه من وظيفة المعادن' },
            { id: 100, count: 2, explain: 'البارود يمكن الحصول عليه من متجر الأسلحة' }
        ]
    },
    {
        id: 31,
        give: 1,
        price: { type: 'taboo', value: 5000 },
        resize: true,
        explain: 'قد يبدو لك إنه كأي جهاز عادي وينتمي للجانب الأخر ولكنه في حقيقة الأمر يستخدم في عمليات السرقة',
        items: [
            { id: 32, count: 1, explain: 'الراديو اللاسلكي يمكن الحصول متجر الأسلحة القانونية' },
            { id: 88, count: 10, explain: 'النحاس يمكن الحصول عليه من وظيفة المعادن' }
        ]
    },
    {
        id: 37,
        give: 1,
        explain: 'عدة تقوم بإصلاح أي مركبة ومهما كان نوعها وقد يتم اسخدامها لأغراض أخرى غير ذلك ولكن غير معلنة حالياً',
        items: [
            { id: 87, count: 5, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
        ]
    },
    {
        id: 41,
        give: 1,
        explain: 'مشروب كحولي يدخلك في حالة من السكر لفترة من الوقت ومهم جداً لبدء أي عملية سرقة أو سطو',
        items: [
            { id: 101, count: 1, explain: 'الكحول يمكن الحصول عليه من الصيدلية' },
            { id: 96, count: 2, explain: 'مكعب الثلج يمكن الحصول عليه من المتجر' },
            { id: 40, count: 1, explain: 'صندوق الفاكهة يمكن الحصول عليه من وظيفة الزراعة' },
            { id: 97, count: 1, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 43,
        give: 1,
        explain: 'الكوكايين من ضمن أغلي المواد المخدرة يمكنك استخدامها أو بيعها للحصول علي الأموال غير الشرعية',
        items: [
            { id: 102, count: 1, explain: 'نبات الكوكا، اتبع إرشادات رجل العصابات الخاص بالممنوعات' },
            { id: 103, count: 1, explain: 'المواد الكيميائية يمكن الحصول عليها من الصيدلية' },
            { id: 97, count: 1, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 46,
        give: 1,
        explain: 'أحيانا قد تكون مفاتيح ممتلكاتك مع أشخاص آخرين ولكن مع هذه الأداة يمكنك تغيير قفل أي مركبة أو عقار',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 86, count: 5, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 10, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 97, count: 20, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 47,
        give: 1,
        explain: 'أدوات تنظيفة لجميع المركبات .. قم بتنظيف المركبات من أي أوساخ موجودة بها من خارجها',
        items: [
            { id: 99, count: 1, explain: 'الأقمشة يمكن الحصول عليها من المتجر' },
        ]
    },
    {
        id: 91,
        give: 1,
        explain: 'حبوب الأفيون يمكنك استخدامها للاستخدام الشخصي أو بيعها للحصول علي الأموال غير الشرعية',
        items: [
            { id: 104, count: 1, explain: 'نبات الأفيون، اتبع إرشادات رجل العصابات الخاص بالممنوعات' },
            { id: 103, count: 2, explain: 'المواد الكيميائية يمكن الحصول عليها من الصيدلية' },
            { id: 97, count: 2, explain: 'البلاستيك الخام يمكن الحصول عليه من المتجر' }
        ]
    },
    {
        id: 93,
        give: 1,
        explain: 'درع واقي من الرصاص يقوم بتعبئة درعك بنسة 50% كاملة .. ننصح بهذه الدروع في حالة دخولك لمعارك قتالية طويلة',
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 86, count: 3, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 99, count: 3, explain: 'الأقمشة يمكن الحصول عليها من المتجر' },
        ]
    },
    {
        id: 94,
        give: 1,
        explain: 'درع واقي من الرصاص يقوم بتعبئة درعك بنسة 100% كاملة .. ننصح بهذه الدروع في حالة دخولك لمعارك قتالية طويلة',
        resize: true,
        items: [
            { id: 95, count: 2, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 86, count: 3, explain: 'الألومنيوم يمكن الحصول عليه من وظيفة المعادن' },
            { id: 87, count: 10, explain: 'الحديد يمكن الحصول عليه من وظيفة المعادن' },
            { id: 99, count: 5, explain: 'الأقمشة يمكن الحصول عليها من المتجر' },
        ]
    },
    {
        id: 109,
        give: 1,
        price: { type: 'taboo', value: 2000 },
        explain: 'أداة مخصصة للسرقات وتستخدم لتفجير الأبوب المصفحة مثل أبواب الخزنة الخاصة بالبنوك',
        resize: true,
        items: [
            { id: 95, count: 1, explain: 'الأداة الأساسية لبدء عملية التصنيع' },
            { id: 85, count: 1, explain: 'الفولاذ يمكن الحصول عليه من وظيفة المعادن' },
            { id: 88, count: 4, explain: 'النحاس يمكن الحصول عليه من وظيفة المعادن' },
            { id: 100, count: 2, explain: 'البارود يمكن الحصول عليه من متجر الأسلحة' }
        ]
    }
];
on('onClientGameTypeStart', () => {
    const blip = AddBlipForCoord(state.coords.x, state.coords.y, state.coords.z);
    SetBlipSprite(blip, 643);
    SetBlipAsShortRange(blip, true);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(`<font face="A9eelsh">ﺕﺍﻭﺩﻷﺍ ﺔﻋﺎﻨﺻ</font>`);
    EndTextCommandSetBlipName(blip);
});
setTick(() => {
    const pedID = PlayerPedId();
    const coord = GetEntityCoords(pedID, true);
    const distance = GetDistanceBetweenCoords(coord[0], coord[1], coord[2], state.coords.x, state.coords.y, state.coords.z, true);
    if (distance < 2.5 &&
        !IsPauseMenuActive() &&
        !IsPedInAnyVehicle(pedID, false) &&
        !IsEntityDead(pedID)) {
        if (IsControlJustPressed(0, 38)) {
            exports.NewStart_HudSystem.closeUI();
            exports.NewStart_Phone.noticesToggle(true);
            exports.NewStart_MainMenu.toggleAds(false);
            DisplayRadar(false);
            const staticItems = exports.NewStart_Inventory.staticData();
            SendNUIMessage(JSON.stringify({
                type: 'openUI',
                staticItems: state.isInitial ? staticItems : null,
                level: exports.NewStart_MainMenu.getLevel(),
                current: exports.NewStart_Inventory.info('currentItems'),
                reshape: state.isInitial ? state.reshape.map(i => ({ ...i, level: i.level || (staticItems.find((s) => s.id === i.id).level || 0) })) : null
            }));
            SetNuiFocus(true, true);
            state.isOpen = true;
            state.isInitial = false;
        }
        else if (!state.isOpen && !state.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
        }
        state.runClose = true;
    }
    else if (state.runClose) {
        closeUI(true);
    }
});
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    switch (data.type) {
        case 'manufacturing':
            const level = exports.NewStart_MainMenu.method('validLevel', 'industry');
            if (!level.isCan) {
                return cb({ text: `تحتاج للوصول للمستوى ${level.need} أولاً قبل البدء!` });
            }
            const find = state.reshape.find(r => r.id === data.itemID);
            if (find) {
                const inventory = exports.NewStart_Inventory.info('currentItems');
                const noComplete = find.items.some(obj => !inventory.some((i) => i.id === obj.id && i.count >= obj.count));
                if (noComplete || find.level > exports.NewStart_MainMenu.getLevel()) {
                    return cb('OK!');
                }
                else {
                    const staticItems = exports.NewStart_Inventory.staticData();
                    const maxKG = exports.NewStart_Inventory.info('maxKG');
                    const giveKG = staticItems.find((obj) => obj.id === find.id).space * find.give;
                    const requireKG = find.items.map(i => {
                        const item = staticItems.find((obj) => obj.id === i.id);
                        return item.space * i.count;
                    }).reduce((total, num) => total + num, 0);
                    const sum = (exports.NewStart_Inventory.info('currentKG') + giveKG) - requireKG;
                    if (sum > maxKG)
                        return cb({ text: `يجب التخلص من ${(sum - maxKG).toFixed(2)} كجم من حقيبتك.` });
                }
                if (find.price?.type === 'normal') {
                    const [, cash] = StatGetInt(GetHashKey('MP0_WALLET_BALANCE'), -1);
                    const [, bank] = StatGetInt(GetHashKey('BANK_BALANCE'), -1);
                    const info = { name: 'تصنيع الأدوات', price: find.price.value, from: 'cash' };
                    if (cash >= info.price) {
                        StatSetInt('MP0_WALLET_BALANCE', cash - info.price, false);
                        exports.NewStart_Inventory.addItem(JSON.stringify({ id: 1, count: -info.price }));
                    }
                    else if (bank >= info.price) {
                        StatSetInt('BANK_BALANCE', bank - info.price, false);
                        info.from = 'bank';
                    }
                    else {
                        return cb({ text: 'للأسف لا تملك المال الكافي!' });
                    }
                    emitNet('NewStart:moneyDecrease', info);
                }
                else if (find.price?.type === 'taboo') {
                    const taboo = inventory.find((obj) => obj.id === 106);
                    if (!taboo || taboo.count < find.price.value) {
                        return cb({ text: 'للأسف لا تملك أموال غير شرعية كافية!' });
                    }
                    exports.NewStart_Inventory.removeItem(JSON.stringify({ id: 106, count: find.price.value }));
                }
                PlaySoundFrontend(-1, "PICK_UP", "HUD_FRONTEND_DEFAULT_SOUNDSET", false);
                for (let item of find.items) {
                    exports.NewStart_Inventory.removeItem(JSON.stringify({ id: item.id, count: item.count }));
                }
                exports.NewStart_Inventory.addItem(JSON.stringify({ id: find.id, count: find.give }));
                exports.NewStart_MainMenu.levelUp(10);
                SendNUIMessage(JSON.stringify({
                    type: 'reset',
                    current: exports.NewStart_Inventory.info('currentItems'),
                    level: exports.NewStart_MainMenu.getLevel()
                }));
            }
            break;
        default:
            closeUI(false);
            break;
    }
    cb('OK!');
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
(async function createEmployee() {
    const pedModel = GetHashKey('s_m_y_armymech_01');
    RequestModel(pedModel);
    while (!HasModelLoaded(pedModel))
        await Delay(1000);
    const pedID = CreatePed(1, pedModel, state.coords.x, state.coords.y, state.coords.z, state.coords.h, false, false);
    FreezeEntityPosition(pedID, true);
    SetBlockingOfNonTemporaryEvents(pedID, true);
    SetEntityInvincible(pedID, true);
    TaskPlayAnim(pedID, 'amb@world_human_stand_guard@male@base', 'base', 8.0, 1.0, -1, 1, 1.0, false, false, false);
})();
function closeUI(isNUI) {
    if (state.isOpen) {
        exports.NewStart_Phone.noticesToggle(false);
        if (!exports.NewStart_MainMenu.isOpen()) {
            DisplayRadar(true);
            exports.NewStart_HudSystem.openHud();
            exports.NewStart_MainMenu.toggleAds(true);
        }
        state.isOpen = false;
        SetNuiFocus(false, false);
    }
    if (isNUI)
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    state.runClose = false;
}
exports('methods', (type, data) => {
    if (type === 'currentUpdate') {
        SendNUIMessage(JSON.stringify({ type: 'reset', current: data }));
    }
});
