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
        count1: 0,
        count2: 0,
        count3: 0
    },
    actions: {
        add(state, payload) {
            window.setTimeout(() => {
                this.transaction(() => {
                    this.transaction(() => {
                        this.dispatch('setValues', {
                            count1: state.count1 + 1,
                            count2: state.count2 + 1,
                            count3: state.count3 + 1
                        });
                    });
                    this.dispatch('setValues', {
                        count3: state.count3 + 1
                    });
                });
            }, 1000);
        }
    }
}, {
    plugins: [logger, devtools]
});

@inject(store)
class App extends React.Component {
    render() {
        console.log('view update!');
        const {count1, count2, count3} = this.store.state;
        const {dispatch} = this.store;
        return (<div>
            {count1}
            {count2}
            {count3}
            <button onClick={() => dispatch('add')}>add</button>
        </div>);
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
