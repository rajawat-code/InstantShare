import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, X, ShieldCheck, Loader2 } from 'lucide-react';
import apiService from '../services/apiService';
import { formatCurrency } from '../utils/pricing';

export const DemoPaymentModal = ({ isOpen, booking, onClose, onPaymentSuccess }) => {
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedCard, setSelectedCard] = useState('4242 4242 4242 4242');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen && booking) {
      const initCheckout = async () => {
        try {
          setIsLoading(true);
          setError(null);
          setSuccessData(null);
          const data = await apiService.createCheckoutSession(booking.id);
          setCheckoutData(data);
        } catch (err) {
          setError('Failed to initialize demo checkout session: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      initCheckout();
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const isDeclinedCard = selectedCard.endsWith('0002') || selectedCard.endsWith('0003');
      const payload = {
        rentalId: booking.id,
        orderId: checkoutData?.orderId || `demo_ord_${Date.now()}`,
        cardNumber: selectedCard,
        expiry: '12/28',
        cvv: '123',
        simulateFailure: isDeclinedCard,
      };

      const result = await apiService.confirmDemoPayment(payload);
      setSuccessData(result);
      if (onPaymentSuccess) {
        onPaymentSuccess(booking.id, result);
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-7 overflow-hidden space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#236B45] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Demo Checkout Gateway</h3>
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Zero Cost Simulation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulating Spring Boot payment endpoint: <code className="text-[#236B45]">/api/payments/demo-confirm</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-xs text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#236B45]" />
            <span>Initializing checkout session...</span>
          </div>
        ) : successData ? (
          /* Success Screen */
          <div className="py-4 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Demo Payment Approved!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Rental booking <strong>#{booking.id}</strong> for <strong>{booking.itemName}</strong> is now marked as <strong className="text-emerald-700">CONFIRMED</strong> on the backend.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1 text-slate-600 font-mono">
              <div>Order Ref: {checkoutData?.orderId || successData.orderId}</div>
              <div>Status: {successData.paymentStatus || 'SUCCESS'}</div>
              <div>Amount: {formatCurrency(checkoutData?.totalAmount || booking.totalAmount)}</div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#236B45] text-white text-xs font-semibold rounded-xl hover:bg-[#1b5636]"
              >
                Close & View Bookings
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Breakdown & Test Card Selector */
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Item and Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold">{booking.itemName}</span>
                <span className="text-slate-500 font-mono">ID #{booking.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Rental Subtotal</span>
                <span>{formatCurrency(checkoutData?.rentalAmount || booking.totalAmount)}</span>
              </div>
              {checkoutData?.platformFee > 0 && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>Platform Fee (10%)</span>
                  <span>{formatCurrency(checkoutData.platformFee)}</span>
                </div>
              )}
              {checkoutData?.securityDeposit > 0 && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>Refundable Deposit</span>
                  <span>{formatCurrency(checkoutData.securityDeposit)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                <span>Total Demo Amount</span>
                <span className="text-[#236B45]">
                  {formatCurrency(checkoutData?.totalAmount || booking.totalAmount)}
                </span>
              </div>
            </div>

            {/* Simulated Test Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Choose Simulation Test Card
              </label>
              <div className="space-y-1.5">
                {(checkoutData?.demoTestCards || [
                  { cardNumber: '4242 4242 4242 4242', expiry: '12/28', cvv: '123', expectedResult: 'Instant Success / Approved' },
                  { cardNumber: '4000 0000 0000 0002', expiry: '12/28', cvv: '123', expectedResult: 'Simulated Card Declined' },
                ]).map((card) => (
                  <label
                    key={card.cardNumber}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedCard === card.cardNumber
                        ? 'border-[#236B45] bg-[#EEF3EE]/40'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="testCard"
                        value={card.cardNumber}
                        checked={selectedCard === card.cardNumber}
                        onChange={() => setSelectedCard(card.cardNumber)}
                        className="text-[#236B45] focus:ring-[#236B45]"
                      />
                      <span className="font-mono font-medium text-slate-800">{card.cardNumber}</span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        card.cardNumber.endsWith('4242') ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {card.expectedResult}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 bg-[#236B45] hover:bg-[#1b5636] disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Demo Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Demo Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPaymentModal;
