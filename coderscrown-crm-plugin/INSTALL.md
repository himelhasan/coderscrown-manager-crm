# CodersCrown CRM Plugin - Installation Guide

## Quick Start

### Option 1: Direct Installation (Recommended)

1. **Copy the plugin folder to WordPress**:
   ```bash
   # Navigate to your WordPress installation
   cd /path/to/your/wordpress
   
   # Copy the plugin
   cp -r /path/to/coderscrown-crm-plugin wp-content/plugins/
   ```

2. **Activate via WordPress Admin**:
   - Go to WordPress Admin → Plugins
   - Find "CodersCrown CRM"
   - Click "Activate"

3. **Verify Installation**:
   - Look for "CRM" menu in WordPress Admin sidebar
   - Navigate to CRM → Dashboard
   - You should see statistics widgets

### Option 2: ZIP Installation

1. **Create ZIP file**:
   ```bash
   zip -r coderscrown-crm-plugin.zip coderscrown-crm-plugin/
   ```

2. **Upload via WordPress**:
   - Go to WordPress Admin → Plugins → Add New
   - Click "Upload Plugin"
   - Choose the ZIP file
   - Click "Install Now"
   - Click "Activate Plugin"

## Post-Installation Setup

### 1. Generate API Key for N8N

1. Navigate to **CRM → API Keys**
2. Enter a name (e.g., "N8N Production")
3. Click **Generate API Key**
4. **IMPORTANT**: Copy the key immediately (format: `sk_xxxxxxxxxxxxx`)
5. Save it securely - it won't be shown again

### 2. Update N8N Workflows

Replace your Vercel endpoints with WordPress endpoints:

**Old**:
```
https://your-vercel-app.vercel.app/api/v1/leads
```

**New**:
```
https://yoursite.com/wp-json/crm/v1/leads
```

Update the Authorization header:
```
Authorization: Bearer sk_your_new_wordpress_api_key
```

### 3. Import Existing Leads (Optional)

If migrating from Next.js:

1. Export leads from your MySQL database as CSV
2. Go to **CRM → Leads → Import CSV**
3. Upload the CSV file
4. Review import results

## Testing the Installation

### Test 1: Create a Lead

1. Go to **CRM → Leads → Add New**
2. Fill in required fields (Name, Email)
3. Click **Save Lead**
4. Verify lead appears in the list

### Test 2: API Authentication

```bash
# Replace with your actual domain and API key
curl -H "Authorization: Bearer sk_your_api_key" \
     https://yoursite.com/wp-json/crm/v1/leads
```

Expected: JSON array of leads

### Test 3: Log Outreach (Progressive Disclosure)

1. Create a test lead
2. Use the API to log first email:
   ```bash
   curl -X POST \
        -H "Authorization: Bearer sk_your_api_key" \
        -H "Content-Type: application/json" \
        -d '{"email_subject":"Test","status":"sent","outreach_type":"first_email"}' \
        https://yoursite.com/wp-json/crm/v1/leads/1/outreach-history
   ```
3. Edit the lead in WordPress Admin
4. Verify "Cold Outreach Data" section now appears

### Test 4: Create Project & Ticket

1. Go to **CRM → Projects → Add New**
2. Create a test project
3. Go to **CRM → Tickets → Add New**
4. Create a test ticket
5. View the ticket and add a message

## Troubleshooting

### Plugin Menu Not Appearing

- Check if plugin is activated
- Verify you're logged in as Administrator
- Clear WordPress cache

### Database Tables Not Created

- Deactivate and reactivate the plugin
- Check WordPress database user has CREATE TABLE permissions
- Check error logs in wp-content/debug.log

### API Returns 401 Unauthorized

- Verify API key is active in CRM → API Keys
- Check Authorization header format: `Bearer sk_xxxxx`
- Ensure key hasn't been revoked

### Cold Outreach Fields Not Showing

- Verify first email was logged via API
- Check `cold_outreach_first_email_sent_date` is set in database
- Refresh the edit page

## Database Tables Reference

The plugin creates these tables (with `wp_` prefix):

- `wp_crm_leads`
- `wp_crm_projects`
- `wp_crm_tickets`
- `wp_crm_ticket_messages`
- `wp_crm_api_keys`
- `wp_crm_campaigns`
- `wp_crm_outreach_logs`

## Uninstallation

To completely remove the plugin and data:

1. Deactivate the plugin
2. Delete the plugin files
3. Manually drop database tables if desired:
   ```sql
   DROP TABLE IF EXISTS wp_crm_leads;
   DROP TABLE IF EXISTS wp_crm_projects;
   DROP TABLE IF EXISTS wp_crm_tickets;
   DROP TABLE IF EXISTS wp_crm_ticket_messages;
   DROP TABLE IF EXISTS wp_crm_api_keys;
   DROP TABLE IF EXISTS wp_crm_campaigns;
   DROP TABLE IF EXISTS wp_crm_outreach_logs;
   ```

## Support

For issues or questions, contact CodersCrown support.

## Version

1.0.0 - Initial Release
