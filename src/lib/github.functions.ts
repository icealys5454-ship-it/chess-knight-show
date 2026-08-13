import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GITHUB_REPO } from "@/config/github";

declare const __GIT_BRANCH__: string | undefined;

const GATEWAY_URL = "https://connector-gateway.lovable.dev/github";

const branchSchema = z.array(
  z.object({
    name: z.string(),
    commit: z.object({ sha: z.string(), url: z.string() }).optional(),
    protected: z.boolean().optional(),
  }),
);

export const listGitHubBranches = createServerFn({ method: "GET" }).handler(
  async () => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const githubKey = process.env["GITHUB_API_KEY"];

    if (!lovableKey || !githubKey) {
      // Graceful degradation when the GitHub connector is not linked yet.
      return {
        ok: false as const,
        branches: [] as string[],
        current: (globalThis as unknown as { __GIT_BRANCH__?: string }).__GIT_BRANCH__ ?? "unknown",
        error: "GitHub connector not configured",
      };
    }

    try {
      const response = await fetch(
        `${GATEWAY_URL}/repos/${GITHUB_REPO.owner}/${GITHUB_REPO.repo}/branches?per_page=100`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": githubKey,
          },
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub API error ${response.status}: ${text}`);
      }

      const data = branchSchema.parse(await response.json());
      const branches = data.map((b) => b.name);

      return {
        ok: true as const,
        branches,
        current: (globalThis as unknown as { __GIT_BRANCH__?: string }).__GIT_BRANCH__ ?? "unknown",
      };
    } catch (err) {
      console.error("Failed to list GitHub branches:", err);
      return {
        ok: false as const,
        branches: [] as string[],
        current: (globalThis as unknown as { __GIT_BRANCH__?: string }).__GIT_BRANCH__ ?? "unknown",
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  },
);
