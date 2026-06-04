import { Layout } from "@/components/layout";
import { useGetRepl, useUpdateRepl, useRunRepl, useDeleteRepl, getGetReplQueryKey, getListReplsQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation, Link } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Settings, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ReplEditor() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: repl, isLoading } = useGetRepl(id, { query: { enabled: !!id, queryKey: getGetReplQueryKey(id) } });
  const updateRepl = useUpdateRepl();
  const runRepl = useRunRepl();
  const deleteRepl = useDeleteRepl();

  const [code, setCode] = useState("");
  const [output, setOutput] = useState<{ stdout: string; exitCode: number; time: number } | null>(null);
  
  const initializedForId = useRef<number | null>(null);
  const lastSavedCode = useRef<string>("");
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync initial code from server
  useEffect(() => {
    if (repl && initializedForId.current !== id) {
      initializedForId.current = id;
      setCode(repl.code);
      lastSavedCode.current = repl.code;
    }
  }, [repl, id]);

  const saveCode = useCallback((newCode: string) => {
    if (newCode === lastSavedCode.current) return;
    
    updateRepl.mutate(
      { id, data: { code: newCode } },
      {
        onSuccess: (updatedRepl) => {
          lastSavedCode.current = updatedRepl.code;
          queryClient.setQueryData(getGetReplQueryKey(id), (old: any) => 
            old ? { ...old, code: updatedRepl.code, updatedAt: updatedRepl.updatedAt } : old
          );
        }
      }
    );
  }, [id, updateRepl, queryClient]);

  // Handle typing with debounced autosave
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      saveCode(val);
    }, 1000);
  };

  // Run execution
  const handleRun = () => {
    // Save immediately before run
    if (code !== lastSavedCode.current) {
      saveCode(code);
    }
    
    runRepl.mutate({ id }, {
      onSuccess: (res) => {
        setOutput({
          stdout: res.output || (res.error ? res.error : "No output"),
          exitCode: res.exitCode,
          time: res.executionTimeMs
        });
      },
      onError: (err: any) => {
        setOutput({
          stdout: err.message || "Execution failed",
          exitCode: 1,
          time: 0
        });
      }
    });
  };

  const handleDelete = () => {
    deleteRepl.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReplsQueryKey() });
        toast({ title: "Repl deleted", description: "The workspace has been removed." });
        setLocation("/");
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col p-6 space-y-4">
          <Skeleton className="h-10 w-full max-w-sm bg-muted" />
          <Skeleton className="flex-1 w-full bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!repl) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center font-mono text-muted-foreground">
          ERR_NOT_FOUND
        </div>
      </Layout>
    );
  }

  const isSaving = updateRepl.isPending;
  const isRunning = runRepl.isPending;
  const hasUnsavedChanges = code !== lastSavedCode.current;

  return (
    <Layout>
      <div className="flex flex-col h-full bg-[#0d0d12]">
        
        {/* Editor Toolbar */}
        <div className="h-12 border-b border-border/50 px-4 flex items-center justify-between shrink-0 bg-card">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-white text-sm truncate max-w-[200px] md:max-w-md">
              {repl.name}
            </h1>
            <span className="bg-primary/20 text-primary text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold tracking-wider">
              {repl.language}
            </span>
            <div className="flex items-center text-xs text-muted-foreground font-mono ml-2">
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-accent animate-pulse">
                  <Save className="w-3 h-3" /> SAVING...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="flex items-center gap-1.5 text-yellow-500">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div> UNSAVED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 opacity-50">
                  <Save className="w-3 h-3" /> SAVED
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border bg-background hover:bg-secondary text-xs font-mono hidden md:flex"
              asChild
            >
              <Link href={`/repls/${id}/edit`}>
                <Settings className="w-3.5 h-3.5 mr-2" />
                CONFIG
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-mono">
                  <Trash2 className="w-3.5 h-3.5 md:mr-2" />
                  <span className="hidden md:inline">DELETE</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-mono text-white">DELETE_WORKSPACE?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This action cannot be undone. This will permanently destroy "{repl.name}" and all associated code.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-mono border-border text-foreground hover:bg-secondary">CANCEL</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="font-mono bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    CONFIRM_DELETE
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="w-px h-6 bg-border mx-2"></div>

            <Button 
              size="sm" 
              onClick={handleRun}
              disabled={isRunning}
              className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold tracking-wider text-xs"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 mr-2 fill-current" />
              )}
              {isRunning ? 'EXECUTING' : 'RUN'}
            </Button>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Main Code Area */}
          <div className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-border/50 relative">
            {/* Line numbers mock overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-background/50 border-r border-border/30 flex flex-col text-right pr-2 pt-4 select-none pointer-events-none text-muted-foreground/30 font-mono text-sm leading-relaxed overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="flex-1 w-full bg-transparent text-gray-300 font-mono text-sm leading-relaxed p-4 pl-14 outline-none resize-none terminal-scroll"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              placeholder="// Write your code here..."
            />
          </div>

          {/* Output Panel */}
          <div className="h-1/3 md:h-full md:w-[400px] lg:w-[500px] flex flex-col bg-[#050508] shrink-0 z-10">
            <div className="h-10 border-b border-border/30 flex items-center px-4 bg-background/80 shrink-0">
              <span className="font-mono text-xs font-bold text-muted-foreground">TERMINAL_OUTPUT</span>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto terminal-scroll text-gray-400">
              {!output ? (
                <div className="opacity-30 italic">Ready for execution...</div>
              ) : (
                <div className="space-y-4">
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                    {output.stdout}
                  </pre>
                  
                  <div className="pt-4 border-t border-border/20 flex items-center gap-4 text-xs opacity-50">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${output.exitCode === 0 ? 'bg-primary' : 'bg-destructive'}`}></span>
                      Exit code: {output.exitCode}
                    </span>
                    <span>Time: {output.time}ms</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
