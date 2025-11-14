'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex flex-col items-center justify-center text-white p-8 pt-32">

      <div className="max-w-2xl text-center space-y-6">

        <h1 className="text-5xl font-bold leading-tight">
          🎟️ Somnia Lottery
        </h1>

        <p className="text-lg text-gray-300">
          Join decentralized lotteries or create your own — powered by Somnia Streams & smart contracts.
        </p>

        <div className="flex justify-center gap-4 mt-10">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => router.push('/all_lottery')}
          >
            Participate in Lottery
          </Button>

          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push('/create')}
          >
            Create Lottery
          </Button>
        </div>

        <div className="mt-10 flex justify-center text-sm text-gray-300">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
          Powered by Somnia Data Streams
        </div>

      </div>
    </main>
  )
}
