import React, { useState } from "react";
import { 
  Settings, 
  Cpu, 
  Copy, 
  Check, 
  Database, 
  ShieldCheck, 
  Code,
  Globe,
  Info
} from "lucide-react";

export default function FirebaseConfigView() {
  const [copied, setCopied] = useState(false);

  const snippetCode = `// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ6vfGZysQLYlXhBoNyKuzsb72fv--X-I",
  authDomain: "project-1048703489700299183.firebaseapp.com",
  projectId: "project-1048703489700299183",
  storageBucket: "project-1048703489700299183.firebasestorage.app",
  messagingSenderId: "343304584663",
  appId: "1:343304584663:web:ff3713777635ee38891f92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans" id="smartresume-firebase-config-workspace">
      {/* Intro section */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm animate-fadeIn">
        <h2 className="text-base font-extrabold text-slate-850 flex items-center text-slate-800">
          <Settings className="text-blue-600 h-5 w-5 mr-2 animate-spin" />
          <span>Firebase SDK 整合中心 (SDK Integrations)</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
          為了在 Netlify 或自訂伺服器上正常運行您的 SmartResume 專案，您可以使用下方由您指定的 Firebase 核心資料（包含 API 金鑰與主網域認證等），直接複製到您的 client 專案主程式或環境變數中使用。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Code snippet output */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Code className="text-blue-600 h-4 w-4" />
              <span>實體整合 SDK JavaScript 程式碼範本</span>
            </h4>
            
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-600 font-bold">已複製！</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>複製程式碼</span>
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 bg-slate-900 border border-slate-950 p-4 rounded-2xl text-[10px] text-slate-300 font-mono leading-relaxed overflow-x-auto select-all max-h-[420px] shadow-inner select-all">
            {snippetCode}
          </pre>
        </div>

        {/* Right side: Security parameters info */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-sm">
          <div className="flex items-center space-x-2 text-blue-600">
            <Cpu className="h-4.5 w-4.5 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider">整合服務驗證屬性 (Verified Attributes)</h3>
          </div>

          <div className="space-y-4 text-xs text-slate-500 font-sans font-semibold">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">專案識別代號 Project ID</span>
              <p className="font-semibold text-slate-700 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-205 border-slate-200 text-center">
                project-1048703489700299183
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">認證授權網域 Auth Domain</span>
              <p className="font-semibold text-slate-700 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-205 border-slate-200 text-center">
                project-1048703489700299183.firebaseapp.com
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">傳送者編號 messagingSenderId</span>
              <p className="font-semibold text-slate-700 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-205 border-slate-200 text-center">
                343304584663
              </p>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl flex items-start space-x-2 text-blue-600 text-[11px] leading-relaxed">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">安全提示 🔐</span>
                <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">
                  本系統採行 Zero-Trust 零信任安全模型：所有敏感性的大語言模型 Gemini 鏈接請求均由 Express 伺服器中介代理，不暴露金鑰。發放電子發票的下載網址也受 Auth 簽章控管。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
