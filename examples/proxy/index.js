import {Store, inject} from '../../src/';
import React from 'react';
import ReactDOM from 'react-dom';

const store = new Store({
    state: {
        count: 0
    }
});

store.on('change', (...args) => {
    console.log(args)
});

window.store = store;


store.state.set('a', [{
    status: true
}]);
@inject(store)
class App extends React.Component {
    render() {
        const [item] = this.store.state.a;
        return <span>{item.status ? 'true' : 'false'}</span>;
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
