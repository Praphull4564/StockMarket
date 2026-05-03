export const dynamic = 'force-dynamic';

import { getWatchlist } from "@/lib/actions/watchlist.actions";
import { getAlerts } from "@/lib/actions/alert.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { Star, BellRing, TrendingUp, TrendingDown, Newspaper } from "lucide-react";
import Link from "next/link";
import PriceAlertModal from "@/components/modals/PriceAlertModal";
import RemoveWatchlistBtn from "@/components/RemoveWatchlistBtn";
import DeleteAlertBtn from "@/components/DeleteAlertBtn";

export default async function WatchlistPage() {
  const [watchlist, alerts, news] = await Promise.all([
    getWatchlist().catch(() => []),
    getAlerts().catch(() => []),
    getNews().catch(() => []),
  ]);

  const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  const watchlistWithQuotes = await Promise.all(
    watchlist.map(async (item: any) => {
      let quote = null;
      if (token) {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(item.symbol)}&token=${token}`, { next: { revalidate: 60 } });
          if (res.ok) quote = await res.json();
        } catch(e) {}
      }
      return { ...item, quote };
    })
  );

  return (
    <div className="wl-page">
      {/* Page Header */}
      <header className="wl-header">
        <div>
          <h1 className="wl-page-title">Watchlist & Alerts</h1>
          <p className="wl-page-subtitle">Monitor your stocks, manage price alerts, and stay up to date with the latest news.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="wl-add-stock-btn">
            <Star className="w-4 h-4" />
            Add Stock
          </Link>
          <PriceAlertModal variant="btn" />
        </div>
      </header>

      {/* Main 2-column grid: Watchlist + Alerts */}
      <div className="wl-grid">
        {/* Watchlist Table Section */}
        <section className="wl-table-section">
          <div className="wl-section-header">
            <h2 className="wl-section-title">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              My Watchlist
            </h2>
            <span className="wl-badge">{watchlist.length} stocks</span>
          </div>

          {watchlist.length === 0 ? (
            <div className="wl-empty-state">
              <Star className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Your watchlist is empty</h3>
              <p className="text-gray-500 mb-6 max-w-sm text-center">Search for stocks and add them to your watchlist to track their performance.</p>
              <Link href="/" className="wl-add-stock-btn">
                Explore Stocks
              </Link>
            </div>
          ) : (
            <div className="wl-table-wrap">
              <table className="wl-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Alert</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistWithQuotes.map((item: any) => {
                    const currentPrice = item.quote?.c || 0;
                    const change = item.quote?.d || 0;
                    const changePercent = item.quote?.dp || 0;
                    const isPositive = change >= 0;

                    return (
                      <tr key={item.symbol}>
                        <td>
                          <Link href={`/stocks/${item.symbol}`} className="flex items-center gap-3 hover:text-yellow-400 transition-colors">
                            <div className="wl-stock-icon">
                              {item.symbol.substring(0, 2)}
                            </div>
                            <span className="font-medium">{item.company || item.symbol}</span>
                          </Link>
                        </td>
                        <td>
                          <span className="wl-symbol-tag">{item.symbol}</span>
                        </td>
                        <td className="font-semibold text-gray-100">${currentPrice.toFixed(2)}</td>
                        <td>
                          <div className={`wl-change ${isPositive ? 'wl-change-up' : 'wl-change-down'}`}>
                            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                          </div>
                        </td>
                        <td>
                          <PriceAlertModal symbol={item.symbol} company={item.company} />
                        </td>
                        <td className="text-center">
                          <RemoveWatchlistBtn symbol={item.symbol} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Alerts Sidebar */}
        <aside className="wl-alerts-section">
          <div className="wl-section-header">
            <h2 className="wl-section-title">
              <BellRing className="w-5 h-5 text-yellow-500" />
              Active Alerts
            </h2>
            <span className="wl-badge">{alerts.length} / 10 alerts used</span>
          </div>

          <div className="wl-alerts-list">
            {alerts.length === 0 ? (
              <div className="wl-alerts-empty">
                <BellRing className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm">No active alerts yet.</p>
                <p className="text-gray-600 text-xs mt-1">Create one to get notified when a stock hits your target price.</p>
              </div>
            ) : (
              alerts.map((alert: any) => (
                <div key={alert._id} className="wl-alert-card">
                  <div className="wl-alert-top">
                    <div className="flex items-center gap-3">
                      <div className="wl-alert-icon">
                        {alert.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-100 leading-tight">{alert.name}</h4>
                        <p className="text-xs text-gray-500">{alert.symbol}</p>
                      </div>
                    </div>
                    <span className={`wl-alert-direction ${alert.condition === 'greater_than' ? 'text-green-400' : 'text-red-400'}`}>
                      {alert.condition === 'greater_than' ? '▲' : '▼'}
                    </span>
                  </div>
                  <div className="wl-alert-bottom">
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Trigger</p>
                      <p className="text-sm font-semibold text-gray-200">
                        Price {alert.condition === 'greater_than' ? '>' : '<'} ${alert.targetPrice}
                      </p>
                    </div>
                    <div className="flex items-center justify-end">
                      <DeleteAlertBtn alertId={alert._id.toString()} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* News Section */}
      <section className="wl-news-section">
        <div className="wl-section-header mb-6">
          <h2 className="wl-section-title">
            <Newspaper className="w-5 h-5 text-yellow-500" />
            Market News
          </h2>
        </div>
        <div className="watchlist-news">
          {(news || []).length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-8">No news available at this time.</p>
          ) : (
            (news || []).slice(0, 8).map((article: any, i: number) => (
              <Link key={i} href={article.url} target="_blank" className="news-item">
                <span className="news-tag">{article.related || 'Market'}</span>
                <h3 className="news-title">{article.headline}</h3>
                <div className="news-meta">
                  <span>{article.source}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(article.datetime * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="news-summary">{article.summary}</p>
                <div className="news-cta">
                  Read Article <span className="text-lg">→</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
