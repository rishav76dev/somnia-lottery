'use client'

import { useState } from "react";
import { Providers } from "./provider";
import Navbar from "../components/Navbar";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <Providers>
          <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          {children}
        </Providers>
      </div>
    </div>
  );
}
