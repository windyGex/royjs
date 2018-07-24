# Roy

A simple mvvm library for react.

## Basic Usage

```js
import {Store, inject} from '@alife/roy';

const message = new Message({
    state: {
        message: 'message'
    },
    change() {
        this.set('message', 'changed');
    }
});

@inject(message)
class App extends React.Component {
    render() {
        const {message} = this.store.state;
        return <div onClick={this.store.change}>{message}</div>;
    }
}

ReactDOM.render(<App/>, document.getElementById('test'));

```

## Get data from remote server.

```js
import {Store, inject} from '@alife/roy';

const message = new Store({
    state: {
        message: 'message'
    },
    change() {
        this.request.get('/mock.json').then(ret => {
            this.set('message', ret.data);
        });
    }
});

@inject(message)
class App extends React.Component {
    render() {
        const {message} = this.store.state;
        return <div onClick={this.store.change}>{message}</div>;
    }
}

ReactDOM.render(<App/>, document.getElementById('test'));
```



