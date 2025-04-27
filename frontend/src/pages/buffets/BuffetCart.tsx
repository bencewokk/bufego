import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem } from "../../types";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from "./StripePaymentForm";
import OrderConfirmation from "../../components/buffets/OrderConfirmation";
import CartItem from "../../components/buffets/CartItem";
import CartStepIndicator from "../../components/buffets/CartStepIndicator";
import PickupTimeSelector from "../../components/buffets/PickupTimeSelector";
import EmptyCart from "../../components/buffets/EmptyCart";
import { motion } from "framer-motion";
import { generatePickupCode } from "./utils";
import { jwtDecode } from "jwt-decode";

interface BuffetCartProps {
  cart: InventoryItem[];
  removeFromCart: (item: InventoryItem) => void;
  orderSuccess: string | null;
  orderError: string | null;
  buffetName: string;
  buffetId: string;
  onClearCart: () => void;
}

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51H59owJmQoVhz82aWAoi9M5s8PC6sSAqFI7KfAD2NRKun5riDIOM0dvu2caM25a5f5JbYLMc5Umxw8Dl7dBIDNwM00yVbSX8uS";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Update step logic
function getCurrentStep(cart: InventoryItem[], cartAccepted: boolean, emailAccepted: boolean, editingEmail: boolean, isPickupValid: boolean, paymentSuccess: boolean) {
  if (!cart.length) return 0;
  if (!cartAccepted) return 1;
  if (!emailAccepted || editingEmail) return 2;
  if (!isPickupValid) return 3;
  if (!paymentSuccess) return 4;
  return 5;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

const BuffetCart: React.FC<BuffetCartProps> = ({ 
  cart, 
  removeFromCart, 
  orderSuccess, 
  orderError, 
  buffetName, 
  buffetId, 
  onClearCart 
}) => {
  const [pickupHour, setPickupHour] = useState<string>("");
  const [pickupMinute, setPickupMinute] = useState<string>("");
  const [pickupAccepted, setPickupAccepted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [pickupCode, setPickupCode] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [emailAccepted, setEmailAccepted] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [cartAccepted, setCartAccepted] = useState(false);
  const [registeredEmails, setRegisteredEmails] = useState<string[]>([]);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const today = new Date().toISOString().slice(0, 10);
  const isPickupValid = pickupHour !== "" && pickupMinute !== "";
  const isEmailValid = email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  // Determine if user is logged in and get their email from JWT
  const token = localStorage.getItem("accessToken");
  let loggedInEmail: string | null = null;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      // @ts-ignore
      loggedInEmail = decoded.email || decoded.username || null;
    }
  } catch {}

  useEffect(() => {
    const now = new Date();
    let pickup = new Date(now.getTime() + 15 * 60000);
    const minPickup = new Date(now.getTime() + 10 * 60000);
    if (pickup < minPickup) pickup = minPickup;
    setPickupHour(pickup.getHours().toString().padStart(2, "0"));
    setPickupMinute(pickup.getMinutes().toString().padStart(2, "0"));
  }, [cart.length]);

  useEffect(() => {
    setPaymentStatus('idle');
    setPickupAccepted(false);
    setPaymentError(null);
    setPickupCode(null);
    setIsProcessingPayment(false);
    setEmailAccepted(false);
    setEditingEmail(false);
    // Try to prefill email from JWT if available
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        // @ts-ignore
        const userEmail = decoded.email || decoded.username;
        if (userEmail) setEmail(userEmail);
        else setEmail("");
      } else {
        setEmail("");
      }
    } catch {
      setEmail("");
    }
    setCartAccepted(false);
  }, [cart]);

  useEffect(() => {
    // Fetch all registered user and buffet emails for client-side validation
    const fetchEmails = async () => {
      try {
        const [usersRes, buffetsRes] = await Promise.all([
          fetch("http://localhost:3000/api/auth/all-emails"),
          fetch("http://localhost:3000/api/buffets/get")
        ]);
        const users = await usersRes.json();
        const buffets = await buffetsRes.json();
        const userEmails = Array.isArray(users) ? users.map((u: any) => u.email?.toLowerCase()).filter(Boolean) : [];
        const buffetEmails = Array.isArray(buffets) ? buffets.map((b: any) => b.email?.toLowerCase()).filter(Boolean) : [];
        setRegisteredEmails([...userEmails, ...buffetEmails]);
      } catch (err) {
        // Ignore error, just don't block
      }
    };
    fetchEmails();
  }, []);

  // Automatically check email validity and registration status
  useEffect(() => {
    setEmailCheckError(null);
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;
    if (!isLoggedIn && email && registeredEmails.includes(email.toLowerCase())) {
      setEmailCheckError("Ez az email regisztrált felhasználóhoz vagy büféhez tartozik. Kérjük, jelentkezz be a rendeléshez.");
      setEmailAccepted(false);
    }
  }, [email, registeredEmails]);

  // When user is logged in, always use their email for the order and auto-accept
  useEffect(() => {
    if (loggedInEmail) {
      setEmail(loggedInEmail);
      setEmailAccepted(true);
      setEditingEmail(false);
    }
  }, [loggedInEmail]);

  // Skip email step if logged in and email is accepted
  useEffect(() => {
    if (loggedInEmail && cartAccepted && !emailAccepted) {
      setEmailAccepted(true);
      setEditingEmail(false);
    }
  }, [loggedInEmail, cartAccepted, emailAccepted]);

  const handlePaymentSuccess = async () => {
    if (!email || !isEmailValid) {
      setEmailAccepted(false);
      setEditingEmail(true);
      setPaymentError('Kérjük, adj meg egy érvényes email címet a rendeléshez!');
      setPaymentStatus('error');
      return;
    }

    // If user is logged in, ensure the email matches the one in the JWT
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        // @ts-ignore
        const userEmail = decoded.email;
        if (userEmail && userEmail !== email) {
          setPaymentError('Bejelentkezett felhasználóként csak a saját email címeddel rendelhetsz.');
          setPaymentStatus('error');
          return;
        }
      }
    } catch {}

    console.log("Payment successful!");
    // Generate pickup code
    const generatedCode = generatePickupCode();
    
    try {
      // Format pickup time
      const pickupDateTime = `${today}T${pickupHour.padStart(2, "0")}:${pickupMinute.padStart(2, "0")}:00`;
      // Create order in the backend - format items as strings to match the schema
      const authToken = localStorage.getItem("accessToken");
      console.log("[ORDER SUBMIT] Sending token:", authToken);
      const orderResponse = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          items: cart.map(item => `${item.name} (${item.price} Ft)`),
          pickupCode: generatedCode,
          pickupTime: pickupDateTime,
          buffetId: buffetId, // Ensure buffetId is sent
          status: "pending",
          email: email
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        let userMessage = errorData.message || orderResponse.statusText;
        // Custom user-friendly error for forbidden order
        if (orderResponse.status === 403) {
          if (email && registeredEmails.includes(email.toLowerCase())) {
            userMessage =
              "Ez az email regisztrált felhasználóhoz vagy büféhez tartozik. Kérjük, jelentkezz be a rendeléshez, és használd a saját email címed!";
          } else {
            userMessage =
              "Nincs jogosultságod a rendelés leadásához. Kérjük, jelentkezz be, vagy használj másik email címet.";
          }
        }
        setPaymentError(userMessage);
        setPaymentStatus('error');
        setIsProcessingPayment(false);
        return;
      }

      // Update UI state
      setPickupCode(generatedCode);
      setPaymentStatus('success');
      setIsProcessingPayment(false);
    } catch (error) {
      console.error("Error creating order:", error);
      setPaymentError('Hiba történt a rendelés létrehozásakor. Kérjük, próbáld újra!');
      setPaymentStatus('error');
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (errorMsg: string) => {
    console.error("Payment failed:", errorMsg);
    setPaymentError(errorMsg);
    setPaymentStatus('error');
    setIsProcessingPayment(false);
  };

  const handleCloseConfirmation = () => {
    setPaymentStatus('idle');
    setPickupCode(null);
    setPaymentError(null);
    setIsProcessingPayment(false);
    onClearCart();
  };

  const handleAcceptEmail = () => {
    setEmailCheckError(null);
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;
    if (!isLoggedIn && registeredEmails.includes(email.toLowerCase())) {
      setEmailCheckError("Ez az email regisztrált felhasználóhoz vagy büféhez tartozik. Kérjük, jelentkezz be a rendeléshez.");
      return;
    }
    setEmailAccepted(true);
    setEditingEmail(false);
  };

  const currentStep = getCurrentStep(cart, cartAccepted, emailAccepted, editingEmail, isPickupValid && pickupAccepted, paymentStatus === 'success');

  if (!stripePromise) {
    return <div>Hiba: Stripe nincs konfigurálva. Ellenőrizd a VITE_STRIPE_PUBLISHABLE_KEY környezeti változót.</div>;
  }

  return (
    <div className="flex">
      <CartStepIndicator currentStep={currentStep} />

      <div className="flex-1">
        {/* Summary Section */}
        {cart.length > 0 && (cartAccepted || emailAccepted || pickupAccepted) && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-base font-semibold mb-2 text-[var(--primary)]">Összegzés</h3>
            <ul className="space-y-2">
              {cartAccepted && (
                <li>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Kosár:</span>
                    <button
                      className="text-xs text-[var(--primary)] underline ml-2"
                      onClick={() => setCartAccepted(false)}
                    >Módosít</button>
                  </div>
                  {cart.length === 0 ? (
                    <div className="ml-2"><EmptyCart /></div>
                  ) : (
                    <ul className="ml-2 list-disc list-inside text-sm">
                      {cart.map(item => (
                        <li key={item.uniqueId}>{item.name} <span className="text-xs text-gray-500">({item.price} Ft)</span></li>
                      ))}
                    </ul>
                  )}
                </li>
              )}
              {emailAccepted && (
                <li className="flex items-center justify-between">
                  <span className="text-sm">Email: <span className="font-medium">{email}</span></span>
                  <button
                    className="text-xs text-[var(--primary)] underline ml-2"
                    onClick={() => { setEditingEmail(true); setEmailAccepted(false); }}
                  >Módosít</button>
                </li>
              )}
              {pickupAccepted && (
                <li className="flex items-center justify-between">
                  <span className="text-sm">Átvételi idő: <span className="font-medium">{pickupHour}:{pickupMinute}</span></span>
                  <button
                    className="text-xs text-[var(--primary)] underline ml-2"
                    onClick={() => setPickupAccepted(false)}
                  >Módosít</button>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="p-6 md:p-8 bg-white rounded-xl shadow-sm">
          {/* Order Cart Step */}
          {cart.length > 0 && !cartAccepted && (
            <div className="mb-6 bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faShoppingCart} className="text-[var(--primary)] text-lg mr-3" />
                <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>
                  Kosár
                </h2>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 max-h-48 overflow-y-auto pr-2 styled-scrollbar"
              >
                {cart.map(item => (
                  <CartItem 
                    key={item.uniqueId} 
                    item={item} 
                    removeFromCart={removeFromCart} 
                  />
                ))}
              </motion.div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                <span className="font-medium text-gray-700">Total</span>
                <span className="text-xl font-bold text-primary">{total} Ft</span>
              </div>
              <button
                className="mt-4 w-full px-4 py-2 bg-[var(--primary)] text-white rounded font-semibold disabled:opacity-50"
                onClick={() => setCartAccepted(true)}
                disabled={cart.length === 0}
              >Elfogadom a kosarat</button>
            </div>
          )}

          {/* Email Step */}
          {cart.length > 0 && cartAccepted && (!emailAccepted || editingEmail) && !loggedInEmail && (
            <div className="bg-white rounded-lg p-4 border border-gray-100 mb-6">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCreditCard} className="text-[var(--primary)] text-lg mr-3" />
                <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>
                  Email
                </h2>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="email"
                  className="border p-2 rounded flex-1 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] transition"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded disabled:opacity-50 transition"
                  disabled={!isEmailValid}
                  onClick={handleAcceptEmail}
                >Elfogad</button>
              </div>
              {!isEmailValid && email && (
                <div className="text-xs text-red-500 mt-1">Adj meg egy érvényes email címet.</div>
              )}
              {emailCheckError && (
                <div className="text-xs text-red-500 mt-1">{emailCheckError}</div>
              )}
            </div>
          )}

          {/* Pickup Time Step */}
          {cart.length > 0 && cartAccepted && emailAccepted && !editingEmail && !pickupAccepted && (
            <PickupTimeSelector 
              pickupHour={pickupHour}
              setPickupHour={setPickupHour}
              pickupMinute={pickupMinute}
              setPickupMinute={setPickupMinute}
              pickupAccepted={pickupAccepted}
              setPickupAccepted={setPickupAccepted}
              isPickupValid={isPickupValid}
              paymentStatus={paymentStatus}
            />
          )}

          {cart.length > 0 && cartAccepted && emailAccepted && !editingEmail && isPickupValid && pickupAccepted && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <FontAwesomeIcon icon={faCreditCard} className="text-primary mr-2" />
                Pay securely with card
              </label>
              {paymentStatus === 'success' && pickupCode ? (
                <OrderConfirmation
                  pickupCode={pickupCode}
                  buffetName={buffetName}
                  onClose={handleCloseConfirmation}
                />
              ) : paymentStatus === 'error' ? (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <p className="font-medium">Fizetési Hiba:</p>
                  <p>{paymentError || 'Ismeretlen hiba történt.'}</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Próbáld újra
                  </button>
                </div>
              ) : (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    total={total}
                    cart={cart}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    ordering={isProcessingPayment}
                    currency="HUF"
                  />
                </Elements>
              )}
            </div>
          )}

          <div className="space-y-3">
            {orderSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-green-50 border border-green-100 text-green-700"
              >
                {orderSuccess}
              </motion.div>
            )}
            {orderError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700"
              >
                {orderError}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuffetCart;
