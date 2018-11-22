import React from 'react';

class Cart extends React.Component {
    render() {
        return (
            <div className="device" id="page-cart">
                <header>
                    <span className="header-title">购物清单</span>
                    <span className="header-edit">
                        <span>编辑</span>
                        <span>完成</span>
                    </span>
                </header>
                <div className="page">
                    <div className="empty-states" v-if="cart.length === 0">
                        <span>这里是空的，快去逛逛吧</span>
                    </div>
                    <ul className="goods-list cart-list" v-else>
                        <li className="goods-item">
                            <div className="item-selector">
                                <div className="icon-selector">
                                    <svg
                                        t="1504061791962"
                                        className="icon"
                                        style=""
                                        viewBox="0 0 1024 1024"
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        p-id="2922"
                                        xmlns:xlink="http://www.w3.org/1999/xlink"
                                        width="12"
                                        height="12">
                                        <path
                                            d="M908.288 127.488l-537.6 537.6-254.976-254.976L0 525.824l254.976 254.976 115.712 115.712L486.4 780.8l537.6-537.6z"
                                            fill="#ffffff"
                                            p-id="2923"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="goods-img">
                                <img />
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
                    </ul>
                </div>
                <div className="action-bar">
                    <div className="g-selector">
                        <div className="item-selector">
                            <div className="icon-selector">
                                <svg
                                    t="1504061791962"
                                    className="icon"
                                    style=""
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    p-id="2922"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="12"
                                    height="12">
                                    <path
                                        d="M908.288 127.488l-537.6 537.6-254.976-254.976L0 525.824l254.976 254.976 115.712 115.712L486.4 780.8l537.6-537.6z"
                                        fill="#ffffff"
                                        p-id="2923"
                                    />
                                </svg>
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
