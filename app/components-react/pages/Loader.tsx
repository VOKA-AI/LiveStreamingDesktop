import React, { useEffect, useState } from 'react';
import SvgContainer from 'components-react/shared/SvgContainer';
import { $t } from 'services/i18n';

const loadingStrings = () => [
  // TODO: Add string to translation system and initialize i18n service earlier
  // Basic Feature Usage
  'click IPFS Streaming to start a Decentralized Streaming',
  'add source AR Face Mask to live with face mask',
  // Prime Feature Usage
  'It may take some time after the live streaming starts to see the latest videos on the website.',
];

export default function Loader() {
  const [loaderText, setLoaderText] = useState('');
  useEffect(lifecycle, []);

  function lifecycle() {
    function loopRandomText() {
      const randomIndex = Math.floor(Math.random() * loadingStrings().length);
      if (loaderText === loadingStrings()[randomIndex]) {
        loopRandomText();
      } else {
        setLoaderText(loadingStrings()[randomIndex]);
      }
    }
    loopRandomText();
    // 修改每条信息显示的时间
    const interval = setInterval(loopRandomText, 3000);

    return function cleanup() {
      clearInterval(interval);
    };
  }

  return (
    <div className="s-loader">
      <div className="s-loader__bg">
        <div className="s-loader__inner">
          <Spinner />
          <div className="s-loader__text">{loaderText}</div>
        </div>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="s-spinner s-spinner__overlay">
      <div className="s-bars">
        <SvgContainer src={spinnerSrc} className="s-spinner--large" />
      </div>
    </div>
  );
}

const spinnerSrc = `
<svg
version="1.1"
xmlns="http://www.w3.org/2000/svg"
xmlnsXlink="http://www.w3.org/1999/xlink"
viewBox="0 0 28 40"
>
  <path d="M0 0, l0 4, l0 -4" id="s-bar-y-path"></path>
  <rect width="4" height="40" x="0" y="0" ry="2" rx="2" class="s-spinner__bar">
    <animate
      attributeName="opacity"
      values=".24; .08; .24"
      begin="0s"
      dur="1.2s"
      repeatCount="indefinite"
    ></animate>
    <animate
      attributeName="height"
      values="40; 32; 40"
      begin="0s"
      dur="1.2s"
      repeatCount="indefinite"
    ></animate>
    <animateMotion begin="0s" dur="1.2s" repeatCount="indefinite">
      <mpath xlink:href="#s-bar-y-path"></mpath>
    </animateMotion>
  </rect>
  <rect width="4" height="40" x="12" y="0" ry="2" rx="2" class="s-spinner__bar">
    <animate attributeName="opacity" values=".24; .24; .24" begin="0s" dur="0.4s"></animate>
    <animate
      attributeName="opacity"
      values=".24; .08; .24"
      begin="0.4s"
      dur="1.2s"
      repeatCount="indefinite"
    ></animate>
    <animate
      attributeName="height"
      values="40; 32; 40"
      begin="0.4s"
      dur="1.2s"
      repeatCount="indefinite"
    ></animate>
    <animateMotion begin="0.4s" dur="1.2s" repeatCount="indefinite">
      <mpath xlink:href="#s-bar-y-path"></mpath>
    </animateMotion>
  </rect>
  <rect width="4" height="40" x="24" y="0" ry="2" rx="2" class="s-spinner__bar">
    <animate attributeName="opacity" values=".24; .24; .24" begin="0s" dur="0.8s"></animate>
    <animate
      attributeName="opacity"
      values=".24; .08; .24"
      begin="0.8s"
      dur="1.2s"
      repeatCount="indefinite"
    ></animate>
    <animate
      attributeName="height"
      values="40; 32; 40"
      begin="0.8s"
      dur="1.2s"
      repeatCount="indefinite"
    ></animate>
    <animateMotion begin="0.8s" dur="1.2s" repeatCount="indefinite">
      <mpath xlink:href="#s-bar-y-path"></mpath>
    </animateMotion>
  </rect>
</svg>`;
