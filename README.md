# OSP Snapshot Project

由四部分组成

1. Snapshot Sequencer

https://snapshot-sequencer.opensocial.co

用户通过链下签名创建 Spaces、Proposals、 Votes， sequencer 服务验证 ERC712 签名和数据的有效性，并保存到数据库中。

https://github.com/EthanOK/osp-snapshot/tree/ospmaster_snapshot-sequencer

Base [snapshot-labs](https://github.com/snapshot-labs/snapshot-sequencer)

2. Snapshot hub

https://snapshot-hub.opensocial.co/graphql

GraphQL 查询服务, 查询 Spaces、Proposals、 Votes 数据。

https://github.com/EthanOK/osp-snapshot/tree/ospmaster_snapshot-hub

Base [snapshot-labs](https://github.com/snapshot-labs/snapshot-hub)

3. Snapshot score-api

https://score-api.opensocial.co

基于 Snapshot 协议计算各种策略的分数。

https://github.com/EthanOK/osp-snapshot/tree/ospmaster_score-api

Base [snapshot-labs](https://github.com/snapshot-labs/score-api)

4. OSP Snapshot SDK

OSP 基于 Snapshot 协议的 TypeScript SDK。

`npm i @open-social-protocol/snapshot-sdk`

https://github.com/EthanOK/osp-snapshot/tree/ospmaster-v0.0
