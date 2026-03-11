import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  ScanSearch, 
  TrendingUp, 
  CloudSun, 
  Landmark,
  Sprout,
  Brain,
  UserCircle,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Intelligence Hub", href: "/intelligence", icon: Brain },
  { name: "AI Assistant", href: "/assistant", icon: MessageSquare },
  { name: "Disease Detection", href: "/disease", icon: ScanSearch },
  { name: "Market Prices", href: "/market", icon: TrendingUp },
  { name: "Weather & Satellite", href: "/weather", icon: CloudSun },
  { name: "Loan Eligibility", href: "/loan", icon: Landmark },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-stone-100">
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-stone-800">AgriIntel</h1>
            <p className="text-xs text-stone-500 font-medium">Farm Assistant</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-600" : "text-stone-400 group-hover:text-stone-600")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-200 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-800 truncate">Ramesh Kumar</p>
              <p className="text-xs font-medium text-emerald-600 truncate">Premium Farmer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-stone-50/50">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-stone-800 tracking-tight">
            {navItems.find(i => i.href === location.pathname)?.name || "Dashboard"}
          </h2>
          <button className="p-2.5 rounded-full bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors border border-stone-200 shadow-sm relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
