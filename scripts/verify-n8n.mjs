
// Removed import since Node.js 18+ has native fetch

const BASE_URL = 'http://localhost:3000/api/v1';

async function verify() {
  console.log('🚀 Starting Verification...');

  let createdLeadId = null;

  try {
    // 1. Create a Test Lead
    console.log('\n1. Creating Test Lead...');
    const createRes = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Lead N8N Verify',
        email: `verify-${Date.now()}@example.com`,
        company_name: 'Test Corp Verify',
        status: 'new'
      })
    });
    
    if (!createRes.ok) {
        const text = await createRes.text();
        throw new Error(`Failed to create lead: ${createRes.status} ${createRes.statusText} - ${text}`);
    }
    const createData = await createRes.json();
    const lead = createData.data;
    createdLeadId = lead._id;
    console.log('✅ Lead Created:', lead._id, lead.email);

    // 2. Log Outreach (Simulate N8N)
    console.log('\n2. Logging Outreach (Simulating N8N)...');
    const logRes = await fetch(`${BASE_URL}/leads/${lead._id}/outreach-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outreach_type: 'email',
        status: 'sent',
        email_subject: 'Verification Email',
        email_body_preview: 'This is a test email.',
        sent_at: new Date().toISOString()
      })
    });

    if (!logRes.ok) {
        const text = await logRes.text();
        throw new Error(`Failed to log outreach: ${logRes.status} ${text}`);
    }
    const logData = await logRes.json();
    console.log('✅ Outreach Logged:', logData.data.status);
    console.log('   Lead Updates Triggered:', logData.message);

    // 3. Verify Lead Updates
    console.log('\n3. Verifying Lead Status Update...');
    const getRes = await fetch(`${BASE_URL}/leads/${lead._id}`);
    const getData = await getRes.json();
    const updatedLead = getData.data;
    
    // Check if cold_outreach fields are set
    if (updatedLead.cold_outreach?.first_email_sent_date && updatedLead.status === 'in_progress') {
        console.log('✅ Lead Status Successfully Updated to "in_progress"');
        console.log('✅ First Email Sent Date Set:', updatedLead.cold_outreach.first_email_sent_date);
    } else {
        console.error('❌ Lead status NOT updated correctly:', updatedLead.status, updatedLead.cold_outreach);
    }

    // 4. Log Reply (Optional - verify status change to warm)
    console.log('\n4. Logging Reply (Simulate Response)...');
    const replyRes = await fetch(`${BASE_URL}/leads/${lead._id}/outreach-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outreach_type: 'email',
        status: 'replied',
        email_subject: 'Re: Verification Email'
      })
    });

    if (!replyRes.ok) console.error('Failed to log reply');
    
    const finalRes = await fetch(`${BASE_URL}/leads/${lead._id}`);
    const finalData = await finalRes.json();
    const finalLead = finalData.data;

    if (finalLead.status === 'warm_lead') {
        console.log('✅ Lead Status Successfully Updated to "warm_lead" on reply');
    } else {
        console.error('❌ Lead status NOT updated to warm_lead:', finalLead.status);
    }

    console.log('\n🎉 Verification Completed Successfully!');

  } catch (error) {
    console.error('\n❌ Verification Failed:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
    console.log('Make sure the Next.js server is running on http://localhost:3000');
  } finally {
      // 5. Cleanup
      if (createdLeadId) {
        console.log('\n5. Cleaning Up (Deleting Test Lead)...');
        try {
            await fetch(`${BASE_URL}/leads/${createdLeadId}`, { method: 'DELETE' });
            console.log('✅ Test Lead Deleted');
        } catch (e) {
            console.error('Failed to delete test lead', e);
        }
      }
  }
}

verify();
