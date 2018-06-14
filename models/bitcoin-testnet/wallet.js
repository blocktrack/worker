var testCommonWallet = require('test-common-wallet');
var config = require('../../config/worker');

module.exports = (blockchain) => {
    return testCommonWallet({
        seed: config.seed,
        network: 'testnet',
        commonBlockchain: blockchain
    });
}
