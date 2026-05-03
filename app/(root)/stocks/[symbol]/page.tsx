import TradingViewWidget from "@/components/TradingViewWidget";
import {
  CANDLE_CHART_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";
import PriceAlertModal from "@/components/modals/PriceAlertModal";
import WatchlistButton from "@/components/WatchlistButton";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import StockOverviewSidebar from "@/components/StockOverviewSidebar";
import Link from "next/link";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email;
  const watchlist = email ? await getWatchlistSymbolsByEmail(email) : [];
  const isInWatchlist = watchlist.includes(symbol.toUpperCase());

  return (
    <div className="stock-page">
      {/* Page header */}
      <header className="stock-page-header">
        <div className="flex items-center gap-4">
          <Link href="/" className="stock-back-btn" title="Back to Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
              {symbol.toUpperCase()}
            </h1>
            <p className="text-sm text-gray-400">Stock Overview &amp; Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PriceAlertModal symbol={symbol.toUpperCase()} variant="btn" />
          <WatchlistButton
            symbol={symbol.toUpperCase()}
            company={symbol.toUpperCase()}
            isInWatchlist={isInWatchlist}
          />
        </div>
      </header>

      {/* Main content grid */}
      <section className="stock-grid">
        {/* Left column — charts & analysis */}
        <div className="stock-main">
          {/* Candlestick chart */}
          <div className="stock-card stock-chart-card">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}advanced-chart.js`}
              config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
              className="custom-chart"
              height="100%"
            />
          </div>
          
          {/* Analysis row */}
          <div className="stock-analysis-row">
            <div className="stock-card stock-analysis-card">
              <h3 className="stock-card-title">Technical Analysis</h3>
              <TradingViewWidget
                scriptUrl={`${scriptUrl}technical-analysis.js`}
                config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                height="100%"
              />
            </div>
            <div className="stock-card stock-analysis-card">
              <h3 className="stock-card-title">Financials</h3>
              <TradingViewWidget
                scriptUrl={`${scriptUrl}financials.js`}
                config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                height="100%"
              />
            </div>
          </div>
        </div>

        {/* Right column — overview sidebar + news */}
        <div className="stock-aside">
          <StockOverviewSidebar symbol={symbol} isInWatchlist={isInWatchlist} />
          
          <div className="stock-card stock-news-card">
            <h3 className="stock-card-title">Latest News</h3>
            <TradingViewWidget
              scriptUrl={`${scriptUrl}timeline.js`}
              config={{ ...TOP_STORIES_WIDGET_CONFIG, height: '100%' }}
              height="100%"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
