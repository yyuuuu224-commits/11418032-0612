import React, { useState } from "react";
import { User } from "firebase/auth";
import { ResumeDoc } from "../types";
import { 
  FileEdit, 
  Sparkles, 
  Copy, 
  Check, 
  Building, 
  Briefcase, 
  MessageSquare,
  Clipboard,
  BookOpen,
  Send,
  Loader
} from "lucide-react";

interface CoverLetterGeneratorProps {
  user: User | null;
  resumes: ResumeDoc[];
}

export default function CoverLetterGenerator({ user, resumes }: CoverLetterGeneratorProps) {
  // Input fields
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [manualResumeText, setManualResumeText] = useState("");
  const [jobTarget, setJobTarget] = useState("技術前端工程師");
  const [companyName, setCompanyName] = useState("極速科技 (Future Technology)");
  const [tone, setTone] = useState("自信誠懇、重點論述量化成就");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultCoverLetter, setResultCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUseResumeText = (id: string) => {
    setSelectedResumeId(id);
    if (id === "manual") {
      setManualResumeText("");
      return;
    }
    const target = resumes.find(r => r.id === id);
    if (target) {
      setManualResumeText(target.resumeText);
      setJobTarget(target.jobTarget);
    }
  };

  const handleGenerate = async () => {
    const activeText = manualResumeText.trim();
    if (!activeText) {
      setErrorMsg("請選擇一份背景履歷，或在下方手動鍵入基本經歷文字！");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setResultCoverLetter("");

    try {
      const resp = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: activeText,
          jobTarget,
          companyName,
          tone
        })
      });

      if (!resp.ok) {
        throw new Error("發送生成請求錯誤，請重試或檢查 API 金鑰。");
      }

      const data = await resp.json();
      setResultCoverLetter(data.coverLetter || "");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "自薦信一鍵生成失敗。");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!resultCoverLetter) return;
    navigator.clipboard.writeText(resultCoverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 font-sans" id="smartresume-cover-letter-workspace">
      {/* Parameter Panel */}
      <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl h-fit space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <FileEdit className="text-blue-600 h-4.5 w-4.5" />
          <span className="font-bold">Cover Letter 核心配置</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* Select background resume data source */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold">背景履歷來源</label>
            <select
              value={selectedResumeId}
              onChange={(e) => handleUseResumeText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition shadow-sm"
            >
              <option value="">-- 請選擇關聯的歷史履歷 --</option>
              {resumes.map((item) => (
                <option key={item.id} value={item.id}>
                  📄 {item.title} ({item.score}分)
                </option>
              ))}
              <option value="manual">✏️ 手動填寫新的經歷文字</option>
            </select>
          </div>

          {selectedResumeId === "manual" && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-slate-500 font-bold">經歷內容文字</label>
              <textarea
                value={manualResumeText}
                onChange={(e) => setManualResumeText(e.target.value)}
                placeholder="貼上您的主要工作背景、核心優勢，以便 AI 提煉亮點..."
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 resize-none font-sans transition shadow-sm"
              />
            </div>
          )}

          {/* Job title */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold flex items-center space-x-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>目標職缺名稱 (Job Title)</span>
            </label>
            <input
              type="text"
              value={jobTarget}
              onChange={(e) => setJobTarget(e.target.value)}
              placeholder="如：高級技術工程主管"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition shadow-sm"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold flex items-center space-x-1">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <span>目標公司與企業 (Company)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="如：美商卓越 AI 科技集團"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition shadow-sm"
            />
          </div>

          {/* Tone Setting */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-bold flex items-center space-x-1">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <span>信件撰寫風格與語調 (Tone)</span>
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition shadow-sm"
            >
              <option value="自信誠懇、重點論述量化成就">謙遜自信、精緻描繪 STAR 關鍵指標 (推薦)</option>
              <option value="積極熱情、展現學習慾望與技術忠誠">熱情亮點、高度展現認同感與長期承諾</option>
              <option value="專業嚴謹、字句幹練大器">極度專業、精煉高階主管格局風範</option>
              <option value="重點導向、簡潔易讀便於極速瀏覽">精簡快速、條列式點出技術符合度</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 bg-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-md cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader className="h-3.5 w-3.5 animate-spin mr-1" />
                <span>生成自薦信中...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>一鍵智慧產出自薦信</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Panel (A4 letter layout representation) */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col space-y-4 shadow-sm">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <BookOpen className="text-blue-600 h-4.5 w-4.5" />
            <span className="font-bold">自薦信智慧預覽</span>
          </h3>

          {resultCoverLetter && (
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-600 font-bold">已複製！</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>複製全文</span>
                </>
              )}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 shrink-0 font-semibold shadow-sm animate-shake">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 min-h-[400px] rounded-2xl bg-slate-50/50 border border-slate-100 p-6 md:p-8 font-sans text-slate-700 overflow-y-auto max-h-[550px] leading-relaxed relative shadow-inner">
          {isGenerating ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 border-t-2 border-l-2 border-blue-600 border-r-transparent border-b-transparent animate-spin rounded-full" />
              <p className="text-xs text-slate-500 font-bold">正在提煉技術經歷並組裝高品質金信...</p>
            </div>
          ) : resultCoverLetter ? (
            <pre className="whitespace-pre-wrap font-sans text-xs tracking-wide leading-relaxed text-slate-750 text-slate-700 pr-1">
              {resultCoverLetter}
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20 text-slate-400">
              <Clipboard className="h-10 w-10 text-slate-300 animate-pulse shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-600">尚未生成求職信</p>
                <p className="text-[10px] text-slate-400 max-w-xs font-semibold">
                  請於左側選擇您的履歷源，設定目標職缺與偏好的語氣，即可一鍵生成精美得體、符合獵頭規格的 Cover Letter。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
