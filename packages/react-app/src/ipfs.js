const chalk = require("chalk");
const ipfsApi = require("ipfs-http-client");


const infura = { host: "ipfs.infura.io", port: "5001", protocol: "https" };
// Run your own ipfs daemon: https://docs.ipfs.io/how-to/command-line-quick-start/#install-ipfs
// const localhost = { host: "localhost", port: "5001", protocol: "http" };

const ipfs = ipfsApi(infura);

export default ipfs;