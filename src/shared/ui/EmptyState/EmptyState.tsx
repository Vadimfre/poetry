import { MessageCircle } from "lucide-react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: React.ReactNode;
  message?: string;
}

export function EmptyState({ 
  icon = <MessageCircle className={styles.emptyIcon} />, 
  message = "Комментариев пока нету" 
}: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      {icon}
      <p>{message}</p>
    </div>
  );
}
