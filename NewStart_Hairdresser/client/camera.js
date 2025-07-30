/* ``````````` ## Development By el8rbawY ## ```````````*/
function createCam(currentMarker) {
   const coord = {
      x: currentMarker.x,
      y: currentMarker.y,
      z: currentMarker.z + 0.6,
      rotZ: 0
   };

   switch(currentMarker.id) { 
      // case 1: // Done
      //    coord.x += 0.45; // Left and right shift
      //    coord.y -= 0.49; 
      //    coord.rotZ = 37.50;
      //    break;

      // case 2: // Done
      //    coord.x -= 0.1; 
      //    coord.y += 0.7; 
      //    coord.rotZ = 180;
      //    break;

      // case 3: // Done
      //    coord.x += 0.65; 
      //    coord.y -= 0.15; 
      //    coord.rotZ = 70;
      //    break;

      // case 4: // Done
      //    coord.x -= 0.6; 
      //    coord.y += 0.38; 
      //    coord.rotZ = 230;
      //    break;

      // case 5:
      //    coord.x += 0.15; 
      //    coord.y += 0.65; 
      //    coord.rotZ = 160;
      //    break;

      case 6: case 7:
         coord.x -= 0.5; 
         coord.y -= 0.4; // Left and right shift
         coord.rotZ = 300;
         break;

      case 8: case 9:
         coord.x += 0.4; // Left and right shift
         coord.y += 0.52;
         coord.rotZ = 135;
         break;
   }

   options.cameraID = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", coord.x, coord.y, coord.z, 0, 0, coord.rotZ, 65, false, 0);
   SetCamActive(options.cameraID, true);
   RenderScriptCams(true, false, 0, true, true);
}