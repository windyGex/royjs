import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';
import {isArray} from './utils';

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
            static contextTypes = {
                store: T.any
            };
            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = (obj) => {
                    const state = {};
                    obj = isArray(obj) ? obj : [obj];
                    for (let index = 0; index < obj.length; index++) {
                        const item = obj[index];
                        if (this._deps[item.key]) {
                            state[item.key] = obj.value;
                        }
                    }
                    this.setState(state);
                };
                this._get = (data) => {
                    this._deps[data.key] = true;
                };
                Object.keys(defaultProps).forEach(key => {
                    this[key] = defaultProps[key];
                    this[key].on('change', this._change);
                    this[key].on('get', this._get);
                    this[key].history = this[key].history || this.props.history;
                    if (this[key].name) {
                        this.context.store && this.context.store.mount(this[key].name, this[key]);
                    }
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
                if (node) {
                    node._instance = this;
                }
            }
            render() {
                return <Component {...defaultProps} {...this.props} />;
            }
        }
        return StoreWrapper;
    };
};

export default inject;
