import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';
import eql from 'shallowequal';
import { isArray, warning } from './utils';

// inject(listStore)
// inject(listStore, true)
// inject('listStore', listStore)
// inject({
// listStore,
// noticeStore
// })
const inject = function (key, value) {
    const length = arguments.length;
    let defaultProps = {},
        pure = false;
    if (length === 1) {
        if (key.primaryKey) {
            defaultProps = {
                store: key
            };
        } else {
            warning('inject multiple store will be removed at next version, using connect and Provider instead of it.');
            defaultProps = key;
        }
    } else if (length === 2) {
        if (value === true || value === false) {
            pure = value;
            defaultProps = {
                store: key
            };
        } else {
            defaultProps[key] = value;
        }
    }
    return function withStore(Component) {
        const { render, componentDidMount } = Component.prototype;
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
                    let matched;
                    for (let index = 0; index < obj.length; index++) {
                        const item = obj[index];
                        const match = Object.keys(this._deps).some(dep => item.key.indexOf(dep) === 0);
                        if (match) {
                            matched = true;
                            state[item.key] = this.store.get(item.key);
                        }
                    }
                    if (matched) {
                        this.setState(state);
                    }
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
                    if (!Component.prototype._hasSet) {
                        Object.defineProperty(Component.prototype, key, {
                            get() {
                                warning(`Using this.props.state instead of this.store.state
and using this.props.dispatch instead of this.store.dispatch`);
                                return store;
                            }
                        });
                    }
                });
                Component.prototype._hasSet = true;

                // 劫持组件原型，收集依赖信息
                const that = this;
                Component.prototype.render = function (...args) {
                    that.beforeRender();
                    const ret = render.apply(this, args);
                    that.afterRender();
                    return ret;
                };

                if (typeof componentDidMount === 'function') {
                    Component.prototype.componentDidMount = function () {
                        that.beforeRender();
                        componentDidMount.apply(this);
                        that.afterRender();
                    };
                }

                if (pure) {
                    this.shouldComponentUpdate = function (nextProps, nextState) {
                        if (this.state !== nextState) {
                            return true;
                        }
                        return !eql(this.props, nextProps);
                    };
                }
            }

            getChildContext() {
                return {
                    injectStore: this.store
                };
            }

            beforeRender() {
                Object.keys(defaultProps).forEach(key => {
                    this[key].on('get', this._get);
                });
            }

            afterRender() {
                Object.keys(defaultProps).forEach(key => {
                    this[key].off('get', this._get);
                });
            }

            componentWillUnmount() {
                Object.keys(defaultProps).forEach(key => {
                    this[key].off('change', this._change);
                    this[key].off('get', this._get);
                });
                // 还原组件原型，避免多次实例化导致的嵌套
                Component.prototype.render = render;
                if (componentDidMount) {
                    Component.prototype.componentDidMount = componentDidMount;
                }
            }
            componentDidMount() {
                const node = ReactDOM.findDOMNode(this);
                if (node) {
                    node._instance = this;
                }
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
                return <Component {...this.props} {...ret} />;
            }
        }
        return StoreWrapper;
    };
};

export default inject;
