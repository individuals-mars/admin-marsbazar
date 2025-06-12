import React, { useState, useEffect } from 'react';
import { SiGooglemaps } from 'react-icons/si';
import { MdOutlineLocalPhone } from 'react-icons/md';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Shops = () => {
    const [shops, setShops] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const token = useSelector((state) => state.user.token);
    const navigate = useNavigate();
    const defaultLogo = 'https://images-platform.99static.com//JO7XwrpaHhBzdsNOT-cGvqUuKEs=/81x82:917x918/fit-in/500x500/99designs-contests-attachments/103/103078/attachment_103078046';

    useEffect(() => {
        const fetchShops = async () => {
            if (!token) {
                toast.error('Please log in to view shops');
                navigate('/login');
                return;
            }

            setFetchLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shops`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }); 

                if (!response.ok) {
                    const text = await response.text();
                    if (text.startsWith('<!DOCTYPE')) {
                        throw new Error('Received HTML instead of JSON. Check if /api/shop/myshops endpoint exists.');
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch shops');
                }

                const data = await response.json();
                setShops(Array.isArray(data) ? data : data.data || []);
            } catch (err) {
                console.error('Error fetching shops:', err);
                if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
                    toast.error('Session expired. Please log in again.');
                    navigate('/login');
                } else {
                    toast.error(err.message || 'Failed to load shops');
                }
            } finally {
                setFetchLoading(false);
            }
        };

        fetchShops();
    }, [token, navigate]);

    const handleShopClick = (shopId) => {
        if (shopId) {
            navigate(`/shopdetail/${shopId}`);
        } else {
            toast.error('Shop ID is missing');
        }
    };

    const handleNavigateToCreate = () => {
        if (!token) {
            toast.error('Please log in to create a shop');
            return;
        }
        navigate('/modalcreateshops');
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-3">
                <h1 className="font-semibold text-2xl mb-4">All Shops</h1>
                <button
                    className="p-3 btn btn-success rounded-lg text-base-100 flex"
                    onClick={handleNavigateToCreate}
                    aria-label="Create new shop"
                    disabled={!token}
                    aria-disabled={!token}
                >
                    <FiPlus className="mr-1 my-1" /> Create Shop
                </button>
            </div>
            <hr className="mb-6 border-base-300" />

            {fetchLoading ? (
                <div className="flex flex-wrap gap-6">
                    {[...Array(1)].map((_, i) => (
                        <div key={i} className="skeleton h-[260px] w-[390px] mt-3"></div>
                    ))}
                </div>
            ) : shops.length === 0 ? (
                <p className="text-center text-gray-500">No shops available</p>
            ) : (
                <div className="flex flex-wrap gap-6">
                    {shops.map((shop, index) => (
                        <div
                            key={shop._id || index}
                            className="card bg-base-100 shadow-xl w-[390px] h-[260px] cursor-pointer hover:shadow-2xl transition-shadow"
                            onClick={() => handleShopClick(shop._id)}
                        >
                            <div className="card-body flex flex-row items-center gap-4">
                                <img
                                    src={shop.logotype || defaultLogo}
                                    alt={`${shop.shopname} logo`}
                                    className="w-24 h-24 object-contain rounded-full bg-success"
                                />
                                <div>
                                    <h2 className="card-title text-lg">{shop.shopname}</h2>
                                    <p className="text-sm text-gray-500 flex mt-2">
                                        <SiGooglemaps className=" mt-1 mr-2" />
                                        {shop.address || 'Tashkent, Uzbekistan'}
                                    </p>
                                    <p className="text-sm text-gray-500 flex mt-2">
                                        <MdOutlineLocalPhone className="mr-1 mt-1" />
                                        {shop.phone || '+998901234567'}
                                    </p>
                                </div>
                            </div>
                            <hr className="border-base-300" />
                            <div className="flex justify-between p-5 text-center">
                                <div>
                                    <p className="font-bold text-base-350">{shop.commission || '10%'}</p>
                                    <p className="text-xs text-base-350">Commission</p>
                                </div>
                                <p className="text-gray-500">|</p>
                                <div>
                                    <p className="font-bold text-base-350">{shop.sales || '0'}</p>
                                    <p className="text-xs text-base-350">Sales</p>
                                </div>
                                <p className="text-gray-500">|</p>
                                <div>
                                    <p className="font-bold text-base-350">{shop.balance || '0'}</p>
                                    <p className="text-xs text-base-350">Balance</p>
                                </div>
                                <p className="text-gray-500">|</p>
                                <div>
                                    <p className="font-bold text-base-350">{shop.withdraw || '0'}</p>
                                    <p className="text-xs text-base-350">Withdraw</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Shops;