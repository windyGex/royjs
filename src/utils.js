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
    const oldMethod = target[key];
    const limit = 300;
    let wait = false;
    descriptor.value = function (...args) {
        if (!wait) {
            oldMethod.apply(this, args);
            wait = true;
            setTimeout(function () {
                wait = false;
            }, limit);
        }
    };
};

// async method
// promise method
export const takeLatest = async function (target, key, descriptor) {
    const oldMethod = target[key];
    descriptor.value = function (...args) {

    };
};
