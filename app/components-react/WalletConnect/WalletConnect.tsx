import React from 'react';
import {
    EthereumClient,
    modalConnectors,
    walletConnectProvider,
} from "@web3modal/ethereum";

import { Web3Modal, useWeb3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, mainnet, polygon } from "@wagmi/chains";
import styles from './WalletConnect.m.less';

export default function WalletConnectButton() {
  const { setDefaultChain } = useWeb3Modal()
  setDefaultChain(polygon)
  const chains = [arbitrum, mainnet, polygon];
  const { provider } = configureChains(chains, [
    walletConnectProvider({ projectId: "5b75002497f33310a85059ce8d9990ff" })
  ]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({
        projectId: "5b75002497f33310a85059ce8d9990ff",
        version: "1",
        appName: "web3Modal",
        chains,
    }),
    provider,
  });
  const ethereumClient = new EthereumClient(wagmiClient, chains);
  return (
    <div className={styles.WalletConnect}>
      <WagmiConfig client={wagmiClient}>
      </WagmiConfig>
      <Web3Modal
        projectId="5b75002497f33310a85059ce8d9990ff"
        ethereumClient={ethereumClient}
      />
    </div>
  );
}