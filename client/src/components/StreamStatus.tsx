'use client'

import { Radio } from 'lucide-react'

interface StreamStatusProps {
  isConnected: boolean
  className?: string
}

export function StreamStatus({ isConnected, className = '' }: StreamStatusProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Radio className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  )
}
