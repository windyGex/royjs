import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';
import { isArray, warning } from './utils';

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
            static childContextTypes = {
                injectStore: T.any
            };
            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = obj => {
                    const state = {};
                    obj = isArray(obj) ? obj : [obj];
                    for (let index = 0; index < obj.length; index++) {
                        const item = obj[index];
                        if (this._deps[item.key]) {
                            state[item.key] = item.value;
                        }
                    }
                    this.setState(state);
                };
                this._get = data => {
                    this._deps[data.key] = true;
                };
                Object.keys(defaultProps).forEach(key => {
                    const store = defaultProps[key];
                    this[key] = store;
                    this[key].on('change', this._change);
                    this[key].history = this[key].history || this.props.history;
                    if (this[key].name) {
                        this.context.store && this.context.store.mount(this[key].name, this[key]);
                    }
                    if (!Component.prototype[key]) {
                        Object.defineProperty(Component.prototype, key, {
                            get() {
                                warning('Using this.props.state instead of this.store.state and using this.props.dispatch instead of this.store.dispatch');
                                return store;
                            }
                        });
                    }
                });
            }
            getChildContext() {
                return {
                    injectStore: this.store
                };
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
            setInstance = inc => {
                this._instance = inc;
            };
            get instance() {
                return this._instance;
            }
            render() {
                let ret = {};
                Object.keys(defaultProps).forEach(key => {
                    const store = defaultProps[key];
                    if (key === 'store') {
                        ret = {
                            dispatch: store.dispatch,
                            state: store.state
                        };
                    } else {
                        ret = {
                            [`${key}Dispatch`]: store.dispatch,
                            [`${key}State`]: store.state
                        };
                    }
                });
                return <Component {...defaultProps} {...this.props} {...ret} ref={this.setInstance} />;
            }
        }
        return StoreWrapper;
    };
};

export default inject;
