import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/30 animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-purple-500/20 rounded w-3/4"></div>
        <div className="h-4 bg-purple-500/20 rounded w-full"></div>
        <div className="h-4 bg-purple-500/20 rounded w-2/3"></div>
        <div className="h-10 bg-purple-500/20 rounded w-full mt-4"></div>
      </div>
    </div>
  )
}
