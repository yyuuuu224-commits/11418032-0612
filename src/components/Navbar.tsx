import React from "react";
import { User } from "firebase/auth";
import { Sparkles, Bell, Trophy, ShieldCheck, HelpCircle } from "lucide-react";

interface NavbarProps {
  user: User | null;
  activeTab: string;
}

export default function Navbar({ user, activeTab }: NavbarProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "overview":
        return "職涯儀表板 Overview";
      case "analyzer":
        return "AI 智慧履歷健檢 Analyst";
      case "coverletter":
        return "AI 求職自薦信 Cover Letter";
      case "invoices":
        return "付費發票下載 Receipts";
      case "config":
        return "Firebase SDK 配置 Integrations";
      default:
        return "控制台 Dashboard";
    }
  };

  return (
    <nav className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30 font-sans" id="smartresume-navbar">
      {/* Search Bar or Page Title */}
      <div className="flex items-center space-x-3">
        <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded" />
        <h1 className="text-lg font-bold text-slate-850 font-sans tracking-tight text-slate-800">
          {getTabTitle()}
        </h1>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center space-x-4">
        {/* Premium badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>SmartResume PRO</span>
        </div>

        {/* Info */}
        <button className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition" title="使用說明">
          <HelpCircle className="h-4.5 w-4.5" />
        </button>

        <button className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition relative" title="訊息通知">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="h-8 w-[1px] bg-slate-200" />

        {/* User Info Capsule */}
        <div className="flex items-center space-x-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-705 text-slate-700">
              {user?.displayName || user?.email?.split("@")[0]}
            </p>
            <p className="text-[10px] text-emerald-600 font-mono flex items-center justify-end space-x-0.5 font-bold">
              <ShieldCheck className="h-3 w-3 inline mr-0.5" />
              <span>已驗證</span>
            </p>
          </div>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="h-9 w-9 rounded-full border border-slate-200 pointer-events-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-slate-100 font-bold text-sm shadow">
              {(user?.email?.[0] || "U").toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
