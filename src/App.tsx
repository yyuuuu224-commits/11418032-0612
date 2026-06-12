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

  // 2. Real-time sync list of resumes from Firestore for logged in user, with LocalStorage fallback
  useEffect(() => {
    if (!user) return;

    if (user.uid === "demo-user") {
      const cached = localStorage.getItem("local_resumes");
      if (cached) {
        try {
          setResumes(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached resumes:", e);
        }
      } else {
        const initialMock: ResumeDoc[] = [
          {
            id: "res_demo_1",
            userId: "demo-user",
            title: "林大華_技術經理求職履歷_2026.pdf",
            resumeText: "具有多年前端開發及帶領敏捷小組專案經驗...",
            jobTarget: "前端研發技術經理 (Front-end Engineering Manager)",
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            score: 87,
            analysis: {
              score: 87,
              summary: "這是一份結構完整且具備良好管理成效說明的經理級履歷。專案效益呈現清晰，具有吸引力！",
              strengths: [
                "技術栈深度表達明確：React / NestJS / AWS",
                "包含具體的團隊管理實績（如指導 5+ 位工程師）",
                "具體提到了團隊效能改進數據（部署時間縮減 40%）"
              ],
              weaknesses: [
                "對跨部門溝通或者產品規劃層面的描述較少",
                "技能欄位過多，缺乏主要核心亮點的主次引導"
              ],
              optimizationStructure: [
                "增加對於推動敏捷開發流程(Agile/Scrum)以及專案估時準確率提升的例子描述。"
              ],
              optimizationWording: [
                "縮減較偏門的輔助工具清單，專注於雲端架構(AWS)與前端大型專案管理(Monorepo)的核心優勢。"
              ],
              optimizationSkills: [
                "建議將核心框架（如 React）放置於最顯眼的技能卡片位置。"
              ],
              mockQuestions: [
                {
                  question: "當團隊成員對選用技術架構產生分歧時，您通常採取什麼溝通機制來凝聚共識？",
                  type: "溝通與領導力 (Behavioral)",
                  suggestedApproach: "強調資料優先。透過 PoC 實測，並列出利弊矩陣凝聚技術共識。"
                },
                {
                  question: "您能分享一個在預算或時程極度受限下，成功交付專案的最具挑戰性案例嗎？",
                  type: "專案與危機管理 (Project Management)",
                  suggestedApproach: "說明如何透過核心功能範疇劃分(MVP)、敏捷溝通及早暴露風險並保障核心功能上線。"
                }
              ],
              suggestedJobTitles: [
                "前端研發技術經理 (Front-end Tech Lead)",
                "資深前端工程師 (Senior Front-end Engineer)",
                "全端技術專家 (Full-stack Architect)"
              ]
            }
          }
        ];
        setResumes(initialMock);
        localStorage.setItem("local_resumes", JSON.stringify(initialMock));
      }
      return;
    }

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
        // Fallback to local storage
        const cached = localStorage.getItem("local_resumes");
        if (cached) {
          try {
            setResumes(JSON.parse(cached));
          } catch (e) {
            console.error(e);
          }
        }
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

  // 4. Save analysis results to Firestore with local state fallback
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

      if (user.uid === "demo-user") {
        const updated = [newDoc, ...resumes];
        setResumes(updated);
        localStorage.setItem("local_resumes", JSON.stringify(updated));
        return;
      }

      await setDoc(doc(db, "users", user.uid, "resumes", resumeId), newDoc);
    } catch (err) {
      console.error("Error saving resume analysis to Firestore. Saving to local storage instead.", err);
      // Local fallback
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
      const updated = [newDoc, ...resumes];
      setResumes(updated);
      localStorage.setItem("local_resumes", JSON.stringify(updated));
    }
  };

  // 5. Delete specific resume check record from database
  const handleDeleteResume = async (id: string) => {
    if (!user) return;
    if (!window.confirm("確定要刪除這筆履歷健檢分析紀錄嗎？")) return;
    
    try {
      if (user.uid === "demo-user") {
        const updated = resumes.filter(r => r.id !== id);
        setResumes(updated);
        localStorage.setItem("local_resumes", JSON.stringify(updated));
        if (selectedHistory?.id === id) {
          setSelectedHistory(null);
        }
        return;
      }

      await deleteDoc(doc(db, "users", user.uid, "resumes", id));
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
    } catch (err) {
      console.error("Error deleting resume from Firestore. Deleting from local storage instead.", err);
      // Local fallback
      const updated = resumes.filter(r => r.id !== id);
      setResumes(updated);
      localStorage.setItem("local_resumes", JSON.stringify(updated));
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
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
    return <AuthScreen onMockLogin={(mockUser) => {
      setUser(mockUser);
      setAuthChecked(true);
    }} />;
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
