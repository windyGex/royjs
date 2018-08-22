const request = require('@alife/hippo-request');
const DataSource = require('./lib/data-source');

DataSource.prototype.request = request;
module.exports = request;
