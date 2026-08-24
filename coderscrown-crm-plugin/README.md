# CodersCrown CRM - WordPress Plugin

A comprehensive WordPress CRM plugin that brings all the functionality from your Next.js CRM system into WordPress, including leads management, N8N integration, projects tracking, and tickets system.

## Features

- **Leads Management**: Complete CRUD operations with CSV import, filtering, search, and progressive disclosure
- **N8N Integration**: REST API endpoints with Bearer token authentication for automation
- **Projects Tracking**: Manage projects with status, budget, tech stack, and deadlines
- **Tickets System**: Support ticket management with conversation threading
- **Cold Outreach**: Track email campaigns with progressive field disclosure (fields appear after first email sent)
- **Dashboard**: Statistics widgets and recent activity overview
- **API Keys Management**: Generate and revoke API keys for N8N integration

## Installation

1. **Upload the Plugin**
   - Copy the `coderscrown-crm-plugin` folder to `wp-content/plugins/`
   - Or zip the folder and upload via WordPress Admin → Plugins → Add New

2. **Activate the Plugin**
   - Go to WordPress Admin → Plugins
   - Find "CodersCrown CRM" and click "Activate"
   - Database tables will be created automatically

3. **Verify Installation**
   - Check that the "CRM" menu appears in WordPress Admin
   - Navigate to CRM → Dashboard to see the overview

## Usage

### Managing Leads

1. Go to **CRM → Leads**
2. Click **Add New** to create a lead
3. Fill in contact information, company details, and social links
4. Use **Import CSV** to bulk import leads
5. Filter by status or search by name/email/company

**Progressive Disclosure**: Cold outreach fields (next follow-up, campaign status, etc.) are hidden until the first email is sent via N8N API.

### N8N Integration

1. Go to **CRM → API Keys**
2. Click **Generate API Key**
3. Copy the generated key (format: `sk_xxxxxxxxxxxxx`)
4. Use this key in your N8N workflows

**API Endpoints**:
- `GET /wp-json/crm/v1/leads` - Get all leads (filter by ?status=new)
- `GET /wp-json/crm/v1/leads/{id}` - Get single lead
- `POST /wp-json/crm/v1/leads` - Create new lead
- `POST /wp-json/crm/v1/leads/{id}/outreach-history` - Log email sent (unlocks cold outreach fields)
- `POST /wp-json/crm/v1/leads/{id}/schedule-followup` - Schedule next follow-up

**Authentication**:
```bash
curl -H "Authorization: Bearer sk_your_api_key" \
     https://yoursite.com/wp-json/crm/v1/leads?status=new
```

**Log Outreach Example**:
```bash
curl -X POST \
     -H "Authorization: Bearer sk_your_api_key" \
     -H "Content-Type: application/json" \
     -d '{"email_subject":"Hello","status":"sent","outreach_type":"first_email"}' \
     https://yoursite.com/wp-json/crm/v1/leads/123/outreach-history
```

### Managing Projects

1. Go to **CRM → Projects**
2. Click **Add New** to create a project
3. Set status, budget, tech stack, and deadline
4. Associate with clients and track progress

### Managing Tickets

1. Go to **CRM → Tickets**
2. Click **Add New** to create a ticket
3. Set priority, type, and status
4. Add messages to create conversation threads
5. Update status as tickets are resolved

## Database Tables

The plugin creates the following custom tables:

- `wp_crm_leads` - Lead information with contact details and cold outreach data
- `wp_crm_projects` - Project tracking with status, budget, tech stack
- `wp_crm_tickets` - Support ticket management
- `wp_crm_ticket_messages` - Ticket conversation threads
- `wp_crm_api_keys` - N8N integration API keys
- `wp_crm_campaigns` - Cold outreach campaigns
- `wp_crm_outreach_logs` - Email tracking and follow-up history

## Permissions

The plugin adds the following capabilities to the Administrator role:

- `manage_crm` - Access CRM features
- `manage_crm_leads` - Manage leads
- `manage_crm_projects` - Manage projects
- `manage_crm_tickets` - Manage tickets
- `manage_crm_api_keys` - Manage API keys
- `view_crm_dashboard` - View dashboard

## CSV Import Format

Your CSV file should have the following columns (header row required):

- `name` - Lead name (required)
- `email` - Email address (required)
- `phone` - Phone number
- `company_name` - Company name
- `position` - Job position
- `website` - Website URL
- `industry` - Industry
- `source` - Lead source
- `status` - Status (new, in_progress, contacted, etc.)
- `tags` - Comma-separated tags

Leads with duplicate email addresses will be skipped during import.

## Migrating from Next.js App

If you want to migrate data from your existing Next.js CRM to WordPress:

1. Export data from your MySQL database
2. Use the CSV import feature for leads
3. Manually create projects and tickets, or contact support for migration assistance

## Updating N8N Workflows

After installing the plugin, update your N8N workflows to use the new WordPress endpoints:

**Old**: `https://your-vercel-app.vercel.app/api/v1/leads`  
**New**: `https://yoursite.com/wp-json/crm/v1/leads`

The API structure remains the same, just update the base URL and use your WordPress API key.

## Support

For issues or feature requests, contact CodersCrown support.

## Version

1.0.0

## License

GPL v2 or later
