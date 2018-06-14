var blockchain = require('mvs-blockchain')({url: 'https://explorer-testnet.mvs.org/api/'});
let Metaverse = require('metaversejs');
var config = require('../../config/worker');

module.exports = {
    post: post,
    url: (txid) => 'https://explorer-testnet.mvs.org/#!/tx/' + txid
};

function post(message) {
    return Metaverse.wallet.fromMnemonic(config.seed, 'testnet')
        .then((wallet) =>
            blockchain.addresses.txs([wallet.getAddresses()[0]])
            .then(txs => Metaverse.output.calculateUtxo(txs.transactions, [wallet.getAddresses()[0]])) //Get all utxo
            .then((utxos) => Metaverse.output.findUtxo(utxos, {}, 0)) //Collect utxo for given target
            .then((result) => Metaverse.transaction_builder.send(result.utxo, wallet.getAddresses()[0], {}, wallet.getAddresses()[0], result.change, undefined, (Array.isArray(message) ? message : [message])))
            .then((tx) => wallet.sign(tx))
            .then((tx) => tx.encode())
            .then((tx) => blockchain.transaction.broadcast(tx.toString('hex')))
            .then((txid) => {
                return {
                    txid: txid.hash
                };
            }))
        .catch((error) => {
            console.error(error);
            throw error.message;
        });

}
