/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import Provider from './provider';
import Store from './store';

export default function hotRender(element, container, options = {}) {
    const root = typeof container === 'string' ? document.querySelector(container) : container;
    if (options.storeConfig) {
        const { storeConfig } = options;
        if (window.hotStore) {
            window.hotStore.hot(storeConfig.state, storeConfig.actions, '', storeConfig.plugins || []);
        } else {
            window.hotStore = new Store(storeConfig, {
                plugins: storeConfig.plugins || []
            });
        }
        const oldCreateElement = React.createElement;
        if (!oldCreateElement._patched) {
            React.createElement = (tag, props, ...args) => {
                let newProps = props;
                if (typeof tag !== 'string') {
                    newProps = {
                        dispatch: window.hotStore.dispatch,
                        ...props
                    };
                }
                return oldCreateElement(tag, newProps, ...args);
            };
            React.createElement._patched = true;
        }
        return ReactDOM.render(<Provider store={window.hotStore}>{element}</Provider>, container);
    }
    return ReactDOM.render(element, container);
}
