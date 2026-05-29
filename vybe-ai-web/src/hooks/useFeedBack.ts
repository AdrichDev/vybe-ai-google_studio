import { useState, useCallback } from "react";

export function useFeedback(delay = 2500) {
  const [feedback, setFeedback] = useState("");

  const triggerFeedback = useCallback(
    (msg: string) => {
      setFeedback(msg);
      const timer = setTimeout(() => {
        setFeedback("");
      }, delay);
      return () => clearTimeout(timer);
    },
    [delay],
  );

  return { feedback, triggerFeedback, setFeedback };
}
