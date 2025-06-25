import React, { useState, useEffect } from 'react';
import { SiGooglemaps } from 'react-icons/si';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GiReceiveMoney } from 'react-icons/gi';

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
                    let errorMessage = 'Failed to fetch shops';
                    try {
                        const text = await response.text();
                        if (text.startsWith('<!DOCTYPE')) {
                            throw new Error('Received HTML instead of JSON. Check if /api/shops endpoint exists.');
                        }
                        const errorData = JSON.parse(text);
                        errorMessage = errorData.message || errorMessage;
                    } catch (_) { }
                    throw new Error(errorMessage);
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


    return (
        <div className="p-6">
            <div className="flex justify-between mb-3">
                <h1 className="font-semibold text-2xl mb-4">Shops</h1>
            </div>
            <hr className="mb-6 border-base-300" />

            {fetchLoading ? (
                <div className="flex flex-wrap gap-6">
                    {[...Array(7)].map((_, i) => (
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
                            className="card bg-base-100 shadow-xl w-[390px] h-[260px] cursor-pointer hover:shadow-2xl transition-shadow relative border border-base-300"
                            onClick={() => handleShopClick(shop._id)}
                        >
                            <div className="card-body flex flex-row items-center gap-4">
                                <img
                                    src={shop.logotype || defaultLogo}
                                    alt={`${shop.shopname} logo`}
                                    className="w-24 h-24 object-contain rounded-full"
                                />
                                <div>
                                    <h2 className="card-title text-lg">{shop.shopname}</h2>
                                    <p className="text-sm text-gray-500 flex mt-2">
                                        <SiGooglemaps className="mr-1 mt-2" />
                                        {shop.address || 'Tashkent, Uzbekistan'}
                                    </p>
                                    <p className={`text-sm flex mt-2 bg-transparent rounded px-1 ${shop.TariffPlan === 'premium' ? 'bg-gradient-to-r from-blue-600 to-orange-900' : shop.TariffPlan === 'standard' ? 'bg-gradient-to-r from-sky-950 to-cyan-400' : 'bg-gradient-to-tr from-orange-300 to-blue-900'} bg-clip-text text-transparent`}>
                                        <GiReceiveMoney className={`mr-1 mt-1 size-3  ${shop.TariffPlan === 'premium' ? 'text-blue-600' : shop.TariffPlan === 'standard' ? 'text-cyan-400' : 'text-orange-300'}`} />
                                        {shop.TariffPlan || 'basic'}
                                    </p>
                                </div>
                            </div>
                            <hr className="border-base-300" />
                            <div className="flex justify-between p-5 text-center">
                                <div>
                                    <p className="font-bold text-base-350">{shop.commission || '10%'}</p>
                                    <p className="text-xs text-base-350">Commission</p>
                                </div>
                                <p className="text-base-300">|</p>
                                <div>
                                    <p className="font-bold text-base-350">{shop.sales || '0'}</p>
                                    <p className="text-xs text-base-350">Sales</p>
                                </div>
                                <p className="text-base-300">|</p>
                                <div>
                                    <p className="font-bold text-base-350">{shop.balance || '0'}</p>
                                    <p className="text-xs text-base-350">Balance</p>
                                </div>
                                <p className="text-base-300">|</p>
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