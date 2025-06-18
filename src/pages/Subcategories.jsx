import React, { useEffect, useState, useRef } from 'react';
import ContainerTemplate from '../components/ContainerTemplate';
import TitleTemplate from '../components/TitleTemplate';
import { FiEdit2 } from 'react-icons/fi';
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
    const [data, setData] = useState({
        name: '',
        categoryId: '',
    });
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const modalRef = useRef(null);
    const textRef = useRef(null);
    const [subcategoryId, setSubcategoryId] = useState(null);
    const [subcategoryName, setSubcategoryName] = useState(null);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!data.name || !data.categoryId) {
            setError('Please fill all fields');
            toast.error('Please fill all fields');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                // Update subcategory
                const response = await axios.put(`${SUBCATEGORY_URL}/${editId}`, data);
                toast.success('Subcategory updated successfully!');
                setSubcategories(subcategories.map(item => 
                    item._id === editId ? { ...item, ...data } : item
                ));
            } else {
                // Create subcategory
                const response = await axios.post(SUBCATEGORY_URL, data);
                toast.success('Subcategory created successfully!');
                setSubcategories([...subcategories, response.data]);
            }
            resetForm();
        } catch (error) {
            setError(error.response?.data?.message || 'Error processing request');
            toast.error(error.response?.data?.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    const getSubcategories = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(SUBCATEGORY_URL);
            setSubcategories(response.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Error fetching subcategories');
            toast.error(e.response?.data?.message || 'Error fetching subcategories');
        } finally {
            setLoading(false);
        }
    };

    const getCategories = async () => {
        try {
            const response = await axios.get(CATEGORY_URL);
            setCategories(response.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Error fetching categories');
            toast.error(e.response?.data?.message || 'Error fetching categories');
        }
    };

    const deleteSubcategory = async (id) => {
        try {
            await axios.delete(`${SUBCATEGORY_URL}/${id}`);
            setSubcategories(subcategories.filter((item) => item._id !== id));
            toast.success('Subcategory deleted successfully!');
        } catch (error) {
            setError(error.response?.data?.message || 'Error deleting subcategory');
            toast.error(error.response?.data?.message || 'Error deleting subcategory');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subcategory) => {
        setData({
            name: subcategory.name,
            categoryId: subcategory.categoryId,
        });
        setEditId(subcategory._id);
        setIsEditing(true);
        document.getElementById('my-drawer-4').checked = true;
    };

    const resetForm = () => {
        setData({ name: '', categoryId: '' });
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
        getSubcategories();
        getCategories();
    }, []);

    return (
        <ContainerTemplate>
            <div>
                <div className='grid grid-cols-2'>
                    <TitleTemplate 
                        title='Subcategories' 
                        description='Manage your subcategories'
                    />
                    <div className='drawer drawer-end flex justify-end'>
                        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">
                                {isEditing ? 'Edit Subcategory' : 'Add Subcategory'}
                            </label>
                        </div>
                        <div className="drawer-side">
                            <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
                            <div className="flex flex-col gap-8 items-center justify-center menu bg-base-200 text-base-content min-h-full w-80 p-4">
                                <h2 className='text-2xl font-medium'>
                                    {isEditing ? 'Edit Subcategory' : 'Add Subcategory'}
                                </h2>
                                <div className='flex w-full flex-col gap-4'>
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Subcategory Name:</legend>
                                        <input 
                                            name='name' 
                                            type="text" 
                                            value={data.name} 
                                            onChange={handleChange} 
                                            className='input input-primary' 
                                            placeholder='Name' 
                                        />
                                    </fieldset>

                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Parent Category:</legend>
                                        <select
                                            name='categoryId'
                                            value={data.categoryId}
                                            onChange={handleChange}
                                            className='select select-primary'
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
                                                <span className="loading loading-spinner loading-lg"></span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : subcategories.length ? (
                                    subcategories.map((item, index) => (
                                        <tr key={item._id}>
                                            <td>
                                                <button 
                                                    onClick={() => { 
                                                        setSubcategoryId(item._id); 
                                                        setSubcategoryName(item.name); 
                                                        modalRef.current?.showModal();
                                                    }}
                                                >
                                                    {index + 1}
                                                </button>
                                                <dialog ref={modalRef} id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                                                    <div className="modal-box">
                                                        <h3 className="font-bold text-lg">Subcategory: {subcategoryName}</h3>
                                                        <p ref={textRef} className="py-4 text-xl">{subcategoryId}</p>
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
                                            <td>{item.name}</td>
                                            <td>
                                                {categories.find(cat => cat._id === item.categoryId)?.title || 'Unknown'}
                                            </td>
                                            <td className='flex justify-end gap-2'>
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className='btn btn-primary'
                                                >
                                                    <FiEdit2 className='text-xl' />
                                                </button>
                                                <button 
                                                    onClick={() => deleteSubcategory(item._id)}
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
                                            No subcategories found
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

export default Subcategories;