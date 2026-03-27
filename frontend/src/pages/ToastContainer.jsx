import useToastStore from "../store/useToastStore";
import "../styles/components/Toast.css";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.visibleToasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "!";
      case "info":
        return "i";
      case "warning":
        return "⚠";
      default:
        return "•";
    }
  };

  return (
    <div className="app-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`app-toast app-toast--${toast.type}`}>
          <div className="app-toast__content">
            <div className="app-toast__icon">{getIcon(toast.type)}</div>
            <span className="app-toast__message">{toast.message}</span>
          </div>

          <button
            type="button"
            className="app-toast__close"
            onClick={() => removeToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}