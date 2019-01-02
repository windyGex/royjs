import {Store, inject} from '../../src/';
import devtools from '../../src/plugins/devtools';
import React from 'react';
import ReactDOM from 'react-dom';

const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.payload, obj.state.toJSON());
    });
};
/**
 * 这个示例演示了pure属性的使用
 * 一般用在子组件也被inject的情况，这个时候父组件的刷新不会影响到子组件
 */
const store = new Store({
    state: {
        count: 0,
        list: []
    },
    actions: {
        add(state, payload) {
            state.count++;
        },
        reduce(state, payload) {
            state.count--;
        },
        addList(state) {
            state.list.push('');
        },
        async asyncAdd(state, payload) {
            await new Promise((resolve) => {
                setTimeout(() =>{
                    resolve();
                }, 400);
            });
            this.dispatch('add');
        }
    }
}, {
    plugins: [logger, devtools]
});

@inject(store, true)
class Child extends React.Component {
    render() {
        console.log('child render!');
        const {list} = this.props.state;
        return <span>{list.length}</span>;
    }
}

@inject(store)
class App extends React.Component {
    render() {
        const {count} = this.props.state;
        const {dispatch} = this.props;
        return (<div>
            {count}
            <Child/>
            <button onClick={() => dispatch('add')}>add</button>
            <button onClick={() => dispatch('addList')}>addList</button>
            <button onClick={() => dispatch('reduce')}>reduce</button>
            <button onClick={() => dispatch('asyncAdd')}>async</button>
        </div>);
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
