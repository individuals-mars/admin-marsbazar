import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { IoIosArrowDown } from 'react-icons/io';
import { CiFilter } from 'react-icons/ci';
import { FiChevronRight } from "react-icons/fi";
import { MdDelete } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';
import { FiChevronLeft } from "react-icons/fi";
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiTag, FiX } from 'react-icons/fi';

const Products = () => {
  const { token } = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 7, total: 0 })
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const defaultImage = 'https://media.istockphoto.com/id/1309352410/ru/%D1%84%D0%BE%D1%82%D0%BE/%D1%87%D0%B8%D0%B7%D0%B1%D1%83%D1%80%D0%B3%D0%B5%D1%80-%D1%81-%D0%BF%D0%BE%D0%BC%D0%B8%D0%B4%D0%BE%D1%80%D0%B0%D0%BC%D0%B8-%D0%B8-%D1%81%D0%B0%D0%BB%D0%B0%D1%82%D0%BE%D0%BC-%D0%BD%D0%B0-%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D1%8F%D0%BD%D0%BD%D0%BE%D0%B9-%D0%B4%D0%BE%D1%81%D0%BA%D0%B5.jpg?s=612x612&w=0&k=20&c=dW1Aguo-4PEcRs79PUbmMXpx5YrBjqSYiEhwnddbj_g=';

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pagination.current,
            limit: pagination.pageSize
          }
        }
      );

      const data = response.data;
      const items = data.data || data.products || data || [];

      if (!Array.isArray(items)) {
        throw new Error('Invalid data format: expected array of products');
      }

      const mappedProducts = items.map((item) => ({
        _id: item._id,
        name: item.name || item.title || '',
        images: item.images || item.icon || [],
        category: item.category?.title || item.category || '',
        seller: item.seller?.username || item.seller || '',
        shop: item.shop?.shopname || item.shop || '',
        stock: item.stock || 0,
        description: item.description || '',
        price: item.price
          ? typeof item.price === 'string'
            ? JSON.parse(item.price)
            : item.price
          : { costPrice: 0, sellingPrice: 0 },
        tags: item.tags || [],
        status: item.stock > 0 ? 'active' : 'out-of-stock',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setProducts(mappedProducts);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }))
      setFilteredProducts(mappedProducts);
    } catch (err) {
      const msg = err.message || 'Failed to load products';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  const deleteProduct = async () => {
    if (!productIdToDelete) return;

    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(prev => prev.filter(p => p._id !== productIdToDelete));
      setFilteredProducts(prev => prev.filter(p => p._id !== productIdToDelete));
      setProductIdToDelete(null);
      toast.success('Product deleted successfully!');
      document.getElementById('delete_modal').close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const editProduct = async (id, updatedData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(products.map(p => p._id === id ? response.data : p));
      setFilteredProducts(filteredProducts.map(p => p._id === id ? response.data : p));
      setEditingProduct(null);
      toast.success('Product updated successfully!');
      document.getElementById('edit_modal').close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, searchQuery]);

  useEffect(() => {
    let result = [...products];

    if (searchQuery) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showFilter === 'active') {
      result = result.filter(product => product.stock > 0);
    } else if (showFilter === 'out-of-stock') {
      result = result.filter(product => product.stock === 0);
    }

    if (sortBy === 'price-low-high') {
      result.sort((a, b) => (a.price?.sellingPrice || 0) - (b.price?.sellingPrice || 0));
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => (b.price?.sellingPrice || 0) - (a.price?.sellingPrice || 0));
    } else if (sortBy === 'name-az') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    setFilteredProducts(result);
  }, [searchQuery, showFilter, sortBy, products]);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleProductsClick = (id) => {
    if (id) navigate(`/productsdetail/${id}`);
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
          <button className="btn btn-neutral rounded-lg text-sm" onClick={() => toast.info('Filter functionality not implemented')}>
            <CiFilter className="text-xl" />
            Filter
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <span className="loading loading-spinner loading-lg text-base-content dark:text-gray-200"></span>
        </div>
      )}

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
                  <th><input type="checkbox" className="checkbox checkbox-sm" /></th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Seller</th>
                  <th>Shop</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-base-200/50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => handleProductsClick(product._id)}
                  >
                    <td><input type="checkbox" className="checkbox checkbox-sm" /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={product.images?.[0] || defaultImage}
                              alt={product.name}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.description?.slice(0, 20) || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.seller}</td>
                    <td>{product.shop}</td>
                    <td>{product.stock}</td>
                    <td>${product.price?.sellingPrice?.toFixed(2) || '0.00'}</td>
                    <td>{product.tags?.join(', ') || 'None'}</td>
                    <td className={`${product.status === 'active' ? 'text-success' : 'text-error'}`}>
                      {product.status}
                    </td>
                    <td className="flex mt-3">
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductIdToDelete(product._id);
                          document.getElementById('delete_modal').showModal();
                        }}
                      >
                        <MdDelete className="text-xl" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(product);
                          document.getElementById('edit_modal').showModal();
                        }}
                      >
                        <CiEdit className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 mb-5 p-4">
            <div className="text-sm text-gray-600">
              Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} products
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={pagination.current === 1}
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              >
                <FiChevronLeft />
              </button>
              <button className="join-item btn btn-sm">
                Page {pagination.current}
              </button>
              <button
                className="join-item btn btn-sm"
                disabled={pagination.current * pagination.pageSize >= pagination.total}
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}


      <dialog id="edit_modal" className="modal">
        <div className="modal-box bg-base-100 dark:bg-gray-800 max-w-lg p-6 rounded-lg border border-base-200 dark:border-gray-700">
          {editingProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editProduct(editingProduct._id, {
                  name: editingProduct.name,
                  stock: Number(editingProduct.stock),
                  price: {
                    costPrice: Number(editingProduct.price.costPrice),
                    sellingPrice: Number(editingProduct.price.sellingPrice),
                  },
                });
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center text-base-content dark:text-gray-200">
                <CiEdit className="mr-2 text-2xl" />
                <h3 className="font-bold text-lg">Edit Product</h3>
                <button
                  type="button"
                  className="ml-auto btn btn-ghost btn-sm"
                  onClick={() => document.getElementById('edit_modal').close()}
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content dark:text-gray-200 mb-1">Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full text-sm border-base-200 dark:border-gray-600"
                  placeholder="Name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content dark:text-gray-200 mb-1">Stock</label>
                <input
                  type="number"
                  className="input input-bordered w-full text-sm border-base-200 dark:border-gray-600"
                  placeholder="Stock"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content dark:text-gray-200 mb-1">Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full text-sm border-base-200 dark:border-gray-600"
                  placeholder="Cost Price"
                  value={editingProduct.price.costPrice}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    price: { ...editingProduct.price, costPrice: Number(e.target.value) }
                  })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content dark:text-gray-200 mb-1">Selling Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full text-sm border-base-200 dark:border-gray-600"
                  placeholder="Selling Price"
                  value={editingProduct.price.sellingPrice}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    price: { ...editingProduct.price, sellingPrice: Number(e.target.value) }
                  })}
                  min="0"
                  required
                />
              </div>

              <div className="mt-6 flex gap-2 justify-end">
                <button
                  type="submit"
                  className="btn btn-neutral btn-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-neutral btn-sm"
                  onClick={() => document.getElementById('edit_modal').close()}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>

      <dialog id="delete_modal" className="modal">
        <div className="modal-box bg-base-100 dark:bg-gray-800 max-w-md p-6 rounded-lg border border-base-200 dark:border-gray-700">
          <h3 className="font-bold text-lg text-error">Delete Product</h3>
          <p className="py-4 text-sm text-base-content dark:text-gray-300">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2 justify-end w-full">
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={deleteProduct}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                className="btn btn-neutral btn-sm"
                onClick={() => {
                  setProductIdToDelete(null);
                  document.getElementById('delete_modal').close();
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </ContainerTemplate>
  );
};

export default Products;