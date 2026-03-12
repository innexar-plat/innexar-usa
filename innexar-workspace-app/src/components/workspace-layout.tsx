"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  FolderOpen,
  MessageSquare,
  Receipt,
  Settings,
  Server,
  LogOut,
  KeyRound,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShoppingCart,
  Columns3,
  FileText,
} from "lucide-react";
import { STAFF_TOKEN_KEY } from "@/lib/workspace-api";

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  children?: { key: string; label: string; href: string }[];
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [hestiaOpen, setHestiaOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { key: "customers", label: "Clientes", icon: UserCircle, href: "/customers" },
    { key: "crm", label: "Contatos", icon: Users, href: "/crm/contacts" },
    { key: "orders", label: "Pedidos", icon: ShoppingCart, href: "/orders" },
    { key: "kanban", label: "Kanban", icon: Columns3, href: "/kanban" },
    { key: "briefings", label: "Briefings", icon: FileText, href: "/briefings" },
    { key: "projects", label: "Projetos", icon: FolderOpen, href: "/projects" },
    {
      key: "support",
      label: "Suporte",
      icon: MessageSquare,
      href: "/support/tickets",
    },
    {
      key: "billing",
      label: "Billing",
      icon: Receipt,
      href: "/billing/invoices",
      children: [
        { key: "invoices", label: "Faturas", href: "/billing/invoices" },
        { key: "products", label: "Produtos", href: "/billing/products" },
        {
          key: "price-plans",
          label: "Planos de preço",
          href: "/billing/price-plans",
        },
      ],
    },
    {
      key: "hestia",
      label: "Hestia",
      icon: Server,
      href: "/hestia",
      children: [
        { key: "hestia-overview", label: "Visão geral", href: "/hestia" },
        { key: "hestia-users", label: "Usuários", href: "/hestia/users" },
        { key: "hestia-domains", label: "Domínios", href: "/hestia/domains" },
        { key: "hestia-packages", label: "Pacotes", href: "/hestia/packages" },
      ],
    },
    {
      key: "config",
      label: "Configurações",
      icon: Settings,
      href: "/config/integrations",
      children: [
        { key: "integrations", label: "Integrações", href: "/config/integrations" },
        { key: "hestia", label: "Hestia", href: "/config/hestia" },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x:
            mobileMenuOpen
              ? 0
              : typeof window !== "undefined" && window.innerWidth < 1024
                ? -280
                : 0,
        }}
        className={`fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-white whitespace-nowrap"
                >
                  Workspace
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex min-w-[44px] min-h-[44px] w-11 h-11 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </motion.div>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isBilling = item.key === "billing";
              const isConfig = item.key === "config";
              const isHestia = item.key === "hestia";
              const subOpen = isBilling
                ? billingOpen
                : isConfig
                  ? configOpen
                  : isHestia
                    ? hestiaOpen
                    : false;

              if (hasChildren && sidebarOpen) {
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isBilling) setBillingOpen(!billingOpen);
                        if (isConfig) setConfigOpen(!configOpen);
                        if (isHestia) setHestiaOpen(!hestiaOpen);
                      }}
                      className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                      <motion.div animate={{ rotate: subOpen ? 180 : 0 }}>
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {subOpen && item.children && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-4 mt-1 space-y-1 border-l border-white/5 ml-5"
                        >
                          {item.children.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block py-2 px-3 rounded-lg text-sm transition-all
                                  ${isActive(child.href) ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white"}`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }

              if (hasChildren && !sidebarOpen) {
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive(item.href) ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  </li>
                );
              }

              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${active ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"}`}
                    />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${pathname === "/account" ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
          >
            <KeyRound className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  Alterar senha
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 min-h-[44px]"
            aria-label="Sair da conta"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"}`}
      >
        <header className="sticky top-0 z-30 h-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Admin</h1>
            <div className="w-10" />
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
