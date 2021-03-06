import {Store, inject} from '../../src/';
import devtools from '../../src/plugins/devtools';
import React from 'react';
import ReactDOM from 'react-dom';

const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.payload, obj.state.toJSON());
    });
};

const store = new Store({
    state: {
        count: 0,
        list: []
    },
    actions: {
        add(state, payload) {
            state.count++;
        },
        reduce(state, payload) {
            state.count--;
        },
        async asyncAdd(state, payload) {
            await new Promise((resolve) => {
                setTimeout(() =>{
                    resolve();
                }, 400);
            });
            this.dispatch('add');
        }
    }
}, {
    plugins: [logger, devtools]
});

@inject(store)
class App extends React.Component {
    render() {
        const {state, dispatch} = this.props;
        const {count} = state;
        return (<div>
            {count}
            <button onClick={() => dispatch('add')}>add</button>
            <button onClick={() => dispatch('reduce')}>reduce</button>
            <button onClick={() => dispatch('asyncAdd')}>async</button>
        </div>);
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
