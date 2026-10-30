# Doctor Tracker — Web app

Next.js 16 client for the Doctor Tracker API. Setup, architecture, technical decisions and screenshots are in the [project README](../README.md).

```bash
npm install
cp .env.example .env.local   # set NEXTAUTH_SECRET
npm run dev                  # http://localhost:3000 (the API must be running on :5000)
```

| Script | |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
