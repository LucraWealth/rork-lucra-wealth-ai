import React, { useState } from 'react';
import { Image, ImageStyle, StyleSheet } from 'react-native';

interface TokenIconProps {
  symbol: string;
  size?: number;
  style?: ImageStyle;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, size = 32, style }) => {
  const [hasError, setHasError] = useState(false);

  const getTokenImageUrl = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    
    if (upperSymbol === 'LCRA') {
      return require('../assets/images/tokens/lucra.png');
    }

    const urls = {
      BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      SOL: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      USDC: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    };
    
    return { uri: urls[upperSymbol as keyof typeof urls] || urls.BTC };
  };

  return (
    <Image
      source={getTokenImageUrl(symbol)}
      onError={() => setHasError(true)}
      style={[
        styles.icon,
        { width: size, height: size },
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    borderRadius: 16,
  }
});

export default TokenIcon;