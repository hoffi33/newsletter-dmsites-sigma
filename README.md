# NewsletterAI - AI Newsletter Operating System

**Complete AI-powered platform for newsletter creators with 5 integrated modules.**

## 🚀 Features

### 📝 Module 1: Content Studio
- **Import** from YouTube, podcasts, blogs, or text
- **AI Analysis** extracts key insights, topics, and quotes
- **Generate** newsletters with customizable tone, length, and structure
- **Edit** with markdown editor
- **Subject Lines** AI-powered generation
- **Export** to HTML or Markdown

### 💡 Module 2: Ideas & Calendar
- **Generate** 52 weeks of content ideas instantly
- **Smart Prioritization** based on trends and urgency
- **Content Calendar** with scheduling
- **Google Trends** integration (planned)

### 🎯 Module 3: Personalization
- **Audience Segments** create and manage
- **Variant Generation** personalized versions for different segments
- **A/B Testing** predictions (planned)

### 📊 Module 4: Performance Analytics
- **Manual Stats Input** from your ESP
- **Auto-calculated Metrics** (open rate, click rate)
- **AI Insights** performance optimization (planned)
- **Predictions** newsletter performance forecasting (planned)

### 🔍 Module 5: Competitor Intelligence
- **Monitor Competitors** track their newsletters
- **AI Analysis** strategies and patterns (planned)
- **Content Gaps** find opportunities (planned)
- **Automated Alerts** (planned)

## 💰 Pricing

- **Free**: $0/mo - 2 newsletters/month
- **Basic**: $39/mo - 10 newsletters/month, all modules
- **Pro**: $97/mo - Unlimited, full features

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Transcription**: YouTube Transcript API
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

## 📦 Installation

```bash
# Clone repository
git clone <your-repo>
cd newsletterai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# OpenAI (optional - for Whisper)
OPENAI_API_KEY=your_openai_api_key

# Resend (for test emails)
RESEND_API_KEY=your_resend_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run the SQL schema from the plan (creates all tables)

3. Enable Row Level Security (RLS) policies:

```sql
-- Example RLS policy for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Repeat for all tables...
```

4. Configure Auth providers in Supabase dashboard

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

```bash
# Or deploy via CLI
vercel --prod
```

### Post-Deployment

1. **Setup Stripe Webhooks**:
   - Add webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Listen to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

2. **Test Auth Flow**:
   - Register new account
   - Login/Logout
   - Check profile creation in Supabase

3. **Test Newsletter Creation**:
   - Import content
   - Generate newsletter
   - Export HTML/Markdown

## 📝 Development Workflow

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 🧪 Testing Checklist

- [ ] Auth (Login, Register, Logout)
- [ ] Content Studio (Import → Analyze → Generate → Edit)
- [ ] Ideas Generation
- [ ] Personalization (Segments)
- [ ] Analytics (Stats Input)
- [ ] Competitors (Add Competitor)
- [ ] Billing (Stripe Checkout, Webhooks)
- [ ] All protected routes redirect to login

## 📊 Project Structure

```
newsletterai/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── (dashboard)/     # All modules
│   ├── api/             # API routes
│   ├── pricing/         # Pricing page
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn components
│   ├── auth/            # Auth forms
│   ├── layout/          # Sidebar, Navbar
│   └── [modules]/       # Module components
├── lib/
│   ├── ai/              # Claude integration
│   ├── content/         # YouTube, scraper
│   ├── stripe/          # Stripe config
│   ├── supabase/        # Supabase clients
│   └── utils/           # Utilities
└── types/               # TypeScript types
```

## 🤝 Contributing

This is a private project. Contact the maintainer for access.

## 📄 License

Proprietary - All rights reserved

## 🔗 Links

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Anthropic Claude](https://docs.anthropic.com)
- [Stripe Docs](https://stripe.com/docs)

---

**Built with ❤️ using Next.js, TypeScript, and Claude AI**
