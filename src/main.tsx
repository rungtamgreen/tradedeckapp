import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Defensive cleanup: unregister any previously installed service workers
// and clear their caches. This prevents stale app shells from being
// served (the "old layout came back" issue) on devices that registered
// an earlier service worker build. Runs once per page load and is a
// no-op once everything is already cleaned up.
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => {
      regs.forEach((reg) => reg.unregister().catch(() => {}));
    })
    .catch(() => {});

  if (typeof caches !== "undefined") {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
