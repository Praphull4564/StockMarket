import { getWatchlist } from "@/lib/actions/watchlist.actions";
import Link from "next/link";
import { Star } from "lucide-react";

async function fetchQuote(symbol: string) {
  try {
    const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) return null;
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default async function DashboardWatchlist() {
  const watchlist = await getWatchlist();
  const top4 = watchlist.slice(0, 4);

  const itemsWithQuotes = await Promise.all(
    top4.map(async (item: any) => {
      const quote = await fetchQuote(item.symbol);
      return { ...item, quote };
    })
  );

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-600 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-100">Your Watchlist</h2>
        <Link href="/watchlist" className="text-sm text-gray-400 hover:text-white transition-colors">
          View all
        </Link>
      </div>

      {itemsWithQuotes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Star className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No stocks in your watchlist yet.</p>
          <Link href="/watchlist" className="search-btn">
            Find Stocks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 flex-1">
          {itemsWithQuotes.map((item) => {
            const currentPrice = item.quote?.c || 0;
            const change = item.quote?.d || 0;
            const changePercent = item.quote?.dp || 0;
            const isPositive = change >= 0;

            return (
              <Link 
                href={`/stocks/${item.symbol}`} 
                key={item.symbol}
                className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between hover:bg-gray-600 transition-colors border border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center font-bold text-xs text-white">
                    {item.symbol.substring(0, 2)}
                  </div>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <h3 className="text-gray-100 font-medium mb-1 truncate" title={item.company || item.symbol}>
                    {item.company || item.symbol}
                  </h3>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-bold text-white">${currentPrice.toFixed(2)}</span>
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
