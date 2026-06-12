import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, setDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { ResumeAnalysis, ResumeDoc } from "./types";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import CoverLetterGenerator from "./components/CoverLetterGenerator";
import InvoiceDownloader from "./components/InvoiceDownloader";
import FirebaseConfigView from "./components/FirebaseConfigView";
import AuthScreen from "./components/AuthScreen";

import { Cpu, Loader } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [resumes, setResumes] = useState<ResumeDoc[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<ResumeDoc | null>(null);

  // 1. Subscribe to Firebase Authentication state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      if (!currentUser) {
        setResumes([]);
        setSelectedHistory(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time sync list of resumes from Firestore for logged in user
  useEffect(() => {
    if (!user) return;

    const pathStr = `users/${user.uid}/resumes`;
    const colRef = collection(db, "users", user.uid, "resumes");
    const q = query(colRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ResumeDoc[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as ResumeDoc);
        });
        setResumes(list);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. User logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // 4. Save analysis results to Firestore
  const handleSaveResume = async (title: string, resumeText: string, jobTarget: string, analysis: ResumeAnalysis) => {
    if (!user) return;
    try {
      const resumeId = "res_" + Date.now();
      const newDoc: ResumeDoc = {
        id: resumeId,
        userId: user.uid,
        title,
        resumeText,
        jobTarget,
        createdAt: new Date().toISOString(),
        score: analysis.score,
        analysis
      };

      await setDoc(doc(db, "users", user.uid, "resumes", resumeId), newDoc);
    } catch (err) {
      console.error("Error saving resume analysis:", err);
    }
  };

  // 5. Delete specific resume check record from database
  const handleDeleteResume = async (id: string) => {
    if (!user) return;
    if (!window.confirm("確定要刪除這筆履歷健檢分析紀錄嗎？")) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "resumes", id));
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
    }
  };

  // Render initial loading spinner during auth boot verification
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4" id="smartresume-spinner">
        <div className="relative">
          <div className="h-12 w-12 border-t-2 border-l-2 border-blue-600 border-r-transparent border-b-transparent animate-spin rounded-full" />
          <Cpu className="h-6 w-6 text-blue-600 absolute top-3 left-3 animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 animate-pulse tracking-wide font-sans font-semibold">
          安全加密認證載入中 SmartResume...
        </p>
      </div>
    );
  }

  // Render registration & login if user is unauthenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Renders Main Content Section based on selected Sidebar tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Dashboard
            resumes={resumes}
            onSelectResume={(r) => {
              setSelectedHistory(r);
              setActiveTab("analyzer");
            }}
            onDeleteResume={handleDeleteResume}
            onNavigateToAnalyze={() => {
              setSelectedHistory(null);
              setActiveTab("analyzer");
            }}
          />
        );
      case "analyzer":
        return (
          <ResumeAnalyzer
            user={user}
            onSaveResume={handleSaveResume}
            selectedResumeDetail={selectedHistory}
            setSelectedResumeDetail={setSelectedHistory}
          />
        );
      case "coverletter":
        return <CoverLetterGenerator user={user} resumes={resumes} />;
      case "invoices":
        return <InvoiceDownloader user={user} />;
      case "config":
        return <FirebaseConfigView />;
      default:
        return <div className="text-slate-400 text-sm">頁面建置中（開發階段）...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans" id="smartresume-app-container">
      {/* Sidebar - left */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Auto clear preview model if tab is shifted to default analyzer
          if (tab === "analyzer" && !selectedHistory) {
            setSelectedHistory(null);
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Core View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar - top */}
        <Navbar user={user} activeTab={activeTab} />

        {/* Content Wrapper - main body scrollable */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
