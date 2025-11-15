export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '2 newsletters per month',
      'Content Studio access',
      'Basic ideas generation',
      'Email support',
    ],
    limits: {
      newsletters: 2,
      ideas: 10,
      segments: 1,
    },
  },
  BASIC: {
    name: 'Basic',
    price: 39,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
    features: [
      '10 newsletters per month',
      'All modules access',
      '52-week idea generation',
      'Up to 3 segments',
      'Analytics tracking',
      'Priority support',
    ],
    limits: {
      newsletters: 10,
      ideas: 52,
      segments: 3,
    },
  },
  PRO: {
    name: 'Pro',
    price: 97,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited newsletters',
      'All modules access',
      'Unlimited ideas',
      'Unlimited segments',
      'Competitor intelligence',
      'AI insights & predictions',
      'Priority support',
      'Custom integrations',
    ],
    limits: {
      newsletters: -1, // unlimited
      ideas: -1,
      segments: -1,
    },
  },
}

export type PlanTier = 'free' | 'basic' | 'pro'
