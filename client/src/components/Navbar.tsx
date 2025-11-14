'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from './ui/button'
import { Moon, Sun, Radio } from 'lucide-react'

interface HeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

export default function Navbar({ isDarkMode, toggleTheme }: HeaderProps) {
  const [isStreaming, setIsStreaming] = useState(false)

  // Simulate stream connection check
  useEffect(() => {
    // In production, this would check actual stream connection
    const timer = setTimeout(() => setIsStreaming(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-10 w-full backdrop-blur-sm p-4 border-b border-border/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Lottery</h1>
          {isStreaming && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full">
              <Radio className="w-3 h-3 text-green-400" />
              <span className="text-xs font-medium text-green-400">Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={toggleTheme} variant="outline" size="sm">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
