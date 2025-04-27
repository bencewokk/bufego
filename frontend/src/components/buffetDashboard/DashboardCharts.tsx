import { FC, useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import { 
  Chart, CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, BarElement, Filler
} from "chart.js";
import { Calendar, TrendingUp, Package, DollarSign, Users, RefreshCw } from "lucide-react";

// Register Chart.js components
Chart.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, BarElement, Filler
);

interface DashboardChartsProps {
  inventory: { category: string; price?: number; createdAt?: string; name?: string }[];
}

const DashboardCharts: FC<DashboardChartsProps> = ({ inventory }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<'orders' | 'revenue'>('orders');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("http://localhost:3000/api/orders/buffet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders for charts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Generate date labels and data points based on selected timeframe
  const getPeriodData = () => {
    let days: Date[];
    
    if (timeframe === 'week') {
      days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
    } else {
      days = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d;
      });
    }

    const labels = days.map(d =>
      d.toLocaleDateString("hu-HU", { 
        weekday: timeframe === 'week' ? "short" : undefined, 
        day: "numeric",
        month: timeframe === 'month' ? "short" : undefined
      })
    );

    const orderCounts = days.map(day =>
      orders.filter(o => {
        const date = new Date(o.createdAt);
        return date.toDateString() === day.toDateString();
      }).length
    );

    const revenue = days.map(day => {
      return orders
        .filter(o => {
          const date = new Date(o.createdAt);
          return date.toDateString() === day.toDateString();
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    });

    return { labels, orderCounts, revenue };
  };

  const { labels, orderCounts, revenue } = getPeriodData();

  // Calculate summary stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get data for line chart based on selected metric
  const lineData = {
    labels,
    datasets: [
      {
        label: selectedChart === 'orders' ? "Rendelések" : "Bevétel (Ft)",
        data: selectedChart === 'orders' ? orderCounts : revenue,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#4f46e5",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Extract category data
  const categoryCounts = inventory.reduce((acc, item) => {
    if (item.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get data for pie chart
  const pieData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          "#4f46e5", "#3b82f6", "#06b6d4", "#10b981", 
          "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverBorderWidth: 4,
      },
    ],
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: "#4b5563"
        }
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: "#6b7280"
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: "#6b7280"
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'easeInOutQuad' as const,
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: "#4b5563",
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13
        },
        padding: 12,
        boxPadding: 6,
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Handle refresh of data
  const handleRefresh = async () => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("http://localhost:3000/api/orders/buffet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (error) {
        console.error("Error refreshing orders data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      {/* Dashboard header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Dashboard Analitika
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeframe === 'week' 
                ? 'bg-white text-indigo-600' 
                : 'bg-indigo-700 text-white hover:bg-indigo-800'
            } transition-colors`}
          >
            7 nap
          </button>
          <button 
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeframe === 'month' 
                ? 'bg-white text-indigo-600' 
                : 'bg-indigo-700 text-white hover:bg-indigo-800'
            } transition-colors`}
          >
            30 nap
          </button>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded-full bg-indigo-700 text-white hover:bg-indigo-800 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Összes termék</p>
            <p className="text-xl font-bold">{inventory.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Rendelések</p>
            <p className="text-xl font-bold">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Átlagos érték</p>
            <p className="text-xl font-bold">{averageOrderValue.toLocaleString()} Ft</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Line chart with toggle */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                Időbeli eloszlás
              </h3>
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setSelectedChart('orders')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    selectedChart === 'orders'
                      ? 'bg-white shadow text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors`}
                >
                  Rendelések
                </button>
                <button
                  onClick={() => setSelectedChart('revenue')}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    selectedChart === 'revenue'
                      ? 'bg-white shadow text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors`}
                >
                  Bevétel
                </button>
              </div>
            </div>
            <div className="h-64">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>

          {/* Category distribution */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
              <Package className="mr-2 h-5 w-5 text-indigo-600" />
              Kategória eloszlás
            </h3>
            <div className="h-64">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Category details */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Készlet kategóriánként</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div 
                key={category}
                className={`p-4 rounded-lg border ${
                  hoveredCategory === category ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                } transition-all cursor-pointer`}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <h4 className="font-medium text-gray-900">{category}</h4>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((count / inventory.length) * 100).toFixed(1)}% az összesből
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;