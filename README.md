This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- GitHub OAuth App credentials
- Groq API key

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:

   **Required Variables:**
   - `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/ai_mentor`)
   - `GITHUB_ID` - GitHub OAuth App Client ID
   - `GITHUB_SECRET` - GitHub OAuth App Client Secret
   - `GROQ_API_KEY` - Groq API key for AI chat functionality

   **Optional Variables:**
   - `EMAIL_SERVER` - SMTP server connection string (required in production)
   - `EMAIL_FROM` - Email address for sending emails
   - `NEXTAUTH_URL` - Your application URL (defaults to `http://localhost:3000` in development)
   - `NEXTAUTH_SECRET` - Secret key for NextAuth (should be at least 32 characters)

3. The application will automatically validate all environment variables on startup. If any required variables are missing, you'll see a clear error message.

### Database Setup

1. Create your PostgreSQL database
2. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
3. (Optional) Generate Prisma client:
   ```bash
   npx prisma generate
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
