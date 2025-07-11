import React, { useEffect, useState, useRef } from 'react';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { FiEdit2 } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoCopyOutline } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';

const Categories = () => {
    const URL = import.meta.env.VITE_BACKEND_URL + '/api/categories';
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        title: '',
        icon: '',
    });
    const [categories, setCategories] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const modalRef = useRef(null);
    const textRef = useRef(null);
    const [categoryID, setCategoryId] = useState(null);
    const [categoryName, setCategoryName] = useState(null);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.title || !data.icon) {
            setError('Please fill all fields');
            toast.error('Please fill all fields');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                // Update category
                const response = await axios.put(`${URL}/${editId}`, data);
                toast.success('Category updated successfully!');
                setCategories(categories.map(item => 
                    item._id === editId ? { ...item, ...data } : item
                ));
            } else {
                // Create category
                const response = await axios.post(URL, data);
                toast.success('Category created successfully!');
                setCategories([...categories, response.data]);
            }
            resetForm();
        } catch (error) {
            setError(error.response?.data?.message || 'Error processing request');
            toast.error(error.response?.data?.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    const getCategories = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(URL);
            setCategories(response.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Error fetching categories');
            toast.error(e.response?.data?.message || 'Error fetching categories');
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`${URL}/${id}`);
            setCategories(categories.filter((item) => item._id !== id));
            toast.success('Category deleted successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'Error deleting category');
            toast.error(error.response?.data?.message || 'Error deleting category');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setData({
            title: category.title,
            icon: category.icon,
        });
        setEditId(category._id);
        setIsEditing(true);
        document.getElementById('my-drawer-4').checked = true;
    };

    const resetForm = () => {
        setData({ title: '', icon: '' });
        setIsEditing(false);
        setEditId(null);
        document.getElementById('my-drawer-4').checked = false;
    };

    const copyText = () => {
        const text = textRef.current?.innerText;
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => toast.success('ID copied to clipboard!'))
                .catch(error => toast.error('Error copying ID'));
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    return (
        <ContainerTemplate>
            <div>
                <div className='grid grid-cols-2'>
                    <TitleTemplate 
                        title='Categories' 
                        description='Manage your categories'
                    />
                    <div className='drawer drawer-end flex justify-end'>
                        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">
                                {isEditing ? 'Edit Category' : 'Add Category'}
                            </label>
                        </div>
                        <div className="drawer-side">
                            <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
                            <div className="flex flex-col gap-8 items-center justify-center menu bg-base-200 text-base-content min-h-full w-80 p-4">
                                <h2 className='text-2xl font-medium'>
                                    {isEditing ? 'Edit Category' : 'Add Category'}
                                </h2>
                                <div className='flex w-full flex-col gap-4'>
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Category Title:</legend>
                                        <input 
                                            name='title' 
                                            type="text" 
                                            value={data.title} 
                                            onChange={handleChange} 
                                            className='input input-primary' 
                                            placeholder='Title' 
                                        />
                                    </fieldset>

                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Category Icon:</legend>
                                        <input 
                                            name='icon' 
                                            type="text" 
                                            value={data.icon} 
                                            onChange={handleChange} 
                                            className='input input-primary' 
                                            placeholder='Icon (e.g., fa-icon-name)' 
                                        />
                                    </fieldset>

                                    {error && <p className="text-error">{error}</p>}
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleSubmit} 
                                            className='btn btn-primary'
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="loading loading-spinner"></span>
                                            ) : (
                                                isEditing ? 'Update' : 'Add'
                                            )}
                                        </button>
                                        {isEditing && (
                                            <button 
                                                onClick={resetForm}
                                                className='btn btn-secondary'
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-7'>
                    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
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
                                                <span className="loading loading-spinner loading-lg"></span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : categories.length ? (
                                    categories.map((item, index) => (
                                        <tr key={item._id}>
                                            <td>
                                                <button 
                                                    onClick={() => { 
                                                        setCategoryId(item._id); 
                                                        setCategoryName(item.title); 
                                                        modalRef.current?.showModal();
                                                    }}
                                                >
                                                    {index + 1}
                                                </button>
                                                <dialog ref={modalRef} id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                                                    <div className="modal-box">
                                                        <h3 className="font-bold text-lg">Category: {categoryName}</h3>
                                                        <p ref={textRef} className="py-4 text-xl">{categoryID}</p>
                                                        <div className="modal-action">
                                                            <form method="dialog" className='flex gap-2'>
                                                                <button className="btn btn-error px-5">
                                                                    <MdClose />
                                                                </button>
                                                                <button onClick={copyText} className='btn btn-primary px-5'>
                                                                    <IoCopyOutline />
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </dialog>
                                            </td>
                                            <td>{item.title}</td>
                                            <td>{item.icon}</td>
                                            <td className='flex justify-end gap-2'>
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className='btn btn-primary'
                                                >
                                                    <FiEdit2 className='text-xl' />
                                                </button>
                                                <button 
                                                    onClick={() => deleteCategory(item._id)}
                                                    className='btn btn-error px-5'
                                                    disabled={loading}
                                                >
                                                    <AiOutlineDelete className='text-xl text-white' />
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
                </div>
            </div>
        </ContainerTemplate>
    );
};

export default Categories;