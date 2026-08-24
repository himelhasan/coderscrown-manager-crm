# Cold Outreach CRM System

A Next.js 15 Full-Stack CRM designed for Web Design Agencies + N8N Integration.
Built with **Next.js App Router**, **Tailwind CSS v4**, and **MongoDB (Mongoose)**.

## Features
- **Leads Management**: Import CSV, track status, filter, and search.
- **N8N Integration**: Secure API endpoints (`/api/v1/leads/...`) to automate email outreach.
- **Cold Outreach Unlock**: Fields like "Next Follow-up" are hidden until N8N logs the first email.
- **Premium UI**: Dark mode, glassmorphism, responsive design.
- **Security**: API Key authentication for external tools.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/crm
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import project in Vercel.
3. Add `MONGODB_URI` environment variable in Vercel.
4. Deploy!

## API Integration (for N8N)

**Base URL**: `https://your-domain.vercel.app/api/v1`

**Authentication**:
Header: `Authorization: Bearer sk_YOUR_GENERATED_KEY`

**Key Endpoints**:
- `GET /leads?status=new`: Fetch new leads to email.
- `POST /leads/{id}/outreach-history`: Log sent email (Unlocks UI fields).
  ```json
  {
    "email_subject": "Hello",
    "status": "sent",
    "outreach_type": "first_email"
  }
  ```
- `POST /leads/{id}/schedule-followup`: Schedule next action.
# coderscrown-outreach-crm
