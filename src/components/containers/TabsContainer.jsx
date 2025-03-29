import React from "react";
import { TABS } from "../../constants/tabsTypes";
import Tabs from "../features/Tabs/Tabs";
import { useTabStore } from "../../stores/TabStore";

export function TabsContainer() {
  // get current states from store
  const activeTab = useTabStore(state => state.activeTab);
  const setActiveTab = useTabStore(state => state.setActiveTab);
  
  return (
    <Tabs
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId)}
    />
  );
}