import type { Viewer } from "../lib/github";
import styles from "./SignedInScreen.module.css";

type Props = {
  viewer: Viewer;
  onSignOut: () => void;
};

export function SignedInScreen({ viewer, onSignOut }: Props) {
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <img className={styles.avatar} src={viewer.avatarUrl} alt={viewer.login} />
          <span className={styles.name}>{viewer.name ?? viewer.login}</span>
        </div>
        <button className={styles.signOut} onClick={onSignOut}>
          Sign out
        </button>
      </header>
      <div className={styles.body}>Pull request list coming next.</div>
    </div>
  );
}
