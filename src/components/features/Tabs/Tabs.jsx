import React from 'react';
import { useTabStore } from '../../../stores/TabStore';

const Tabs = () => {
  const { activeTab, setActiveTab } = useTabStore();

  const tabs = [
    { id: 'text', label: 'Text'  },
    { id: 'audio', label: 'Audio' },
    { id: 'image', label: 'Image' },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="flex mb-6">
      {tabs.map((tab) => {
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative px-8 py-2 text-lg font-medium transition-colors ${
              activeTab === tab.id ? 'text-teal-400' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-400"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;