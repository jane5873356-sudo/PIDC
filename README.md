# 久揚塑膠｜塑膠射出零件智慧成本報價系統

專為塑膠射出成型製造業打造的標準化、數據化、可追溯成本報價管理系統。

## 🚀 部署至 GitHub Pages 步驟說明

本專案已完整配置 GitHub Actions 自動化部署工作流程（`.github/workflows/deploy.yml`）與相對路徑支援（`base: './'`），可無縫部署於 GitHub Pages。

### 步驟 1：啟用 GitHub Pages 的 Actions 部署源
1. 前往您的 GitHub 儲存庫（Repository）。
2. 點擊頂部的 **Settings**（設定）。
3. 在左側選單點擊 **Pages**。
4. 在 **Build and deployment** 下方的 **Source** 下拉選單中：
   * 將預設的 `Deploy from a branch` 改選為 **`GitHub Actions`**。

### 步驟 2：推動程式碼至 GitHub
當您將程式碼推送到 `main` 或 `master` 分支時，GitHub Actions 將自動觸發工作流程：
```bash
git add .
git commit -m "feat: 配置 GitHub Actions 部署至 GitHub Pages"
git push origin main
```

### 步驟 3：查看部署進度與存取網站
1. 前往儲存庫的 **Actions** 分頁，即可看到正在執行的 `Deploy to GitHub Pages` 工作。
2. 構建與部署完成後，頁面會顯示綠色勾勾，並附上您的專案網址：
   `https://<你的GitHub帳號>.github.io/<儲存庫名稱>/`
3. 點擊網址即可正常瀏覽與操作整套系統！

---

## 🛠 本地開發與編譯指令

```bash
# 安裝依賴
npm install --legacy-peer-deps

# 啟動本地開發伺服器
npm run dev

# 編譯生產環境靜態檔案 (產出至 dist/ 資料夾)
npm run build

# 本地預覽編譯成果
npm run preview
```

## ✨ 核心功能特色
- **F01 客戶詢價管理**：完整建檔、搜尋、篩選與狀態追蹤。
- **F02 圖面與產品資料**：2D/3D CAD 圖檔管理、公差與外觀要求檢驗。
- **F03 材料成本精準計算**：新料、次料回收比、添加劑、耗損率公式演算。
- **F04 成型成本與機台車隊**：50T~850T 機台時費率、週期與良率產能分攤。
- **F05 換模調機成本分攤**：吊模工資、清料洗管、試模耗料批量均攤。
- **F06 後加工二次製程**：剪料頭、超音波熔接、印刷、組裝、包裝、全檢。
- **F07 毛利定價與階梯矩陣**：目標毛利建議單價、1k~30k 規模經濟報價表。
- **F08 審核與安全門檻**：毛利過低警示、高價工程塑料提醒、主管核價。
- **F09 正式商業報價單輸出**：專業信頭、條款備註、A4 PDF 高解析列印。
- **F10 歷史報價與相似件**：依材質、重量、噸數智慧比對相似歷史案例。
- **F11 預估 vs 實際成本分析**：現場週期、良率、耗料實際差異回饋追蹤。
- **F12 權限與版本歷程**：升版修訂紀錄（V1.0 → V1.1）、變更原因時間軸。
- **PPT 簡報匯出**：一鍵產生與下載微軟 PowerPoint (`.pptx`) 9 頁簡報。
