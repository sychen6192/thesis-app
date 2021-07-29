const PolicyFactory = artifacts.require("PolicyFactory");
const Registry = artifacts.require("Registry");

module.exports = function(deployer) {
  deployer.deploy(Registry);
  deployer.deploy(PolicyFactory);
}