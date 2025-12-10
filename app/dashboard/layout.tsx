"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Thu nhập", href: "/dashboard/income", icon: TrendingUp },
  { name: "Chi phí", href: "/dashboard/expenses", icon: TrendingDown },
  { name: "Lợi nhuận/Lỗ", href: "/dashboard/profit-loss", icon: BarChart3 },
  {
    name: "Danh mục",
    href: "/dashboard/catalog",
    icon: Settings,
    children: [
      { name: "Trung tâm", href: "/dashboard/catalog/centers" },
      { name: "Chương trình", href: "/dashboard/catalog/programs" },
      { name: "Đối tác", href: "/dashboard/catalog/partners" },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transform transition-all duration-200 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold text-primary-600">
                Financial Management
              </h1>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-1 rounded-md hover:bg-gray-100"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-gray-500" />
                ) : (
                  <PanelLeftClose className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const hasChildren = item.children && item.children.length > 0;
              const isSubmenuOpen = openSubmenu === item.name;

              if (hasChildren) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() =>
                        setOpenSubmenu(isSubmenuOpen ? null : item.name)
                      }
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left",
                        "text-gray-700 hover:bg-gray-100",
                        sidebarCollapsed ? "justify-center px-2" : ""
                      )}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5" />
                      {!sidebarCollapsed && item.name}
                      {!sidebarCollapsed && (
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 ml-auto transition-transform",
                            isSubmenuOpen ? "rotate-90" : ""
                          )}
                        />
                      )}
                    </button>
                    {isSubmenuOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                isChildActive
                                  ? "bg-primary-50 text-primary-700"
                                  : "text-gray-600 hover:bg-gray-100",
                                sidebarCollapsed
                                  ? "justify-center px-2"
                                  : "ml-6"
                              )}
                              title={sidebarCollapsed ? child.name : undefined}
                            >
                              <div className="w-2 h-2 bg-current rounded-full" />
                              {!sidebarCollapsed && child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100",
                    sidebarCollapsed ? "justify-center px-2" : ""
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {!sidebarCollapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors",
                sidebarCollapsed ? "justify-center px-2" : ""
              )}
              title={sidebarCollapsed ? "Đăng xuất" : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && "Đăng xuất"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {navigation.find((item) => item.href === pathname)?.name ||
              "Tổng quan"}
          </h2>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
