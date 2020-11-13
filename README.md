# phala-erc20-crawler

## 配置
根目录下新建`.env`文件，写入环境变量：
* `NETWORK`: `'main'` 或 `'kovan'`
* `START_BLOCK`: 初始的扫块高度，从PHA主网获取，如果获取到0，使用该配置值
* `END_POINT`: PHA节点的地址，默认的`'ws://127.0.0.1:9944'`
* `API_KEY`: 使用ethersscan的api需要api key
* `ACCOUNT_URI`: PHA账户，默认使用Alice

## 安装
```bash
yarn
```

## 运行
启动PHA节点后执行：
```bash
yarn run start
```

