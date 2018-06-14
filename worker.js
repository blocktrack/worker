var CronJob = require('cron').CronJob;
const config = require('./config/worker.js');
const Request = require("superagent");
const Writer = require("./models/" + config.type);

console.log('started worker of type ' + config.type);

function sleep(ms) {
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
}

sleep(8000);

get(`${config.merkleizer}/latestwork/${config.type}`)
    .then((result) => {
        if (result == undefined) {
            console.info('no latest work found');
            return Promise.resolve();
        } else if (result.tx) {
            console.info('latest completed work found with nonce ' + result.nonce);
            return Promise.resolve();
        } else if (result.nonce && result.tx == undefined) {
            console.info('latest incomplete work found with nonce ' + result.nonce);
            return get(`${config.merkleizer}/getwork/${config.type}/${result.nonce}`)
                .then(work => Writer.post(work.work))
                .then(tx => {
                    console.info(`Work ${result.nonce} wrote ${tx.txid}`);
                    return post(`${config.merkleizer}/submitwork/${config.type}/${result.nonce}`, {
                        tx: tx.txid
                    });
                })
                .then(() => {
                    console.info('completed previous work');
                });
        }
        console.error(result);
        throw Error('failed to find previous work');
    })
    .then(()=>{
        start();
    });

function start() {
    new CronJob(config.timer, function() {
        var nonce = Date.now() / 1000 | 0;
        console.info(`Try get work ${nonce}`);
        post(`${config.merkleizer}/setwork/${config.type}/${nonce}`, {})
            .then((work) => Writer.post(work))
            .then((tx) => {
                console.info(`Work ${nonce} wrote ${tx.txid}`);
                return post(`${config.merkleizer}/submitwork/${config.type}/${nonce}`, {
                    tx: tx.txid
                });
            })
            .then(() => nonce++)
            .catch((error) => {
                switch (error.message) {
                    case 'ERR_CANT_SEE_NO_TREE':
                        console.error("Nothing to do");
                        break;
                    case 'ERR_NONCE_EXISTS':
                        console.error("Nonce exists: " + nonce);
                        nonce++;
                        break;
                    default:
                        console.error(error);
                        process.exit(1);
                }
            });

    }, null, true, 'Europe/Berlin');

}

function post(url, data) {
    return new Promise((resolve, reject) => {
        return Request.post(url)
            .send(data)
            .set('accept', 'json')
            .end((err, response) => {
                try {
                    response = JSON.parse(response.text);
                } catch (e) {}
                if (response && response.status && response.status.success === 0 && response.status.message)
                    reject({
                        message: response.status.message
                    });
                else if (err)
                    reject(Error(err.message));
                else {
                    resolve(response.result);
                }
            });
    });
}

function get(url) {
    return new Promise((resolve, reject) => {
        return Request.get(url)
            .send()
            .set('accept', 'json')
            .end((err, response) => {
                try {
                    response = JSON.parse(response.text);
                } catch (e) {}
                if (err) {
                    reject(Error(err.message));
                } else if (response.error != undefined)
                    reject({
                        name: response.error.code,
                        message: response.error.message
                    });
                else {
                    resolve(response.result);
                }
            });
    });
}
