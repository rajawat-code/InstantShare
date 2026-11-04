import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, RefreshCw, Sparkles, X } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const Footer = () => {
  const { resetAllData } = useUser();
  const [modalContent, setModalContent] = useState(null);

  const openInfoModal = (title, content) => {
    setModalContent({ title, content });
  };

  return (
    <>
      <footer className="bg-white border-t border-[#E1E5E1] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#236B45] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  IS
                </div>
                <span className="font-bold text-lg text-[#252B27] tracking-tight">
                  Instant<span className="text-[#236B45]">Share</span>
                </span>
              </Link>
              <p className="text-xs text-slate-600 leading-relaxed">
                A hyperlocal peer-to-peer rental marketplace empowering communities to borrow, share,
                and access premium equipment sustainably.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={resetAllData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-[#236B45] bg-[#F8F8F5] border border-[#E1E5E1] rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo LocalStorage</span>
                </button>
              </div>
            </div>

            {/* Quick Navigation */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                Explore Marketplace
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link to="/explore" className="hover:text-[#236B45] transition-colors">
                    All Available Items
                  </Link>
                </li>
                <li>
                  <Link
                    to="/explore?category=Electronics"
                    className="hover:text-[#236B45] transition-colors"
                  >
                    Cameras & Electronics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/explore?category=Tools and Equipment"
                    className="hover:text-[#236B45] transition-colors"
                  >
                    Power Tools & Ladders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/explore?category=Travel and Outdoor"
                    className="hover:text-[#236B45] transition-colors"
                  >
                    Camping & Tents
                  </Link>
                </li>
              </ul>
            </div>

            {/* Owner & Renter Workflows */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                Manage Rentals
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link to="/add-item" className="hover:text-[#236B45] transition-colors">
                    List a New Item
                  </Link>
                </li>
                <li>
                  <Link to="/my-listings" className="hover:text-[#236B45] transition-colors">
                    My Listed Items
                  </Link>
                </li>
                <li>
                  <Link to="/my-bookings" className="hover:text-[#236B45] transition-colors">
                    My Rental Requests
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#236B45] transition-colors">
                    Owner Operations Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Trust, Legal & Support */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                Trust & Support
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      openInfoModal(
                        'About InstantShare',
                        'InstantShare is a grassroots community rental platform designed to replace underutilized consumer ownership with effortless sharing. From high-end DSLR cameras to pressure washers, we connect verified local neighbors so you never have to buy expensive equipment for a one-time project.'
                      )
                    }
                    className="hover:text-[#236B45] transition-colors cursor-pointer text-left"
                  >
                    About InstantShare
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      openInfoModal(
                        'Contact & Community Support',
                        'Need assistance with a rental or handover? Email us anytime at support@instantshare.local or reach out to our community coordinators across Agra, Delhi, Mumbai, Bengaluru, and Jaipur.'
                      )
                    }
                    className="hover:text-[#236B45] transition-colors cursor-pointer text-left"
                  >
                    Contact Community Team
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      openInfoModal(
                        'Terms & Rental Agreement',
                        'All peer rentals are subject to safety checks, photo verification on handover, and respectful equipment care. Security deposits are logged for assurance and released upon equipment return verification.'
                      )
                    }
                    className="hover:text-[#236B45] transition-colors cursor-pointer text-left"
                  >
                    Terms and Conditions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      openInfoModal(
                        'Privacy Policy',
                        'InstantShare prioritizes member privacy. Contact details and exact house addresses are only shared between parties once a rental request is formally ACCEPTED by the item owner.'
                      )
                    }
                    className="hover:text-[#236B45] transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © {new Date().getFullYear()} InstantShare. Built with React, Vite & Tailwind CSS.
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#236B45]" />
              <span>Hyperlocal Peer-to-Peer Verified Community</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modal for Terms, Privacy, About, Contact */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">{modalContent.title}</h3>
              <button
                onClick={() => setModalContent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{modalContent.content}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 bg-[#236B45] text-white text-xs font-semibold rounded-xl hover:bg-[#1b5636] transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;

