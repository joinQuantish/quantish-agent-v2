/**
 * @license
 * Copyright 2025 Quantish
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Default configuration for Quantish Agent
 * Pre-configures MCP servers for prediction market trading
 */

/**
 * Quantish MCP Server configurations
 * Uses httpUrl for HTTP transport (required for Railway-hosted MCPs)
 */
export const QUANTISH_MCP_SERVERS = {
  // Discovery MCP - Public, read-only market data across all platforms
  'quantish-discovery': {
    httpUrl: 'https://quantish.live/mcp',
    headers: {
      'X-API-Key': 'qm_ueQeqrmvZyHtR1zuVbLYkhx0fKyVAuV8',
    },
    trust: true,
    description: 'Search markets across Polymarket, Kalshi, and Limitless',
  },
};

/**
 * Optional trading MCP servers (require user API keys)
 */
export const QUANTISH_TRADING_MCP_SERVERS = {
  // Polymarket Trading MCP - Requires Quantish API key
  'quantish-polymarket': {
    httpUrl: 'https://quantish-sdk-production.up.railway.app/mcp',
    description: 'Trade on Polymarket (requires API key)',
    // Headers will be added after user provides API key
  },
  
  // Kalshi Trading MCP - Requires Kalshi API key  
  'quantish-kalshi': {
    httpUrl: 'https://kalshi-mcp-production-7c2c.up.railway.app/mcp',
    description: 'Trade on Kalshi (requires API key)',
    // Headers will be added after user provides API key
  },
};

/**
 * Build the full MCP server config including trading servers if keys are provided
 */
export function buildMcpServerConfig(options?: {
  polymarketApiKey?: string;
  kalshiApiKey?: string;
}): Record<string, unknown> {
  const servers: Record<string, unknown> = { ...QUANTISH_MCP_SERVERS };

  if (options?.polymarketApiKey) {
    servers['quantish-polymarket'] = {
      ...QUANTISH_TRADING_MCP_SERVERS['quantish-polymarket'],
      headers: {
        'x-api-key': options.polymarketApiKey,
      },
      trust: true,
    };
  }

  if (options?.kalshiApiKey) {
    servers['quantish-kalshi'] = {
      ...QUANTISH_TRADING_MCP_SERVERS['quantish-kalshi'],
      headers: {
        'x-api-key': options.kalshiApiKey,
      },
      trust: true,
    };
  }

  return servers;
}

/**
 * Quantish system prompt additions
 */
export const QUANTISH_SYSTEM_PROMPT = `
You are Quantish, an AI trading agent for prediction markets.

## Your Capabilities

1. **Market Discovery** - Search for markets across Polymarket, Kalshi, and Limitless using the Discovery MCP
2. **Trading** - Place buy/sell orders on prediction markets (when trading MCPs connected)
3. **Coding** - Build trading bots, dashboards, and analysis tools using built-in file tools
4. **Research** - Search the web for market-relevant information

## MCP Tools Available

**Discovery MCP (quantish-discovery):**
- search_markets(query, platform, limit) - Search for markets. RETURNS PRICES.
- get_market_details(platform, marketId) - Get full details for a specific market
- get_trending_markets(platform, limit) - Find high-volume markets
- find_arbitrage() - Discover arbitrage opportunities

**Polymarket Trading MCP (if connected):**
- place_order - Place orders on Polymarket
- get_positions - View your current positions
- get_balances - Check your USDC balance

**Kalshi Trading MCP (if connected):**
- kalshi_buy_yes/kalshi_buy_no - Buy positions on Kalshi
- kalshi_get_positions - View Kalshi positions
- kalshi_get_balances - Check Kalshi balance

## Guidelines

- When searching for markets, present results in clean tables with prices
- search_markets ALREADY returns prices - you don't need get_market_details unless user asks for more info
- Always confirm before placing trades
- Be concise and direct
`;
