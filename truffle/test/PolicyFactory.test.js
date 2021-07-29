const PolicyFactory = artifacts.require("PolicyFactory");

contract('PolicyFactory', function(accounts) {
  let PolicyFactoryInstance;

  before('Deploy Contracts', async() => {
    PolicyFactoryInstance = await PolicyFactory.new();
  });

  it('After users register, they can propose insurance policy', async () => {
    await PolicyFactoryInstance.createPolicy(
      "Car Insurance",
      "Auto",
      100000000000,
      1621405576,
      1621605576,
      'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH',
      1621905576,
      )
    const policyAddresses = await PolicyFactoryInstance.getDeloyedPolicies()
    assert.equal(policyAddresses.length, 1)
  })
});
