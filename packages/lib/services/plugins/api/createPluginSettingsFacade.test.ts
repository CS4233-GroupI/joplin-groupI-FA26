import { createPluginSettingsFacade, PluginSettingsService } from './createPluginSettingsFacade';

const createMockSettingsService = () => ({
	registerSettings: jest.fn<
		ReturnType<PluginSettingsService['registerSettings']>,
		Parameters<PluginSettingsService['registerSettings']>
	>().mockResolvedValue(undefined),
	value: jest.fn<
		ReturnType<PluginSettingsService['value']>,
		Parameters<PluginSettingsService['value']>
	>(),
	setValue: jest.fn<
		ReturnType<PluginSettingsService['setValue']>,
		Parameters<PluginSettingsService['setValue']>
	>().mockResolvedValue(undefined),
});

describe('createPluginSettingsFacade', () => {
	let settingsService: ReturnType<typeof createMockSettingsService>;
	let facade: ReturnType<typeof createPluginSettingsFacade>;

	beforeEach(() => {
		settingsService = createMockSettingsService();
		facade = createPluginSettingsFacade(settingsService);
	});

	test('should forward settings definitions to the service', async () => {
		const definitions: Parameters<PluginSettingsService['registerSettings']>[0] = {
			refreshInterval: { value: 30, type: 1, public: true, label: 'Refresh interval' },
			retryCount: { value: 3, type: 1, public: true, label: 'Retry count' },
		};

		await facade.registerSettings(definitions);

		expect(settingsService.registerSettings).toHaveBeenCalledTimes(1);
		expect(settingsService.registerSettings).toHaveBeenCalledWith(definitions);
	});

	test.each([
		['a string', 'saved value'],
		['false', false],
		['zero', 0],
		['an empty string', ''],
		['an object', { nested: ['saved value'] }],
	])('should forward the key and return %s unchanged', async (_label, value) => {
		settingsService.value.mockResolvedValueOnce(value);

		const result = await facade.value('pluginSetting');

		expect(settingsService.value).toHaveBeenCalledTimes(1);
		expect(settingsService.value).toHaveBeenCalledWith('pluginSetting');
		expect(result).toBe(value);
	});

	test.each([
		['a string', 'new value'],
		['false', false],
	])('should forward the key and %s update', async (_label, newValue) => {
		await facade.setValue('pluginSetting', newValue);

		expect(settingsService.setValue).toHaveBeenCalledTimes(1);
		expect(settingsService.setValue).toHaveBeenCalledWith('pluginSetting', newValue);
	});

	test('should reject with the same error when an update fails', async () => {
		const error = new Error('Settings update failed');
		settingsService.setValue.mockRejectedValueOnce(error);

		await expect(facade.setValue('pluginSetting', false)).rejects.toBe(error);

		expect(settingsService.setValue).toHaveBeenCalledTimes(1);
		expect(settingsService.setValue).toHaveBeenCalledWith('pluginSetting', false);
	});
});
