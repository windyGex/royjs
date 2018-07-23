import Roy from '../src/';
import React from 'react';
import ReactDOM from 'react-dom';

const mock = function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                name: 'from remote data'
            });
        }, 3000);
    });
};

const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.payload, obj.state.toJSON());
    });
};

const devtools = function (store) {
    let tool;
    store.subscribe(obj => {
        if (window.hasOwnProperty('__REDUX_DEVTOOLS_EXTENSION__') && !tool) {
            tool = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
            // tool.subscribe(message => {
            //     if (message.type === 'DISPATCH' && message.state) {
            //         store.set(JSON.parse(message.state));
            //     }
            // });
        }
        tool.send(obj.type, obj.state.toJSON());
    });
};

const store = new Roy.Store({
    state: {
        name: 'test',
        password: 'test1234'
    },
    actions: {
        changeName(state, payload) {
            state.set('name', payload);
        },
        async fetch(state, payload, {put}) {
            const ret = await mock();
            put('changeName', ret.name);
        }
    }
}, {
    plugins: [logger, devtools]
});

Roy.Store.create({
    name: 'subModule',
    state: {
        name: 'subModule',
        password: 'test1234'
    },
    actions: {
        changeSubModule(state, payload) {
            state.set('name', payload);
        }
    }
});

const mapStateToProps = (state) => state.subModule;

class App extends React.Component {
    render() {
        return <div>{this.props.name}
            <button onClick={() => store.dispatch('subModule.changeSubModule', 'changed')}>click</button>
            <button onClick={() => store.dispatch('fetch')}>async click</button>
        </div>;
    }
}

const AppStore = Roy.inject(mapStateToProps)(App);

ReactDOM.render(<AppStore/>, document.getElementById('root'));
