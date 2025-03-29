import React from 'react';

const Tabs = ({tabs, activeTab, onTabChange}) => {
  return (
    <div className="flex mb-6">
      {tabs.map((tab) => {
        return (
          <button
            key={tab.id}  
            onClick={() => onTabChange(tab.id)}  
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