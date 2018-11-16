
const co = require('co');
const changelog = require('./release/changelog');

co(function*() {
    yield changelog();
});
