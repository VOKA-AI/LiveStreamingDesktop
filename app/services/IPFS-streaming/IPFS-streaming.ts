import { SettingsService } from "../settings";
import { IPFSConnect } from "./IPFS-connect";
import { Inject } from '../core/injector';
export class IPFSStreaming {
    @Inject() settingsService: SettingsService;
    ipfs_conn: IPFSConnect;
    constructor(ipfs_addr: string) {
        this.ipfs_conn = new IPFSConnect(ipfs_addr);
    }

    // 暂时修改OBS配置，方便录制HLS流，并放在指定临时文件夹
    private modifySettingsTemporarily() {
        //const origin_output_recformat_setting = this.settingsService.findSettingValue("")
        //const OutputSettings = this.settingsService.fetchSettingsFromObs("Output")
        // ensure get the newest settings
        this.settingsService.loadSettingsIntoStore();
        this.settingsService.state
        //this.findSettingValue(settings, 'Streaming', 'Encoder') ||
        this.settingsService.setSettingValue('Output', 'RecFormat', 'm3u8');
        this.settingsService.setSettingValue('Output', 'RecQuality', 'HQ'); //Small < HQ < Lossless
        this.settingsService.setSettingValue('Output', 'FilePath', 'C:\\Users\\remote\\Videos');
    }

    // 完成后，恢复原来的OBS配置
    private resetSettings() {

    }

    startIPFSStreaming() {

    }

}