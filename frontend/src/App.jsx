import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastNotification from './components/ToastNotification';
import CustomCursor from './components/ui/CustomCursor';

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

// 404 Not Found Page (handcrafted studio style)
const NotFound = () => (
  <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
    <div className="inline-block p-4 bg-[#F2B705] border-2 border-[#14281D] shadow-hard rounded-2xl transform -rotate-2">
      <span className="font-serif text-5xl font-black text-[#14281D]">404</span>
    </div>
    <h1 className="font-serif text-3xl font-black text-[#14281D]">
      Lost in the Neighborhood?
    </h1>
    <p className="text-sm text-[#14281D]/70 font-sans max-w-md mx-auto">
      Looks like this tool was already returned to the shed, or the porch you are looking for doesn't exist.
    </p>
    <div className="pt-2">
      <a
        href="/"
        className="inline-flex items-center px-6 py-3 bg-[#14281D] text-[#F6F1E9] text-sm font-bold rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile hover:bg-[#E8590C]"
      >
        ← Back to Neighborhood Hub
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
    <div className="min-h-screen flex flex-col bg-[#F6F1E9] text-[#14281D] font-sans selection:bg-[#F2B705] selection:text-[#14281D]">
      <CustomCursor />
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
