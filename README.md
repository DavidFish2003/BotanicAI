# 🌿 BotanicAI - Botanical Pharmacology & Phytochemistry Search Engine

**BotanicAI (v1.3)** is an AI-powered search engine and literature mining platform designed to aggregate, extract, and categorize scientific research on botanical pharmacology, phytochemistry, and bioactive plant extracts.

---

## 🚀 What's New in Version 1.3

- **Full Mobile Responsiveness & Multi-Device Scaling**: Complete fluid design system adaptation for smartphones, tablets, laptops, and desktop displays.
- **Fluid Typography & Adaptive Touch Targets**: CSS `clamp()` typography and input field sizing (`16px` touch minimum) preventing unwanted iOS browser zooming.
- **Robust API URL Sanitization**: Auto-formatting and endpoint resolution for cloud backend hosting URLs (`VITE_API_URL`) on Netlify.
- **6-Database Literature Aggregator**: Concurrent async literature mining across PubMed, OpenAlex, Europe PMC, Semantic Scholar, Crossref, and bioRxiv/medRxiv.

---

## ✨ Features

- 🔬 **6-Database Literature Mining**: Asynchronously searches PubMed, OpenAlex, Europe PMC, Semantic Scholar, Crossref, and bioRxiv/medRxiv.
- 🧪 **Structured Phytochemistry**: Extracts active compounds (*quercetin, rosmarinic acid, curcumin*), extract types, and pharmacological mechanisms.
- 🧬 **PubChem Chemical Data & 2D Structures**: Automatically enriches top extracted bioactive compounds with molecular formulas, molecular weight, IUPAC names, and 2D chemical structure renders.
- 🌱 **Tissue-Specific Grouping**: Categorizes evidence into interactive PlantCards grouped by plant part (*leaves, roots, bark, seeds, flowers, rhizomes, whole plant*).
- ⚡ **LLM & NLP Extraction Pipeline**: Utilizes OpenAI GPT-4o-mini when an API key is available, falling back to a robust NLP heuristic parser.
- 💎 **Modern UI / UX**: Dark mode interface with glassmorphism, fluid animations, dynamic search filtering, and responsive evidence modals.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, HTTPX (Async HTTP), Pydantic v2, Uvicorn
- **Frontend**: React 19, TypeScript, Vite 8, Lucide Icons, Vanilla CSS Design Tokens
- **External Data APIs**: PubMed E-utilities, OpenAlex, Europe PMC, Semantic Scholar, Crossref, bioRxiv (Europe PMC PPR), PubChem REST API

---

## 💻 Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate # On Windows
pip install -r requirements.txt
python main.py
```

*Backend runs at http://localhost:8000*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

*Frontend runs at http://localhost:5173*

---

## 🌐 Deploying to Netlify & Cloud Backend

BotanicAI consists of a **FastAPI backend** (Python) and a **Vite React frontend**.

When deploying the frontend to Netlify (`https://usebotanicai.netlify.app`), the frontend needs to connect to a running backend instance:

### Step 1: Deploy Backend (Render / Railway / Fly.io)
Deploy the `backend/` directory to a cloud provider such as [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io):
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set Environment Variables:
  - `OPENAI_API_KEY` (Optional for GPT extraction)
  - `CORS_ORIGINS` = `https://usebotanicai.netlify.app`

### Step 2: Configure Netlify Environment Variable
In your Netlify site dashboard:
1. Go to **Site configuration** -> **Environment variables**
2. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-service.onrender.com` (your live backend URL)
3. Trigger a **Re-deploy** of your Netlify site.

---

## 📄 License

MIT License. Developed for botanical pharmacology and phytochemical research.
