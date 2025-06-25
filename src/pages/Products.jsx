
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { IoIosArrowDown } from 'react-icons/io';
import { CiFilter } from 'react-icons/ci';
import axios from 'axios';
import { toast } from 'react-toastify';

const Products = () => {
  const getURL = import.meta.env.VITE_BACKEND_URL + '/api/products/all';
  const token = useSelector((state) => state?.user?.token);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(getURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched products:', response.data);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
    else {
      setError('Please log in to view products');
      toast.error('Please log in to view products');
    }
  }, [token]);

  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Show filter
    if (showFilter === 'active') {
      result = result.filter((product) => product.stock > 0);
    } else if (showFilter === 'out-of-stock') {
      result = result.filter((product) => product.stock === 0);
    }

    // Sort
    if (sortBy === 'price-low-high') {
      result.sort((a, b) => (a.price?.sellingPrice || 0) - (b.price?.sellingPrice || 0));
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => (b.price?.sellingPrice || 0) - (a.price?.sellingPrice || 0));
    }


    setFilteredProducts(result);
  }, [searchQuery, showFilter, sortBy, products]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <ContainerTemplate>
      <div className="flex items-center justify-between gap-3">
        <TitleTemplate title="Products" description="View and manage your products here" />
        <div className="flex gap-2 justify-center w-2/3">
          <label className="input input-bordered border-base-200 dark:border-gray-600">
            <input
              type="search"
              placeholder="Search products"
              className="text-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
            <svg
              className="h-[1em] text-gray-500 dark:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
          </label>
          <details className="dropdown">
            <summary className="btn btn-neutral border-base-200 dark:border-gray-600 rounded-lg text-sm">
              <span className="flex items-center gap-2">
                <p>Show: <span className="font-medium">{showFilter === 'all' ? 'All products' : showFilter === 'active' ? 'Active' : 'Out of stock'}</span></p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 dark:bg-gray-800 rounded-box z-10 w-52 p-2 border border-base-200 dark:border-gray-700">
              <li><a onClick={() => setShowFilter('all')}>All products</a></li>
              <li><a onClick={() => setShowFilter('active')}>Active products</a></li>
              <li><a onClick={() => setShowFilter('out-of-stock')}>Out of stock</a></li>
            </ul>
          </details>
          <details className="dropdown">
            <summary className="btn btn-neutral border-base-200 dark:border-gray-600 rounded-lg text-sm">
              <span className="flex items-center gap-2">
                <p>Sort by: <span className="font-medium">{sortBy === 'default' ? 'Default' : sortBy === 'price-low-high' ? 'Price: Low to High' : sortBy === 'price-high-low' ? 'Price: High to Low' : 'Name: A-Z'}</span></p>
                <IoIosArrowDown />
              </span>
            </summary>
            <ul className="menu dropdown-content bg-base-100 dark:bg-gray-800 rounded-box z-10 w-52 p-2 border border-base-200 dark:border-gray-700">
              <li><a onClick={() => setSortBy('default')}>Default</a></li>
              <li><a onClick={() => setSortBy('price-low-high')}>Price: Low to High</a></li>
              <li><a onClick={() => setSortBy('price-high-low')}>Price: High to Low</a></li>
              <li><a onClick={() => setSortBy('name-az')}>Name: A-Z</a></li>
            </ul>
          </details>
          <button className="btn btn-neutral rounded-lg text-sm">
            <CiFilter className="text-xl" />
            Filter
          </button>
        </div>
      </div>

      {loading && <div className="text-center mt-5 text-base-content dark:text-gray-200">Loading...</div>}
      {error && <div className="text-center mt-5 text-error">{error}</div>}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center mt-5 text-base-content dark:text-gray-200">No products found</div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="mt-5 rounded-lg bg-base-100 dark:bg-gray-800 border border-base-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="table text-sm">
              <thead>
                <tr className="text-base-content dark:text-gray-200">
                  <th>
                    <input type="checkbox" className="checkbox checkbox-sm" />
                  </th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Seller</th>
                  <th>Shop</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Tags</th>
                  <th>Discount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const price = product.price || {};
                  return (
                    <tr key={product._id || index} className="hover:bg-base-200/50 dark:hover:bg-gray-700/50">
                      <td>
                        <input type="checkbox" className="checkbox checkbox-sm" />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
                              <img
                                src={product.images?.[0] || 'https://via.placeholder.com/50'}
                                alt={product.name}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{product.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{product.description?.slice(0, 20) || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{product.category || 'N/A'}</td>
                      <td>{product.seller?.username || 'N/A'}</td>
                      <td>{product.shop || 'N/A'}</td>
                      <td>{product.stock ?? 0}</td>
                      <td>${price.sellingPrice?.toFixed(2) || 'N/A'}</td>
                      <td>{product.tags?.join(', ') || 'None'}</td>
                      <td>{product.discount ? `${product.discount}%` : 'None'}</td>
                      <td>
                        <button className="btn btn-ghost btn-xs text-sm">Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ContainerTemplate>
  );
};

export default Products;
