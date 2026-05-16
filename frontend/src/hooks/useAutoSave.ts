import { useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updatePageContent } from "@/store/pageSlice";
import { pageAPI } from "@/api/pageAPI";

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSave?: (pageId: string, content: string) => void;
}

export const useAutoSave = (
  pageId: string,
  options: UseAutoSaveOptions = {}
) => {
  const { debounceMs = 1000, onSave } = options;
  const dispatch = useDispatch<AppDispatch>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<string>("");

  const handleContentChange = useCallback(
    (newContent: string) => {
      contentRef.current = newContent;
      dispatch(updatePageContent({ pageId, content: newContent }));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          await pageAPI.updatePage(pageId, { content: newContent });
          onSave?.(pageId, newContent);
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, debounceMs);
    },
    [pageId, dispatch, debounceMs, onSave]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleContentChange };
};
