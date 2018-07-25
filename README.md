# Roy.js

A simple mvvm library for react.

## Install

```shell
npm install roy.js --save
```

## Motive

![image](https://img.alicdn.com/tfs/TB1rzpgGHGYBuNjy0FoXXciBFXa-627-241.png)

The state management is nothing more than changing the state from partial to partial sharing, so in an application, each component can be managed corresponding to a state, and only when this part needs to be shared, it is extracted.

## Basic Usage

```js
import {Store, inject} from 'roy.js';

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
import {Store, inject} from 'roy.js';

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



