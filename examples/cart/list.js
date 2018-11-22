import React from 'react';
import { category, sortMethods, goods } from './config';

export default class List extends React.Component {
    renderCategory(data) {
        return data.map(item => {
            return (
                <li className="cate" key={item.id}>
                    {item.des}
                </li>
            );
        });
    }

    renderFilter(data) {
        return data.map(item => {
            return (
                <li className="filter-opt" key={item.value}>
                    {item.name}
                </li>
            );
        });
    }

    renderList(data) {
        return data.map(item => {
            return (
                <li className="goods-item">
                    <div className="goods-img">
                        <img src={item.img}/>
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
                        <span className="save">+</span>
                    </div>
                </li>
            );
        });
    }
    render() {
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
                    <ul className="goods-list">{this.renderList(goods)}</ul>
                </div>
            </div>
        );
    }
}
