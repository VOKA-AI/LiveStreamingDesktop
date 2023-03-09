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

const IPFS_UPLOAD_INTERVAL = 5000; // ms
const IPFS_STREAM_TMP_DIR = path.join(remote.app.getPath('appData'), "ipfs_stream_tmp");

remote.getCurrentWindow().on('close', () => {
    //IPFSStreamingService.instance.resetSettings();
    IPFSStreamingService.instance.action.resetSettings();
    //await IPFSStreamingService.instance.IPFSUploadPublish();
    //await IPFSStreamingService.instance.stopIPFSStreaming();
})

export class IPFSStreamingService extends Service {
    @Inject() settingsService: SettingsService;
    @Inject() outputSettingsService: OutputSettingsService;
    @Inject() streamingService: StreamingService;

    ipfs_conn: IPFSConnect;

    obs_origin_path: string;
    obs_origin_format: EFileFormat;
    obs_origin_isFilenameWithoutSpace: boolean;

    ipfs_upload_timer: number | null;
    ipfs_upload_promise: Promise<string>;

    init() {
        this.ipfs_conn = new IPFSConnect();
        this.update_origin_obs_settings()
    }

    private update_origin_obs_settings() {
        this.obs_origin_path = this.outputSettingsService.getSettings().recording.path;
        this.obs_origin_format = this.outputSettingsService.getSettings().recording.format;
        this.obs_origin_isFilenameWithoutSpace = this.outputSettingsService.getSettings().recording.isFileNameWithoutSpace;
    }

    // 暂时修改OBS配置，方便录制HLS流，并放在指定临时文件夹
    private modifySettingsTemporarily() {
        this.update_origin_obs_settings()
        this.settingsService.setSettingValue('Output', 'RecFormat', 'm3u8');
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', IPFS_STREAM_TMP_DIR);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', true);
    }

    // 完成后，恢复原来的OBS配置
    resetSettings() {
        this.settingsService.setSettingValue('Output', 'RecFormat', this.obs_origin_format);
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', this.obs_origin_path);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', this.obs_origin_isFilenameWithoutSpace);
    }

    private async IPFSUploadPublish(): Promise<string> {
        return this.ipfs_conn.upload_and_publish(IPFS_STREAM_TMP_DIR)
    }

    startIPFSStreaming() {
        // 如果文件夹不存在，需要创建，创建失败需要提示用户（健壮性）
        try {
            fs.mkdirSync(IPFS_STREAM_TMP_DIR, {recursive: true});
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
        }
        this.streamingService.toggleRecording()
        this.resetSettings()
        try {
            fs.rmSync(IPFS_STREAM_TMP_DIR, {recursive: true, force: true});
        } catch(e) {
            // delete tmprary directory failed
            console.log(e)
        }
        // notice user that a directory delete(with out interactive)
    }
}
