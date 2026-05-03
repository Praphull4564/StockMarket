import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";

interface StockOverviewSidebarProps {
  symbol: string;
  isInWatchlist: boolean;
}

const SYMBOL_OVERVIEW_CONFIG = (symbol: string) => ({
  symbols: [[symbol.toUpperCase(), `${symbol.toUpperCase()}|1D`]],
  chartOnly: false,
  width: "100%",
  height: "100%",
  locale: "en",
  colorTheme: "dark",
  autosize: true,
  showVolume: false,
  showMA: false,
  hideDateRanges: false,
  hideMarketStatus: true,
  hideSymbolLogo: false,
  scalePosition: "right",
  scaleMode: "Normal",
  fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
  fontSize: "10",
  noTimeScale: false,
  valuesTracking: "1",
  changeMode: "price-and-percent",
  chartType: "area",
  maLineColor: "#2962FF",
  maLineWidth: 1,
  maLength: 9,
  headerFontSize: "medium",
  lineWidth: 2,
  lineType: 0,
  dateRanges: [
    "1d|1",
    "1m|30",
    "3m|60",
    "12m|1D",
    "60m|1W",
    "all|1M",
  ],
  isTransparent: true,
});

export default function StockOverviewSidebar({ symbol, isInWatchlist }: StockOverviewSidebarProps) {
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <div className="stock-sidebar">
      {/* Watchlist toggle floating button */}
      <div className="stock-sidebar-actions">
        <div className="stock-sidebar-action-btn">
          <WatchlistButton 
            symbol={symbol.toUpperCase()} 
            company={symbol.toUpperCase()} 
            isInWatchlist={isInWatchlist} 
            type="icon" 
          />
        </div>
      </div>
      
      {/* TradingView Symbol Overview Widget - shows price, range, key stats */}
      <TradingViewWidget
        scriptUrl={`${scriptUrl}symbol-overview.js`}
        config={SYMBOL_OVERVIEW_CONFIG(symbol)}
        height="100%"
      />
    </div>
  );
}
