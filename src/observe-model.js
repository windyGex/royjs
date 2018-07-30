/* eslint-disable */
import Events from './events';

const checkType = function (item) {
    return Object.prototype.toString.call(item).replace(/\[object\s(.*)\]/, (all, matched) => matched);
};

const isPlainObject = function (item) {
    return checkType(item) === 'Object';
};
const isArray = function (item) {
    return checkType(item) === 'Array';
};

function ObservableArray(data, parent, from) {
    Events.mixTo(data);
    const wrap = (item, parent, from) => {
        if (isPlainObject(item)) {
            if (!(item instanceof ObservableModel)) {
                item = new ObservableModel(item, from);
            }
            item.parent = parent;
            item.on('change', args => {
                data.trigger('change', { ...args
                });
            });
        }
        return item;
    }
    data.parent = parent || function () {};
    data.forEach((item) => {
        const parent = () => data;
        wrap(item, parent, from);
    });
    ['unshift',  'push', 'shift', 'pop', 'sort', 'splice'].forEach(method => {
        const oldM = data[method];
        data[method] = (...args) => {
            if(['unshift', 'push'].indexOf(method) > -1) {
                args = args.map(item => wrap(item, parent, from));
            } else if(method === 'splice') {
                const items = args.slice(2).map(item => wrap(item, parent, from));
                args = args.slice(0, 2).concat(items);
            }
            oldM.apply(data, args);
            data.trigger('change', {});
        }
    });
}


class ObservableModel extends Events {
    constructor(object, from) {
        super(object);
        this._wrapAll(object, this);
        this._from = from;
    }
    toJSON() {
        const ret = {};
        Object.keys(this).forEach(key => {
            if (key.charAt(0) != '_') {
                ret[key] = this[key];
            }
        });
        return ret;
    }
    _wrapAll(object, target) {
        const parent = () => this;
        Object.keys(object).forEach(key => {
            target[key] = this._wrap(object[key], key, parent);
            Object.defineProperty(object, key, {
                get: () => {
                    return this.get(key);
                },
                set: (value) => {
                    return this.set(key, value);
                }
            })
        });
    }
    parent() {}
    get(path) {
        if (!path) {
            return;
        }
        const field = path.split('.');
        let val, key;
        if (field.length) {
            key = field[0];
            // lists[1].name
            if (key.indexOf('[') >= 0) {
                key = key.match(/(.*)\[(.*)\]/);
                if (key) {
                    val = this[key[1]][key[2]];
                }
                // lists().name
            } else if (key.indexOf('(') >= 0) {
                key = key.match(/(.*)\((.*)\)/);
                if (key) {
                    if (typeof this[key[1]] === 'function') {
                        key[2] = key[2].replace(/['"]/g, '');
                        //need invoke
                        if (field.length > 1) {
                            val = this[key[1]].apply(self, key[2].split(','));
                        } else {
                            val = this[key[1]];
                            val._args = key[2].split(',');
                        }
                    } else {
                        throw new Error('不存在的方法：[ ' + key[1] + ' ]');
                    }
                }
            } else {
                val = this[field[0]];
            }
            if (val) {
                for (let i = 1; i < field.length; i++) {
                    if (val instanceof ObservableModel) {
                        val = val.get(field[i]);
                    } else {
                        val = val[field[i]];
                    }
                    /* eslint-disable */
                    if (val == null) {
                        break;
                    }
                }
            }
        }
        this.trigger('get', {
            key: path
        });
        return val;
    }
    set(path, value, options = {}) {
        if (this._from  && !this._from.allowModelSet) {
            throw new Error('Can only set model by actions');
        }
        if (isPlainObject(path)) {
            Object.keys(path).forEach(key => {
                let val = path[key];
                this.set(key, val, value);
            });
            return;
        }
        let nested, currentValue = this.get(path);
        if (path.indexOf('.') > 0) {
            nested = true;
        }
        value = this._wrap(value, path, () => this);
        if (nested) {
            this._set(this, path, value);
        } else if (path.indexOf('[') >= 0) {
            let key = path.match(/(.*)\[(.*)\]/);
            if (key) {
                this[key[1]].splice(key[2], 1, value);
                return;
            } else {
                throw new Error('Not right key' + path);
            }
        } else {
            this[path] = value;
        }
        if ((currentValue !== value || options.forceUpdate) && !nested) {
            this.trigger('change', {
                key: path
            });
        }
    }
    _set(object, path, value) {
        var keyNames = path.split('.'),
            keyName = keyNames[0],
            oldObject = object;
        object = object.get(keyName);
        if (typeof object == 'undefined') {
            object = this._wrap({}, keyName, () => oldObject);
            oldObject[keyName] = object;
        }
        if (isPlainObject(object)) {
            keyNames.splice(0, 1);
            return object.set(keyNames.join('.'), value);
        }
    }
    _wrap(item, key, parent) {
        if (isPlainObject(item)) {
            if (!(item instanceof ObservableModel)) {
                item = new ObservableModel(item, this._from);
            }
            if (item.parent() !== parent()) {
                item.on('get', (args) => {
                    const currentKey = `${key}.${args.key}`;
                    this.trigger('get', {
                        key: currentKey
                    });
                });
                item.on('change', (args) => {
                    const currentKey = `${key}.${args.key}`;
                    this.trigger('change', { ...args,
                        ...{
                            key: currentKey
                        }
                    });
                });
            }
            item.parent = parent;
        } else if (isArray(item) || item instanceof ObservableArray) {
            if (!item.__events) {
                ObservableArray(item, () => {}, this._from);
            }
            if (item.parent() !== parent()) {
                item.on('change', (args) => {
                    if (!args.key) {
                        args.key = key;
                    }
                    this.trigger('change', { ...args
                    });
                });
            }
            item.parent = parent;
        }
        return item;
    }
}

export default ObservableModel;
