import React from 'react';
import ReactDOM from 'react-dom';
import {Store, inject, Provider, connect} from '../../src/';
import devtools from '../../src/plugins/devtools';

const store = new Store({
    name: 'list',
    state: {
        dataSource: [],
        complex: {
            a: 1
        }
    },
    actions: {
        add(state, payload) {
            const {dataSource} = state;
            dataSource.push({
                item: 'add'
            });
        },
        complex(state) {
            state.set('complex.a', 2);
        }
    }
});

@inject(store)
class List extends React.Component {
    render() {
        const {dataSource, complex} = this.props.state;
        return <div>{dataSource.length}, {complex.a}</div>;
    }
}

const globalStore = new Store({}, {
    plugins: [devtools]
});

globalStore.subscribe(function (state) {
    console.log(globalStore.state.toJSON());
});

@connect()
class Button extends React.Component {
    onClick = () => {
        this.props.dispatch('list.add', 'add');
    }
    onChange = () => {
        this.props.dispatch('list.complex');
    }
    render() {
        return <div><button onClick={this.onClick}>Add</button>
            <button onClick={this.onChange}>Complex</button>
        </div>;
    }
}

ReactDOM.render(
    <Provider store={globalStore}>
        <div>
            <List />
            <Button />
        </div>
    </Provider>,
    document.getElementById('root')
);
