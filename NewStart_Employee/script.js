"use strict";
const config = {
    police: {
        nameAr: 'الأمن العام',
        starting: {
            blip: 525,
            name: '<font face="A9eelsh">ﺔﻣﺪﺨﻟﺍ ﺀﺪﺑ</font>',
            coords: [
                [-444.5010, 6018.0791, 36.9802, 138.8976],
                [1849.4901, 3695.1560, 34.2674, 119.0551]
            ]
        },
        garages: {
            name: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺝﺍﺮﺟ</font>',
            coords: [
                {
                    blipName: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺏﺭﺍﻮﻗ</font>',
                    blipID: 427,
                    name: 'paleto',
                    isBoatOnly: true,
                    preview: {
                        location: [-121.0417, 6742.9052, 0.5580, 99.2125],
                        camera: { posX: -127.9549, posY: 6743.0562, posZ: 3.3680, rotX: -10.00, rotY: 0.00, rotZ: 0.6062, fov: 65 }
                    },
                    spawn: [-151.3977, 6747.3364, 0.6688, 90.7086],
                    pedPreview: [-129.4549, 6749.1562, 0.7868, 99.2125]
                },
                {
                    name: 'paleto',
                    preview: {
                        location: [-482.7692, 5996.1889, 30.6109, 317.4803],
                        camera: { posX: -485.3143 - 0.4, posY: 5998.9580 - 0.5, posZ: 31.3018 + 1, rotX: -10.00, rotY: 0.00, rotZ: 229.6062, fov: 65 }
                    },
                    spawn: [-475.2922, 5988.6196, 30.6109, 317.4803],
                    plane: [-475.2922, 5988.6196, 30.6109, 317.4803],
                    pedPreview: [-484.3780, 5997.7451, 31.3018, 229.6062]
                },
                {
                    name: 'sandy',
                    preview: {
                        location: [1864.0615, 3700.5363, 32.8520, 209.7637],
                        camera: { posX: 1867.1208 + 1, posY: 3700.8923 + 0.8, posZ: 33.4417 + 1, rotX: -15, rotY: 0, rotZ: 100, fov: 65 }
                    },
                    spawn: [1869.4813, 3694.5231, 32.8688, 209.7637],
                    plane: [1864.5626, 3646.6418, 35.7502, 31.1811],
                    pedPreview: [1866.8, 3700.8923, 33.4417, 99.2125]
                },
                {
                    blipName: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺏﺭﺍﻮﻗ</font>',
                    blipID: 427,
                    name: 'seaport',
                    isBoatOnly: true,
                    preview: {
                        location: [-3407.5913, 2538.9758, 8.5185, 164.4094],
                        camera: { posX: -3379.5053, posY: 2520.0571, posZ: 3.5650, rotX: -10.00, rotY: 0.00, rotZ: -70.6062, fov: 65 }
                    },
                    spawn: [-3405.6264, 2522.5979, 1.3765, 178.5826],
                    pedPreview: [-3374.5053, 2522.0571, 1.3765, 195.5905]
                },
            ]
        },
        outfits: [
            {
                id: 2,
                name: 'الملابس الرسمية',
                items: {
                    male: { top: 507, undershirt: 15, torso: 11, leg: 7, shoe: 97, hat: 199 },
                    female: { top: 535, undershirt: 15, torso: 9, leg: 133, shoe: 108, hat: 198 },
                },
                textures: { male: { leg: 4 }, female: { leg: 1, shoe: 1 } }
            },
            {
                id: 3,
                name: 'ملابس المحقق - ضباط',
                ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                items: {
                    male: { top: 495, undershirt: 179, torso: 44, leg: 4, shoe: 25, hat: 195 },
                },
                textures: { male: { undershirt: 10, hat: 2 } }
            },
            {
                id: 4,
                name: 'ملابس القوات الخاصة - ضباط',
                ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                items: {
                    male: { mask: 28, top: 305, undershirt: 68, armor: 27, torso: 174, leg: 137, shoe: 25, hat: 117, glass: 24 },
                    female: { mask: 28, top: 46, undershirt: 65, armor: 60, torso: 215, leg: 32, shoe: 25, hat: 116, accessory: 6, glass: 26 },
                },
                textures: { male: { top: 1, armor: 1, leg: 1, glass: 2 }, female: { armor: 1, glass: 2 } }
            },
            {
                id: 5,
                name: 'ملابس المرور - ضباط',
                ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                items: {
                    male: { top: 496, undershirt: 141, torso: 4, leg: 7, shoe: 97, accessory: 9 },
                    female: { top: 534, undershirt: 95, torso: 3, leg: 133, shoe: 115, accessory: 8 },
                },
                textures: { male: { top: 3, undershirt: 1, leg: 4 }, female: { undershirt: 1 } }
            },
            {
                id: 6,
                name: 'ملابس المرور - أفراد',
                ranks: [18, 19, 20, 21, 22, 23, 24],
                items: {
                    male: { top: 497, undershirt: 15, armor: 58, torso: 0, leg: 7, shoe: 97, hat: 107 },
                    female: { top: 536, undershirt: 15, armor: 58, torso: 14, leg: 133, shoe: 115, hat: 106 },
                },
                textures: { male: { top: 1, leg: 4, hat: 20 }, female: { top: 2, hat: 20 } }
            },
            {
                id: 8,
                name: 'ملابس المدرب',
                ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                items: {
                    male: { top: 497, undershirt: 15, torso: 171, leg: 130, shoe: 110, hat: 195 },
                    female: { top: 536, undershirt: 15, torso: 223, leg: 32, shoe: 114, hat: 196 },
                },
                textures: { male: { leg: 1, hat: 2 }, female: { hat: 1 } }
            },
            {
                id: 9,
                name: 'ملابس التدريب',
                items: {
                    male: { top: 497, undershirt: 15, torso: 0, leg: 126, shoe: 12, hat: 107 },
                    female: { top: 536, undershirt: 15, torso: 14, leg: 135, shoe: 115, hat: 106 },
                },
                textures: { male: { top: 4, shoe: 6, hat: 22 }, female: { top: 4, hat: 22 } }
            }
        ],
        accessories: [
            { id: 1, type: 'prop', name: 'قبعة الأركان', refName: 'hat', refID: 0, male: 114, texture_male: 7, female: 113, texture_female: 7, rankID: 12 },
            { id: 2, type: 'prop', name: 'قبعة عادية 1', refName: 'hat', refID: 0, male: 195, texture_male: 2, female: 196, texture_female: 1, rankID: 24 },
            { id: 3, type: 'prop', name: 'قبعة عادية 2', refName: 'hat', refID: 0, male: 107, texture_male: 20, female: 106, texture_female: 20, rankID: 24 },
            { id: 4, type: 'prop', name: 'خوذة مغلقة', refName: 'hat', refID: 0, male: 125, female: 124, rankID: 19 },
            { id: 5, type: 'prop', name: 'خوذة مفتوحة', refName: 'hat', refID: 0, male: 126, female: 125, rankID: 19 },
            { id: 6, type: 'prop', name: 'سماعة أذن', refName: 'ear', refID: 2, both: 2, rankID: 24 },
            { id: 7, type: 'prop', name: 'نظارات', refName: 'glass', refID: 1, male: 15, texture_male: 2, female: 25, texture_female: 6, rankID: 24 },
            { id: 8, type: 'main', name: 'سترة الأمن العام - ضباط', refName: 'armor', refID: 9, male: 63, texture_male: 2, female: 60, rankID: 17 },
            { id: 9, type: 'main', name: 'سترة الأمن العام - أفراد', refName: 'armor', refID: 9, male: 59, female: 59, rankID: 24 },
            { id: 10, type: 'main', name: 'سترة الدعم والإسناد - ضباط', refName: 'armor', refID: 9, male: 63, texture_male: 3, female: 60, texture_female: 3, rankID: 17 },
            { id: 11, type: 'main', name: 'سترة المرور', refName: 'armor', refID: 9, both: 58, rankID: 24 },
            { id: 12, type: 'main', name: 'حزام بطن - ضباط', refName: 'undershirt', refID: 8, male: 43, female: 65, rankID: 17 },
            { id: 13, type: 'main', name: 'حزام بطن - ضباط', refName: 'undershirt', refID: 8, male: 44, female: 30, rankID: 17 },
            { id: 14, type: 'main', name: 'حزام بطن - أفراد', refName: 'undershirt', refID: 8, male: 41, female: 28, rankID: 24 },
            { id: 15, type: 'main', name: 'حزام قدم - ضباط', refName: 'accessory', refID: 7, male: 1, female: 1, rankID: 17 },
            { id: 16, type: 'main', name: 'حزام قدم - ضباط', refName: 'accessory', refID: 7, male: 8, female: 6, rankID: 17 },
            { id: 17, type: 'main', name: 'حزام قدم - ضباط', refName: 'accessory', refID: 7, male: 9, female: 8, rankID: 17 },
        ],
        tools: [
            { id: 1, name: 'رشاش آلي (قوات خاصة)', hash: 736523883, count: 1, ammo: 80, currentAmmo: 80, outfitID: 4 },
            { id: 2, name: 'بندقية', hash: 487013001, count: 1, itemID: 116, ammo: 18, currentAmmo: 18 },
            { id: 3, name: 'مسدس ناري', hash: -1075685676, count: 1, ammo: 50, currentAmmo: 50 },
            { id: 4, name: 'مسدس صاعق', hash: 911657153, count: 1, itemID: 4, ammo: 0 },
            { id: 5, name: 'الشعلة', hash: 1233104067, count: 1, itemID: 11, ammo: 5, currentAmmo: 5 },
            { id: 6, name: 'الرصاص', count: 173 },
            { id: 7, name: 'الدرع', count: 1, isArmour: true },
            { id: 8, name: 'مطاعة', hash: 1737195953, count: 1 },
            { id: 9, name: 'مصباح يدوي', hash: -1951375401, count: 1, itemID: 19 }
        ],
        vehicles: [
            { id: 1, hash: 'w11cvpipbb', level: 1, livery: 0, noLiveryInDealer: 1, rankID: 24, count: 50000, refPrice: 50000, liveries: [{ id: 0, type: 'police' }, { id: 1, type: 'empty' }] },
            { id: 2, hash: 'eheli', type: 'plane', level: 1, livery: 0, noLiveryInDealer: 3, rankID: 22, count: 50000, refPrice: 50000 },
            { id: 3, hash: 'policeb', level: 1, rankID: 22, count: 50000, refPrice: 50000 },
            { id: 4, hash: 'riot', level: 1, rankID: 17, count: 120000, refPrice: 120000 },
            { id: 5, hash: 'i20tahoebb', level: 1, livery: 0, noLiveryInDealer: 1, rankID: 13, count: 250000, refPrice: 250000, liveries: [{ id: 0, type: 'police' }, { id: 1, type: 'empty' }] },
            { id: 6, hash: 'tr16fpiubb', level: 1, livery: 0, noLiveryInDealer: 1, rankID: 20, count: 100000, refPrice: 100000, liveries: [{ id: 0, type: 'police' }, { id: 4, type: 'traffic' }, { id: 1, type: 'empty' }] },
            { id: 7, hash: 'tr18chargerbb', level: 1, livery: 0, noLiveryInDealer: 1, rankID: 13, count: 250000, refPrice: 250000, liveries: [{ id: 0, type: 'police' }, { id: 2, type: 'traffic' }, { id: 3, type: 'swat' }, { id: 1, type: 'empty' }] },
            { id: 8, hash: 'i14chargerbb', level: 1, livery: 0, noLiveryInDealer: 1, rankID: 17, count: 250000, refPrice: 250000, liveries: [{ id: 0, type: 'police' }, { id: 1, type: 'empty' }] },
            { id: 9, hash: '23tundrabb', level: 1, livery: 0, noLiveryInDealer: 4, rankID: 12, count: 250000, refPrice: 250000, liveries: [{ id: 0, type: 'police' }, { id: 3, type: 'swat' }, { id: 4, type: 'empty' }] },
            { id: 10, hash: 'i18fpisbb', level: 1, livery: 0, noLiveryInDealer: 1, rankID: 15, count: 200000, refPrice: 200000, liveries: [{ id: 0, type: 'police' }, { id: 2, type: 'traffic' }, { id: 1, type: 'empty' }] },
            { id: 11, hash: 'whelen21durangobb', level: 1, livery: 0, noLiveryInDealer: 4, rankID: 15, count: 200000, refPrice: 200000, liveries: [{ id: 0, type: 'police' }, { id: 4, type: 'empty' }] },
            { id: 12, hash: 'ambo', level: 1, livery: 1, noLiveryInDealer: 2, rankID: 21, count: 120000, refPrice: 120000 },
            { id: 13, hash: 'defender', type: 'boat', level: 1, livery: 0, noLiveryInDealer: 2, rankID: 22, count: 25000, refPrice: 25000 },
            { id: 14, hash: 'flatbed3', level: 9, livery: 1, noLiveryInDealer: 2, rankID: 24, count: 25000, refPrice: 25000 }
        ]
    },
    facilities: {
        nameAr: 'أمن المنشآت',
        starting: {
            blip: 525,
            name: '<font face="A9eelsh">ﺔﻣﺪﺨﻟﺍ ﺀﺪﺑ</font>',
            coords: [
                [-3000.5803, 2693.6835, 9.8352, 158.7401]
            ]
        },
        garages: {
            name: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺝﺍﺮﺟ</font>',
            coords: [
                {
                    blipName: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺏﺭﺍﻮﻗ</font>',
                    blipID: 427,
                    name: 'paleto',
                    isBoatOnly: true,
                    preview: {
                        location: [-121.0417, 6742.9052, 0.5580, 99.2125],
                        camera: { posX: -127.9549, posY: 6743.0562, posZ: 3.3680, rotX: -10.00, rotY: 0.00, rotZ: 0.6062, fov: 65 }
                    },
                    spawn: [-151.3977, 6747.3364, 0.6688, 90.7086],
                    pedPreview: [-129.4549, 6749.1562, 0.7868, 99.2125]
                },
                {
                    name: 'seaport',
                    preview: {
                        location: [-3004.6682, 2722.3647, 8.9252, 155.9055],
                        camera: { posX: -3000.878, posY: 2721.2187, posZ: 10.4329, rotX: -15, rotY: 0, rotZ: 65, fov: 65 }
                    },
                    spawn: [-3013.7934, 2714.6770, 8.9084, 153.0708],
                    plane: [-2999.6967, 2762.7297, 14.3341, 150.2362],
                    boat: [-2983.3186, 2774.2680, 1.0732, 39.6850],
                    pedPreview: [-3002.3603, 2721.8110, 9.6329, 73.7007]
                },
                {
                    blipName: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺏﺭﺍﻮﻗ</font>',
                    blipID: 427,
                    name: 'seaport',
                    isBoatOnly: true,
                    preview: {
                        location: [-3407.5913, 2538.9758, 8.5185, 164.4094],
                        camera: { posX: -3379.5053, posY: 2520.0571, posZ: 3.5650, rotX: -10.00, rotY: 0.00, rotZ: -70.6062, fov: 65 }
                    },
                    spawn: [-3405.6264, 2522.5979, 1.3765, 178.5826],
                    pedPreview: [-3374.5053, 2522.0571, 1.3765, 195.5905]
                },
            ]
        },
        outfits: [
            {
                id: 2,
                name: 'ملابس داخل الميناء',
                items: {
                    male: { top: 498, undershirt: 15, torso: 30, leg: 7, shoe: 97, hat: 195 },
                    female: { top: 547, undershirt: 15, torso: 9, leg: 133, shoe: 115, hat: 196 },
                },
                textures: { male: { leg: 4, hat: 0 }, female: { hat: 3 } }
            },
            {
                id: 3,
                name: 'ملابس خارج الميناء',
                items: {
                    male: { top: 508, undershirt: 15, torso: 30, leg: 7, shoe: 97, hat: 195 },
                    female: { top: 546, undershirt: 15, torso: 9, leg: 133, shoe: 115, hat: 196 },
                },
                textures: { male: { leg: 4, hat: 1 }, female: { hat: 2 } }
            },
            {
                id: 4,
                name: 'ملابس القوات الخاصة - ضباط',
                ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                items: {
                    male: { mask: 28, top: 305, undershirt: 68, armor: 27, torso: 174, leg: 137, shoe: 25, hat: 117, glass: 24 },
                    female: { mask: 28, top: 46, undershirt: 65, armor: 60, torso: 215, leg: 32, shoe: 25, hat: 116, accessory: 6, glass: 26 },
                },
                textures: { male: { top: 2, armor: 1, leg: 2, glass: 2 }, female: { armor: 3, glass: 2 } }
            },
            {
                id: 5,
                name: 'ملابس المدرب',
                ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                items: {
                    male: { top: 497, undershirt: 15, torso: 171, leg: 130, shoe: 110, hat: 195 },
                    female: { top: 536, undershirt: 15, torso: 223, leg: 32, shoe: 114, hat: 196 },
                },
                textures: { male: { top: 2, leg: 1, hat: 2 }, female: { top: 1, hat: 1 } }
            },
            {
                id: 6,
                name: 'ملابس التدريب',
                items: {
                    male: { top: 497, undershirt: 15, torso: 0, leg: 126, shoe: 12, hat: 107 },
                    female: { top: 536, undershirt: 15, torso: 14, leg: 135, shoe: 115, hat: 106 },
                },
                textures: { male: { top: 3, shoe: 6, hat: 22 }, female: { top: 3, hat: 22 } }
            }
        ],
        accessories: [
            { id: 1, type: 'prop', name: 'قبعة الأركان', refName: 'hat', refID: 0, male: 114, texture_male: 7, female: 113, texture_female: 7, rankID: 12 },
            { id: 2, type: 'prop', name: 'قبعة الضباط 1', refName: 'hat', refID: 0, male: 106, texture_male: 20, female: 105, texture_female: 20, rankID: 17 },
            { id: 3, type: 'prop', name: 'قبعة الضباط 2', refName: 'hat', refID: 0, male: 60, texture_male: 9, female: 60, texture_female: 9, rankID: 17 },
            { id: 4, type: 'prop', name: 'خوذة مغلقة', refName: 'hat', refID: 0, male: 125, female: 124, rankID: 19 },
            { id: 5, type: 'prop', name: 'خوذة مفتوحة', refName: 'hat', refID: 0, male: 126, female: 125, rankID: 19 },
            { id: 6, type: 'prop', name: 'قبعة داخل الميناء', refName: 'hat', refID: 0, male: 195, texture_male: 0, female: 196, texture_female: 3, rankID: 24 },
            { id: 7, type: 'prop', name: 'قبعة خارج الميناء', refName: 'hat', refID: 0, male: 195, texture_male: 1, female: 196, texture_female: 2, rankID: 24 },
            { id: 8, type: 'prop', name: 'سماعة أذن', refName: 'ear', refID: 2, both: 2, rankID: 24 },
            { id: 9, type: 'prop', name: 'نظارات', refName: 'glass', refID: 1, male: 15, texture_male: 2, female: 25, texture_female: 6, rankID: 24 },
            { id: 10, type: 'main', name: 'سترة أمن المنشآت - ضباط', refName: 'armor', refID: 9, male: 63, texture_male: 1, female: 60, texture_female: 1, rankID: 17 },
            { id: 11, type: 'main', name: 'سترة الدعم والإسناد - ضباط', refName: 'armor', refID: 9, male: 24, texture_male: 1, rankID: 17 },
            { id: 12, type: 'main', name: 'سترة أمن الموانئ - ضباط', refName: 'armor', refID: 9, male: 63, female: 60, texture_female: 2, rankID: 17 },
            { id: 13, type: 'main', name: 'سترة أمن المنشآت - أفراد', refName: 'armor', refID: 9, male: 59, texture_male: 1, female: 59, texture_female: 1, rankID: 24 },
            { id: 15, type: 'main', name: 'بنطال الضباط', refName: 'leg', refID: 4, male: 31, female: 30, rankID: 17 },
            { id: 16, type: 'main', name: 'حزام بطن - ضباط', refName: 'undershirt', refID: 8, male: 43, female: 65, rankID: 17 },
            { id: 17, type: 'main', name: 'حزام بطن - ضباط', refName: 'undershirt', refID: 8, male: 44, female: 30, rankID: 17 },
            { id: 18, type: 'main', name: 'حزام بطن - أفراد', refName: 'undershirt', refID: 8, male: 41, female: 28, rankID: 24 },
            { id: 19, type: 'main', name: 'حزام قدم - ضباط', refName: 'accessory', refID: 7, male: 1, female: 1, rankID: 17 },
            { id: 20, type: 'main', name: 'حزام قدم - ضباط', refName: 'accessory', refID: 7, male: 8, female: 6, rankID: 17 },
            { id: 21, type: 'main', name: 'حزام قدم - ضباط', refName: 'accessory', refID: 7, male: 9, female: 8, rankID: 17 },
            { id: 22, type: 'main', name: 'حذاء الضباط', refName: 'shoe', refID: 6, both: 24, rankID: 17 },
        ],
        tools: [
            { id: 1, name: 'رشاش آلي (قوات خاصة)', hash: 736523883, count: 1, ammo: 80, currentAmmo: 80, outfitID: 4 },
            { id: 2, name: 'بندقية', hash: 487013001, count: 1, itemID: 116, ammo: 18, currentAmmo: 18 },
            { id: 3, name: 'مسدس ناري', hash: -1075685676, count: 1, ammo: 50, currentAmmo: 50 },
            { id: 4, name: 'مسدس صاعق', hash: 911657153, count: 1, itemID: 4, ammo: 0 },
            { id: 5, name: 'الشعلة', hash: 1233104067, count: 1, itemID: 11, ammo: 5, currentAmmo: 5 },
            { id: 6, name: 'الرصاص', count: 173 },
            { id: 7, name: 'الدرع', count: 1, isArmour: true },
            { id: 8, name: 'مطاعة', hash: 1737195953, count: 1 },
            { id: 9, name: 'مصباح يدوي', hash: -1951375401, count: 1, itemID: 19 }
        ],
        vehicles: [
            { id: 20, hash: 'w11cvpipbb', level: 1, livery: 3, noLiveryInDealer: 1, rankID: 24, count: 50000, refPrice: 50000, liveries: [{ id: 2, type: 'facilities1' }, { id: 3, type: 'facilities2' }, { id: 1, type: 'empty' }] },
            { id: 21, hash: 'eheli', type: 'plane', level: 1, livery: 1, noLiveryInDealer: 3, rankID: 22, count: 50000, refPrice: 50000 },
            { id: 23, hash: 'i20tahoebb', level: 1, livery: 2, noLiveryInDealer: 1, rankID: 17, count: 250000, refPrice: 250000, liveries: [{ id: 3, type: 'facilities1' }, { id: 2, type: 'facilities2' }, { id: 1, type: 'empty' }] },
            { id: 24, hash: 'tr16fpiubb', level: 1, livery: 2, noLiveryInDealer: 1, rankID: 21, count: 100000, refPrice: 100000, liveries: [{ id: 3, type: 'facilities1' }, { id: 2, type: 'facilities2' }, { id: 1, type: 'empty' }] },
            { id: 25, hash: 'tr18chargerbb', level: 1, livery: 5, noLiveryInDealer: 1, rankID: 11, count: 250000, refPrice: 250000, liveries: [{ id: 4, type: 'facilities1' }, { id: 5, type: 'facilities2' }, { id: 1, type: 'empty' }] },
            { id: 26, hash: 'i14chargerbb', level: 1, livery: 3, noLiveryInDealer: 1, rankID: 9, count: 250000, refPrice: 250000, liveries: [{ id: 2, type: 'facilities1' }, { id: 3, type: 'facilities2' }, { id: 1, type: 'empty' }] },
            { id: 27, hash: '23tundrabb', level: 1, livery: 1, noLiveryInDealer: 4, rankID: 16, count: 250000, refPrice: 250000, liveries: [{ id: 2, type: 'facilities1' }, { id: 1, type: 'facilities2' }, { id: 4, type: 'empty' }] },
            { id: 28, hash: 'i18fpisbb', level: 1, livery: 4, noLiveryInDealer: 1, rankID: 19, count: 200000, refPrice: 200000, liveries: [{ id: 3, type: 'facilities1' }, { id: 4, type: 'facilities2' }, { id: 1, type: 'empty' }] },
            { id: 29, hash: 'whelen21durangobb', level: 1, livery: 3, noLiveryInDealer: 4, rankID: 17, count: 200000, refPrice: 200000, liveries: [{ id: 2, type: 'facilities1' }, { id: 3, type: 'facilities2' }, { id: 4, type: 'empty' }] },
            { id: 30, hash: 'ambo', level: 1, livery: 0, noLiveryInDealer: 2, rankID: 21, count: 120000, refPrice: 120000 },
            { id: 31, hash: 'defender', type: 'boat', level: 1, livery: 1, noLiveryInDealer: 2, rankID: 22, count: 25000, refPrice: 25000 },
            { id: 32, hash: 'flatbed3', level: 1, livery: 0, noLiveryInDealer: 2, rankID: 24, count: 25000, refPrice: 25000 },
            { id: 33, hash: 'polpatriotf2', level: 1, livery: 0, noLiveryInDealer: 0, rankID: 17, count: 120000, refPrice: 120000, liveries: [{ id: 1, type: 'facilities1' }, { id: 0, type: 'facilities2' }] },
        ]
    },
    health: {
        nameAr: 'الدفاع المدني',
        starting: {
            blip: 525,
            name: '<font face="A9eelsh">ﺔﻣﺪﺨﻟﺍ ﺀﺪﺑ</font>',
            coords: [
                [1825.8461, 3675.0988, 34.2674, 303.3070],
                [-256.4439, 6326.9799, 32.4139, 226.7716]
            ]
        },
        garages: {
            name: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺝﺍﺮﺟ</font>',
            coords: [
                {
                    blipName: '<font face="A9eelsh">ﺔﻔﻴﻇﻮﻟﺍ ﺏﺭﺍﻮﻗ</font>',
                    blipID: 427,
                    name: 'paleto',
                    isBoatOnly: true,
                    preview: {
                        location: [-121.0417, 6742.9052, 0.5580, 99.2125],
                        camera: { posX: -127.9549, posY: 6743.0562, posZ: 3.3680, rotX: -10.00, rotY: 0.00, rotZ: 0.6062, fov: 65 }
                    },
                    spawn: [-151.3977, 6747.3364, 0.6688, 90.7086],
                    pedPreview: [-129.4549, 6749.1562, 0.7868, 99.2125]
                },
                {
                    name: 'paleto',
                    preview: {
                        location: [-261.7186, 6344.2021, 31.6893, 269.2913],
                        camera: { posX: -262.5098 - 0.5, posY: 6341.0768 - 1, posZ: 32.4139 + 0.8, rotX: -20.00, rotY: 0.00, rotZ: -20, fov: 65 }
                    },
                    spawn: [-253.8065, 6348.7910, 31.6893, 226.7716],
                    pedPreview: [-262.7604, 6341.2221, 32.4139, -25]
                },
                {
                    name: 'sandy',
                    preview: {
                        location: [1864.0615, 3700.5363, 32.8520, 209.7637],
                        camera: { posX: 1867.1208 + 1, posY: 3700.8923 + 0.8, posZ: 33.4417 + 1, rotX: -15, rotY: 0, rotZ: 100, fov: 65 }
                    },
                    spawn: [1869.4813, 3694.5231, 32.8688, 209.7637],
                    plane: [1864.5626, 3646.6418, 35.7502, 31.1811],
                    pedPreview: [1866.8, 3700.8923, 33.4417, 99.2125]
                }
            ]
        },
        outfits: [
            {
                id: 2,
                name: 'الملابس الرسمية',
                items: {
                    male: { top: 100, undershirt: 15, torso: 85, leg: 49, hat: 195, shoe: 25 },
                    female: { top: 88, undershirt: 15, torso: 109, leg: 51, hat: 196, shoe: 25 },
                },
                textures: { male: { top: 1, leg: 2, hat: 6 }, female: { hat: 6 } }
            },
            {
                id: 3,
                name: 'ملابس الخبير 1',
                ranks: [0, 1, 2, 3],
                items: {
                    male: { top: 186, undershirt: 150, torso: 77, leg: 25, shoe: 25 },
                    female: { top: 188, undershirt: 217, torso: 88, leg: 133, shoe: 25 },
                },
                textures: { male: { undershirt: 1 }, female: { undershirt: 1 } }
            },
            {
                id: 4,
                name: 'ملابس الخبير 2',
                ranks: [0, 1, 2, 3, 4, 5],
                items: {
                    male: { top: 31, undershirt: 129, torso: 85, leg: 141, hat: 195, shoe: 25 },
                    female: { top: 91, undershirt: 159, torso: 109, leg: 37, hat: 196, shoe: 25 },
                },
                textures: { male: { hat: 5 }, female: { hat: 5 } }
            },
            {
                id: 5,
                name: 'ملابس الخبير 3',
                ranks: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                items: {
                    male: { top: 100, undershirt: 129, torso: 85, leg: 141, hat: 195, shoe: 25 },
                    female: { top: 88, undershirt: 159, torso: 109, leg: 37, hat: 196, shoe: 25 },
                },
                textures: { male: { hat: 4 }, female: { top: 1, hat: 4 } }
            },
        ],
        accessories: [
            { id: 1, type: 'prop', name: 'نظارات 1', refName: 'glass', refID: 1, male: 34, female: 36, rankID: 11 },
            { id: 2, type: 'prop', name: 'نظارات 2', refName: 'glass', refID: 1, male: 35, female: 35, rankID: 11 },
            { id: 3, type: 'prop', name: 'نظارات 3', refName: 'glass', refID: 1, male: 37, female: 39, rankID: 11 },
            { id: 4, type: 'prop', name: 'نظارات 3', refName: 'glass', refID: 1, male: 39, female: 41, rankID: 11 },
            { id: 5, type: 'main', name: 'سماعة طبية', refName: 'accessory', refID: 7, male: 126, female: 96, rankID: 11 },
            { id: 6, type: 'main', name: 'كرت تعريفي', refName: 'accessory', refID: 7, male: 127, female: 97, rankID: 11 },
        ],
        tools: [],
        vehicles: [
            { id: 40, hash: 'eheli', type: 'plane', level: 1, livery: 2, noLiveryInDealer: 3, rankID: 9, count: 300000, refPrice: 300000 },
            { id: 41, hash: 'emsnspeedo', level: 1, rankID: 11, count: 100000, refPrice: 100000 },
            { id: 42, hash: 'EMSExplore', level: 1, rankID: 5, count: 950000, refPrice: 950000 },
            { id: 43, hash: 'slicktahoek9bb', level: 1, rankID: 8, count: 400000, refPrice: 400000 },
            { id: 44, hash: 'f450ambo', level: 1, rankID: 9, count: 150000, refPrice: 150000 },
            { id: 45, hash: 'predator', type: 'boat', level: 1, rankID: 10, count: 250000, refPrice: 250000 },
        ]
    }
};
on('NewStart_Employee:starting-client', (data) => {
    data = JSON.parse(data);
    const ref = config[data.key];
    state.jobKey = data.key;
    state.outfitID = data.id || 0;
    state.isTools = data.isTools;
    for (let item of config[state.jobKey].vehicles) {
        RequestModel(item.hash);
        if (data.vehicles?.find((obj) => obj.hash == item.hash))
            item.count = null;
    }
    const inventoryStatic = exports.NewStart_Inventory.staticData();
    const inventoryKB = config[state.jobKey].tools.reduce((totel, tool) => {
        let find = inventoryStatic.find((obj) => obj.id === tool.itemID);
        let space = find?.space || 0;
        let count = find?.count || 0;
        return (totel + (count * space));
    }, 0);
    state.inventoryKB = inventoryKB;
    if (!data.isVacation) {
        for (let item of ref.starting.coords)
            createBlip(ref.starting.blip, ref.starting.name, item);
        for (let item of ref.garages.coords)
            createBlip(item.blipID, item.blipName || ref.garages.name, item.preview.location);
        if (['police', 'facilities'].includes(state.jobKey)) {
            for (let item of exports.NewStart_Jobs.method('getAllReward'))
                createBlip(item.blipID, `<font face="A9eelsh">${item.title}</font>`, item.gps, 51);
        }
    }
    if (data.accessories)
        state.loadAccessories = data.accessories;
    startJob();
    if (data.isVacation)
        emit('NewStart_Factions:update-client', 'vacation', { isReset: false });
});
on('playerSpawned', () => {
    if (!state.isFirst)
        return;
    else if (exports.NewStart_Factions.info()?.isVacation) {
        state.isFirst = false;
        return;
    }
    if (state.outfitID > 1) {
        handleOutfit(state.outfitID, state.loadAccessories);
        if (state.loadAccessories)
            accessoriesLoadAndSave({ isLoad: true });
    }
    else if (state.outfitID === 1) {
        exports.NewStart_Clothes.pedReset();
    }
    state.isFirst = false;
    if (state.outfitID) {
        if (state.isTools)
            giveTools();
        state.starting = true;
    }
});
function startJob() {
    state.tickID = setTick(() => {
        state.isVacation = exports.NewStart_Factions.info()?.isVacation;
        if (state.isVacation)
            return;
        const pedID = PlayerPedId();
        const coords = GetEntityCoords(pedID, true);
        let current = null;
        for (let item of config[state.jobKey].starting.coords) {
            const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], item[0], item[1], item[2], true);
            if (distance < 20) {
                DrawMarker(1, item[0], item[1], item[2] - 1, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.5, 1.5, 0.35, 45, 101, 167, 100, false, false, 2, false, empty, empty, false);
                if (distance < 0.8) {
                    current = { h: item[3] };
                    break;
                }
            }
        }
        if (current &&
            !IsPauseMenuActive() &&
            !IsEntityDead(pedID)) {
            if (IsControlJustPressed(0, 38)) {
                state.isOpen = true;
                TaskAchieveHeading(pedID, current.h, 0);
                SetNuiFocus(true, true);
                SendNUIMessage(JSON.stringify({
                    type: 'openUI',
                    page: 'home',
                    isTools: !!config[state.jobKey].tools.length,
                    inventoryKB: state.inventoryKB
                }));
            }
            else if (!state.isOpen && !state.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
            }
            state.runClose = true;
        }
        else if (state.runClose) {
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            ClearPedTasks(pedID);
            closeUI();
        }
    });
    state.tickGarageID = startVehiclesList();
}
exports('quit', () => {
    const pedID = PlayerPedId();
    for (let id of state.blips)
        RemoveBlip(id);
    clearTick(state.tickID);
    clearTick(state.tickGarageID);
    if (state.outfitID > 1) {
        exports.NewStart_Clothes.pedReset();
    }
    closeUI(true);
    SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    if (vehInfo.spawnIDs.length) {
        emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ array: vehInfo.spawnIDs.map(i => i.id) }));
        vehInfo.spawnIDs = [];
    }
    config[state.jobKey].accessories = config[state.jobKey].accessories.map((a) => ({ ...a, isActive: false }));
    state.starting = false;
    state.outfitID = 0;
    state.jobKey = '';
    state.blips = [];
    SetPedArmour(pedID, 0);
    RemoveAllPedWeapons(PlayerPedId(), false);
    exports.NewStart_Inventory.method('weaponsLoad');
    exports.NewStart_HudSystem.update({ armour: 0 });
    exports.NewStart_Inventory.method('setExtraKG', 0);
    exports.NewStart_Medicine.method('closeUI', true);
});
exports('data', (noVeh = false) => ({
    nameJob: config[state.jobKey]?.nameAr,
    isActive: !!state.outfitID,
    isPreview: state_vehicles,
    spawnIDs: vehInfo.spawnIDs.length && !noVeh && !exports.NewStart_RealEstate.method('getCurrent', 'insideCode') ? (vehInfo.spawnIDs.map(i => ({ ...i, id: NetworkDoesNetworkIdExist(i.id) ? NetworkGetEntityFromNetworkId(i.id) : 0 }))) : [],
    outfitID: state.outfitID
}));
exports('playerPed', (isActive) => {
    if (state.outfitID <= 1)
        return null;
    else if (isActive && state.outfitID >= 1)
        return true;
    const pedID = PlayerPedId();
    const outfit = config[state.jobKey].outfits.find((obj) => obj.id === state.outfitID);
    const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');
    const gender = isMale ? 'male' : 'female';
    return {
        ...exports.NewStart_Clothes.playerPed(true),
        ...outfit.items[gender],
        ...accessoriesLoadAndSave({ isGetItems: true })
    };
});
exports('method', (type, data, more) => {
    if (type === 'inJob') {
        if ((exports.NewStart_Jobs.currentJob().isActive || state.outfitID) && state.outfitID !== 1)
            return true;
        else
            return false;
    }
    else if (type === 'getVehInfo') {
        for (let key of Object.keys(config)) {
            const find = config[key].vehicles.find((obj) => more ? obj.hash === data && key === state.jobKey : obj.id == data);
            if (find)
                return { nameJob: key, nameAr: config[key].nameAr, ...find };
        }
        return null;
    }
    else if (type === 'resetPriceVeh') {
        const find = config[state.jobKey].vehicles.find((v) => v.hash === data);
        const spawnInx = vehInfo.spawnIDs.findIndex(i => i.hash === data);
        find.count = find.refPrice;
        if (spawnInx >= 0) {
            emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: vehInfo.spawnIDs[spawnInx].id }));
            vehInfo.spawnIDs.splice(spawnInx, 1);
        }
    }
    else if (type === 'zeroPriceVeh') {
        const index = config[state.jobKey].vehicles.findIndex((v) => isNaN(data) ? v.hash === data : v.id === parseInt(data));
        config[state.jobKey].vehicles[index].count = null;
    }
    else if (type === 'giveTools') {
        if (state.isTools)
            giveTools();
    }
    else if (type === 'relaxation') {
        handleRelaxation(data);
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
    }
    else if (type === 'vehicles') {
        let result = [];
        for (let key of Object.keys(config)) {
            result = [...result, ...config[key].vehicles.map((v) => ({ ...v, key }))];
        }
        return result;
    }
    else if (type === 'saveCurrentAmmo') {
        if (state.outfitID) {
            const pedID = PlayerPedId();
            const hash = GetSelectedPedWeapon(pedID);
            const find = config[state.jobKey].tools.find((i) => i.hash === hash);
            if (find) {
                find.currentAmmo = GetAmmoInPedWeapon(pedID, hash);
            }
        }
    }
    else if (type === 'setVehInfo') {
        if (vehInfo.spawnIDs.length < vehInfo.spawnMax && !config[state.jobKey].vehicles.find((i) => i.hash === data.hash)?.count) {
            vehInfo.spawnIDs.push(data);
        }
    }
    else if (type === 'getTexture') {
        const isMale = GetEntityModel(PlayerPedId()) === GetHashKey('mp_m_freemode_01');
        const isAccessory = accessoriesLoadAndSave({ isGetItems: true })[data];
        const gender = isMale ? 'male' : 'female';
        let textureID = 0;
        if (isAccessory) {
            textureID = config[state.jobKey].accessories.find(i => i.refName === data && i.isActive)[`texture_${gender}`] || 0;
        }
        else {
            textureID = config[state.jobKey].outfits.find(obj => obj.id === state.outfitID).textures[gender][data] || 0;
        }
        if (data === 'top' && state.outfitID === 2 && exports.NewStart_Factions.method('isSecurityKey')) {
            const rankID = exports.NewStart_Factions.info().subRankID || exports.NewStart_Factions.info().rankID;
            textureID = rankID <= 1 ? 0 : rankID - 2;
        }
        return textureID;
    }
});
exports('closeUI', () => {
    if (state.isOpen || state_vehicles.isOpen) {
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
        closeUI();
    }
});
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
function handleOutfit(id, load) {
    const pedID = PlayerPedId();
    const items = exports.NewStart_Clothes.items();
    const current = exports.NewStart_Clothes.playerPed();
    const currTextures = exports.NewStart_Clothes.method('getTextures');
    const outfit = config[state.jobKey].outfits.find((obj) => obj.id === id);
    const isMale = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01');
    const gender = isMale ? 'male' : 'female';
    const isLoad = load && Object.keys(load).length;
    for (let item of items) {
        let value = outfit.items[gender][item.name];
        value = isLoad && load[item.name] ? load[item.name].drawableID : value;
        let texture = (isLoad && load[item.name] ? load[item.name].textureID : outfit.textures[gender][item.name]) || 0;
        if (item.name === 'top' && ((id === 2 && exports.NewStart_Factions.method('isSecurityKey')) || id === 3 && state.jobKey === 'facilities')) {
            const faction = exports.NewStart_Factions.info();
            texture = faction.rankID <= 1 ? (faction.subRankID ? faction.subRankID - 2 : 0) : faction.rankID - 2;
        }
        if (['mask', 'glass', 'watch'].includes(item.name)) {
            if (!load || !load[item.name]) {
                value = current[item.name];
                texture = currTextures[item.name];
            }
        }
        if (item.type === 'main') {
            SetPedComponentVariation(pedID, item.id, value || 0, texture, 0);
        }
        else {
            if (value) {
                SetPedPropIndex(pedID, item.id, value, texture, true);
            }
            else {
                ClearPedProp(pedID, item.id);
            }
        }
    }
}
function giveTools(noAmmo = false) {
    if (!config[state.jobKey]?.tools?.length)
        return;
    const pedID = PlayerPedId();
    for (let item of config[state.jobKey].tools) {
        if (item.outfitID && item.outfitID !== state.outfitID)
            continue;
        if (item.ammo)
            SetPedAmmo(pedID, item.hash, 0);
        if (item.hash)
            GiveWeaponToPed(pedID, item.hash, noAmmo ? 0 : item.currentAmmo, false, false);
        else if (item.isArmour && !noAmmo)
            SetPedArmour(pedID, 100);
    }
    exports.NewStart_Inventory.method('setExtraKG', state.inventoryKB);
}
function createBlip(id, name, coords, color) {
    const blip = AddBlipForCoord(coords[0], coords[1], coords[2]);
    SetBlipSprite(blip, id || 357);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(name);
    EndTextCommandSetBlipName(blip);
    SetBlipColour(blip, color || 3);
    SetBlipAsShortRange(blip, true);
    state.blips.push(blip);
}
function closeUI(isQuit) {
    if (state_vehicles.isPreview && !exports.NewStart_MainMenu.isOpen()) {
        DisplayRadar(true);
        exports.NewStart_HudSystem.openHud();
        exports.NewStart_MainMenu.toggleAds(true);
    }
    exports.NewStart_Phone.noticesToggle(false);
    if (state_vehicles.isPreview) {
        DestroyCam(state_vehicles.cameraID, true);
        RenderScriptCams(false, false, 0, false, false);
        DeleteVehicle(vehInfo.previewID);
        for (let id of GetActivePlayers().filter((i) => i !== PlayerId()))
            SetEntityAlpha(GetPlayerPed(id), 255, false);
    }
    if (!isQuit) {
        state.isOpen = false;
        state.runClose = false;
    }
    SetNuiFocus(false, false);
    state_vehicles.isPreview = false;
    state_vehicles.cameraID = 0;
    state_vehicles.isOpen = false;
    state_vehicles.runClose = false;
}
RegisterNuiCallbackType('NUI:update');
on('__cfx_nui:NUI:update', (data, cb) => {
    switch (data.type) {
        case 'getItems':
            const faction = exports.NewStart_Factions.info();
            let items = config[state.jobKey][data.key];
            if (!state.outfitID && ['accessories', 'tools'].includes(data.key)) {
                exports.NewStart_Notifications.showAttention('error', 'يجب اختيار مجموعة من ملابس العمل أولاً!');
                return cb('Failed');
            }
            else if (state.outfitID === 1 && data.key === 'accessories') {
                exports.NewStart_Notifications.showAttention('error', 'لا يمكن استخدام الملحقات أثناء استخدامك للملابس الأساسية!');
                return cb('Failed');
            }
            else if (data.key === 'outfits') {
                const gender = GetEntityModel(PlayerPedId()) === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';
                items = items.filter((i) => (i.ranks ? i.ranks.includes(faction.rankID) : true) && i.items[gender]);
            }
            else if (data.key === 'accessories') {
                items = items.filter((i) => i.rankID >= faction.rankID)
                    .map((i) => ({ ...i, rankID: i.rankID ? `${faction.ranks.find((r) => r.id === i.rankID).name} وأعلى` : null }));
                const gender = GetEntityModel(PlayerPedId()) === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';
                const pedItems = config[state.jobKey].outfits.find((obj) => obj.id === state.outfitID).items[gender];
                const pedTextures = config[state.jobKey].outfits.find((obj) => obj.id === state.outfitID).textures[gender];
                items = items.filter((item) => {
                    const value = Number.isInteger(item.both) ? item.both : item[gender];
                    return value && !(pedItems[item.refName] === value && (item[`texture_${gender}`] ? pedTextures[item.refName] === item[`texture_${gender}`] : true));
                });
                accessoriesLoadAndSave({ isReset: true });
            }
            SendNUIMessage(JSON.stringify({ type: 'setItems', info: items }));
            break;
        case 'tools':
            const currentKG = exports.NewStart_Inventory.info('currentKG');
            const maxKG = exports.NewStart_Inventory.info('maxKG');
            if (((state.inventoryKB + currentKG) > maxKG && !exports.NewStart_Inventory.info('extraKG')) || !state.outfitID) {
                exports.NewStart_Notifications.showAttention('error', 'لا يوجد مساحة كافية لتعبئة الأدوات!');
                return cb('OK!');
            }
            config[state.jobKey].tools = config[state.jobKey].tools.map((i) => ({ ...i, currentAmmo: i.ammo || 0 }));
            giveTools();
            exports.NewStart_Notifications.showAttention('success', 'لقد حصلت علي كل الأدوات التي تخص الوظيفة!');
            if (!state.isTools) {
                state.isTools = true;
                emitNet('NewStart:updateUser', { 'job.isTools': true });
            }
            break;
        case 'outfits':
            if (exports.NewStart_Taboos.method('divingSuit', { isRun: true })) {
                exports.NewStart_Notifications.showAttention('error', 'أنت ترتدي ملابس خاصة بمهمة تخلص منها أولاً.');
                return cb('OK!');
            }
            if (data.starting) {
                if (state.outfitID !== data.id) {
                    state.outfitID = data.id;
                    if (state.starting)
                        exports.NewStart_Notifications.showAttention('success', 'لقد قمت بتغيير ملابس العمل.');
                    emitNet('NewStart:updateUser', { 'job.outfitID': data.id });
                }
                if (!state.starting) {
                    const faction = exports.NewStart_Factions.info();
                    exports.NewStart_Notifications.showAttention('success', 'انت في الخدمة الان يمكنك مباشرة العمل.');
                    state.starting = true;
                    emitNet('NewStart_Factions:general-server', JSON.stringify({ type: 'status', id: faction.id, key: faction.key, value: 'in' }));
                }
                accessoriesLoadAndSave({ isReset: true, noUpdate: true });
            }
            else {
                if ((data.id !== 1 && Number.isInteger(data.id)) || (state.outfitID && data.isClose)) {
                    handleOutfit(data.id || state.outfitID, data.isClose ? accessoriesLoadAndSave({ isGetItems: true, withTextures: true }) : null);
                    ClearPedTasks(PlayerPedId());
                }
                else {
                    exports.NewStart_Clothes.pedReset();
                }
            }
            break;
        case 'accessories':
            const pedID = PlayerPedId();
            if (data.save) {
                accessoriesLoadAndSave({});
                if (config[state.jobKey].accessories.some((i) => i.refName === 'armor' && i.isActive) && GetPedArmour(pedID) < 100) {
                    SetPedArmour(pedID, 100);
                    exports.NewStart_HudSystem.update({ armour: 100 });
                }
            }
            else if (data.isClose) {
                if (config[state.jobKey].accessories.some((i) => i.refName === 'armor') && GetPedArmour(pedID)) {
                    SetPedArmour(pedID, 0);
                    exports.NewStart_HudSystem.update({ armour: 0 });
                }
                accessoriesLoadAndSave({ isReset: true });
            }
            else {
                const gender = GetEntityModel(pedID) === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';
                const item = config[state.jobKey].accessories.find((a) => a.id === data.id);
                const value = Number.isInteger(item.both) ? item.both : item[gender];
                const textureID = item[`texture_${gender}`] || 0;
                const reset = config[state.jobKey].outfits.find((obj) => obj.id === state.outfitID);
                const resetItem = reset.items[gender][item.refName];
                const resetTexture = reset.textures[gender][item.refName];
                if (item.type === 'main') {
                    const isReset = GetPedDrawableVariation(pedID, item.refID) === value && GetPedTextureVariation(pedID, item.refID) === textureID;
                    SetPedComponentVariation(pedID, item.refID, isReset ? resetItem : value, isReset ? resetTexture : textureID, 0);
                }
                else {
                    const isReset = GetPedPropIndex(pedID, item.refID) === value && GetPedPropTextureIndex(pedID, item.refID) === textureID;
                    if (!isReset) {
                        SetPedPropIndex(pedID, item.refID, value, textureID || 0, true);
                    }
                    else {
                        ClearPedProp(pedID, item.refID);
                    }
                }
                const prevActive = config[state.jobKey].accessories.find((a) => a.refName === item.refName && a.isActive);
                if (prevActive)
                    prevActive.isActive = false;
                if (item.id !== prevActive?.id)
                    item.isActive = true;
            }
            break;
        case 'relaxation': handleRelaxation();
        default: closeUI();
    }
    cb('OK!');
});
onNet('NewStart_Employee:handleGeneral-client', (type, data) => {
    if (type === 'createEmployeeVehicle') {
        createEmployeeVehicle(data);
    }
    else if (type === 'setVehInfo') {
        vehInfo.spawnIDs = data;
    }
    else if (type === 'removeVeh') {
        const spawnInx = vehInfo.spawnIDs.findIndex(i => i.id === data);
        if (spawnInx >= 0) {
            vehInfo.spawnIDs.splice(spawnInx, 1);
        }
    }
});
function accessoriesLoadAndSave(options) {
    if (options.isLoad) {
        config[state.jobKey].accessories = config[state.jobKey].accessories.map((i) => ({ ...i, isActive: i.id === state.loadAccessories[i.refName]?.id }));
        delete state.loadAccessories;
    }
    else if (options.isReset) {
        if (!options.noUpdate)
            handleOutfit(state.outfitID);
        emitNet('NewStart:updateUser', { 'job.accessories': null });
        config[state.jobKey].accessories = config[state.jobKey].accessories.map((a) => ({ ...a, isActive: false }));
    }
    else {
        const gender = GetEntityModel(PlayerPedId()) === GetHashKey('mp_m_freemode_01') ? 'male' : 'female';
        const items = config[state.jobKey].accessories.filter((a) => a.isActive).reduce((a, b) => {
            const id = Number.isInteger(b.both) ? b.both : b[gender];
            return { ...a, [b.refName]: options.isGetItems && !options.withTextures ? id : { id: b.id, drawableID: id, textureID: b[`texture_${gender}`] || 0 } };
        }, {});
        if (options.isGetItems)
            return items;
        else
            emitNet('NewStart:updateUser', { 'job.accessories': Object.keys(items).length ? items : null });
    }
}
function handleRelaxation(isVacation) {
    if (state.outfitID) {
        const pedID = PlayerPedId();
        const faction = exports.NewStart_Factions.info();
        if (state.outfitID > 1) {
            exports.NewStart_Clothes.pedReset();
        }
        if (vehInfo.spawnIDs.length) {
            emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ array: vehInfo.spawnIDs.map(i => i.id) }));
            vehInfo.spawnIDs = [];
        }
        emitNet('NewStart:updateUser', { 'job.outfitID': 0, 'job.isTools': false, 'job.accessories': null });
        if (!isVacation)
            emitNet('NewStart_Factions:general-server', JSON.stringify({ type: 'status', id: faction.id, key: faction.key, value: 'out' }));
        state.outfitID = 0;
        state.starting = false;
        state.isTools = false;
        config[state.jobKey].accessories = config[state.jobKey].accessories.map((a) => ({ ...a, isActive: false }));
        for (let item of config[state.jobKey].tools) {
            if (item.hash)
                RemoveWeaponFromPed(pedID, item.hash);
        }
        SetPedArmour(pedID, 0);
        exports.NewStart_HudSystem.update({ armour: 0 });
        exports.NewStart_Phone.RESET_READ_REPORTS();
        exports.NewStart_Medicine.method('closeUI', true);
        exports.NewStart_Inventory.method('setExtraKG', 0);
        RemoveAllPedWeapons(pedID, false);
        exports.NewStart_Inventory.method('weaponsLoad');
        if (faction?.key === 'police' || faction?.key === 'facilities') {
            exports.NewStart_Robbery.method('reset', true);
        }
        ClearPedTasks(pedID);
    }
    if (isVacation) {
        exports.NewStart_Radio.method('kick', true);
        for (let id of state.blips)
            RemoveBlip(id);
        state.blips = [];
        closeUI();
    }
    else {
        const ref = config[state.jobKey];
        for (let item of ref.starting.coords)
            createBlip(ref.starting.blip, ref.starting.name, item);
        for (let item of ref.garages.coords)
            createBlip(item.blipID, item.blipName || ref.garages.name, item.preview.location);
        if (['police', 'facilities'].includes(state.jobKey)) {
            for (let item of exports.NewStart_Jobs.method('getAllReward'))
                createBlip(item.blipID, `<font face="A9eelsh">${item.title}</font>`, item.gps, 51);
        }
    }
}
const state = {
    jobKey: '',
    isOpen: false,
    runClose: false,
    blips: [],
    outfitID: 0,
    isFirst: true,
    isTools: false,
    inventoryKB: 0,
    starting: false,
    tickID: 0,
    isVacation: false,
    tickGarageID: 0
};
const empty = null;
const vehInfo = { spawnIDs: [], spawnMax: 2, previewID: 0, currentID: 0 };
const state_vehicles = { isOpen: false, runClose: false, isPreview: false, cameraID: 0 };
function startVehiclesList() {
    return setTick(() => {
        if (state.isVacation)
            return;
        const pedID = PlayerPedId();
        const coords = GetEntityCoords(pedID, true);
        const distanceAll = [];
        for (let item of config[state.jobKey].garages.coords) {
            const [x, y, z] = item.preview.location;
            const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], x, y, z, true);
            if (distance < 50) {
                distanceAll.push({ distance, ...item });
                if (!state_vehicles.isPreview) {
                    DrawMarker(1, x, y, z - 0.3, 0.0, 0.0, 0.0, 0.0, 0, 0.0, 1.5, 1.5, 0.5, 45, 101, 167, 100, false, false, 2, false, empty, empty, false);
                }
            }
        }
        state_vehicles.currentMarker = distanceAll.find(obj => obj.distance < 1.1);
        if (state_vehicles.currentMarker &&
            !IsPedInAnyVehicle(pedID, true) &&
            !IsEntityDead(pedID) &&
            !IsPauseMenuActive()) {
            if (IsControlJustPressed(0, 38)) {
                let items = config[state.jobKey].vehicles.filter((v) => !v.count && !(v.type === 'plane' && !state_vehicles.currentMarker.plane));
                if (!items.length)
                    return exports.NewStart_Notifications.showAttention('error', 'ليس لديك أي مركبات في الجراج اذهب للميناء للحصول!');
                if (state_vehicles.currentMarker.isBoatOnly) {
                    const boatItems = items.filter((i) => i.type === 'boat');
                    if (!boatItems.length)
                        return exports.NewStart_Notifications.showAttention('error', 'ليس لديك أي قوارب هنا اذهب للميناء للحصول عليها!');
                    else
                        items = boatItems;
                }
                else {
                    items = items.filter((i) => i.type !== 'boat');
                }
                if (!items.length)
                    return exports.NewStart_Notifications.showAttention('error', 'ليس لديك أي مركبات في الجراج اذهب للميناء للحصول!');
                for (let id of GetGamePool('CVehicle')) {
                    if (GetVehicleNumberPlateText(id).trim() === exports.NewStart_Factions.info().code.replace('-', ' ')) {
                        const vehID = NetworkGetNetworkIdFromEntity(id);
                        if (!vehInfo.spawnIDs.some(i => i.id === vehID)) {
                            const hash = GetEntityArchetypeName(id);
                            if (!config[state.jobKey].vehicles.find((i) => i.hash === hash)?.count) {
                                if (vehInfo.spawnIDs.length >= vehInfo.spawnMax)
                                    emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: vehID }));
                                else
                                    vehInfo.spawnIDs.push({ id: vehID, hash });
                            }
                        }
                    }
                }
                const vehicles = exports.NewStart_VehicleDealership.getData('vehicles');
                const faction = exports.NewStart_Factions.info();
                const [x, y, z, h] = state_vehicles.currentMarker.isBoatOnly ? state_vehicles.currentMarker.preview.location : state_vehicles.currentMarker.pedPreview;
                const camera = state_vehicles.currentMarker.preview.camera;
                ClearPedTasks(pedID);
                state_vehicles.isOpen = true;
                state_vehicles.isPreview = true;
                state_vehicles.lastMarker = state_vehicles.currentMarker;
                SetNuiFocus(true, true);
                SendNUIMessage(JSON.stringify({
                    type: 'openUI',
                    page: 'vehicles',
                    items: items.map((i) => ({
                        ...i, name: vehicles.find((v) => v.hash === i.hash).name, rankID: faction.ranks.find((r) => r.id === i.rankID).name,
                        spawned: vehInfo.spawnIDs.some(v => v.hash === i.hash)
                    }))
                }));
                SetEntityCoords(pedID, x, y, z - 1, true, false, false, false);
                SetEntityHeading(pedID, h);
                DisplayRadar(false);
                exports.NewStart_HudSystem.closeUI();
                exports.NewStart_MainMenu.toggleAds(false);
                exports.NewStart_Phone.noticesToggle(true);
                state_vehicles.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", camera.posX, camera.posY, camera.posZ, camera.rotX, camera.rotY, camera.rotZ, camera.fov, false, 0);
                SetCamActive(state_vehicles.cameraID, true);
                RenderScriptCams(true, false, 0, true, true);
                localVehicle(items[0].hash, items[0].id, items[0].livery);
                for (let id of GetActivePlayers().filter((i) => i !== PlayerId()))
                    SetEntityAlpha(GetPlayerPed(id), 50, false);
            }
            else if (!state_vehicles.isOpen && !state_vehicles.runClose) {
                SendNUIMessage(JSON.stringify({ type: 'entranceOpen' }));
            }
            state_vehicles.runClose = true;
        }
        else if (state_vehicles.runClose && (!state_vehicles.isPreview || !distanceAll.length)) {
            SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
            closeUI();
        }
    });
}
async function localVehicle(hash, mainID, livery) {
    RequestModel(hash);
    while (!HasModelLoaded(hash))
        await Delay(100);
    let [x, y, z, h] = state_vehicles.lastMarker.isBoatOnly ? state_vehicles.lastMarker.pedPreview : state_vehicles.lastMarker.preview.location;
    vehInfo.previewID = CreateVehicle(hash, x, y, z, h, false, false);
    vehInfo.currentID = mainID;
    SetEntityCollision(vehInfo.previewID, false, false);
    if (Number.isInteger(livery))
        SetVehicleLivery(vehInfo.previewID, livery);
    SetEntityCanBeDamaged(vehInfo.previewID, false);
    SetVehicleHandbrake(vehInfo.previewID, true);
    SetVehicleDirtLevel(vehInfo.previewID, 0);
    FreezeEntityPosition(vehInfo.previewID, true);
}
RegisterNuiCallbackType('NUI:vehicles');
on('__cfx_nui:NUI:vehicles', async (data, cb) => {
    if (data.type === 'get') {
        if (data.id !== vehInfo.currentID) {
            const find = config[state.jobKey].vehicles.find((obj) => obj.id === data.id);
            DeleteVehicle(vehInfo.previewID);
            localVehicle(find.hash, find.id, find.livery);
        }
    }
    else if (data.type === 'delete') {
        const hash = config[state.jobKey].vehicles.find((obj) => obj.id === data.id).hash;
        const spawnInx = vehInfo.spawnIDs.findIndex(i => i.hash === hash);
        if (spawnInx >= 0) {
            const coords = GetEntityCoords(PlayerPedId(), true);
            const vehID = NetworkGetEntityFromNetworkId(vehInfo.spawnIDs[spawnInx].id);
            const vehCoords = GetEntityCoords(vehID, true);
            const distance = GetDistanceBetweenCoords(coords[0], coords[1], coords[2], vehCoords[0], vehCoords[1], vehCoords[2], true);
            if (distance < 65 || !NetworkDoesEntityExistWithNetworkId(vehID)) {
                emitNet('NewStart_VehicleSystem:handleGlobal-server', 'removeVeh', JSON.stringify({ id: vehInfo.spawnIDs[spawnInx].id }));
                exports.NewStart_Notifications.showAttention('success', 'لقد تم سحب المركبة يمكنك العودة للاستدعاء!');
                vehInfo.spawnIDs.splice(spawnInx, 1);
            }
            else {
                exports.NewStart_Notifications.showAttention('error', 'يجب أن تكون المركبة في نفس المنطقة!');
                return cb('Failed');
            }
        }
    }
    else {
        const find = config[state.jobKey].vehicles.find((obj) => obj.id === data.id);
        const faction = exports.NewStart_Factions.info();
        if (!state.outfitID) {
            exports.NewStart_Notifications.showAttention('error', 'يجب اختيار مجموعة من ملابس العمل أولاً!');
            return cb('OK!');
        }
        else if (faction.rankID > find.rankID) {
            exports.NewStart_Notifications.showAttention('error', 'يجب الوصول للرتبة المطلوبة للاستخدام هذه المركبة!');
            return cb('OK!');
        }
        else if (exports.NewStart_MainMenu.getLevel() < find.level) {
            exports.NewStart_Notifications.showAttention('error', 'أنت أقل من المستوي المطلوب لاستخدام هذه المركبة!');
            return cb('OK!');
        }
        const coords = find.type === 'plane' ? state_vehicles.lastMarker.plane :
            (find.type === 'boat' && !state_vehicles.lastMarker.isBoatOnly) ? state_vehicles.lastMarker.boat : state_vehicles.lastMarker.spawn;
        if (vehInfo.spawnIDs.some(i => i.hash === find.hash)) {
            exports.NewStart_Notifications.showAttention('error', 'لقد قمت بالفعل باستدعاء المركبة من قبل!');
            return cb('OK!');
        }
        else if (vehInfo.spawnIDs.length >= vehInfo.spawnMax) {
            exports.NewStart_Notifications.showAttention('error', 'لا يمكنك استدعاء أكثر من مركبتين في نفس اللحظة!');
            return cb('OK!');
        }
        emitNet('NewStart_VehicleSystem:handleGlobal-server', 'createVehicle', JSON.stringify({
            family: 'employee', model: find.hash, type: exports.NewStart_VehicleSystem.method('getVehicleType', find.hash), coords,
            data: { hash: find.hash, livery: find.livery }
        }));
        find.count = null;
        SendNUIMessage(JSON.stringify({ type: 'closeUI' }));
        closeUI();
    }
    cb('OK!');
});
async function createEmployeeVehicle(data) {
    while (!NetworkDoesEntityExistWithNetworkId(data.netID)) {
        await Delay(0);
    }
    const vehID = NetToVeh(data.netID);
    SetPedIntoVehicle(PlayerPedId(), vehID, -1);
    exports.NewStart_Tools.method('passiveModeVehicle');
    const code = exports.NewStart_Factions.info().code.replace('-', ' ');
    SetVehicleNumberPlateText(vehID, code);
    emitNet('NewStart_VehicleSystem:handleGlobal-server', 'asMission', JSON.stringify({ id: data.netID }));
    vehInfo.spawnIDs.push({ id: data.netID, hash: data.hash });
    while (GetVehicleNumberPlateText(vehID).trim() !== code || NetworkGetEntityOwner(vehID) !== PlayerId()) {
        SetVehicleNumberPlateText(vehID, code);
        await Delay(0);
    }
    SetEntityAsMissionEntity(vehID, true, true);
    SetVehicleHasBeenOwnedByPlayer(vehID, true);
    SetVehicleNumberPlateTextIndex(vehID, 0);
    if (Number.isInteger(data.livery))
        SetVehicleLivery(vehID, data.livery);
    SetVehicleDirtLevel(vehID, 0);
    emitNet('NewStart_VehicleSystem:handleGlobal-server', 'syncFuel', JSON.stringify({ id: data.netID, level: 100 }));
    SetVehicleEngineOn(vehID, true, false, true);
    SetVehicleCanLeakPetrol(vehID, false);
}
