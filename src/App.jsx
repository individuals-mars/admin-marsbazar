import { useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function App() {
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    const html = document.querySelector('html');
    html.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <main className="flex min-h-screen">
      <aside className="relative">
        <Sidebar />
      </aside>
      <section className="flex flex-1 min-h-screen ml-64"> {/* ml-64 соответствует w-64 Sidebar */}
        <div className="bg-base-200 w-full flex flex-col gap-5">
          <Navbar />
          <Outlet />
        </div>
      </section>
    </main>
  );
}

export default App;