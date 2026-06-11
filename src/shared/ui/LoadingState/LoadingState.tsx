import { Loader2 } from "lucide-react";
import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "Загрузка..." }: LoadingStateProps) {
  return (
    <div className={styles.loading}>
      <Loader2 className="animate-spin" />
      <span>{text}</span>
    </div>
  );
}
