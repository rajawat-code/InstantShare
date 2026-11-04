import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastNotification from './components/ToastNotification';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import ItemDetails from './pages/ItemDetails';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import MyListings from './pages/MyListings';
import MyBookings from './pages/MyBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import Profile from './pages/Profile';

// Scroll to top helper on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// 404 Not Found Page
const NotFound = () => (
  <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
    <div className="text-5xl font-extrabold text-[#236B45]">404</div>
    <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
    <p className="text-sm text-slate-500">
      The page you requested does not exist or has been moved.
    </p>
    <div className="pt-2">
      <a
        href="/"
        className="inline-flex items-center px-4 py-2 bg-[#236B45] text-white text-xs font-semibold rounded-xl hover:bg-[#1b5636] transition-colors"
      >
        Return to Home
      </a>
    </div>
  </div>
);

export function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#F8F8F5] text-[#252B27]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/items/:id" element={<ItemDetails />} />
              <Route path="/add-item" element={<AddItem />} />
              <Route path="/edit-item/:id" element={<EditItem />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/dashboard" element={<OwnerDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastNotification />
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
