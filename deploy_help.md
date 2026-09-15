# 🚀 Udyam – Vercel Deployment Guide

This guide provides step-by-step instructions specifically for deploying **Udyam** on [Vercel](https://vercel.com).

---

## 📁 Project Architecture Overview

Udyam is built using pure **HTML5, CSS3, and Vanilla JavaScript** with zero backend or build dependencies. It deploys instantly as a fast, globally-distributed static site.

The project also includes an optional Flask server (`app.py`) for local hosting and
clean page URLs. The existing `.html` URLs remain available for compatibility.

The deployed frontend sends AI video analysis requests to
`https://ai-sport-coach-1.onrender.com`. When the app is opened through the local
Flask server on `localhost` or `127.0.0.1`, requests remain relative and use that
local server instead.

The Render backend is deployed with Docker so the MediaPipe/OpenCV runtime
libraries are installed consistently in production.

```text
Udyam/
│
├── index.html          # Landing Page & App Entry Point
├── dashboard.html      # Personal Athletic Dashboard
├── ai-coach.html       # AI Sports Coaching Arena
├── workout.html        # Daily Exercise Guide & Routine Generator
├── nutrition.html      # AI Nutrition & Macro Assistant
├── challenges.html     # Gamification, Badges & Rewards
├── profile.html        # Athlete Biometrics & Onboarding
│
├── css/
│   └── style.css       # Unified Design System & Responsive Tokens
│
├── js/
│   └── script.js       # Core Engine (LocalStorage, Camera HUD, Generators)
│
├── vercel.json         # Optional Vercel Routing Configuration
├── app.py              # Flask page server
├── ai_coach_api.py     # Flask adapter for AI-Sports-Coach APIs
├── requirements.txt    # Flask dependency
└── deploy_help.md      # This Deployment Guide
```

## 🐍 Run with Flask

From the `Udyam` directory:

```bash
python -m pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000/` in a browser. The following clean URLs are
available: `/`, `/dashboard`, `/ai-coach`, `/workout`, `/nutrition`,
`/challenges`, and `/profile`. The `/health` endpoint can be used for a
basic server health check.

Use the Flask URL for `ai-coach.html`; do not open the HTML file directly from
File Explorer or with a static-only live server, because the AI analysis
request must reach Flask:

```text
http://127.0.0.1:5000/ai-coach
```

The AI Coach page sends uploaded videos to the existing AI-Sports-Coach logic
through these Flask endpoints:

- `POST /api/upload-video`
- `POST /api/analyze/badminton`
- `POST /api/analyze/football`
- `POST /api/analyze/athletics`
- `POST /api/analyze/basketball`
- `GET /api/history/<user_id>`
- `GET /api/history/<user_id>/<sport>`
- `GET /api/progress/<user_id>/<sport>`

---

## ⚡ Method 1: Deploy via GitHub (Recommended)

This is the easiest and best method because every `git push` will automatically build and update your live website.

### Step 1: Initialize Git and Push to GitHub

1. Open your terminal / PowerShell in your project folder (`c:\Users\HP\OneDrive\Desktop\BeUdyam`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Udyam web application"
   ```

2. Create a new repository on [GitHub.com](https://github.com/new) (e.g., named `Udyam` or `Udyam-sports`).

3. Link your local project to GitHub and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Udyam.git
   git push -u origin main
   ```

---

### Step 2: Import & Deploy on Vercel

1. Log in to [Vercel](https://vercel.com) (sign up with your GitHub account).
2. Click **"Add New..."** &rarr; **"Project"**.
3. Under **Import Git Repository**, find your `Udyam` repository and click **Import**.
4. Configure Project Settings:
   - **Project Name**: `Udyam` (or your preferred subdomain)
   - **Framework Preset**: Select **Other** (or leave as detected static)
   - **Root Directory**: `./` (default)
   - **Build Command**: *Leave blank*
   - **Output Directory**: *Leave blank*
5. Click **"Deploy"**.

Your website will be live in **less than 10 seconds** at a URL like:
`https://Udyam-yourname.vercel.app`

---

## 💻 Method 2: Deploy via Vercel CLI (Direct from Terminal)

If you don't want to use GitHub, you can deploy directly from your command line in 1 minute.

### Step 1: Install Vercel CLI
Run in terminal / PowerShell:
```bash
npm install -g vercel
```

### Step 2: Log in to Vercel
```bash
vercel login
```
*(Follow the prompt in your browser to authenticate).*

### Step 3: Deploy
Run inside the project root (`c:\Users\HP\OneDrive\Desktop\BeUdyam`):
```bash
vercel
```
When prompted:
- **Set up and deploy?** &rarr; `Y`
- **Which scope?** &rarr; Select your personal account
- **Link to existing project?** &rarr; `N`
- **What's your project's name?** &rarr; `Udyam`
- **In which directory is your code located?** &rarr; `./`
- **Want to modify settings?** &rarr; `N`

To deploy directly to production:
```bash
vercel --prod
```

---

## 🌐 Custom Domain Setup (Optional)

To connect your own domain (e.g., `Udyam.com` or `yourname.Udyam`):

1. In your Vercel Dashboard, go to your project &rarr; **Settings** &rarr; **Domains**.
2. Type your domain name and click **Add**.
3. Add the DNS records (A Record or CNAME) shown by Vercel to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
4. Vercel will automatically provision free, auto-renewing **SSL / HTTPS certificates**.

---

## 🔍 Pre-Deployment Verification Checklist

Before publishing, verify:
- [x] All 7 HTML pages load with correct paths (`css/style.css` and `js/script.js`).
- [x] Navigation links between all pages are relative (`index.html`, `dashboard.html`, `ai-coach.html`, `workout.html`, `nutrition.html`, `challenges.html`, `profile.html`).
- [x] Font Awesome CDN and Google Fonts load correctly over HTTPS.
- [x] LocalStorage works smoothly across subpages.

---

## 🛠️ Troubleshooting & Tips

| Issue | Solution |
| :--- | :--- |
| **Styles/Scripts not loading** | Ensure all links use relative paths (`css/style.css` instead of `/css/style.css` or `../css/style.css`). |
| **Clean URLs (without `.html`)** | Add the optional `vercel.json` included in your project root with `"cleanUrls": true`. |
| **Updates not reflecting** | For GitHub deployments, just run `git push`. For CLI, run `vercel --prod`. |
