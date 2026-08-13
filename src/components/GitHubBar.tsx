import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, GitCommit, ExternalLink, RefreshCw } from "lucide-react";
import { GITHUB_REPO } from "@/config/github";
import { listGitHubBranches } from "@/lib/github.functions";

declare const __GIT_BRANCH__: string | undefined;

const buildBranch = __GIT_BRANCH__ ?? "unknown";

export function GitHubBar() {
  const fetchBranches = useServerFn(listGitHubBranches);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["github-branches"],
    queryFn: fetchBranches,
  });

  const current = data?.current ?? buildBranch;
  const branches = data?.branches ?? [];
  const connected = data?.ok === true;

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <a
        href={GITHUB_REPO.url}
        target="_blank"
        rel="noreferrer"
        className="github-bar-link"
        title="Open synced GitHub repository"
      >
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span className="hidden sm:inline">{GITHUB_REPO.owner}/{GITHUB_REPO.repo}</span>
      </a>

      <div className="github-bar-separator" />

      <div className="github-bar-branch">
        <GitBranch className="h-3.5 w-3.5" />
        <span className="font-mono-x text-xs">{current}</span>
      </div>

      {connected && branches.length > 0 ? (
        <select
          className="github-bar-select"
          value={current}
          onChange={(e) => {
            const branch = e.target.value;
            if (branch && branch !== current) {
              window.open(`${GITHUB_REPO.url}/tree/${encodeURIComponent(branch)}`, "_blank");
            }
          }}
          aria-label="Switch branch"
        >
          <option value="" disabled>
            Switch branch…
          </option>
          {branches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      ) : (
        <button
          className="github-bar-refresh"
          onClick={() => refetch()}
          disabled={isLoading}
          title={connected ? "No branches loaded" : "Refresh branch status (requires GitHub connector)"}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      )}

      <a
        href={`${GITHUB_REPO.url}/commits/${encodeURIComponent(current)}`}
        target="_blank"
        rel="noreferrer"
        className="github-bar-commits"
        title="View commits on current branch"
      >
        <GitCommit className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Commits</span>
      </a>

      <a
        href={`${GITHUB_REPO.url}/actions`}
        target="_blank"
        rel="noreferrer"
        className="github-bar-commits"
        title="View repository actions"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Actions</span>
      </a>

      {!connected && (
        <span className="github-bar-hint" title="Connect the GitHub API connector for live branch data">
          (live branches unavailable)
        </span>
      )}
    </div>
  );
}
