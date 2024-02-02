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

    hls_stream_manager: HLSStreamFilesManager;

    init() {
        this.update_origin_obs_settings()
        this.hls_stream_manager = new HLSStreamFilesManager(IPFS_STREAM_TMP_DIR, "/" + localStorage.getItem("test_address"));
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
        this.settingsService.setSettingValue('Output', 'RecQuality', 'Small'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', IPFS_STREAM_TMP_DIR);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', true);
    }

    // 完成后，恢复原来的OBS配置
    resetSettings() {
        this.settingsService.setSettingValue('Output', 'RecFormat', this.obs_origin_format);
        this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', this.obs_origin_path);
        this.settingsService.setSettingValue('Output', 'FileNameWithoutSpace', this.obs_origin_isFilenameWithoutSpace);
    }

    startIPFSStreaming() {
        // 如果文件夹不存在，需要创建，创建失败需要提示用户（健壮性）
        try {
            fs.mkdirSync(IPFS_STREAM_TMP_DIR, {recursive: true});
        } catch(e) {
            // create directory failed
            if(e.code === "EEXIST") {
                // 如果文件夹已经存在，先强制删除
                fs.rmSync(IPFS_STREAM_TMP_DIR, { recursive: true, force: true });
            } else {
                // and it not existing
                alert("create tmprary directory failed, cannot start IPFS Streaming");
                return;
            } 
        }
        this.modifySettingsTemporarily()
        this.streamingService.toggleRecording()
        this.ipfs_upload_timer = window.setInterval(async () => {
            this.hls_stream_manager.syncStream2IPFS();
        }, IPFS_UPLOAD_INTERVAL);
    }

    async stopIPFSStreaming() {
        if(this.ipfs_upload_timer) {
            clearInterval(this.ipfs_upload_timer);
        }
        this.ipfs_upload_timer = null
        this.streamingService.toggleRecording()
        try {
            this.resetSettings()
            fs.rmSync(IPFS_STREAM_TMP_DIR, {recursive: true, force: true});
        } catch(e) {
            // delete tmprary directory failed
            console.log(e)
        }
        // notice user that a directory delete(with out interactive)
    }
}


class HLSStreamFilesManager {
    ipfs_conn: IPFSConnect;

    m3u8_file_name: string;
    ts_files_uploaded: Array<string>; // 已经上传了的ts
    ts_files_need_upload: Array<string>; // 还未上传的ts文件

    base_path: string;
    target_ipfs_dirname: string; //即IPFS files 操作时的directory
    // 初始化时指定流所在文件夹
    constructor(localPath: string, targetIPFSDirName: string) {
        this.ipfs_conn = new IPFSConnect();
        this.ts_files_uploaded = [];
        this.base_path = localPath;
        this.target_ipfs_dirname = targetIPFSDirName;
        this.m3u8_file_name = "";
    }

    // 将流同步到IPFS
    /*
     * 1. 上传所有未上传的ts文件到IPFS指定directory
     * 2. 更新IPFS directory下的m3u8文件
     */
    async syncStream2IPFS() {
        await this.uploadTsFiles();
        await this.updateM3u8File();
    }

    getAllTsFilesNeedUpload() {
        // 现在时直接读文件夹，以后也可以改为都"m3u8"文件，防止有多余ts
        let files:any[] = [];
        try {
            files = fs.readdirSync(this.base_path);
        }
        catch(e) {
            console.log(e);
            return [];
        }
        let ts_files = [];
        for(let i = 0;i < files.length;++i) {
            const file_name = files[i];
            if(file_name.split(".")[1] === "ts") {
                ts_files.push(file_name);
            }
        }
        return ts_files;
    }

    getTsFilesNotUpload() {
        let left_ts_files = [];
        const ts_files = this.getAllTsFilesNeedUpload();
        for(let i = 0;i <ts_files.length;++i) {
            const file_name = ts_files[i];
            if(!this.ts_files_uploaded.includes(file_name)) {
                left_ts_files.push(file_name);
            }
        }
        return left_ts_files;
    }

    // 把还未上传过的ts文件上传
    async uploadTsFiles() {
        const left_ts_files = this.getTsFilesNotUpload();
        for(let i = 0;i < left_ts_files.length;++i) {
            const file_name = left_ts_files[i];
            try {
                await this.ipfs_conn.uploadFile2IPFSDir(path.join(this.base_path, file_name), this.target_ipfs_dirname);
                this.ts_files_uploaded.push(file_name);
            } catch(e) {
                continue;
            }
        }
    }

    getAllm3u8File() {
        let files: any[] = [];
        try {
            files = fs.readdirSync(this.base_path);
        } catch(e) {
            console.log(e);
            return [];
        }
        let m3u8_files = [];
        for(let i = 0;i < files.length;++i) {
            const file_name = files[i];
            if(file_name.split(".")[1] === "m3u8") {
                m3u8_files.push(file_name);
            }
        }
        return m3u8_files;
    }

    getLatestM3u8File() {
        let files: any[];
        try {
            files = fs.readdirSync(this.base_path);
        } catch(e) {
            return ""
        }
        for(let i = 0;i < files.length;++i) {
            if(files[i].split(".")[1] === "m3u8") {
                return files[i];
            }
        }
        // 没找到
        return "";
    }

    // 更新m3u8文件
    updateM3u8File() {
        const m3u8_file_name = this.getLatestM3u8File();
        if(m3u8_file_name.length === 0) {
            console.log("no m3u8 file")
            return;
        }
        try {
            this.ipfs_conn.updateIPFSFile(path.join(this.base_path, m3u8_file_name), this.target_ipfs_dirname);
        } catch (e) {
            console.log(e);
        }
    }

    // ts文件是否上传成功，除了本地记录外，也可以与线上对比，用来矫正结果
    checkStreamWithIPFS() {

    }

    // 注意：会删除文件夹中所有文件，可能导致数据丢失，谨慎调用！
    clearAllFiles(dirPath = this.base_path) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filePath = `${path}/${file}`;
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                this.clearAllFiles(filePath);
                fs.rmdirSync(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
    });

    }

    // 获取最新的m3u8文件
    getLatestM3u8FileName() {

    }
}
