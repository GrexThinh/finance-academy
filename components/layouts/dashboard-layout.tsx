"use client";

<<<<<<< HEAD
<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 1715de4 (update)
=======
import { useState } from "react";
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  PieChart,
} from "lucide-react";

const navigation = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Thu nhập", href: "/income", icon: TrendingUp },
  { name: "Chi phí", href: "/expenses", icon: TrendingDown },
  { name: "Thống kê", href: "/statistics", icon: BarChart3 },
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
  { name: "Lợi nhuận/Lỗ", href: "/profit-loss", icon: PieChart },
  { name: "Danh mục", href: "/catalog", icon: FileText, children: [
    { name: "Trung tâm", href: "/catalog/centers" },
    { name: "Chương trình", href: "/catalog/programs" },
    { name: "Đối tác", href: "/catalog/partners" },
  ]},
<<<<<<< HEAD
=======
  //{ name: "Lợi nhuận/Lỗ", href: "/profit-loss", icon: PieChart },
  {
    name: "Danh mục",
    icon: FileText,
    children: [
      { name: "Trung tâm", href: "/catalog/centers" },
      { name: "Chương trình", href: "/catalog/programs" },
      { name: "Đối tác", href: "/catalog/partners" },
    ],
  },
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["Danh mục"])
  );

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  // Catalog is always expanded
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.push("/login");
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
<<<<<<< HEAD
<<<<<<< HEAD
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
=======
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
>>>>>>> 1715de4 (update)
=======
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
          <div className="flex flex-col w-full bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? "bg-primary-100 text-primary-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                  {item.children && isActive(item.href) && (
<<<<<<< HEAD
=======
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? "bg-primary-100 text-primary-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                        expandedItems.has(item.name)
                          ? "bg-primary-100 text-primary-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </button>
                  )}
                  {item.children && expandedItems.has(item.name) && (
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`block px-3 py-2 text-sm font-medium rounded-md ${
                            pathname === child.href
                              ? "bg-primary-50 text-primary-700"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
<<<<<<< HEAD
<<<<<<< HEAD
            <h1 className="text-xl font-bold text-gray-900">Victoria Academy</h1>
=======
            <h1 className="text-xl font-bold text-gray-900">
              Victoria Academy
            </h1>
>>>>>>> 1715de4 (update)
=======
            <h1 className="text-xl font-bold text-gray-900">Victoria Academy</h1>
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? "bg-primary-100 text-primary-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
                {item.children && isActive(item.href) && (
<<<<<<< HEAD
=======
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? "bg-primary-100 text-primary-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      expandedItems.has(item.name)
                        ? "bg-primary-100 text-primary-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                )}
                {item.children && expandedItems.has(item.name) && (
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`block px-3 py-2 text-sm font-medium rounded-md ${
                          pathname === child.href
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
<<<<<<< HEAD
<<<<<<< HEAD
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
=======
                    {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
>>>>>>> 1715de4 (update)
=======
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
<<<<<<< HEAD
<<<<<<< HEAD
                  {session.user?.name || 'User'}
=======
                  {session.user?.name || "User"}
>>>>>>> 1715de4 (update)
=======
                  {session.user?.name || 'User'}
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
<<<<<<< HEAD
<<<<<<< HEAD
            <h1 className="text-lg font-semibold text-gray-900">Victoria Academy</h1>
=======
            <h1 className="text-lg font-semibold text-gray-900">
              Victoria Academy
            </h1>
>>>>>>> 1715de4 (update)
=======
            <h1 className="text-lg font-semibold text-gray-900">Victoria Academy</h1>
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
