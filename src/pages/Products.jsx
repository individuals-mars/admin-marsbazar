import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { IoIosArrowDown } from 'react-icons/io';
import { CiFilter } from 'react-icons/ci';
import { MdDelete } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';
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
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const defaultImage = 'https://au.ooni.com/cdn/shop/articles/burger_resized_80d2f8e0-e7a8-4eb4-8614-eba52e70f57b.jpg?v=1662487592&width=1080';
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    seller: '',
    shop: '',
    stock: 0,
    description: '',
    price: { costPrice: 0, sellingPrice: 0 },
    tags: [''],
    discount: '',
    icon: [],
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log('📦 Response data:', data);

      const items = Array.isArray(data)
        ? data
        : data.products || data.data || []; // поддержка разных API

      if (!Array.isArray(items)) {
        throw new Error('❌ Неверный формат данных: ожидался массив продуктов');
      }

      const mappedProducts = items.map((item) => ({
        _id: item._id,
        title: item.title,
        name: item.title,
        icon: item.icon || [],
        images: item.icon || [],
        category: item.category || '',
        seller: item.seller || '',
        shop: item.shop || '',
        stock: item.stock || 0,
        description: item.description || '',
        price: item.price
          ? typeof item.price === 'string'
            ? JSON.parse(item.price)
            : item.price
          : { costPrice: 0, sellingPrice: 0 },
        tags: item.tags || [],
        discount: item.discount || 0,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setProducts(mappedProducts);
      setFilteredProducts(mappedProducts);
    } catch (err) {
      console.error('❌ fetchProducts error:', err);
      const message = err.message || 'Ошибка загрузки продуктов';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };



  const deleteProduct = async () => {
    if (!token) {
      toast.error('Please log in to delete products');
      navigate('/login');
      return;
    }

    if (!productIdToDelete) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${productIdToDelete}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка ${res.status}: ${errorText}`);
      }

      setProducts((prev) => prev.filter((item) => item._id !== productIdToDelete));
      setFilteredProducts((prev) => prev.filter((item) => item._id !== productIdToDelete));

      toast.success('Product deleted successfully!');
    } catch (error) {
      const message = error.message || 'Error deleting product';
      setError(message);
      toast.error(message);
    } finally {
      setProductIdToDelete(null);
      document.getElementById('delete_modal').close();
      setLoading(false);
    }
  };


  const editProduct = async (id, updatedData) => {
    try {
      const payload = {
        name: updatedData.title,
        stock: Number(updatedData.stock),
        price: {
          costPrice: Number(updatedData.price.costPrice),
          sellingPrice: Number(updatedData.price.sellingPrice),
        },
      };
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const updatedProduct = {
        ...response.data,
        name: response.data.title,
        price: response.data.price ? JSON.parse(response.data.price) : { costPrice: 0, sellingPrice: 0 },
      };
      setProducts(products.map((p) => (p._id === id ? updatedProduct : p)));
      setFilteredProducts(filteredProducts.map((p) => (p._id === id ? updatedProduct : p)));
      toast.success('Product updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
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

    if (searchQuery) {
      result = result.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showFilter === 'active') {
      result = result.filter((product) => product.stock > 0);
    } else if (showFilter === 'out-of-stock') {
      result = result.filter((product) => product.stock === 0);
    }

    if (sortBy === 'price-low-high') {
      result.sort((a, b) => (a.price?.sellingPrice || 0) - (b.price?.sellingPrice || 0));
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => (b.price?.sellingPrice || 0) - (a.price?.sellingPrice || 0));
    } else if (sortBy === 'name-az') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    setFilteredProducts(result);
  }, [searchQuery, showFilter, sortBy, products]);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const handleProductsClick = (id) => {
    if (id) navigate(`/productsdetail/${id}`); // Match ProductDetail route
    else toast.error('Product ID is missing');
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
                  <th>Discount</th>
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
                              alt={product.title}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{product.title || 'N/A'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.description?.slice(0, 20) || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{typeof product.category === 'string' ? product.category : product.category?.title || 'N/A'}</td>
                    <td>{typeof product.seller === 'string' ? product.seller : product.seller?.username || 'N/A'}</td>
                    <td>{typeof product.shop === 'string' ? product.shop : product.shop?.title || 'N/A'}</td>
                    <td>{product.stock ?? 0}</td>
                    <td>${product.price?.sellingPrice?.toFixed(2) || 'N/A'}</td>
                    <td>{product.tags?.join(', ') || 'None'}</td>
                    <td>{product.discount ? `${product.discount}%` : 'None'}</td>
                    <td className="flex gap-2 mt-3">
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductIdToDelete(product._id);
                          document.getElementById('delete_modal').showModal();
                        }}

                        aria-label="Delete product"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(product);
                          setEditForm({
                            title: product.title || '',
                            stock: product.stock || 0,
                            price: {
                              costPrice: product.price?.costPrice || 0,
                              sellingPrice: product.price?.sellingPrice || 0,
                            },

                          });
                          document.getElementById('edit_modal').showModal();
                        }}
                        aria-label="Edit product"
                      >
                        <CiEdit className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <dialog id="edit_modal" className="modal">
        <div className="modal-box bg-base-100 dark:bg-gray-800 max-w-lg p-6 rounded-lg border border-base-200 dark:border-gray-700">
          {editingProduct && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editProduct(editingProduct._id, editForm);
                document.getElementById('edit_modal').close();
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
                  aria-label="Close modal"
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
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content dark:text-gray-200 mb-1">Stock</label>
                <input
                  type="number"
                  className="input input-bordered w-full text-sm border-base-200 dark:border-gray-600"
                  placeholder="Stock"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
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
                  value={editForm.price.costPrice}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: { ...editForm.price, costPrice: Number(e.target.value) },
                    })
                  }
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
                  value={editForm.price.sellingPrice}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: { ...editForm.price, sellingPrice: Number(e.target.value) },
                    })
                  }
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
              > 
                Yes, Delete
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
