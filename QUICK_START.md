# ⚡ Quick Start - Supabase Setup

## 1️⃣ Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- New Project → Name: `mimio` → Create

## 2️⃣ Run SQL Script
- Open **SQL Editor** in Supabase dashboard
- Copy all code from: `supabase/migrations/001_complete_setup.sql`
- Paste and click **Run**
- ✅ Done! (Creates tables, security, and 12 sample templates)

## 3️⃣ Get Your Keys
- Go to **Settings** → **API**
- Copy:
  - Project URL
  - `anon` key (NOT service_role)

## 4️⃣ Add Environment Variables
Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 5️⃣ Restart Dev Server
```bash
npm run dev
```

## ✅ That's It!

Your database is ready with:
- ✅ Authentication (email/password, OAuth ready)
- ✅ Projects table
- ✅ Videos table  
- ✅ 12 viral ad templates
- ✅ Row-level security
- ✅ TypeScript types

---

📖 For detailed instructions, see: `SUPABASE_SETUP_GUIDE.md`

