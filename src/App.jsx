import { use, useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

function App() {
  const theme = useSelector(state => state.theme.theme)

  useEffect(() => {
    let html = document.querySelector('html')
    html.setAttribute('data-theme', theme)
  }, [theme])

  return (

    <>
      <main className='flex'>
        <aside className='w-2/12 relative overflow-y-auto'>
          <Sidebar />
        </aside>
        <section className='flex flex-col  flex-1 bg-base-200'>
          <div className='bg-base-200 w-full flex flex-col flex-1 justify-start justify-items-start gap-5 '>
            <Navbar />
          </div>
          <div className='bg-base-200  w-full flex flex-col flex-1 justify-start justify-items-start gap-5'>
            <Outlet />
          </div>
        </section>
      </main>
    </>

  )
}

export default App
