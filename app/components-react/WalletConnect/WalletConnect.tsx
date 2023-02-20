import React, {useEffect} from 'react';
import {
    EthereumClient,
    modalConnectors,
    walletConnectProvider,
} from "@web3modal/ethereum";
import { Services } from '../service-provider';

import { Web3Modal, useWeb3Modal, Web3Button, Web3NetworkSwitch} from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrum, mainnet, polygon } from "@wagmi/chains";

import styles from './WalletConnect.m.less';

const projectId = "5b75002497f33310a85059ce8d9990ff";
export default function WalletConnectButton() {
  const { setDefaultChain } = useWeb3Modal()
  setDefaultChain(polygon)
  const chains = [arbitrum, mainnet, polygon];
  const { provider } = configureChains(chains, [
    walletConnectProvider({ projectId: projectId })
  ]);
  const connector = modalConnectors({
        projectId: projectId,
        version: "1",
        appName: "web3Modal",
        chains,
    })
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: connector,
    provider,
  });
  const ethereumClient = new EthereumClient(wagmiClient, chains);

  const { WindowsService } = Services;
  const { isOpen } = useWeb3Modal()
  useEffect(() => {
    if (isOpen) {
      // if WalletConnect Panel open, hide OBS Display
      WindowsService.actions.updateStyleBlockers('main', true);
    } else {
      // else show OBS Display
      WindowsService.actions.updateStyleBlockers('main', false);
    }
  });

  return (
    <div className={styles.WalletConnect}>
      <WagmiConfig client={wagmiClient}>
        <Web3Button />
        <Web3NetworkSwitch />
      </WagmiConfig>
      <Web3Modal
        projectId="5b75002497f33310a85059ce8d9990ff"
        ethereumClient={ethereumClient}
      />
    </div>
  );
}