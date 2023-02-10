import React, { useEffect, useState } from 'react';
import { EStreamingState } from 'services/streaming';
import { EGlobalSyncStatus } from 'services/media-backup';
import { $t } from 'services/i18n';
import { useVuex } from '../hooks';
import { Services } from '../service-provider';
import * as remote from '@electron/remote';
import { IPFSStreaming } from 'services/IPFS-streaming'

export default function StartIPFSStreamingButton() {
  const ipfs_streaming = new IPFSStreaming('/ip4/43.206.127.22/tcp/5001');
  const { StreamingService } = Services;
  const { isRecording, recordingStatus } = useVuex(() => ({
    isRecording: StreamingService.views.isRecording,
    recordingStatus: StreamingService.state.recordingStatus,
  }));

  function toggleRecording() {
    if(StreamingService.isRecording) {
      ipfs_streaming.stopIPFSStreaming()
    } else {
      ipfs_streaming.startIPFSStreaming()
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