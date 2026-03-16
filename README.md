# 💼 InternshipHub

## Flow
1. User apna **Name + Email** daalta hai → Dashboard khulta hai
2. Plans page pe **Razorpay se payment** karta hai (10-11 AM IST only)
3. Payment ke baad **invoice real email pe** jaata hai
4. Dashboard pe internships **apply** karta hai (plan limit ke hisaab se)

## Plans
| Plan   | Price       | Applications/Month |
|--------|-------------|-------------------|
| Free   | ₹0          | 1                 |
| Bronze | ₹100/month  | 3                 |
| Silver | ₹300/month  | 5                 |
| Gold   | ₹1000/month | Unlimited         |

## Setup

### Backend
```bash
cd backend
npm install
# .env file banao (copy from .env.example)
npm run dev
```

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
EMAIL_USER=tumhari@gmail.com
EMAIL_PASS=gmail_app_password
FRONTEND_URL=http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Razorpay Test Setup
1. razorpay.com pe account banao
2. Settings → API Keys → Test Keys generate karo
3. Key ID aur Secret `.env` mein daalo
4. Test card: `4111 1111 1111 1111` / any future date / any CVV

## Deploy
- Backend → Render (`npm start`, sab env variables daalo)
- Frontend → Vercel (`NEXT_PUBLIC_API_URL` = Render URL)
