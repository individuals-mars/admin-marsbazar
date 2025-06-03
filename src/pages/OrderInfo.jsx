import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingTemplate from '../components/LoadingTemplate';
import { MdOutlineSaveAlt } from "react-icons/md";
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import ContainerTemplate from '../components/ContainerTemplate';
import { useSelector } from 'react-redux';


// Helper to get active step index from status string
const getStepIndex = (status) => {
  switch (status) {
    case 'pending': return 0;
    case 'processing': return 1;
    case 'local-facility': return 2;
    case 'out-for-delivery': return 3;
    case 'completed': return 4;
    default: return 0;
  }
};

// Helper to convert payment method to readable label
const formatPaymentMethod = (method) => {
  if (method === 'stripe') return 'Stripe';
  if (method === 'cash') return 'Cash on Delivery';
  return method;
};

const OrderInfo = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const ordersInfo = useSelector(state => state.order?.selectedOrder);


  useEffect(() => {
    if (ordersInfo) {
      setLoading(false);
    }
  }, [ordersInfo]);

  const activeStep = getStepIndex(ordersInfo?.status);
  console.log(activeStep);


  if (loading || !ordersInfo) {
    return (
      <div className='flex items-center justify-center h-screen bg-base-10'>
        <LoadingTemplate />
      </div>
    );
  }

  const steps = [
    { name: 'Pending' },
    { name: 'Processing' },
    { name: 'Local Facility' },
    { name: 'Out for Delivery' },
  ]

  const OrderInfoSection = [
    {
      title: `${ordersInfo.customer.username}`,
      content: [
        `${ordersInfo.products?.status || 1} Item`,
        "Express Delivery",
        `Payment Method: ${formatPaymentMethod(ordersInfo.paymentStatus)}`
      ]
    }
  ];  

  console.log("Order Pending status:", ordersInfo); 


  return (
    <ContainerTemplate>
      <div className='flex flex-col'>
        <div className="bg-base-300 flex justify-between items-center rounded-tl-md rounded-tr-md px-6 py-4">
          <p className='font-bold'>
            Order Status: <span className='bg-success text-base-content rounded-2xl px-2 py-1 text-xs font-semibold capitalize'>
              {ordersInfo.status || "Unknown"}
            </span>
          </p>
          <p className='font-bold'>
            Payment Status: <span className='bg-success text-base-content rounded-2xl px-2 py-1 text-xs font-semibold capitalize'>
              {formatPaymentMethod(ordersInfo.paymentStatus)}
            </span>
          </p>
        </div>

        <div className='bg-base-100 flex flex-col gap-4 px-6 py-6'>
          <div className='flex justify-end'>
            <button className='flex items-center btn btn-info h-12'>
              <MdOutlineSaveAlt />
              Download Invoice
            </button>
          </div>

          <div className='flex items-center justify-between'>
            <p className='text-nowrap font-medium'>Order ID - {id}</p>

            <div className='flex gap-4 w-[90%]'>
              <select
                defaultValue={ordersInfo.status}
                className="select select-primary text-lg ml-auto select-sm"
              >
                <option disabled={true}>Order processing</option>
                <option value="pending">Order pending
                </option>
                <option value="processing">Order Processing</option>
                <option value="local-facility">Order At Local Facility</option>
                <option value="out-for-delivery">Order Out For Delivery</option>
                <option value="completed">Order Completed</option>
              </select>
              <button className='btn btn-success btn-sm'>Change Status</button>
            </div>
          </div>

          <div className='mt-8 bg-base-200'>
            <ul className="steps steps-vertical lg:steps-horizontal w-full">
              {steps.map((item, index) => (
                <li key={index} className={`step ${index <= activeStep ? 'step-primary' : ''}`}>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <div className='mt-8 bg-base-200 flex items-center justify-between p-2 rounded-xl'>
            <p className='pl-4 font-medium'>Products</p>
            <p className='pr-4 font-medium'>Total</p>
          </div>

          <div className='flex items-center gap-4 mt-4 justify-between'>
            <div className='flex items-center gap-3'>
              <img src={`../../public/handback.png`} alt="Product" className='w-[5%]' />
              <p className='font-semibold'>See by Chloe x1</p>
            </div>

            <div className='mt-8 pt-4 border-t border-base-300'>
              <div className='space-y-4 mt-4'>
                <div className='flex justify-between w-full max-w-2xl mx-auto gap-20'>
                  <p className='text-sm text-base-content truncate'>Sub total</p>
                  <p className='text-sm text-base-content'>$280.00</p>
                </div>
                <div className='flex justify-between w-full max-w-2xl mx-auto'>
                  <p className='text-sm text-base-content truncate'>Discount</p>
                  <p className='text-sm text-base-content'>50%</p>
                </div>
                <div className='flex justify-between w-full max-w-2xl mx-auto'>
                  <p className='text-sm text-base-content truncate'>Tax</p>
                  <p className='text-sm text-base-content'>$5.60</p>
                </div>
                <div className='flex justify-between w-full max-w-2xl mx-auto pt-2 border-t border-dashed border-base-300'>
                  <p className='font-bold text-sm truncate'>Total</p>
                  <p className='font-bold text-sm'>$335.60</p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-start justify-between mt-10 gap-6'>
            {OrderInfoSection.map((section, index) => (
              <div key={index} className='w-full max-w-xs'>
                <p className='font-medium text-xl mb-2'>{section?.title}</p>
                <hr className='my-4 border-base-300' />
                <div className='space-y-1'>
                  {section.content.map((line, i) => (
                    <p key={i} className='text-sm text-base-content'>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </ContainerTemplate>
  );
};

export default OrderInfo;
