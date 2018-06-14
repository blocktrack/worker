var blockchain = require('./blockchain.js');
let wallet = require('./wallet.js')(blockchain);
let rawop = require('raw-op-return');

function post(message) {
    return new Promise((resolve, reject) => {
        rawop.post({
            stringData: message,
            commonWallet: wallet,
            commonBlockchain: blockchain
        }, function(error, postedTx) {
            console.log(error);
            if (error) reject(Error(error.message));
            else resolve(postedTx);
        });
    });
}

module.exports = {
    post: post,
    url: (txid) => 'https://live.blockcypher.com/btc-testnet/tx/' + txid
};
