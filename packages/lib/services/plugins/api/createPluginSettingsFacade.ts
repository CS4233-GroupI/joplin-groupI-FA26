import type JoplinSettings from './JoplinSettings';

// Keep the plugin-facing signatures while allowing storage adapters to change.
export type PluginSettingsService = Pick<JoplinSettings,
	| 'registerSettings'
	| 'registerSetting'
	| 'registerSection'
	| 'values'
	| 'value'
	| 'setValue'
	| 'globalValues'
	| 'globalValue'
	| 'onChange'
>;

export function createPluginSettingsFacade(settingsService: PluginSettingsService): PluginSettingsService {
	return {
		async registerSettings(settings) {
			return settingsService.registerSettings(settings);
		},
		async registerSetting(key, settingItem) {
			return settingsService.registerSetting(key, settingItem);
		},
		async registerSection(name, section) {
			return settingsService.registerSection(name, section);
		},
		async values(keys) {
			return settingsService.values(keys);
		},
		async value(key) {
			return settingsService.value(key);
		},
		async setValue(key, value) {
			return settingsService.setValue(key, value);
		},
		async globalValues(keys) {
			return settingsService.globalValues(keys);
		},
		async globalValue(key) {
			return settingsService.globalValue(key);
		},
		async onChange(handler) {
			return settingsService.onChange(handler);
		},
	};
}
