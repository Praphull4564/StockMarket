import {inngest} from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendNewsSummaryEmail, sendWelcomeEmail, sendStockAlertEmail} from "@/lib/nodemailer";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.actions";
import { Alert } from "@/database/models/alert.model";
import { connectToDatabase } from "@/database/mongoose";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created'},
    async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) ||'Thanks for joining Sanketak. You now have the tools to track markets and make smarter moves.'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [ { event: 'app/send.daily.news' }, { cron: '0 12 * * *' } ],
    async ({ step }) => {
        // Step #1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)

        if(!users || users.length === 0) return { success: false, message: 'No users found for news email' };

        // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });

        // Step #3: (placeholder) Summarize news via AI
        const userNewsSummaries: { user: UserForNewsEmail; newsContent: string | null }[] = [];

        for (const { user, articles } of results) {
                try {
                    const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

                    const response = await step.ai.infer(`summarize-news-${user.email}`, {
                        model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                        body: {
                            contents: [{ role: 'user', parts: [{ text:prompt }]}]
                        }
                    });

                    const part = response.candidates?.[0]?.content?.parts?.[0];
                    const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.'

                    userNewsSummaries.push({ user, newsContent });
                } catch (e) {
                    console.error('Failed to summarize news for : ', user.email);
                    userNewsSummaries.push({ user, newsContent: null });
                }
            }

        // Step #4: (placeholder) Send the emails
        await step.run('send-news-emails', async () => {
                await Promise.all(
                    userNewsSummaries.map(async ({ user, newsContent}) => {
                        if(!newsContent) return false;

                        return await sendNewsSummaryEmail({ email: user.email, date: getFormattedTodayDate(), newsContent })
                    })
                )
            })

    }
)

export const checkPriceAlerts = inngest.createFunction(
    { id: 'check-price-alerts' },
    { cron: '*/15 * * * *' }, // Run every 15 minutes
    async ({ step }) => {
        // Step #1: Get all active alerts
        const activeAlerts = await step.run('get-active-alerts', async () => {
            await connectToDatabase();
            // Fetch alerts with user email. We need a join or fetch users separately.
            const alerts = await Alert.find({ isActive: true }).lean();
            if (!alerts.length) return [];
            
            const mongoose = await connectToDatabase();
            const db = mongoose.connection.db;
            if (!db) return [];

            const userIds = [...new Set(alerts.map(a => a.userId))];
            const users = await db.collection('user').find({ 
               $or: [
                 { id: { $in: userIds } },
                 { _id: { $in: userIds } } // Some adapters use _id as string
               ]
            }).toArray();

            const userMap = users.reduce((acc: any, u: any) => {
               acc[u.id || u._id.toString()] = u;
               return acc;
            }, {});

            return alerts.map(a => ({
               ...a,
               userEmail: userMap[a.userId]?.email,
               userName: userMap[a.userId]?.name || 'User'
            })).filter(a => a.userEmail);
        });

        if (!activeAlerts || activeAlerts.length === 0) return { success: true, message: 'No active alerts' };

        // Step #2: Fetch latest price for symbols and trigger
        const results = await step.run('check-and-trigger', async () => {
             const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
             if (!token) return { count: 0 };
             
             // group alerts by symbol to minimize api calls
             const symbols = [...new Set(activeAlerts.map(a => a.symbol))];
             const priceMap: Record<string, number> = {};

             await Promise.all(symbols.map(async (sym) => {
                 try {
                     const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${token}`;
                     const res = await fetch(url);
                     const data = await res.json();
                     if (data && data.c !== undefined && data.c !== 0) {
                         priceMap[sym] = data.c; // current price
                     }
                 } catch (e) {
                     console.error('Error fetching quote for', sym, e);
                 }
             }));

             let triggeredCount = 0;

             for (const alert of activeAlerts) {
                 const currentPrice = priceMap[alert.symbol];
                 if (!currentPrice) continue;

                 let isTriggered = false;
                 if (alert.condition === 'greater_than' && currentPrice >= alert.targetPrice) {
                     isTriggered = true;
                 } else if (alert.condition === 'less_than' && currentPrice <= alert.targetPrice) {
                     isTriggered = true;
                 }

                 if (isTriggered) {
                     const timestamp = new Date().toLocaleString();
                     await sendStockAlertEmail({
                         email: alert.userEmail,
                         symbol: alert.symbol,
                         company: alert.name,
                         currentPrice,
                         targetPrice: alert.targetPrice,
                         condition: alert.condition,
                         timestamp
                     });

                     await connectToDatabase();
                     await Alert.updateOne({ _id: alert._id }, { isActive: false, lastTriggeredAt: new Date() });
                     triggeredCount++;
                 }
             }
             return { count: triggeredCount };
        });

        return { success: true, message: `Checked ${activeAlerts.length} alerts, triggered ${results?.count || 0}` };
    }
);

