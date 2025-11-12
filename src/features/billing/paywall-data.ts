export type PaywallPlan = {
  id: string;
  title: string;
  price: string;
  caption: string;
  perks: string[];
};

export const paywallPlans: PaywallPlan[] = [
  {
    id: 'pro_monthly',
    title: 'Pro Monthly',
    price: '$14.99 / month',
    caption: 'Best for teams validating premium demand.',
    perks: [
      'Unlimited projects & real-time sync',
      'Premium AI completions & automations',
      'Priority support with incident SLAs',
    ],
  },
  {
    id: 'pro_yearly',
    title: 'Pro Yearly',
    price: '$149 / year',
    caption: 'Two months free with an annual commitment.',
    perks: [
      'All Pro Monthly features',
      'Advanced analytics exports',
      'Roadmap co-design sessions',
    ],
  },
];

