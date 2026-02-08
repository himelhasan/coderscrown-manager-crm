import { ExternalLink, FolderGit2 } from 'lucide-react';
import Link from 'next/link';

export default function OngoingProjects({ projects }: { projects: any[] }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col">
      <div className="border-b border-border p-6 flex flex-row items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-primary" />
            Ongoing Projects
        </h3>
        <Link href="/projects" className="text-xs text-primary hover:underline">View All</Link>
      </div>
      <div className="p-6 flex-1 overflow-auto">
        {projects?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No ongoing projects.</p>
        ) : (
            <div className="space-y-4">
                {projects.map((project) => (
                    <div key={project._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                            <h4 className="font-medium text-sm">{project.name}</h4>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider 
                                    ${project.status === 'live' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {project.status}
                                </span>
                                {project.budget && <span className="text-xs text-muted-foreground">${project.budget}</span>}
                            </div>
                        </div>
                        {project.link && (
                            <a href={project.link} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
