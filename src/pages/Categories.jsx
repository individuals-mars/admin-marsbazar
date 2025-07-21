import React, { useEffect, useState, useRef } from 'react';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { FiEdit2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoCopyOutline } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';

const Categories = () => {
  const URL = import.meta.env.VITE_BACKEND_URL + '/api/categories';

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ title: '', icon: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const visibleCategories = categories.slice(start, end);
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
    // закрыть drawer
    const cb = document.getElementById('cat-drawer-toggle');
    if (cb) cb.checked = false;
  };

  const handleEdit = (category) => {
    setData({ title: category.title, icon: category.icon });
    setEditId(category._id);
    setIsEditing(true);
    const cb = document.getElementById('cat-drawer-toggle');
    if (cb) cb.checked = true;
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
     
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting category';
      setError(msg);
      toast.error(msg);
      setLoading(false); 
    }
  };

  return (
    <ContainerTemplate>
      <div>
        <div className="grid grid-cols-2">
          <TitleTemplate title="Categories" description="Manage your categories" />

          <div className="drawer drawer-end flex justify-end">
            <input id="cat-drawer-toggle" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <label htmlFor="cat-drawer-toggle" className="drawer-button btn btn-primary">
                {isEditing ? 'Edit Category' : 'Add Category'}
              </label>
            </div>
            <div className="drawer-side">
              <label htmlFor="cat-drawer-toggle" className="drawer-overlay" />
              <div className="flex flex-col gap-8 items-center justify-center menu bg-base-200 text-base-content min-h-full w-80 p-4">
                <h2 className="text-2xl font-medium">
                  {isEditing ? 'Edit Category' : 'Add Category'}
                </h2>
                <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Category Title:</legend>
                    <input
                      name="title"
                      type="text"
                      value={data.title}
                      onChange={handleChange}
                      className="input input-primary"
                      placeholder="Title"
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Category Icon:</legend>
                    <input
                      name="icon"
                      type="text"
                      value={data.icon}
                      onChange={handleChange}
                      className="input input-primary"
                      placeholder="Icon (e.g., fa-icon-name)"
                    />
                  </fieldset>
                  {error && <p className="text-error">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner" />
                      ) : isEditing ? 'Update' : 'Add'}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Icon</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex justify-center items-center p-5">
                        <span className="loading loading-spinner loading-lg" />
                      </div>
                    </td>
                  </tr>
                ) : visibleCategories.length ? (
                  visibleCategories.map((item, idx) => (
                    <tr key={item._id}>
                      <td>
                        <button
                          onClick={() => openIdModal(item._id, item.title)}
                          className="link link-primary"
                        >
                          {start + idx + 1}
                        </button>
                      </td>
                      <td>{item.title}</td>
                      <td>{item.icon}</td>
                      <td className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-primary"
                        >
                          <FiEdit2 className="text-xl" />
                        </button>
                        <button
                          onClick={() => deleteCategory(item._id)}
                          className="btn btn-error px-5"
                          disabled={loading}
                        >
                          <AiOutlineDelete className="text-xl text-white" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-5">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 mb-5 p-4">
            <div className="text-sm text-gray-600">
              Showing {pagination.total === 0 ? 0 : start + 1} to{' '}
              {Math.min(end, pagination.total)} of {pagination.total} Categories
            </div>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={pagination.current === 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, current: p.current - 1 }))
                }
              >
                <FiChevronLeft />
              </button>
              <button className="join-item btn btn-sm">
                Page {pagination.current} / {totalPages}
              </button>
              <button
                className="join-item btn btn-sm"
                disabled={pagination.current >= totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, current: p.current + 1 }))
                }
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {idModal.open && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Category: {idModal.name}</h3>
            <p ref={textRef} className="py-4 text-xl">
              {idModal.id}
            </p>
            <div className="modal-action">
              <button className="btn btn-error px-5" onClick={closeIdModal}>
                <MdClose />
              </button>
              <button className="btn btn-primary px-5" onClick={copyText}>
                <IoCopyOutline />
              </button>
            </div>
          </div>
        </dialog>
      )}
    </ContainerTemplate>
  );
};

export default Categories;
