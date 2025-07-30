/* ``````````` ## Development By el8rbawY ## ```````````*/
const coordinates = [
   // { id: 1, gps: { x: 76.760, y: -1393.305, z: 29.364 }, marker: { x: 70.931, y: -1399.186, z: 29.364, h: 325 } },
   // { id: 2, gps: { x: 424.140, y: -806.057, z: 29.482 }, marker: { x: 430.114, y: -800.162, z: 29.482, h: 166 } },
   // { id: 3, gps: { x: 123.323, y: -220.971, z: 54.554 }, marker: { x: 123.323, y: -220.971, z: 54.554, h: 350 } },
   // { id: 4, gps: { x: -160.945, y: -302.835, z: 39.726 }, marker: { x: -158.373, y: -296.492, z: 39.726, h: 163 } },
   // { id: 5, gps: { x: -711.890, y: -154.232, z: 37.401 }, marker: { x: -708.369, y: -161.063, z: 37.401, h: 36 } },
   // { id: 6, gps: { x: -1452.052, y: -235.859, z: 49.802 }, marker: { x: -1457.512, y: -241.279, z: 49.802, h: 322 } },
   // { id: 7, gps: { x: -1192.588, y: -771.969, z: 17.316 }, marker: { x: -1192.588, y: -771.969, z: 17.316, h: 135 } },
   // { id: 8, gps: { x: -821.749, y: -1075.213, z: 11.317 }, marker: { x: -830.096, y: -1072.931, z: 11.317, h: 285 } }, 
   { id: 1, type: 'main', marker: { x: -3175.4240, y: 1041.9296, z: 20.8549, h: 333.1574 }},
   { id: 2,  marker: { x: -3172.931, y: 1046.861, z: 20.854, h: 333.1574 }}, 

   { id: 3, type: 'main', marker: { x: -1104.8248, y: 2704.5165, z: 19.1025, h: 315.9763 }},
   { id: 4, marker: { x: -1100.3268, y: 2703.9560, z: 19.1025, h: 44.0196 }},
   { id: 5, marker: { x: -1107.1684, y: 2706.0583, z: 19.1025, h: 317.4803 }},

   { id: 6, type: 'main', marker: { x: 617.6703, y: 2766.6726, z: 42.0856, h: 182 }},
   { id: 7, marker: { x: 617.815, y: 2761.041, z: 42.085, h: 182 }},
   
   { id: 8, type: 'main', marker: { x: 1190.1300, y: 2707.9752, z: 38.2102, h: 272.2913 }},
   { id: 9, marker: { x: 1189.4078, y: 2710.6800, z: 38.2102, h: 272.2913 }},
   { id: 10, marker: { x: 1193.0900, y: 2704.5627, z: 38.2102, h: 1.5 }},

   { id: 11, type: 'main', marker: { x: 1690.8140, y: 4828.9971, z: 42.0520, h: 185.5905 }},
   { id: 12, marker: { x: 1693.4160, y: 4830.0727, z: 42.0520, h: 185.5905 }},
   { id: 13, marker: { x: 1687.8330, y: 4825.6229, z: 42.0520, h: 283.4645 }},

   { id: 14, type: 'main', marker: { x: 8.0858, y: 6518.5249, z: 31.8747, h: 130.0629 }}, //
   { id: 15, marker: { x: 10.4571, y: 6517.0251, z: 31.8747, h: 136.0629 }},
   { id: 16, marker: { x: 3.6208, y: 6518.99667, z: 31.8747, h: 226.7716 }},
];

