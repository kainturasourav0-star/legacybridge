# LegacyBridge — Hackathon Live Demo Script (3 Minutes to Win)
**Team Aspirations | HackIIITD 2026**  
*Tagline: "Describe the task. Keep the old system."*

---

## 🎯 Pitch Narrative & Timing Breakdown

### **0:00 – 0:35 | The Real-World Pain Point & Hook**
- **Action**: Switch to browser tab showing **Acme Inventory & Supply Chain Suite v4.2** (`http://localhost:8080`).
- **Speaker**:  
  > *"Judges, enterprises run on software built in 2004. Look at Acme Inventory: nested frame menus, mandatory workstation logon, and when our operations manager reaches the Q3 Regional Sales report... the CSV export button is disabled. A human must spend 2 hours every morning manually transcribing these numbers into Slack and spreadsheets.*  
  > *Replacing this ERP would cost millions and take 3 years. Instead, we built **LegacyBridge**: describe what you want in plain English, and our autonomous agent navigates the old system, validates every row, and delivers the data as a clean API feed."*

---

### **0:35 – 1:15 | The Task Builder & Pydantic Invariants**
- **Action**: Switch to LegacyBridge (`http://localhost:3000`). Click **"Task Builder"**. Click **"Load Acme ERP Demo Preset"**.
- **Speaker**:  
  > *"In Task Builder, I provide the plain-English task: 'Open the inventory portal, retrieve Q3 sales by region, and send the results to our operations Slack channel.'*  
  > *Notice our first Trust Pillar: **VALIDATE**. Unlike naive web scrapers, LegacyBridge synthesizes a strict Pydantic v2 schema. A run is never marked successful until every row matches expected types, zero unexpected nulls exist, and historical revenue drift is checked."*
- **Action**: Click **"Save & Run Task Immediately"**.

---

### **1:15 – 1:55 | The Live Run Console & WOW Moment (Breaking the UI)**
- **Action**: The UI immediately transitions to `/runs/[id]`. The step timeline advances:
  `Task received` ➔ `Goal prepared` ➔ `Cloud browser session spawned` ➔ `Workstation credentials injected` ➔ `Reports menu expanded` ➔ `Pagination clicked`.
- **Speaker**:  
  > *"Here is the Live Run Console. In production, TinyFish spawns a secure cloud browser in real time. Notice the live replay link here.*  
  > *Now for the ultimate test: What happens when IT reorganizes this ancient legacy site?*  
  > *In the demo portal, we click **'Break the UI'**! CSS IDs are randomized, button classes mutate, menus move to the bottom of the tree. Traditional scrapers crash immediately. But because TinyFish uses semantic visual LLM navigation, the agent adapts effortlessly and extracts all 5 rows across both pages!"*

---

### **1:55 – 2:30 | Results Explorer & Slack Delivery Receipt**
- **Action**: Click **"Explore Extracted Results"** (`/runs/[id]/results`). Show the clean Data Grid Table with all 5 regions (North America, Europe West, Asia Pacific, Latin America, Middle East) totaling **$404,950.00**.
- **Speaker**:  
  > *"The validation engine confirms a 100% Trust Score. We can toggle between the Data Grid and formatted JSON, download an RFC-4180 CSV, or view the automatic delivery receipt dispatched straight to `#ops-reports`."*

---

### **2:30 – 3:00 | The Hero Feature: Instant API-ification & ROI**
- **Action**: Open new tab to `http://localhost:3000/api/feeds/task-q3-sales-acme/latest`.
- **Speaker**:  
  > *"And here is our enterprise hero feature: **Instant API-ification**.*  
  > *By querying `/api/feeds/{task_id}/latest`, that 20-year-old, CSV-less legacy portal is now a live, secure REST API that any modern microservice or mobile app can consume.*  
  > *Looking at our Operations Dashboard: across our pilot runs, we've saved **320 manual hours** and over **$12,300** in operational costs.*  
  > *Describe the task. Keep the old system. Thank you!"*

---

## 🛡️ Offline / Network Failure Contingency Plan
1. **Wi-Fi Down at Hackathon**:  
   - Both LegacyBridge and Acme ERP run 100% locally on localhost (`:3000` and `:8080`).
   - `DEMO_MODE=true` is enabled by default in `.env`, using deterministic TinyFish execution fixtures and realistic timing delays. Zero reliance on external network connections!
2. **Real Mode Demo Option**:  
   - If judges request live external execution, set `DEMO_MODE=false` and provide `TINYFISH_API_KEY` in `.env`.
