resource_manifest_version '77731fab-63ca-442c-a67b-abc70f28dfa5'
fx_version 'cerulean'
game 'gta5'

version '1.0.0'
this_is_a_map 'yes'

client_scripts {
   'fingerpoint/client.lua',
   'IPL’s/lib/common.lua',
	--- 'seat_shuffle/main.lua',
	'methods/main.lua',
	'ultrawide-minimap/client.lua',
	   
	"IPL’s/lib/observers/interiorIdObserver.lua"
	, "IPL’s/lib/observers/officeSafeDoorHandler.lua"
	, "IPL’s/client.lua"

	-- GTA V
	, "IPL’s/gtav/base.lua"   -- Base IPLs to fix holes
	, "IPL’s/gtav/ammunations.lua"
	, "IPL’s/gtav/bahama.lua"
	, "IPL’s/gtav/floyd.lua"
	, "IPL’s/gtav/franklin.lua"
	, "IPL’s/gtav/franklin_aunt.lua"
	, "IPL’s/gtav/graffitis.lua"
	, "IPL’s/gtav/pillbox_hospital.lua"
	, "IPL’s/gtav/lester_factory.lua"
	, "IPL’s/gtav/michael.lua"
	, "IPL’s/gtav/north_yankton.lua"
	, "IPL’s/gtav/red_carpet.lua"
	, "IPL’s/gtav/simeon.lua"
	, "IPL’s/gtav/stripclub.lua"
	, "IPL’s/gtav/trevors_trailer.lua"
	, "IPL’s/gtav/ufo.lua"
	, "IPL’s/gtav/zancudo_gates.lua"

	-- GTA Online
	, "IPL’s/gta_online/apartment_hi_1.lua"
	, "IPL’s/gta_online/apartment_hi_2.lua"
	, "IPL’s/gta_online/house_hi_1.lua"
	, "IPL’s/gta_online/house_hi_2.lua"
	, "IPL’s/gta_online/house_hi_3.lua"
	, "IPL’s/gta_online/house_hi_4.lua"
	, "IPL’s/gta_online/house_hi_5.lua"
	, "IPL’s/gta_online/house_hi_6.lua"
	, "IPL’s/gta_online/house_hi_7.lua"
	, "IPL’s/gta_online/house_hi_8.lua"
	, "IPL’s/gta_online/house_mid_1.lua"
	, "IPL’s/gta_online/house_low_1.lua"

	-- DLC High Life
	, "IPL’s/dlc_high_life/apartment1.lua"
	, "IPL’s/dlc_high_life/apartment2.lua"
	, "IPL’s/dlc_high_life/apartment3.lua"
	, "IPL’s/dlc_high_life/apartment4.lua"
	, "IPL’s/dlc_high_life/apartment5.lua"
	, "IPL’s/dlc_high_life/apartment6.lua"

	-- DLC Heists
	, "IPL’s/dlc_heists/carrier.lua"
	, "IPL’s/dlc_heists/yacht.lua"

	-- DLC Executives & Other Criminals
	, "IPL’s/dlc_executive/apartment1.lua"
	, "IPL’s/dlc_executive/apartment2.lua"
	, "IPL’s/dlc_executive/apartment3.lua"

	-- DLC Finance & Felony
	, "IPL’s/dlc_finance/office1.lua"
	, "IPL’s/dlc_finance/office2.lua"
	, "IPL’s/dlc_finance/office3.lua"
	, "IPL’s/dlc_finance/office4.lua"
	, "IPL’s/dlc_finance/organization.lua"

	-- DLC Bikers
	, "IPL’s/dlc_bikers/cocaine.lua"
	, "IPL’s/dlc_bikers/counterfeit_cash.lua"
	, "IPL’s/dlc_bikers/document_forgery.lua"
	, "IPL’s/dlc_bikers/meth.lua"
	, "IPL’s/dlc_bikers/weed.lua"
	, "IPL’s/dlc_bikers/clubhouse1.lua"
	, "IPL’s/dlc_bikers/clubhouse2.lua"
	, "IPL’s/dlc_bikers/gang.lua"

	-- DLC Import/Export
	, "IPL’s/dlc_import/garage1.lua"
	, "IPL’s/dlc_import/garage2.lua"
	, "IPL’s/dlc_import/garage3.lua"
	, "IPL’s/dlc_import/garage4.lua"
	, "IPL’s/dlc_import/vehicle_warehouse.lua"

	-- DLC Gunrunning
	, "IPL’s/dlc_gunrunning/bunkers.lua"
	, "IPL’s/dlc_gunrunning/yacht.lua"

	-- DLC Smuggler's Run
	, "IPL’s/dlc_smuggler/hangar.lua"

	-- DLC Doomsday Heist
	, "IPL’s/dlc_doomsday/facility.lua"

	-- DLC After Hours
	, "IPL’s/dlc_afterhours/nightclubs.lua"
	
	-- DLC Diamond Casino (Requires forced build 2060 or higher)
	, "IPL’s/dlc_casino/casino.lua"
	, "IPL’s/dlc_casino/penthouse.lua"

	-- DLC Tuners (Requires forced build 2372 or higher)
	, "IPL’s/dlc_tuner/garage.lua"
	, "IPL’s/dlc_tuner/meetup.lua"
	, "IPL’s/dlc_tuner/methlab.lua"
	
	-- DLC The Contract (Requires forced build 2545 or higher)
	, "IPL’s/dlc_security/studio.lua"
	, "IPL’s/dlc_security/billboards.lua"
	, "IPL’s/dlc_security/musicrooftop.lua"
	, "IPL’s/dlc_security/garage.lua"
	, "IPL’s/dlc_security/office1.lua"
	, "IPL’s/dlc_security/office2.lua"
	, "IPL’s/dlc_security/office3.lua"
	, "IPL’s/dlc_security/office4.lua"
}

server_exports {
	'DistanceBetweenCoords'
}