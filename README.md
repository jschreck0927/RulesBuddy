# RulesBuddy
<<<<<<< HEAD

RulesBuddy is a membership and governance web application designed for Posts, Districts, and Departments. It provides secure access to governing documents, tools for drafting and exporting forms, and workflows for Article IX case management.

## Project structure

This repository contains a Next.js application (App Router, TypeScript) with Tailwind CSS for styling. Supabase is used for authentication, database and file storage. Stripe handles billing for individual and group plans.

Important directories:

- `src/app` – Application pages. Each tab (Home, Cases, Documents, Tools, Account and Admin) lives under its own route.
- `src/components` – Shared UI components such as the bottom navigation bar and tier badge.
- `src/lib` – Supabase client and other helpers.
- `supabase/schema.sql` – SQL file that defines all database tables and basic row‑level security policies. Apply this to your Supabase project.
- `public` – Static assets including the RulesBuddy logo.
- `scripts/seedDepartments.ts` – Example script to seed department data from a CSV using Supabase’s service role key.

## Getting started

1. **Install dependencies**

   Ensure you have Node.js installed. Install dependencies with npm or yarn:

   ```bash
   npm install
   # or
   yarn install
   ```

   > **Note:** In this environment the packages are not installed, but when you run this code locally you must install the listed dependencies.

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in your Supabase and Stripe credentials:

   ```bash
   cp .env.example .env.local
   ```

   Set each variable according to your Supabase project and Stripe account. The `SUPABASE_SERVICE_ROLE_KEY` is used by server‑side scripts and should not be exposed to the client.

3. **Apply the database schema**

   Open the SQL editor in your Supabase dashboard and run the SQL contained in `supabase/schema.sql`. This creates all tables and basic row‑level security (RLS) policies required for the app.

4. **Run the development server**

   Start the Next.js app in development mode:

   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000.

5. **Seeding data (optional)**

   To seed departments from the provided `Departments_List.csv`, you can run the script:

   ```bash
   node scripts/seedDepartments.ts
   ```

   This script uses your Supabase service role key to insert the records into the `departments` table.

## Notes

- This repository contains only a skeleton implementation. Many features described in the specification—such as full document search, governance builders, Article IX case tools, group seat management, dashboards, notifications and audit logs—are represented here with placeholders. Completing these features will require additional pages, API routes, database logic and UI components.
- Stripe integration is outlined in the API routes under `src/app/api/stripe`. You must configure your Stripe products, prices and webhook endpoint to complete the billing flow.
- Supabase Row Level Security (RLS) policies provided here are examples. Audit your policies carefully to ensure that data is restricted according to the requirements document.

## License

This project is provided for educational purposes and has no associated license. You may adapt it for your own use.
=======
Next.js + Supabase + Stripe app powering RulesBuddy
>>>>>>> 970f714a79ccbf6952a235d6cb265c30990d828a
