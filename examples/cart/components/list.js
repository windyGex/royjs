import React from 'react';
import { category, sortMethods } from '../config';
import { connect } from '../../../src';

@connect(state => state.list)
export default class List extends React.Component {
    add = item => {
        this.props.dispatch('addCartItem', item);
    };
    sort = value => {
        this.props.dispatch('sortList', value);
    };
    filter = id => {
        this.props.dispatch('fetch', {
            category: id
        });
    };
    renderCategory(data) {
        return data.map(item => {
            return (
                <li
                    className={`cate ${this.props.currentCategory === item.id ? 'tab-active' : ''}`}
                    key={item.id}
                    onClick={this.filter.bind(this, item.id)}>
                    {item.des}
                </li>
            );
        });
    }

    renderFilter(data) {
        return data.map(item => {
            return (
                <li
                    className={`filter-opt ${this.props.currentSort === item.value ? 'filter-active' : ''}`}
                    key={item.value}
                    onClick={this.sort.bind(this, item.value)}>
                    {item.name}
                </li>
            );
        });
    }

    renderList(data) {
        return data.map(item => {
            return (
                <li className="goods-item" key={item.id}>
                    <div className="goods-img">
                        <img src={item.img} />
                        <div className="flag">热</div>
                    </div>
                    <div className="goods-info">
                        <p className="goods-title">{item.name}</p>
                        <div className="goods-price">
                            <span>
                                ¥<b>{item.price}</b>
                            </span>
                        </div>
                        <span className="des">{item.sales}人付款</span>
                        <span className="save" onClick={this.add.bind(this, item)}>
                            +
                        </span>
                    </div>
                </li>
            );
        });
    }
    componentDidMount() {
        this.props.dispatch('fetch');
    }
    render() {
        console.log('list, render');
        return (
            <div className="device" id="page-list">
                <header>
                    <span className="header-title">商品列表</span>
                </header>
                <div className="page">
                    <div className="tab-wrap">
                        <ul className="cate-tab">{this.renderCategory(category)}</ul>
                    </div>
                    <ul className="filter-bar">{this.renderFilter(sortMethods)}</ul>
                    <ul className="goods-list">{this.renderList(this.props.goods)}</ul>
                </div>
                {this.props.loading ? <div className="loading">loading...</div> : null}
            </div>
        );
    }
}
