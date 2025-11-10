# 🎟️ Create Lottery Feature - Frontend Implementation

## Overview
This is a complete frontend implementation for the **Create Lottery** feature of the Somnia Lottery dApp.

## 📁 Files Created/Modified

### New Files:
- `src/components/CreateLottery.jsx` - Main create lottery form component
- `.env.example` - Environment variable template

### Modified Files:
- `src/App.jsx` - Added Create Lottery toggle and Somnia Streams integration
- `src/main.jsx` - Set up Wagmi, RainbowKit, and React Query providers

## 🎯 Features

### Create Lottery Component (`CreateLottery.jsx`)
✅ **Form Inputs:**
- Ticket Price (STT)
- Prize Amount (STT)
- Duration (Hours)

✅ **Validation:**
- Ensures ticket price ≤ 10% of prize amount (contract requirement)
- Real-time validation feedback
- Preview calculation showing profit structure

✅ **Smart Contract Integration:**
- Uses `wagmi` hooks (`useWriteContract`, `useWaitForTransactionReceipt`)
- Proper ETH value handling with `parseEther`
- Deadline calculation (current timestamp + duration)

✅ **UX Features:**
- Loading states (pending, confirming)
- Error handling and display
- Success confirmation with transaction hash
- Wallet connection check
- Beautiful gradient UI with Tailwind CSS

✅ **Information Display:**
- Preview panel showing all calculations
- Validation status indicators
- How-it-works info box
- Platform fee transparency (5%)

## 🔧 Technical Implementation

### Contract Function Called:
```solidity
createLottery(
  uint256 ticketPrice,
  uint256 prizeAmount,
  uint40 buyDeadline
) payable returns (uint256 id)
```

### Key Requirements:
1. `msg.value` must equal `prizeAmount`
2. `ticketPrice * 10 <= prizeAmount`
3. `buyDeadline > block.timestamp`

### Worker Integration:
The worker listens for `LotteryCreated` event and updates Somnia Streams in real-time.

## 🚀 Setup Instructions

### 1. Environment Variables
Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your contract address:
```
VITE_CONTRACT_ADDRESS=0xYourContractAddress
```

### 2. Install Dependencies (Already Done)
```bash
npm install
```

Key dependencies:
- `wagmi` - Ethereum interaction
- `viem` - Low-level Ethereum utilities
- `@rainbow-me/rainbowkit` - Wallet connection UI
- `@tanstack/react-query` - Async state management
- `@somnia-chain/streams` - Real-time updates
- `tailwindcss` - Styling

### 3. Run Development Server
```bash
npm run dev
```

## 📱 User Flow

1. **Connect Wallet** - User connects via RainbowKit
2. **Click "Create Lottery"** - Toggle to show form
3. **Fill Form:**
   - Enter ticket price (e.g., 0.01 STT)
   - Enter prize amount (e.g., 1.0 STT)
   - Set duration (e.g., 24 hours)
4. **Preview & Validate** - See calculations and validation
5. **Submit** - Approve transaction in wallet
6. **Confirm** - Wait for blockchain confirmation
7. **Success** - Lottery is created and appears in list

## 🎨 UI/UX Highlights

- **Gradient Cards** - Purple to indigo gradients
- **Real-time Validation** - Instant feedback on inputs
- **Calculation Preview** - Shows profit structure before creation
- **Transaction States** - Clear pending/confirming/success states
- **Responsive Design** - Works on mobile and desktop
- **Error Handling** - User-friendly error messages

## 🔄 Real-time Updates

The app uses **Somnia Streams** to subscribe to lottery updates:
- New lotteries appear automatically
- Ticket sales update in real-time
- Winner announcements broadcast instantly

```javascript
sdk.streams.subscribePrefix("lottery:", (key, data) => {
  const id = key.split(":")[1];
  setLotteries((prev) => ({ ...prev, [id]: { id, ...data } }));
});
```

## 💡 Contract Logic Recap

### Create Lottery:
1. Creator deposits prize amount
2. Sets ticket price (max 10% of prize)
3. Sets deadline

### After Sales:
- Winner gets full prize amount
- Creator gets 95% of all ticket sales
- Platform gets 5% of ticket sales

### Example:
- Prize: 1 STT
- Ticket: 0.1 STT
- 15 tickets sold = 1.5 STT in pot
- Winner: 1 STT
- Creator: 0.475 STT (95% of 0.5 profit)
- Platform: 0.025 STT (5% of 0.5 profit)

## 🐛 Troubleshooting

### "Please connect your wallet"
- Click the ConnectButton in top right
- Select your wallet and approve connection

### "Ticket price must be at most 10% of prize amount"
- Reduce ticket price or increase prize amount
- Formula: `ticketPrice * 10 ≤ prizeAmount`

### Transaction fails
- Check you have enough STT for prize + gas
- Verify contract address is correct in `.env`

## 📚 Next Steps

Additional features you might want to add:
- [ ] Lottery detail page
- [ ] Buy ticket functionality
- [ ] Creator dashboard
- [ ] Winner claiming UI
- [ ] Profit withdrawal UI
- [ ] Historical lotteries view
- [ ] Search and filter lotteries

## 🛠️ Tech Stack

- **React** 19.2.0
- **Viem** 2.38.6 - Ethereum interactions
- **Wagmi** 2.19.2 - React hooks for Ethereum
- **RainbowKit** 2.2.9 - Wallet connection
- **TanStack Query** 5.90.7 - State management
- **Tailwind CSS** 4.1.17 - Styling
- **Somnia Streams SDK** 0.9.5 - Real-time updates

## 📝 Notes

- The worker must be running to see real-time updates
- Contract must be deployed and address set in `.env`
- Uses Somnia Testnet (Chain ID: 50312)
- Requires STT tokens for transactions
