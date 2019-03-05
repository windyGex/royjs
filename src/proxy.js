/* eslint-disable no-use-before-define */
import Events from './events';
import { isPlainObject } from './utils';

function wrap(key, value, ret) {
    if (!(value && value.$proxy)) {
        if (isPlainObject(value)) {
            value = observable(value, ret);
            value.on('get', function (args) {
                const currentKey = `${key}.${args.key}`;
                ret.trigger('get', {
                    key: currentKey
                });
            });
            value.on('change', function (args) {
                const currentKey = `${key}.${args.key}`;
                ret.trigger('change', {
                    ...args,
                    ...{
                        key: currentKey
                    }
                });
            });
        } else if (Array.isArray(value)) {
            value = observable(value, ret);
            value.on('change', function (args) {
                const mixArgs = { ...args };
                if (!args.key) {
                    mixArgs.key = key;
                } else {
                    mixArgs.key = `${key}.${args.key}`;
                }
                ret.trigger('change', mixArgs);
            });
        }
    }
    return value;
}

function rawJSON(target) {
    if (Array.isArray(target)) {
        return target.map(item => {
            if (item && item.toJSON) {
                return item.toJSON();
            }
            return item;
        });
    }
    const ret = {};
    Object.keys(target).forEach(key => {
        const value = target[key];
        if (value && value.toJSON) {
            ret[key] = value.toJSON();
        } else {
            ret[key] = value;
        }
    });
    return ret;
}

const objectProcess = {
    get(options) {
        const { target, events } = options;
        return function getValue(path, slient = false) {
            if (!path) {
                return null;
            }

            if (typeof path !== 'string') {
                return target[path];
            }
            // 避免使用.作为key的尴尬, 优先直接获取值
            let val = target[path];
            if (val == null) {
                let key;
                const field = path.split('.');
                if (field.length) {
                    key = field[0];
                    // lists[1].name
                    if (key.indexOf('[') >= 0) {
                        key = key.match(/(.*)\[(.*)\]/);
                        if (key) {
                            try {
                                val = target[key[1]][key[2]];
                            } catch (e) {
                                throw new Error(`state ${key[1]} is undefined!`);
                            }
                        }
                    } else {
                        val = target[field[0]];
                    }
                    if (val) {
                        for (let i = 1; i < field.length; i++) {
                            val = val[field[i]];
                            /* eslint-disable */
                            if (val == null) {
                                break;
                            }
                        }
                    }
                }
            }

            if (!slient) {
                events.trigger('get', {
                    key: path
                });
            }
            return val;
        };
    },
    set(options) {
        const { events, target } = options;
        const _set = function(object, path, value) {
            let keyNames = path.split('.'),
                keyName = keyNames[0],
                oldObject = object;

            object = object.get(keyName);
            if (typeof object == 'undefined') {
                object = wrap(keyName, {}, target.$proxy);
                oldObject[keyName] = object;
            }
            if (isPlainObject(object)) {
                keyNames.splice(0, 1);
                return object.set(keyNames.join('.'), value);
            }
        };
        return function setValue(path, value, config = {}) {
            if (isPlainObject(path)) {
                Object.keys(path).forEach(key => {
                    let val = path[key];
                    setValue(key, val, value);
                });
                return;
            }
            let nested,
                getValue = objectProcess.get(options),
                currentValue = getValue(path, true);

            value = wrap(path, value, target.$proxy);
            if (path.indexOf('.') > 0) {
                nested = true;
            }
            if (nested) {
                _set(target.$proxy, path, value);
            } else if (path.indexOf('[') >= 0) {
                let key = path.match(/(.*)\[(.*)\]/);
                if (key) {
                    target[key[1]].splice(key[2], 1, value);
                    return;
                } else {
                    throw new Error('Not right key' + path);
                }
            } else {
                target[path] = value;
            }
            if ((currentValue !== value || config.forceUpdate) && !nested) {
                events.trigger('change', {
                    key: path
                });
            }
        };
    },
    on(options) {
        return function on(...args) {
            const { events } = options;
            return events.on.apply(events, args);
        };
    },
    off(options) {
        return function off(...args) {
            const { events } = options;
            return events.off.apply(events, args);
        };
    },
    trigger(options) {
        return function trigger(...args) {
            const { events } = options;
            return events.trigger.apply(events, args);
        };
    },
    toJSON(options) {
        return function toJSON() {
            const target = options.target;
            return rawJSON(target);
        };
    },
    reset(options) {
        const { target } = options;
        return function() {
            Object.keys(target).forEach(key => {
                target.$proxy.set(key, undefined);
            });
        };
    }
};

const arrayProcess = {};

['on', 'off', 'trigger'].forEach(method => {
    arrayProcess[method] = objectProcess[method];
});

['pop', 'shift', 'push', 'unshift', 'sort', 'reverse', 'splice'].forEach(method => {
    arrayProcess[method] = options => {
        const { target, events } = options;
        return function(...args) {
            // todo: 这里利用了新增项会调用set方法的特性，没有对新增项进行observable包裹
            const ret = Array.prototype[method].apply(target.$proxy, args);
            target.$proxy.trigger('change', {});
            return ret;
        };
    };
});

const whiteList = ['_reactFragment', 'constructor'];

const observable = function observable(object) {
    if (object.$proxy) {
        return object;
    }

    const proxy = function proxy(object, parent) {
        const events = new Events();
        let returnProxy;
        const handler = {
            get(target, key) {
                if (key === '$raw') {
                    return rawJSON(target);
                }
                if (Array.isArray(target) && arrayProcess.hasOwnProperty(key)) {
                    return arrayProcess[key]({
                        target,
                        key,
                        events
                    });
                }
                if (objectProcess.hasOwnProperty(key)) {
                    return objectProcess[key]({
                        target,
                        key,
                        events
                    });
                }
                if (Array.isArray(target) || whiteList.indexOf(key) > -1 || (typeof key === 'string' && key.charAt(0) === '_')) {
                    return Reflect.get(target, key);
                }
                const getValue = objectProcess.get({
                    target,
                    key,
                    events
                });
                return getValue(key);
            },
            set(target, key, value) {
                if (Array.isArray(target)) {
                    if (isPlainObject(value)) {
                        value = observable(value);
                        value.on('change', args => {
                            // todo: 待优化，现在任何item的更新都会触发针对list的更新
                            target.$proxy.trigger('change', {});
                        });
                    }
                    const ret = Reflect.set(target, key, value);
                    return true;
                }
                objectProcess.set({
                    target,
                    events
                })(key, value);
                return true;
            }
        };
        returnProxy = new Proxy(object, handler);
        if (!object.$proxy) {
            Object.defineProperty(object, '$proxy', {
                get() {
                    return returnProxy;
                }
            });
        }
        return returnProxy;
    };
    const ret = proxy(object);
    if (isPlainObject(object)) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                object[key] = wrap(key, object[key], ret);
            }
        }
    } else if (Array.isArray(object)) {
        object.forEach((item, index) => {
            object[index] = wrap(index, object[index], ret);
        });
    }
    return ret;
};

export default observable;
