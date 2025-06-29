# Multi-platform Downloader (Instagram + TikTok + more)

Welcome to the **Multi-platform Downloader** project (Instagram + TikTok + streaming, etc).  
Whether you're a seasoned dev or just here to vibe code on weekends — you're in the right place.

---

## 🔒 Permissions & Rules

- Repo is published under the **MIT License** (see `LICENSE`)  
- Only approved collaborators can push directly to **main**  
- **Never commit `.env` files** – your API keys must stay private  
- All PRs must pass **prettier** + **eslint** check before merge

---

## 🚫 Never Do This

```js
// ❌ BAD
const apiKey = "my-secret-api-key";
```

If you push keys to GitHub:

- Public repos expose them to the entire internet  
- Bots scrape and abuse them in under 5 minutes  
- Your API usage will spike and possibly cost you money  

---

## ✅ Step 1: Install Git & Node.js (first time only)

### Windows (PowerShell)

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

### macOS

Install Homebrew: https://brew.sh  
Then:

```bash
brew install git node
```

---

## ✅ Step 2: Clone the Repo & Run Locally

```bash
git clone https://github.com/tmckee09/instagram-downloader.git
cd instagram-downloader

# Install only a few required deps for API routes
npm install
```

---

## ✅ Step 3: Preview the Static Frontend

This project is mostly pure HTML/JS.

```bash
# Copy/Paste this into Windows Powershell next:
 
npx live-server

```
It will ask you to Confirm, enter 'Y'

Now, you can open your browser and visit:

- `http://127.0.0.1:8080/` – Instagram Downloader  
- `http://127.0.0.1:8080/tiktok/index.html` – TikTok Downloader  

---

## ✅ Step 4: Run Locally With Vercel - (Access for Vercel backend - PM for details if working on backend)

```bash
npm install -g vercel
vercel dev
```

You can now test routes like:
- http://localhost:3000/api/download (Instagram)
- http://localhost:3000/api/download2 (TikTok)

---

## 🔐 Collaborator Access

If you're a new contributor:

- Fork the repo or request write access
- PM on Discord or in #Ctrl-c-Ctrl-v to get:
  - ✅ Vercel Team Access
  - ✅ RapidAPI Credentials
  - ✅ Preview deploy URL(s)

Check Discord or leave a comment in Issues to coordinate feature drops. Ping if you’re confused — I got you.

---

## 📋 Roadmap

- [x] TikTok API integration (via download2.js)
- [x] More Services for growth `/tiktok`, `/Youtube`, `/etc`
- [ ] Different Languages: `/espanol`, `/french`, `/Hindi`
- [ ] Add SEO-optimized long-tail content
- [ ] Light/dark theme toggle with Alpine.js + Tailwind
- [ ] Revision, + pages, + pages, + pages, + SEO

---

## 🧰 Tools Used

| Tool         | Use                                  |
|--------------|---------------------------------------|
| GitHub       | Source control + CI                  |
| Vercel       | Hosting + serverless functions       |
| RapidAPI     | TikTok & Instagram download APIs     |
| Node.js      | Backend logic in `/api`              |
| ChatGPT      | Code pair & assistant                |
| Discord      | Dev team comms (invite only)         |
| Tailwind CSS | Frontend utility classes             |
| Alpine.js    | Lightweight JS interactivity         |

---

## Contributing

Issues & features welcome, make sure to test locally before committing

---

## 📜 License

This project is under the **MIT License**.  
Use it, remix it, sell it, whatever

---




  
