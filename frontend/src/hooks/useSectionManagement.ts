import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  setSections,
  setCurrentSection,
  addSection,
  updateSection,
  deleteSection,
} from "@/store/sectionSlice";
import { sectionAPI } from "@/api/sectionAPI";

export const useSectionManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentNotebook } = useSelector(
    (state: RootState) => state.notebook
  );
  const { sections, currentSection } = useSelector(
    (state: RootState) => state.section
  );

  const loadSections = useCallback(async () => {
    if (!currentNotebook) return;
    try {
      const data = await sectionAPI.getSections(currentNotebook.id);
      dispatch(setSections(data));
    } catch (error) {
      console.error("Failed to load sections:", error);
    }
  }, [currentNotebook, dispatch]);

  const selectSection = useCallback(
    async (sectionId: string) => {
      try {
        const section = await sectionAPI.getSection(sectionId);
        dispatch(setCurrentSection(section));
      } catch (error) {
        console.error("Failed to load section:", error);
      }
    },
    [dispatch]
  );

  const createSection = useCallback(
    async (name: string) => {
      if (!currentNotebook) return;
      try {
        const newSection = await sectionAPI.createSection(
          currentNotebook.id,
          {
            name,
            position: sections.length,
          }
        );
        dispatch(addSection(newSection));
        dispatch(setCurrentSection(newSection));
        return newSection;
      } catch (error) {
        console.error("Failed to create section:", error);
      }
    },
    [currentNotebook, sections.length, dispatch]
  );

  const renameSection = useCallback(
    async (sectionId: string, newName: string) => {
      try {
        const updated = await sectionAPI.updateSection(sectionId, {
          name: newName,
        });
        dispatch(updateSection(updated));
      } catch (error) {
        console.error("Failed to rename section:", error);
      }
    },
    [dispatch]
  );

  const removeSection = useCallback(
    async (sectionId: string) => {
      try {
        await sectionAPI.deleteSection(sectionId);
        dispatch(deleteSection(sectionId));
      } catch (error) {
        console.error("Failed to delete section:", error);
      }
    },
    [dispatch]
  );

  return {
    sections,
    currentSection,
    loadSections,
    selectSection,
    createSection,
    renameSection,
    removeSection,
  };
};
