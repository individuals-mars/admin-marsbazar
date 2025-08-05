import React, { useState, useEffect } from 'react';
import { SiGooglemaps } from 'react-icons/si';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { GiReceiveMoney, GiShoppingCart, GiMoneyStack, GiPayMoney } from 'react-icons/gi';
import { FaPercentage, FaWallet } from 'react-icons/fa';
import { BsShop } from 'react-icons/bs';

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

    const getTariffBadgeColor = (tariff) => {
        switch (tariff?.toLowerCase()) {
            case 'premium': return 'badge-primary';
            case 'standard': return 'badge-secondary';
            case 'basic': return 'badge-accent';
            default: return 'badge-neutral';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <BsShop className="text-primary" />
                    Shops Directory
                </h1>
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><a>Dashboard</a></li> 
                        <li><a className='text-primary'> Shops</a></li>
                    </ul>
                </div>
            </div>

            <div className="divider"></div>

            {fetchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card bg-base-200 animate-pulse h-64 border border-base-300">
                            <div className="card-body">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-base-300 h-16 w-16"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-base-300 rounded w-3/4"></div>
                                        <div className="h-3 bg-base-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="divider my-2"></div>
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className="h-3 bg-base-300 rounded w-3/4 mb-1"></div>
                                            <div className="h-2 bg-base-300 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : shops.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-block p-6 bg-base-200 rounded-full mb-4">
                        <BsShop className="text-4xl text-base-content/30" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No shops available</h3>
                    <p className="text-base-content/60">Create your first shop to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop, index) => (
                        <div
                            key={shop._id || index}
                            className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-base-200 hover:border-primary/20"
                            onClick={() => handleShopClick(shop._id)}
                        >
                            <div className="card-body p-5">
                                <div className="flex items-start gap-4">
                                    <div className="avatar">
                                        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            <img
                                                src={shop.logotype || defaultLogo}
                                                alt={`${shop.shopname} logo`}
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="card-title text-lg">{shop.shopname}</h2>
                                        <div className="flex items-center text-sm text-base-content/70 mt-1">
                                            <SiGooglemaps className="mr-1" />
                                            {shop.address || 'Tashkent, Uzbekistan'}
                                        </div>
                                        <div className="mt-2">
                                            <span className={`badge gap-1 ${getTariffBadgeColor(shop.TariffPlan)}`}>
                                                <GiReceiveMoney className="text-sm" />
                                                {shop.TariffPlan || 'basic'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="divider my-2"></div>

                                <div className="stats stats-horizontal shadow bg-base-200">
                                    <div className="stat p-3">
                                        <div className="stat-figure text-primary">
                                            <FaPercentage className="text-lg" />
                                        </div>
                                        <div className="stat-title">Commission</div>
                                        <div className="stat-value text-sm">{shop.commission || '10%'}</div>
                                    </div>
                                    
                                    <div className="stat p-3">
                                        <div className="stat-figure text-secondary">
                                            <GiShoppingCart className="text-lg" />
                                        </div>
                                        <div className="stat-title">Sales</div>
                                        <div className="stat-value text-sm">{shop.sales || '0'}</div>
                                    </div>
                                    
                                    <div className="stat p-3">
                                        <div className="stat-figure text-accent">
                                            <FaWallet className="text-lg" />
                                        </div>
                                        <div className="stat-title">Balance</div>
                                        <div className="stat-value text-sm">{shop.balance || '0'}</div>
                                    </div>
                                    
                                    <div className="stat p-3">
                                        <div className="stat-figure text-info">
                                            <GiPayMoney className="text-lg" />
                                        </div>
                                        <div className="stat-title">Withdraw</div>
                                        <div className="stat-value text-sm">{shop.withdraw || '0'}</div>
                                    </div>
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