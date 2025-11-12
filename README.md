# ExpoShip SaaS Boilerplate

ExpoShip is an Expo Router SaaS starter that pairs [HeroUI Native](https://github.com/heroui-inc/heroui-native) with production-ready building blocks for authentication, billing, realtime data, and delightful user experiences.

## Get started

1. Clone the repository

   ```bash
   git clone https://github.com/heroui-inc/heroui-native-example.git
   cd heroui-native-example
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```

4. (Optional) Clean git history for a fresh start

   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit"
   ```

You can start developing by editing the files inside the **src/app** directory. This project uses file-based routing with Expo Router.

## Authentication & Security

ExpoShip ships with Supabase Auth (email/password & OAuth), secure session storage (Expo SecureStore plus in-memory caching), and fully themed auth flows. To enable them:

1. Create a Supabase project and copy the **Project URL** and **anon key** from **Project Settings → API**.
2. Add the following environment variables (via `app.json` → `expo.extra` or `EXPO_PUBLIC_*` vars):

   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - (Optional) `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
   - (Optional) `EXPO_PUBLIC_APPLE_SERVICE_ID`

3. Ensure the Expo scheme matches the deep link used for OAuth callbacks (defaults to `expoship`). Update `app.json` if you change it.
4. Run the database bootstrap script at `supabase/migrations/0001_bootstrap.sql` in the Supabase SQL editor or via the CLI (`supabase db execute --file supabase/migrations/0001_bootstrap.sql`). It creates the `profiles` table with RLS policies and the auth trigger for automatic profile rows, provisions the `billing_metrics_summary` table used by the Settings dashboard, and configures a public storage bucket with upload policies.
   - In the SQL editor, choose the **Service Role** connection before executing so the storage policies can be created. If you see a notice about insufficient privileges, finish the run, then open Supabase **Storage → public → Policies** and add read/upload/update/delete policies manually following the comments in the script.
5. Confirm that your Supabase project now shows a row in `billing_metrics_summary` (ID `1`) and a `public` storage bucket. You can customise column defaults or RLS rules by editing the same script and re-running it.

The auth stack is wired through `src/features/auth/` with a provider that powers the Settings profile editor and the `/ (auth)/*` routes. Password resets and OAuth callbacks land on the in-app `auth/callback` route before routing to the password update flow.

## Payments & Monetization

RevenueCat and Stripe are wired into a unified billing context (`src/features/billing/`). Follow these steps to go live:

1. **RevenueCat subscriptions**

   - In the RevenueCat dashboard create products for `pro_monthly` and `pro_yearly` (or update the identifiers to match your catalog).
   - Grab your public SDK API key and set `EXPO_PUBLIC_REVENUECAT_API_KEY`.
   - Define the entitlement ID you want to treat as premium with `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` (defaults to `pro`).
   - The billing provider automatically syncs the active entitlement to the Supabase `profiles.billing_plan` column.

2. **Stripe one-time payments**

   - Set `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your publishable key.
   - Implement a backend endpoint (Supabase Edge Function, server, or Cloudflare Worker) that creates a Payment Intent and returns the Payment Sheet parameters (`customerId`, `customerEphemeralKeySecret`, `paymentIntentClientSecret`). Wire that response into `BillingProvider.startOneTimePurchase`.
   - The Expo config already declares the `@stripe/stripe-react-native` plugin with a `merchantIdentifier`. Update it to match your Apple Merchant ID.

3. **Analytics**

   - The paywall screen fires analytics via `supabase.functions.invoke('billing-analytics', ...)`. Deploy an Edge Function with that name to update the `billing_metrics_summary` table (seeded by the bootstrap SQL) and power the metrics card shown in Settings.

## Data & Integrations

- **Realtime**: `useRealtimeSubscription` (`src/features/data/realtime.ts`) wraps Supabase channels for quick table listeners. Settings > Billing metrics auto-refresh using this helper.
- **Uploads**: `pickAndUploadImage` (`src/features/media/upload.ts`) chains Expo ImagePicker + ImageManipulator with Supabase Storage uploads (compressed JPEG & public URL helper).
- **AI**: `createChatCompletion` (`src/features/ai/client.ts`) abstracts OpenAI chat completions. Set `EXPO_PUBLIC_OPEN_AI_API_KEY` and optional `EXPO_PUBLIC_OPEN_AI_BASE_URL` to power the developer prompt gadget in Settings.
- **Storage**: `src/lib/storage.ts` centralises lightweight in-memory storage with optional web persistence for cached profile data and feature flags.
- **Transactional email**: `sendTransactionalEmail` (`src/features/notifications/email.ts`) targets a Supabase Edge Function named `send-transactional-email`. You can forward the payload to Resend, Postmark, or another ESP.

## User Experience & Engagement

- **Theme sessioning**: App theme remembers the current palette during the session and can be extended for persistent storage if needed.
- **Motion & haptics**: Home feature cards use Moti animations, while key actions trigger Expo Haptics feedback.
- **Toasts**: `ToastProvider` wraps the app, giving access to `useToast()` for non-blocking feedback.
- **Push notifications**: Settings → Developer includes registration and test actions via Expo Notifications (`EXPO_PROJECT_ID` required for EAS push tokens).
- **Onboarding tour**: First-time users are redirected to `/(onboarding)` until `profiles.onboarding_completed` is set. You can reopen the tour from Settings.

## Get a fresh project

When you're ready to start with a clean slate, run:

```bash
npm run reset-project
```

This command will move the current **src** directory to **app-example-src** and create a new **src/app** directory with basic HeroUI Native setup where you can start developing.

## About HeroUI Native

HeroUI Native is a comprehensive UI library built for React Native that provides:

- Beautiful, accessible components out of the box
- Consistent design system
- TypeScript support
- Customizable theming
- Modern styling with NativeWind/Tailwind CSS

Learn more about HeroUI Native at: https://github.com/heroui-inc/heroui-native