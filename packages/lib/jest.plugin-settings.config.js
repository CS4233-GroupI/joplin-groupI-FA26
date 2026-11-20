// Pure facade tests need neither native modules nor the database test setup.
module.exports = {
	...require('../../jest.config.base.js'),
	testEnvironment: 'node',
	testMatch: ['**/services/plugins/api/createPluginSettingsFacade.test.js'],
};
