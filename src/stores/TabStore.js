import { create } from "zustand"

export const useTabStore = create((set) => ({
  activeTab: "text",

  setActiveTab: (activeTab) => set({activeTab})
}))

