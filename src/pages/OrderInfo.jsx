import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingTemplate from '../components/LoadingTemplate';
import { MdOutlineSaveAlt, MdLocationOn, MdLocalShipping, MdPayment } from 'react-icons/md';
import { FiPackage, FiCheckCircle } from 'react-icons/fi';
import ContainerTemplate from '../components/ContainerTemplate';
import { useSelector } from 'react-redux';

const OrderInfo = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const ordersInfo = useSelector(state => state.order?.selectedOrder);

  useEffect(() => {
    if (ordersInfo) {
      setLoading(false);
    }
  }, [ordersInfo]);

  if (loading || !ordersInfo) {
    return (
      <div className='flex items-center justify-center h-screen bg-base-100'>
        <LoadingTemplate />
      </div>
    );
  }

  const statusSteps = [
    { 
      name: 'Pending', 
      icon: <FiPackage className="text-lg" />,
      color: 'bg-yellow-100 text-yellow-800'
    },
    { 
      name: 'Processing', 
      icon: <FiPackage className="text-lg" />,
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      name: 'Local Facility', 
      icon: <MdLocationOn className="text-lg" />,
      color: 'bg-purple-100 text-purple-800'
    },
    { 
      name: 'Out for Delivery', 
      icon: <MdLocalShipping className="text-lg" />,
      color: 'bg-orange-100 text-orange-800'
    },
    { 
      name: 'Completed', 
      icon: <FiCheckCircle className="text-lg" />,
      color: 'bg-green-100 text-green-800'
    }
  ];

  const activeStep = statusSteps.findIndex(step => 
    step.name.toLowerCase().includes(ordersInfo.status.toLowerCase())
  );

  const formatPaymentMethod = (method) => {
    const methods = {
      stripe: 'Credit Card (Stripe)',
      cash: 'Cash on Delivery',
      paypal: 'PayPal'
    };
    return methods[method] || method;
  };

  const products = [
    {
      name: 'See by Chloe',
      quantity: 1,
      price: 280.00,
      image: '/handbag.png'
    }
  ];

  const orderSummary = {
    subtotal: 280.00,
    discount: 0.5,
    tax: 5.60,
    shipping: 0.00
  };

  const total = (orderSummary.subtotal * (1 - orderSummary.discount)) + orderSummary.tax + orderSummary.shipping;

  return (
     <ContainerTemplate>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          
          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-light text-gray-900">Order #{id}</h1>
                <p className="text-gray-500 font-light">
                  {new Date(ordersInfo.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                  <MdPayment className="w-4 h-4" />
                  {formatPaymentMethod(ordersInfo.paymentStatus)}
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium">
                  <FiPackage className="w-4 h-4" />
                  {ordersInfo.status || "Unknown"}
                </div>
                <button className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  <MdOutlineSaveAlt className="w-4 h-4" />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-light text-gray-900 mb-8">Order Progress</h2>
            
            {/* Status Steps */}
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                {statusSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center relative">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${index <= activeStep 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {index < activeStep ? (
                        <FiCheckCircle className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className={`
                      mt-3 text-sm font-medium transition-colors
                      ${index <= activeStep ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {step.name}
                    </span>
                    
                    {/* Progress Line */}
                    {index < statusSteps.length - 1 && (
                      <div className="absolute top-6 left-12 w-full h-0.5 bg-gray-200">
                        <div className={`
                          h-full transition-all duration-500
                          ${index < activeStep ? 'bg-gray-900 w-full' : 'w-0'}
                        `} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Update Controls */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <select
                defaultValue={ordersInfo.status}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {statusSteps.map((step, index) => (
                  <option 
                    key={index} 
                    value={step.name.toLowerCase().replace(' ', '-')}
                    disabled={index < activeStep}
                  >
                    {step.name}
                  </option>
                ))}
              </select>
              <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                Update Status
              </button>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-light text-gray-900 mb-6">Order Items</h2>
            
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {index + 1000}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-right">
                    <div className="text-gray-600">${product.price.toFixed(2)}</div>
                    <div className="text-gray-600">Qty: {product.quantity}</div>
                    <div className="font-medium text-gray-900 min-w-[80px]">
                      ${(product.price * product.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Customer Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Order Summary */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-light text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount ({orderSummary.discount * 100}%)</span>
                  <span className="text-green-600">-${(orderSummary.subtotal * orderSummary.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${orderSummary.shipping.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-light text-gray-900 mb-6">Customer Details</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{ordersInfo.customer?.username}</h3>
                  <p className="text-gray-500 text-sm">{ordersInfo.customer?.email}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    <p>{ordersInfo.shippingAddress?.street}</p>
                    <p>{ordersInfo.shippingAddress?.city}, {ordersInfo.shippingAddress?.zipCode}</p>
                    <p>{ordersInfo.shippingAddress?.country}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Method</h4>
                  <p className="text-gray-600 text-sm">Express Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContainerTemplate>
  );
};

export default OrderInfo;