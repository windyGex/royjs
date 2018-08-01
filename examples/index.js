import {Store, Provider, inject, connect} from '../src/';
import React from 'react';
import ReactDOM from 'react-dom';

const store = new Store({
    name: 'module',
    state: {
        name: 'a'
    },
    actions: {
        change(state) {
            state.set('name', 'b');
        }
    }
});
@inject(store)
class Module extends React.Component {
    render() {
        return <span>{this.store.get('name')}</span>;
    }
}
@connect()
class Button extends React.Component {
    onClick = () => {
        this.store.dispatch('module.change');
    }
    render() {
        return <a onClick={this.onClick}>change</a>;
    }
}
const globalStore = new Store();

ReactDOM.render(<Provider store={globalStore}>
    <div>
        <Module/>
        <Button/>
    </div>
</Provider>, document.getElementById('root'));

