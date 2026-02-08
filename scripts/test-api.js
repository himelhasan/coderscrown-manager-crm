// scripts/test-api.ts
// Run with: npx tsx scripts/test-api.ts (Need tsx installed or just node if compiled)
// Actually we can just document the curl commands.

console.log(`
# Verification of N8N Endpoints

1. Create a Lead:
curl -X POST http://localhost:3000/api/v1/leads \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Test Lead", "email": "test@example.com", "status": "new"}'

2. Log Email (Unlock Outreach):
curl -X POST http://localhost:3000/api/v1/leads/{LEAD_ID}/outreach-history \\
  -H "Content-Type: application/json" \\
  -d '{"email_subject": "Hi", "status": "sent", "outreach_type": "first_email"}'

3. Verify Unlock (Get Details):
curl http://localhost:3000/api/v1/leads/{LEAD_ID}

4. API Key Test:
curl -X POST http://localhost:3000/api/v1/api-keys -d '{"name":"N8N"}' -H "Content-Type: application/json"
`);
