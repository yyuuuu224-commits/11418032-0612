import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserInvoice } from "../types";
import { 
  Receipt, 
  Download, 
  Calendar, 
  User as UserIcon, 
  DollarSign, 
  CheckCircle2, 
  Activity, 
  ShieldCheck,
  Building,
  AlertCircle
} from "lucide-react";

interface InvoiceDownloaderProps {
  user: User | null;
}

export default function InvoiceDownloader({ user }: InvoiceDownloaderProps) {
  const [invoices, setInvoices] = useState<UserInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchInvoices() {
      setLoading(true);
      try {
        const invoicesRef = collection(db, "users", user.uid, "invoices");
        const snap = await getDocs(invoicesRef);
        const list: UserInvoice[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as UserInvoice);
        });
        
        // Sort newest first
        list.sort((a,b) => b.date.localeCompare(a.date));
        setInvoices(list);
      } catch (err) {
        console.error("Error retrieving billing data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [user]);

  const handleDownload = (inv: UserInvoice) => {
    // Generate server download URL
    const params = new URLSearchParams({
      id: inv.id,
      amount: inv.amount,
      date: inv.date,
      email: inv.email,
      orderNo: inv.invoiceNo
    });
    
    // Redirect browser to trigger file download stream
    window.open(`/api/invoice/download?${params.toString()}`);
  };

  return (
    <div className="space-y-6 font-sans" id="smartresume-invoice-downloads">
      {/* Top Welcome Title Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>數位電子收據憑證系統啟用中</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 font-sans tracking-tight">
            Premium 電子發票下載專區
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-2xl font-sans font-medium">
            此頁面為受限區域，僅供認證訂閱會員查詢。每次交易開立之電子發票與明細均在此即時生成與查閱。本發票符合中華民國電子發票申報流程，可用作會計憑證申報。
          </p>
        </div>
        <div className="shrink-0 bg-slate-50 px-4 py-2.5 border border-slate-200 rounded-2xl flex items-center space-x-2 text-indigo-650 text-indigo-650 text-indigo-600 font-bold text-xs shadow-sm">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
          <span>會員標籤: SmartResume Pro </span>
        </div>
      </div>

      {loading ? (
        <div className="border border-slate-250 bg-white p-12 rounded-3xl text-center space-y-4 animate-pulse shadow-sm">
          <div className="h-8 w-8 border-t-2 border-l-2 border-indigo-600 border-r-transparent border-b-transparent animate-spin rounded-full mx-auto" />
          <p className="text-xs text-slate-500 font-bold">正在確認會員權限並獲取儲存的電子發票記錄中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="invoices-collection-grid">
          {invoices.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 border border-dashed border-slate-205 border-slate-200 rounded-3xl p-12 text-center space-y-3 bg-slate-50/50">
              <Receipt className="h-10 w-10 text-slate-400 mx-auto animate-pulse" />
              <p className="text-sm text-slate-605 text-slate-600 font-black">本季無購買或扣款發票</p>
              <p className="text-xs text-slate-400 font-bold">若您才剛註冊，系統正在背景為您開立認證測試發票。請稍候重新加載儀表板即可看見明細！</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <div 
                key={inv.id}
                className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all duration-300 group shadow-sm"
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-50 text-indigo-600 border border-slate-200 rounded-lg text-[11px] font-mono font-bold shadow-sm">
                      🧾 {inv.invoiceNo}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                      已開立
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs">
                    <p className="font-extrabold text-slate-800">
                      SmartResume Pro 訂閱計劃 (季度)
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed font-semibold">
                      包含無限次 Gemini-3.5 智慧履歷優化解析、一鍵黃金自薦信、高頻面試分析推薦。
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100" />

                {/* Body Details */}
                <div className="space-y-2 text-[11px] text-slate-500 font-sans font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-slate-400 font-bold">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      開立日期
                    </span>
                    <span className="text-slate-700 font-bold">{inv.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-slate-400 font-bold">
                      <UserIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      買受人電子信箱
                    </span>
                    <span className="text-slate-705 text-slate-700 font-bold truncate w-32 text-right">{inv.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-slate-400 font-bold">
                      <DollarSign className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      總付費金額 (TWD)
                    </span>
                    <span className="text-slate-800 font-sans font-black text-xs">${inv.amount} 元</span>
                  </div>
                </div>

                {/* Footer Action Trigger */}
                <button
                  onClick={() => handleDownload(inv)}
                  className="w-full text-xs font-bold py-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl transition text-slate-700 flex items-center justify-center space-x-1.5 border border-slate-200 hover:border-blue-500 hover:shadow-sm cursor-pointer transition-all duration-300"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500 border-none hover:text-white shrink-0 group-hover:scale-105" />
                  <span>下載電子發票 (HTML)</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tax Note panel */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start space-x-3 text-slate-500 text-xs shadow-inner">
        <AlertCircle className="h-4.5 w-4.5 text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-1 leading-relaxed">
          <p className="font-bold text-slate-800 text-slate-800">統一發票與扣繳事項公告 (Tax Guidance)</p>
          <p className="text-[11px] font-medium leading-relaxed">
            根據中華民國財政部「電子發票實施要點」規定，我們將開立之統一發票雲端上傳。您的電子發票號碼可用於電子交易報稅。本專案為測試示範環境，發票所生之金額與代號僅供智慧系統展現，不具備向國稅局進行財務扣抵之實際效益。
          </p>
        </div>
      </div>
    </div>
  );
}
