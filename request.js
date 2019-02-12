var request = require('axios');
var DataSource = require('./lib/data-source');

DataSource.prototype.request = request;
module.exports = request;
