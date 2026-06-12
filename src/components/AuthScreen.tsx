import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth, googleProvider, setupUserProfile } from "../lib/firebase";
import { 
  Cpu, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  UserPlus, 
  LogIn
} from "lucide-react";

interface AuthScreenProps {
  onMockLogin?: (user: any) => void;
}

export default function AuthScreen({ onMockLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("請完整填寫信箱與密碼！");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("為了安全，密碼必須大於 6 位數！");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        try {
          // Register new account
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          // Setup Firestore user entry
          await setupUserProfile(cred.user.uid, email, displayName || email.split("@")[0]);
        } catch (signUpErr: any) {
          if (signUpErr?.code === "auth/email-already-in-use") {
            // Email is already in use, attempt seamless dynamic login!
            const logInCred = await signInWithEmailAndPassword(auth, email, password);
            // Ensure profile/invoices setup if database sync didn't run before
            await setupUserProfile(logInCred.user.uid, email, displayName || email.split("@")[0]);
          } else {
            throw signUpErr;
          }
        }
      } else {
        // Log in
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/user-not-found") {
        setErrorMsg("信箱尚未註冊，請切換至「立即註冊」建立專屬帳戶。");
      } else if (err.code === "auth/wrong-password") {
        setErrorMsg(
          isSignUp 
            ? "此電子信箱已被註冊使用。密碼不符合已有帳密，請輸入正確密碼並切換至「帳戶登入」。"
            : "密碼錯誤，請重新確認。"
        );
      } else if (err.code === "auth/email-already-in-use") {
        setErrorMsg("此電子信箱已被註冊使用，請切換至「帳戶登入」並使用該信箱直接登入。");
      } else if (err.code === "auth/operation-not-allowed") {
        setErrorMsg("系統尚未在 Firebase 主控台啟用「電子郵件與密碼」登入方式。請至 Firebase 控制台「Authentication > Sign-in method」開啟它，或者直接點擊下方的「使用 Google 帳號註冊 / 登入」按鈕，即可立即完成存取並進入儀表板！");
      } else {
        setErrorMsg(err.message || "登入服務發生非預期錯誤，請重新再試。");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Auto register/upgrade user trace in database
      await setupUserProfile(result.user.uid, result.user.email || "", result.user.displayName || "Google 使用者");
    } catch (err: any) {
      console.error("Google popup error:", err);
      if (err.code === "auth/popup-blocked") {
        setErrorMsg("登入視窗被瀏覽器封鎖，請允許快顯視窗再試。");
      } else {
        setErrorMsg("Google 登入失敗，請確認連接狀態。");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = () => {
    if (onMockLogin) {
      onMockLogin({
        uid: "demo-user",
        email: "demo@smartresume.io",
        displayName: "極速體驗訪客",
        emailVerified: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-6 font-sans relative" id="smartresume-auth-screen">
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 relative z-10 shadow-lg animate-fadeIn">
        {/* Brand center header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md shadow-blue-500/10">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-wider font-sans">
              SmartResume
            </h1>
            <p className="text-xs text-slate-500 font-sans font-semibold">
              智慧卓越履歷健檢與面試分析助手
            </p>
          </div>
        </div>

        {/* Action Toggle Tab */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              !isSignUp ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            帳戶登入
          </button>
          <button
            onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              isSignUp ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            立即註冊
          </button>
        </div>

        {/* Display System Errors */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-start space-x-1.5 animate-bounce shadow-sm">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-600" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Quick Demo Login Option */}
        <div className="bg-blue-50/60 border border-blue-150 p-4 rounded-2xl text-center space-y-2">
          <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
            ⚡ <b>極速體驗通道：</b>若 Firebase 登入遭遇限制，可一鍵以訪客身份進入系統，解鎖 100% 完整功能！
          </p>
          <button
            type="button"
            onClick={handleMockLogin}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse fill-amber-300" />
            <span>訪客一鍵登入（免註冊極速體驗）</span>
          </button>
        </div>

        {/* Login/Signup Forms */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs text-slate-505 text-slate-500 font-bold">您的姓名 / 暱稱 (Name)</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="如：陳阿明"
                  className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-sans shadow-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-slate-505 text-slate-500 font-bold font-sans">電子郵件信箱 (Email)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-sans shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-505 text-slate-500 font-bold font-sans">安全性密碼 (Password)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入至少 6 位密碼"
                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-sans shadow-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 bg-blue-600 hover:from-blue-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl transition-all duration-350 shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            <span>{isSignUp ? "建立新帳戶" : "安全快速登入"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between py-1.5 shrink-0 select-none">
          <div className="h-[1px] bg-slate-100 w-full" />
          <span className="text-[10px] text-slate-400 font-extrabold px-3 shrink-0">或使用社交帳號登入</span>
          <div className="h-[1px] bg-slate-100 w-full" />
        </div>

        {/* Google Authentication Trigger */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
        >
          {/* Flat Google vector icon */}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.13-4.53z"
            />
          </svg>
          <span>使用 Google 帳號註冊 / 登入</span>
        </button>
      </div>
    </div>
  );
}
