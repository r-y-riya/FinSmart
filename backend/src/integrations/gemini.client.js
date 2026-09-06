import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Default to Google Gemini 3.6 Flash (available on free tier)
const GEMINI_MODEL = 'gemini-3.6-flash';

// Circuit-breaker timestamp for Gemini rate limiting (429)
let geminiRateLimitedUntil = 0;

// In-flight askFinSmart request deduplication map
const inFlightAsk = new Map();

// Lazy-initialized GoogleGenAI instance
let genAIInstance = null;

function getGenAI() {
  if (!genAIInstance && env.GEMINI_API_KEY) {
    genAIInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return genAIInstance;
}

/**
 * Gemini REST API Client using official @google/genai SDK
 * with rate-limit circuit breaking, deduplication, and grounded deterministic fallbacks.
 */
export const geminiClient = {
  /**
   * Checks whether Gemini is currently in rate-limit cooldown
   */
  isRateLimited() {
    return Date.now() < geminiRateLimitedUntil;
  },

  /**
   * Generates a grounded "Why This Matters" explanation based strictly on supplied evidence
   */
  async generateWhyItMatters({ symbol, companyName, percentageChange, volumeRatio, attentionScore, news = [], signals = [] }) {
    if (!env.GEMINI_API_KEY) {
      logger.warn('[Gemini] API key not configured, returning deterministic fallback insight');
      return this.deterministicFallbackWhyItMatters({ symbol, companyName, percentageChange, volumeRatio, attentionScore, signals });
    }

    if (this.isRateLimited()) {
      return this.deterministicFallbackWhyItMatters({ symbol, companyName, percentageChange, volumeRatio, attentionScore, signals });
    }

    const systemInstruction = `You are FinSmart's Financial Intelligence Synthesis Engine.
Your task is to explain "Why This Matters" to an investor who wants to understand significant market changes.

STRICT ACCURACY RULES:
1. Ground your answer ONLY in the provided facts: price change, volume ratio, attention score, and news snippets.
2. NEVER fabricate numbers, statistics, or news headlines.
3. NEVER provide financial advice, price predictions, or buy/sell recommendations.
4. Distinguish facts (what happened) from inference (why it matters).
5. Output format must be strictly JSON with the following structure:
{
  "summary": "1 concise sentence summarizing the core factual movement",
  "whyItMatters": "2-3 clear sentences analyzing institutional vs retail participation, volume significance, and market context",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "evidence": ["bullet 1", "bullet 2"]
}`;

    const prompt = `Stock: ${symbol} (${companyName})
Price Shift: ${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%
Volume Ratio: ${volumeRatio.toFixed(2)}x reference volume
Attention Score: ${attentionScore} / 100
Key Signals: ${signals.map(s => s.description || s.type).join('; ')}
Relevant News: ${news.length ? news.map(n => `"${n.title}" (${n.source})`).slice(0, 3).join('; ') : 'No breaking news reported'}`;

    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(text);
      return {
        summary: parsed.summary,
        whyItMatters: parsed.whyItMatters,
        confidence: parsed.confidence || 'HIGH',
        evidence: parsed.evidence || [`Price moved ${percentageChange.toFixed(1)}%`, `Volume was ${volumeRatio.toFixed(1)}× normal`],
      };
    } catch (err) {
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        geminiRateLimitedUntil = Date.now() + 60 * 1000;
        logger.warn(`[Gemini] Rate limit (429) hit during why-it-matters for ${symbol}. Activating 60s circuit breaker.`);
      } else {
        logger.error(`[Gemini] Error generating why-it-matters for ${symbol}: ${err.message}`);
      }
      return this.deterministicFallbackWhyItMatters({ symbol, companyName, percentageChange, volumeRatio, attentionScore, signals });
    }
  },

  /**
   * Generates a "While You Were Away" executive watchlist briefing
   */
  async generateWatchlistSummary(meaningfulChanges = [], timePeriod = '7 hours') {
    if (!meaningfulChanges.length) {
      return {
        title: 'While you were away',
        summary: 'Your watchlist remained quiet. No monitored stocks breached your volatility or volume significance thresholds.',
        highlights: []
      };
    }

    if (!env.GEMINI_API_KEY || this.isRateLimited()) {
      return {
        title: 'While you were away',
        summary: `${meaningfulChanges.length} meaningful changes detected across your watched assets during the last ${timePeriod}. Attention is prioritized by volatility and volume anomalies.`,
        highlights: meaningfulChanges.slice(0, 4).map(c => `${c.symbol}: ${c.primaryEventText || 'Significant movement registered'}`)
      };
    }

    const systemInstruction = 'You are FinSmart\'s executive financial digest engine. Be concise, calm, and objective. Return valid JSON only with keys: "summary" and "highlights" (array of short strings).';
    const prompt = `Synthesize a brief 2-3 sentence executive briefing for an investor returning after ${timePeriod}.
Events:
${meaningfulChanges.map(c => `- ${c.symbol}: moved ${c.percentageChange > 0 ? '+' : ''}${c.percentageChange?.toFixed(1)}% with ${c.volumeRatio?.toFixed(1)}x volume (Severity: ${c.severity}, Attention Score: ${c.attentionScore}/100)`).join('\n')}`;

    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        title: 'While you were away',
        summary: parsed.summary || `${meaningfulChanges.length} meaningful changes were detected in your watchlist.`,
        highlights: parsed.highlights || meaningfulChanges.slice(0, 3).map(c => `${c.symbol}: ${c.primaryEventText}`),
      };
    } catch (err) {
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        geminiRateLimitedUntil = Date.now() + 60 * 1000;
        logger.warn('[Gemini] Rate limit (429) hit during watchlist summary. Activating 60s circuit breaker.');
      } else {
        logger.error(`[Gemini] Watchlist summary error: ${err.message}`);
      }
      return {
        title: 'While you were away',
        summary: `${meaningfulChanges.length} meaningful movements were detected across your watchlist.`,
        highlights: meaningfulChanges.slice(0, 3).map(c => `${c.symbol}: ${c.primaryEventText || 'Flagged for attention'}`)
      };
    }
  },

  /**
   * Ask FinSmart Q&A handler with deduplication and grounded deterministic fallback on 429
   */
  async askFinSmart(question, contextData = {}) {
    const dedupeKey = question.trim().toLowerCase();

    // In-flight deduplication: return existing promise if identical question is currently running
    if (inFlightAsk.has(dedupeKey)) {
      return inFlightAsk.get(dedupeKey);
    }

    const askPromise = (async () => {
      // If no API key or in rate-limit cooldown, return grounded deterministic analysis directly
      if (!env.GEMINI_API_KEY || this.isRateLimited()) {
        const remainingSec = Math.max(0, Math.ceil((geminiRateLimitedUntil - Date.now()) / 1000));
        if (remainingSec > 0) {
          logger.info(`[Gemini] Circuit breaker active (${remainingSec}s remaining). Serving grounded deterministic answer.`);
        }
        return this.synthesizeDeterministicAnswer(question, contextData);
      }

      const systemInstruction = `You are "Ask FinSmart", an intelligent financial assistant focused on watchlist change detection.
Answer the user's question clearly and concisely based ONLY on the provided watchlist and market data.
Rules:
- Do not make investment recommendations or offer financial advice.
- Ground your answer strictly in the provided facts: prices, percentages, volume ratios, attention scores.
- Cite specific metrics from the context.
- If the requested information is not in the data, clearly say so.`;

      const prompt = `User Question: "${question}"
Current Watchlist & Market Context:
${JSON.stringify(contextData, null, 2)}`;

      try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        const answerText = response.text || 'No response available.';
        return {
          answer: answerText,
          sources: contextData.symbols || [],
          isRateLimited: false,
        };
      } catch (err) {
        if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
          geminiRateLimitedUntil = Date.now() + 60 * 1000;
          logger.warn('[Gemini] Rate limit (429) hit in Ask FinSmart. Activating 60s circuit breaker.');
        } else {
          logger.error(`[Gemini] Ask FinSmart error: ${err.message}`);
        }
        return this.synthesizeDeterministicAnswer(question, contextData);
      } finally {
        inFlightAsk.delete(dedupeKey);
      }
    })();

    inFlightAsk.set(dedupeKey, askPromise);
    return askPromise;
  },

  /**
   * High-fidelity deterministic answer synthesis grounded in MongoDB snapshot metrics
   */
  synthesizeDeterministicAnswer(question, contextData = {}) {
    const q = (question || '').toLowerCase();
    const stocks = contextData.stocks || [];
    const symbols = contextData.symbols || [];

    // 1. Check if user asked about a specific stock
    const matchedStock = stocks.find(s => 
      q.includes(s.symbol.toLowerCase()) || 
      (s.name && q.includes(s.name.toLowerCase().split(' ')[0]))
    );

    if (matchedStock) {
      const isDown = matchedStock.percentageChange < 0;
      const changeStr = `${matchedStock.percentageChange > 0 ? '+' : ''}${matchedStock.percentageChange.toFixed(1)}%`;
      const volStr = `${matchedStock.volumeRatio.toFixed(1)}× historical volume`;
      
      let explanation = `**${matchedStock.symbol} (${matchedStock.name})** is trading at ₹${matchedStock.price.toLocaleString('en-IN')}, moving ${changeStr} on ${volStr}.\n\n`;
      explanation += `• **Attention Score:** ${matchedStock.attentionScore} / 100 (${matchedStock.severity})\n`;
      explanation += `• **Primary Signal:** ${matchedStock.primaryEvent}\n`;
      
      if (matchedStock.attentionScore >= 65) {
        explanation += `• **Assessment:** High priority movement. The price ${isDown ? 'decline crossed downside significance thresholds' : 'expansion broke above baseline'} with corroborating trading volume.`;
      } else if (matchedStock.attentionScore >= 40) {
        explanation += `• **Assessment:** Worth monitoring. Moderate movement with elevated trading activity.`;
      } else {
        explanation += `• **Assessment:** Trading normally within expected daily volatility boundaries.`;
      }

      return {
        answer: explanation,
        sources: [matchedStock.symbol],
        isRateLimited: true,
      };
    }

    // 2. Check if user asked about volume anomalies
    if (q.includes('volume') || q.includes('surge') || q.includes('spike')) {
      const highVolumeStocks = stocks.filter(s => s.volumeRatio >= 1.3).sort((a, b) => b.volumeRatio - a.volumeRatio);
      if (highVolumeStocks.length > 0) {
        let text = `Here are the monitored stocks displaying unusual trading volume:\n\n`;
        highVolumeStocks.forEach(s => {
          text += `• **${s.symbol}**: ${s.volumeRatio.toFixed(1)}× normal volume (${s.percentageChange > 0 ? '+' : ''}${s.percentageChange.toFixed(1)}%, Attention ${s.attentionScore}/100)\n`;
        });
        text += `\nElevated volume indicates institutional order execution rather than routine retail fluctuations.`;
        return { answer: text, sources: highVolumeStocks.map(s => s.symbol), isRateLimited: true };
      }
    }

    // 3. Default synthesis: "What changed?" or general watchlist status
    const active = stocks.filter(s => s.severity !== 'NORMAL').sort((a, b) => b.attentionScore - a.attentionScore);
    const topStock = active[0] || stocks[0];

    let summary = `Based on your watchlist data, **${active.length} of ${stocks.length} monitored stocks** have active signals:\n\n`;
    
    if (active.length > 0) {
      active.forEach(s => {
        const sign = s.percentageChange > 0 ? '+' : '';
        summary += `• **${s.symbol}** (${s.severity}): Moved ${sign}${s.percentageChange.toFixed(1)}% on ${s.volumeRatio.toFixed(1)}× volume — Attention **${s.attentionScore}/100**\n`;
      });
      summary += `\n**Top Priority:** ${topStock.symbol} has the highest attention score (${topStock.attentionScore}/100) due to ${topStock.primaryEvent.toLowerCase()}.`;
    } else {
      summary = `All ${stocks.length} monitored stocks in your watchlist are currently trading within normal volatility parameters with no unusual volume spikes.`;
    }

    return {
      answer: summary,
      sources: symbols,
      isRateLimited: true,
    };
  },

  /**
   * Deterministic explanation when Gemini is unavailable or disabled
   */
  deterministicFallbackWhyItMatters({ symbol, companyName, percentageChange, volumeRatio, attentionScore, signals }) {
    const isDrop = percentageChange < 0;
    const absChange = Math.abs(percentageChange).toFixed(1);
    const volStr = volumeRatio > 1.2 ? `${volumeRatio.toFixed(1)}× normal volume` : 'standard volume';

    return {
      summary: `${symbol} experienced a ${absChange}% price ${isDrop ? 'decline' : 'surge'} on ${volStr}.`,
      whyItMatters: `${companyName} registered an attention score of ${attentionScore}/100. The movement ${isDrop ? 'breached downside volatility support' : 'demonstrated aggressive upside accumulation'} accompanied by ${volumeRatio >= 1.5 ? 'elevated institutional trading flow' : 'steady market participation'}.`,
      confidence: 'HIGH',
      evidence: [
        `Price shifted ${percentageChange > 0 ? '+' : ''}${absChange}% from baseline`,
        `Trading volume is ${volumeRatio.toFixed(1)}× historical average`,
        ...(signals?.map(s => s.description) || [])
      ]
    };
  }
};
