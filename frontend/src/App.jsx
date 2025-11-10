import { useEffect, useState } from "react";
import { SDK } from "@somnia-chain/streams";
import { createPublicClient, http } from "viem";
import { somniaTestnet } from "./lib/somnia";
import CreateLottery from "./components/CreateLottery";

const client = createPublicClient({
  chain: somniaTestnet,
  transport: http(somniaTestnet.rpcUrls.default.http[0])
});

const sdk = new SDK({
  public: client
});

export default function App() {
  const [lotteries, setLotteries] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const sub = sdk.streams.subscribePrefix("lottery:", (key, data) => {
      const id = key.split(":")[1];
      setLotteries((prev) => ({ ...prev, [id]: { id, ...data } }));
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🎟️ Somnia Lottery</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
          >
            {showCreateForm ? '📋 View Lotteries' : '➕ Create Lottery'}
          </button>
        </div>

        {showCreateForm ? (
          <CreateLottery />
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">🔴 Live Lotteries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(lotteries).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 text-lg">No active lotteries yet</p>
                  <p className="text-gray-500 text-sm mt-2">Create one to get started!</p>
                </div>
              ) : (
                Object.values(lotteries).map((lottery) => (
                  <div
                    key={lottery.id}
                    className="border border-gray-700 p-6 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 hover:border-purple-500 transition-all"
                  >
                    <div className="text-xl font-bold mb-3">Lottery #{lottery.id}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tickets Sold:</span>
                        <span className="font-semibold">{lottery.ticketsSold || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pot:</span>
                        <span className="font-semibold text-green-400">
                          {lottery.pot ? (Number(lottery.pot) / 1e18).toFixed(4) : '0'} STT
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span
                          className={`font-semibold uppercase ${
                            lottery.status === 'open'
                              ? 'text-green-400'
                              : lottery.status === 'drawn'
                              ? 'text-blue-400'
                              : 'text-red-400'
                          }`}
                        >
                          {lottery.status || 'open'}
                        </span>
                      </div>
                    </div>

                    <button
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
                      onClick={() => window.location.href = `/lottery.html?id=${lottery.id}`}
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
