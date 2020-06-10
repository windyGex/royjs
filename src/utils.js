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

export const deepCopy = function deepCopy(params) {
    return JSON.parse(JSON.stringify(params));
};

export const jsonEqual = function equal(x, y) {
    if (checkType(x) === checkType(y)) {
        return JSON.stringify(x) === JSON.stringify(y);
    }
    return false;
};

export const diff = function diff(left, right, previousPath = '', keys = []) {
    Object.entries(left).forEach(([k, v]) => {
        const currentPath = previousPath ? `${previousPath}.${k}` : k;
        if (isPlainObject(v) && isPlainObject(right[k])) {
            diff(v, right[k], currentPath, keys);
        } else if (!jsonEqual(right[k], v)) {
            keys.push(currentPath);
        }
    });
    return keys;
};
