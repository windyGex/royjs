import Events from './events';
import ObservableModel from './observe-model';
import { DataSource } from './data-source';

let globalStore;

class Store extends Events {
    url = '';
    primaryKey = 'id';
    static create = function (params) {
        const { name, state, ...actions } = params;
        Object.keys(state).forEach(key => {
            globalStore.set(`${name}.${key}`, state[key]);
        });
        globalStore._wrapActions(actions, globalStore.get(name), name);
        return globalStore.get(name);
    }
    static get = function () {
        return globalStore;
    }
    // state
    // actions
    constructor(params = {}, options = {}) {
        super(params, options);
        let { state, ...actions } = params;
        const { strict, plugins = [] } = options;
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
        this._strictMode = strict;
        this._wrapActions(actions, this.model);
        this.state = this.model;
        plugins.forEach(plugin => {
            plugin(this);
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
        if (this._strictMode && !this._allowModelSet) {
            // throw new Error('Can only set model by actions');
            this.strict = true;
        }
        return this.model.set(key, value, options);
    }
    _wrapActions(actions, state, prefix) {
        const that = this;
        Object.keys(actions).forEach(type => {
            const actionType = prefix ? `${prefix}.${type}` : type;
            this.actions[actionType] = (payload) => {
                const action = actions[type];
                const ret = action.call(this, state, payload, { put: this.put });
                this.trigger('actions', {
                    type: actionType,
                    payload,
                    state: this.model
                });
                return ret;
            };
            Object.defineProperty(this, actionType, {
                get() {
                    return that.actions[actionType];
                }
            });
        });
    }
    dispatch(type, payload) {
        const action = this.actions[type];
        if (!action || typeof action !== 'function') {
            throw new Error('Cant find ${type} action');
        }
        action(payload);
    }
    put = (type, payload) =>{
        this._allowModelSet = true;
        const action = this.actions[type];
        if (typeof action === 'function') {
            action(payload);
        }
        this._allowModelSet = false;
    }
    subscribe(callback) {
        this.on('actions', function ({type, payload, state}) {
            callback({type, payload, state});
        });
    }
}

export default Store;
