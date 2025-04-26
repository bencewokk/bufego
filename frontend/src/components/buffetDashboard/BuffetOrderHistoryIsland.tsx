import { useEffect, useState } from "react";

export const BuffetOrderHistoryIsland = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:3000/api/orders/buffet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Nem sikerült lekérni a rendeléseket.");
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Ismeretlen hiba történt.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-[var(--background)] rounded-xl shadow p-6 flex flex-col w-full mt-8">
      <span className="text-lg font-semibold text-gray-600 mb-4">Rendelési előzmények (Büfé)</span>
      {loading ? (
        <div className="text-center text-gray-500">Betöltés...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-400">Nincs korábbi rendelés.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex flex-col island-card hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[var(--primary)] text-lg">#{order.pickupCode}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "preparing"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "ready"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Átvételi idő:</span>{" "}
                <span className="text-gray-900">{new Date(order.pickupTime).toLocaleString("hu-HU")}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Rendelt tételek:</span>
                <ul className="list-disc list-inside ml-2 mt-1 text-gray-800">
                  {order.items.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Rendelés leadva:</span>{" "}
                <span className="text-gray-900">{new Date(order.createdAt).toLocaleString("hu-HU")}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Email:</span>{" "}
                <span className="text-gray-900">{order.decryptedEmail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
