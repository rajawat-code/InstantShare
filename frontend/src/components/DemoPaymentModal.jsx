import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Loader2,
  QrCode,
  Building2,
  Smartphone,
  Sparkles,
  Copy,
  Check,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import apiService from '../services/apiService';
import { formatCurrency } from '../utils/pricing';

const TEST_CARDS = [
  {
    cardNumber: '4242 4242 4242 4242',
    name: 'InstantShare Demo Renter',
    expiry: '12/28',
    cvv: '123',
    type: 'Visa',
    status: 'success',
    label: 'Instant Success (Approved)',
    description: 'Transitions rental status from PENDING to CONFIRMED immediately.',
  },
  {
    cardNumber: '4000 0000 0000 0002',
    name: 'Card Decline Tester',
    expiry: '12/28',
    cvv: '123',
    type: 'Visa',
    status: 'decline',
    label: 'Card Declined (Simulated Failure)',
    description: 'Simulates issuer bank decline. Rental stays in PENDING status.',
  },
  {
    cardNumber: '5000 0000 0000 0003',
    name: 'Low Balance Tester',
    expiry: '12/28',
    cvv: '123',
    type: 'Mastercard',
    status: 'declined',
    label: 'Insufficient Funds',
    description: 'Simulates insufficient account balance failure.',
  },
];

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: '0240' },
  { id: 'SBI', name: 'State Bank of India', code: '0002' },
  { id: 'ICICI', name: 'ICICI Bank', code: '0011' },
  { id: 'AXIS', name: 'Axis Bank', code: '0054' },
  { id: 'KOTAK', name: 'Kotak Mahindra', code: '0811' },
  { id: 'PNB', name: 'Punjab National Bank', code: '0123' },
];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'paytm', name: 'Paytm', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'bhim', name: 'BHIM UPI', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export const DemoPaymentModal = ({
  isOpen,
  booking,
  onClose,
  onPaymentSuccess,
  isReceiptOnly = false,
  initialMethod = 'CARD',
  initialCard = '4242 4242 4242 4242',
}) => {
  const [activeTab, setActiveTab] = useState(initialMethod || 'CARD'); // 'CARD' | 'UPI' | 'NETBANKING'
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedCard, setSelectedCard] = useState(initialCard || '4242 4242 4242 4242');
  const [cardName, setCardName] = useState('InstantShare Demo User');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [upiId, setUpiId] = useState('renter@instantshare');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (initialMethod && initialMethod !== 'HANDOVER') {
      setActiveTab(initialMethod);
    }
    if (initialCard) {
      setSelectedCard(initialCard);
    }
  }, [initialMethod, initialCard, isOpen]);

  useEffect(() => {
    if (isOpen && booking) {
      // If booking is already confirmed, load existing payment receipt
      if (booking.status === 'CONFIRMED' || isReceiptOnly) {
        const loadReceipt = async () => {
          try {
            setIsLoading(true);
            setError(null);
            const statusRes = await apiService.getPaymentStatus(booking.id);
            setSuccessData({
              paymentId: statusRes.paymentId || booking.id,
              rentalId: booking.id,
              orderId: statusRes.orderId || booking.orderId || `demo_ord_${booking.id}`,
              paymentIdRef: statusRes.paymentIdRef || booking.paymentIdRef || `demo_pay_${booking.id}`,
              amount: statusRes.amount || booking.totalAmount,
              currency: statusRes.currency || 'INR',
              paymentStatus: statusRes.paymentStatus || 'SUCCESS',
              paymentMode: statusRes.paymentMode || 'DEMO',
              rentalStatus: 'CONFIRMED',
              paidAt: statusRes.paidAt || booking.paidAt || booking.updatedAt || new Date().toISOString(),
              message: 'Demo payment already confirmed.',
            });
          } catch {
            setSuccessData({
              rentalId: booking.id,
              orderId: booking.orderId || `demo_ord_${booking.id}`,
              paymentIdRef: booking.paymentIdRef || `demo_pay_${booking.id}`,
              amount: booking.totalAmount,
              paymentStatus: 'SUCCESS',
              paymentMode: 'DEMO',
              rentalStatus: 'CONFIRMED',
              paidAt: booking.paidAt || new Date().toISOString(),
            });
          } finally {
            setIsLoading(false);
          }
        };
        loadReceipt();
        return;
      }

      // Otherwise initialize demo checkout session with Spring Boot backend
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
  }, [isOpen, booking, isReceiptOnly]);

  if (!isOpen || !booking) return null;

  const totalAmount = checkoutData?.totalAmount || booking.totalAmount;
  const rentalAmount = checkoutData?.rentalAmount || booking.quotedAmount || booking.totalAmount;
  const platformFee = checkoutData?.platformFee ?? booking.platformFee ?? Math.round(rentalAmount * 0.1);
  const securityDeposit = checkoutData?.securityDeposit ?? booking.securityDeposit ?? booking.deposit ?? 0;
  const orderId = checkoutData?.orderId || booking.orderId || `demo_ord_${Date.now()}`;

  const handleSelectPresetCard = (card) => {
    setSelectedCard(card.cardNumber);
    setCardName(card.name);
    setCardExpiry(card.expiry);
    setCardCvv(card.cvv);
    setSimulateFailure(card.status === 'decline' || card.status === 'declined');
    setError(null);
  };

  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      let usedCardNumber = selectedCard;
      if (activeTab === 'UPI') {
        usedCardNumber = simulateFailure ? '4000 0000 0000 0002' : '4242 4242 4242 4242';
      } else if (activeTab === 'NETBANKING') {
        usedCardNumber = simulateFailure ? '4000 0000 0000 0002' : '4242 4242 4242 4242';
      }

      const isDeclinedCard =
        simulateFailure ||
        usedCardNumber.endsWith('0002') ||
        usedCardNumber.endsWith('0003');

      const payload = {
        rentalId: booking.id,
        orderId: orderId,
        cardNumber: usedCardNumber,
        expiry: cardExpiry,
        cvv: cardCvv,
        simulateFailure: isDeclinedCard,
        method: activeTab,
        upiId: activeTab === 'UPI' ? upiId : undefined,
        bank: activeTab === 'NETBANKING' ? selectedBank : undefined,
      };

      const result = await apiService.confirmDemoPayment(payload);
      setSuccessData(result);
      if (onPaymentSuccess) {
        onPaymentSuccess(booking.id, result);
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed. Please try a different test method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Gateway Header Banner */}
        <div className="bg-[#236B45] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <CreditCard className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">InstantShare Gateway</h3>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  Demo Mode
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Simulated zero-cost test sandbox • 100% Free</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#236B45]" />
              <span className="text-xs font-medium">Initializing Demo Payment Gateway session...</span>
            </div>
          ) : successData ? (
            /* =================== SUCCESS / RECEIPT SCREEN =================== */
            <div className="py-2 space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Demo Payment Confirmed!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Rental booking <strong>#{booking.id}</strong> for <strong>{booking.itemName}</strong> is now marked as{' '}
                  <strong className="text-emerald-700 font-bold">CONFIRMED</strong> on Spring Boot backend.
                </p>
              </div>

              {/* Receipt Details Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs space-y-2 text-slate-700 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-sans text-slate-500 font-medium">Order ID:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{successData.orderId || orderId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.orderId || orderId, 'orderId')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {copiedField === 'orderId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-sans text-slate-500">Payment Reference:</span>
                  <span className="text-slate-800">{successData.paymentIdRef || `demo_pay_${Date.now()}`}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-sans text-slate-500">Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    SUCCESS (DEMO)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-sans text-slate-500">Total Paid:</span>
                  <span className="font-sans font-bold text-sm text-[#236B45]">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                  <span className="font-sans">Timestamp:</span>
                  <span>{new Date(successData.paidAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-2.5 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Done & View My Bookings
                </button>
              </div>
            </div>
          ) : (
            /* =================== CHECKOUT & PAYMENT FLOW =================== */
            <div className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Payment Failed</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Order Breakdown Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F8FBF8] to-[#F2F7F2] border border-emerald-100/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{booking.itemName}</h5>
                    <span className="text-[11px] text-slate-500">Rental Booking ID #{booking.id}</span>
                  </div>
                  <span className="font-mono text-[11px] bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-600">
                    Order: {orderId}
                  </span>
                </div>

                <div className="pt-2 border-t border-emerald-100/60 space-y-1 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Quoted Rental Subtotal:</span>
                    <span>{formatCurrency(rentalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Platform Fee (10%):</span>
                    <span>{formatCurrency(platformFee)}</span>
                  </div>
                  {securityDeposit > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Refundable Security Deposit:</span>
                      <span>{formatCurrency(securityDeposit)}</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-emerald-200/80 flex items-center justify-between font-bold text-sm text-slate-900">
                    <span>Total Amount to Authorize:</span>
                    <span className="text-[#236B45] text-base">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Method Switcher Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Demo Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('CARD'); setError(null); }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'CARD'
                        ? 'bg-white text-[#236B45] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card (Demo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('UPI'); setError(null); }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'UPI'
                        ? 'bg-white text-[#236B45] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('NETBANKING'); setError(null); }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'NETBANKING'
                        ? 'bg-white text-[#236B45] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* ================= METHOD 1: CARD ================= */}
              {activeTab === 'CARD' && (
                <div className="space-y-4">
                  {/* Preset 1-Click Cards */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Quick Preset Test Cards
                      </span>
                      <span className="text-[10px] text-[#236B45] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> 1-Click Fill
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {TEST_CARDS.map((card) => {
                        const isSelected = selectedCard === card.cardNumber;
                        return (
                          <div
                            key={card.cardNumber}
                            onClick={() => handleSelectPresetCard(card)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-[#236B45] bg-[#EEF3EE]/50 ring-1 ring-[#236B45]'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name="presetCard"
                                checked={isSelected}
                                onChange={() => handleSelectPresetCard(card)}
                                className="text-[#236B45] focus:ring-[#236B45]"
                              />
                              <div>
                                <div className="font-mono font-bold text-slate-800">{card.cardNumber}</div>
                                <div className="text-[10px] text-slate-500">{card.description}</div>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                card.status === 'success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {card.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Card Form Inputs */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                      Simulated Card Input Fields
                    </span>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={selectedCard}
                        onChange={(e) => setSelectedCard(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#236B45]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#236B45]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">
                          CVV (Demo)
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#236B45]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= METHOD 2: UPI ================= */}
              {activeTab === 'UPI' && (
                <div className="space-y-4">
                  {/* Simulated QR Code Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center relative">
                      <QrCode className="w-20 h-20 text-slate-800" />
                      <span className="text-[9px] font-mono text-[#236B45] font-bold mt-1">
                        DEMO QR
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <Smartphone className="w-4 h-4 text-[#236B45]" />
                        <span>Instant UPI Demo Simulation</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Simulate scanning or paying from popular UPI apps. Click any app or authorize below.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setUpiId(`demo.${app.id}@instant`)}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${app.color}`}
                          >
                            {app.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#236B45]"
                    />
                  </div>
                </div>
              )}

              {/* ================= METHOD 3: NET BANKING ================= */}
              {activeTab === 'NETBANKING' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                    Select Test Bank for Simulated Authorization
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_BANKS.map((bank) => {
                      const isSelected = selectedBank === bank.id;
                      return (
                        <div
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#236B45] bg-[#EEF3EE]/50 ring-1 ring-[#236B45]'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className={`w-4 h-4 ${isSelected ? 'text-[#236B45]' : 'text-slate-400'}`} />
                            <span className="font-semibold text-slate-800">{bank.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">DEMO</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Failure Simulation Checkbox for QA Testing */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Simulate Payment Failure (Test decline branch)</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  Route: /api/payments/demo-confirm
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!successData && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isProcessing || isLoading}
              onClick={handleConfirmPayment}
              className="px-6 py-2.5 bg-[#236B45] hover:bg-[#1b5636] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Demo Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay {formatCurrency(totalAmount)} (Demo Mode)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPaymentModal;