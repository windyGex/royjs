import Roy from '../src/';
import React from 'react';
import ReactDOM from 'react-dom';
import Provider from '../src/provider';

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
        password: 'hello1234'
    },
    actions: {
        changeName(payload, state) {
            state.set('name', payload);
        },
        async fetch(payload, state) {
            const ret = await mock();
            this.dispatch('changeName', ret.name);
        }
    }
}, {
    plugins: [logger, devtools]
});

store.create({
    name: 'subModule',
    state: {
        name: 'subModule',
        password: 'subModule'
    },
    actions: {
        changeSubModule(payload, state) {
            state.set('name', payload);
            this.dispatch('changeName', 'change name from submodule.');
        }
    }
});


@Roy.connect(state => state.subModule)
class App extends React.Component {
    render() {
        return <div>
            {this.props.name}
            <button onClick={() => store.dispatch('subModule.changeSubModule', 'changed')}>click</button>
            <button onClick={() => store.dispatch('fetch')}>async click</button>
        </div>;
    }
}
@Roy.connect(state => state)
class App2 extends React.Component {
    render() {
        return <div>{this.props.name}</div>
    }
}
const globalStore = new Roy.Store({
    state: {
        subModule: {
            name: 'globalStore'
        }
    }
});

class Demo extends React.Component {
    state = {

    }
    render() {
        return <div>
            Redux style write
            <button onClick={() => this.setState({
                global: true
            })}>change to global</button>
            {this.state.global ?
            <Provider store={globalStore}>
                <App/>
                <App2/>
            </Provider> : <div><App/><App2/></div>
        }
        </div>;
    }
}

ReactDOM.render(<Demo/>, document.getElementById('root'));

const remoteStore = new Roy.Store({
    state: {
        visible: false
    },
    actions: {
        open(payload, state) {
            state.set('visible', true);
        },
        close(payload, state) {
            state.set('visible', false);
        }
    }
});

@Roy.inject(remoteStore)
class View extends React.Component {
    render() {
        const {visible} = this.store.state;
        return <div>
            <button onClick={() => this.store.dispatch('open')}>Open</button>
            {visible ? 'visible' : ''}
        </div>
    }
}

store.mount('remote', remoteStore);

@Roy.connect(state => state.remote)
class RemoteView extends React.Component {
    render() {
        return <div onClick={() => this.store.dispatch('remote.close')}>{this.props.visible ? 'true' : 'false'}</div>;
    }
}

ReactDOM.render(<div><View/><RemoteView/></div>, document.getElementById('test'));
