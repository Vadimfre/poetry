import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({ 
  message = "Ошибка загрузки", 
  onRetry, 
  retryText = "Попробуйте снова" 
}: ErrorStateProps) {
  return (
    <div className={styles.error}>
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryBtn}>
          {retryText}
        </button>
      )}
    </div>
  );
}
