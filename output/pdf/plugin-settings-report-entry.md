## Plugin settings facade

**Feature:** Create a stable Plugin API facade so plugins can register, read, and update settings without depending on how Joplin stores them internally.

**Results:** Codex implemented `createPluginSettingsFacade(settingsService)` and one Jest test file with four test groups, expanding to nine individual cases. All nine cases passed using Jest 29.7.0. The tests exercise the facade's public methods against a fresh mocked settings service and run without launching Joplin or opening a database. The facade uses the existing `JoplinSettings` method signatures through a type-only import.

**Requirement mapping:**

1. Registration: one case verifies that `registerSettings` forwards the supplied settings definitions.
2. Reads: five cases verify that `value` forwards the requested key and returns a string, `false`, `0`, an empty string, and an object unchanged. The object case also checks reference identity.
3. Updates: two cases verify that `setValue` forwards the key and a string or `false` as the new value.
4. Update failure: one case verifies that `setValue` rejects with the same error instance rejected by the service.

**Limitations:** These are isolated delegation tests. They do not verify persistence, plugin key namespacing, validation, migration, or compatibility across Joplin releases. The factory is implemented but has not been connected to the plugin runtime; a production adapter and integration tests are still needed. No claim is made that long-term compatibility has been established. Test acceptance/rejection counts have not been supplied by the author.

**Validation:** The two TypeScript files were transpiled to temporary CommonJS JavaScript using TypeScript 5.9.3 and executed with the dedicated database-free Jest configuration. All nine cases passed. A full repository typecheck and the broader Joplin suite were not run because repository dependencies are not installed.

**Files:**

- `packages/lib/services/plugins/api/createPluginSettingsFacade.ts`
- `packages/lib/services/plugins/api/createPluginSettingsFacade.test.ts`
- `packages/lib/jest.plugin-settings.config.js`

**Re-run after normal repository dependency installation and TypeScript compilation:** From `packages/lib`, run `yarn test --config jest.plugin-settings.config.js --runInBand`. The configuration selects the emitted JavaScript test and omits Joplin's database/native-module setup.
