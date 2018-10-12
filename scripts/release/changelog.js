const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const request = require('request');
const inquirer = require('inquirer');
const conventionalChangelog = require('conventional-changelog');

const changelogPath = 'CHANGELOG.md';
const latestedLogPath = 'LATESTLOG.md';
const cwd = process.cwd();

module.exports = function * changelog() {
    const packagePath = path.resolve(__dirname, '../../package.json');
    let packageInfo = require(packagePath);

    const tnpmInfo = yield getRemotePkgInfo(true);
    const tnpmVersion = tnpmInfo['dist-tags'].latest;

    if (tnpmInfo && !semver.gt(packageInfo.version, tnpmVersion)) {
        console.log(`[提示] [local:${packageInfo.version}] [tnpm:${tnpmVersion}] 请为本次提交指定新的版本号:`);

        let uptype = yield inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: '请选择版本升级的类型',
                choices: [
                    {
                        name: 'z 位升级',
                        value: 'z'
                    }, {
                        name: 'y 位升级',
                        value: 'y'
                    }, {
                        name: 'x 位升级',
                        value: 'x'
                    }, {
                        name: '不升级',
                        value: 'null'
                    }
                ]
            }
        ]);

        packageInfo.version = uptype.type === 'null' ? tnpmVersion : updateVersion(tnpmVersion, uptype.type);

        yield fs.writeJson(packagePath, packageInfo, { spaces: 2 });

        console.log(`[提示] 回写版本号 ${packageInfo.version} 到 package.json success`);
    } else {
        console.log(`[提示] [本地 package.json 版本:${packageInfo.version}] > [tnpm 版本:${tnpmVersion}] `);
    }

    console.log(`正在生成 ${changelogPath} 文件,请稍等几秒钟...`);

    conventionalChangelog({
        preset: 'angular'
    })
        .on('data', (chunk) => {
            const log = chunk.toString().replace(/(\n## [.\d\w]+ )\(([\d-]+)\)\n/g, (all, s1, s2) => {
                return `${s1}/ ${s2}\n`;
            });

            // TODO: 通过 ast 的方式插入到文件中，参考 build/generate-api.json

            let changelog = fs.readFileSync(changelogPath, 'utf8');
            changelog = changelog.replace(/# Change Log\s\s/, '# Change Log \n\n' + log);
            fs.writeFileSync(changelogPath, changelog);

            const lines = log.split(/\n/g);
            let firstIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (/^#{1,3}/.test(line)) {
                    firstIndex = i;
                    break;
                }
            }

            if (firstIndex > -1) {
                fs.writeFileSync(latestedLogPath, log);
            }
        });

    console.log(`成功将 ${changelogPath} 文件生成到 ${cwd} 目录下`);
};

function getRemotePkgInfo(ignoreError = false) {
    return new Promise(function (resolve, reject) {
        var requestUrl = 'http://registry.npm.alibaba-inc.com/@royjs/core';

        try {
            request({
                url: requestUrl,
                timeout: 5000,
                json: true
            }, function (error, response, body) {
                if (error && !ignoreError) {
                    reject(error);
                }
                resolve(body);
            });
        } catch (err) {
            if (!ignoreError) {
                reject(err);
            }
            resolve();
        }
    });
}

function updateVersion(version, type = 'z', addend = 1) {
    if (!semver.valid(version)) {
        return version;
    }

    const versionArr = version.split('.');

    switch (type) {
        case 'x':
            versionArr[2] = 0;
            versionArr[1] = 0;
            versionArr[0] = parseInt(versionArr[0]) + 1;
            break;
        case 'y':
            versionArr[2] = 0;
            versionArr[1] = parseInt(versionArr[1]) + 1;
            break;
        default:
            versionArr[2] = parseInt(versionArr[2]) + addend;
    }

    return versionArr.join('.');
}
