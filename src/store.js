import Events from './events';
import DataSource from './data-source';
import ObservableModel from './observe-model';

class Store extends Events {
    url = '';
    constructor(state) {
        super(state);
        state = {
            loading: false,
            data: [],
            record: {},
            total: 0,
            ...state
        };
        this.model = new ObservableModel(state);
        this.model.on('get', args => {
            this.trigger('get', args);
        });
        this.model.on('change', (args = {}) => {
            args.value = this.model.get(args.key);
            this.trigger('change', args);
        });
        this._dataMaps = {};
        this.state = state;
    }
    get primaryKey() {
        return 'id';
    }
    get ds() {
        return new DataSource({
            url: this.url
        });
    }
    get(key) {
        return this.model.get(key);
    }
    set(key, value) {
        return this.model.set(key, value);
    }
    find(params) {
        this.set('loading', true);
        return this.ds.find(params).then(ret => {
            this.set({
                total: ret.paginator.items,
                data: ret.result,
                loading: false
            });
            this._setDataToCache(ret.result);
        });
    }
    findById(id, cache = true) {
        const matched = this.findByIdFromCache(id);
        let promise;
        if (matched && cache) {
            promise = new Promise((resolve, reject) => {
                resolve(matched);
            });
        } else {
            promise = this.ds.get(id);
        }
        return promise.then(ret => {
            this.set('record', ret);
            return ret;
        });
    }
    findByIdFromCache(id) {
        return this._dataMaps[id];
    }
    findIndexFromId(id) {
        let matched = -1;
        this.data.forEach((item, index) => {
            if (item[this.primaryKey] === id) {
                matched = index;
            }
        });
        return matched;
    }
    modifyById(id) {
        this.findById(id, false).then(ret => {
            const index = this.findIndexFromId(id);
            this.data.splice(index, 1, ret);
            this.set({
                data: this.data,
                record: ret
            });
        });
    }
    mapActionTo(target, methods) {
        methods.forEach(method => {
            if (typeof this[method] === 'function') {
                target[method] = this[method].bind(this);
            }
        });
    }
    _setDataToCache(data) {
        data.forEach(item => {
            this._dataMaps[item[this.primaryKey]] = item;
        });
    }
}

export default Store;
