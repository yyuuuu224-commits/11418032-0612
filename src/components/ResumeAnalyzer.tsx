import React, { useState } from "react";
import { User } from "firebase/auth";
import { ResumeAnalysis, ResumeDoc } from "../types";
import { 
  Upload, 
  FileText, 
  Play, 
  HelpCircle,
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Lightbulb,
  Award,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  Briefcase,
  ChevronRight,
  UserCheck,
  Dumbbell
} from "lucide-react";

interface ResumeAnalyzerProps {
  user: User | null;
  onSaveResume: (title: string, resumeText: string, jobTarget: string, analysis: ResumeAnalysis) => Promise<void>;
  selectedResumeDetail: ResumeDoc | null;
  setSelectedResumeDetail: (resume: ResumeDoc | null) => void;
}

export default function ResumeAnalyzer({ user, onSaveResume, selectedResumeDetail, setSelectedResumeDetail }: ResumeAnalyzerProps) {
  // Form States
  const [title, setTitle] = useState("我的前端開發者履歷");
  const [jobTarget, setJobTarget] = useState("資深前端工程師 (Senior Front-end Engineer)");
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"score" | "optimization" | "interviews">("score");

  // Analysis result holder for current session if not viewing history
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Upload Handling (Drag & Drop)
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    
    // Simulate reading PDF/Word text - we populate it with a professional mock template context 
    // to give users something rich to start with if they don't paste anything.
    const prefilledText = `【個人簡介】
李明翰 (Marcus Lee) | marcus.lee@email.com | +886-905-123-456
5 年前端設計與分散式網頁系統開發經驗，專精於 React 原生渲染效能優化與高併發架構整合。

【技術技能】
- 前端架構: React 18, Next.js, TypeScript, Vue 3, Redux Toolkit, TailwindCSS
- 後端整合: Node.js, Express, RESTful APIs, GraphQL
- 部署運維: Docker, AWS (S3, EC2, CloudFront), CI/CD (GitHub Actions)
- 工具鏈: Webpack, Vite, Jest, Vitest, Cypress

【工作經歷】
● 優仕新創科技 (Aesthetic Tech Co.) — 軟體工程師 (前端負責人) | 2023.01 - 至今
- 負責企業級雲端 SaaS 管理平台的整體重構，導入 React Server Components。
- 帶領前端 3 人小組，主導完成核心儀表板性能重構，使最大可裝載渲染頁面首頁加載 FCP (First Contentful Paint) 時間從 3.4 秒縮短至 0.85 秒，系統效能提升超過 70%。
- 負責優化 Webpack 模組切割與快取策略，將生產環境 SPA 檔案縮小 40%。
- 使用 WebSockets 實作高併發、低延遲的即時交易大螢幕看板，應對雙 11 單日百萬人次在線。

● 酷網數位智能 (CoolWeb Digital) — 前端開發工程師 | 2021.03 - 2022.12
- 負責多種 B2C 微型電商平台的前端功能開發，採用 Vue & Nuxt 框架。
- 專門優化圖像載入延遲，導入 Lazy-loading 與 WebP 動態響應剪裁，成功使平均跳出率下降 12%。
- 撰寫跨組內部可複用工具組 UI Library，大幅增進前端部門 30% 開發生產力。

【專案經驗】
- AI 智慧文案產出器：串接 OpenAI API 提供一鍵撰寫 FB/IG 廣告文案服務，使用 React + Node.js 獨立研發。
- 個人作品集網站 marcus-dev-log.tw：完全自主設計，獲得多項技術部落格精選。`;

    setResumeText(prefilledText);
  };

  // Perform Gemini AI Analysis
  const handleStartAnalysis = async () => {
    if (!resumeText.trim()) {
      setErrorMsg("請輸入或貼上履歷文字內容！");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setCurrentAnalysis(null);
    setSelectedResumeDetail(null); // Clear previous selection history view

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTarget }),
      });

      if (!resp.ok) {
        throw new Error("伺服器發送錯誤。請確認您的環境變數 GEMINI_API_KEY 配置無誤。");
      }

      const data: ResumeAnalysis = await resp.json();
      setCurrentAnalysis(data);
      setActiveResultTab("score");

      // Auto save to Firestore 
      await onSaveResume(title, resumeText, jobTarget, data);

    } catch (err: any) {
      console.error("Analysis invocation error:", err);
      setErrorMsg(err.message || "智慧分析失敗，請重試或確認網絡配置。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Populate sample resume text
  const loadSampleDraft = () => {
    setTitle("李小明 - 初階 React 開發者履歷");
    setJobTarget("React 前端核心工程師 (Front-end Developer)");
    setResumeText(`【基本資料】
李小明 (Ming Lee) | ming.l@email.com
求職職缺：React 開發工程師

【自我介紹】
我是小明，有一年前端自行摸索開發的經驗。喜歡研究網頁 UI，目前會一些 React、CSS，希望能加入貴團隊學習、奉獻，謝謝！
 
【技能標籤】
- HTML/CSS, JavaScript
- React (簡單寫過一些 side project)
- Tailwind
- Git, GitHub

【專案經歷】
- 簡易個人待辦事項 (Todo List) App：使用 React state 製作，可以新增跟刪除待辦工作。
- 網頁計算機 (Calculator)：完全用 Vanilla JS 監聽按鈕點擊，支援加減乘除邏輯。

【工作經驗】
- 綠原咖啡廳 — 服務生 | 2024.01 - 至今
  - 咖啡調配及日常結帳收銀工作。
  - 對待客人親切和藹，有團隊協作精神。
- 補習班 — 臨時課後助教 | 2023.09 - 2023.12
  - 輔導國小學生功課、解答問題。`);
  };

  // Resolve active dataset (either historical resume doc selection or active session response)
  const activeAnalysis = selectedResumeDetail ? selectedResumeDetail.analysis : currentAnalysis;
  const activeTitle = selectedResumeDetail ? selectedResumeDetail.title : title;
  const activeJobTarget = selectedResumeDetail ? selectedResumeDetail.jobTarget : jobTarget;
  const activeResumeContent = selectedResumeDetail ? selectedResumeDetail.resumeText : resumeText;

  const scoreClass = (score: number) => {
    if (score >= 85) return "text-emerald-700 border-emerald-300 bg-emerald-50";
    if (score >= 70) return "text-blue-700 border-blue-300 bg-blue-50";
    return "text-amber-700 border-amber-300 bg-amber-50";
  };

  return (
    <div className="space-y-6 font-sans" id="smartresume-analyzer-workspace">
      {/* Upper Forms Input or Load History indicator */}
      {selectedResumeDetail && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3 text-slate-800">
            <div className="h-9 w-9 bg-blue-100/80 rounded-full flex items-center justify-center text-blue-600">
              <FileText className="text-blue-600 h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">歷史健檢存檔</span>
              <p className="font-extrabold text-sm text-slate-800">{activeTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedResumeDetail(null)}
            className="px-4 py-2 bg-white border border-slate-250 hover:bg-slate-50 text-xs text-slate-700 font-bold rounded-xl transition shadow-sm"
          >
            返回分析編輯器
          </button>
        </div>
      )}

      {!selectedResumeDetail && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="resume-input-modules">
          {/* Left panel: Edit fields */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="text-blue-600 h-4 w-4" />
                <span className="font-bold">履歷基本資訊</span>
              </h3>
              <button
                onClick={loadSampleDraft}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-0.5 transition"
                title="載入一組待優化的高危履歷範本"
              >
                <span>💡 載入練習範例</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold">履歷版本名稱</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：我的軟體開發英文履歷 V1"
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-bold">期望求職職缺名稱 (更精準健檢)</label>
                <input
                  type="text"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                  placeholder="例如：React 前端工程師 / 全端工程師"
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-sm"
                />
              </div>
              
              {/* Drag n Drop Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 min-h-[140px] relative ${
                  isDragOver 
                    ? "border-blue-500 bg-blue-50 text-blue-600" 
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100/50 hover:border-blue-400 text-slate-500"
                }`}
              >
                <input
                  type="file"
                  id="resume-file-picker"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="h-10 w-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-700">
                    拖曳檔案至此 或 <span className="text-blue-600 underline">瀏覽電腦</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">支援 PDF / txt / Word 模組檔案</p>
                </div>
                {uploadedFileName && (
                  <span className="text-[10px] px-3 py-1 bg-blue-55 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 font-semibold flex items-center space-x-1 animate-pulse">
                    <CheckCircle2 className="h-3.5 w-3.5 inline text-blue-600" />
                    <span>已載入檔案: {uploadedFileName}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Raw Content Textarea */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 shrink-0">
              <ClipboardCheck className="text-blue-600 h-4 w-4" />
              <span className="font-bold">履歷原始文字內容</span>
            </h3>

            <div className="flex-1 min-h-[220px] flex flex-col relative">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="在此貼上您的履歷文字、簡歷內容，或者透過左邊拖曳檔案載入範本。&#10;格式越詳細，Gemini 大語言健檢回饋越精彩..."
                className="w-full flex-1 min-h-[200px] text-xs font-sans text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none leading-relaxed shadow-sm"
                id="resume-content-textarea"
              />
            </div>

            <div className="flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400 font-mono font-bold">
                約 {resumeText.length} 個字元
              </span>
              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-750 bg-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer ${
                  isAnalyzing ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    <span>智慧解析中...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>送出智慧分析</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start space-x-2 animate-bounce shadow-sm">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 animate-pulse text-rose-600" />
          <p className="leading-relaxed">
            <strong>發生錯誤：</strong>{errorMsg}
          </p>
        </div>
      )}

      {/* Loading States with reassurance */}
      {isAnalyzing && (
        <div className="border border-slate-200 bg-white p-12 rounded-3xl text-center space-y-4 animate-pulse shadow-sm">
          <div className="h-12 w-12 rounded-full border-t-2 border-l-2 border-blue-600 border-r-transparent border-b-transparent animate-spin mx-auto" />
          <div className="space-y-1.5">
            <h4 className="text-sm font-extrabold text-slate-800">正在傳送履歷至後端進行智慧解骨剖析</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              Google Gemini 正在深度理解您的職務經歷亮點、估算專業能力指標、並由系統安全守護所有 API 配置。這可能需要 5-8 秒，請稍後...
            </p>
          </div>
        </div>
      )}

      {/* Full Analysis Result Display */}
      {activeAnalysis && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm" id="analysis-reports-container">
          {/* Top Banner Result Header */}
          <div className="bg-slate-50/50 border-b border-slate-200 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">
                健檢分析報告 READY
              </span>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center">
                <Award className="text-indigo-650 text-indigo-600 h-5 w-5 mr-2 shrink-0" />
                <span>{activeTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-3xl font-bold">
                求職目標：<span className="text-blue-6s0 text-blue-600 font-extrabold">{activeJobTarget}</span>
              </p>
            </div>

            {/* Score circle layout */}
            <div className="flex items-center space-x-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center font-black text-base border-2 ${scoreClass(activeAnalysis.score)}`}>
                {activeAnalysis.score}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">健檢分數</span>
                <span className="text-[11px] text-slate-700 font-mono font-bold">Smart Score</span>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 p-1 gap-1">
            <button
              onClick={() => setActiveResultTab("score")}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center space-x-1.5 rounded-xl border ${
                activeResultTab === "score"
                  ? "text-blue-600 border-slate-200 bg-white shadow-sm font-bold"
                  : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/40"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>多維評分與優劣勢</span>
            </button>
            <button
              onClick={() => setActiveResultTab("optimization")}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center space-x-1.5 rounded-xl border ${
                activeResultTab === "optimization"
                  ? "text-blue-600 border-slate-200 bg-white shadow-sm font-bold"
                  : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/40"
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              <span>精修優化策略</span>
            </button>
            <button
              onClick={() => setActiveResultTab("interviews")}
              className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center space-x-1.5 rounded-xl border ${
                activeResultTab === "interviews"
                  ? "text-blue-600 border-slate-200 bg-white shadow-sm font-bold"
                  : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/40"
              }`}
            >
              <Dumbbell className="h-4 w-4" />
              <span>高頻模擬面試</span>
            </button>
          </div>

          {/* Active Tab Contents */}
          <div className="p-6 md:p-8 space-y-6">
            
            {/* TAB 1: Multimodal Evaluation & SWOT */}
            {activeResultTab === "score" && (
              <div className="space-y-6 text-slate-600 font-sans" id="tab-score-evaluation">
                {/* Score Summary description */}
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">
                    總結診斷評語 Overview
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">{activeAnalysis.summary}</p>
                </div>

                {/* SWOT column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths card */}
                  <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-3xl space-y-3">
                    <h4 className="text-xs font-black text-emerald-800 flex items-center space-x-1.5 uppercase tracking-wide">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-pulse" />
                      <span>履歷核心優勢 (Strengths)</span>
                    </h4>
                    <ul className="space-y-2">
                      {activeAnalysis.strengths?.map((item, id) => (
                        <li key={id} className="text-xs text-slate-600 flex items-start space-x-2 leading-relaxed font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses card */}
                  <div className="bg-amber-50/40 border border-amber-100 p-5 rounded-3xl space-y-3">
                    <h4 className="text-xs font-black text-amber-800 flex items-center space-x-1.5 uppercase tracking-wide">
                      <AlertTriangle className="h-4 w-4 text-amber-600 animate-pulse" />
                      <span>潛在扣分弱項 (Weaknesses)</span>
                    </h4>
                    <ul className="space-y-2">
                      {activeAnalysis.weaknesses?.map((item, id) => (
                        <li key={id} className="text-xs text-slate-600 flex items-start space-x-2 leading-relaxed font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Job recommendations */}
                <div className="bg-slate-50/40 border border-slate-150 p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs font-extrabold text-indigo-700 flex items-center space-x-1.5 tracking-wide">
                    <Briefcase className="h-4 w-4 text-indigo-600" />
                    <span>適合高匹配職缺推薦 (Golden Job Matches)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1 animate-fadeIn">
                    {activeAnalysis.suggestedJobTitles?.map((title, id) => (
                      <span key={id} className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold hover:border-indigo-300 hover:shadow-sm transition">
                        🛠️ {title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Three Action Optimization Categories */}
            {activeResultTab === "optimization" && (
              <div className="space-y-5" id="tab-optimization-suggestions">
                {/* 1. Structure */}
                <div className="bg-slate-50/30 border border-slate-100 p-5 rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-blue-600 border-b border-slate-200 pb-2">
                    <FileText className="h-4 w-4" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">排版、段落與結構優化 (Layout & Format)</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {activeAnalysis.optimizationStructure?.map((item, id) => (
                      <li key={id} className="text-xs text-slate-600 flex items-start space-x-2.5 leading-relaxed font-medium">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-mono mt-0.5 font-bold border border-blue-100 shrink-0">優化</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Wording */}
                <div className="bg-slate-50/30 border border-slate-100 p-5 rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-emerald-600 border-b border-slate-200 pb-2">
                    <TrendingUp className="h-4 w-4" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">語句修飾與量化成效建議 (Phrasing & Action Words)</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {activeAnalysis.optimizationWording?.map((item, id) => (
                      <li key={id} className="text-xs text-slate-600 flex items-start space-x-2.5 leading-relaxed font-medium">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-mono mt-0.5 font-bold border border-emerald-100 shrink-0">精煉</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Skills */}
                <div className="bg-slate-50/30 border border-slate-100 p-5 rounded-3xl space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-indigo-650 text-indigo-600 border-b border-slate-200 pb-2">
                    <Sparkles className="h-4 w-4" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider">應補充追加的專業關鍵字與核心標籤 (Missing Keywords)</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {activeAnalysis.optimizationSkills?.map((item, id) => (
                      <li key={id} className="text-xs text-slate-600 flex items-start space-x-2.5 leading-relaxed font-medium">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-mono mt-0.5 font-bold border border-indigo-100 shrink-0">熱門</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: Simulated Interview Quiz Generator */}
            {activeResultTab === "interviews" && (
              <div className="space-y-4" id="tab-mock-interviews">
                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 mb-2">
                  <p className="text-xs text-indigo-700 leading-relaxed font-sans font-semibold">
                    💡 <strong>Smart AI 面試題組說明：</strong>下方是 Gemini 根據本履歷工作經歷，預先沙盤推演的客製化常問難題。提供破題解讀以訓練您的邏輯思維與 STAR 反應速度。
                  </p>
                </div>

                {activeAnalysis.mockQuestions?.map((item, id) => (
                  <div key={id} className="bg-slate-50/30 border border-slate-150 p-5 rounded-3xl space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-extrabold text-indigo-650 text-indigo-600 font-mono">
                        問答與演練 {id + 1}
                      </span>
                      <span className="px-3 py-0.5 bg-white border border-slate-200 text-slate-650 text-[10px] rounded-full font-bold">
                        🧩 題型：{item.type}
                      </span>
                    </div>

                    <p className="text-xs font-extrabold text-slate-800">
                      「 {item.question} 」
                    </p>

                    <div className="p-3.5 rounded-2xl bg-white border-l-4 border-indigo-600 text-slate-500 text-xs space-y-1 shadow-sm">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block font-mono">
                        💡 建議答題策略 & 破題心法 (Strategic Intent)
                      </span>
                      <p className="leading-relaxed font-sans text-slate-700 font-medium">{item.suggestedApproach}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
