import React from 'react';
import { connect } from '../../../src';

@connect(state => ({
    list: state.list
}))
export default class Cart extends React.Component {

    selectAll(e) {
        this.props.dispatch('selectAll', {
            checked: e.target.checked
        });
    }
    onSelect(id, e) {
        const {checked} = e.target;
        this.props.dispatch('select', {
            id,
            checked
        });
    }
    renderCart() {
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

    renderList(data) {
        return data.map(item => {
            return (
                <li className="goods-item" key={item.id}>
                    <div className="item-selector">
                        <div className="icon-selector">
                            <input type="checkbox" onChange={this.onSelect.bind(this, item.id)} checked={item.selected}/>
                        </div>
                    </div>
                    <div className="goods-img">
                        <img src={item.img}/>
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
                            <div className="num-btn">+</div>
                            <div className="show-num">{item.quantity}</div>
                            <div className="num-btn">-</div>
                        </div>
                    </div>
                </li>
            );
        });
    }
    render() {
        console.log('cart, render')
        const selectedItems = this.props.list.filter(item => item.selected);
        const selectedNum = selectedItems.length;
        const totalPrice = selectedItems.reduce((total, item) => {
            total += item.quantity * item.price;
            return total;
        }, 0);
        const checked = selectedItems.length === this.props.list.length;
        return (
            <div className="device" id="page-cart">
                <header>
                    <span className="header-title">购物清单</span>
                    <span className="header-edit">
                        <span>编辑</span>
                        <span>完成</span>
                    </span>
                </header>
                <div className="page">{this.renderCart()}</div>
                <div className="action-bar">
                    <div className="g-selector">
                        <div className="item-selector">
                            <div className="icon-selector">
                                <input type="checkbox" onChange={this.selectAll.bind(this)} checked={checked}/>
                            </div>
                        </div>
                        <span>全选</span>
                    </div>
                    <div className="action-btn buy-btn">去结算({selectedNum})</div>
                    <div className="action-btn del-btn">删除({selectedNum})</div>
                    <div className="total">
                        合计：
                        <span>
                            ¥<b>{totalPrice}</b>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
