import {Store} from '../../src/';
import devtools from '../../src/plugins/devtools';
import routePlugin from '../../src/plugins/route';
import {goods} from './config';

const store = new Store({
    state: {
        goods: goods,
        list: []
    },
    actions: {
        sortList(state, payload) {
            state.goods.sort((a, b) => a[payload] - b[payload]);
        }
    }
}, {
    plugins: [devtools, routePlugin]
});

export default store;
