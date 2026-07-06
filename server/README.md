# Backend cho game phong su

Server nay co 2 nhom API:

- `POST /api/interview-turn`: endpoint moi cho game phong su. Server chay bo luat dieu tra, cap nhat case file, cham diem cau hoi, va neu co `GEMINI_API_KEY` thi viet lai cau tra loi NPC cho tu nhien/da dang hon.
- `POST /api/chat`: endpoint RAG cu. Endpoint nay van dung embedding va retrieval cho luong chat cu.

## Chay server

```bash
cd server
npm install
npm run dev
```

Neu muon NPC tra loi da dang hon bang Gemini, tao file `.env` trong thu muc `server`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Khong co `GEMINI_API_KEY` thi `/api/interview-turn` van hoat dong bang rule engine va tra ve
`usedLLM: false`. Khi co key va goi Gemini thanh cong, response se co tag `server-ai`.

## Chay client

O terminal khac, tai thu muc goc du an:

```bash
npm run dev
```

Vite da proxy `/api` sang `http://localhost:3001`, nen client chi can goi `/api/interview-turn`.
Neu server tat hoac request qua 18 giay, client tu fallback ve engine local de game khong bi dung.

## Embedding/RAG cu

Endpoint `/api/chat` van dung `@xenova/transformers`. Mac dinh server khong warmup embedding khi
khoi dong de game phong su mo nhanh hon. Neu can warmup cho `/api/chat`, them:

```env
WARMUP_KB=true
SIMILARITY_THRESHOLD=0.78
```
