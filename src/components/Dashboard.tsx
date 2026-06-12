import React, { useState } from "react";
import { ResumeDoc } from "../types";
import { 
  FileText, 
  TrendingUp, 
  Award, 
  HelpCircle,
  Clock, 
  Calendar,
  Sparkles,
  ChevronRight,
  BookOpen,
  Trash2,
  AlertCircle
} from "lucide-react";

interface DashboardProps {
  resumes: ResumeDoc[];
  onSelectResume: (resume: ResumeDoc) => void;
  onDeleteResume: (id: string) => void;
  onNavigateToAnalyze: () => void;
}

export default function Dashboard({ resumes, onSelectResume, onDeleteResume, onNavigateToAnalyze }: DashboardProps) {
  // Compute Stats
  const totalAnalyzed = resumes.length;
  
  const averageScore = totalAnalyzed > 0 
    ? Math.round(resumes.reduce((sum, item) => sum + item.score, 0) / totalAnalyzed) 
    : 0;

  const totalActionItems = resumes.reduce((sum, item) => {
    const analysis = item.analysis;
    const tipsCount = (analysis?.optimizationStructure?.length || 0) + 
                      (analysis?.optimizationWording?.length || 0) + 
                      (analysis?.optimizationSkills?.length || 0);
    return sum + tipsCount;
  }, 0);

  // Quick Tip Guides
  const guides = [
    { title: "STAR 原則落實", tag: "撰寫方法", text: "敘述每項經歷時，請依照：情境 (Situation)、任務 (Task)、行動 (Action) 與結果 (Result) 架構，切勿只是照搬工作說明書。" },
    { title: "強效動詞 (Power Verbs)", tag: "修辭精煉", text: "用「開發、主導、優化、重構、提升」等具體動詞開頭，避免重複使用毫無亮點的形容詞或「負責」一詞。" },
    { title: "精準數字量化成效", tag: "資料亮點", text: "將「大幅縮短響應時間」替換為「重構 API 與資料庫索引結構，成功將平均延遲縮短 42%，吞吐量增長 3 倍」。" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 border-emerald-200 bg-emerald-50";
    if (score >= 70) return "text-blue-700 border-blue-200 bg-blue-50/70";
    return "text-amber-705 text-amber-700 border-amber-200 bg-amber-50";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-blue-600";
    return "bg-amber-500";
  };

  return (
    <div className="space-y-6 font-sans" id="smartresume-dashboard-main">
      {/* Welcome Hero Banner */}
      <header className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 -tr-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>AI 大語言模型精準解析驅動</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            讓 AI 成為您的黃金求職智囊
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed font-sans">
            SmartResume 智慧履歷助手，由 Gemini 語言模型在背後做深度的文字拆解、語意邏輯量化。只需數秒，即可為您指出語法結構漏洞，並自動生成高頻面試題目！
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToAnalyze}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-blue-700 font-bold rounded-xl text-sm transition shadow-lg inline-flex items-center space-x-2"
            >
              <span>立即建立深度分析</span>
              <ChevronRight className="h-4 w-4 text-blue-700 stroke-[3]" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-statistics">
        {/* Stat 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">累計分析履歷</p>
            <p className="text-3xl font-black text-slate-800">{totalAnalyzed}</p>
            <p className="text-[10px] text-slate-500 font-semibold">已儲存至雲端 Firestore</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">平均履歷評分</p>
            <p className="text-3xl font-black text-slate-800">{averageScore}<span className="text-sm font-semibold text-slate-400 ml-1">分</span></p>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(averageScore)}`} 
                style={{ width: `${averageScore}%` }} 
              />
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">累計優化要點</p>
            <p className="text-3xl font-black text-slate-800">{totalActionItems}<span className="text-sm font-semibold text-slate-400 ml-1">項</span></p>
            <p className="text-[10px] text-slate-500 font-semibold">排版 / 關鍵字 / 字句精煉</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition duration-200">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">服務計劃層級</p>
            <p className="text-lg font-black text-indigo-600 tracking-tight">PRO Premium</p>
            <p className="text-[10px] text-indigo-500 font-semibold flex items-center">
              已享有高級分析與發票
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </section>

      {/* Main Bento Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-bento">
        {/* Left list: Previous Resumes */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-600 h-5 w-5" />
              <h3 className="text-base font-bold text-slate-800">歷史履歷優化記錄</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono font-semibold">共 {totalAnalyzed} 份</span>
          </div>

          {resumes.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3 bg-slate-50/50">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-600 font-bold">尚無歷史履歷健檢記錄</p>
              <p className="text-xs text-slate-400">快來健檢您的第一份履歷，解鎖客觀評分與修改提示！</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {resumes.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/50 border border-slate-100 hover:border-blue-200 hover:bg-white p-4 rounded-2xl flex items-center justify-between transition group shadow-sm"
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm truncate block max-w-xs md:max-w-md">
                        {item.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getScoreColor(item.score)}`}>
                        {item.score} 分
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{item.createdAt.split('T')[0]}</span>
                      </span>
                      <span className="truncate max-w-xs text-slate-400 font-semibold">
                        目標職缺: {item.jobTarget || "未指定"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onSelectResume(item)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition inline-flex items-center space-x-1 shadow-sm"
                    >
                      <span className="font-bold text-slate-700">檢視成果</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteResume(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="刪除紀錄"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right list: Professional write guides */}
        <section className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-sm">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-blue-600 h-5 w-5" />
            <h3 className="text-base font-bold text-slate-800">履歷寫作技能心法</h3>
          </div>

          <div className="space-y-4">
            {guides.map((g, idx) => (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700">{g.title}</h4>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-mono uppercase font-bold border border-blue-100">
                    {g.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">{g.text}</p>
              </div>
            ))}
          </div>

          {/* Prompt constraint check indicator */}
          <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl flex items-start space-x-2 text-blue-600 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
            <div className="space-y-1">
              <p className="font-bold text-slate-800">系統即時運行聲明</p>
              <p className="text-slate-500 text-[10px] leading-relaxed font-medium">
                每次分析都會經過真實後端 Node.js + Express 進行 Google Gemini API 深度優化，全程守護 API 密鑰安全。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
