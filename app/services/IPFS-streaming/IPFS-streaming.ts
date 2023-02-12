import { SettingsService } from "../settings";
import { IPFSConnect } from "./IPFS-connect";
import { Inject } from '../core/injector';
import { OutputSettingsService } from "../settings";
import { EFileFormat } from "../settings/output/output-settings";
import { StreamingService } from "app-services";
import { Stream } from "stream";
import path from "path";
import * as remote from '@electron/remote';
import fs from 'fs';
export class IPFSStreaming {
    @Inject() settingsService: SettingsService;
    @Inject() outputSettingsService: OutputSettingsService;
    @Inject() streamingService: StreamingService;
    ipfs_conn: IPFSConnect;
    origin_path: string;
    origin_format: EFileFormat;
    origin_isFilenameWithoutSpace: boolean;
    IPFS_upload_flag: boolean;

    stream_tmp_dir: string;
    constructor(ipfs_addr: string) {
        this.ipfs_conn = new IPFSConnect(ipfs_addr);
        this.origin_path = this.outputSettingsService.getSettings().recording.path;
        this.origin_format = this.outputSettingsService.getSettings().recording.format;
        this.origin_isFilenameWithoutSpace = this.outputSettingsService.getSettings().recording.isFileNameWithoutSpace;
        this.IPFS_upload_flag = false;
        this.stream_tmp_dir = path.join(remote.app.getPath('appData'),"ipfs_stream_tmp");
    }

    // 暂时修改OBS配置，方便录制HLS流，并放在指定临时文件夹
    modifySettingsTemporarily() {
        this.settingsService.setSettingValue('Output', 'RecFormat', 'm3u8');
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', this.stream_tmp_dir);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', true);
    }

    // 完成后，恢复原来的OBS配置
    // TODO： 除了主动点击停止直播，用户关闭App时，也应该调用resetSettings
    private resetSettings() {
        this.settingsService.setSettingValue('Output', 'RecFormat', this.origin_format);
        //this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', this.origin_path);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', this.origin_isFilenameWithoutSpace);
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

        try {
            fs.mkdirSync(this.stream_tmp_dir, {recursive: true});
        } catch(e) {
            // create directory failed
            if(e.code !== "EEXIST") {
                // and it not existing
            }
        }
        this.modifySettingsTemporarily()
        this.streamingService.toggleRecording()
        this.IPFS_upload_flag = true;
        this.IPFSUploadPublish(path.join(remote.app.getPath('appData'),"ipfs_stream_tmp"), 5000);
    }

    stopIPFSStreaming() {
        console.log("stop IPFS streaming")
        this.streamingService.toggleRecording()
        this.resetSettings()
        try {
            fs.rmSync(this.stream_tmp_dir, {recursive: true, force: true});
        } catch(e) {
            // delete tmprary directory failed
            console.log(e)
        }
        this.IPFS_upload_flag = false; //这样无法停止IPFSUploadPublish函数
    }

}