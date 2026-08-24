---
description: How to deploy this Next.js app to cPanel
---

### 1. Build the Application (CRITICAL: DO THIS LOCALLY)
Next.js builds require a lot of RAM (at least 2GB-4GB). Most cPanel servers have strict "LVE Limits" that will kill the build process with an **Out of Memory** or **Wasm** error.

**DO NOT run `npm run build` on cPanel.** Follow these steps instead:

1.  **On your computer**, open a terminal in the project folder.
2.  Run `npm install` and then `npm run build`.
3.  Locate the hidden `.next` folder in your project directory.
4.  Locate the `public` folder, `package.json`, and `server.js`.

### 2. Prepare Files for Upload
Create a ZIP file of your project. **DO NOT** include:
- `node_modules`
- `.git`
- `.env.local` (You will set variables in cPanel instead)

**INCLUDES**:
- `.next`
- `public`
- `package.json`
- `next.config.ts`
- `server.js` (The entry point for cPanel)

### 3. Setup Node.js App in cPanel
1. Open **Setup Node.js App** in cPanel.
2. Click **Create Application**.
3. **Node.js version**: Select 20.x or higher.
4. **Application mode**: Production.
5. **Application root**: The folder where you uploaded the files (e.g., `crm-app`).
6. **Application URL**: Your domain/subdomain.
7. **Application startup file**: `server.js`.

### 4. Set Environment Variables
In the same cPanel "Setup Node.js App" page, add the following variables:
- `MONGODB_URI`: Your MongoDB connection string.
- `NEXT_PUBLIC_FIREBASE_API_KEY`: ... (and all other Firebase variables)
- `NODE_ENV`: `production`

### 5. Install Dependencies
1. Once the app is created, click **Run NPM Install** in cPanel.

### 6. Start the App
Click **Restart** to start your Next.js application.

---

### 503 Troubleshooting
If you see a **503 Service Unavailable** error:
1.  **Check cPanel Logs**: Go to "Setup Node.js App" and look for the "stderr" link or check the `stderr.log` in your app folder.
2.  **Missing Env Variables**: A crash often happens if `MONGODB_URI` is missing. Ensure all variables are in the cPanel "Environment variables" section.
3.  **Module Conflict**: Delete the `node_modules` folder on the server and click **Run NPM Install** in cPanel again. Never upload `node_modules` from your Windows PC.
4.  **Restart**: Sometimes Phusion Passenger gets stuck. Click **Stop** and then **Start** instead of just Restart.
