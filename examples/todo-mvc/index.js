import {NavLink as Link, HashRouter, Route, Switch, Redirect} from 'react-router-dom';
import React from 'react';
import {render} from 'react-dom';
import {Store, inject} from '../../src/';
import devtools from '../../src/plugins/devtools';
import routePlugin from '../../src/plugins/route';

const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.state.toJSON());
    });
};

const store = new Store({
    state: {
        newTodo: '',
        todoList: []
    },
    actions: {
        add(state, payload) {
            const {todoList} = state;
            todoList.push({
                title: payload,
                completed: false
            });
        },
        complete(state, payload) {
            payload.completed = !payload.completed;
        },
        asyncAdd(state, payload) {
            setTimeout(() => {
                this.dispatch('add');
            }, 500);
        }
    }
}, {
    plugins: [logger, devtools, routePlugin]
});

@inject(store)
class App extends React.Component {
    onAdd = (e) => {
        if (e.keyCode === 13) {
            this.store.dispatch('add', e.target.value);
            this.store.dispatch('setValues', {
                newTodo: ''
            });
        }
    }
    back = () => {
        this.store.dispatch('router.goBack');
    }
    onChange = (e) => {
        this.store.dispatch('setValues', {
            newTodo: e.target.value
        });
    }
    renderList() {
        const todoList = this.store.get('todoList');
        const {params} = this.props.match;
        const filters = {
            'all': todo => todo,
            'active': todo => !todo.completed,
            'complete': todo => todo.completed
        };
        return todoList.filter(filters[params.filter]).map((todo, index)=> {
            return <li className={{ completed: todo.completed }} key={index}>
                <div className="view">
                    <input
                        className="toggle"
                        readOnly
                        type="checkbox"
                        checked={todo.completed}
                        onClick={() => this.store.dispatch('complete', todo)}/>
                    <label>{todo.title}</label>
                </div>
            </li>;
        });
    }
    render() {
        const {todoList, newTodo} = this.store.state;
        const todoCount = todoList.filter(todo => !todo.completed).length;
        return (<section className="todoapp">
            <header className="header">
                <h1>TODO</h1>
                <input
                    className="new-todo"
                    autoFocus autoComplete="off"
                    placeholder="What needs to be done?"
                    value={newTodo}
                    onKeyUp={this.onAdd}
                    onChange={this.onChange}
                />
            </header>

            <section className="main">
                <input className="toggle-all" readOnly type="checkbox"/>
                <ul className="todo-list">
                    {this.renderList()}
                </ul>
            </section>

            <footer className="footer">
                <span className="todo-count">
                    {todoCount > 0 ? <strong>剩余任务数量{todoCount}个</strong> : null}
                    {todoCount <= 0 ? '没有需要完成的任务' : null}
                </span>
                <ul className="filters">
                    <li><Link to="/all" activeClassName="selected">All</Link></li>
                    <li><Link to="/active" activeClassName="selected">Active</Link></li>
                    <li><Link to="/complete" activeClassName="selected">Complete</Link></li>
                </ul>
                <button onClick={this.back} style={btnStyle}>后退</button>
            </footer>
        </section>);
    }
}

const btnStyle = {
    position: 'absolute',
    right: 5
};

const routes = (<HashRouter>
    <Switch>
        <Route path="/:filter" component={App} />
        <Redirect from ="/" to="/all" />
    </Switch>
</HashRouter>);

render(routes, document.querySelector('#root'));
