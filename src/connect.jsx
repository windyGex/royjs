import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';
import Store from './store';

const connect = function (
    mapStateToProps = state => state,
    mapActionToProps = () => {}
) {
    return function withStore(Component) {
        class StoreWrapper extends React.Component {
            static contextTypes = {
                store: T.any
            };
            store = this.context.store || Store.get();
            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = obj => {
                    const state = {};
                    if (this._deps[obj.key]) {
                        state[obj.key] = obj.value;
                        this.setState(state);
                    }
                };
                this._get = data => {
                    this._deps[data.key] = true;
                };
                this.store.on('change', this._change);
                this.store.on('get', this._get);
                Component.prototype.store = this.store;
            }
            componentWillUnmount() {
                this.store.off('change', this._change);
                this.store.off('get', this._get);
            }
            componentDidMount() {
                const node = ReactDOM.findDOMNode(this);
                node._instance = this;
            }
            render() {
                const props = mapStateToProps(this.store.state);
                const actions = mapActionToProps(this.store.actions);
                return <Component {...this.props} {...props} {...actions} />;
            }
        }
        return StoreWrapper;
    };
};

export default connect;
