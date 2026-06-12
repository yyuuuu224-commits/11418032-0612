import React from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  FileEdit, 
  Receipt, 
  Settings, 
  LogOut, 
  Brain,
  Cpu,
  ArrowRightLeft
} from "lucide-react";
import { auth } from "../lib/firebase";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "職涯儀表板", icon: LayoutDashboard, desc: "學習與分析綜覽" },
    { id: "analyzer", label: "AI 智慧健檢", icon: Brain, desc: "多層次履歷解析" },
    { id: "coverletter", label: "求職自薦信", icon: FileEdit, desc: "黃金 Cover Letter" },
    { id: "invoices", label: "付費發票下載", icon: Receipt, desc: "電子收據與明細" },
    { id: "config", label: "Firebase 配置", icon: Settings, desc: "系統核心 SDK 設定" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen shrink-0 relative pointer-events-auto" id="smartresume-sidebar">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-slate-100 shadow-md shadow-blue-500/10">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-800 tracking-wider flex items-center mr-1">
              SmartResume
            </div>
            <p className="text-[10px] text-slate-500 font-medium">智慧履歷優化助手</p>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-3.5 mb-2">
          主要功能選單
        </p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group relative ${
                isActive
                  ? "bg-blue-50/70 text-blue-600 border-l-2 border-blue-600 font-semibold shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 mr-3 shrink-0 transition-transform group-hover:scale-105 ${
                isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
               }`} />
              <div>
                <p className="text-sm">{item.label}</p>
                <p className={`text-[9px] truncate w-36 ${isActive ? "text-blue-600/80" : "text-slate-400 group-hover:text-slate-500"}`}>
                  {item.desc}
                </p>
              </div>
              
              {isActive && (
                <div className="absolute right-3.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Workspace Watermark Panel */}
      <div className="p-4 mx-4 mb-4 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center space-x-2 text-blue-600 mb-1">
          <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase">AI 智慧分析引擎</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
          整合兩大尖端科技：Google Gemini 生成式 AI 加上 Google Firestore 雲端即時串接。
        </p>
      </div>

      {/* Footer Logout Container */}
      <div className="p-4 border-t border-slate-200 bg-white flex flex-col">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 text-left transition group"
        >
          <LogOut className="h-4.5 w-4.5 mr-3 text-slate-400 group-hover:text-rose-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">登出服務</p>
            <p className="text-[9px] text-slate-400">Sign Out Securely</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
