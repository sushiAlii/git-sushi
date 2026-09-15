import { openUrl } from "@tauri-apps/plugin-opener";
import type { DeviceCode } from "../lib/github";
import styles from "./LoginScreen.module.css";

type Props = {
  status: "signed-out" | "awaiting-device";
  deviceCode?: DeviceCode;
  error?: string;
  onSignIn: () => void;
};

export function LoginScreen({ status, deviceCode, error, onSignIn }: Props) {
  if (status === "awaiting-device" && deviceCode) {
    return (
      <div className={styles.screen}>
        <h1 className={styles.heading}>Almost there</h1>
        <p className={styles.subheading}>Enter this code on GitHub to finish signing in.</p>
        <div className={styles.card}>
          <span className={styles.code}>{deviceCode.user_code}</span>
          <button
            className={styles.button}
            onClick={() => openUrl(deviceCode.verification_uri)}
          >
            Open GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.heading}>git-sushi</h1>
      <p className={styles.subheading}>Pull requests that need you, in one plate.</p>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} onClick={onSignIn}>
        Sign in with GitHub
      </button>
    </div>
  );
}
