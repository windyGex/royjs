
const checkType = function (item) {
    return Object.prototype.toString.call(item).replace(/\[object\s(.*)\]/, (all, matched) => matched);
};

export const isPlainObject = function (item) {
    return checkType(item) === 'Object';
};
export const isArray = function (item) {
    return checkType(item) === 'Array';
};
