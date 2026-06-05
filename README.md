# 排班好朋友 ☕

一個給咖啡廳排班用的純前端小工具。
每月初向大家收集下個月不可上班的日期後，由排班者在此工具設定、自動排班、手動微調，最後輸出整月班表圖（PNG）。
資料儲存在瀏覽器本機（localStorage），可部署到 GitHub Pages，無需後端與資料庫。

---

## 目錄

- [使用技術](#使用技術)
- [功能總覽](#功能總覽)
- [環境需求與安裝](#環境需求與安裝)
- [網頁使用方式](#網頁使用方式)
- [自動排班邏輯說明](#自動排班邏輯說明)
- [資料儲存與備份](#資料儲存與備份)
- [部署到 GitHub Pages](#部署到-github-pages)
- [維護方法](#維護方法)
- [專案結構](#專案結構)
- [安全性與限制](#安全性與限制)
- [常見問題](#常見問題)

---

## 使用技術

| 類別         | 技術                            | 說明                                   |
| ------------ | ------------------------------- | -------------------------------------- |
| 前端框架     | React 18                        | 以 Hooks + Context 管理狀態            |
| 建置工具     | Vite 5                          | 開發伺服器與打包，輸出純靜態檔         |
| 樣式         | Tailwind CSS 3                  | 自訂配色透過 CSS 變數 + Tailwind theme |
| 圖片匯出     | html-to-image                   | 將班表 DOM 轉成 PNG                    |
| 資料儲存     | localStorage                    | 全部資料存在使用者瀏覽器               |
| 登入         | Web Crypto（SHA-256）           | 純前端密碼雜湊比對                     |
| 國定假日資料 | TaiwanCalendar（jsdelivr CDN）  | 內建 2026，其他年份可線上抓取          |
| 部署         | GitHub Pages + gh-pages（手動） | `npm run deploy` 推到 gh-pages 分支    |

- 不使用任何後端、資料庫或第三方登入服務。
- 不使用 React Router；以 `view`（首頁 / 月份頁）與 `tab`（排班 / 員工 / 班別順序 / 設定 / 說明）狀態切換畫面，方便 GitHub Pages 部署。
- 設計為「單人管理者」工具：資料僅存在操作者的瀏覽器，不跨使用者同步。

---

## 功能總覽

- **登入**：客戶端密碼鎖（首次使用設定密碼）。
- **月份首頁**：以「年」為單位的月份總覽，標示「已建立／未建立」與「本月」，可快速切年、點月份進入編輯；跨度大時比逐月前後切換更好操作。
- **員工設定**：新增 / 編輯 / 刪除員工、選擇正職 / 兼職、顏色選擇器、emoji 頭像。
- **班別排班順序**：5 種班別各自一份優先順序，可加入 / 移除 / 上下移；正職只會出現在白天班。
- **月份管理**：可前後切換月份，各月資料分開儲存。
- **國定假日**：內建 2026 放假日（含補假），排班前提示確認，可線上更新其他年份或手動增刪。
- **特殊日**：整天公休、調整各班別營業時段（關閉或自訂時間）。
- **不可上班**：以「天」為單位點選每位員工當月不可上班的日期，支援全選 / 清除。
- **自動排班**：依規則自動產生整月班表（正職優先白天班並自動鋪休假、兼職時數平均，可切換照順序）。
- **手動微調**：點任一格可指派 / 留空 / 改時間 / 設正職休假，手動格會被鎖定避免被重排覆蓋。
- **警告**：連續上班超過 5 天顯示橘色提醒、找不到人的班別顯示紅色「未排」。
- **時數統整**：側邊即時顯示每人天數與時數（兼職國定假日 ×2，正職不加倍）、正職本月休假天數。
- **班表圖匯出**：預覽並下載整月班表 PNG。
- **使用說明**：內建「說明」分頁，整理操作流程供同仁查閱。
- **頁尾**：版權／聯絡資訊（`Footer` 元件）。
- **資料備份**：整包資料匯出 / 匯入 JSON。

---

## 環境需求與安裝

需要 **Node.js 18 以上**。

```bash
npm install      # 安裝相依套件
npm run dev      # 啟動開發伺服器，瀏覽器開 http://localhost:5173
npm run build    # 打包，產生 dist/ 靜態檔
npm run preview  # 預覽 build 結果
npm run deploy   # 部署到 GitHub Pages（gh-pages 分支）
```

用 VS Code 開啟此資料夾即可編輯。

---

## 網頁使用方式

### 1. 登入

- 第一次開啟會要求**設定一組管理密碼**，輸入兩次後進入。
- 之後每次重新開啟（新的瀏覽器工作階段）需輸入密碼。重新整理頁面則不需重新輸入。
- 密碼可於「設定」分頁變更。

### 2. 月份首頁與導覽

- 登入後會先進入**月份首頁**：以年為單位顯示 12 個月，標示「已建立／未建立」與「本月」，可用左右箭頭切換年份、按「回到今年」。
- 點任一月份即進入該月的編輯畫面，上方有分頁：**排班 / 員工 / 班別順序 / 設定 / 說明**。
- 在編輯畫面**點左上角 logo** 可回到月份首頁；首頁右上也有「說明」「設定」與「登出」。

### 3. 建立員工（員工分頁）

- 按「新增員工」，填名稱（建議單字，如「樂」）、選身分（正職 / 兼職）、顏色與 emoji 頭像。
- 預設已有 7 位員工：樂（正職）、咪、誼、畢、妘、毛、君（兼職），可直接編輯或刪除。

### 4. 設定班別順序（班別順序分頁）

- 5 種班別（平日白天 / 平日晚上 / 假日白天 / 假日中班 / 假日晚上）各有一份順序清單。
- **數字越小越優先**：自動排班會依此順序，嘗試填入第一位「當天可上」的員工。
- **沒被列入清單的員工 = 不排該班別**。正職只能加入白天班（系統會自動限制）。
- 用上 / 下箭頭調整順序、用「加入員工」加入、用 × 移除。

### 5. 排班流程（排班分頁）

建議依序操作：

1. **確認國定假日**：進入某月時系統會自動帶入內建國定假日，上方橫幅提示「前往確認」。打開後可勾選 / 取消、「從網路更新」抓最新、或手動新增（如颱風假），確認後橫幅消失。
2. **設定特殊日**（可選）：點「特殊日」→ 在小月曆選日期 → 設「整天公休」或關閉 / 改某班別時間（例如晚上提早打烊就關掉晚班、平日下午才開門就把白天班改成 13:00–18:30）。
3. **設定不可上班**：點「不可上班」→ 選員工 → 在小月曆點選他不可上班的日期（紅色）。可用「全選 / 清除」加速。
4. **自動排班**：可先在工具列調整「兼職時數平均 / 照順序」與各正職的「月休天數」（預設 8），再按「自動排班」。
5. **手動微調**：點月曆上任一格 → 可改指派的人、留空、改時間、或把某天設為正職休假。手動改過的格子會被鎖定，再按「重新自動排班」也不會被覆蓋（可在格子內「交還自動排班」解鎖）。
6. **檢查警告**：橘框＝該員工連續上班超過 5 天（僅提醒，可接受）；紅色「未排」＝沒人可排，請調整不可上班設定、順序或手動指派。
7. **看時數**：右側「時數統整」即時更新每人天數與時數。

### 6. 匯出班表圖

- 排好後按「匯出班表」→ 預覽（可改標題、選擇是否顯示員工色彩圖例）→「下載 PNG」。
- 時數統整不會放進圖內（依需求設計）。

### 7. 使用說明分頁

- 「說明」分頁整理了上述操作流程，內容可在 `src/pages/HelpPage.jsx` 直接編輯。

---

## 自動排班邏輯說明

自動排班為逐日、由上而下的貪婪式指派：

1. **判斷每天的班別需求**
   - 整天公休 → 不排班。
   - 否則由「週六日 **或** 已確認的國定假日」判定為假日，其餘為平日。
   - 平日需求：白天 1、晚上 1。假日需求：白天 1、中班 1、晚上 1。
   - 特殊日的營業時段調整會關閉或改變某些班別的時間。

2. **正職**
   - 在非休假的上班日，一律優先吃下白天開店班（不排中班 / 晚班）。
   - 月休天數可設（預設 8），系統先平均鋪好休假日；休假日的白天班由其他人遞補。

3. **其餘空格**
   - 依該班別的優先順序，挑選「當天可上、當天尚未被排、在該班別清單內」的員工。
   - **兼職時數平均（預設開啟）**：在可上的人之中，優先給目前累積時數最少者；時數相同則照優先順序。
   - **照順序模式**：嚴格依優先順序填入第一位可上的人。

4. **規則與警告**
   - 一人一天最多一班。
   - 連續上班超過 5 天 → 橘色警告（不阻擋）。
   - 找不到人 → 該格留空並標紅。

5. **時數計算**
   - 班別時數＝起訖時間差（休息已含在內，不另外扣除）。
   - 國定假日當天：兼職時數 ×2，正職不加倍。

> 相關程式集中在 `src/scheduler.js`，要調整規則改這裡即可（見「維護方法」）。

---

## 資料儲存與備份

- 所有資料儲存在瀏覽器 localStorage（鍵名 `cafe_scheduler_data_v1`），**只存在這台電腦的這個瀏覽器**。
- 清除瀏覽器資料、換電腦或換瀏覽器，資料會不見。請定期備份。
- **匯出備份**：設定分頁 →「匯出 JSON 備份」，檔名自動帶月份（如 `班表備份_2026-04.json`）。
- **匯入備份**：設定分頁 →「匯入 JSON 備份」，會覆蓋目前全部資料。
- **跨裝置同步**：用匯出 / 匯入達成——在 A 電腦匯出，到 B 電腦匯入即可。
- **重設**：設定分頁 →「重設為預設值」會清空所有資料並還原預設員工（密碼也會清除），重設前建議先匯出備份。

---

## 部署到 GitHub Pages

本專案使用 **gh-pages 手動部署**（把 build 結果推到 `gh-pages` 分支）。

```bash
npm run build     # 產生 dist/
npm run deploy    # 用 gh-pages 把 dist/ 推到 gh-pages 分支
```

設定步驟：

1. 在 GitHub repo 的 **Settings → Pages → Build and deployment → Source** 選 **Deploy from a branch**，分支選 **gh-pages**、資料夾選 **/(root)**。
2. 執行 `npm run build && npm run deploy`。
3. 網址為 `https://<你的帳號>.github.io/<repo 名稱>/`（目前為 `https://chia-zz.github.io/scheduler-test/`）。

> 注意：不要同時啟用「gh-pages 手動部署」與「GitHub Actions 部署」。Pages 的 Source 只能擇一；兩套並存會讓另一套一直部署失敗（紅叉）。本專案已選 gh-pages，故不放 `.github/workflows`。

### base 路徑要對應 repo 名稱

`vite.config.js` 在 production 時的 `base` 必須等於 repo 名稱：

```js
base: process.env.NODE_ENV === 'production' ? '/scheduler-test/' : '/',
```

若日後 repo 改名，請同步修改這個字串，否則 JS／CSS／圖示會載入失敗（變成空白頁）。

### 圖示與圖片路徑（很重要）

logo 等圖檔放在專案最外層的 `public/` 資料夾。**Vite 會把 `public/` 內容放到網站根目錄**，引用規則：

- **在 `index.html` 裡**（favicon 等）：寫 `href="/yet_logo.png"`，Vite 會自動補上 base → `/scheduler-test/yet_logo.png`。**不要**寫 `/public/...`（會 404）。
- **在 React 元件（JSX）裡**：Vite **不會**自動補 base，寫死 `src="/yet_logo.webp"` 在 production 會 404。請改用 `import.meta.env.BASE_URL`：

  ```jsx
  <img src={`${import.meta.env.BASE_URL}yet_logo.webp`} alt='logo' />
  ```

  `BASE_URL` 在 dev 是 `/`、production 是 `/scheduler-test/`（結尾已含 `/`），兩種環境都正確。

---

## 維護方法

### 常見修改對照表

| 想修改的項目                        | 檔案                                                       | 修改處                                                  |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| 班別預設時間 / 名稱                 | `src/constants.js`                                         | `SHIFT_TYPES`、`DEFAULT_SHIFT_PRESETS`                  |
| 預設員工名單                        | `src/constants.js`                                         | `DEFAULT_EMPLOYEES`                                     |
| 顏色色票 / emoji 選項               | `src/constants.js`                                         | `COLOR_SWATCHES`、`EMOJI_CHOICES`                       |
| 整體配色                            | `src/index.css`（CSS 變數）+ `tailwind.config.js`          | `:root { --c-* }`                                       |
| 排班規則（正職 / 平均 / 警告 / ×2） | `src/scheduler.js`                                         | `runAutoSchedule`、`hoursSummary`、`continuousWarnings` |
| 內建國定假日（新年度）              | `src/holidays.js`                                          | `BUNDLED_HOLIDAYS`                                      |
| 導覽分頁（排班/員工/.../說明）      | `src/components/Header.jsx`                                | `TABS` 陣列                                             |
| 使用說明文字                        | `src/pages/HelpPage.jsx`                                   | 各 `Section` 內容                                       |
| 頁尾版權 / 聯絡方式                 | `src/components/Footer.jsx`                                | `<footer>` 內容                                         |
| 站名 / logo                         | `index.html`、`src/components/Header.jsx`、`HomePage.jsx`  | `<title>`、`public/` 圖檔、`import.meta.env.BASE_URL`   |
| 部署 base（repo 改名時）            | `vite.config.js`                                           | `base: ... '/scheduler-test/'`                          |
| 桌機最大寬度                        | `src/App.jsx`、`src/components/Header.jsx`、`HomePage.jsx` | `max-w-[1400px]` / `max-w-[1100px]`                     |

### 每年更新國定假日

1. 最簡單：在排班分頁「國定假日」彈窗按「**從網路更新**」即可抓取該年度（資料來源為 TaiwanCalendar）。
2. 或在 `src/holidays.js` 的 `BUNDLED_HOLIDAYS` 加上新年度陣列（格式：`{ date: 'YYYY-MM-DD', name: '名稱' }`），作為離線時的內建預設。
3. 任何情況都可在彈窗中「手動新增」臨時假日（如颱風假）。

> 規則：國定假日當天兼職時數 ×2。判定為國定假日的日期會套用假日班別與人力。

### 調整人力需求

平日 / 假日各班別的「需要幾種班」定義在 `src/scheduler.js` 的 `WEEKDAY_SLOT_KEYS` 與 `HOLIDAY_SLOT_KEYS`，每個 key 對應 `SHIFT_TYPES` 的一種班別、各一人。要增減班別需同步調整 `constants.js` 的 `SHIFT_TYPES`、`DEFAULT_SHIFT_PRESETS`，以及預設順序的建立邏輯（`src/storage.js` 的 `buildDefaultData`）。

### 升級相依套件

```bash
npm outdated     # 檢視可更新套件
npm update       # 更新到 package.json 允許的版本範圍
```

更新後務必 `npm run build` 確認可正常建置。

---

## 專案結構

```
scheduler-test/
├─ index.html                 # 入口 HTML，載入字型與 favicon
├─ public/                    # 靜態資源（會被複製到網站根目錄）
│  ├─ yet_logo.png            # favicon
│  ├─ yet_logo.webp           # Header logo
│  └─ yet_logo_white.svg      # 首頁 logo
├─ vite.config.js             # Vite 設定（production base = repo 名稱）
├─ tailwind.config.js         # Tailwind 主題與配色對應
├─ postcss.config.js
├─ package.json               # 含 gh-pages 部署 script
└─ src/
   ├─ main.jsx                # React 進入點
   ├─ App.jsx                 # 登入閘門 + 首頁/月份頁切換（view）+ 分頁（tab）
   ├─ index.css               # 配色 CSS 變數 + Tailwind + 共用樣式
   ├─ constants.js            # 班別、預設員工、色票/emoji、時間工具
   ├─ storage.js              # localStorage 讀寫、預設資料、匯出入、月份工具
   ├─ crypto.js               # SHA-256（登入密碼雜湊）
   ├─ dateutils.js            # 日期 / 月曆（週一起始）工具
   ├─ holidays.js             # 內建國定假日 + 線上抓取
   ├─ scheduler.js            # 排班引擎、時數統整、警告（核心邏輯）
   ├─ context/
   │  └─ AppContext.jsx       # 全域狀態與動作（含自動排班協調）
   ├─ components/
   │  ├─ Icons.jsx            # 內嵌 SVG 圖示
   │  ├─ Avatar.jsx           # 頭像 + Modal（用 Portal 掛到 body）
   │  ├─ Login.jsx            # 登入 / 設定密碼
   │  ├─ HomePage.jsx         # 月份首頁（年/月總覽）
   │  ├─ Header.jsx           # 品牌（點擊回首頁）、月份切換、分頁、登出
   │  ├─ Footer.jsx           # 頁尾（版權 / 聯絡）
   │  ├─ MiniCalendar.jsx     # 可重用小月曆（特殊日 / 不可上班用）
   │  ├─ TimeField.jsx        # 自動補成 HH:MM 的時間輸入
   │  ├─ HolidayModal.jsx     # 國定假日確認
   │  ├─ SpecialDaysModal.jsx # 公休 / 調整營業時段
   │  ├─ AvailabilityModal.jsx# 每人不可上班
   │  ├─ CellEditor.jsx       # 單格手動微調
   │  ├─ ScheduleGrid.jsx     # 月曆班表（可點擊編輯）
   │  ├─ HoursSummary.jsx     # 時數統整側欄
   │  ├─ ExportSheet.jsx      # 匯出用乾淨版面
   │  └─ ExportModal.jsx      # 匯出預覽 + 下載 PNG
   └─ pages/
      ├─ SchedulePage.jsx     # 排班主頁（整合上述功能）
      ├─ HelpPage.jsx         # 使用說明分頁
      ├─ EmployeesPage.jsx    # 員工設定
      ├─ PrioritiesPage.jsx   # 班別排班順序
      └─ SettingsPage.jsx     # 密碼 / 班別時間預設 / 備份 / 重設
```

---

## 安全性與限制

- **登入不是真正的安全機制**：GitHub Pages 是公開的，JS 會被下載，懂技術的人可繞過密碼鎖。它只用來擋住一般人隨手點進來看，**請勿存放高度機密資訊**。
- **資料只在本機瀏覽器**：不跨裝置 / 不跨使用者，請務必定期匯出備份。
- 是設計給「單一排班者」操作的工具，不支援多人同時編輯。

---

## 常見問題

- **時間怎麼打 24:15？** 跨午夜的班別用 24:15 表示（即隔天 00:15）。時間欄位會自動補成 `HH:MM`，輸入 `2415` 會變成 `24:15`。
- **改了不可上班 / 正職休假，班表沒變？** 這些設定要按「重新自動排班」才會重新計算（手動鎖定的格子不會被覆蓋）。
- **某天紅色「未排」？** 代表依目前可上班設定與順序找不到人，請放寬不可上班、調整班別順序，或手動指派。
- **匯出的圖字型看起來和畫面不同？** 若字型嵌入失敗會自動退回系統字型，內容與排版不受影響。
- **部署後 logo 破圖 / 整頁空白？** 多半是路徑沒對應 base：JSX 裡的圖片要用 `import.meta.env.BASE_URL`，且 `vite.config.js` 的 `base` 要等於 repo 名稱（見「部署」章節）。
- **資料不見了？** 多半是清了瀏覽器資料或換了瀏覽器。請從先前匯出的 JSON 匯入還原；平時養成備份習慣。
