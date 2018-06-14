<p align="center">
  <a href="https://www.blocktrack.net/">
  <h1 align="center">Blocktrack Worker</h1>
  </a>
  Worker for the blocktrack service
</p>

# How to use
The easiest way to startup the services is using docker compose. It will automaticlly download and start all dependencies. An example setup you can find in setup folder of the blocktrack merkleizer.

## Configuration

The best way to configure your worker(s) is using environment variable. You can also use the configuration file in the config folder.

| Environment variable | Description                   | Default           |
| ---                  | ---                           | ---               |
| WORKER               | Type of woeker                | metaverse-testnet |
| SEED                 | Seed of hd wallet             | test              |
| MERKLEIZER           | URL to merkleizer service     | http://localhost  |
| TIMER                | Timer definition (cron style) | * * * * *         |
