import React, { useEffect, useState } from 'react';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { toast } from 'react-toastify';
import { IoEyeOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import LoadingTemplate from '../components/LoadingTemplate';
import { useDispatch } from 'react-redux';
import { setOrders } from '../store/orderSlice';
import { FiRepeat } from "react-icons/fi";
import { LuArrowBigUp, LuArrowBigDown } from "react-icons/lu";
import { MdWorkHistory } from "react-icons/md";
import { BsAwardFill } from "react-icons/bs";



const Orders = () => {
  const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/orders`;
  const [orders, setOrdersLocal] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortOrderByStatus, setSortOrderByStatus] = useState('asc');
  const [sortOrderByAge, setSortOrderByAge] = useState('asc');
  const [sortOrderByGender, setSortOrderByGender] = useState('asc');
  const [lastSortedAge, setLastSortedAge] = useState(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const fetchedOrders = data.data || data || [];
      setOrdersLocal(fetchedOrders);
      setFilteredOrders(fetchedOrders);
      dispatch(setOrders(fetchedOrders));
    } catch (error) {
      toast.error("Xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = () => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = orders.filter(order =>
      order.customer?.username?.toLowerCase().includes(lowerQuery)
    );
    setFilteredOrders(filtered);
  };

  const handleSortByStatus = () => {
    const sorted = [...filteredOrders].sort((a, b) => {
      const statusA = a.paymentStatus || '';
      const statusB = b.paymentStatus || '';
      return sortOrderByStatus === 'asc'
        ? statusA.localeCompare(statusB)
        : statusB.localeCompare(statusA);
    });

    setFilteredOrders(sorted);
    setSortOrderByStatus(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleSortByAge = () => {
    const sorted = [...filteredOrders].sort((a, b) => {
      const ageA = a.customer?.age || 0;
      const ageB = b.customer?.age || 0;
      return sortOrderByAge === 'asc' ? ageA - ageB : ageB - ageA;
    });

    const firstSortedAge = sorted[0]?.customer?.age || 0;
    setLastSortedAge(firstSortedAge);

    setFilteredOrders(sorted);
    setSortOrderByAge(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleSortByGender = () => {
    const sorted = [...filteredOrders].sort((a, b) => {
      const genderA = a.customer?.gender?.toLowerCase() || '';
      const genderB = b.customer?.gender?.toLowerCase() || '';
      return sortOrderByGender === 'asc'
        ? genderA.localeCompare(genderB)
        : genderB.localeCompare(genderA);
    });

    setFilteredOrders(sorted);
    setSortOrderByGender(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const SelectOrderDetail = (data) => {
    console.log("SARDORGEY:", data)
    dispatch(setOrders(data))
    navigate(`/order/${data._id}`)
  }

  return (
    <ContainerTemplate>
      <div>
        <div className='flex justify-between items-center'>
          <div className='bg-base-100 border-2 border-base-300 flex justify-between px-2 py-8 w-full rounded-2xl items-center'>
            <p className='text-2xl font-bold text-base-content'>
              <span className='text-success'>|</span> Orders
            </p>

            <label className="input w-[70%]  input-primary">
              <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                type="search"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  handleSearch();
                }}
              />
            </label>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn m-1 items-center text-base-content border-2 border-info">
                <FiRepeat />
                Change status
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li>
                  <button onClick={handleSortByAge} className="flex items-center gap-1">
                    {sortOrderByAge === 'asc' ? (
                      <LuArrowBigUp className="text-success" />
                    ) : (
                      <LuArrowBigDown className="text-error" />
                    )}
                    <span>Age</span>
                  </button>
                </li>
                <li><button onClick={handleSortByStatus}> <MdWorkHistory className='text-warning' />
                Sort by Status</button></li>
                <li><button onClick={handleSortByGender}> <BsAwardFill className='text-info'/>
                Sort by Gender</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className='mt-8 border-2 border-base-300 rounded-2xl bg-base-100'>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className='bg-base-200 '>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th className="cursor-pointer" onClick={handleSortByAge}>Age</th>
                  <th className='cursor-pointer' onClick={handleSortByGender}>Gender</th>
                  <th>City</th>
                  <th>Region</th>
                  <th>Street</th>
                  <th className="cursor-pointer" onClick={handleSortByStatus}>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="10" className="text-center"><LoadingTemplate /></td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">
                      <div className='flex items-center justify-center flex-col '>
                        <img src={`/notfound.png`} alt="Not Found" className="w-40" />
                        <p className=' text-2xl'>No data found</p>
                        <p className='text-xs'>Sorry we couldn’t find any data</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const customer = order.customer || {};
                    const location = order.location || {};
                    return (
                      <tr key={order._id}>
                        <th>{index + 1}</th>
                        <td>{customer?.username || "Noma'lum"}</td>
                        <td>{customer.phone || "Mavjud emas"}</td>
                        <td>{customer.age || "Mavjud emas"}</td>
                        <td>{customer.gender || "Mavjud emas"}</td>
                        <td>{location.city || "Mavjud emas"}</td>
                        <td>{location.region || "Mavjud emas"}</td>
                        <td>{location.street || "Mavjud emas"}</td>
                        <td>
                          <span className='bg-base-300 text-success relative right-2 font-semibold p-2 rounded-full'>
                            {order.paymentStatus || "Mavjud emas"}
                          </span>
                        </td>
                        <td>
                          <button className='btn btn-xs btn-outline' onClick={() => SelectOrderDetail(order)}>
                            <IoEyeOutline />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ContainerTemplate>
  );
};

export default Orders;
