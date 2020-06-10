import React from 'react';
import ReactDOM from 'react-dom';
import eql from 'shallowequal';
import { warning, change, get } from './utils';
import { StoreContext } from './provider';

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
            static contextType = StoreContext;

            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = change.bind(this);
                this._get = get.bind(this);
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
                return <Component {...this.props} {...ret} ref={this.setInstance} />;
            }
        }
        return StoreWrapper;
    };
};

export default inject;
