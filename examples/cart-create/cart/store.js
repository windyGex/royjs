import { Store } from '../../../src/';
import { goods } from '../config';

const store = Store.get();

store.create('cart', {
    state: {
        list: []
    },
    actions: {
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
            state.list.forEach(item => {
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
            const list = state.list.filter(item => !item.selected);
            state.list = list;
        }
    }
});
