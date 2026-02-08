
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import OutreachLog from '@/lib/models/OutreachLog';
import Project from '@/lib/models/Project';
import Ticket from '@/lib/models/Ticket';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const uid = request.headers.get('X-User-UID');
        if (!uid) {
             return NextResponse.json({ error: 'Missing X-User-UID Header' }, { status: 401 });
        }

        await dbConnect();

        // 1. Get User Role
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) {
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const role = user.role || 'client'; // Default to client if undefined

        let data: any = {};

        if (role === 'admin' || role === 'moderator') {
            // Admin View: All Stats
            const totalLeads = await Lead.countDocuments({});
            const leadsInProgress = await Lead.countDocuments({ status: { $in: ['in_progress', 'contacted', 'waiting_response'] } });
            const convertedLeads = await Lead.countDocuments({ status: 'converted' });
            const activeCampaigns = await Lead.countDocuments({ 'cold_outreach.campaign_status': 'active' }); // Approximation
            
            const totalSent = await OutreachLog.countDocuments({ status: 'sent' });
            const totalReplies = await OutreachLog.countDocuments({ status: 'replied' });

            // New Data for Dashboard
            const newTickets = await Ticket.find({}).sort({ createdAt: -1 }).limit(5).populate('client', 'displayName email');
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
            // Ticket uses 'client' (ObjectId), Project uses 'client_id' (String/FirebaseUID) - legacy inconsistency
            const activeTickets = await Ticket.countDocuments({ status: { $ne: 'closed' }, client: user._id }); 
            const solvedTickets = await Ticket.countDocuments({ status: 'closed', client: user._id });
            
            // Client Projects - assuming client_id is firebaseUid based on Project model string type
            const myProjects = await Project.find({ client_id: uid, status: { $ne: 'archived' } });

            // Tickets List
            const myTickets = await Ticket.find({ client: user._id }).sort({ updatedAt: -1 }).limit(5);

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

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
