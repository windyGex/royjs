import React from 'react';
import { connect } from '../../../src';

@connect(state => ({
    list: state.cart.list
}), true)
class CartList extends React.Component {

    onSelect(id, e) {
        const { checked } = e.target;
        this.props.dispatch('cart.select', {
            id,
            checked
        });
    }
    onAdd(item) {
        this.props.dispatch('cart.onAdd', item);
    }
    onReduce(item) {
        this.props.dispatch('cart.onReduce', item);
    }

    renderList(data) {
        return data.map(item => {
            return (
                <li className="goods-item" key={item.id}>
                    <div className="item-selector">
                        <div className="icon-selector">
                            <input
                                type="checkbox"
                                onChange={this.onSelect.bind(this, item.id)}
                                checked={item.selected}
                            />
                        </div>
                    </div>
                    <div className="goods-img">
                        <img src={item.img} />
                    </div>
                    <div className="goods-info">
                        <p className="goods-title">{item.name}</p>
                        <div className="goods-price">
                            <span>
                                ¥<b>{item.price}</b>
                            </span>
                        </div>
                        <span className="des">库存{item.stock}件</span>
                        <div className="goods-num">
                            <div className="num-btn" onClick={this.onAdd.bind(this, item)}>
                                +
                            </div>
                            <div className="show-num">{item.quantity}</div>
                            <div className="num-btn" onClick={this.onReduce.bind(this, item)}>
                                -
                            </div>
                        </div>
                    </div>
                </li>
            );
        });
    }
    render() {
        console.log('cartlist, render');
        const { list } = this.props;
        if (list.length) {
            return <ul className="goods-list cart-list">{this.renderList(list)}</ul>;
        }
        return (
            <div className="empty-states">
                <span>这里是空的，快去逛逛吧</span>
            </div>
        );
    }
}

export default CartList;
