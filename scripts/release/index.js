/* eslint-disable */
const co = require('co');
const changelog = require('./changelog');
const notice = require('./notice');
const utils = require('../utils');

const cwd = process.cwd();
const runCmd = utils.runCmd;

let packageInfo;

co(function * () {
    yield changelog();
    packageInfo = require('../../package.json');
    yield pushRemote();
}).catch(err => {
    console.error('Release failed', err.stack);
});

function * pushRemote() {
    yield runCmd('git add .');
    yield runCmd(`git commit -m 'chore: Release-${packageInfo.version}'`);
    yield runCmd(`git tag ${packageInfo.version}`);
    yield runCmd(`git push origin ${packageInfo.version}`);
    yield runCmd('git push origin 1.x');
}
