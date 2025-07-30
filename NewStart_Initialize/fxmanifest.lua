fx_version 'cerulean'
game 'gta5'

author 'el8rbawY'
description 'Initial configuration of the client'
version '1.0.0'

resource_type 'gametype' { name = 'Roleplay' }
loadscreen 'ui_page/build/index.html'
loadscreen_manual_shutdown 'yes'

files { 
   'ui_page/build/*',
   'ui_page/build/static/css/*.css',
   'ui_page/build/static/js/*.js',
   'ui_page/build/static/media/*',
   'ui_page/build/images/*',
   'ui_page/build/sounds/*'
}

client_script 'script.js'
server_scripts { 'server/*' }