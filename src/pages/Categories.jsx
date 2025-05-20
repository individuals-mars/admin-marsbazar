import React, { useEffect, useState, useRef } from 'react'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import axios from 'axios'
import { IoCopyOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";


const Categories = () => {

    
   
 
    const URL = import.meta.env.VITE_BACKEND_URL + '/api/categories'
    const deleteURL = import.meta.env.VITE_BACKEND_URL + '/api/categories/'
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        id: '',
        name: '',
        status: '',
        description: '.',
    })
    const [category, setCategory] = useState([])
    const modalRef = useRef(null)
    const textRef = useRef(null)
    const [categoryID, setCategoryId] = useState(null)
    const [categoryName, setCategoryName] = useState(null)
   
    

    const handleCHange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value })
    };

    const handleSubmit = async (e) => {
        console.log('data', data)
        if (!data.name || !data.status) {
            console.log("Please fill all fields")
            setError('Please fill all fields')
            return
        }
        setLoading(true),
            setError(null)


        try {
            console.log("REQUEST")
            const response = await axios.post(URL, data);
            console.log('Category created', response);
            getCategories()
        } catch (error) {
            setError("Hato")
        } finally {
            setData({ name: '', status: '', description: '.', id: '' });
            setLoading(false)
        }
    }
    const getCategories = async () => {
        setLoading(true);
        setError(null);
        console.log("GET CATEGORIES");

        try {
            const response = await axios.get(URL);
            console.log("Categories: ", response.data);
            console.log("ASD"); // This will now work if no error is thrown above
            setCategory(response.data);
        } catch (e) {
            console.error("Error fetching categories:", e);
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("USE EFFECT IWLADI");
        getCategories();
    }, []);

    const deleteCategory = async (id) => {
        try {
            const response = await axios.delete(deleteURL + id)
            setCategory(category.filter((item) => item._id !== id))
            console.log('Category deleted', response);
            setLoading(true)

        } catch (error) {
            console.error('Error deleting category:', error);
            setError(error)
            getCategories()
        } finally {
            setLoading(false)
        }
    }


   
    const copyText = () => {
        const text = textRef.current?.innerText;
        if (text) {
            navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Matin nusxalandi!');
            })
            .catch(error => {
                console.error('Nusxalashda xatolik:', error);
            })
        }
    }



    return (
        <ContainerTemplate>
            <div>
                <div className='grid grid-cols-2'>
                    <TitleTemplate title='Categories' description='Here is your all categories' />
                    <div className='drawer drawer-end flex justify-end'>
                        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            {/* Page content here */}
                            <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">Add category</label>
                        </div>
                        <div className="drawer-side">
                            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                            <div className="flex flex-col gap-8 items-center justify-center menu bg-base-200 text-base-content min-h-full w-80 p-4">
                                <h2 className='text-2xl font-medium'>Add category</h2>
                                <div className='flex w-full flex-col gap-4'>
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Category name:</legend>
                                        <input name='name' type="text" value={data.name} onChange={handleCHange} className='input input-primary' placeholder='Name' />
                                        <p className="label">Optional</p>
                                    </fieldset>

                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend">Category description:</legend>
                                        <input name='description' type="text" value={data.description} onChange={handleCHange} className='input input-primary' placeholder='description' />
                                        <p className="label">Optional</p>
                                    </fieldset>

                                    <p>Status</p>
                                    <select name='status' onChange={handleCHange} value={data.status} className="select select-primary">
                                        <option>Select status</option>
                                        <option value='active'>Active</option>
                                        <option value='inactive'>In Active</option>
                                    </select>
                                    <button onClick={handleSubmit} className='btn btn-primary'>Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-7'>
                    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                        <table className="table">
                            {/* head */}
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th rowSpan={0} className='w-[50%]'>Description</th>
                                    <th>Status</th>
                                    <th className='text-end'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    category.map((item, index, id) => (
                                        <tr key={index}>
                                            <button className='p-5' onClick={() => {setCategoryId(item._id), setCategoryName(item.name), modalRef.current?.showModal()}}>{index + 1}</button>
                                            <dialog ref={modalRef} id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                                                <div className="modal-box"> 
                                                    <h3 className="font-bold text-lg">Here is {categoryName} id !</h3>
                                                    <p ref={textRef} className="py-4 text-xl ">{categoryID}</p>
                                                    <div className="modal-action">
                                                        <form method="dialog" className='flex gap-2'>
                                                            <button className="btn btn-error px-5"><MdClose /></button>
                                                            <button onClick={copyText} className='btn btn-primary px-5'><IoCopyOutline /></button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </dialog>
                                            <td>{item?.name}</td>
                                            <td className='w-[50%]'>{item?.description}</td>
                                            <td>{item?.status}</td>
                                            <td key={id} className='flex justify-end gap-2'>
                                                <button type='button' className='btn btn-primary'><FiEdit2 className='text-xl' /></button>

                                                <button type='button' onClick={() => deleteCategory(item._id)} className='btn btn-error px-5'><AiOutlineDelete className='text-xl text-white' /></button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ContainerTemplate>
    )
}

export default Categories