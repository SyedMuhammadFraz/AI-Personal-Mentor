# Deployment Guide for Vercel

This guide will help you deploy your AI Personal Mentor application to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. ✅ A Vercel account ([sign up here](https://vercel.com/signup))
2. ✅ A PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
3. ✅ GitHub OAuth App credentials ([GitHub Developer Settings](https://github.com/settings/developers))
4. ✅ Groq API key ([Groq Console](https://console.groq.com))
5. ✅ (Optional) SMTP server for email authentication

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Set Up Database

#### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Copy the `POSTGRES_URL` connection string
4. Note: You may need to adjust the connection string format for Prisma

#### Option B: External Database

1. Create a PostgreSQL database on your preferred provider
2. Get the connection string (format: `postgresql://user:password@host:port/database`)

### 3. Run Database Migrations

**Important:** Run migrations **before** your first deployment or set up a migration script.

**Option 1: Run migrations locally before deploying**
```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

**Option 2: Run migrations after first deployment (using Vercel CLI)**
```bash
vercel env pull .env.production
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2)
npx prisma migrate deploy
```

### 4. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. **Don't deploy yet** - we need to configure environment variables first

#### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### 5. Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `GITHUB_ID` | GitHub OAuth App Client ID | `Iv1.8a61f9b3a7aba766` |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | `your-secret-here` |
| `GROQ_API_KEY` | Groq API key for AI chat | `gsk_...` |

#### Optional Variables (Recommended for Production)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Your production URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for NextAuth (32+ chars) | Generate with: `openssl rand -base64 32` |
| `EMAIL_SERVER` | SMTP server (if using email auth) | `smtp://user:pass@smtp.example.com:587` |
| `EMAIL_FROM` | Email sender address | `noreply@yourdomain.com` |
| `NODE_ENV` | Environment | `production` |

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 6. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App (if you haven't already)
3. Set **Authorization callback URL** to:
   ```
   https://your-app.vercel.app/api/auth/callback/github
   ```
4. Copy the **Client ID** and **Client Secret** to Vercel environment variables

### 7. Configure NextAuth URL

Set `NEXTAUTH_URL` in Vercel environment variables to your production domain:
```
https://your-app.vercel.app
```

### 8. Deploy

1. If using Vercel Dashboard: Click **Deploy**
2. If using CLI: Run `vercel --prod`
3. Wait for the build to complete

### 9. Run Database Migrations (if not done earlier)

After the first deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)
npx prisma migrate deploy
```

Or connect to your database directly and run migrations manually.

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] GitHub OAuth callback URL updated
- [ ] Test login with GitHub
- [ ] Test AI mentor chat
- [ ] Test goal creation/editing
- [ ] Verify all features work

## Troubleshooting

### Build Errors

**Error: Prisma client not generated**
- The `postinstall` script should handle this automatically
- If issues persist, check that `prisma` is in `devDependencies`

**Error: Environment variables missing**
- Verify all required variables are set in Vercel dashboard
- Check variable names (case-sensitive)

### Runtime Errors

**Error: Database connection failed**
- Verify `DATABASE_URL` is correct
- Check if your database allows connections from Vercel's IP ranges
- For some providers, you may need to enable SSL connections

**Error: NextAuth session issues**
- Ensure `NEXTAUTH_URL` matches your production domain exactly
- Verify `NEXTAUTH_SECRET` is set and is 32+ characters

**Error: GitHub OAuth not working**
- Verify callback URL matches exactly: `https://your-app.vercel.app/api/auth/callback/github`
- Check `GITHUB_ID` and `GITHUB_SECRET` are correct

### Database Migration Issues

If migrations fail, you can run them manually:

```bash
# Connect to your database
# Then run the SQL from prisma/migrations/*/migration.sql
```

Or use Prisma Studio:
```bash
npx prisma studio
```

## Environment Variable Reference

### Required

- `DATABASE_URL`: PostgreSQL connection string
- `GITHUB_ID`: GitHub OAuth Client ID
- `GITHUB_SECRET`: GitHub OAuth Client Secret
- `GROQ_API_KEY`: Groq API key

### Optional (but recommended)

- `NEXTAUTH_URL`: Production URL (defaults to `http://localhost:3000` in dev)
- `NEXTAUTH_SECRET`: 32+ character secret (auto-generated in dev)
- `EMAIL_SERVER`: SMTP server connection string
- `EMAIL_FROM`: Email sender address
- `NODE_ENV`: Set to `production` in production

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

