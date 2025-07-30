-- Hide Health Bar 
Citizen.CreateThread(function()
   local minimap = RequestScaleformMovie("minimap")
   SetBigmapActive(true, false)
   Wait(0)
   
   while true do
      Wait(0)
      SetBigmapActive(false, false)
      BeginScaleformMovieMethod(minimap, "SETUP_HEALTH_ARMOUR")
      ScaleformMovieMethodAddParamInt(3)
      EndScaleformMovieMethod()
   end
end)

--------------
exports('getEntityInView', function(cam, ignore)
	local coords = GetCamCoord(cam)
	local forward_vector = RotAnglesToVec(GetCamRot(cam, 2))
	--DrawLine(coords, coords+(forward_vector*100.0), 255,0,0,255) -- debug line to show LOS of cam
	local rayhandle = CastRayPointToPoint(coords, coords+(forward_vector*200.0), 10, ignore, 0)
	local _, _, _, _, entityHit = GetRaycastResult(rayhandle)

	return entityHit
end)

function RotAnglesToVec(rot) -- input vector3
	local z = math.rad(rot.z)
	local x = math.rad(rot.x)
	local num = math.abs(math.cos(x))
	return vector3(-math.sin(z)*num, math.cos(z)*num, math.sin(x))
end