# 🚀 NewsletterAI - Deployment Guide

Kompletny przewodnik konfiguracji i wdrożenia aplikacji NewsletterAI.

---

## 📋 Spis Treści

1. [Wymagania](#wymagania)
2. [Konfiguracja Supabase](#1-konfiguracja-supabase)
3. [Konfiguracja Claude API](#2-konfiguracja-claude-api)
4. [Konfiguracja Stripe](#3-konfiguracja-stripe)
5. [Konfiguracja Resend](#4-konfiguracja-resend)
6. [Zmienne Środowiskowe](#5-zmienne-środowiskowe)
7. [Deployment na Vercel](#6-deployment-na-vercel)
8. [Testowanie](#7-testowanie)

---

## Wymagania

- Node.js 18+
- Konto GitHub
- Konto Supabase (darmowe)
- Konto Anthropic/Claude (API key)
- Konto Stripe (darmowe w test mode)
- Konto Resend (darmowe - 100 emails/day)
- Konto Vercel (darmowe)

---

## 1. Konfiguracja Supabase

### 1.1 Stwórz Projekt

1. Wejdź na https://supabase.com i zaloguj się
2. Kliknij **"New Project"**
3. Wybierz organizację
4. Wypełnij:
   - **Project Name**: `newsletter-ai` (lub dowolna nazwa)
   - **Database Password**: Wygeneruj silne hasło (zapisz je!)
   - **Region**: Wybierz najbliższy (np. Europe West - Frankfurt)
5. Kliknij **"Create new project"**
6. Poczekaj 2-3 minuty na utworzenie projektu

### 1.2 Pobierz Klucze API

1. W panelu Supabase przejdź do **Settings** → **API**
2. Skopiuj i zapisz:
   - **Project URL** (np. `https://xxxxx.supabase.co`)
   - **anon/public key** (długi string zaczynający się od `eyJ...`)

> ⚠️ **WAŻNE**: NIE używaj `service_role` key! Używamy tylko `anon` key.

### 1.3 Stwórz Tabele w Bazie Danych

1. W panelu Supabase przejdź do **SQL Editor**
2. Kliknij **"New Query"**
3. Wklej poniższy SQL i kliknij **"Run"**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER PROFILES
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  plan_tier TEXT DEFAULT 'free',
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT 2,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  newsletter_niche TEXT,
  target_audience TEXT,
  default_tone TEXT DEFAULT 'professional',
  default_length TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEWSLETTERS
CREATE TABLE newsletters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  source_type TEXT,
  source_url TEXT,
  source_content TEXT,
  analysis_data JSONB,
  content_markdown TEXT,
  content_html TEXT,
  selected_subject_line TEXT,
  subject_lines JSONB,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  tone TEXT DEFAULT 'professional',
  length TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTENT IDEAS
CREATE TABLE content_ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  week_number INTEGER,
  suggested_headline TEXT,
  angle TEXT,
  outline TEXT,
  category TEXT,
  urgency TEXT,
  priority_score DECIMAL,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIENCE SEGMENTS
CREATE TABLE audience_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB,
  size_estimate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEWSLETTER ANALYTICS
CREATE TABLE newsletter_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  newsletter_id UUID REFERENCES newsletters(id),
  emails_sent INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  open_rate DECIMAL,
  click_rate DECIMAL,
  esp_name TEXT,
  send_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMPETITORS
CREATE TABLE competitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMPETITOR NEWSLETTERS
CREATE TABLE competitor_newsletters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competitor_id UUID REFERENCES competitors(id) NOT NULL,
  subject_line TEXT,
  content TEXT,
  sent_date TIMESTAMP WITH TIME ZONE,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTENT GAPS
CREATE TABLE content_gaps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  topic TEXT NOT NULL,
  opportunity_type TEXT,
  description TEXT,
  suggested_angle TEXT,
  urgency TEXT,
  priority_score DECIMAL,
  rationale JSONB,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEWSLETTER VARIANTS
CREATE TABLE newsletter_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) NOT NULL,
  segment_id UUID REFERENCES audience_segments(id) NOT NULL,
  subject_line TEXT,
  content TEXT,
  changes_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEST EMAIL LOGS
CREATE TABLE test_email_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resend_email_id TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for newsletters
CREATE POLICY "Users can view own newsletters" ON newsletters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own newsletters" ON newsletters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own newsletters" ON newsletters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own newsletters" ON newsletters
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for content_ideas
CREATE POLICY "Users can view own ideas" ON content_ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON content_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON content_ideas
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for audience_segments
CREATE POLICY "Users can view own segments" ON audience_segments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own segments" ON audience_segments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own segments" ON audience_segments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own segments" ON audience_segments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for newsletter_analytics
CREATE POLICY "Users can view own analytics" ON newsletter_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON newsletter_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for competitors
CREATE POLICY "Users can view own competitors" ON competitors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitors" ON competitors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitors" ON competitors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitors" ON competitors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for competitor_newsletters
CREATE POLICY "Users can view competitor newsletters" ON competitor_newsletters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM competitors
      WHERE competitors.id = competitor_newsletters.competitor_id
      AND competitors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert competitor newsletters" ON competitor_newsletters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitors
      WHERE competitors.id = competitor_newsletters.competitor_id
      AND competitors.user_id = auth.uid()
    )
  );

-- RLS Policies for content_gaps
CREATE POLICY "Users can view own gaps" ON content_gaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gaps" ON content_gaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gaps" ON content_gaps
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for newsletter_variants
CREATE POLICY "Users can view own variants" ON newsletter_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = newsletter_variants.newsletter_id
      AND newsletters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own variants" ON newsletter_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = newsletter_variants.newsletter_id
      AND newsletters.user_id = auth.uid()
    )
  );

-- RLS Policies for test_email_logs
CREATE POLICY "Users can view own test logs" ON test_email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = test_email_logs.newsletter_id
      AND newsletters.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own test logs" ON test_email_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = test_email_logs.newsletter_id
      AND newsletters.user_id = auth.uid()
    )
  );

-- Create trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Jeśli wszystko przeszło poprawnie, zobaczysz **"Success. No rows returned"**

### 1.4 Konfiguracja Auth

1. W panelu Supabase przejdź do **Authentication** → **Providers**
2. Upewnij się, że **Email** jest włączony
3. W **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (zmienisz to później na production URL)
   - **Redirect URLs**: Dodaj:
     - `http://localhost:3000/**`
     - `https://twoja-domena.vercel.app/**` (dodasz później)

---

## 2. Konfiguracja Claude API

### 2.1 Pobierz API Key

1. Wejdź na https://console.anthropic.com
2. Zaloguj się lub utwórz konto
3. Przejdź do **API Keys**
4. Kliknij **"Create Key"**
5. Nazwij klucz: `newsletter-ai`
6. Skopiuj klucz (zaczyna się od `sk-ant-...`)

> ⚠️ **WAŻNE**: Klucz pojawi się tylko raz! Zapisz go bezpiecznie.

### 2.2 Dodaj Credits

1. W https://console.anthropic.com przejdź do **Billing**
2. Dodaj metodę płatności
3. Dodaj kredyty (minimum $5 wystarczy na start)

---

## 3. Konfiguracja Stripe

### 3.1 Utwórz Konto i Produkty

1. Wejdź na https://stripe.com i utwórz konto
2. **Zostań w Test Mode** (przełącznik w lewym górnym rogu)
3. Przejdź do **Products** → **Add Product**

**Produkt 1: Basic Plan**
- Name: `Basic Plan`
- Description: `10 newsletters per month with all features`
- Pricing model: **Recurring**
- Price: `$39.00 USD`
- Billing period: **Monthly**
- Kliknij **Save**
- Skopiuj **Price ID** (zaczyna się od `price_...`)

**Produkt 2: Pro Plan**
- Name: `Pro Plan`
- Description: `Unlimited newsletters with all features`
- Pricing model: **Recurring**
- Price: `$97.00 USD`
- Billing period: **Monthly**
- Kliknij **Save**
- Skopiuj **Price ID**

### 3.2 Pobierz API Keys

1. Przejdź do **Developers** → **API keys**
2. Skopiuj:
   - **Publishable key** (zaczyna się od `pk_test_...`)
   - **Secret key** (kliknij "Reveal test key", zaczyna się od `sk_test_...`)

### 3.3 Zaktualizuj Konfigurację Stripe w Kodzie

1. Otwórz plik `lib/stripe/config.ts`
2. Zamień `price_xxx` na Twoje Price IDs:

```typescript
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [...],
    limits: { newsletters: 2 },
  },
  basic: {
    name: 'Basic',
    price: 39,
    priceId: 'TWÓJ_BASIC_PRICE_ID', // ← Wklej tutaj
    features: [...],
    limits: { newsletters: 10 },
  },
  pro: {
    name: 'Pro',
    price: 97,
    priceId: 'TWÓJ_PRO_PRICE_ID', // ← Wklej tutaj
    features: [...],
    limits: { newsletters: -1 },
  },
}
```

### 3.4 Webhook Configuration (zrobisz po deploymencie)

Wrócisz do tego w kroku 6.

---

## 4. Konfiguracja Resend

### 4.1 Utwórz Konto

1. Wejdź na https://resend.com
2. Zaloguj się przez GitHub
3. Kliknij **"Create API Key"**
4. Name: `newsletter-ai`
5. Permission: **Sending access**
6. Skopiuj API key (zaczyna się od `re_...`)

> 💡 **Free tier**: 100 emails/day, 3,000/month - wystarczy do testów!

### 4.2 (Opcjonalnie) Dodaj Własną Domenę

Jeśli chcesz wysyłać z własnej domeny:
1. W Resend przejdź do **Domains** → **Add Domain**
2. Dodaj swoją domenę
3. Skonfiguruj DNS records (Resend pokaże instrukcje)

> ℹ️ Dla testów możesz używać domeny Resend: `onboarding@resend.dev`

---

## 5. Zmienne Środowiskowe

### 5.1 Plik `.env.local` (Development)

1. W głównym folderze projektu stwórz plik `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Dostaniesz po konfiguracji webhooka

# Resend
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Zastąp wszystkie wartości swoimi kluczami

### 5.2 Weryfikacja

Uruchom lokalnie:

```bash
npm install
npm run dev
```

Otwórz http://localhost:3000 i sprawdź czy:
- ✅ Strona się ładuje
- ✅ Możesz się zarejestrować
- ✅ Dashboard się wyświetla

---

## 6. Deployment na Vercel

### 6.1 Połącz Repozytorium

1. Wejdź na https://vercel.com
2. Zaloguj się przez GitHub
3. Kliknij **"Add New..."** → **"Project"**
4. Wybierz repo: `newsletter-dmsites-sigma`
5. Kliknij **"Import"**

### 6.2 Skonfiguruj Projekt

**Framework Preset**: Next.js (auto-detect)
**Root Directory**: `./`
**Build Command**: `npm run build`
**Output Directory**: `.next`

### 6.3 Dodaj Environment Variables

W sekcji **Environment Variables** dodaj WSZYSTKIE zmienne z `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
ANTHROPIC_API_KEY = sk-ant-api03-...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_SECRET_KEY = sk_test_...
RESEND_API_KEY = re_...
NEXT_PUBLIC_APP_URL = https://TWOJA-DOMENA.vercel.app
```

> ⚠️ **Uwaga**: Zostaw `STRIPE_WEBHOOK_SECRET` pustą na razie!

### 6.4 Deploy

1. Kliknij **"Deploy"**
2. Poczekaj ~2-3 minuty
3. Po zakończeniu kliknij **"Visit"**
4. Skopiuj URL (np. `https://newsletter-ai-abc123.vercel.app`)

### 6.5 Zaktualizuj Supabase URL Configuration

1. Wróć do Supabase → **Authentication** → **URL Configuration**
2. Zaktualizuj:
   - **Site URL**: `https://TWOJA-DOMENA.vercel.app`
   - **Redirect URLs**: Dodaj `https://TWOJA-DOMENA.vercel.app/**`

### 6.6 Skonfiguruj Stripe Webhook

1. W Stripe przejdź do **Developers** → **Webhooks**
2. Kliknij **"Add endpoint"**
3. Endpoint URL: `https://TWOJA-DOMENA.vercel.app/api/webhooks/stripe`
4. Wybierz events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Kliknij **"Add endpoint"**
6. Skopiuj **Signing secret** (zaczyna się od `whsec_...`)
7. W Vercel → **Settings** → **Environment Variables**:
   - Dodaj `STRIPE_WEBHOOK_SECRET` = `whsec_...`
8. W Vercel kliknij **"Redeploy"** (żeby wczytać nową zmienną)

---

## 7. Testowanie

### 7.1 Test Flow Rejestracji

1. Otwórz https://TWOJA-DOMENA.vercel.app
2. Kliknij **"Start Free"**
3. Zarejestruj się z email + hasło
4. Sprawdź email (Supabase wysyła konfirmację)
5. Kliknij link aktywacyjny
6. Powinieneś być zalogowany na Dashboard

### 7.2 Test Content Studio

1. Przejdź do **Content Studio**
2. Wybierz **YouTube**
3. Wklej link: `https://www.youtube.com/watch?v=dQw4w9WgxcQ`
4. Wybierz tone i length
5. Kliknij **Import** → Powinno przejść do analizy
6. Kliknij **Generate Newsletter** → AI powinno wygenerować newsletter
7. W edytorze przetestuj:
   - ✅ Edycję w Tiptap
   - ✅ Generowanie subject lines
   - ✅ Wysłanie test email (na swój email)

### 7.3 Test Ideas Generation

1. Przejdź do **Ideas & Calendar**
2. Kliknij **"Generate 52 Ideas"**
3. Wypełnij formularz
4. Kliknij **Generate**
5. Po ~30-60s powinno przekierować do listy 52 pomysłów

### 7.4 Test Analytics

1. Przejdź do **Analytics**
2. Kliknij **"Add Stats"**
3. Wypełnij przykładowe dane
4. Kliknij **Save**
5. Wróć do Analytics → Powinny być statystyki
6. Kliknij **"AI Insights"** → AI powinno wygenerować insights
7. Kliknij **"Predictions"** → AI powinno przewidzieć wydajność

### 7.5 Test Stripe Payment (Test Mode)

1. Przejdź do **Pricing**
2. Wybierz **Basic** lub **Pro**
3. Kliknij **"Get Started"**
4. Użyj test card: `4242 4242 4242 4242`
   - Expiry: dowolna przyszła data (np. 12/34)
   - CVC: dowolne 3 cyfry (np. 123)
   - ZIP: dowolny (np. 12345)
5. Kliknij **Subscribe**
6. Powinno przekierować z powrotem
7. Sprawdź w Settings → Plan powinien się zaktualizować

### 7.6 Test Personalization

1. Stwórz segment: **Personalization** → **Manage Segments**
2. Stwórz newsletter
3. Przejdź do **Personalization** → **Generate Variants**
4. Wybierz newsletter
5. Kliknij **Generate** → AI powinno stworzyć warianty

### 7.7 Test Competitors

1. **Competitors** → **Add Competitor**
2. Dodaj konkurenta
3. **Analysis** → wybierz konkurenta → **Analyze**
4. **Content Gaps** → **Find Content Gaps**

---

## 🎉 Gotowe!

Twoja aplikacja jest teraz live i gotowa do testów zespołowych!

### 📌 Ważne Linki

- **App**: https://TWOJA-DOMENA.vercel.app
- **Supabase Dashboard**: https://app.supabase.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Anthropic Console**: https://console.anthropic.com
- **Resend Dashboard**: https://resend.com/emails
- **Vercel Dashboard**: https://vercel.com/dashboard

### 🔐 Bezpieczeństwo

- ✅ Wszystkie klucze API są w environment variables
- ✅ Row Level Security włączony w Supabase
- ✅ Stripe w test mode
- ✅ Rate limiting przez Vercel
- ✅ HTTPS enforced

### 💡 Wskazówki

**Limity Free Tier:**
- Claude API: Pay-as-you-go (~$3-5 per 100 newsletterów)
- Supabase: 500MB database, 2GB bandwidth
- Vercel: 100GB bandwidth
- Resend: 100 emails/day, 3,000/month
- Stripe: Unlimited w test mode, 0% fees

**Monitorowanie Kosztów:**
- Claude: Sprawdzaj w https://console.anthropic.com/settings/cost
- Vercel: Sprawdzaj w Settings → Usage
- Supabase: Database → Reports

**Gdy Gotowy na Production:**
1. Stripe: Przełącz na Live Mode, zaktualizuj keys
2. Resend: Dodaj własną domenę
3. Supabase: Rozważ upgrade jeśli > 500MB
4. Vercel: Rozważ Pro jeśli > 100GB bandwidth

---

## 🆘 Troubleshooting

**Problem: "Invalid API key" w Claude**
- ✅ Sprawdź czy klucz zaczyna się od `sk-ant-api03-`
- ✅ Sprawdź czy masz credyty w Anthropic Console
- ✅ Sprawdź czy zmienna `ANTHROPIC_API_KEY` jest ustawiona w Vercel

**Problem: "Authentication error" w Supabase**
- ✅ Sprawdź czy używasz `anon` key, nie `service_role`
- ✅ Sprawdź czy Redirect URLs są poprawne
- ✅ Sprawdź czy RLS policies są utworzone

**Problem: "Stripe webhook failed"**
- ✅ Sprawdź czy endpoint URL jest poprawny
- ✅ Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest ustawiony
- ✅ Sprawdź logs w Stripe → Developers → Webhooks → Twój webhook

**Problem: Build failed na Vercel**
- ✅ Sprawdź Build Logs w Vercel
- ✅ Upewnij się że wszystkie env variables są ustawione
- ✅ Sprawdź czy `npm run build` działa lokalnie

**Inne problemy:**
- Sprawdź Vercel Logs: Vercel → Deployments → Twój deployment → Runtime Logs
- Sprawdź Supabase Logs: Supabase → Logs Explorer
- Sprawdź Browser Console: F12 → Console

---

## 📞 Kontakt

Jeśli masz problemy z konfiguracją, prześlij:
1. Screenshot błędu
2. Vercel Runtime Logs
3. Browser Console errors
4. Kroki które wykonałeś

Powodzenia! 🚀
