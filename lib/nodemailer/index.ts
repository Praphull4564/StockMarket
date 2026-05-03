import nodemailer from 'nodemailer';
import {WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE, STOCK_ALERT_UPPER_EMAIL_TEMPLATE, STOCK_ALERT_LOWER_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Sanketak" <sanketak@jsmastery.pro>`,
        to: email,
        subject: `Welcome to Sanketak - your stock market toolkit is ready!`,
        text: 'Thanks for joining Sanketak',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Sanketak News" <sanketak@jsmastery.pro>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Sanketak`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export const sendStockAlertEmail = async (
    { email, symbol, company, currentPrice, targetPrice, condition, timestamp }: 
    { email: string; symbol: string; company: string; currentPrice: number; targetPrice: number; condition: string; timestamp: string }
): Promise<void> => {
    const template = condition === 'greater_than' ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;
    const htmlTemplate = template
        .replace(/{{symbol}}/g, symbol)
        .replace(/{{company}}/g, company)
        .replace(/{{currentPrice}}/g, `$${currentPrice.toFixed(2)}`)
        .replace(/{{targetPrice}}/g, `$${targetPrice.toFixed(2)}`)
        .replace(/{{timestamp}}/g, timestamp);

    const mailOptions = {
        from: `"Sanketak Alerts" <sanketak@jsmastery.pro>`,
        to: email,
        subject: `🚨 Price Alert: ${symbol} hit ${condition === 'greater_than' ? 'upper' : 'lower'} target!`,
        text: `Your price alert for ${symbol} was triggered at $${currentPrice.toFixed(2)}.`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export const sendMissYouEmail = async (
    { email, name }: { email: string; name: string }
): Promise<void> => {
    // Assuming we have a MISS_YOU_EMAIL_TEMPLATE, fallback to text if not
    const htmlTemplate = `
      <h1>We Miss You, ${name}</h1>
      <p>It's been a while since you checked your watchlist on Sanketak. The markets have been moving!</p>
      <a href="https://stock-market-dev.vercel.app/">Return to Dashboard</a>
    `;

    const mailOptions = {
        from: `"Sanketak" <sanketak@jsmastery.pro>`,
        to: email,
        subject: `We miss you at Sanketak!`,
        text: `Hi ${name}, it's been a while since you checked your watchlist.`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};
