import { Layout } from "@/components/layout";
import { useGetRepl, useUpdateRepl, getListReplsQueryKey, getGetReplQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Settings, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const editReplSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  language: z.string().min(1, "Language is required"),
});

export default function EditRepl() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: repl, isLoading } = useGetRepl(id, { query: { enabled: !!id, queryKey: getGetReplQueryKey(id) } });
  const updateRepl = useUpdateRepl();

  const form = useForm<z.infer<typeof editReplSchema>>({
    resolver: zodResolver(editReplSchema),
    defaultValues: {
      name: "",
      description: "",
      language: "",
    }
  });

  useEffect(() => {
    if (repl) {
      form.reset({
        name: repl.name,
        description: repl.description || "",
        language: repl.language
      });
    }
  }, [repl, form]);

  function onSubmit(values: z.infer<typeof editReplSchema>) {
    updateRepl.mutate({ id, data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReplsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetReplQueryKey(id) });
        setLocation(`/repls/${id}`);
      }
    });
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-12 max-w-3xl mx-auto w-full space-y-8">
          <Skeleton className="h-12 w-64 bg-muted" />
          <Skeleton className="h-16 w-full bg-muted" />
          <Skeleton className="h-16 w-full bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!repl) {
    return (
      <Layout>
        <div className="p-12 text-center text-muted-foreground font-mono">
          REPL_NOT_FOUND
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto terminal-scroll p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation(`/repls/${id}`)} className="text-muted-foreground hover:text-white -ml-3 mb-4 font-mono text-xs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK_TO_EDITOR
            </Button>
          </div>

          <div className="mb-8 border-b border-border/50 pb-6">
            <h1 className="text-3xl font-black flex items-center gap-3 text-white">
              <Settings className="text-primary w-8 h-8" />
              CONFIGURE_REPL
            </h1>
            <p className="text-muted-foreground font-mono mt-2 text-sm">Update environment metadata.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Repl Name</FormLabel>
                      <FormControl>
                        <Input className="bg-card font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Language Environment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-card font-mono">
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript (Node.js)</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python 3</SelectItem>
                          <SelectItem value="bash">Bash</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Description (Optional)</FormLabel>
                    <FormControl>
                      <Input className="bg-card font-sans" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={updateRepl.isPending}
                  className="font-mono font-bold tracking-wide w-full md:w-auto"
                >
                  {updateRepl.isPending ? "SAVING..." : "SAVE CONFIG"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
