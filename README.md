# Quantish Agent V2

AI-powered trading agent for prediction markets. Trade on **Polymarket**,
**Kalshi**, and **Limitless** with natural language commands.

```
  ██████╗ ██╗   ██╗ █████╗ ███╗   ██╗████████╗██╗███████╗██╗  ██╗
 ██╔═══██╗██║   ██║██╔══██╗████╗  ██║╚══██╔══╝██║██╔════╝██║  ██║
 ██║   ██║██║   ██║███████║██╔██╗ ██║   ██║   ██║███████╗███████║
 ██║▄▄ ██║██║   ██║██╔══██║██║╚██╗██║   ██║   ██║╚════██║██╔══██║
 ╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║   ██║   ██║███████║██║  ██║
  ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚══════╝╚═╝  ╚═╝
```

## Installation

```bash
npm install -g @quantish/agent-v2
```

Then run:

```bash
quantish2
```

## V1 vs V2 - Which Should I Use?

Quantish offers two versions of the agent:

| Feature         | V1 (`@quantish/agent`)          | V2 (`@quantish/agent-v2`)          |
| --------------- | ------------------------------- | ---------------------------------- |
| CLI Command     | `quantish`                      | `quantish2`                        |
| Backend         | OpenRouter / Anthropic          | Google Gemini                      |
| Auth            | API Key only                    | Google OAuth / API Key / Vertex AI |
| File Tools      | Basic read/write                | Full sandbox with file operations  |
| MCP Integration | Custom HTTP clients             | Native MCP protocol                |
| Best For        | Custom bots, specialized agents | General trading, app building      |

### When to use V1 (`quantish`)

- You want full control over the agent's behavior
- You're building a custom trading bot
- You prefer OpenRouter or Anthropic as your LLM provider

### When to use V2 (`quantish2`)

- You want powerful file operations in a secure sandbox
- You need native MCP server integration
- You want to build trading applications and dashboards
- You prefer Google's authentication ecosystem

## Side-by-Side Installation

Both versions can be installed and used simultaneously:

```bash
# Install V1 (original)
npm install -g @quantish/agent

# Install V2 (Gemini-powered)
npm install -g @quantish/agent-v2

# Use V1
quantish

# Use V2
quantish2
```

## Features

- **Market Discovery** - Search markets across Polymarket, Kalshi, and Limitless
- **Trading** - Place buy/sell orders on prediction markets
- **Arbitrage Detection** - Find price discrepancies across platforms
- **App Building** - Create trading bots and dashboards with built-in file tools
- **MCP Integration** - Connect to Quantish Discovery, Polymarket Trading, and
  Kalshi MCPs

## Quick Start

1. Run `quantish2` in your terminal
2. Authenticate with Google (or use API key)
3. Complete the Quantish onboarding to set up your wallets
4. Start trading!

### Example Commands

```
> Search for Trump election markets

> Show me arbitrage opportunities on Polymarket

> Create a trading bot that monitors BTC price markets

> Buy $10 YES on "Will Bitcoin reach $100k by 2025?"
```

## MCP Servers

V2 automatically connects to three Quantish MCP servers:

1. **Discovery MCP** - Market search, trending markets, arbitrage detection
2. **Polymarket Trading MCP** - Trade on Polymarket (requires wallet setup)
3. **Kalshi Trading MCP** - Trade on Kalshi (requires wallet setup)

## License

PolyForm Noncommercial 1.0.0

Free for personal and noncommercial use. For commercial use or monetization,
please contact [hello@quantish.live](mailto:hello@quantish.live).

## Links

- [Quantish Website](https://quantish.live)
- [Documentation](https://agent.quantish.live)
- [V1 Agent](https://www.npmjs.com/package/@quantish/agent)
