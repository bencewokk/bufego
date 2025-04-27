import React, { useState } from "react";
import OrderStatusTracker from "../buffets/OrderStatusTracker";

export const Hero = () => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pickupCode, setPickupCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");

  return (
    <div className="bg-gradient-to-r to-[var(--primary-light)] from-[var(--primary)] py-16 md:py-24 relative overflow-hidden">
      {/* CSS Animations */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.4); opacity: 0.3; }
        }
        @keyframes diagonal {
          0% { transform: translate(-50%, -50%) rotate(45deg) translateX(0); }
          100% { transform: translate(-50%, -50%) rotate(45deg) translateX(1000px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .clip-hexagon {
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        }
        .clip-star {
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>

      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {/* Floating hexagons */}
        <div className="absolute w-24 h-24 bg-white/10 clip-hexagon top-1/4 left-1/4 animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute w-32 h-32 bg-[var(--primary)]/20 clip-hexagon bottom-1/4 right-1/4 animate-[float_10s_ease-in-out_infinite]" />

        {/* Pulsing gradient circles */}
        <div className="absolute w-96 h-96 bg-gradient-to-r from-[var(--primary)]/20 to-transparent rounded-full -top-48 -left-48 animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute w-64 h-64 bg-gradient-to-b from-white/10 to-transparent rounded-full bottom-32 right-32 animate-[pulse_8s_ease-in-out_infinite] delay-2000" />

        {/* Rotating diamond grid */}
        <div className="absolute w-64 h-64 border-2 border-white/10 left-1/3 top-1/3 animate-[rotate_25s_linear_infinite]">
          <div className="w-full h-full bg-transparent border-2 border-white/10 rotate-45" />
        </div>

        {/* Diagonal moving lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-1/2 w-[200%] h-1 bg-white/10 animate-[diagonal_20s_linear_infinite] origin-left -rotate-45" />
          <div className="absolute left-0 top-1/2 w-[200%] h-1 bg-white/10 animate-[diagonal_25s_linear_infinite] origin-left -rotate-45 delay-1000" />
        </div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white rounded-full animate-[float_${
              6 + (i % 5)
            }s_ease-in-out_infinite]`}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.3 + Math.random() * 0.3,
            }}
          />
        ))}

        {/* Spinning elements */}
        <div className="absolute w-16 h-16 right-32 bottom-32 animate-[spin_15s_linear_infinite]">
          <div className="w-full h-full bg-transparent clip-star bg-white/10" />
        </div>
        <div className="absolute w-20 h-20 left-1/4 top-3/4 animate-[spin_20s_linear_infinite_reverse]">
          <div className="w-full h-full bg-transparent clip-triangle bg-white/10" />
        </div>

        {/* Blinking circles */}
        <div className="absolute w-8 h-8 bg-white/20 rounded-full top-1/3 right-1/4 animate-[blink_4s_ease-in-out_infinite]" />
        <div className="absolute w-12 h-12 bg-white/15 rounded-full bottom-1/4 left-1/3 animate-[blink_5s_ease-in-out_infinite] delay-1500" />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Gyors és egyszerű étkezés az iskoládban
            </h1>
            <p className="text-lg md:text-xl text-white mb-6">
              Keresd meg a legjobb büféket, nézd meg a menüt és rendelj előre -
              minden egy helyen!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                className="bg-white text-[var(--primary)] px-6 py-3 rounded-full font-medium text-center hover:bg-gray-100 transition-colors border-2 border-white"
                onClick={() => {
                  setShowOrderModal(true);
                  setSubmittedCode("");
                  setPickupCode("");
                }}
                style={{ whiteSpace: "nowrap" }}
              >
                Rendelés követése
              </button>
              <a
                href="/about"
                className="border-2 border-white text-white px-6 py-3 rounded-full font-medium text-center hover:bg-white/10 transition-colors"
                style={{ whiteSpace: "nowrap" }}
              >
                Tudj meg többet
              </a>
              <a
                href="/buffet-login"
                className="border-2 border-white text-white px-6 py-3 rounded-full font-medium text-center hover:bg-white/10 transition-colors"
                style={{ whiteSpace: "nowrap" }}
              >
                Van már büféd?
              </a>
            </div>
          </div>
          <div className="w-full md:w-2/5 flex justify-center items-center mt-8 md:mt-0">
            <a
              href="/buffets"
              className="bg-white text-[var(--primary)] px-10 py-6 rounded-lg shadow-md 
                        font-bold text-xl md:text-2xl uppercase tracking-wide transition-all 
                        hover:shadow-lg hover:translate-y-1 flex items-center justify-center
                        w-full md:w-4/5 relative z-10"
            >
              Rendelj most
            </a>
          </div>
        </div>
      </div>

      {/* Order Tracking Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowOrderModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            {!submittedCode ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pickupCode.trim()) setSubmittedCode(pickupCode.trim());
                }}
              >
                <h2 className="text-xl font-bold mb-4 text-[var(--primary)]">
                  Rendelés követése
                </h2>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Átvételi kód
                </label>
                <input
                  type="text"
                  className="border p-2 rounded w-full mb-4"
                  placeholder="Írd be az átvételi kódod..."
                  value={pickupCode}
                  onChange={(e) => setPickupCode(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full bg-[var(--primary)] text-white py-2 rounded font-semibold hover:bg-[var(--primary-dark)] transition"
                  disabled={!pickupCode.trim()}
                >
                  Követés
                </button>
              </form>
            ) : (
              <OrderStatusTracker
                pickupCode={submittedCode}
                onClose={() => setShowOrderModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
