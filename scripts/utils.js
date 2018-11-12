const { exec } = require('child_process');
const request = require('request');

exports.runCmd = function (cmd, opts = { maxBuffer: 1024 * 5000 }) {
    return new Promise((resolve, reject) => {
        exec(cmd, opts, (err, stdout) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
};

exports.ajaxPost = function (url, data) {
    return new Promise((resolve, reject) => {
        request.post({
            url,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }, (error, response, body) => {
            error ? reject(error) : resolve(body);
        });
    });
};

// 钉钉机器人 hook
exports.dingGroups = [
    // Hippo 超级战队
    'https://oapi.dingtalk.com/robot/send?access_token=5d3c6985e73016080ebb2d6e3ac69603d239eed6cff3090b8c259537214ffd3f',
    // // Hippo 使用讨论
    'https://oapi.dingtalk.com/robot/send?access_token=6122acc67589c1bf9ee362817245d12506005f27d01741a43a4fefeec5f99c7c'
];
