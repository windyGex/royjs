import {Store} from '../../src/';
import devtools from '../../src/plugins/devtools';
import routePlugin from '../../src/plugins/route';

const store = new Store({
    state: {
        goods: [],
        list: []
    },
    actions: {
        fetch() {

        }
    }
}, {
    plugins: [devtools, routePlugin]
});

export default store;
