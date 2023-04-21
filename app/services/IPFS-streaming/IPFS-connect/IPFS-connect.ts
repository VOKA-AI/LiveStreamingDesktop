//import { create } from 'ipfs-http-client';
//import * as IPFS_HTTP_CLIENT from 'ipfs-http-client'

//import * as IPFS_HTTP_CLIENT from 'ipfs-http-client'
//import * as IPFS_HTTP_CLIENT from '../../../ipfs-api';
//import * as ipfs from '../../../../ipfs-api';
//import * as ipfs from 'ipfs-http-client'
//import * as ipfs from 'ipfs-http-client'
import * as remote from '@electron/remote';
import * as fs from 'fs';  

export class IPFSConnect {
    async connect_ipfs(ipfs_addr: string) {
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++")
        //const IPFS_CLIENT = await import('ipfs-http-client');
        //const IPFS = await import('ipfs-core');
        //console.warn(IPFS);
        //const { create } = await import('ipfs-http-client');
        //const ipfs = await import('ipfs-http-client')
        //console.warn(ipfs);
        //console.log(IPFS_HTTP_CLIENT);
        //const client = ipfs.create({ url: ipfs_addr });
        //console.warn(client)
        //await remote.getGlobal("ipfs_add")("hello");
        //await remote.getGlobal("ipfs_http_client_funcs").add("hello world1111")
        const res_cid = await remote.getGlobal("ipfs_http_client_funcs").upload_dir_non_recursive(remote.app.getPath('appData'))
        const ipns_name = await remote.getGlobal("ipfs_http_client_funcs").publish(res_cid)
        console.log(ipns_name);
        
        //await remote.getGlobal("ipfs_http_client_funcs").ls("")
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++")
        
    }
    // 将路径为path的本地文件上传到IPFS的targetDir中
    async uploadFile2IPFSDir(localFilePath:string, IPFSDirName:string) {
        let stats = fs.statSync(localFilePath);
        if(stats.isDirectory()) {
            throw new Error(localFilePath + " is a directory");
        }
        try {
            await remote.getGlobal("ipfs_http_client_funcs").upload2Directory(localFilePath, IPFSDirName);
        } catch(e) {
            throw e;
        }
    }

    // 将一组文件批量上传
    async uploadFiles2IPFSDir(localFilesPath:string[], IPFSDirName:string) {
        try {
            await remote.getGlobal("ipfs_http_client_funcs").uploadFiles2Directory(localFilesPath, IPFSDirName);
        } catch(e) {
            throw e;
        }
    }

    async uploadAllFileOfDir2IPFSDir(localDirPath:string, IPFSDirName: string): Promise<string[]> {
        let stats = fs.statSync(localDirPath);
        if(!stats.isDirectory()) {
            throw new Error(localDirPath + " is not a directory");
        }
        let files_path = [];
        let files = fs.readdirSync(localDirPath);
        for(let i = 0;i < files.length;++i) {
            files_path.push(localDirPath + "\\" + files[i]);
        }
        let uploaded_file_name;
        try {
            uploaded_file_name = await remote.getGlobal("ipfs_http_client_funcs").uploadFiles2Directory(files_path, IPFSDirName);
        } catch(e) {
            throw e;
        }
        console.log(uploaded_file_name);
        return uploaded_file_name;
    }

    // 用路径为path的本地文件内容，更新IPFS files中的文件
    // 如果目标IPFS文件不存在，则创建新的
    // 如果目标IPFS文件已经存在，则清空其内容后再将内容修改为本地文件内容
    async updateIPFSFile(localFilePath:string, IPFSFilePath:string) {
        try {
            await remote.getGlobal("ipfs_http_client_funcs").updateFileContent(localFilePath, IPFSFilePath);
        } catch(e) {
            console.log(e);
            throw e;
        }
    }
    
    async upload_and_publish(path: string) {
        const ipns_name = await remote.getGlobal("ipfs_http_client_funcs").upload_and_publish(path);
        if(ipns_name.length > 0) {
            console.log(ipns_name);
        }
        return ipns_name
    }

    async pubsub_send(topic:string, msg:string) {
        try {
            await remote.getGlobal("ipfs_http_client_funcs").pubsub_send(topic, msg);
        } catch(e) {
            throw e;
        }
    }

    async pubsub_sub(topic:string, callback:Function) {
        try {
            await remote.getGlobal("ipfs_http_client_funcs").pubsub_sub(topic, callback);
        } catch(e) {
            throw e;
        }
    }

    async pubsub_unsub(topic:string) {
        try {
            await remote.getGlobal("ipfs_http_client_funcs").pubsub_unsub(topic);
        } catch(e) {
            throw e;
        }
    }

}