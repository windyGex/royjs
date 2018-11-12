const notice = require('./release/notice');
const co = require('co');

co(function * () {
    yield notice();
}).catch(err => {
    console.error('Notice failed', err.stack);
});;
