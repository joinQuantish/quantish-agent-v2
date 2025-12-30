/**
 * @license
 * Copyright 2025 Quantish
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quantish Configuration Manager
 * Manages Quantish-specific settings within Gemini CLI's settings.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { homedir } from 'node:os';

// MCP Server URLs
export const DISCOVERY_MCP_URL = 'https://quantish.live/mcp';
export const DISCOVERY_MCP_PUBLIC_KEY = 'qm_ueQeqrmvZyHtR1zuVbLYkhx0fKyVAuV8';
export const TRADING_MCP_URL = 'https://quantish-sdk-production.up.railway.app/mcp';
export const KALSHI_MCP_URL = 'https://kalshi-mcp-production-7c2c.up.railway.app/mcp';

export interface QuantishSettings {
  configured?: boolean;
  polymarketApiKey?: string;
  polymarketWalletAddress?: string;
  kalshiApiKey?: string;
  kalshiWalletAddress?: string;
}

export interface McpServerConfig {
  httpUrl?: string;
  url?: string;
  headers?: Record<string, string>;
  trust?: boolean;
}

interface GeminiSettings {
  mcpServers?: Record<string, McpServerConfig>;
  quantish?: QuantishSettings;
  security?: {
    auth?: {
      selectedType?: string;
    };
  };
  [key: string]: unknown;
}

/**
 * Get the path to Gemini's settings.json
 */
export function getSettingsPath(): string {
  return path.join(homedir(), '.gemini', 'settings.json');
}

/**
 * Load Gemini settings
 */
export function loadSettings(): GeminiSettings {
  const settingsPath = getSettingsPath();
  
  if (!fs.existsSync(settingsPath)) {
    return {};
  }
  
  try {
    const content = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(content) as GeminiSettings;
  } catch {
    return {};
  }
}

/**
 * Save Gemini settings
 */
export function saveSettings(settings: GeminiSettings): void {
  const settingsPath = getSettingsPath();
  const settingsDir = path.dirname(settingsPath);
  
  // Ensure directory exists
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
  }
  
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

/**
 * Check if Quantish is configured
 */
export function isQuantishConfigured(): boolean {
  const settings = loadSettings();
  return settings.quantish?.configured === true;
}

/**
 * Get Polymarket API key
 */
export function getPolymarketApiKey(): string | undefined {
  const settings = loadSettings();
  return settings.quantish?.polymarketApiKey;
}

/**
 * Get Kalshi API key
 */
export function getKalshiApiKey(): string | undefined {
  const settings = loadSettings();
  return settings.quantish?.kalshiApiKey;
}

/**
 * Save Polymarket wallet info and configure MCP
 */
export function savePolymarketWallet(apiKey: string, walletAddress?: string): void {
  const settings = loadSettings();
  
  // Initialize quantish section if needed
  if (!settings.quantish) {
    settings.quantish = {};
  }
  
  settings.quantish.polymarketApiKey = apiKey;
  if (walletAddress) {
    settings.quantish.polymarketWalletAddress = walletAddress;
  }
  
  // Configure Polymarket MCP server
  if (!settings.mcpServers) {
    settings.mcpServers = {};
  }
  
  settings.mcpServers['quantish-polymarket'] = {
    httpUrl: TRADING_MCP_URL,
    headers: {
      'x-api-key': apiKey,
    },
    trust: true,
  };
  
  saveSettings(settings);
}

/**
 * Save Kalshi wallet info and configure MCP
 */
export function saveKalshiWallet(apiKey: string, walletAddress?: string): void {
  const settings = loadSettings();
  
  // Initialize quantish section if needed
  if (!settings.quantish) {
    settings.quantish = {};
  }
  
  settings.quantish.kalshiApiKey = apiKey;
  if (walletAddress) {
    settings.quantish.kalshiWalletAddress = walletAddress;
  }
  
  // Configure Kalshi MCP server
  if (!settings.mcpServers) {
    settings.mcpServers = {};
  }
  
  settings.mcpServers['quantish-kalshi'] = {
    httpUrl: KALSHI_MCP_URL,
    headers: {
      'x-api-key': apiKey,
    },
    trust: true,
  };
  
  saveSettings(settings);
}

/**
 * Mark Quantish as fully configured
 */
export function markConfigured(): void {
  const settings = loadSettings();
  
  if (!settings.quantish) {
    settings.quantish = {};
  }
  
  settings.quantish.configured = true;
  saveSettings(settings);
}

/**
 * Ensure Discovery MCP is configured (always available, public key)
 */
export function ensureDiscoveryMcp(): void {
  const settings = loadSettings();
  
  if (!settings.mcpServers) {
    settings.mcpServers = {};
  }
  
  // Only add if not already configured
  if (!settings.mcpServers['quantish-discovery']) {
    settings.mcpServers['quantish-discovery'] = {
      httpUrl: DISCOVERY_MCP_URL,
      headers: {
        'X-API-Key': DISCOVERY_MCP_PUBLIC_KEY,
      },
      trust: true,
    };
    
    saveSettings(settings);
  }
}

/**
 * Get all configured Quantish settings
 */
export function getQuantishSettings(): QuantishSettings {
  const settings = loadSettings();
  return settings.quantish || {};
}

/**
 * Reset Quantish configuration
 */
export function resetQuantishConfig(): void {
  const settings = loadSettings();
  
  // Remove Quantish section
  delete settings.quantish;
  
  // Remove Quantish MCP servers
  if (settings.mcpServers) {
    delete settings.mcpServers['quantish-discovery'];
    delete settings.mcpServers['quantish-polymarket'];
    delete settings.mcpServers['quantish-kalshi'];
  }
  
  saveSettings(settings);
}

