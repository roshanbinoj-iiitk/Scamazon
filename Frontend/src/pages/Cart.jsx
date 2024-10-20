// Cart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserNavbar from '../components/UserNavbar';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(''); 
    const [sellerName, setSellerName] = useState(''); 

    useEffect(() => {
        // Fetch cart items from backend
        const userId = localStorage.getItem('userID');
        setUserId(userId);
        // Fetch user name using axios
        axios.post('http://localhost:5000/get_username', { user_id: userId })
            .then(response => setSellerName(response.data.name || ''))
            .catch(error => console.error('Error fetching user name:', error));
        const response = axios.post('http://127.0.0.1:5000/cart', {"user_id":userId}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        response.then((res) => {
            console.log(userId)
            console.log(res.data.cart);
            setCartItems(res.data.cart);
        });
    }, []);

    const handleRemoveFromCart = (itemId,removeAll) => {
        // Logic to remove item from cart 
        axios.post('http://localhost:5000/cart/remove', {
            "user_id": userId,
            "product_id": itemId,
            "remove_all": removeAll
        })
            .then(() => {
                // reload the page
                window.location.reload();
                alert('Item removed from cart');
            })
            .catch(error => {
                console.error('Error removing item from cart:', error);
            });
    };

    const Checkout = (items) => {
        console.log(items);
        // send the user id and an array having itemid and quantity
        axios.post('http://localhost:5000/checkout', {
            "user_id": userId,
            "items": items
        })
            .then(() => {
                // reload the page
                window.location.reload();
                alert('Checkout successful');
            })
            .catch(error => {
                console.error('Error checking out:', error);
            });
    }

    return (
        <>
            <UserNavbar sellerName={sellerName} />
        <div className="p-4 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            {cartItems.length === 0 ? (
                <p className="text-center text-gray-500">Your cart is empty.</p>
            ) : (
                cartItems.map(item => (
                    <div key={item.p_id} className="flex justify-between items-center my-4 p-4 bg-white shadow-md rounded-lg">
                        <div className="flex items-center">
                            <img className="w-16 h-16 object-contain mr-4" src={item.p_id + ".png"} alt={item.p_name} />
                            <h3 className="font-semibold text-lg">{item.p_name}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-700">Price: ${item.price}</p>
                            <p className="text-gray-700">Quantity: {item.qty}</p>
                            <p className="text-gray-700 font-bold">Total: ${item.price * item.qty}</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleRemoveFromCart(item.p_id,false)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Remove one
                            </button>
                            <button
                                onClick={() => handleRemoveFromCart(item.p_id, true)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Remove all
                            </button>
                            <button
                                onClick={() => Checkout([{ "product_id": item.p_id, "quantity":item.qty }])}
                                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                            >
                                Buy now
                            </button>
                        </div>
                    </div>
                ))
            )}
            <div className="mt-8 text-center">
                <button onClick={() => {
                    const items = cartItems.map(item => {
                        return { "product_id": item.p_id, "quantity": item.qty }
                    });
                    Checkout(items);
                }} className="bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700">
                    Checkout
                </button>
            </div>
            </div>
        </>
    );
};

export default Cart;
