import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faTrashAlt, faClock, faCreditCard, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem } from "../../types";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from "./StripePaymentForm";
import OrderConfirmation from "../../components/buffets/OrderConfirmation";
import { motion } from "framer-motion";

interface BuffetCartProps {
  cart: InventoryItem[];
  removeFromCart: (item: InventoryItem) => void;
  orderSuccess: string | null;
  orderError: string | null;
  buffetName: string;
  buffetId: string; // Add buffetId prop
  onClearCart: () => void;
}

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51H59owJmQoVhz82aWAoi9M5s8PC6sSAqFI7KfAD2NRKun5riDIOM0dvu2caM25a5f5JbYLMc5Umxw8Dl7dBIDNwM00yVbSX8uS";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const steps = [
  { label: "Cart", icon: faShoppingCart },
  { label: "Pickup Time", icon: faClock },
  { label: "Payment", icon: faCreditCard },
  { label: "Done", icon: faCheckCircle },
];

function getCurrentStep(cart: InventoryItem[], isPickupValid: boolean, paymentSuccess: boolean) {
  if (!cart.length) return 0;
  if (!isPickupValid) return 1;
  if (!paymentSuccess) return 2;
  return 3;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

const BuffetCart: React.FC<BuffetCartProps> = ({ cart, removeFromCart, orderSuccess, orderError, buffetName, buffetId, onClearCart }) => {
  const [pickupHour, setPickupHour] = useState<string>("");
  const [pickupMinute, setPickupMinute] = useState<string>("");
  const [pickupAccepted, setPickupAccepted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [pickupCode, setPickupCode] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const today = new Date().toISOString().slice(0, 10);
  const isPickupValid = pickupHour !== "" && pickupMinute !== "";

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
  }, [cart]);

  const handlePaymentSuccess = async () => {
    console.log("Payment successful!");
    // Generate pickup code
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      // Format pickup time
      const pickupDateTime = `${today}T${pickupHour.padStart(2, "0")}:${pickupMinute.padStart(2, "0")}:00`;
      
      // Create order in the backend - format items as strings to match the schema
      const orderResponse = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          // Format items as simple strings to match the model's expectations
          items: cart.map(item => `${item.name} (${item.price} Ft)`),
          pickupCode: generatedCode,
          pickupTime: pickupDateTime,
          buffetId: buffetId, // Use the buffetId prop directly
          status: "pending"
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(`Failed to create order: ${errorData.message || orderResponse.statusText}`);
      }

      console.log("Order created successfully");
      
      // Update UI state
      setPickupCode(generatedCode);
      setPaymentStatus('success');
      setIsProcessingPayment(false);
    } catch (error) {
      console.error("Error creating order:", error);
      // Still show success to user since payment worked, but log the error
      setPickupCode(generatedCode);
      setPaymentStatus('success');
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

  const currentStep = getCurrentStep(cart, isPickupValid && pickupAccepted, paymentStatus === 'success');

  if (!stripePromise) {
    return <div>Hiba: Stripe nincs konfigurálva. Ellenőrizd a VITE_STRIPE_PUBLISHABLE_KEY környezeti változót.</div>;
  }

  return (
    <div className="flex">
      <div className="relative flex flex-col items-center mr-6 min-h-[340px]">
        <div className="absolute left-1/2 top-6 bottom-6 w-1 bg-gradient-to-b from-[var(--primary)] to-[var(--primary-light)] opacity-30 z-0" style={{ transform: 'translateX(-50%)' }} />
        {steps.map((step, idx) => (
          <div key={step.label} className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: currentStep === idx ? 1.15 : 1,
                opacity: currentStep >= idx ? 1 : 0.5,
                backgroundColor: currentStep >= idx ? 'var(--primary)' : '#e5e7eb',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-3 h-3 rounded-full mb-2 ${currentStep >= idx ? 'bg-[var(--primary)]' : 'bg-gray-200'} shadow`}
            />
            <span className={`text-xs font-medium mb-4 ${currentStep >= idx ? 'text-[var(--primary)]' : 'text-gray-400'}`}>{step.label}</span>
            {idx < steps.length - 1 && (
              <div className="w-1 h-8 bg-gradient-to-b from-[var(--primary)] to-[var(--primary-light)] opacity-30" />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1">
        <div className="p-6 md:p-8 bg-white rounded-xl shadow-sm">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <FontAwesomeIcon icon={faShoppingCart} className="text-[var(--primary)] text-xl" />
            </div>
            <h2 className="text-xl font-bold ml-4" style={{ color: "var(--text)" }}>
              Your Order Cart ({cart.length})
            </h2>
          </div>

          {cart.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 max-h-48 overflow-y-auto pr-2 styled-scrollbar"
            >
              {cart.map(item => (
                <motion.div
                  key={item.uniqueId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.price} Ft</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item)}
                    className="ml-4 p-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} size="sm" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 px-4 rounded-lg bg-gray-50 border border-dashed border-gray-200"
            >
              <p className="text-gray-500 mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-400">Add items from the menu above to get started</p>
            </motion.div>
          )}

          {cart.length > 0 && (
            <div className="mt-6 space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">Total</span>
                <span className="text-xl font-bold text-primary">{total} Ft</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <FontAwesomeIcon icon={faClock} className="text-primary mr-2" />
                  Pickup Time (Today)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200">
                    <input
                      type="number"
                      min={new Date().getHours()}
                      max={23}
                      className="w-16 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="HH"
                      value={pickupHour}
                      onChange={e => setPickupHour(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                      disabled={paymentStatus === 'success'}
                    />
                    <span className="text-gray-400">:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      className="w-16 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="MM"
                      value={pickupMinute}
                      onChange={e => setPickupMinute(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                      disabled={paymentStatus === 'success'}
                    />
                  </div>
                  <div className="text-xs px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-md text-yellow-700">
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    Minimum: {(() => {
                      const now = new Date();
                      const minPickup = new Date(now.getTime() + 10 * 60000);
                      return `${minPickup.getHours().toString().padStart(2, "0")}:${minPickup.getMinutes().toString().padStart(2, "0")}`;
                    })()} (10 perc múlva)
                  </div>
                </div>

                {!pickupAccepted && paymentStatus !== 'success' && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 w-full px-4 py-2 bg-primary text-white rounded-md font-medium 
                             hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setPickupAccepted(true)}
                    disabled={!isPickupValid}
                  >
                    Elfogadom az átvételi időpontot
                  </motion.button>
                )}

                {pickupAccepted && paymentStatus !== 'success' && (
                  <div className="mt-3 flex items-center justify-between bg-green-50 px-4 py-2 rounded-md border border-green-100">
                    <div className="flex items-center text-green-700">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      <span className="text-sm">Átvételi időpont elfogadva</span>
                    </div>
                    <button
                      type="button"
                      className="text-sm px-3 py-1 bg-white text-gray-600 rounded-md hover:bg-gray-50 border border-gray-200"
                      onClick={() => setPickupAccepted(false)}
                    >
                      Módosítás
                    </button>
                  </div>
                )}
              </div>

              {cart.length > 0 && isPickupValid && pickupAccepted && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default BuffetCart;
