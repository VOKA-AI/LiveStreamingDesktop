import React, { useEffect, useState } from 'react';
import { EStreamingState } from 'services/streaming';
import { EGlobalSyncStatus } from 'services/media-backup';
import { $t } from 'services/i18n';
import { useVuex } from '../hooks';
import { Services } from '../service-provider';
import * as remote from '@electron/remote';
import serve from 'services/axios'

export default function StartIPFSStreamingButton() {
  // 每次点击，StartIPFSStreamingButton()这个function好像都会被调用一边
  // 这个问题导致我在IPFSStreaming类中的定时器总也无法取消，浪费了不少时间
  const { StreamingService, IPFSStreamingService } = Services;
  const { isRecording, recordingStatus } = useVuex(() => ({
    isRecording: StreamingService.views.isRecording,
    recordingStatus: StreamingService.state.recordingStatus,
  }));

  async function toggleRecording() {
    //const params = new URLSearchParams();
    //params.append("user", "tianxu_test");
    //params.append("password", '123456');
    //const aaa = serve({
      //url: "/test",
      //method: "get",
      //data: params
    //})
    //console.log(aaa)
    //const { data: res } = await aaa; //请求到的res是一个list
    //console.log(res)
    //return
    //const walletAddress = localStorage.getItem("walletAddress");
    //if(!walletAddress) {
      //console.log(walletAddress)
    //}
    if(StreamingService.isRecording) {
      IPFSStreamingService.actions.stopIPFSStreaming();
    } else {
      IPFSStreamingService.actions.startIPFSStreaming()
    }
  }

  return (
    <div>

    {!isRecording && <button
      style={{ minWidth: '130px' }}
      className="Start-IPFS-Streaming"
      disabled={false}
      onClick={toggleRecording}
    >
      Start IPFS Streaming!
    </button>}

    {isRecording && <button
      style={{ minWidth: '130px' }}
      className="Start-IPFS-Streaming"
      disabled={false}
      onClick={toggleRecording}
    >
      Stop IPFS Streaming!
    </button>}
    </div>
  );
}