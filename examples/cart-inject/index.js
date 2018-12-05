import {NavLink as Link, HashRouter, Route, Switch, Redirect} from 'react-router-dom';
import React from 'react';
import {render} from 'react-dom';
import store from './store';
import List from './components/list';
import Cart from './components/cart';
import './index.css';

class App extends React.Component {

    render() {
        return (<div className="g-panel">
            <List />
            <Cart />
        </div>);
    }
}

const routes = (<HashRouter>
    <Switch>
        <Route path="/" component={App} />
    </Switch>
</HashRouter>);

render(routes, document.querySelector('#root'));
