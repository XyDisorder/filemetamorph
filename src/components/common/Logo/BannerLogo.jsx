// BannerIcon.jsx
import React from "react";
import logoBanner from "../../../assets/logobanner.svg"

const BannerLogo = ({ width = 100, height = 100 }) => {
  return (
    <img 
    src={logoBanner} 
    alt="File Metamorph Logo" 
    className="h-full w-full object-contain transition-all duration-500 hover:scale-105 hover:translate-y-[-5px]"
    width={width}
    height={height}
  />
  ) 
}
    
export default BannerLogo