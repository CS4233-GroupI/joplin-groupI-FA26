const fs = require('fs');
const path = require('path');

const pluginTypesDir = path.join(
	process.cwd(),
	'packages',
	'lib',
	'plugin_types',
);

console.warn('Checking generated Plugin API declarations...');

if (!fs.existsSync(pluginTypesDir)) {
	console.error(
		'Plugin API compatibility check failed: plugin_types directory was not generated.',
	);
	process.exit(1);
}

function findDeclarationFiles(directory) {
	const declarationFiles = [];

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			declarationFiles.push(...findDeclarationFiles(fullPath));
		} else if (entry.name.endsWith('.d.ts')) {
			declarationFiles.push(fullPath);
		}
	}

	return declarationFiles;
}

const declarationFiles = findDeclarationFiles(pluginTypesDir);

if (declarationFiles.length === 0) {
	console.error(
		'Plugin API compatibility check failed: no TypeScript declaration files were generated.',
	);
	process.exit(1);
}

console.warn(
	`Plugin API generation produced ${declarationFiles.length} declaration files.`,
);

console.warn('Basic Plugin API validation passed.');

console.warn(
	'Note: this currently verifies API generation only. ' +
	'Backward-compatibility comparison will be added in a future version.',
);
