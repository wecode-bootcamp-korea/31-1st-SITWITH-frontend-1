import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CartProduct from './CartProduct/CartProduct';
import { API } from '../../../config';
import './Cart.scss';

const Cart = ({ setSelect }) => {
  const [cartList, setCartList] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [total, setTotal] = useState(0);
  const [compareList, setCompareList] = useState([]);

  const orderPrice = data => {
    return data.result.map(
      product => product.quantity * Math.floor(product.product_price)
    );
  };
  const sum = totalList => {
    let sum = 0;
    for (let i of totalList) {
      sum += i;
    }
    setTotal(sum);
  };

  useEffect(() => {
    fetch(`${API.carts}`, {
      headers: { Authorization: localStorage.getItem('Authorization') },
    })
      .then(res => {
        if (res.status === 401) {
          let message = 'Cart does not exist';
          return message;
        } else {
          return res.json();
        }
      })
      .then(data => {
        if (data !== 'Cart does not exist') {
          setCartList(data.result);
          let totalList = orderPrice(data);
          sum(totalList);
        }
      });
  }, []);

  useEffect(() => {
    const localCompareList = localStorage.getItem('compareList');
    if (localCompareList !== null) {
      setCompareList(JSON.parse(localCompareList));
    } else {
      setCompareList([
        { cart_id: -1, product_name: 'none' },
        { cart_id: -2, product_name: 'none' },
        { cart_id: -3, product_name: 'none' },
        { cart_id: -4, product_name: 'none' },
      ]);
    }
  }, []);

  useEffect(() => {
    setSelect('cart');
  }, [setSelect]);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const checkAllHandler = e => {
    if (e.target.checked) {
      setCheckList(cartList.map(product => product.cart_id));
    } else {
      setCheckList([]);
    }
  };
  const checkHandler = (e, cart_id) => {
    if (e.target.checked) {
      setCheckList([...checkList, cart_id]);
    } else {
      setCheckList(checkList.filter(checkId => checkId !== cart_id));
    }
  };

  const cartDelete = (e, cart_id) => {
    e.preventDefault();
    fetch(`${API.carts}?id=${cart_id}`, {
      method: 'delete',
      headers: {
        Authorization: localStorage.getItem('Authorization'),
      },
    }).then(res => {
      if (res.status === 204) {
        alert('삭제되었습니다');
        fetch(`${API.carts}`, {
          headers: { Authorization: localStorage.getItem('Authorization') },
        })
          .then(res => res.json())
          .then(data => {
            setCartList(data.result);
            let totalList = orderPrice(data);
            sum(totalList);
          });
      }
    });
    // TODO : 선택항목 삭제 함수 구현
  };

  const addCompareList = (e, product) => {
    e.preventDefault();
    if (compareList.findIndex(i => i.product_name === 'none') !== -1) {
      setCompareList(
        compareList.filter(compare => compare.product_name !== 'none')
      );
    }

    if (
      compareList.findIndex(compare => compare.cart_id === product.cart_id) ===
      -1
    ) {
      setCompareList(compareList => [...compareList, product]);
      alert('비교하기에 추가되었습니다.');
    } else {
      alert('이미 비교하기에 있는 상품입니다.');
    }
  };

  return (
    <div className="cart">
      <h1>장바구니</h1>
      <div className="bar">
        <p />
      </div>
      <div className="process-bar">
        <div className="cart-bar">
          <div className="process-bar-img">
            <img src="/images/shopping-bag.png" alt="shopping-bag" />
          </div>
          <span>1. 장바구니</span>
        </div>
        <div className="order-bar">
          <div className="process-bar-img">
            <img src="/images/credit-card.png" alt="credit-card" />
          </div>
          <span>2. 주문하기</span>
        </div>
      </div>
      <div className="input-cart">
        <form className="cart-form">
          <table className="cart-table">
            <colgroup>
              {Cols_Width.map((col, idx) => (
                <col key={idx} width={col} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="check-all"
                    onChange={checkAllHandler}
                  />
                </th>
                {Th_Names.map((name, idx) => (
                  <th key={idx} className="tct">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            {cartList.length !== 0 ? (
              <tbody>
                {cartList.map(product => (
                  <CartProduct
                    key={product.cart_id}
                    product={product}
                    checkList={checkList}
                    checkHandler={checkHandler}
                    cartDelete={cartDelete}
                    addCompareList={addCompareList}
                  />
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={7} className="tct none-data">
                    <span>장바구니에 담긴 품목이 없습니다.</span>
                  </td>
                </tr>
              </tbody>
            )}

            <tfoot>
              <tr>
                <td colSpan={5}>&nbsp;</td>
                <td className="tct">총 결제금액</td>
                <td className="tct">
                  {total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
                </td>
              </tr>
            </tfoot>
          </table>
        </form>
      </div>
      <div className="button-list">
        <ul>
          {Buttons_Info.map((button, idx) => (
            <Link key={idx} to={button.link}>
              <li>
                <button className={button.className}>{button.content}</button>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Cart;

const Cols_Width = ['50px', '', '100px', '90px', '80px', '100px', '100px'];
const Th_Names = ['제품정보', '색상', '판매가격', '수량', '주문금액', ''];
const Buttons_Info = [
  { link: '/', className: '', content: '계속쇼핑하기' },
  { link: '', className: '', content: '선택상품 삭제하기' },
  { link: '', className: '', content: '선택상품 주문하기' },
  { link: '', className: 'order-all', content: '전체상품 주문하기' },
];
