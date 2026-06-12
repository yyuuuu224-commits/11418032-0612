import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the server-side Gemini client.
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SmartResume API server is running." });
  });

  // 2. Resume intelligent analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    const { resumeText, jobTarget } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Missing resumeText" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API Key is not configured in environment variables." });
    }

    const systemPrompt = `你是一位專業的高階科技業與外商獵頭、技術主管及履歷健檢專家。請分析使用者輸入的履歷，並根據他們設定的求職職缺目標提供最具深度、犀利且客觀無比的履歷分析。
你必須給出具體的優化方向並自動生成一組量身打造的模擬面試與精美自薦信。

請以繁體中文 (zh-TW) 回覆所有內容，並嚴格遵循返回的 JSON Schema 結構。`;

    const userPrompt = `履歷文字內容：
"""
${resumeText}
"""

求職目標（選填）："${jobTarget || "未指定特定職缺"}"`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "履歷整體評分 (0-100)" },
              summary: { type: Type.STRING, description: "履歷整體評語與求職機會評估 (繁體中文)" },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 個核心競爭優勢亮點 (繁體中文)"
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 個明顯的弱點、缺憾或改進空間 (繁體中文)"
              },
              optimizationStructure: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "排版、格式、標題結構等層面具體可行的優化動作 (繁體中文)"
              },
              optimizationWording: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "文字精煉、專業術語使用、星級量化成就 (如 STAR 原則) 優化建議 (繁體中文)"
              },
              optimizationSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "建議補強的熱門專業技能、工具或關鍵字標籤 (繁體中文)"
              },
              mockQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "根據此履歷精準設計的面試題目" },
                    type: { type: Type.STRING, description: "題目類型，如：技術問答、情境模擬 (Behavioral)、壓力測試" },
                    suggestedApproach: { type: Type.STRING, description: "破題要點與建議答題思路 (繁體中文)" }
                  },
                  required: ["question", "type", "suggestedApproach"]
                },
                description: "3 個最可能在真實面試中被問到的高頻問題與應對攻略"
              },
              suggestedJobTitles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "此履歷極具競爭力的 3 個黃金職務推薦"
              }
            },
            required: [
              "score", "summary", "strengths", "weaknesses",
              "optimizationStructure", "optimizationWording", "optimizationSkills",
              "mockQuestions", "suggestedJobTitles"
            ]
          }
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText);
      res.json(parsed);

    } catch (err: any) {
      console.error("Gemini Analyze Error:", err);
      res.status(500).json({ error: "履歷智慧分析失敗，請檢查系統配置或重試。", details: err.message });
    }
  });

  // 3. Cover letter generator API
  app.post("/api/cover-letter", async (req, res) => {
    const { resumeText, jobTarget, companyName, tone } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Missing resumeText" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API Key is not configured." });
    }

    const systemPrompt = `你是一位專業的職涯教練與黃金履歷修飾家。請為使用者量身打造一封專業、令人印象深刻且亮點突出的自薦信 (Cover Letter)。
請使用繁體中文 (zh-TW)，語氣需符合要求 (${tone || "專業得體"}).
信件中要自然融合他們履歷的精華優勢，並點出他們能為該目標職位和公司帶來的價值。`;

    const userPrompt = `使用者履歷：
"""
${resumeText}
"""
目標職務: "${jobTarget || "未指定職稱"}"
目標公司: "${companyName || "優質企業"}"
期望語氣: "${tone || "專業得體、自信誠懇"}"`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      res.json({ coverLetter: response.text });
    } catch (err: any) {
      console.error("Gemini Cover Letter Error:", err);
      res.status(500).json({ error: "自薦信生成失敗", details: err.message });
    }
  });

  // 4. Download simulated Invoice API (下載發票)
  app.get("/api/invoice/download", (req, res) => {
    const { id, amount, date, email, orderNo } = req.query;

    const invoiceNo = String(orderNo || "INV-" + Date.now().toString().slice(-6));
    const invoiceDate = String(date || new Date().toISOString().split('T')[0]);
    const buyerEmail = String(email || "premium-user@smartresume.ai");
    const totalAmount = String(amount || "$399");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SmartResume 購買發票與收據</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
        .container { max-width: 650px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 800; color: #1e3a8a; }
        .company-info { text-align: right; font-size: 13px; color: #64748b; }
        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .details h3 { font-size: 14px; color: #64748b; margin-bottom: 5px; }
        .details p { font-size: 15px; font-weight: 500; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #475569; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .total { text-align: right; font-size: 18px; font-weight: 700; color: #1e3a8a; margin-top: 20px; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; border-top: 1px dashed #e2e8f0; padding-top: 20px; }
        @media print {
          body { background: white; padding: 0; }
          .container { border: none; box-shadow: none; maxWidth: 100%; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="title">SmartResume</div>
            <div style="font-size: 14px; color: #3b82f6; font-weight: 600; margin-top: 4px;">智慧履歷分析助手</div>
          </div>
          <div class="company-info">
            <strong>極速未來科技智能股份有限公司</strong><br>
            統一編號: 83294821<br>
            客服信箱: support@smartresume.ai<br>
            台北市信義區信義路五段 7 號 84 樓
          </div>
        </div>

        <div class="details">
          <div>
            <h3>購買客戶資訊 (Buyer)</h3>
            <p>${buyerEmail}</p>
          </div>
          <div style="text-align: right;">
            <h3>發票明細 (Invoice Info)</h3>
            <p><strong>電子發票號碼:</strong> ${invoiceNo}</p>
            <p><strong>開立日期:</strong> ${invoiceDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>項目名稱 (Product Item)</th>
              <th style="text-align: center; width: 60px;">數量</th>
              <th style="text-align: right; width: 120px;">小計</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>SmartResume Pro 訂閱計劃 (季度付費)</strong><br>
                <span style="font-size: 12px; color: #64748b;">解鎖無限次 AI 深度履歷健檢分析、個人優化歷史管理、面試模擬題目、一鍵 Cover Letter 生成。</span>
              </td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">${totalAmount} TWD</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          總金額 (Total amount): ${totalAmount} TWD
        </div>

        <div class="footer">
          感謝您訂閱 SmartResume！本電子發票具合法報帳與記帳憑證效益。<br>
          本交易採用安全加密系統處理。如有疑問，歡迎聯絡客服系統。
        </div>
      </div>
      <script>
        // Auto print trigger for downloads if accessed directly, or users can manually print
      </script>
    </body>
    </html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=Invoice-${invoiceNo}.html`);
    res.send(htmlContent);
  });

  // Vite middleware setup for SPA assets serving or development fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartResume Express server is running on http://localhost:${PORT}`);
  });
}

startServer();
