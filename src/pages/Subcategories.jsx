import React, { useEffect, useState, useRef } from 'react';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { FiEdit2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoCopyOutline } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';

const Subcategories = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const SUBCATEGORY_URL = `${BASE_URL}/api/subcategories`;
  const CATEGORY_URL = `${BASE_URL}/api/categories`;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ name: '', categoryId: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  /* ---------------------------- LOAD CATEGORIES ---------------------------- */
  const getCategories = async () => {
    try {
      const { data } = await axios.get(CATEGORY_URL);
      setCategories(data.categories ?? data.data ?? data ?? []);
    } catch (e) {
      const msg = e.response?.data?.message || 'Error fetching categories';
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    getCategories(); // categories редко меняются — грузим один раз
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
    const cb = document.getElementById('subcat-drawer-toggle');
    if (cb) cb.checked = false;
  };

  const handleEdit = (subcategory) => {
    setData({
      name: subcategory.name,
      categoryId: subcategory.category?._id || '',
    });
    setEditId(subcategory._id);
    setIsEditing(true);
    const cb = document.getElementById('subcat-drawer-toggle');
    if (cb) cb.checked = true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name || !data.categoryId) {
      const msg = 'Please fill all fields';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: data.name,
        category: data.categoryId, // <-- category вместо categoryId
      };
      if (isEditing) {
        await axios.put(`${SUBCATEGORY_URL}/${editId}`, payload);
      } else {
        await axios.post(SUBCATEGORY_URL, payload);
      }

      resetForm();
      getSubcategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error processing request';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------- DELETE -------------------------------- */
  const deleteSubcategory = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${SUBCATEGORY_URL}/${id}`);
      toast.success('Subcategory deleted successfully!');
      setPagination((p) => {
        const newTotal = p.total - 1;
        const newLastPage = Math.max(1, Math.ceil(newTotal / p.pageSize));
        const newCurrent = Math.min(p.current, newLastPage);
        return { ...p, total: newTotal, current: newCurrent };
      });
      // useEffect перезагрузит список
    } catch (error) {
      const msg = error.response?.data?.message || 'Error deleting subcategory';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <ContainerTemplate>
      <div>
        <div className="grid grid-cols-2">
          <TitleTemplate title="Subcategories" description="Manage your subcategories" />

          <div className="drawer drawer-end flex justify-end">
            <input id="subcat-drawer-toggle" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              <label htmlFor="subcat-drawer-toggle" className="drawer-button btn btn-primary">
                {isEditing ? 'Edit Subcategory' : 'Add Subcategory'}
              </label>
            </div>
            <div className="drawer-side">
              <label htmlFor="subcat-drawer-toggle" className="drawer-overlay" />
              <div className="flex flex-col gap-8 items-center justify-center menu bg-base-200 text-base-content min-h-full w-80 p-4">
                <h2 className="text-2xl font-medium">
                  {isEditing ? 'Edit Subcategory' : 'Add Subcategory'}
                </h2>
                <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Subcategory Name:</legend>
                    <input
                      name="name"
                      type="text"
                      value={data.name}
                      onChange={handleChange}
                      className="input input-primary"
                      placeholder="Name"
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Parent Category:</legend>
                    <select
                      name="categoryId"
                      value={data.categoryId}
                      onChange={handleChange}
                      className="select select-primary"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
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
                  <th>Name</th>
                  <th>Parent Category</th>
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
                ) : visibleSubs.length ? (
                  visibleSubs.map((item, idx) => (
                    <tr key={item._id}>
                      <td>
                        <button
                          onClick={() => openIdModal(item._id, item.name)}
                          className="link link-primary"
                        >
                          {start + idx + 1}
                        </button>
                      </td>
                      <td>{item.name}</td>
                      <td>
                        {categories.find((cat) => cat._id === (item.category?._id || item.category))?.title || 'Unknown'}
                      </td>
                      <td className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-primary"
                        >
                          <FiEdit2 className="text-xl" />
                        </button>
                        <button
                          onClick={() => deleteSubcategory(item._id)}
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
                      No subcategories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 mb-5 p-4">
              <div className="text-sm text-gray-600">
                Showing {pagination.total === 0 ? 0 : start + 1} to{' '}
                {Math.min(end, pagination.total)} of {pagination.total} Subcategories
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
      </div>

      {idModal.open && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Subcategory: {idModal.name}</h3>
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

export default Subcategories;
