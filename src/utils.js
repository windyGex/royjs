const checkType = function (item) {
    return Object.prototype.toString.call(item).replace(/\[object\s(.*)\]/, (all, matched) => matched);
};

export const isPlainObject = function (item) {
    return checkType(item) === 'Object';
};
export const isArray = function (item) {
    return checkType(item) === 'Array';
};

export const throttle = function (target, key, descriptor) {
    const fn = target[key];
    const limit = 300;
    let wait = false;
    descriptor.value = function (...args) {
        if (!wait) {
            fn.apply(this, args);
            wait = true;
            setTimeout(function () {
                wait = false;
            }, limit);
        }
    };
};

export const warning = function warning(msg) {
    console.error(msg);
};
