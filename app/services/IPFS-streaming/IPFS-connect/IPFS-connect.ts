// import { create } from 'ipfs-http-client';
//import * as IPFS_HTTP_CLIENT from 'ipfs-http-client'
//import * as IPFS_HTTP_CLIENT from '../../../ipfs-api';

export class IPFSConnect {
    constructor(ipfs_addr: string) {
        this.connect_ipfs(ipfs_addr);
    }

    async connect_ipfs(ipfs_addr: string) {
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++")
        //const IPFS_CLIENT = await import('ipfs-http-client');
        //const IPFS = await import('ipfs-core');
        //console.warn(IPFS);
        //const { create } = await import('ipfs-http-client');
        console.warn(ipfs_addr)
        //console.log(IPFS_HTTP_CLIENT);
        //const client = create({ url: ipfs_addr });
        //console.warn(client)
        console.warn("+++++++++++++++++++++++++++++++++++++++++++++")
    }

}