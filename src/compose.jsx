import React from 'react';
import ReactDOM from 'react-dom';
import Store from './store';
import inject from './inject';

export default function compose({
    view,
    components,
    state,
    actions,
    container,
    init,
}) {
    const store = new Store({
        state,
        actions
    });
    class ComposeComponent extends React.Component {
        constructor() {
            super(...arguments);

            if(typeof(init) === 'function') {
                init.call(this, ...arguments);
            }
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
