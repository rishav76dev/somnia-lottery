import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import lotteryAbi from '../abi/Lottery.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

export default function CreateLottery() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const [formData, setFormData] = useState({
    ticketPrice: '',
    prizeAmount: '',
    durationHours: '24',
  })

  const [formError, setFormError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError('')
  }

  const validateForm = () => {
    const ticketPrice = parseFloat(formData.ticketPrice)
    const prizeAmount = parseFloat(formData.prizeAmount)
    const duration = parseFloat(formData.durationHours)

    if (!ticketPrice || ticketPrice <= 0) {
      return 'Ticket price must be greater than 0'
    }

    if (!prizeAmount || prizeAmount <= 0) {
      return 'Prize amount must be greater than 0'
    }

    if (!duration || duration <= 0) {
      return 'Duration must be greater than 0'
    }

    // Contract constraint: ticketPrice * 10 <= prizeAmount
    if (ticketPrice * 10 > prizeAmount) {
      return 'Ticket price must be at most 10% of prize amount'
    }

    return null
  }

  const handleCreateLottery = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      const ticketPriceWei = parseEther(formData.ticketPrice)
      const prizeAmountWei = parseEther(formData.prizeAmount)
      const buyDeadline = Math.floor(Date.now() / 1000) + (parseFloat(formData.durationHours) * 3600)

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: lotteryAbi,
        functionName: 'createLottery',
        args: [ticketPriceWei, prizeAmountWei, buyDeadline],
        value: prizeAmountWei,
      })
    } catch (err) {
      setFormError(err.message)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">🎟️ Create Lottery</h2>
        <p className="text-gray-300">Please connect your wallet to create a lottery</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">🎟️ Create New Lottery</h2>

      <form onSubmit={handleCreateLottery} className="space-y-6">
        {/* Ticket Price */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Ticket Price (STT)
          </label>
          <input
            type="number"
            name="ticketPrice"
            step="0.001"
            min="0"
            value={formData.ticketPrice}
            onChange={handleInputChange}
            placeholder="0.01"
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Must be ≤ 10% of prize amount
          </p>
        </div>

        {/* Prize Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Prize Amount (STT)
          </label>
          <input
            type="number"
            name="prizeAmount"
            step="0.001"
            min="0"
            value={formData.prizeAmount}
            onChange={handleInputChange}
            placeholder="1.0"
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            You must deposit this amount when creating
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Duration (Hours)
          </label>
          <input
            type="number"
            name="durationHours"
            step="1"
            min="1"
            value={formData.durationHours}
            onChange={handleInputChange}
            placeholder="24"
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            required
          />
        </div>

        {/* Calculation Preview */}
        {formData.ticketPrice && formData.prizeAmount && (
          <div className="bg-gray-800 p-4 rounded-lg space-y-2">
            <h3 className="text-white font-semibold mb-2">📊 Preview</h3>
            <div className="text-sm text-gray-300">
              <p>💰 Prize Pool: {formData.prizeAmount} STT</p>
              <p>🎫 Ticket Price: {formData.ticketPrice} STT</p>
              <p>
                ✅ Ticket/Prize Ratio:{' '}
                {((parseFloat(formData.ticketPrice) / parseFloat(formData.prizeAmount)) * 100).toFixed(2)}%
                {parseFloat(formData.ticketPrice) * 10 <= parseFloat(formData.prizeAmount) ? (
                  <span className="text-green-400"> (Valid)</span>
                ) : (
                  <span className="text-red-400"> (Invalid - Max 10%)</span>
                )}
              </p>
              <p>
                📈 Creator Profit (95% of ticket sales after prize payout)
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Platform fee: 5% of profits
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(formError || error) && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            <p className="font-semibold">❌ Error</p>
            <p className="text-sm">{formError || error?.message}</p>
          </div>
        )}

        {/* Success Display */}
        {isSuccess && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
            <p className="font-semibold">✅ Success!</p>
            <p className="text-sm">Lottery created successfully!</p>
            {hash && (
              <p className="text-xs mt-1 break-all">
                Tx: {hash}
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || isConfirming}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-200 ${
            isPending || isConfirming
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
          }`}
        >
          {isPending
            ? '⏳ Waiting for approval...'
            : isConfirming
            ? '⏳ Creating lottery...'
            : '🚀 Create Lottery'}
        </button>

        {/* Info Box */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong>ℹ️ How it works:</strong>
          </p>
          <ul className="text-xs text-blue-300 mt-2 space-y-1 list-disc list-inside">
            <li>You deposit the prize amount when creating the lottery</li>
            <li>Users buy tickets until the deadline</li>
            <li>Winner receives the prize amount</li>
            <li>You receive 95% of all ticket sales as profit</li>
            <li>Platform takes 5% fee on profits</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
