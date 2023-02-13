import { SettingsService } from "../settings";
import { IPFSConnect } from "./IPFS-connect";
import { Inject } from '../core/injector';
import { OutputSettingsService } from "../settings";
import { EFileFormat } from "../settings/output/output-settings";
import { StreamingService } from "app-services";
import path from "path";
import * as remote from '@electron/remote';
import fs from 'fs';
import { Service } from 'services/core/service';

const IPFS_HOST_ADDRESS = "/ip4/43.206.127.22/tcp/5001";
const IPFS_UPLOAD_INTERVAL = 5000; // ms
export class IPFSStreamingService extends Service {
    @Inject() settingsService: SettingsService;
    @Inject() outputSettingsService: OutputSettingsService;
    @Inject() streamingService: StreamingService;

    ipfs_conn: IPFSConnect;

    obs_origin_path: string;
    obs_origin_format: EFileFormat;
    obs_origin_isFilenameWithoutSpace: boolean;
    obs_stream_tmp_dir: string;

    ipfs_upload_timer: number | null;
    ipfs_upload_promise: Promise<string>;

    init() {
        this.ipfs_conn = new IPFSConnect(IPFS_HOST_ADDRESS);
        this.obs_origin_path = this.outputSettingsService.getSettings().recording.path;
        this.obs_origin_format = this.outputSettingsService.getSettings().recording.format;
        this.obs_origin_isFilenameWithoutSpace = this.outputSettingsService.getSettings().recording.isFileNameWithoutSpace;
        this.obs_stream_tmp_dir = path.join(remote.app.getPath('appData'),"ipfs_stream_tmp");
    }

    // 暂时修改OBS配置，方便录制HLS流，并放在指定临时文件夹
    modifySettingsTemporarily() {
        this.settingsService.setSettingValue('Output', 'RecFormat', 'm3u8');
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', this.obs_stream_tmp_dir);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', true);
    }

    // 完成后，恢复原来的OBS配置
    // TODO： 除了主动点击停止直播，用户关闭App时，也应该调用resetSettings
    private resetSettings() {
        this.settingsService.setSettingValue('Output', 'RecFormat', this.obs_origin_format);
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', this.obs_origin_path);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', this.obs_origin_isFilenameWithoutSpace);
    }

    private async IPFSUploadPublish(): Promise<string> {
        const ipns_name = await this.ipfs_conn.upload_and_publish(this.obs_stream_tmp_dir)
        return ipns_name
}

    startIPFSStreaming() {
        // 如果文件夹不存在，需要创建，创建失败需要提示用户（健壮性）
        try {
            fs.mkdirSync(this.obs_stream_tmp_dir, {recursive: true});
        } catch(e) {
            // create directory failed
            if(e.code !== "EEXIST") {
                // and it not existing
                alert("create tmprary directory failed, cannot start IPFS Streaming");
                return;
            }
        }
        this.modifySettingsTemporarily()
        this.streamingService.toggleRecording()
        this.ipfs_upload_timer = window.setInterval(async () => {
            this.ipfs_upload_promise = this.IPFSUploadPublish()
        }, IPFS_UPLOAD_INTERVAL);
    }

    async stopIPFSStreaming() {
        if(this.ipfs_upload_timer) {
            clearInterval(this.ipfs_upload_timer);
        }
        this.ipfs_upload_timer = null
        if (this.ipfs_upload_promise) {
            const last_ipns_name = await this.ipfs_upload_promise;
            console.log("8888888888")
            console.warn(last_ipns_name);
            console.log("8888888888")
        }
        this.streamingService.toggleRecording()
        this.resetSettings()
        try {
            fs.rmSync(this.obs_stream_tmp_dir, {recursive: true, force: true});
        } catch(e) {
            // delete tmprary directory failed
            console.log(e)
        }
    }
}