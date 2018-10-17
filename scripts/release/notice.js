const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { runCmd, dingGroups, ajaxPost } = require('../utils');

module.exports = function * () {
    const result = yield inquirer.prompt([{
        name: 'sync',
        type: 'confirm',
        default: true,
        message: chalk.green.bold('是否同步发布信息到钉钉群')
    }]);
    if (!result.sync) {
        return;
    }

    const packageInfo = require(path.resolve('package.json'));
    const username = yield runCmd('git config --get user.name');
    let latestLog = yield fs.readFile(path.resolve('LATESTLOG.md'), 'utf8');
    latestLog = latestLog
        .replace(/\n+/g, '\n')
        .replace(/\(\[[\d\w]+\]\(https:\/\/[^\)]+\)\)/g, '');

    const dingContent = `[公告] Royjs新版本发布通知
- 版本号: ${packageInfo.version}
- 发布人: ${username}

更新详情如下:

${latestLog}`;

    for (let i = 0; i < dingGroups.length; i++) {
        const url = dingGroups[i];
        yield ajaxPost(url, {
            msgtype: 'markdown',
            markdown: {
                title: '[公告] Royjs新版本发布通知',
                text: dingContent
            }
        });
    }
};
