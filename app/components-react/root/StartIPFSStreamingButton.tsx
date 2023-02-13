import React, { useEffect, useState } from 'react';
import { EStreamingState } from 'services/streaming';
import { EGlobalSyncStatus } from 'services/media-backup';
import { $t } from 'services/i18n';
import { useVuex } from '../hooks';
import { Services } from '../service-provider';
import * as remote from '@electron/remote';

export default function StartIPFSStreamingButton() {
  // 每次点击，StartIPFSStreamingButton()这个function好像都会被调用一边
  // 这个问题导致我在IPFSStreaming类中的定时器总也无法取消，浪费了不少时间
  const { StreamingService, IPFSStreamingService } = Services;
  const { isRecording, recordingStatus } = useVuex(() => ({
    isRecording: StreamingService.views.isRecording,
    recordingStatus: StreamingService.state.recordingStatus,
  }));

  function toggleRecording() {
    if(StreamingService.isRecording) {
      IPFSStreamingService.actions.stopIPFSStreaming();
    } else {
      IPFSStreamingService.actions.startIPFSStreaming()
    }
  }

  return (
    <button
      style={{ minWidth: '130px' }}
      className="Start-IPFS-Streaming"
      disabled={false}
      onClick={toggleRecording}
    >
      Start IPFS Streaming!
    </button>
  );
}