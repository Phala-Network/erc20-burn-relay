# phala-erc20-crawler

## 配置
修改`src/config.json`:
* `network`: `'main'` 或 `'kovan'`
* `contract`: PHA合约地址
* `startBlock`: 初始的扫块高度，从PHA主网获取，如果获取到0，使用该配置值
* `endPoint`: PHA节点的地址，默认的`'ws://127.0.0.1:9944'`
* `apiKey`: 使用ethersscan的api需要api key
* `accountUri`: PHA账户，默认使用Alice

## 安装
```bash
yarn
```

## 运行
启动PHA节点后执行：
```bash
yarn run start
```

