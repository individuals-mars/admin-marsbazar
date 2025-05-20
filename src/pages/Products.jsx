import React, { useEffect } from 'react'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import { IoIosArrowDown } from "react-icons/io";
import { CiFilter } from "react-icons/ci";
import { GoPlus } from "react-icons/go";
import { useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux';
import { CiImageOn } from "react-icons/ci";

const Products = () => {
  const getURL = import.meta.env.VITE_BACKEND_URL + '/api/products'
  const token = useSelector((state) => state?.user.token)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    name: '',
    category: '',
    seller: '',
    price: '',
    img: '',
    description: '',
  })

  console.log('token', token);


  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value })
  }


  const handleSubmit = async (e) => {
    console.log('data', data);
    if (!data.name || !data.category || !data.seller || !data.price || !data.img || !data.description) {
      console.log("To'lig'mas");
      setError("To'ldir")
      return
    }
    setLoading(true)
    setError(null)


    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(getURL, data, {
        headers: {Authorization: `Bearer ${token}`},
      })
      console.log(response.data);
      fetchProducts()
    } catch (error) {
      setError(error, 'Xato bich')
    } finally {
      setLoading(false)
      setError(null) 
      setData({
        name: '',
        category: '',
        seller: '',
        price: '',
        img: '',
        description: '',
      })
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await axios.get(getURL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('response', response.data);
      setProducts(response.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setError(error)
      console.error("Xato", error)
    }
  }
  
  useEffect(() => {
    fetchProducts()
  }, [])
  return (
    <ContainerTemplate>
      <div className='flex items-center justify-between gap-3'>
        <TitleTemplate title='Products' description='Manage your products here' />
        <div className='flex gap-2 justify-center w-2/3'>
          <label className="input input-primary">
            <input type="search" required placeholder="Search" />
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
          </label>
          <details className="dropdown">
            <summary className="btn border bg-base-100 border-primary rounded-lg">
              <span className='flex items-center gap-2'>
                <p className='font-normal'>Show: <span className='font-bold'>All products</span></p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </details>
          <details className="dropdown">
            <summary className="btn border bg-base-100 border-primary rounded-lg">
              <span className='flex items-center gap-2'>
                <p className='font-normal'>Sort by: <span className='font-bold'>Default</span></p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </details>
          <button className="btn bg-primary rounded-lg">
            <CiFilter className='text-2xl' />
            Filter
          </button>
        </div>
        <div >
          <div className="drawer drawer-end">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary"> <GoPlus className='text-xl' /> Add product</label>
            </div>
            <div className="drawer-side">
              <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
              <div className="flex flex-col rounded-l-xl gap-8 items-center justify-center menu bg-base-200 text-base-content min-h-full w-[50%] p-4">
                <h2 className='text-2xl text-center font-medium'>Add product</h2>
                <div className='grid grid-cols-2 w-full'>
                 <div>
                   <fieldset className="fieldset">
                    <legend className="fieldset-legend">Product name:</legend>
                    <input name='name' value={data.name} onChange={handleChange} type="text" className='input input-primary' placeholder='Name' />
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Product Category:</legend>
                    <input name='category' value={data.category} onChange={handleChange} type="text" className='input input-primary' placeholder='Category' />
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Product price:</legend>
                    <input name='price' value={data.price} onChange={handleChange} type="text" className='input input-primary' placeholder='Price' />
                  </fieldset>

                    <fieldset className="fieldset">
                    <legend className="fieldset-legend">Product description:</legend>
                    <input name='description' value={data.description} onChange={handleChange} type="text" className='input input-primary' placeholder='Description' />
                  </fieldset>
                   <button onClick={handleSubmit} className='btn btn-primary w-80 mt-3'>Add</button>
                 </div>
                 <div>
                  <label htmlFor="file" className='border border-primary rounded-xl h-full flex items-center justify-center gap-2'>
                    <span><CiImageOn  className='text-5xl opacity-40'/></span>
                    <input value={data.img} onChange={handleChange} type="file" className='hidden' id='file' />
                  </label>
                 </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-4 mt-5 bg-base-100 p-4 rounded-lg flex-1 shadow-lg gap-2'>
        <fieldset className='fieldset'>
          <legend className='fieldset-legend'>Category</legend>
          <details className="dropdown">
            <summary className="btn w-full border bg-base-100 border-primary rounded-lg">
              <span className='flex items-center gap-2'>
                <p className='font-normal'>Category</p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </details>
        </fieldset>

        <fieldset className='fieldset'>
          <legend className='fieldset-legend'>Status</legend>
          <details className="dropdown">
            <summary className="btn w-full border bg-base-100 border-primary rounded-lg">
              <span className='flex items-center gap-2'>
                <p className='font-normal'>Status</p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </details>
        </fieldset>

        <fieldset className='fieldset'>
          <legend className='fieldset-legend'>Price</legend>
          <details className="dropdown">
            <summary className="btn w-full border bg-base-100 border-primary rounded-lg">
              <span className='flex items-center gap-2'>
                <p className='font-normal'>Price</p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </details>
        </fieldset>

        <fieldset className='fieldset'>
          <legend className='fieldset-legend'>Store</legend>
          <details className="dropdown">
            <summary className="btn w-full border bg-base-100 border-primary rounded-lg">
              <span className='flex items-center gap-2'>
                <p className='font-normal'>Store</p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><a>Item 1</a></li>
              <li><a>Item 2</a></li>
            </ul>
          </details>
        </fieldset>
      </div>

      <div className='mt-5 rounded-lg bg-base-100 shadow-lg'>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <th>Name</th>
                <th>Job</th>
                <th>Favorite Color</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((products, id) => (
                <tr key={products.id || id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            src={products.images}
                            alt="Avatar Tailwind CSS Component" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{products.name}</div>
                        <div className="text-sm opacity-50">{products.price} $</div>
                      </div>
                    </div>
                  </td>
                  <td>
                   {data.description}
                  </td>
                  <td>Purple</td>
                  <th>
                    <button className="btn btn-ghost btn-xs">details</button>
                  </th>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </ContainerTemplate>
  )
}

export default Products