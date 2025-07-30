const { environment } = require('./services/config');
const levelData = require('./services/static/level.json');

require('./services/database');
const game = require('./game');
const web = require('./web');
require('./discord/roles');

if (environment === 'main') {
   const https = require('https');
   const fs = require('fs');
   const path = require('path');
   const __dirname = path.resolve();

   const options = {
      key: fs.readFileSync(`${__dirname}/resources/NewStart_HTTP/services/SSL/ban27.key`),
      cert: fs.readFileSync(`${__dirname}/resources/NewStart_HTTP/services/SSL/newstart1_online.crt`),
      ca: fs.readFileSync(`${__dirname}/resources/NewStart_HTTP/services/SSL/newstart1_online.ca-bundle`)
   };

   https.createServer(options, web).listen(4010, console.log(`Web server is running on the port 4010...`));

} else {
   web.listen(4010, _=> console.log(`Web server is running on the port 4010...`));
}

// ---
game.listen(4000, _=> console.log(`Game server is running on the port 4000...`));

// ---
exports('method', (type, data) => {
   if (type === 'getLevel') {
      let level = levelData.findIndex(i => i > data);
      level = (level >= 0) ? level + 1 : (!data) ? 1 : levelData.length + 1;
      return level;
   }
});