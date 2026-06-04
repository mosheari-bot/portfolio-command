import { Router } from "express";
import { db, replsTable } from "@workspace/db";
import { eq, ilike, sql, desc } from "drizzle-orm";
import {
  CreateReplBody,
  UpdateReplBody,
  ListReplsQueryParams,
  GetReplParams,
  UpdateReplParams,
  DeleteReplParams,
  RunReplParams,
} from "@workspace/api-zod";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

const router = Router();

router.get("/repls", async (req, res) => {
  const parse = ListReplsQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { language, search } = parse.data;

  let query = db.select().from(replsTable);
  const conditions = [];

  if (language) {
    conditions.push(eq(replsTable.language, language));
  }
  if (search) {
    conditions.push(ilike(replsTable.name, `%${search}%`));
  }

  const repls = await db
    .select()
    .from(replsTable)
    .where(conditions.length ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : undefined)
    .orderBy(desc(replsTable.updatedAt));

  res.json(repls.map(formatRepl));
});

router.post("/repls", async (req, res) => {
  const parse = CreateReplBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [repl] = await db
    .insert(replsTable)
    .values({
      name: parse.data.name,
      description: parse.data.description ?? null,
      language: parse.data.language,
      code: parse.data.code,
    })
    .returning();

  res.status(201).json(formatRepl(repl));
});

router.get("/repls/stats", async (req, res) => {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(replsTable);

  const byLanguage = await db
    .select({
      language: replsTable.language,
      count: sql<number>`count(*)::int`,
    })
    .from(replsTable)
    .groupBy(replsTable.language)
    .orderBy(desc(sql`count(*)`));

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const [recentResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(replsTable)
    .where(sql`${replsTable.createdAt} >= ${oneWeekAgo}`);

  res.json({
    total: totalResult.count,
    byLanguage,
    recentCount: recentResult.count,
  });
});

router.get("/repls/:id", async (req, res) => {
  const parse = GetReplParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [repl] = await db
    .select()
    .from(replsTable)
    .where(eq(replsTable.id, parse.data.id));

  if (!repl) {
    res.status(404).json({ error: "Repl not found" });
    return;
  }

  res.json(formatRepl(repl));
});

router.patch("/repls/:id", async (req, res) => {
  const paramsParse = UpdateReplParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParse.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParse = UpdateReplBody.safeParse(req.body);
  if (!bodyParse.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [repl] = await db
    .update(replsTable)
    .set({ ...bodyParse.data, updatedAt: new Date() })
    .where(eq(replsTable.id, paramsParse.data.id))
    .returning();

  if (!repl) {
    res.status(404).json({ error: "Repl not found" });
    return;
  }

  res.json(formatRepl(repl));
});

router.delete("/repls/:id", async (req, res) => {
  const parse = DeleteReplParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(replsTable).where(eq(replsTable.id, parse.data.id));
  res.status(204).send();
});

router.post("/repls/:id/run", async (req, res) => {
  const parse = RunReplParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [repl] = await db
    .select()
    .from(replsTable)
    .where(eq(replsTable.id, parse.data.id));

  if (!repl) {
    res.status(404).json({ error: "Repl not found" });
    return;
  }

  const start = Date.now();

  try {
    const result = await executeCode(repl.language, repl.code);
    const executionTimeMs = Date.now() - start;
    res.json({ ...result, executionTimeMs });
  } catch (err: unknown) {
    const executionTimeMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    res.json({ output: "", exitCode: 1, executionTimeMs, error: message });
  }
});

async function executeCode(
  language: string,
  code: string
): Promise<{ output: string; exitCode: number; error: string | null }> {
  const tmpFile = join(tmpdir(), `repl-${randomUUID()}`);

  const langMap: Record<string, { ext: string; cmd: string; args?: string[] }> = {
    javascript: { ext: ".js", cmd: "node" },
    typescript: { ext: ".ts", cmd: "npx", args: ["tsx"] },
    python: { ext: ".py", cmd: "python3" },
    bash: { ext: ".sh", cmd: "bash" },
    html: { ext: ".html", cmd: "echo", args: ["HTML preview not supported in terminal"] },
    css: { ext: ".css", cmd: "echo", args: ["CSS preview not supported in terminal"] },
  };

  const lang = langMap[language.toLowerCase()];
  if (!lang) {
    return { output: "", exitCode: 1, error: `Unsupported language: ${language}` };
  }

  const filePath = tmpFile + lang.ext;
  await writeFile(filePath, code, "utf-8");

  try {
    const args = lang.args ? [...lang.args, filePath] : [filePath];
    const { stdout, stderr } = await execFileAsync(lang.cmd, args, {
      timeout: 10000,
      maxBuffer: 1024 * 256,
    });
    return {
      output: stdout + (stderr ? `\nstderr:\n${stderr}` : ""),
      exitCode: 0,
      error: null,
    };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number; message?: string };
    return {
      output: (e.stdout ?? "") + (e.stderr ? `\nstderr:\n${e.stderr}` : ""),
      exitCode: e.code ?? 1,
      error: e.message ?? "Execution failed",
    };
  } finally {
    await unlink(filePath).catch(() => {});
  }
}

function formatRepl(repl: {
  id: number;
  name: string;
  description: string | null;
  language: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: repl.id,
    name: repl.name,
    description: repl.description,
    language: repl.language,
    code: repl.code,
    createdAt: repl.createdAt.toISOString(),
    updatedAt: repl.updatedAt.toISOString(),
  };
}

export default router;
