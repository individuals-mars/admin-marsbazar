import React, { useEffect, useState, useRef } from 'react';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { FiEdit2, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoCopyOutline } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-toastify';

const Categories = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/categories';
  const SUB_URL = import.meta.env.VITE_BACKEND_URL + '/api/subcategories';

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ title: '', icon: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [idModal, setIdModal] = useState({ open: false, id: null, name: '' });

  const textRef = useRef(null);
  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleCategories = categories.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

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

  const getCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: resData } = await axios.get(URL, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
        },
      });

      const fetched = resData.categories ?? resData.data ?? resData ?? [];
      const total = resData.total ?? fetched.length;

      setCategories(fetched);
      setPagination((p) => ({ ...p, total }));
    } catch (e) {
      const msg = e.response?.data?.message || 'Error fetching categories';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axios.get(`${SUB_URL}?category=${categoryId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  };

  const toggleCategory = async (categoryId) => {
    if (expandedCategories[categoryId]) {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          visible: !prev[categoryId].visible
        }
      }));
    } else {
      const subs = await fetchSubCategories(categoryId);
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: { subs, visible: true }
      }));
    }
  };

  useEffect(() => {
    getCategories();
  }, [pagination.current, pagination.pageSize]);

  const handleChange = (e) => {
    setData((d) => ({ ...d, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setData({ title: '', icon: '' });
    setIsEditing(false);
    setEditId(null);
    const drawer = document.getElementById('cat-drawer-toggle');
    if (drawer) drawer.checked = false;
  };

  const handleEdit = (category) => {
    setData({ title: category.title, icon: category.icon });
    setEditId(category._id);
    setIsEditing(true);
    const drawer = document.getElementById('cat-drawer-toggle');
    if (drawer) drawer.checked = true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title || !data.icon) {
      const msg = 'Please fill all fields';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await axios.put(`${URL}/${editId}`, data);
        toast.success('Category updated successfully!');
      } else {
        await axios.post(URL, data);
        toast.success('Category created successfully!');
      }
      resetForm();
      getCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error processing request';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${URL}/${id}`);
      toast.success('Category deleted successfully!');
      setPagination((p) => {
        const newTotal = p.total - 1;
        const newLastPage = Math.max(1, Math.ceil(newTotal / p.pageSize));
        const newCurrent = Math.min(p.current, newLastPage);
        return { ...p, total: newTotal, current: newCurrent };
      });
      getCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting category';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerTemplate>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TitleTemplate
            title="Categories"
            description="Manage your product categories"
          />
          <label
            htmlFor="cat-drawer-toggle"
            className="btn btn-primary gap-2"
            onClick={() => {
              setIsEditing(false);
              resetForm();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Category
          </label>
        </div>

        {/* Categories Table */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-base-200">
                  <tr>
                    <th className="w-12">#</th>
                    <th>Category</th>
                    <th>Icon</th>
                    <th className="w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && visibleCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="flex justify-center items-center p-8">
                          <span className="loading loading-spinner loading-lg text-primary" />
                        </div>
                      </td>
                    </tr>
                  ) : visibleCategories.length ? (
                    visibleCategories.map((item, idx) => (
                      <React.Fragment key={item._id}>
                        <tr 
                          className="hover:bg-base-200/50 transition-colors cursor-pointer"
                          onClick={() => toggleCategory(item._id)}
                        >
                          <td>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openIdModal(item._id, item.title);
                              }}
                              className="text-primary hover:text-primary/70"
                            >
                              {start + idx + 1}
                            </button>
                          </td>
                          <td>
                            <div className="font-medium flex items-center gap-2">
                              {item.title}
                              {expandedCategories[item._id]?.subs?.length > 0 && (
                                expandedCategories[item._id].visible ? (
                                  <FiChevronUp className="text-gray-400 text-sm" />
                                ) : (
                                  <FiChevronDown className="text-gray-400 text-sm" />
                                )
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="badge badge-outline gap-1">
                              <span className="text-xs opacity-70">{item.icon}</span>
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
                                deleteCategory(item._id);
                              }}
                              className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                              title="Delete"
                              disabled={loading}
                            >
                              <AiOutlineDelete className="text-lg" />
                            </button>
                          </td>
                        </tr>
                        
                        {expandedCategories[item._id]?.visible && (
                          <tr className="bg-base-100">
                            <td colSpan={4} className="p-0">
                              <div className="px-4 py-3 bg-base-100 border-t border-base-300">
                                <h4 className="text-sm font-semibold mb-2 text-gray-600">Subcategories:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {expandedCategories[item._id].subs.length > 0 ? (
                                    expandedCategories[item._id].subs.map(subCat => (
                                      <span 
                                        key={subCat._id} 
                                        className="badge badge-outline badge-sm"
                                      >
                                        {subCat.title}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-500">No subcategories</span>
                                  )}
                                </div>
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
                          <p className="mt-2 font-medium">No categories found</p>
                          <button
                            className="btn btn-sm btn-ghost mt-2"
                            onClick={getCategories}
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

            {!loading && categories.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{start + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(end, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> categories
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
                        {i > 0 && arr[i - 1] !== page - 1 && (
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

      {/* Add/Edit Category Drawer */}
      <div className="drawer drawer-end">
        <input id="cat-drawer-toggle" type="checkbox" className="drawer-toggle" />
        <div className="drawer-side">
          <label htmlFor="cat-drawer-toggle" className="drawer-overlay"></label>
          <div className="p-4 w-80 h-full bg-base-100 text-base-content flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {isEditing ? 'Edit Category' : 'Add Category'}
              </h3>
              <label
                htmlFor="cat-drawer-toggle"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={resetForm}
              >
                ✕
              </label>
            </div>

            <form className="flex-1 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category Title</span>
                </label>
                <input
                  name="title"
                  type="text"
                  value={data.title}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Icon Class</span>
                </label>
                <input
                  name="icon"
                  type="text"
                  value={data.icon}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="e.g. fa-mobile-screen"
                  required
                />
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
                  disabled={loading}
                >
                  {loading ? (
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
              <h3 className="font-bold text-lg">Category ID</h3>
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

export default Categories;