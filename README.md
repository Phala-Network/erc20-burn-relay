# phala-erc20-crawler

## 准备工作
修改`phala-erc20-crawler/app.js`的`worker()`函数中的变量值: 
* `network`: `'main'`以太坊主网 或 `'kovan'`以太坊测试网 
* `contractAddress`: 对应网络中的PHA合约地址，默认为kovan测试网的一个合约地址
* `defultStartBlock`: 抓取交易的默认起始区块高度，由于claim-pallet还没配置初始的高度，最开始抓取到0的时候使用这个defultStartBlock
* `wsEndPoint`: PHA节点的地址，本地部署且端口为9944，使用默认的`'ws://127.0.0.1:9944'`即可

## 部署启动
在已经启动PHA节点的前提下，在根目录下执行：
```bash
yarn
node app.js
```

