"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, User, LogOut, ChevronRight, Loader2 } from "lucide-react";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isPayingCustomer: boolean;
}

interface Order {
  id: number;
  number: string;
  status: string;
  total: string;
  dateCreated: string;
  lineItems: { name: string; quantity: number; total: string }[];
}

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!response.ok) {
        router.push("/login");
        return;
      }

      setCustomer(data.customer);
      setOrders(data.orders || []);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#b59a5c]" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-[#b59a5c]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-serif text-[#b59a5c]">
                    {customer.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="font-medium text-gray-900">{customer.displayName}</h2>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>

              <nav className="p-2">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg"
                >
                  <Package size={18} />
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-gray-900">Recent Orders</h2>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link
                    href="/shop"
                    className="inline-block bg-[#1a1a1a] text-white px-6 py-2 text-sm font-medium hover:bg-[#b59a5c] transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-lg p-4 hover:border-[#b59a5c]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Order #{order.number}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(order.dateCreated).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {order.lineItems.length} item
                          {order.lineItems.length > 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-900">
                            ₹{parseFloat(order.total).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[#b59a5c]">
                            <ChevronRight size={18} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
