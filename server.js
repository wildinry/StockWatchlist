const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const natural = require('natural');
const { std, log } = require('mathjs');

puppeteer.use(StealthPlugin());
const app = express();
app.use(cors());
app.use(express.json());

// --- Sentiment Analysis Setup ---
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

function getSentiment(text) {
    const tokens = tokenizer.tokenize(text);
    const score = analyzer.getSentiment(tokens);
    return score > 0.15 ? 'Positive' : score < -0.15 ? 'Negative' : 'Neutral';
}

// --- Technical Analysis Functions ---
function calculateEMA(data, period) {
    if (data.length === 0) return [];
    const k = 2 / (period + 1);
    let ema = [data[0]];
    for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
}

function calculateHurst(prices) {
    if (prices.length < 10) return 0.5;
    try {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push(Math.log(prices[i] / prices[i - 1]));
        }
        const rs = (Math.max(...returns) - Math.min(...returns)) / std(returns);
        const h = Math.log(rs) / Math.log(returns.length);
        return parseFloat(h.toFixed(2));
    } catch (e) { return 0.5; }
}

// --- Scraper: News & Prices ---
async function scrapeData(ticker) {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let results = { news: [], prices: [] };

    try {
        // 1. Scrape News
        await page.goto(`https://www.google.com/search?q=${ticker}+stock+news&tbm=nws&tbs=qdr:d`, { waitUntil: 'networkidle2' });
        results.news = await page.evaluate((t) => {
            return Array.from(document.querySelectorAll('a')).map(link => {
                const titleEl = link.querySelector('[role="heading"], h3');
                if (!titleEl) return null;
                const container = link.closest('div, g-card');
                return {
                    ticker: t,
                    title: titleEl.innerText,
                    link: link.href,
                    source: container?.querySelector('cite, .Mg7P1')?.innerText || "News",
                    time: container?.querySelector('span, .OSrXXb')?.innerText || "24h"
                };
            }).filter(a => a && a.link.includes('http')).slice(0, 10);
        }, ticker);

        // 2. Scrape Prices (Yahoo Finance)
        await page.goto(`https://finance.yahoo.com/quote/${ticker}/history`, { waitUntil: 'networkidle2' });
        const rawPrices = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('table tbody tr')).slice(0, 30).map(row => {
                const cols = row.querySelectorAll('td');
                return cols.length >= 6 ? { date: cols[0].innerText, close: parseFloat(cols[4].innerText.replace(/,/g, '')) } : null;
            }).filter(r => r && !isNaN(r.close)).reverse();
        });

        const closes = rawPrices.map(p => p.close);
        const emaData = calculateEMA(closes, 12);
        const hVal = calculateHurst(closes);

        results.prices = rawPrices.map((p, i) => ({ ...p, ema: emaData[i], hurst: hVal }));
        results.news = results.news.map(n => ({ ...n, sentiment: getSentiment(n.title) }));

    } catch (e) { console.error("Scrape error:", e); }
    
    await browser.close();
    return results;
}

app.get('/api/data/:ticker', async (req, res) => {
    const data = await scrapeData(req.params.ticker);
    res.json(data);
});

app.listen(5000, () => console.log('Backend running at http://localhost:5000'));
