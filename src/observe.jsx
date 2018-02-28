import React from 'react';

export default function observe(Component) {
    return class ObserveWrapper extends React.Component {
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
            Object.keys(props).forEach(key => {
                if (this[key].on) {
                    this[key].on('change', this._change);
                    this[key].on('get', this._get);
                }
            });
        }
        componentWillUnmount() {
            Object.keys(this.props).forEach(key => {
                this[key].off && this[key].off('change', this._change);
            });
        }
        render() {
            return <Component {...this.props} />;
        }
    };
}
