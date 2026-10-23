# Digital Heroes

Golf-score draw platform with charity contributions. React (Vite) client + Express/MongoDB API, deployed as two Vercel projects.

```
digital-heroes/
├── client/   React 19 + Vite + Tailwind 4 + Zustand
└── server/   Express 5 + Mongoose + Stripe + Cloudinary
```

## Run locally

```bash
# API
cd server
cp .env.example .env        # fill in values, set NODE_ENV=development
npm install
npm run seed                # optional: creates admin user + sample charities (WIPES users & charities)
npm run dev                 # http://localhost:5000  (health: /api/health)

# Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
Check `git status` first: no `.env` file should be listed (they are git-ignored; only `.env.example` is committed).

### 2. MongoDB Atlas
Network Access > Add IP Address > **Allow access from anywhere (0.0.0.0/0)**. Vercel uses changing IPs.

### 3. Backend on Vercel
New Project > import the repo > **Root Directory: `server`** > Framework: Other. Add these Environment Variables, then deploy:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` (on Vercel the app behaves as production regardless) |
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | your frontend URL, e.g. `https://digital-heroes.vercel.app` (add after step 4, then redeploy) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | from Stripe |
| `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY` | Stripe Price IDs (`price_...`); a Product ID (`prod_...`) also works if that product has an active recurring price |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | from Cloudinary |

Test: open `https://<backend>.vercel.app/api/health`. It shows `db` (connected or the error type), the CORS origins in effect, the cookie mode, and whether Stripe prices are set.

### 4. Frontend on Vercel
New Project > same repo > **Root Directory: `client`** > Framework: Vite. Add:

No environment variables are required. Production builds call `/api` on the same domain, and `client/vercel.json` proxies it to the backend, so login cookies are first-party and never blocked. **Edit `client/vercel.json` and make sure the backend URL in the first rewrite is yours.** (To skip the proxy, set `VITE_API_DIRECT_URL=https://<backend>.vercel.app/api` and expect cross-site cookie limits.)

Deploy, then put the frontend URL into the backend's `CLIENT_URL` and **redeploy the backend**. Vite variables are baked in at build time, so changing `VITE_API_URL` also needs a redeploy.

### 5. Stripe webhook
Stripe Dashboard > Developers > Webhooks > Add endpoint:
`https://<backend>.vercel.app/api/payments/webhook`, events `checkout.session.completed` and `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy the backend.

### 6. Create the admin user and charities
Run once from your machine with production `MONGO_URI` in `server/.env`: `npm run seed` (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` first). This deletes all existing users and charities, so don't run it again on live data. To add only the sample charities without deleting anything, run `npm run seed:charities` (does nothing if charities already exist).

## Troubleshooting
- **500 FUNCTION_INVOCATION_FAILED**: open Vercel > Deployment > Logs. Usually a missing env variable.
- **503 "Database unavailable"**: wrong `MONGO_URI` or Atlas Network Access not open.
- **Login works but next request is 401**: browsers block third-party cookies in some settings (notably Safari). The most reliable fix is to serve both apps from one domain, e.g. a custom domain with `app.example.com` and `api.example.com` (same site), or proxy `/api` from the client with a Vercel rewrite.
- **CORS error**: `CLIENT_URL` on the backend must exactly match the frontend origin.
