import React, { useState } from 'react'
import { GoBell } from 'react-icons/go'
import axios from 'axios'
import { toast } from 'react-toastify'
const Notifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const handleClick = async () => {
        try {
            const respoonse = await axios.get('http://localhost:3000/notifications')
            setLoading(true)
            console.log(respoonse.data)
            setNotifications(respoonse.data)
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {

    }

    return (
        <div className="dropdown" onClick={handleClick}>
            <div tabIndex={0} role="button" className='btn btn-primary text-xl'><GoBell /></div>
            <ul tabIndex={0} className="dropdown-content mt-3 bg-base-100 rounded-box z-1 w-52 h-[50vh] overflow-y-auto p-2 shadow-sm">
                {loading ? <span className="loading loading-spinner loading-md"></span> : (
                    notifications.map((notification) => {
                        return (
                            <li className='p-2 shadow-sm' key={notification.id}>
                                <a>{notification.message}</a>
                            </li>
                        )
                    }))
                }
            </ul>
        </div>
    )
}

export default Notifications