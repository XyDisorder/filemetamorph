// components/Footer.jsx
import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-6 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
          {/* can add other things */}
          </div>
          
          {/* TODO LEGAL PAGES  */}
          <div className="flex items-center space-x-4">
            <a href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</a>
            <span className="text-gray-600">|</span>
            <a href="/terms" className="hover:text-teal-400 transition-colors">Terms</a>
            <span className="text-gray-600">|</span>
            <a href="/cookies" className="hover:text-teal-400 transition-colors">Cookies</a>
            <span className="text-gray-600">|</span>
            <a href="/legal" className="hover:text-teal-400 transition-colors">Legal</a>
          </div>
          
          {/* GitHub Icon */}
          <div className="flex-shrink-0">
            <a 
              href="https://github.com/XyDisorder/filemetamorph"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © {currentYear} File Metamorph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;