var request = require('@alife/hippo-request');
var DataSource = require('./lib/data-source');

DataSource.prototype.request = request;
module.exports = request;
