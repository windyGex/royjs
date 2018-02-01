import axios from 'axios';
import jsonpAdapter from 'axios-jsonp';

const isDebugger = location.href.indexOf('__debugger__') > -1;
const url = (pathname) => {
    if (isDebugger) {
        const query = location.search.split('&').reduce((currentObj, item) => {
            const itemArr = item.split('=');
            currentObj[itemArr[0]] = itemArr[1];
            return currentObj;
        }, {});
        return `http://rap.alibaba-inc.com/mockjsdata/${query.port || 2383}${pathname}`;
    }
    return pathname;
};
const req = {};

['get', 'post', 'put', 'delete', 'patch', 'jsonp'].forEach(item => {
    req[item] = (pathname, params, config) => {
        config = config || {};
        if (item === 'jsonp') {
            config.adapter = jsonpAdapter;
        }
        return axios({
            url: url(pathname),
            method: item.toUpperCase(),
            data: params,
            ...config
        }, config).then(ret => {
            return ret.data;
        }).then(body => {
            return new Promise((resolve, reject) => {
                if (body.success) {
                    resolve(body.returnValue || body);
                } else {
                    reject(body.errorMsg);
                }
            });
        });
    };
});

export default req;
