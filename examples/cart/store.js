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
        },
        addCartItem(state, payload) {
            const item = state.list.filter(item => item.id === payload.id)[0];
            if (!item) {
                state.list.push({
                    ...payload,
                    quantity: 1
                });
            } else {
                item.quantity++;
            }
        },
        select(state, payload) {
            const item = state.list.filter(item => item.id === payload.id)[0];
            item.selected = payload.checked;
        },
        selectAll(state, payload) {
            if (state.list) {
                state.list.forEach(item => {
                    item.selected = payload.checked;
                });
            }
        }
    }
}, {
    plugins: [devtools, routePlugin]
});

export default store;
