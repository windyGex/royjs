import React from 'react';
import ReactDOM from 'react-dom';

// inject(listStore)
// inject('listStore', listStore)
// inject({
// listStore,
// noticeStore
// })
const inject = function (key, value) {
    const length = arguments.length;
    let defaultProps = {};
    if (length === 1) {
        if (key.primaryKey) {
            defaultProps = {
                store: key
            };
        } else {
            defaultProps = key;
        }
    } else if (length === 2) {
        defaultProps[key] = value;
    }
    return function withStore(Component) {
        class StoreWrapper extends React.Component {
            constructor(props) {
                super(props);
                this._deps = {};
                this._change = (obj) => {
                    const state = {};
                    if (this._deps[obj.key]) {
                        state[obj.key] = obj.value;
                        this.setState(state);
                    }
                };
                this._get = (data) => {
                    this._deps[data.key] = true;
                };
                Object.keys(defaultProps).forEach(key => {
                    this[key] = defaultProps[key];
                    this[key].on('change', this._change);
                    this[key].on('get', this._get);
                    Component.prototype[key] = this[key];
                });
            }
            componentWillUnmount() {
                Object.keys(defaultProps).forEach(key => {
                    this[key].off('change', this._change);
                    this[key].off('get', this._get);
                });
            }
            componentDidMount() {
                const node = ReactDOM.findDOMNode(this);
                node._instance = this;
            }
            render() {
                return <Component {...defaultProps} {...this.props} />;
            }
        }
        return StoreWrapper;
    };
};

export default inject;
