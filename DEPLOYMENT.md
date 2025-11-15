# NewsletterAI - Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Supabase Setup

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Save project URL and API keys

2. **Run Database Schema**
   - Go to SQL Editor in Supabase Dashboard
   - Copy and run the complete SQL schema from the plan
   - Verify all tables are created

3. **Configure Auth**
   - Enable Email provider in Authentication settings
   - Configure email templates (optional)
   - Set site URL: `https://your-domain.com`
   - Add redirect URLs

4. **Setup Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
   ALTER TABLE content_analyses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
   ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
   ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;
   ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own data"
     ON user_profiles FOR SELECT
     USING (auth.uid() = id);

   CREATE POLICY "Users can update own data"
     ON user_profiles FOR UPDATE
     USING (auth.uid() = id);

   -- Repeat for each table with user_id column
   CREATE POLICY "Users can access own content"
     ON content_sources FOR ALL
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can access own newsletters"
     ON newsletters FOR ALL
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can access own ideas"
     ON content_ideas FOR ALL
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can access own segments"
     ON audience_segments FOR ALL
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can access own analytics"
     ON newsletter_analytics FOR ALL
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can access own competitors"
     ON competitors FOR ALL
     USING (auth.uid() = user_id);

   -- Content analyses accessed through content_sources
   CREATE POLICY "Users can access analyses"
     ON content_analyses FOR ALL
     USING (
       EXISTS (
         SELECT 1 FROM content_sources
         WHERE content_sources.id = content_analyses.content_source_id
         AND content_sources.user_id = auth.uid()
       )
     );
   ```

### 2. API Keys Setup

1. **Anthropic Claude**
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Create API key
   - Add to environment variables

2. **Stripe**
   - Create account at [stripe.com](https://stripe.com)
   - Get API keys from Dashboard
   - Create products and prices
   - Note price IDs for Basic and Pro plans
   - Add to environment variables

3. **OpenAI (Optional)**
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Create API key for Whisper transcription
   - Add to environment variables

4. **Resend (Optional)**
   - Sign up at [resend.com](https://resend.com)
   - Create API key for test emails
   - Add to environment variables

### 3. Stripe Product Setup

1. **Create Products**
   - Go to Stripe Dashboard → Products
   - Create "Basic Plan" - $39/month recurring
   - Create "Pro Plan" - $97/month recurring

2. **Copy Price IDs**
   - Each product has a price ID (starts with `price_`)
   - Add to environment variables:
     - `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID`
     - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`

## 📦 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Add Environment Variables

In Vercel Project Settings → Environment Variables, add ALL variables from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=  (leave empty for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Deploy

Click "Deploy" and wait for build to complete.

## 🔧 Post-Deployment Setup

### 1. Configure Stripe Webhooks

1. Get your deployment URL (e.g., `https://your-app.vercel.app`)

2. In Stripe Dashboard → Developers → Webhooks:
   - Click "Add endpoint"
   - Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Listen to events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click "Add endpoint"

3. Copy the webhook signing secret (starts with `whsec_`)

4. Add to Vercel environment variables:
   - Variable: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxx`

5. Redeploy to apply the new variable

### 2. Update Supabase URLs

1. In Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### 3. Test End-to-End

1. **Auth Flow**
   - Register new account
   - Check email confirmation (if enabled)
   - Login
   - Logout

2. **Content Studio**
   - Import content (YouTube/text)
   - Verify AI analysis works
   - Generate newsletter
   - Edit and export

3. **Billing**
   - Go to /pricing
   - Click upgrade to Basic
   - Complete Stripe checkout
   - Verify webhook updates user plan in database

## 🐛 Troubleshooting

### Build Errors

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Error: "Environment variable not defined"**
- Check all variables are added in Vercel dashboard
- Redeploy after adding variables

### Runtime Errors

**Supabase connection errors**
- Verify URL and keys are correct
- Check RLS policies are set up
- Ensure auth.users table exists

**Stripe webhook not working**
- Verify webhook secret is correct
- Check endpoint URL is correct
- Test webhook in Stripe dashboard

**AI errors**
- Verify Anthropic API key is valid
- Check API quota/limits
- Ensure Claude model ID is correct

## 📊 Monitoring

### Vercel Analytics

1. Enable Analytics in Vercel dashboard
2. Monitor:
   - Page views
   - API response times
   - Error rates

### Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Monitor:
   - Database queries
   - Auth events
   - Realtime connections

### Stripe Dashboard

1. Monitor:
   - Successful payments
   - Failed payments
   - Webhook deliveries

## 🔒 Security Checklist

- [ ] All RLS policies enabled
- [ ] Environment variables secured
- [ ] Stripe webhook secret configured
- [ ] CORS configured correctly
- [ ] Rate limiting implemented (optional)
- [ ] Error messages don't leak sensitive data

## 🚀 Performance Optimization

### Enable Edge Functions (Optional)

```typescript
// app/api/your-route/route.ts
export const runtime = 'edge'
```

### Enable Image Optimization

Already configured in `next.config.ts`

### Enable Caching

```typescript
// app/api/your-route/route.ts
export const revalidate = 3600 // Cache for 1 hour
```

## 📈 Scaling

### Database

- Monitor query performance in Supabase
- Add indexes as needed
- Consider upgrading Supabase plan for more connections

### API Limits

- Monitor Anthropic API usage
- Implement rate limiting for AI endpoints
- Consider caching AI responses

### Vercel

- Monitor bandwidth and function execution time
- Upgrade plan if needed
- Consider serverless function regions

## ✅ Launch Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] Stripe webhooks working
- [ ] Auth flow tested
- [ ] Newsletter creation tested
- [ ] Billing tested
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring setup
- [ ] Analytics enabled

## 🎉 You're Live!

Your NewsletterAI platform is now deployed and ready for users!

**Next Steps:**
1. Test all features end-to-end
2. Invite beta users
3. Monitor for errors
4. Collect feedback
5. Iterate and improve

---

**Need help?** Check the main README.md for additional documentation.
