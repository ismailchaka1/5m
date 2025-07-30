const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors')
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const app = express();
const { environment } = require('../services/config');

// -- middlewares
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({
	windowMs: 5 * (60 * 1000), // 5 minutes
	limit: 150, // Limit each IP to 150 requests per `window` (here, per 5 minutes).
   skip: (req) => {
      console.log(req.ip, req.hostname, ['::ffff:127.0.0.1', '::1', '::ffff:57.128.22.37'].includes(req.ip));
      return ['::ffff:127.0.0.1', '::1', '::ffff:57.128.22.37'].includes(req.ip);
   }
}));
app.use(compression());
if (environment === 'test') app.use(morgan('tiny'));

// -- routes
app.use('/api/users', require('./routes/users'));
app.use('/api/store', require('./routes/store'));
app.use('/api/game', require('./routes/game'));

module.exports = app;