import { Store } from '../../../src/';
import { goods } from '../config';

const store = Store.get();

store.create('list', {
    state: {
        goods: [],
        currentCategory: null,
        currentSort: null,
        loading: false
    },
    actions: {
        fetch(state, payload) {
            state.loading = true;
            const ret = new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 500);
            });
            ret.then(() => {
                this.transaction(() => {
                    if (!payload || !payload.category) {
                        state.goods = goods;
                    } else {
                        state.goods = goods.filter(item => item.type === payload.category);
                    }
                    state.currentCategory = payload && payload.category;
                    state.loading = false;
                });
            });
        },
        sortList(state, payload) {
            state.goods.sort((a, b) => a[payload] - b[payload]);
            state.currentSort = payload;
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
    }
});
