# Deployment Guide

This guide will help you deploy Repo Wrapped to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at https://vercel.com)
- Access to this repository

## Step 1: Create GitHub OAuth App

You need to create a GitHub OAuth App for production:

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name:** `Repo Wrapped (Production)`
   - **Homepage URL:** `https://your-app-name.vercel.app` (you'll update this after deployment)
   - **Authorization callback URL:** `https://your-app-name.vercel.app/api/auth/callback/github`
4. Click **"Register application"**
5. **Copy the Client ID** - you'll need this
6. Click **"Generate a new client secret"** and **copy it immediately** (you won't see it again!)

## Step 2: Generate NextAuth Secret

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output - you'll need this for the `NEXTAUTH_SECRET` environment variable.

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `augmentcode/augment-repo-wrapped`
4. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

5. Add **Environment Variables**:
   - `GITHUB_CLIENT_ID` - Your production GitHub OAuth Client ID
   - `GITHUB_CLIENT_SECRET` - Your production GitHub OAuth Client Secret
   - `NEXTAUTH_SECRET` - The secret you generated in Step 2
   - `NEXTAUTH_URL` - `https://your-app-name.vercel.app` (use your actual Vercel URL)
   - `NODE_ENV` - `production`

6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add NODE_ENV production

# Deploy to production
vercel --prod
```

## Step 4: Update GitHub OAuth App

After deployment, Vercel will give you a production URL (e.g., `https://repo-wrapped.vercel.app`).

1. Go back to your GitHub OAuth App settings: https://github.com/settings/developers
2. Update the **Homepage URL** to your Vercel URL
3. Update the **Authorization callback URL** to: `https://your-vercel-url.vercel.app/api/auth/callback/github`
4. Save changes

## Step 5: Update NEXTAUTH_URL in Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Update `NEXTAUTH_URL` to match your actual Vercel URL
4. Redeploy the app (Vercel → Deployments → Redeploy)

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Click **"Continue with GitHub"**
3. Authorize the app
4. Test the wrapped feature with a repository

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Ov23liABC123...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `abc123def456...` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | `D8hVCajguMG2...` |
| `NEXTAUTH_URL` | Your production URL | `https://repo-wrapped.vercel.app` |
| `NODE_ENV` | Node environment | `production` |

## Troubleshooting

### "Callback URL mismatch" error
- Make sure the callback URL in your GitHub OAuth App exactly matches: `https://your-vercel-url.vercel.app/api/auth/callback/github`
- No trailing slashes!

### "Invalid client" error
- Double-check your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Vercel environment variables
- Make sure you're using the **production** OAuth app credentials, not local development ones

### "NEXTAUTH_URL is not set" error
- Add `NEXTAUTH_URL` environment variable in Vercel
- Make sure it matches your actual Vercel deployment URL
- Redeploy after adding the variable

### Build fails
- Check the build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify Node.js version compatibility (this app uses Node 18+)

## Automatic Deployments

Once set up, Vercel will automatically deploy:
- **Production:** Every push to `main` branch
- **Preview:** Every pull request

You can configure this in Vercel project settings → Git.

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` to your custom domain
5. Update GitHub OAuth App callback URL to your custom domain
6. Redeploy

## Support

For issues with:
- **Vercel deployment:** https://vercel.com/docs
- **GitHub OAuth:** https://docs.github.com/en/apps/oauth-apps
- **NextAuth:** https://next-auth.js.org/getting-started/introduction

