import { openUrl } from "@tauri-apps/plugin-opener";
import type { PullRequest } from "../lib/github";
import { usePullRequests } from "../hooks/usePullRequests";
import styles from "./PullRequestList.module.css";

function PullRequestRow({ pr, showAuthor }: { pr: PullRequest; showAuthor: boolean }) {
  return (
    <a
      className={styles.row}
      href={pr.url}
      onClick={(e) => {
        e.preventDefault();
        openUrl(pr.url);
      }}
    >
      <div className={styles.rowMain}>
        <span className={styles.title}>{pr.title}</span>
        <span className={styles.meta}>
          {pr.repository.nameWithOwner} #{pr.number}
        </span>
      </div>
      {pr.isDraft && <span className={styles.draft}>Draft</span>}
      {showAuthor && pr.author && <span className={styles.author}>{pr.author.login}</span>}
    </a>
  );
}

function PullRequestSection({
  title,
  pullRequests,
  emptyLabel,
  showAuthor,
}: {
  title: string;
  pullRequests: PullRequest[];
  emptyLabel: string;
  showAuthor: boolean;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {pullRequests.length === 0 ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : (
        <div className={styles.rows}>
          {pullRequests.map((pr) => (
            <PullRequestRow key={pr.id} pr={pr} showAuthor={showAuthor} />
          ))}
        </div>
      )}
    </section>
  );
}

export function PullRequestList() {
  const pullRequests = usePullRequests();

  if (pullRequests.isPending) {
    return <p className={styles.status}>Loading pull requests…</p>;
  }

  if (pullRequests.isError) {
    return <p className={styles.status}>{pullRequests.error.message}</p>;
  }

  return (
    <div className={styles.list}>
      <PullRequestSection
        title="Your pull requests"
        pullRequests={pullRequests.data.authored}
        emptyLabel="No open pull requests."
        showAuthor={false}
      />
      <PullRequestSection
        title="Review requests"
        pullRequests={pullRequests.data.reviewRequested}
        emptyLabel="Nothing to review."
        showAuthor={true}
      />
    </div>
  );
}
