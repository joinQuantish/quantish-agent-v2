/**
 * @license
 * Copyright 2025 Quantish
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quantish MCP HTTP Client
 * Simple HTTP client for calling MCP tools during onboarding
 * Used to create wallets on Polymarket and Kalshi MCPs
 */

import { TRADING_MCP_URL, KALSHI_MCP_URL } from './quantishConfig.js';

export interface McpToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PolymarketWalletResult {
  apiKey: string;
  apiSecret?: string;
  eoaAddress: string;
  safeAddress?: string;
}

export interface KalshiWalletResult {
  apiKey: string;
  apiSecret?: string;
  walletAddress: string;
}

/**
 * Call an MCP tool via HTTP
 */
async function callMcpTool<T>(
  url: string,
  toolName: string,
  args: Record<string, unknown>,
  apiKey?: string,
): Promise<McpToolResult<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };
    
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
        id: Date.now(),
      }),
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    const result = await response.json() as {
      result?: { content?: Array<{ type: string; text: string }> };
      error?: { message: string };
    };
    
    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }
    
    // Extract content from MCP response
    const content = result.result?.content;
    if (content && content.length > 0) {
      const textContent = content.find((c) => c.type === 'text');
      if (textContent?.text) {
        try {
          const parsed = JSON.parse(textContent.text) as T;
          return { success: true, data: parsed };
        } catch {
          // If not JSON, return as-is
          return { success: true, data: textContent.text as T };
        }
      }
    }
    
    return { success: true, data: result.result as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create a new Polymarket wallet via the Trading MCP
 * Calls the request_api_key tool which creates a new wallet and returns credentials
 */
export async function createPolymarketWallet(
  externalId: string,
): Promise<McpToolResult<PolymarketWalletResult>> {
  // The request_api_key tool is public (no auth required for signup)
  return callMcpTool<PolymarketWalletResult>(
    TRADING_MCP_URL,
    'request_api_key',
    { externalId },
  );
}

/**
 * Create a new Kalshi wallet via the Kalshi MCP
 * Calls the kalshi_signup tool which creates a new Solana wallet
 */
export async function createKalshiWallet(
  externalId: string,
): Promise<McpToolResult<KalshiWalletResult>> {
  // The kalshi_signup tool is public (no auth required for signup)
  return callMcpTool<KalshiWalletResult>(
    KALSHI_MCP_URL,
    'kalshi_signup',
    { externalId },
  );
}

/**
 * Verify Polymarket wallet connection
 */
export async function verifyPolymarketConnection(
  apiKey: string,
): Promise<McpToolResult<{ safeAddress?: string; status: string }>> {
  return callMcpTool(
    TRADING_MCP_URL,
    'get_wallet_status',
    {},
    apiKey,
  );
}

/**
 * Verify Kalshi wallet connection
 */
export async function verifyKalshiConnection(
  apiKey: string,
): Promise<McpToolResult<{ wallet?: { publicKey: string } }>> {
  return callMcpTool(
    KALSHI_MCP_URL,
    'kalshi_get_wallet_info',
    {},
    apiKey,
  );
}

/**
 * Verify Discovery MCP connection
 */
export async function verifyDiscoveryConnection(): Promise<McpToolResult<unknown>> {
  const { DISCOVERY_MCP_URL, DISCOVERY_MCP_PUBLIC_KEY } = await import('./quantishConfig.js');
  
  return callMcpTool(
    DISCOVERY_MCP_URL,
    'get_market_stats',
    {},
    DISCOVERY_MCP_PUBLIC_KEY,
  );
}

