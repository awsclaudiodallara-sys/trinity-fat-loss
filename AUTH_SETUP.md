# 🔐 Trinity Fat Loss - Authentication Setup

This document explains how to set up authentication with Supabase for Trinity Fat Loss app.

## 🚀 Quick Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your real values from Supabase Dashboard.

### 2. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Trinity Fat Loss project
3. Navigate to **Settings > API**
4. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Configure OAuth Providers (Optional)

#### Google OAuth

1. In Supabase Dashboard: **Authentication > Providers > Google**
2. Enable Google provider
3. Add your Google OAuth credentials

#### Apple OAuth

1. In Supabase Dashboard: **Authentication > Providers > Apple**
2. Enable Apple provider
3. Add your Apple OAuth credentials

## 🏗️ Database Schema

Based on your provided database schema, the app expects these tables:

```sql
-- Users profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER,
  languages TEXT[],
  weight_goal TEXT,
  fitness_level TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Matching preferences
CREATE TABLE matching_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  age_min INTEGER,
  age_max INTEGER,
  languages TEXT[],
  fitness_level TEXT,
  weight_goal TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User matches (trios)
CREATE TABLE user_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES user_profiles(id),
  user2_id UUID REFERENCES user_profiles(id),
  user3_id UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('match_found', 'trio_completed', 'reminder', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Authentication Methods Available

### ✅ Email/Password Authentication

- ✅ Sign up with email
- ✅ Sign in with email
- ✅ Email verification
- ✅ Password reset

### ✅ Social Authentication

- ✅ Google OAuth (when configured)
- ✅ Apple OAuth (when configured)

## 🎯 Flow

1. **Landing Page** → User clicks CTA
2. **Welcome Screen** → Choose auth method (Email, Google, Apple)
3. **Email Auth** → Sign up/Sign in form (if email chosen)
4. **Data Collection** → User fills personal info
5. **Fitness Level** → User selects fitness level
6. **Matching** → Find trio partners
7. **Dashboard** → Main app experience

## 🛠️ Development

The app includes a development navigation panel (bottom-right) to easily test different screens without going through the full flow.

## 🔒 Security

- Environment variables are gitignored
- Supabase handles secure authentication
- Row Level Security (RLS) should be enabled in Supabase
- JWT tokens are managed automatically

## 📱 Testing

1. Start the development server: `npm run dev`
2. Use the dev navigation panel to test screens
3. Test with real Supabase credentials for full authentication flow
4. Check browser dev tools for authentication logs
