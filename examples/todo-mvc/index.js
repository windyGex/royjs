import {Store, inject, devtools} from '../../src/';
import React from 'react';
import ReactDOM from 'react-dom';

const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.payload, obj.state.toJSON());
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
        return todoList.map((todo, index)=> {
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
            </footer>
        </section>);
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
