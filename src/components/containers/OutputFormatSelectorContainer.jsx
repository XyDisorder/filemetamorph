import React, { useEffect } from "react";
import useFileStore from "../../stores/FileStore";
import OutputFormatSelector from "../features/OutputFormat/OutputFormatSelector";
import useTabStore from "../../stores/TabStore";


export function OutputFormatSelectorContainer() {
  const currentOutputFormat = useFileStore(state => state.outputFormat);
  const setOutputFormat = useFileStore(state => state.setOutputFormat);
  const getOutputFormats = useFileStore(state => state.getOutputFormats);
  
  const activeTab = useTabStore(state => state.activeTab);

  const availableOutputFormats = getOutputFormats(activeTab);

  // MAJ ouput format when user changes tab
  useEffect(() => {
    const formatExists = availableOutputFormats.some(format => format.value === currentOutputFormat);
    if (!formatExists && availableOutputFormats.length > 0) {
      setOutputFormat(availableOutputFormats[0].value);
    }
  }, [activeTab, availableOutputFormats, currentOutputFormat, setOutputFormat]);

  const handleFormatChange = (e) => {
    setOutputFormat(e.target.value);
  };

  return (
    <OutputFormatSelector 
      outputFormat={currentOutputFormat}
      handleFormatChange={handleFormatChange}
      availableFormats={availableOutputFormats}
    />
  );
}