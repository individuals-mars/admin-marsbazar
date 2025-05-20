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
      <aside className='w-2/12 relative'>
        <Sidebar />
      </aside>
      <section className='flex flex-1 min-h-[200vh]'>
        <div className='bg-base-200 w-full flex flex-col justify-start justify-items-start gap-5 '>
          <Navbar />
          <Outlet />
        </div>
      </section>
    </main>
    </>
   
  )
}

export default App
