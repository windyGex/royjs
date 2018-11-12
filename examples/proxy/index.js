import {Store, inject} from '../../src/';

const store = new Store({
    state: {
        count: 0
    }
});

store.on('change', (...args) => {
    console.log(args)
});

window.store = store;
