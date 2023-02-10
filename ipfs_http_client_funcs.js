const fs = require('fs');
const path = require('path');
const {app} = require('electron');

class IPFS_HTTP_CLIENT {
    constructor(host, port, protocol) {
        this.init(host, port, protocol);
    }
    async init(_host, _port, _protocol) {
        const IPFS_CLIENT = await import("ipfs-http-client");
        //this.client = await IPFS_CLIENT.create({url: 'http://43.206.127.22:5001/'});
        //this.client = await IPFS_CLIENT.create({host: '43.206.127.22', port:'5001', protocol: 'http'});
        this.client = await IPFS_CLIENT.create({host: '127.0.0.1', port:'5001', protocol: 'http'});
        //this.client = await IPFS_CLIENT.create({host: _host, port:_port, protocol: _protocol});
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
        const ipns_name = this.publish(cid)
        return ipns_name
    }
    /*
     * 将文件上传到IPFS，并返回其CID
     */
    async upload_file(file_path) {
        let con = fs.readFileSync(file_path, {encoding: 'utf-8', flag:'r'})
        const result = await this.client.add(con)
        return result.cid.toString();
    }

    /*
     * 上传文件夹中所有文件到IPFS，如果该文件夹中包含其他文件夹，则忽略
     * 返回文件夹的cid
     */
    async upload_dir_non_recursive(dir_path) {
        let fileDetails = []
        const options = {
            wrapWithDirectory: true,
            //progress: (prog) => console.log(`received: ${prog}`)
        }
        try {
            let files = fs.readdirSync(dir_path);
            files.forEach(function(item) {
                let tempPath = path.join(dir_path, item)
                let stats = fs.statSync(tempPath);
                if(!stats.isDirectory()) {
                    let con = fs.readFileSync(tempPath, {encoding: 'utf-8', flag:'r'})
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
        const res = await this.client.name.publish(cid)
        return res.name
    }

}
module.exports = {IPFS_HTTP_CLIENT}