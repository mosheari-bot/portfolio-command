import { Layout } from "@/components/layout";
import { useCreateRepl, getListReplsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Terminal } from "lucide-react";

const createReplSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  code: z.string()
});

const DEFAULT_CODE = {
  javascript: "console.log('Hello, World!');",
  typescript: "const greeting: string = 'Hello, World!';\nconsole.log(greeting);",
  python: "print('Hello, World!')",
  bash: "echo 'Hello, World!'",
  html: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>",
  css: "body {\n  margin: 0;\n  background: #000;\n  color: #fff;\n}"
};

export default function CreateRepl() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createRepl = useCreateRepl();

  const form = useForm<z.infer<typeof createReplSchema>>({
    resolver: zodResolver(createReplSchema),
    defaultValues: {
      name: "",
      description: "",
      language: "javascript",
      code: DEFAULT_CODE.javascript
    }
  });

  const watchLanguage = form.watch("language");

  function onSubmit(values: z.infer<typeof createReplSchema>) {
    createRepl.mutate({ data: values }, {
      onSuccess: (repl) => {
        queryClient.invalidateQueries({ queryKey: getListReplsQueryKey() });
        setLocation(`/repls/${repl.id}`);
      }
    });
  }

  // Update default code when language changes if code is untouched or matches previous default
  const handleLanguageChange = (value: string) => {
    form.setValue("language", value);
    const currentCode = form.getValues("code");
    const isDefaultCode = Object.values(DEFAULT_CODE).includes(currentCode) || !currentCode;
    
    if (isDefaultCode) {
      form.setValue("code", DEFAULT_CODE[value as keyof typeof DEFAULT_CODE] || "");
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto terminal-scroll p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 border-b border-border/50 pb-6">
            <h1 className="text-3xl font-black flex items-center gap-3 text-white">
              <Terminal className="text-primary w-8 h-8" />
              INIT_REPL
            </h1>
            <p className="text-muted-foreground font-mono mt-2 text-sm">Configure your new environment parameters.</p>
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
                        <Input placeholder="my-awesome-project" className="bg-card font-mono" {...field} />
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
                      <Select onValueChange={handleLanguageChange} defaultValue={field.value}>
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
                      <Input placeholder="What does this do?" className="bg-card font-sans" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-1">
                    <FormLabel className="font-mono text-xs text-primary uppercase tracking-wider">Initial Source Code</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write some code..." 
                        className="font-mono bg-[#0d0d12] text-gray-300 border-border/50 h-64 resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={createRepl.isPending}
                  className="font-mono font-bold tracking-wide w-full md:w-auto"
                >
                  {createRepl.isPending ? "INITIALIZING..." : "LAUNCH REPL"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
