import React from "react";
import BannerLogo from "../common/Logo/BannerLogo";

function Header() {
  return (
<header className="bg-gray-900 text-white shadow-md">
  <div className="container mx-auto flex items-center justify-between py-3 px-4 space-x-6">
    <div className="flex items-center space-x-3">
      <BannerLogo className="w-48 h-auto" />
    </div>
  </div>
</header>
  );
}

export default Header;