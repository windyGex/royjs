import Events from './events';
import observable from './proxy';
import DataSource from './data-source';
import setValues from './plugins/set-values';
import { isArray } from './utils';

let globalStore;

class Store extends Events {
    // create({})
    // create(name, {})
    // create(store, name, params);
    static create = function (store, name, params) {
        if (arguments.length === 1) {
            params = store;
            store = globalStore;
            name = params.name;
        } else if (arguments.length === 2) {
            params = name;
            name = store;
            store = globalStore;
        }
        const { state, actions } = params;
        if (!globalStore) {
            console.warn('The store has not been initialized yet!');
        }
        const stateKeys = Object.keys(state);
        if (stateKeys.length === 0) {
            store.set(name, {});
        } else {
            stateKeys.forEach(key => {
                store.set(`${name}.${key}`, state[key]);
            });
        }
        store._wrapActions(actions, store.get(name), name);
        return store.get(name);
    };
    // mount({})
    // mount(name, {})
    // mount(target, name, store)
    static mount = function (target, name, store) {
        if (arguments.length === 1) {
            store = target;
            target = globalStore;
            name = store.name;
        } else if (arguments.length === 2) {
            store = name;
            name = target;
            target = globalStore;
        }
        let { state, actions } = store;
        store.on('change', args => {
            args = isArray(args) ? args : [args];
            target.transaction(() => {
                for (let i = 0; i < args.length; i++) {
                    const item = args[i];
                    const value = store.get(item.key);
                    target.set(`${name}.${item.key}`, value);
                }
            });
        });
        store.on('get', args => {
            const obj = { ...args };
            obj.key = `${name}.${obj.key}`;
            target.trigger('get', obj);
        });
        store.on('actions', args => {
            target.trigger('actions', args);
        });
        return Store.create(target, name, {
            state: state.toJSON(),
            actions
        });
    };
    static get = function () {
        return globalStore;
    };
    // state
    // actions
    constructor(params = {}, options = {}) {
        super(params, options);
        let { name, state, actions = {} } = params;
        const { strict = false, plugins = [] } = options;
        state = {
            ...this.state,
            ...state
        };
        this.model = observable(state);
        this.model.on('get', args => {
            this.trigger('get', args);
        });
        this.model.on('change', (args = {}) => {
            try {
                this._startBatch();
                if (this.inBatch > 1) {
                    this.pendingUnobservations.push(args);
                } else {
                    this.trigger('change', args);
                }
            } finally {
                this._endBatch();
            }
        });
        this.inBatch = 0;
        this.pendingUnobservations = [];
        this.actions = {};
        this.strict = strict;
        this.allowModelSet = !strict;
        this.state = this.model;
        this.url = options.url;
        this.name = name;
        this.primaryKey = options.primaryKey || 'id';
        plugins.unshift(setValues);
        plugins.forEach(plugin => {
            if (typeof plugin === 'function') {
                plugin(this, actions);
            }
        });
        this._wrapActions(actions, this.model);
        if (!globalStore) {
            globalStore = this;
        }
    }
    get dataSource() {
        return new DataSource({
            url: this.url,
            primaryKey: this.primaryKey
        });
    }
    get request() {
        return this.dataSource.request;
    }
    get(key) {
        return this.model.get(key);
    }
    set(key, value, options = {}) {
        return this.model.set(key, value, options);
    }
    _startBatch() {
        this.inBatch++;
    }
    _endBatch() {
        // 最外层事务结束时，才开始执行
        if (--this.inBatch === 0) {
            // 发布所有state待定的改变
            this._runPendingObservations();
        }
    }
    _runPendingObservations() {
        if (this.pendingUnobservations.length) {
            this.trigger('change', this.pendingUnobservations.slice());
            this.pendingUnobservations = [];
        }
    }
    _wrapActions(actions, state, prefix) {
        Object.keys(actions).forEach(type => {
            const actionType = prefix ? `${prefix}.${type}` : type;
            const that = this;
            const action = actions[type];
            function actionPayload(payload, options) {
                const ret = action.call(that, state, payload, {
                    state: that.state,
                    dispatch: that.dispatch,
                    ...options
                });
                that.trigger('actions', {
                    type: actionType,
                    payload,
                    state: that.model
                });
                return ret;
            }
            if (!action._set) {
                this.actions[actionType] = actionPayload;
                actionPayload._set = true;
            } else {
                this.actions[actionType] = action;
            }
        });
    }
    transaction = fn => {
        this._startBatch();
        try {
            return fn.apply(this);
        } finally {
            this._endBatch();
        }
    };
    dispatch = (type, payload, options) => {
        const action = this.actions[type];
        if (!action || typeof action !== 'function') {
            throw new Error(`Cant find ${type} action`);
        }
        this.allowModelSet = true;
        const ret = action(payload, options);
        if (this.strict) {
            this.allowModelSet = false;
        }
        return ret;
    };
    subscribe(callback) {
        this.on('actions', function ({ type, payload, state }) {
            callback({
                type,
                payload,
                state
            });
        });
    }
    create(name, params) {
        return Store.create(this, name, params);
    }
    mount(name, store) {
        return Store.mount(this, name, store);
    }
}

export default Store;

export const create = Store.create;

export const get = Store.get;
