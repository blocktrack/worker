var blockchain = require('mvs-blockchain')({
    url: 'https://explorer-testnet.mvs.org/api/'
});
let Metaverse = require('metaversejs');
var config = require('../../config/worker');
var mvs_config = require('../../config/metaverse');

module.exports = {
    post: post,
    url: (txid) => 'https://explorer-testnet.mvs.org/#!/tx/' + txid
};

function post(message) {
    return Metaverse.wallet.fromMnemonic(config.seed, 'testnet')
        .then((wallet) =>
            blockchain.utxo.get([wallet.getAddresses()[0]])
            .then((utxos) => Metaverse.output.findUtxo(utxos, {}, 0)) //Collect utxo for given target
            .then((result) => {
                if (mvs_config.use_mit) {
                    if (mvs_config.avatar) {
                        return Metaverse.transaction_builder.registerMIT(result.utxo, wallet.getAddresses()[0], mvs_config.avatar, message, mvs_config.mit_content, wallet.getAddresses()[0], result.change);
                    } else {
                        throw Error('Incomplete MIT writer configuration');
                    }
                }
                return Metaverse.transaction_builder.send(result.utxo, wallet.getAddresses()[0], {}, wallet.getAddresses()[0], result.change, undefined, (Array.isArray(message) ? message : [message]));
            })
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
