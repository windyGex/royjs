const axios = require('axios');
const DataSource = require('./lib/data-source');

const isDebugger = () => location.href.indexOf('debug') > -1;
const url = (pathname) => {
    if (isDebugger()) {
        const query = location.search.split('&').reduce((currentObj, item) => {
            const itemArr = item.split('=');
            currentObj[itemArr[0]] = itemArr[1];
            return currentObj;
        }, {});
        return `http://rap2api.alibaba-inc.com/app/mock/${query.port}${pathname}`;
    }
    return pathname;
};

axios.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        return Promise.reject(error);
    }
);

axios.interceptors.request.use(function (config) {
    config.url = url(config.url);
    return config;
});

DataSource.prototype.request = axios;
module.exports = axios;
