# Phong su API deploy

Game `phong_su` now talks to a serverless API endpoint instead of a separate long-running backend server.

## Runtime flow

- Frontend calls `VITE_INTERVIEW_API_URL` when it is set.
- If not set, frontend calls `/api/interview-turn`.
- `api/interview-turn.js` runs the investigation engine, updates game state, then asks Gemini to rewrite the NPC reply when `GEMINI_API_KEY` exists.
- If Gemini is not configured or fails, the endpoint still returns a rule-based answer so the game remains playable.

## Vercel-style deploy

1. Deploy the project root.
2. Set environment variables on the hosting platform:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` optional, default is `gemini-2.5-flash`
3. Keep `VITE_INTERVIEW_API_URL` unset when the frontend and `api/` folder are deployed together.

## Static host plus separate API

If the frontend is hosted separately from the API, deploy `api/interview-turn.js` as a serverless function, then set:

```text
VITE_INTERVIEW_API_URL=https://your-api-domain.example/api/interview-turn
```

Do not put `GEMINI_API_KEY` in frontend code or any `VITE_` variable. Browser-visible variables are public.
