local DistanceBetweenCoords = function(coordsA, coordsB, useZ)
   -- language faster equivalent:
   local firstVec = vector3(coordsA.x, coordsA.y, coordsA.z)
   local secondVec = vector3(coordsB.x, coordsB.y, coordsB.z)
   if useZ then
       return #(firstVec - secondVec)
   else 
       return #(firstVec.xy - secondVec.xy)
   end
end

exports('DistanceBetweenCoords', DistanceBetweenCoords )