import {Store, inject} from '../../src/';
import devtools from '../../src/devtools';
import route from '../../src/route';
import render from '../../src/render';
import {NavLink as Link} from 'react-router-dom';
import React from 'react';

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
            payload.set('completed', !payload.completed);
        },
        asyncAdd(state, payload) {
            setTimeout(() => {
                this.dispatch('add');
            }, 500);
        }
    }
}, {
    plugins: [logger, devtools]
});

@route('/:filter')
@inject(store)
class App extends React.Component {
    onAdd = (e) => {
        if (e.keyCode === 13) {
            this.store.dispatch('add', e.target.value);
            this.store.set('newTodo', '');
        }
    }
    onChange = (e) => {
        this.store.set('newTodo', e.target.value);
    }
    renderList() {
        const todoList = this.store.get('todoList');
        const {params} = this.props.match;
        const filters = {
            'all': todo => todo,
            'active': todo => todo.completed,
            'completed': todo => !todo.completed
        };
        return todoList.filter(todo => filters[params.filter]).map((todo, index)=> {
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
                    {todoCount > 0 ? <strong>剩余任务数量{todoList.length}个</strong> : null}
                    {todoCount <= 0 ? '没有需要完成的任务' : null}
                </span>
                <ul className="filters">
                    <li><Link to="/all" activeClassName="selected">All</Link></li>
                    <li><Link to="/active" activeClassName="selected">Active</Link></li>
                    <li><Link to="/complete" activeClassName="selected">Complete</Link></li>
                </ul>
            </footer>
        </section>);
    }
}
render(<App/>, '#root');
