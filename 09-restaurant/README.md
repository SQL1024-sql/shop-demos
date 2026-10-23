# 炊煙 — 餐廳線上訂位系統（範例作品）

虛構柴火台菜餐廳的訂位網站，有真正的後端與資料庫。

- 客人端 `/`：選人數、日期、時段即時看空位 → 訂位拿到代碼；客滿時段可加入候補；用代碼＋手機查詢、修改、取消；加入行事曆（.ics）
- 店家後台 `/admin/`（Demo 密碼 `demo1234`）：每日訂位清單與狀態（入座／完成／未到／取消）、手動新增電話或現場訂位、桌位時間軸、候補轉訂位、統計圖表、營業時間／公休日／訂位規則／桌位設定、匯出 CSV、重置 Demo 資料
- 自動排桌：挑坐得下的最小空桌、優先客人偏好區域；用 SQLite `BEGIN IMMEDIATE` 防止同時訂到同一桌

技術：FastAPI + SQLite（標準庫 sqlite3），前端純 HTML/CSS/JS，無 build。

## 本機執行

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

開 http://localhost:8000 ；API 文件在 http://localhost:8000/docs 。第一次啟動會自動產生前後一個月的假資料。

測試：`python test_app.py`

## 部署到 Render（免費）

repo 根目錄的 `render.yaml` 已設定好：Render → New → Blueprint → 選這個 repo。
免費方案閒置 15 分鐘會休眠（下次開啟約等 30–60 秒），重新部署或休眠後資料庫會重置成 Demo 資料。

環境變數：`ADMIN_PASSWORD`（不設就是 demo1234，登入頁會顯示提示）、`SECRET_KEY`、`DB_PATH`、`COOKIE_SECURE=1`。
