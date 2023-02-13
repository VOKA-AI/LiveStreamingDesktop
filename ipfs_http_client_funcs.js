const fs = require('fs');
const path = require('path');
const {app} = require('electron');

const IPFS_HOST = "43.206.127.22"
const IPFS_PORT = "5001"
const IPFS_POTOCOL = "http"

class IPFS_HTTP_CLIENT {
    constructor(host, port, protocol) {
        this.init(host, port, protocol);
    }

    async init(_host, _port, _protocol) {
        const IPFS_CLIENT = await import("ipfs-http-client");
        this.client = await IPFS_CLIENT.create({host: IPFS_HOST, port:IPFS_PORT, protocol: IPFS_POTOCOL});
    }

    async upload_and_publish(path) {
        let stats = fs.statSync(path);
        let cid = ""
        if(stats.isDirectory()) {
            cid = await this.upload_dir_non_recursive(path)
        } else {
            cid = await this.upload_file(path)
        }
        if(cid == "") {
            return ""
        }
        const ipns_name = await this.publish(cid)
        return ipns_name
    }
    /*
     * 将文件上传到IPFS，并返回其CID
     */
    async upload_file(file_path) {
        //let con = fs.readFileSync(file_path, {encoding: 'utf-8', flag:'r'}) // 上传视频文件是好像不行, 不能正常播放
        let con = fs.readFileSync(file_path) // binary
        const result = await this.client.add(con)
        return result.cid.toString();
    }

    async append_file2dir(target_ipfs_dir_cid, file) {

    }

    async modify_file_in_dir(target_ipfs_dir_cid, target_ipfs_file_cid, new_file_content) {

    }

    /*
     * 上传文件夹中所有文件到IPFS，如果该文件夹中包含其他文件夹，则忽略
     * 返回文件夹的cid
     */
    async upload_dir_non_recursive(dir_path) {
        let fileDetails = []
        const options = {
            pin: true,
            wrapWithDirectory: true,
            //progress: (prog) => console.log(`received: ${prog}`)
        }
        try {
            let files = fs.readdirSync(dir_path);
            files.forEach(function(item) {
                let tempPath = path.join(dir_path, item)
                let stats = fs.statSync(tempPath);
                if(!stats.isDirectory()) {
                    // let con = fs.readFileSync(tempPath, {encoding: 'utf-8', flag:'r'})
                    let con = fs.readFileSync(tempPath)
                    fileDetails.push({path: item, content: con})
                }
            })
        } catch(e) {
            console.log(e);
        }
        let res_cid = "";
        const source = await this.client.addAll(fileDetails, options)
        try {
            for await (const file of source) {
                if(file.path == '') {
                    res_cid = file.cid
                }
            }
        } catch(err) {
            console.error(err)
        }
        return res_cid.toString();
    }

    /*
     * 将IPNS指向cid，并返回IPNS的地址
     */
    async publish(cid) {
        const options = {
            allowOffline: true,
        }
        const res = await this.client.name.publish(cid, options)
        return res.name
    }

}
module.exports = {IPFS_HTTP_CLIENT}