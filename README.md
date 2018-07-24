# Roy

A simple mvvm library for react.

## Basic Usage

```js
import {Store, inject} from '@alife/roy';

class Message extends Store {
    change() {
        this.set('message', 'changed');
    }
}

const message = new Message({
    state: {
        message: 'message'
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

class Message extends Store {
    change() {
        this.request.get('/mock.json').then(ret => {
            this.set('message', ret.data);
        });
    }
}

const message = new Message({
    state: {
        message: 'message'
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



