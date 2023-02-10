import { SettingsService } from "../settings";
import { IPFSConnect } from "./IPFS-connect";
import { Inject } from '../core/injector';
import { OutputSettingsService } from "../settings";
import { StreamingService } from "app-services";
import { Stream } from "stream";
import path from "path";
import * as remote from '@electron/remote';
export class IPFSStreaming {
    @Inject() settingsService: SettingsService;
    @Inject() outputSettingsService: OutputSettingsService;
    @Inject() streamingService: StreamingService;
    ipfs_conn: IPFSConnect;
    origin_path: string;
    origin_format: any;
    IPFS_upload_flag: boolean;
    constructor(ipfs_addr: string) {
        this.ipfs_conn = new IPFSConnect(ipfs_addr);
        this.origin_path = this.outputSettingsService.getSettings().recording.path;
        this.origin_format = this.outputSettingsService.getSettings().recording.format;
        this.IPFS_upload_flag = false;
    }

    // 暂时修改OBS配置，方便录制HLS流，并放在指定临时文件夹
    modifySettingsTemporarily() {
        this.settingsService.setSettingValue('Output', 'RecFormat', 'm3u8');
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', path.join(remote.app.getPath('appData'),"ipfs_stream_tmp"));
    }

    // 完成后，恢复原来的OBS配置
    private resetSettings() {
        this.settingsService.setSettingValue('Output', 'RecFormat', this.origin_format);
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', this.origin_path);
    }

    private async IPFSUploadPublish(_path: string, time_interval_ms: number) {
        console.log("000000000000")
        console.log("uploading " + _path);
        if(!this.IPFS_upload_flag) {
            return;
        }
        const ipns_name =await this.ipfs_conn.upload_and_publish(path.join(remote.app.getPath('appData'),"ipfs_stream_tmp"))
        console.log(ipns_name)
        console.log("000000000000")
        setTimeout(() => {
            this.IPFSUploadPublish(_path, time_interval_ms);
        }, time_interval_ms);
    }

    startIPFSStreaming() {
        console.log("start IPFS streaming")
        // 如果文件夹不存在，需要创建，创建失败需要提示用户（健壮性）
        console.log(path.join(remote.app.getPath('appData'),"ipfs_stream_tmp"))
        this.modifySettingsTemporarily()
        this.streamingService.toggleRecording()
        this.IPFS_upload_flag = true;
        this.IPFSUploadPublish(path.join(remote.app.getPath('appData'),"ipfs_stream_tmp"), 5000);
    }

    stopIPFSStreaming() {
        console.log("stop IPFS streaming")
        this.streamingService.toggleRecording()
        this.resetSettings()
        this.IPFSUploadPublish(path.join(remote.app.getPath('appData'),"ipfs_stream_tmp"), 5000);
        this.IPFS_upload_flag = false; //这样无法停止IPFSUploadPublish函数
    }

}