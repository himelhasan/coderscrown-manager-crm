import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Lead from '../../../../lib/models/Lead';
import OutreachLog from '../../../../lib/models/OutreachLog';
import Project from '../../../../lib/models/Project';
import Ticket from '../../../../lib/models/Ticket';
import User from '../../../../lib/models/User';

export async function GET(request: NextRequest) {
    try {
        const uid = request.headers.get('X-User-UID');
        const hasAuth = !!request.headers.get('Authorization');
        
        console.log('Dashboard Diagnostic - Headers:', {
            'x-user-uid': uid ? 'PRESENT' : 'MISSING',
            'authorization': hasAuth ? 'PRESENT' : 'MISSING'
        });

        if (!uid) {
             return NextResponse.json({ error: 'Missing X-User-UID Header' }, { status: 401 });
        }

        await dbConnect();
        console.log('Dashboard Diagnostic - DB Connected, UID:', uid);

        // 1. Get User Role
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
             console.log('Dashboard Diagnostic - User not found for UID:', uid);
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        console.log('Dashboard Diagnostic - User found:', user.email, 'Role:', user.role);

        const role = user.role || 'client';

        let data: any = {};

        if (role === 'admin' || role === 'moderator') {
            // Admin View: All Stats
            const totalLeads = await Lead.countDocuments({});
            const leadsInProgress = await Lead.countDocuments({ status: { $in: ['in_progress', 'contacted', 'waiting_response'] } });
            const convertedLeads = await Lead.countDocuments({ status: 'converted' });
            const activeCampaigns = await Lead.countDocuments({ 'cold_outreach.campaign_status': 'active' });
            
            const totalSent = await OutreachLog.countDocuments({ status: 'sent' });
            const totalReplies = await OutreachLog.countDocuments({ status: 'replied' });

            const newTickets = await Ticket.find({}).sort({ updatedAt: -1 }).limit(5);
            const ongoingProjects = await Project.find({ status: { $in: ['development', 'live'] } }).sort({ updatedAt: -1 }).limit(5);

            data = {
                role,
                stats: {
                    totalLeads,
                    leadsInProgress,
                    convertedLeads,
                    activeCampaigns,
                    totalSent,
                    totalReplies
                },
                newTickets,
                ongoingProjects
            };
        } else {
            // Client View: Restricted Stats
            const userIdStr = String(user._id || user.id);
            const activeTickets = await Ticket.countDocuments({ status: { $ne: 'closed' }, $or: [{ client_id: userIdStr }, { client: userIdStr }] }); 
            const solvedTickets = await Ticket.countDocuments({ status: 'closed', $or: [{ client_id: userIdStr }, { client: userIdStr }] });
            
            // Client Projects
            const myProjects = await Project.find({ client_id: uid, status: { $ne: 'archived' } });

            // Tickets List
            const myTickets = await Ticket.find({ $or: [{ client_id: userIdStr }, { client: userIdStr }] }).sort({ updatedAt: -1 }).limit(5);

            data = {
                role,
                stats: {
                    activeTickets,
                    solvedTickets
                },
                projects: myProjects,
                recentTickets: myTickets
            };
        }

        return NextResponse.json(data);

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
