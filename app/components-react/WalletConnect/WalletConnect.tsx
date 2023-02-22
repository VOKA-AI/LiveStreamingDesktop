import React, {useEffect} from 'react';
import {
    EthereumClient,
    modalConnectors,
    walletConnectProvider,
} from "@web3modal/ethereum";
import { Web3Modal, useWeb3Modal, Web3Button, useWeb3ModalTheme} from "@web3modal/react";

import { configureChains, createClient, WagmiConfig, useAccount, useNetwork } from "wagmi";
import { arbitrum, mainnet, polygon } from "@wagmi/chains";

import { Services } from '../service-provider';
import styles from './WalletConnect.m.less';
import { add } from 'lodash';

const projectId = "5b75002497f33310a85059ce8d9990ff";
export default function WalletConnectButton() {
  const { WindowsService, PlatformAppsService } = Services;

  const chains = [mainnet, polygon]; // supported chains
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

  /*
   * open: 打开WalletConnect面板，可以指定'Account' | 'ConnectWallet' | 'Help' | 'SelectNetwork'
   *       比如：open({route: 'Account'})就是打开账户信息面板
   * 
   * close: 对应于open，关闭面板
   * isOpen: 判断面板是否已经打开
   * setDefaultChain: 设置默认链
   */
  const { open, isOpen, close, setDefaultChain } = useWeb3Modal()
  setDefaultChain(mainnet)

  /*
   * wagmi hooks
   * address：钱包地址，如果未连接会是undefined
   * isConnecting：是否正在连接
   * isConnected/isDisconnected：是否已经连接/断开
   */
  const { address, isConnecting, isConnected, isDisconnected } = useAccount()
  const { chain } = useNetwork()

  // hooks，用来设置WalletConnect的面板样式
  const {setTheme} = useWeb3ModalTheme();
  setTheme({
    themeMode: "dark",
    themeColor: "orange",
    themeBackground: "gradient",
  });

  useEffect(() => {
    if(isConnecting) {
      console.log("connecting, please wait!")
    }
    if (isOpen) {
      // if WalletConnect Panel open, hide OBS Display
      WindowsService.actions.updateStyleBlockers('main', true);
    } else {
      // else show OBS Display
      WindowsService.actions.updateStyleBlockers('main', false);
    }
  },[isConnecting ,isOpen, isConnected, address]);

  function openConnectPanel() {
    open({route: 'ConnectWallet'});
  }

  function openAccountPanel() {
    open({route: 'Account'});
  }

  function connectButtonClicked() {
    if(isConnected && address != undefined) {
      alert("connected! if status is error, reopen the app please!")
    }
  }

  /*
   * TODO:
   * 现在有些问题难以解决，可能是WalletConnect or Metamask的问题，包括：
   *   1. 如果直接使用Web3Button：
   *      * Metamask扫码登陆，metamask那边显示登陆成功，panel也会响应收起，但按钮还是显示Connect。这就导致用户误以为登陆失败，只有重启App才能显示登陆成功
   *   2. 如果自己用isConnected来做判断：
   *      * 点开Account面板后，无法正常获取balance
   *      * 点击面板中disconnect，面板收起，但isConnected依然为true。再次点开panel时才能正常显示
   * 
   *   另外不管选择何种方案，都会偶尔出现扫码后无反应的情况，可能的原因是metamask自己保存了“会话”，需要在metamask App中手动断开
   */
  return (
    <div className={styles.WalletConnect}>
      <WagmiConfig client={wagmiClient}>
        <div onClick={connectButtonClicked}>
        <Web3Button />
        </div>
        {isConnected && address && (
          <div>
            {/* <button onClick={openAccountPanel}>{address}</button> */}
          </div>
        )}
        {!isConnected && (
          <div>
            {/* <button onClick={openConnectPanel}>connect</button> */}
          </div>
        )}
      </WagmiConfig>
      <Web3Modal
        projectId="5b75002497f33310a85059ce8d9990ff"
        ethereumClient={ethereumClient}
      />
    </div>
  );
}