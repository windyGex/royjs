import { Store } from '../../src/';
import devtools from '../../src/plugins/devtools';
import routePlugin from '../../src/plugins/route';
import { goods } from './config';

const store = new Store(
    {
        state: {
            list: {
                goods: [],
                currentCategory: null,
                currentSort: null,
                loading: false
            },
            cart: {
                list: []
            }
        },
        actions: {
            fetch(state, payload) {
                state.list.loading = true;
                const ret = new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 500);
                });
                ret.then(() => {
                    this.transaction(() => {
                        if (!payload || !payload.category) {
                            state.list.goods = goods;
                        } else {
                            state.list.goods = goods.filter(item => item.type === payload.category);
                        }
                        state.list.currentCategory = payload && payload.category;
                        state.list.loading = false;
                    });
                });
            },
            sortList(state, payload) {
                state.list.goods.sort((a, b) => a[payload] - b[payload]);
                state.list.currentSort = payload;
            },
            addCartItem(state, payload) {
                const item = state.cart.list.filter(item => item.id === payload.id)[0];
                if (!item) {
                    state.cart.list.push({
                        ...payload,
                        quantity: 1
                    });
                } else {
                    item.quantity++;
                }
            },
            select(state, payload) {
                const item = state.cart.list.filter(item => item.id === payload.id)[0];
                item.selected = payload.checked;
            },
            selectAll(state, payload) {
                state.cart.list.forEach(item => {
                    item.selected = payload.checked;
                });
            },
            onAdd(state, payload) {
                payload.quantity++;
            },
            onReduce(state, payload) {
                payload.quantity = Math.max(0, --payload.quantity);
            },
            onRemove(state, payload) {
                const list = state.cart.list.filter(item => !item.selected);
                state.cart.list = list;
            }
        }
    },
    {
        plugins: [devtools, routePlugin]
    }
);

export default store;
