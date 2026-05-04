# Sanketak - Professional Stock Market Analyzer

Sanketak is a sophisticated, full-stack stock market tracking and analysis platform. Built with a modern tech stack, it provides real-time market data, interactive charts, and personalized alerting systems to help investors make informed decisions.

![Sanketak Preview](https://github.com/Praphull4564/StockMarket/raw/main/public/assets/images/preview.png) *(Note: Replace with actual preview image if available)*

## 🚀 Key Features

- **Dynamic Market Dashboard**: Get an immediate pulse on the market with real-time S&P 500 heatmaps, top stories tickers, and sector performance tables.
- **Advanced Instrument Insights**: Deep dive into any symbol with interactive TradingView charts, fundamental analysis widgets, and technical indicators.
- **Intelligent Search**: A lightning-fast command-palette search that allows you to navigate across thousands of symbols seamlessly.
- **Personalized Watchlist**: Maintain a curated list of assets with real-time price snapshots and performance tracking.
- **Automated Price Alerts**: Set precise upper and lower price targets. Our background engine monitors the markets 24/7 and notifies you via email the moment a target is hit.
- **AI-Powered Digest**: Receive daily market summaries and personalized news digests summarized by advanced AI models (Gemini).
- **Secure Authentication**: Robust user authentication and session management powered by Better Auth.

## 🛠️ Technical Architecture

| Layer | Technology |
|-------|------------|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Backend** | [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations), [Inngest](https://www.inngest.com/) (Background Jobs) |
| **Database** | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| **Data APIs** | [Finnhub](https://finnhub.io/) (Market Data), [TradingView](https://www.tradingview.com/) (Interactive Widgets) |
| **AI Integration** | [Google Gemini](https://ai.google.dev/) (via Inngest step.ai) |
| **Email Service** | [Nodemailer](https://nodemailer.com/) |

## ⚙️ Environment Configuration

To run this project locally, you will need to set up the following environment variables in a `.env.local` file:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# Market Data
FINNHUB_API_KEY=your_finnhub_api_key
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key

# Application Config
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Background Jobs (Inngest)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Email (SMTP)
NODEMAILER_EMAIL=your_sending_email@gmail.com
NODEMAILER_PASSWORD=your_app_specific_password
```

## 🏃 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Praphull4564/StockMarket.git
   cd StockMarket
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the Database:**
   Ensure your MongoDB instance is running and the `MONGODB_URI` is correctly set.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Start Inngest Dev Server (Optional):**
   To test background jobs and AI steps locally:
   ```bash
   npx inngest-cli@latest dev
   ```

## 📈 Roadmap

- [ ] Real-time WebSocket integration for live price ticks.
- [ ] Portfolio tracking with profit/loss visualization.
- [ ] Multi-brokerage integration for direct trading.
- [ ] Mobile application (React Native).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Disclaimer: Sanketak is an analytical tool and does not provide financial advice. Trading stocks involves significant risk.*
