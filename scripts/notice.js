const co = require('co');
const notice = require('./release/notice');

co(function*() {
    yield notice();
})
