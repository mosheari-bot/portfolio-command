import { useGetReplStats, useListRepls } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { formatDistanceToNow } from "date-fns";
import { Terminal, Code2, Plus, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetReplStats();
  const { data: repls, isLoading: replsLoading } = useListRepls();

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto terminal-scroll p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
              INITIALIZE <span className="text-primary">WORKSPACE</span>
            </h1>
            <p className="text-muted-foreground font-mono max-w-xl text-sm">
              Your high-voltage coding sandbox. Spin up environments instantly. No configs, pure momentum.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div className="text-muted-foreground font-mono text-xs mb-4">TOTAL_REPLS</div>
                {statsLoading ? (
                  <Skeleton className="h-10 w-24 bg-muted" />
                ) : (
                  <div className="text-5xl font-black text-white">{stats?.total || 0}</div>
                )}
              </div>
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between group hover:border-accent/50 transition-colors">
                <div className="text-muted-foreground font-mono text-xs mb-4">RECENT_ACTIVITY</div>
                {statsLoading ? (
                  <Skeleton className="h-10 w-24 bg-muted" />
                ) : (
                  <div className="text-5xl font-black text-white">{stats?.recentCount || 0}</div>
                )}
              </div>
            </div>

            <Link href="/repls/new" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-6 flex flex-col justify-between transition-all group">
              <div className="font-mono text-sm font-bold opacity-80 mb-4">QUICK_START</div>
              <div className="space-y-2">
                <Plus className="w-10 h-10 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold tracking-tight">Create Repl</div>
              </div>
            </Link>
          </section>

          {stats?.byLanguage && stats.byLanguage.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Language Distribution</h2>
              <div className="flex flex-wrap gap-3">
                {stats.byLanguage.map((lang) => (
                  <div key={lang.language} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs font-mono border border-border">
                    <span className="text-primary">{lang.language}</span>
                    <span className="opacity-50">{lang.count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Recent Transmissions
              </h2>
            </div>

            {replsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full bg-muted" />
                ))}
              </div>
            ) : repls?.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card/50">
                <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No repls detected</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                  The workspace is empty. Initialize a new repl to begin coding.
                </p>
                <Link href="/repls/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Create First Repl
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repls?.map((repl) => (
                  <Link key={repl.id} href={`/repls/${repl.id}`} className="group bg-card border border-border rounded-lg p-5 hover:border-primary/50 hover:bg-secondary/50 transition-all flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {repl.language}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 truncate" title={repl.name}>{repl.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                      {repl.description || "No description provided."}
                    </p>
                    <div className="text-xs text-muted-foreground font-mono mt-auto pt-4 border-t border-border/50">
                      MODIFIED_{formatDistanceToNow(new Date(repl.updatedAt))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </Layout>
  );
}
