/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, BrowserRouter, Switch} from 'react-router-dom';
import meta from './meta';

export default function render(element, container, options = {}) {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (meta.route) {
        const Router = options.browser ? BrowserRouter : HashRouter;
        return ReactDOM.render(<Router>
            <Switch>
                {element}
            </Switch>
        </Router>, root);
    }
    return ReactDOM.render(element, container);
}