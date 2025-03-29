import React from "react";
import Tabs from "../components/features/Tabs/Tabs";
import { Dropper } from "../components/features/FileDropper/Dropper";
import OutputFormatSelector from "../components/features/OutputFormat/OutputFormatSelector";

export default function Home() {
  return(
    <div>
    <Tabs />
    <Dropper />
    <OutputFormatSelector />
    </div>
  )
}