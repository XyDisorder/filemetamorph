import React from "react";
import { TabsContainer } from "../components/containers/TabsContainer";
import { OutputFormatSelectorContainer } from "../components/containers/OutputFormatSelectorContainer";
import { FileDropperContainer } from "../components/containers/FileDropperContainer";
import ConvertButtonContainer from "../components/containers/ConvertButtonContainer";

export default function Home() {
  return(
    <div>
      <TabsContainer />
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {/* Zone de glisser-déposer */}
      <div className="mb-8">
        <FileDropperContainer />
      </div>
      
      {/* Contrôles de conversion - Pas de bordure supérieure ni de padding supérieur */}
      <div className="flex items-center justify-between gap-4">
    <div className="flex items-center">
      <span className="text-teal-400 text-s mr-3">OUTPUT FORMAT :</span>
      <OutputFormatSelectorContainer />
    </div>
        
        <ConvertButtonContainer />
      </div>
    </div>
    </div>
  )
}

