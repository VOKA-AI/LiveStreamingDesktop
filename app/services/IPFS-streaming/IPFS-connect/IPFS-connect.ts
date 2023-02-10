//import { create } from 'ipfs-http-client';
//import * as IPFS_HTTP_CLIENT from 'ipfs-http-client'

//import * as IPFS_HTTP_CLIENT from 'ipfs-http-client'
//import * as IPFS_HTTP_CLIENT from '../../../ipfs-api';
//import * as ipfs from '../../../../ipfs-api';
//import * as ipfs from 'ipfs-http-client'
//import * as ipfs from 'ipfs-http-client'
import * as remote from '@electron/remote';

export class IPFSConnect {
    constructor(ipfs_addr: string) {
        // this.connect_ipfs(ipfs_addr);
        //const client = await IPFS.create('/ip4/43.206.127.22/tcp/5001');
    }

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

    async upload_and_publish(path: string) {
        const ipns_name = await remote.getGlobal("ipfs_http_client_funcs").upload_and_publish(path);
        if(ipns_name.length > 0) {
            console.log(ipns_name);
        }
        return ipns_name
    }

}