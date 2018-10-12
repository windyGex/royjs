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
    yield publishToTnpm();
    yield pushMaster();
    yield notice();
}).catch(err => {
    console.error('Release failed', err.stack);
});

function * pushMaster() {
    yield runCmd('git checkout master');
    yield runCmd('git add .');
    yield runCmd(`git commit -m 'chore: Release-${packageInfo.version}'`);
    yield runCmd('git push roy master');
}

function * publishToTnpm() {
    yield runCmd('git checkout master');
    yield runCmd('git pull');
    yield runCmd(`git tag ${packageInfo.version}`);
    yield runCmd(`git push roy ${packageInfo.version}`);
    yield runCmd(`git push github ${packageInfo.version}`);
    yield runCmd('npm publish');
}
