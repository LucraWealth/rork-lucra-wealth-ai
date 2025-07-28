export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  price: number;
  change: number;
  description?: string;
  color?: string;
  iconUrl?: string;
}

export const tokens: Token[] = [
  // {
  //   id: "0",
  //   name: "Lucra",
  //   symbol: "LCRA",
  //   balance: 500,
  //   price: 1.25,
  //   change: 3.7,
  //   description: "The official token of Lucra platform, used for transactions and rewards.",
  //   color: "rgba(74, 227, 168, 0.8)",
  //   iconUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=100&h=100&fit=crop&crop=center",
  // },
  {
    id: "0",
    name: "Bitcoin",
    symbol: "BTC",
    balance: 0.025,
    price: 42000,
    change: 2.5,
    description: "The original cryptocurrency and the largest by market capitalization.",
    color: "rgba(247, 147, 26, 0.8)",
    iconUrl: "https://images.unsplash.com/photo-1518544866330-4e4815de13ba?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "1",
    name: "Ethereum",
    symbol: "ETH",
    balance: 0.75,
    price: 2800,
    change: -1.2,
    description: "A decentralized platform that enables smart contracts and decentralized applications.",
    color: "rgba(98, 126, 234, 0.8)",
    iconUrl: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "2",
    name: "Lumi Token",
    symbol: "LUMI",
    balance: 250,
    price: 0.15,
    change: 5.8,
    description: "The native token of the Lumi platform, used for rewards and governance.",
    color: "rgba(255, 153, 0, 0.8)",
    iconUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "3",
    name: "Solana",
    symbol: "SOL",
    balance: 10,
    price: 120,
    change: 4.2,
    description: "A high-performance blockchain supporting smart contracts and decentralized applications.",
    color: "rgba(20, 241, 149, 0.8)",
    iconUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "4",
    name: "USD Coin",
    symbol: "USDC",
    balance: 1000,
    price: 1.0,
    change: 0.01,
    description: "A fully collateralized US dollar stablecoin.",
    color: "rgba(39, 117, 202, 0.8)",
    iconUrl: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=100&h=100&fit=crop&crop=center",
  }
];
