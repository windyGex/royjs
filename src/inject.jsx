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
    let defaultProps = {}, pure = false;
    if (length === 1) {
        if (key.primaryKey) {
            defaultProps = {
                store: key
            };
        } else {
            warning('inject multiple store will be removed at next version');
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
        class StoreWrapper extends React.Component {
            static contextTypes = {
                store: T.any
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
                    this[key] = defaultProps[key];
                    this[key].on('change', this._change);
                    this[key].history = this[key].history || this.props.history;
                    if (this[key].name) {
                        this.context.store && this.context.store.mount(this[key].name, this[key]);
                    }
                    Component.prototype[key] = this[key];
                });

                const render = Component.prototype.render;
                const that = this;

                Component.prototype.render = function (...args) {
                    that.beforeRender();
                    const ret = render.apply(this, args);
                    that.afterRender();
                    return ret;
                };

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
            }
            componentDidMount() {
                const node = ReactDOM.findDOMNode(this);
                if (node) {
                    node._instance = this;
                }
            }
            render() {
                const ret = {};
                Object.keys(defaultProps).forEach(key => {
                    const store = defaultProps[key];
                    ret[key] = store.state;
                    if (key === 'store') {
                        ret.dispatch = store.dispatch;
                    } else {
                        ret[`${key}Dispatch`] = store.dispatch;
                    }
                });
                return <Component {...this.props} {...ret} />;
            }
        }
        return StoreWrapper;
    };
};

export default inject;
