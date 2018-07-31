import React from 'react';
import ReactDOM from 'react-dom';
import {Store, inject, Provider, connect} from '../../src/';

const store = new Store({
    name: 'list',
    state: {
        dataSource: []
    },
    actions: {
        add(state, payload) {
            const {dataSource} = state;
            dataSource.push({
                item: 'add'
            });
        }
    }
});

@inject(store)
class List extends React.Component {
    render() {
        const {dataSource} = this.store.state;
        return <div>{dataSource.length}</div>;
    }
}

const globalStore = new Store();

globalStore.subscribe(function (state) {
    console.log(globalStore.state.toJSON());
});

@connect()
class Button extends React.Component {
    onClick = () => {
        this.store.dispatch('list.add', 'add');
    }
    render() {
        return <button onClick={this.onClick}>Add</button>;
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
