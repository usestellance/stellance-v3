import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TemplateStore {
  selectedTemplate: string | null;
  setTemplate: (templateId: string) => void;
  clearTemplate: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      selectedTemplate: null,
      setTemplate: (templateId) => set({ selectedTemplate: templateId }),
      clearTemplate: () => set({ selectedTemplate: null }),
    }),
    {
      name: "invoice-template", // storage key
    }
  )
);