// ---
function createCam(type, currentMarker) {
   if (options.cameraID) {
      DestroyCam(options.cameraID, true);
      RenderScriptCams(false, false, 0, true, true);
   }

   const coord = {
      x: currentMarker.coord.x,
      y: currentMarker.coord.y,
      z: currentMarker.coord.z,
      rotZ: 0
   }; 

   switch(currentMarker.id) { 
      case 1: case 2:
         if (type === 'face') {
            coord.x += 0.23; coord.y += 0.5; coord.z += 0.6; coord.rotZ = 150;
      
         } else if (type === 'body') {
            coord.x += 0.41; coord.y += 0.8; coord.z += 0.38; coord.rotZ = 150;
      
         } else if (type === 'feet') {
            coord.x += 0.41; coord.y += 0.92; coord.z -= 0.54; coord.rotZ = 150;
      
         } else {
            coord.x += 0.95; coord.y += 1.45; coord.z -= 0.1; coord.rotZ = 150;
         }
         break;

      case 3: case 5:
         if (type === 'face') {
            coord.x += 0.4; coord.y += 0.5; coord.z += 0.59; coord.rotZ = 135;
      
         } else if (type === 'body') {
            coord.x += 0.65; coord.y += 0.75; coord.z += 0.4; coord.rotZ = 135;
      
         } else if (type === 'feet') {
            coord.x += 0.65; coord.y += 0.75; coord.z -= 0.55; coord.rotZ = 135;

         } else {
            coord.x += 1.2; coord.y += 1.2; coord.z -= 0.1; coord.rotZ = 135;
         }
         break;

      case 4:
         if (type === 'face') {
            coord.x -= 0.5; coord.y += 0.4; coord.z += 0.59; coord.rotZ = 225;
      
         } else if (type === 'body') {
            coord.x -= 0.75; coord.y += 0.65; coord.z += 0.4; coord.rotZ = 225;
      
         } else if (type === 'feet') {
            coord.x -= 0.75; coord.y += 0.65; coord.z -= 0.55; coord.rotZ = 225;

         } else {
            coord.x -= 1.2; coord.y += 1.2; coord.z -= 0.1; coord.rotZ = 225;
         }
         break;

      case 6: case 7:
         if (type === 'face') {
            coord.x += 0.04; coord.y -= 0.54; coord.z += 0.59;
      
         } else if (type === 'body') {
            coord.x += 0.03; coord.y -= 0.9; coord.z += 0.4;
      
         } else if (type === 'feet') {
            coord.x += 0.03; coord.y -= 1; coord.z -= 0.55;

         } else {
            coord.x -= 0.07; coord.y -= 1.7; coord.z -= 0.1;
         }
         break;

      case 8: case 9:
         if (type === 'face') {
            coord.x += 0.65; coord.y += 0.1; coord.z += 0.59; coord.rotZ = 90;
      
         } else if (type === 'body') {
            coord.x += 1; coord.y += 0.1; coord.z += 0.4; coord.rotZ = 90;
      
         } else if (type === 'feet') {
            coord.x += 1; coord.y += 0.1; coord.z -= 0.53; coord.rotZ = 90;

         } else {
            coord.x += 1.7; coord.z -= 0.1; coord.rotZ = 90;
         }
         break;

      case 10:
         if (type === 'face') {
            coord.x -= 0.05; coord.y += 0.7; coord.z += 0.59; coord.rotZ = 180;
      
         } else if (type === 'body') {
            coord.x -= 0.1; coord.y += 1; coord.z += 0.4; coord.rotZ = 180;
      
         } else if (type === 'feet') {
            coord.x -= 0.1; coord.y += 1; coord.z -= 0.53; coord.rotZ = 180;

         } else {
            coord.y += 1.7; coord.z -= 0.1; coord.rotZ = 180;
         }
         break;

      case 11: case 12:
         if (type === 'face') {
            coord.x += 0.15; coord.y -= 0.6; coord.z += 0.59; coord.rotZ = 10;
      
         } else if (type === 'body') {
            coord.x += 0.25; coord.y -= 1; coord.z += 0.4; coord.rotZ = 10;
      
         } else if (type === 'feet') {
            coord.x += 0.25; coord.y -= 1; coord.z -= 0.5; coord.rotZ = 10;

         } else {
            coord.y -= 1.7; coord.z -= 0.1; coord.rotZ = 5;
         }
         break;

      case 13: // ---
         if (type === 'face') {
            coord.x += 0.65; coord.y += 0.2; coord.z += 0.59; coord.rotZ = 100;
      
         } else if (type === 'body') {
            coord.x += 1; coord.y += 0.3; coord.z += 0.4; coord.rotZ = 100;
      
         } else if (type === 'feet') {
            coord.x += 1; coord.y += 0.3; coord.z -= 0.5; coord.rotZ = 100;

         } else {
            coord.x += 1.7; coord.y += 0.3; coord.z -= 0.1; coord.rotZ = 100;
         }
         break;

      case 14: case 15:
         if (type === 'face') {
            coord.x -= 0.5; coord.y -= 0.5; coord.z += 0.55; coord.rotZ = -45;
      
         } else if (type === 'body') {
            coord.x -= 0.7; coord.y -= 0.8; coord.z += 0.4; coord.rotZ = -45;
      
         } else if (type === 'feet') {
            coord.x -= 0.7; coord.y -= 0.8; coord.z -= 0.5; coord.rotZ = -45;

         } else {
            coord.x -= 1.3; coord.y -= 1.2; coord.z -= 0.1; coord.rotZ = -45;
         }
         break;

      case 16:
         if (type === 'face') {
            coord.x += 0.6; coord.y -= 0.5; coord.z += 0.59; coord.rotZ = 45;
      
         } else if (type === 'body') {
            coord.x += 0.8; coord.y -= 0.7; coord.z += 0.4; coord.rotZ = 45;
      
         } else if (type === 'feet') {
            coord.x += 0.8; coord.y -= 0.7; coord.z -= 0.5; coord.rotZ = 45;

         } else {
            coord.x += 1.3; coord.y -= 1.2; coord.z -= 0.1; coord.rotZ = 45;
         }
         break;

      // case 1:
      //    if (type === 'face') { 
      //       coord.x += 0.28; coord.y += 0.45;
      //       coord.z += 0.6; coord.rotZ = 140;

      //    } else if (type === 'body') {
      //       coord.x += 0.5; coord.y += 0.75;
      //       coord.z += 0.4; coord.rotZ = 140;

      //    } else if (type === 'feet') {
      //       coord.x += 0.5; coord.y += 0.87;
      //       coord.z -= 0.5; coord.rotZ = 140;

      //    } else {
      //       coord.x += 1; coord.y += 1.3;
      //       coord.z -= 0.1; coord.rotZ = 140;
      //    }

      //    break;

      // case 2:
      //    if (type === 'face') {
      //       coord.x -= 0.1; coord.y -= 0.56;
      //       coord.z += 0.6; coord.rotZ = -20;

      //    } else if (type === 'body') {
      //       coord.x -= 0.2; coord.y -= 0.85;
      //       coord.z += 0.35; coord.rotZ = -20;

      //    } else if (type === 'feet') {
      //       coord.x -= 0.2; coord.y -= 1.05;
      //       coord.z -= 0.5; coord.rotZ = -20;

      //    } else {
      //       coord.x -= 0.55; coord.y -= 1.6;
      //       coord.z -= 0.1; coord.rotZ = -20;
      //    }

      //    break;

      // case 3:
      //    if (type === 'face') {
      //       coord.x += 0.08; coord.y += 0.54;
      //       coord.z += 0.6; coord.rotZ = 165;

      //    } else if (type === 'body') {
      //       coord.x += 0.16; coord.y += 0.9;
      //       coord.z += 0.4; coord.rotZ = 165;

      //    } else if (type === 'feet') {
      //       coord.x += 0.16; coord.y += 1;
      //       coord.z -= 0.54; coord.rotZ = 165;

      //    } else {
      //       coord.x += 0.5; coord.y += 1.7;
      //       coord.z -= 0.1; coord.rotZ = 165;
      //    }

      //    break;

      // case 4:
      //    if (type === 'face') {
      //       coord.x -= 0.13; coord.y -= 0.5;
      //       coord.z += 0.6; coord.rotZ = -20;
      
      //    } else if (type === 'body') {
      //       coord.x -= 0.28; coord.y -= 0.85;
      //       coord.z += 0.38; coord.rotZ = -20;
      
      //    } else if (type === 'feet') {
      //       coord.x -= 0.28; coord.y -= 0.95;
      //       coord.z -= 0.54; coord.rotZ = -20;
      
      //    } else {
      //       coord.x -= 0.6; coord.y -= 1.6;
      //       coord.z -= 0.1; coord.rotZ = -20;
      //    }
      
      //    break;

      // case 5:
      //    if (type === 'face') {
      //       coord.x -= 0.32; coord.y += 0.43;
      //       coord.z += 0.6; coord.rotZ = -150;
      
      //    } else if (type === 'body') {
      //       coord.x -= 0.52; coord.y += 0.85;
      //       coord.z += 0.4; coord.rotZ = -150;
      
      //    } else if (type === 'feet') {
      //       coord.x -= 0.6; coord.y += 0.9;
      //       coord.z -= 0.54; coord.rotZ = -150;
      
      //    } else {
      //       coord.x -= 0.9; coord.y += 1.6;
      //       coord.z -= 0.1; coord.rotZ = -150;
      //    }
      
      //    break;

      // case 6:
      //    if (type === 'face') {
      //       coord.x += 0.3; coord.y += 0.44;
      //       coord.z += 0.6; coord.rotZ = 135;
      
      //    } else if (type === 'body') {
      //       coord.x += 0.55; coord.y += 0.71;
      //       coord.z += 0.39; coord.rotZ = 135;
      
      //    } else if (type === 'feet') {
      //       coord.x += 0.65; coord.y += 0.8;
      //       coord.z -= 0.54; coord.rotZ = 135;
      
      //    } else {
      //       coord.x += 1.2; coord.y += 1.25;
      //       coord.z -= 0.1; coord.rotZ = 135;
      //    }
      
      //    break;

      // case 7:
      //    if (type === 'face') {
      //       coord.x -= 0.35; coord.y -= 0.4;
      //       coord.z += 0.61; coord.rotZ = -50;
      
      //    } else if (type === 'body') {
      //       coord.x -= 0.65; coord.y -= 0.67;
      //       coord.z += 0.4; coord.rotZ = -50;
      
      //    } else if (type === 'feet') {
      //       coord.x -= 0.72; coord.y -= 0.76;
      //       coord.z -= 0.54; coord.rotZ = -50;
      
      //    } else {
      //       coord.x -= 1.45; coord.y -= 1.05;
      //       coord.z -= 0.1; coord.rotZ = -50;
      //    }
      
      //    break;

      // case 8:
      //    if (type === 'face') {
      //       coord.x += 0.52; coord.y += 0.15;
      //       coord.z += 0.61; coord.rotZ = 100;
      
      //    } else if (type === 'body') {
      //       coord.x += 0.85; coord.y += 0.22; 
      //       coord.z += 0.39; coord.rotZ = 100;
      
      //    } else if (type === 'feet') {
      //       coord.x += 0.95; coord.y += 0.22;
      //       coord.z -= 0.54; coord.rotZ = 100;
      
      //    } else {
      //       coord.x += 1.67; coord.y += 0.25; 
      //       coord.z -= 0.1; coord.rotZ = 100;
      //    }
      
      //    break;
   }

   options.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", coord.x, coord.y, coord.z, 0, 0, coord.rotZ, 65, false, 0);
   SetCamActive(options.cameraID, true);
   RenderScriptCams(true, false, 0, true, true);
}