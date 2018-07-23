import React from 'react';
import T from 'prop-types';

class Provider extends React.Component {
    static childContextTypes = {
        store: T.any
    }
    static propTypes = {
        store: T.any
    }
    getChildContext() {
        return {
            store: this.props.store
        };
    }
    render() {
        return this.props.children;
    }
}

export default Provider;
