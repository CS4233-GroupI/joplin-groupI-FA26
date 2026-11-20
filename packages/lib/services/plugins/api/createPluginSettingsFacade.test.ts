import { createPluginSettingsFacade } from './createPluginSettingsFacade';
import type { PluginSettingsService } from './createPluginSettingsFacade';
import { SettingItemType } from '../../../models/settings/types';

const createMockSettingsService = () => ({
	registerSettings: jest.fn<
		ReturnType<PluginSettingsService['registerSettings']>,
		Parameters<PluginSettingsService['registerSettings']>
	>().mockResolvedValue(undefined),
	registerSetting: jest.fn<
		ReturnType<PluginSettingsService['registerSetting']>,
		Parameters<PluginSettingsService['registerSetting']>
	>().mockResolvedValue(undefined),
	registerSection: jest.fn<
		ReturnType<PluginSettingsService['registerSection']>,
		Parameters<PluginSettingsService['registerSection']>
	>().mockResolvedValue(undefined),
	values: jest.fn<
		ReturnType<PluginSettingsService['values']>,
		Parameters<PluginSettingsService['values']>
	>(),
	value: jest.fn<
		ReturnType<PluginSettingsService['value']>,
		Parameters<PluginSettingsService['value']>
	>(),
	setValue: jest.fn<
		ReturnType<PluginSettingsService['setValue']>,
		Parameters<PluginSettingsService['setValue']>
	>().mockResolvedValue(undefined),
	globalValues: jest.fn<
		ReturnType<PluginSettingsService['globalValues']>,
		Parameters<PluginSettingsService['globalValues']>
	>(),
	globalValue: jest.fn<
		ReturnType<PluginSettingsService['globalValue']>,
		Parameters<PluginSettingsService['globalValue']>
	>(),
	onChange: jest.fn<
		ReturnType<PluginSettingsService['onChange']>,
		Parameters<PluginSettingsService['onChange']>
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
			refreshInterval: { value: 30, type: SettingItemType.Int, public: true, label: 'Refresh interval' },
			retryCount: { value: 3, type: SettingItemType.Int, public: true, label: 'Retry count' },
		};

		await facade.registerSettings(definitions);

		expect(settingsService.registerSettings).toHaveBeenCalledTimes(1);
		expect(settingsService.registerSettings.mock.calls[0][0]).toBe(definitions);
	});

	test.each([
		['a string', 'saved value'],
		['false', false],
		['zero', 0],
		['an empty string', ''],
		['an object', { nested: ['saved value'] }],
	])('should forward the key and return %s unchanged', async (_label, value) => {
		settingsService.value.mockResolvedValueOnce(value);

		await expect(facade.value('pluginSetting')).resolves.toBe(value);

		expect(settingsService.value).toHaveBeenCalledTimes(1);
		expect(settingsService.value).toHaveBeenCalledWith('pluginSetting');
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
