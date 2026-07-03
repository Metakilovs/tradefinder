# TradeFinder — Setup & Deployment Guide

A real, working location-based marketplace connecting clients with tradespeople (plumbers,
electricians, carpenters, etc.) — built Uber-style, black & white, fully responsive.

**Stack:** React (Vite) + Node.js/Express + MongoDB + Leaflet/OpenStreetMap (live GPS map, no API key needed).

---

## 1. What's inside

```
tradefinder-web/
  backend/        <- Node.js/Express API + MongoDB models
  frontend/       <- React app (the actual UI)
```

---

## 2. Run it on your own laptop first

### Step A — Install Node.js
Download and install from https://nodejs.org (choose the LTS version). Confirm it worked:
```
node -v
npm -v
```

### Step B — Get a free MongoDB database (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free "M0" cluster (any region close to you, e.g. Frankfurt or Cape Town).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, click "Add IP Address" → "Allow Access From Anywhere" (0.0.0.0/0) — fine for a school project.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://yourusername:[email protected]/?retryWrites=true&w=majority
   ```

### Step C — Configure and start the backend
```
cd tradefinder-web/backend
npm install
```
Copy `.env.example` to a new file called `.env`, then paste in your real MongoDB connection
string and a random secret:
```
MONGO_URI=mongodb+srv://yourusername:[email protected]/tradefinder?retryWrites=true&w=majority
JWT_SECRET=any-long-random-string-here
PORT=5000
```
Then run:
```
npm run dev
```
You should see `MongoDB connected successfully` and `TradeFinder API running on port 5000`.

### Step D — Start the frontend
Open a **second** terminal window (leave the backend running):
```
cd tradefinder-web/frontend
npm install
npm run dev
```
Open the link it gives you (usually `http://localhost:5173`). Your browser will ask for
location permission — click **Allow** so the map can center on you.

### Step E — Try it end to end
1. Click **Sign up** → choose **"I offer a service"** → create a tradesperson account (e.g. a Plumber).
2. Go to **Edit profile** → click **Share my current location** → save the profile.
3. Open an incognito window (so you're logged out) → sign up again as **"I need help"** (a client).
4. Go to **Find a tradesperson** — you'll see the plumber pinned on the live map. Click **Request**.
5. Log back in as the tradesperson → go to **My jobs** → **Accept** the request → **Mark completed**.
6. Log back in as the client → leave a star rating.

That's the full real flow: signup, geolocation, live map, booking request, accept/decline, completion, rating — all backed by a real database.

---

## 3. Putting it live (so your lecturer can open a real link)

You need three pieces deployed: the database (already live on Atlas), the backend API, and the frontend.

### Deploy the backend — Render.com (free)
1. Push the `tradefinder-web` folder to a GitHub repository.
2. Go to https://render.com → sign up with GitHub.
3. Click **New** → **Web Service** → pick your repo.
4. Set **Root Directory** to `backend`.
5. Build command: `npm install` — Start command: `npm start`.
6. Under **Environment**, add `MONGO_URI` and `JWT_SECRET` with the same values from your `.env`.
7. Deploy. You'll get a live URL like `https://tradefinder-api.onrender.com`.

### Deploy the frontend — Vercel (free)
1. Go to https://vercel.com → sign up with GitHub → **Add New Project** → pick your repo.
2. Set **Root Directory** to `frontend`.
3. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://tradefinder-api.onrender.com/api
   ```
   (use your real Render URL from above, keep the `/api` at the end)
4. Deploy. Vercel gives you a live link like `https://tradefinder.vercel.app` — this is the
   link you show your lecturer.

**Note:** Render's free tier sleeps after inactivity — the first request after a while takes
10–20 seconds to "wake up." Open the link yourself 2–3 minutes before your presentation so it's
already warm.

---

## 4. Adding/changing images
Tradespeople photos are just a URL pasted into **Edit profile → Photo URL** — upload any image
to a free host like https://imgur.com, copy the direct image link, paste it in. No code changes
needed. To change the favicon or any static image, drop files into `frontend/public/` and
reference them as `/yourfile.png`.

## 5. Where to make the most common edits
- **Colors/theme:** `frontend/src/index.css` — all colors are CSS variables at the top.
- **Trades list (Plumber, Electrician...):** appears in `Home.jsx`, `Signup.jsx`, `Browse.jsx`, `EditProfile.jsx` — search for "Plumber" to find all four.
- **Text on the homepage:** `frontend/src/pages/Home.jsx`.
- **API logic (what data is saved/returned):** `backend/routes/`.

## 6. Presenting to your lecturer
Good things to point out:
- Real GPS-based matching (not hardcoded) via the browser's Geolocation API + MongoDB
  geospatial queries (`2dsphere` index, `$near`).
- Role-based accounts (client vs tradesperson) with JWT authentication and hashed passwords.
- Full booking lifecycle: pending → accepted/declined → completed → rated.
- Fully responsive — resize the browser or open on your phone to show it adapts.
