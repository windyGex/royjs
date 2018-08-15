import {
    Store
} from '../src';
const store = new Store({}, {
    plugins: []
});
const largeData = [];
for (let i = 0; i < 50; i++) {
    const object = {};
    for (let j = 0; j < 20; j++) {
        object[j] = 'test';
    }
    largeData.push(object);
}

const nested = function (data, level) {
    if (level > 9) {
        return;
    }
    data.a = {
        largeData
    };
    nested(data.a, ++level);
    return data;
};

const data = nested({}, 0);

window.toJSON = function () {
    const t = Date.now();
    console.log(store.state.toJSON());
    console.log(Date.now() - t);
};

store.create('module1', {
    state: {
        name: data
    },
    actions: {
        change(state, payload) {
            state.set('name', payload);
        }
    }
});
