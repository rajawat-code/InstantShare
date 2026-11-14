import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { LocationProvider } from './context/LocationContext';
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
import AuthPage from './pages/AuthPage';
import HeroDemo from './pages/HeroDemo';
import DemoOne from './pages/DemoOne';

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

// App Layout that gracefully accommodates standalone full-screen hero and shader demos
const AppLayout = () => {
  const { pathname } = useLocation();
  const isHeroDemo = pathname === '/hero-demo';
  const isShaderDemo = pathname === '/demo-one' || pathname === '/shader-demo';

  if (isHeroDemo) {
    return (
      <div className="relative min-h-screen bg-[#05070B]">
        <a
          href="/"
          className="fixed top-5 left-5 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-black/60 hover:bg-black/80 text-white backdrop-blur-xl border border-white/20 transition-all shadow-xl hover:scale-105"
        >
          <span>← Back to InstantShare</span>
        </a>
        <HeroDemo />
      </div>
    );
  }

  if (isShaderDemo) {
    return <DemoOne />;
  }

  return (
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
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/register" element={<AuthPage initialMode="register" />} />
          <Route path="/auth" element={<AuthPage initialMode="login" />} />
          <Route path="/hero-demo" element={<HeroDemo />} />
          <Route path="/demo-one" element={<DemoOne />} />
          <Route path="/shader-demo" element={<DemoOne />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastNotification />
    </div>
  );
};

export function App() {
  return (
    <UserProvider>
      <LocationProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppLayout />
        </BrowserRouter>
      </LocationProvider>
    </UserProvider>
  );
}

export default App;
