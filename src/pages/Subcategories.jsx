import React, { useEffect, useState, useRef } from 'react';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { FiEdit2, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoCopyOutline } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-toastify';

const Subcategories = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const SUBCATEGORY_URL = `${BASE_URL}/api/subcategories`;
  const CATEGORY_URL = `${BASE_URL}/api/categories`;
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    table: false,
    form: false,
    categories: false
  });
  const [data, setData] = useState({ 
    name: '', 
    categoryId: '' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [expandedRows, setExpandedRows] = useState({});

  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleSubs = subcategories.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const [idModal, setIdModal] = useState({ open: false, id: null, name: '' });
  const textRef = useRef(null);

  const openIdModal = (id, name) => setIdModal({ open: true, id, name });
  const closeIdModal = () => setIdModal({ open: false, id: null, name: '' });

  const copyText = () => {
    const txt = idModal.id;
    if (!txt) return;
    navigator.clipboard
      .writeText(txt)
      .then(() => toast.success('ID copied to clipboard!'))
      .catch(() => toast.error('Error copying ID'));
  };

  const getSubcategories = async () => {
    setLoading(prev => ({ ...prev, table: true }));
    setError(null);
    try {
      const { data: resData } = await axios.get(SUBCATEGORY_URL, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
        },
      });

      const fetched = resData.subcategories ?? resData.data ?? resData ?? [];
      const total = resData.total ?? fetched.length;

      setSubcategories(fetched);
      setPagination((p) => ({ ...p, total }));
    } catch (e) {
      const msg = e.response?.data?.message || 'Error fetching subcategories';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(prev => ({ ...prev, table: false }));
    }
  };

  const getCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const { data } = await axios.get(CATEGORY_URL);
      setCategories(data.categories ?? data.data ?? data ?? []);
    } catch (e) {
      const msg = e.response?.data?.message || 'Error fetching categories';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    getSubcategories();
  }, [pagination.current, pagination.pageSize]);

  const handleChange = (e) => {
    setData((d) => ({ ...d, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setData({ name: '', categoryId: '' });
    setIsEditing(false);
    setEditId(null);
    const drawer = document.getElementById('subcat-drawer-toggle');
    if (drawer) drawer.checked = false;
  };

  const handleEdit = (subcategory) => {
    setData({
      name: subcategory.name,
      categoryId: subcategory.category?._id || subcategory.category || '',
    });
    setEditId(subcategory._id);
    setIsEditing(true);
    const drawer = document.getElementById('subcat-drawer-toggle');
    if (drawer) drawer.checked = true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name || !data.categoryId) {
      const msg = 'Please fill all fields';
      setError(msg);
      toast.error(msg);
      return;
    }
    
    setLoading(prev => ({ ...prev, form: true }));
    setError(null);
    
    try {
      const payload = {
        name: data.name,
        category: data.categoryId,
      };

      if (isEditing) {
        await axios.put(`${SUBCATEGORY_URL}/${editId}`, payload);
        toast.success('Subcategory updated successfully!');
      } else {
        await axios.post(SUBCATEGORY_URL, payload);
        toast.success('Subcategory created successfully!');
      }
      
      resetForm();
      getSubcategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error processing request';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const deleteSubcategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    
    setLoading(prev => ({ ...prev, table: true }));
    try {
      await axios.delete(`${SUBCATEGORY_URL}/${id}`);
      toast.success('Subcategory deleted successfully!');
      
      setPagination((p) => {
        const newTotal = p.total - 1;
        const newLastPage = Math.max(1, Math.ceil(newTotal / p.pageSize));
        const newCurrent = Math.min(p.current, newLastPage);
        return { ...p, total: newTotal, current: newCurrent };
      });
      
      getSubcategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting subcategory';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(prev => ({ ...prev, table: false }));
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <ContainerTemplate>
      <div className="space-y-6">
        {/* Header with title and add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TitleTemplate 
            title="Subcategories" 
            description="Manage your product subcategories" 
          />
          
          <label 
            htmlFor="subcat-drawer-toggle" 
            className="btn btn-primary gap-2"
            onClick={() => {
              setIsEditing(false);
              resetForm();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Subcategory
          </label>
        </div>

        {/* Subcategories Table */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-base-200">
                  <tr>
                    <th className="w-12">#</th>
                    <th>Subcategory</th>
                    <th>Parent Category</th>
                    <th className="w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading.table && visibleSubs.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="flex justify-center items-center p-8">
                          <span className="loading loading-spinner loading-lg text-primary" />
                        </div>
                      </td>
                    </tr>
                  ) : visibleSubs.length ? (
                    visibleSubs.map((item, idx) => (
                      <React.Fragment key={item._id}>
                        <tr 
                          className="hover:bg-base-200/50 transition-colors cursor-pointer"
                          onClick={() => toggleRowExpand(item._id)}
                        >
                          <td>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openIdModal(item._id, item.name);
                              }}
                              className="text-primary hover:text-primary/70"
                            >
                              {start + idx + 1}
                            </button>
                          </td>
                          <td>
                            <div className="font-medium flex items-center gap-2">
                              {item.name}
                              {item.description && (
                                expandedRows[item._id] ? (
                                  <FiChevronUp className="text-gray-400 text-sm" />
                                ) : (
                                  <FiChevronDown className="text-gray-400 text-sm" />
                                )
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="badge badge-outline">
                              {categories.find(cat => cat._id === (item.category?._id || item.category))?.title || 'Unknown'}
                            </div>
                          </td>
                          <td className="flex justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="btn btn-ghost btn-sm btn-square text-primary hover:bg-primary/10"
                              title="Edit"
                            >
                              <FiEdit2 className="text-lg" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSubcategory(item._id);
                              }}
                              className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                              title="Delete"
                              disabled={loading.table}
                            >
                              <AiOutlineDelete className="text-lg" />
                            </button>
                          </td>
                        </tr>
                        
                        {expandedRows[item._id] && item.description && (
                          <tr className="bg-base-100">
                            <td colSpan={4} className="p-0">
                              <div className="px-4 py-3 bg-base-100 border-t border-base-300">
                                <h4 className="text-sm font-semibold mb-1 text-gray-600">Description:</h4>
                                <p className="text-sm text-gray-700">{item.description}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center p-8">
                        <div className="text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="mt-2 font-medium">No subcategories found</p>
                          <button 
                            className="btn btn-sm btn-ghost mt-2"
                            onClick={getSubcategories}
                          >
                            Refresh
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading.table && subcategories.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{start + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(end, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> subcategories
                </div>
                
                <div className="join">
                  <button
                    className="join-item btn btn-sm btn-ghost"
                    disabled={pagination.current === 1}
                    onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === pagination.current || 
                      page === pagination.current - 1 || 
                      page === pagination.current + 1 || 
                      page === totalPages
                    )
                    .map((page, i, arr) => (
                      <React.Fragment key={page}>
                        {i > 0 && arr[i-1] !== page - 1 && (
                          <button className="join-item btn btn-sm btn-disabled">...</button>
                        )}
                        <button
                          className={`join-item btn btn-sm ${pagination.current === page ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setPagination(p => ({ ...p, current: page }))}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))
                  }
                  
                  <button
                    className="join-item btn btn-sm btn-ghost"
                    disabled={pagination.current >= totalPages}
                    onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Subcategory Drawer */}
      <div className="drawer drawer-end">
        <input id="subcat-drawer-toggle" type="checkbox" className="drawer-toggle" />
        <div className="drawer-side">
          <label htmlFor="subcat-drawer-toggle" className="drawer-overlay"></label>
          <div className="p-4 w-80 h-full bg-base-100 text-base-content flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {isEditing ? 'Edit Subcategory' : 'Add Subcategory'}
              </h3>
              <label 
                htmlFor="subcat-drawer-toggle" 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={resetForm}
              >
                ✕
              </label>
            </div>
            
            <form className="flex-1 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Subcategory Name</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={data.name}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="e.g. Smartphones"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Parent Category</span>
                </label>
                <select
                  name="categoryId"
                  value={data.categoryId}
                  onChange={handleChange}
                  className="select select-bordered"
                  required
                  disabled={loading.categories}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                {loading.categories && (
                  <span className="loading loading-spinner loading-xs ml-2"></span>
                )}
              </div>
              
              {error && (
                <div className="alert alert-error shadow-lg">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-auto">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading.form}
                >
                  {loading.form ? (
                    <span className="loading loading-spinner"></span>
                  ) : isEditing ? 'Update' : 'Create'}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ID Modal */}
      <dialog open={idModal.open} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">Subcategory ID</h3>
              <p className="py-2 text-sm opacity-70">{idModal.name}</p>
            </div>
            <button onClick={closeIdModal} className="btn btn-sm btn-circle btn-ghost">
              ✕
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <code className="text-sm break-all" ref={textRef}>
              {idModal.id}
            </code>
          </div>
          
          <div className="modal-action">
            <button 
              className="btn btn-primary gap-2"
              onClick={copyText}
            >
              <IoCopyOutline /> Copy ID
            </button>
          </div>
        </div>
      </dialog>
    </ContainerTemplate>
  );
};

export default Subcategories;