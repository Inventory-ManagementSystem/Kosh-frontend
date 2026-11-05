import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

const DISMISS_KEY = "pushPromptDismissed";

export default function PushPrompt() {
  const { isAuthenticated } = useAuth();
  const { supported, permission, busy, enable } = usePushNotifications();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1",
  );

  if (!supported || !isAuthenticated) return null;
  if (permission !== "default" || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-(--accent-color) bg-(--border-color) p-4 text-sm text-(--text-color) shadow-lg">
      <p className="mb-3">Turn on notifications to get updates instantly.</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-(--secondary-text-color)"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="rounded-md bg-(--accent-color) px-3 py-1 text-(--page-background) disabled:opacity-60"
        >
          {busy ? "Enabling..." : "Enable"}
        </button>
      </div>
    </div>
  );
}
