import React, { useState } from 'react'
import ContainerTemplate from '../components/ContainerTemplate'
import TitleTemplate from '../components/TitleTemplate'
import { MdPlaylistAddCheck } from "react-icons/md";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import { IoBagCheckOutline } from "react-icons/io5";
import { TbReportMoney } from "react-icons/tb";

const Dashboard = () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([
        {
            icon: <MdPlaylistAddCheck />,
            number: 102,
            title: "Total Orders",
            percentage: 4,
            days: 20
        },
        {
            icon: <MdOutlinePlaylistRemove />,
            number: 23,
            title: 'Total Canceled',
            percentage: 8,
            days: 20
        },
        {
            icon: <IoBagCheckOutline />,
            number: 32,
            title: 'Total Delivered',
            percentage: -4,
            days: 20
        },
        {
            icon: <TbReportMoney />,
            number: 52,
            title: 'Total Revenue',
            percentage: -8,
            days: 20
        }
    ])
    return (
        <ContainerTemplate>
            <div>
                <div className='flex justify-between items-center'>
                    <TitleTemplate title='Dashboard' description='Hi Abdulaziz, welcome back to sedap admin!' />
                    <button className='btn btn-primary text-xl'>
                        Calendar
                    </button>
                </div>

                <div className='grid grid-cols-4 mt-15 gap-3'>
                    {loading ? (
                        <>
                            <div className="skeleton flex-1 min-h-44 border border-primary shadow-xl"></div>
                            <div className="skeleton flex-1 min-h-44 border border-primary shadow-xl"></div>
                            <div className="skeleton flex-1 min-h-44 border border-primary shadow-xl"></div>
                            <div className="skeleton flex-1 min-h-44 border border-primary shadow-xl"></div>
                        </>
                    ) : data.length ? (
                        data.map((item, id) => (
                            <div key={id} className='flex items-center justify-center p-10 shadow-lg border border-primary rounded-xl gap-3 bg-base-100'>
                                <p className='text-3xl'>{item.icon}</p>
                                <div>
                                    <p className='text-2xl'>{item.number}</p>
                                    <p>{item.title}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Data not found</p>
                    )}

                </div>

                <div>
                    <div>
                        
                    </div>
                </div>
            </div>
        </ContainerTemplate>
    )
}

export default Dashboard