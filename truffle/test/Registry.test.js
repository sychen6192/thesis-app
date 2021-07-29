const Registry = artifacts.require("Registry");

contract('Registry', function(accounts) {
  let RegistryInstance;

  before('Deploy Contracts', async() => {
    RegistryInstance = await Registry.new();
  });

  it('Every user can register by Facebook info successfully.', async () => {
    await RegistryInstance.register("56392871", "陳紹雲")
    const result = await RegistryInstance.mapInsurers(accounts[0]);
    const account = await RegistryInstance.refToAddress(result.refId);
    assert.equal(result.userName, '陳紹雲');
    assert.equal(result.userId, '56392871');
    assert.equal(account, accounts[0]);
  });
});
