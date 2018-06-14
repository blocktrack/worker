module.exports = {
    type: (process.env.WORKER) ? process.env.WORKER : 'metaverse-testnet',
    seed: (process.env.SEED) ? process.env.SEED : 'test',
    merkleizer: (process.env.MERKLEIZER) ? process.env.MERKLEIZER : 'http://localhost',
    nonce: (process.env.NONCE) ? process.env.NONCE : 1,
    timer: (process.env.TIMER) ? process.env.TIMER : '* * * * *'
};
