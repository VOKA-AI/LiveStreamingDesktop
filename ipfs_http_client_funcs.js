const fs = require('fs');
const path = require('path');
const {app} = require('electron');

class IPFS_HTTP_CLIENT {
    constructor(host, port, protocol) {
        this.init(host, port, protocol);
    }
    async init(_host, _port, _protocol) {
        const IPFS_CLIENT = await import("ipfs-http-client");
        //this.client = await IPFS_CLIENT.create(ipfs_addr);
        //this.client = await IPFS_CLIENT.create({url: 'http://43.206.127.22:5001/'});
        this.client = await IPFS_CLIENT.create({host: '43.206.127.22', port:'5001', protocol: 'http'});
        //this.client = await IPFS_CLIENT.create({host: _host, port:_port, protocol: _protocol});
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

    async publish(cid) {
        const res = await this.client.name.publish(cid)
        console.log(res)
        console.log(res.name)
    }

    async add(data) {
        const fileDetails = [{
            path: "test",
            content: data
        }, {
            path: "test2",
            content: data + "222"
        }
    ]
        const options = {
            wrapWithDirectory: true,
            progress: (prog) => console.log(`received: ${prog}`)
        }
        const source = await this.client.addAll(fileDetails, options)
        console.log(source)
        try {
            for await (const file of source) {
                console.log(file)
            }
        } catch(err) {
            console.error(err)
        }
    }

    async ls(cid) {
        for await (const file of this.client.ls("QmSX4GfH7bnfQYLdrSYGwqdFBeiFEZXQ4tb77xV3hKwY5V")) {
            console.log(file.path)
        }
    }

    add_dir
}
module.exports = {IPFS_HTTP_CLIENT}