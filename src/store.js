import Events from './events';
import ObservableModel from './observe-model';
import DataSource from './data-source';

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
        const {
            state,
            actions
        } = params;
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
    }
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
        let {
            state,
            actions
        } = store;
        store.on('change', args => {
            target.set(`${name}.${args.key}`, args.value);
        });
        store.on('get', args => {
            const obj = { ...args
            };
            obj.key = `${name}.${obj.key}`;
            target.trigger('get', obj);
        });
        return Store.create(target, name, {
            state: state.toJSON(),
            actions
        });

    }
    static get = function () {
        return globalStore;
    }
    // state
    // actions
    constructor(params = {}, options = {}) {
        super(params, options);
        let {
            name,
            state,
            actions = {}
        } = params;
        const {
            strict = false,
            plugins = []
        } = options;
        state = {
            ...this.state,
            ...state
        };
        this.model = new ObservableModel(state, this);
        this.model.on('get', args => {
            this.trigger('get', args);
        });
        this.model.on('change', (args = {}) => {
            args.value = this.model.get(args.key);
            this.trigger('change', args);
        });
        this.actions = {};
        this.strict = strict;
        this.allowModelSet = !strict;
        this._wrapActions(actions, this.model);
        this.state = this.model;
        this.url = options.url;
        this.name = name;
        this.primaryKey = options.primaryKey || 'id';
        plugins.forEach(plugin => {
            if (typeof plugin === 'function') {
                plugin(this);
            }
        });
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
    _wrapActions(actions, state, prefix) {
        Object.keys(actions).forEach(type => {
            const actionType = prefix ? `${prefix}.${type}` : type;
            const that = this;
            const action = actions[type];
            function actionPayload(payload) {
                const ret = action.call(that, state, payload);
                that.trigger('actions', {
                    type: actionType,
                    payload,
                    state: that.model
                });
                return ret;
            };
            if (!action._set) {
                this.actions[actionType] = actionPayload;
                actionPayload._set = true;
            } else {
                this.actions[actionType] = action;
            }
        });
    }
    dispatch = (type, payload) => {
        const action = this.actions[type];
        if (!action || typeof action !== 'function') {
            throw new Error('Cant find ${type} action');
        }
        this.allowModelSet = true;
        const ret = action(payload);
        if (this.strict) {
            this.allowModelSet = false;
        }
        return ret;
    }
    subscribe(callback) {
        this.on('actions', function ({
            type,
            payload,
            state
        }) {
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
