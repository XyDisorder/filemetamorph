import React from "react";
import { Dropper } from "../components/features/FileDropper/Dropper";
import { TabsContainer } from "../components/containers/TabsContainer";
import { OutputFormatSelectorContainer } from "../components/containers/OutputFormatSelectorContainer";

export default function Home() {
  return(
    <div>
      <TabsContainer />
      <Dropper />
      <OutputFormatSelectorContainer />
    </div>
  )
}