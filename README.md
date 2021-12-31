# EquityDAO

Nouns DAO is a generative avatar art collective run by a group of crypto misfits.

EquityDAO will make use of a Microservice Architecture; Each service serving a specific tailored need

## Services:
**API**: to store and serve dealflow metadata; this is done using redis KV pairs

**Bot:** A bot that monitors for changes in dealflow state and notifies everyone via Twitter and Discord.  Details of deal state are fetched via NounsDAO subgraph, monitored every 30s

**Contract:** EquityDAO protocol and deal logic 

**Subgraph:** a subgraph to indexes nouns events, these events are used by other services

**WebApp:** A vue-based frontend implementation for governance, and staking

