import React from 'react';
import ReactDOM from 'react-dom';
import Store from './store';
import inject from './inject';

const noop = function () {};

export default function compose({
    view,
    components,
    state,
    actions,
    container,
    init = noop,
    mounted = noop,
    beforeUpdate = noop,
    updated = noop,
    beforeDestroy = noop
}) {
    const store = new Store({
        state,
        actions
    });
    class ComposeComponent extends React.Component {
        constructor(...args) {
            super(...args);
            init.apply(this, args);
        }
        componentDidMount(...args) {
            mounted.apply(this, args);
        }
        componentWillUpdate(...args) {
            beforeUpdate.apply(this, args);
        }
        componentDidUpdate(...args) {
            updated.apply(this, args);
        }
        componentWillUnmount(...args) {
            beforeDestroy.apply(this, args);
        }
        render() {
            return view.call(this, {
                createElement: React.createElement,
                components
            });
        }
    }
    const StoreComponent = inject(store)(ComposeComponent);
    if (container) {
        return ReactDOM.render(<StoreComponent/>, document.querySelector(container));
    }
    return StoreComponent;
}
