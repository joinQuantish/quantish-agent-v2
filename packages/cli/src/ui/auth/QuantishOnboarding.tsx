/**
 * @license
 * Copyright 2025 Quantish
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Quantish Onboarding Component
 * Shows after Google auth to set up Polymarket and Kalshi wallets
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { theme } from '../semantic-colors.js';
import { TextInput } from '../components/shared/TextInput.js';
import { useTextBuffer } from '../components/shared/text-buffer.js';
import { useUIState } from '../contexts/UIStateContext.js';
import {
  savePolymarketWallet,
  saveKalshiWallet,
  markConfigured,
  ensureDiscoveryMcp,
} from '../../config/quantishConfig.js';
import {
  createPolymarketWallet,
  createKalshiWallet,
  verifyDiscoveryConnection,
} from '../../config/quantishMcpClient.js';

type OnboardingStep = 
  | 'welcome'
  | 'polymarket_choice'
  | 'polymarket_input'
  | 'polymarket_creating'
  | 'kalshi_choice'
  | 'kalshi_input'
  | 'kalshi_creating'
  | 'verifying'
  | 'complete';

interface QuantishOnboardingProps {
  onComplete: () => void;
}

export function QuantishOnboarding({ onComplete }: QuantishOnboardingProps): React.JSX.Element {
  const { mainAreaWidth } = useUIState();
  const viewportWidth = Math.max(mainAreaWidth - 8, 40);
  
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [polymarketKey, setPolymarketKey] = useState<string | null>(null);
  const [polymarketAddress, setPolymarketAddress] = useState<string | null>(null);
  const [polymarketSecret, setPolymarketSecret] = useState<string | null>(null);
  const [kalshiKey, setKalshiKey] = useState<string | null>(null);
  const [kalshiAddress, setKalshiAddress] = useState<string | null>(null);
  const [kalshiSecret, setKalshiSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discoveryOk, setDiscoveryOk] = useState(false);

  // Text buffer for identifier input
  const buffer = useTextBuffer({
    initialText: '',
    viewport: {
      width: viewportWidth,
      height: 1,
    },
    isValidPath: () => false,
    singleLine: true,
  });

  // Handle key presses for choice steps
  useInput((input, key) => {
    if (step === 'welcome' && key.return) {
      setStep('polymarket_choice');
    } else if (step === 'polymarket_choice') {
      if (input === '1' || input === 'c') {
        buffer.setText('');
        setStep('polymarket_input');
      } else if (input === '2' || input === 's') {
        setStep('kalshi_choice');
      }
    } else if (step === 'kalshi_choice') {
      if (input === '1' || input === 'c') {
        buffer.setText('');
        setStep('kalshi_input');
      } else if (input === '2' || input === 's') {
        finishOnboarding();
      }
    } else if (step === 'complete' && key.return) {
      onComplete();
    }
  });

  // Create Polymarket wallet
  const handlePolymarketCreate = useCallback(async (value: string) => {
    const externalId = value.trim();
    if (!externalId) {
      setError('Please enter an identifier');
      return;
    }

    setStep('polymarket_creating');
    setError(null);

    const result = await createPolymarketWallet(externalId);

    if (result.success && result.data) {
      const data = result.data;
      setPolymarketKey(data.apiKey);
      setPolymarketAddress(data.eoaAddress);
      if (data.apiSecret) {
        setPolymarketSecret(data.apiSecret);
      }
      savePolymarketWallet(data.apiKey, data.eoaAddress);
      buffer.setText('');
      setStep('kalshi_choice');
    } else {
      setError(result.error || 'Failed to create wallet');
      setStep('polymarket_choice');
    }
  }, [buffer]);

  // Create Kalshi wallet
  const handleKalshiCreate = useCallback(async (value: string) => {
    const externalId = value.trim();
    if (!externalId) {
      setError('Please enter an identifier');
      return;
    }

    setStep('kalshi_creating');
    setError(null);

    const result = await createKalshiWallet(externalId);

    if (result.success && result.data) {
      const data = result.data;
      setKalshiKey(data.apiKey);
      setKalshiAddress(data.walletAddress);
      if (data.apiSecret) {
        setKalshiSecret(data.apiSecret);
      }
      saveKalshiWallet(data.apiKey, data.walletAddress);
      finishOnboarding();
    } else {
      setError(result.error || 'Failed to create wallet');
      setStep('kalshi_choice');
    }
  }, []);

  // Finish onboarding
  const finishOnboarding = useCallback(async () => {
    setStep('verifying');
    
    // Ensure Discovery MCP is configured
    ensureDiscoveryMcp();
    
    // Verify Discovery connection
    const discoveryResult = await verifyDiscoveryConnection();
    setDiscoveryOk(discoveryResult.success);
    
    // Mark as configured
    markConfigured();
    
    setStep('complete');
  }, []);

  // Render based on current step
  return (
    <Box
      borderStyle="round"
      borderColor={theme.border.focused}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      {step === 'welcome' && (
        <>
          <Text bold color={theme.text.accent}>
            Welcome to Quantish!
          </Text>
          <Box marginTop={1}>
            <Text color={theme.text.primary}>
              AI-powered trading for Polymarket, Kalshi &amp; Limitless
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              Let's set up your trading wallets. This takes about 30 seconds.
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              Press Enter to continue...
            </Text>
          </Box>
        </>
      )}

      {step === 'polymarket_choice' && (
        <>
          <Text bold color={theme.text.primary}>
            Step 1: Polymarket Trading
          </Text>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              Trade on Polymarket with a managed Polygon wallet.
            </Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text color={theme.text.primary}>
              1. <Text color={theme.text.accent}>Create wallet</Text> - New managed wallet (recommended)
            </Text>
            <Text color={theme.text.primary}>
              2. <Text color={theme.text.secondary}>Skip</Text> - Set up later
            </Text>
          </Box>
          {error && (
            <Box marginTop={1}>
              <Text color={theme.status.error}>{error}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>Press 1 or 2</Text>
          </Box>
        </>
      )}

      {step === 'polymarket_input' && (
        <>
          <Text bold color={theme.text.primary}>
            Create Polymarket Wallet
          </Text>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              Enter a unique identifier (email or username):
            </Text>
          </Box>
          <Box marginTop={1}>
            <Box
              borderStyle="round"
              borderColor={theme.border.default}
              paddingX={1}
              flexGrow={1}
            >
              <TextInput
                buffer={buffer}
                onSubmit={handlePolymarketCreate}
                placeholder="your@email.com"
              />
            </Box>
          </Box>
          {error && (
            <Box marginTop={1}>
              <Text color={theme.status.error}>{error}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>Press Enter to submit</Text>
          </Box>
        </>
      )}

      {step === 'polymarket_creating' && (
        <>
          <Text bold color={theme.text.primary}>
            <Text color={theme.text.accent}>
              <Spinner type="dots" />
            </Text>
            {' '}Creating Polymarket wallet...
          </Text>
        </>
      )}

      {step === 'kalshi_choice' && (
        <>
          {polymarketKey && (
            <Box marginBottom={1} flexDirection="column">
              <Text color={theme.status.success}>✓ Polymarket wallet created</Text>
              <Text color={theme.text.secondary}>  Address: {polymarketAddress}</Text>
              {polymarketSecret && (
                <>
                  <Box marginTop={1}>
                    <Text color={theme.status.warning}>
                      ⚠️ Save your API secret (shown only once):
                    </Text>
                  </Box>
                  <Text bold color={theme.status.warning}>
                    {polymarketSecret}
                  </Text>
                </>
              )}
            </Box>
          )}
          <Text bold color={theme.text.primary}>
            Step 2: Kalshi Trading
          </Text>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              Trade on Kalshi markets via DFlow on Solana.
            </Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text color={theme.text.primary}>
              1. <Text color={theme.text.accent}>Create wallet</Text> - New Solana wallet
            </Text>
            <Text color={theme.text.primary}>
              2. <Text color={theme.text.secondary}>Skip</Text> - Set up later
            </Text>
          </Box>
          {error && (
            <Box marginTop={1}>
              <Text color={theme.status.error}>{error}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>Press 1 or 2</Text>
          </Box>
        </>
      )}

      {step === 'kalshi_input' && (
        <>
          <Text bold color={theme.text.primary}>
            Create Kalshi Wallet
          </Text>
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              Enter a unique identifier (email or username):
            </Text>
          </Box>
          <Box marginTop={1}>
            <Box
              borderStyle="round"
              borderColor={theme.border.default}
              paddingX={1}
              flexGrow={1}
            >
              <TextInput
                buffer={buffer}
                onSubmit={handleKalshiCreate}
                placeholder="your@email.com"
              />
            </Box>
          </Box>
          {error && (
            <Box marginTop={1}>
              <Text color={theme.status.error}>{error}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>Press Enter to submit</Text>
          </Box>
        </>
      )}

      {step === 'kalshi_creating' && (
        <>
          <Text bold color={theme.text.primary}>
            <Text color={theme.text.accent}>
              <Spinner type="dots" />
            </Text>
            {' '}Creating Kalshi wallet...
          </Text>
        </>
      )}

      {step === 'verifying' && (
        <>
          <Text bold color={theme.text.primary}>
            <Text color={theme.text.accent}>
              <Spinner type="dots" />
            </Text>
            {' '}Verifying connections...
          </Text>
        </>
      )}

      {step === 'complete' && (
        <>
          <Text bold color={theme.status.success}>
            Quantish Setup Complete!
          </Text>
          <Box marginTop={1} flexDirection="column">
            <Text color={discoveryOk ? theme.status.success : theme.status.warning}>
              {discoveryOk ? '✓' : '⚠'} Discovery MCP (market search)
            </Text>
            <Text color={polymarketKey ? theme.status.success : theme.text.secondary}>
              {polymarketKey ? '✓' : '⏭'} Polymarket Trading
              {polymarketAddress && <Text color={theme.text.secondary}> ({polymarketAddress?.slice(0, 10)}...)</Text>}
            </Text>
            <Text color={kalshiKey ? theme.status.success : theme.text.secondary}>
              {kalshiKey ? '✓' : '⏭'} Kalshi Trading
              {kalshiAddress && <Text color={theme.text.secondary}> ({kalshiAddress?.slice(0, 10)}...)</Text>}
            </Text>
          </Box>
          {(polymarketSecret || kalshiSecret) && (
            <Box marginTop={1} flexDirection="column">
              <Text color={theme.status.warning}>
                ⚠️ Save these API secrets (shown only once):
              </Text>
              {polymarketSecret && (
                <Text color={theme.text.primary}>
                  Polymarket: <Text bold>{polymarketSecret}</Text>
                </Text>
              )}
              {kalshiSecret && (
                <Text color={theme.text.primary}>
                  Kalshi: <Text bold>{kalshiSecret}</Text>
                </Text>
              )}
            </Box>
          )}
          <Box marginTop={1}>
            <Text color={theme.text.secondary}>
              Press Enter to start using Quantish...
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
}
