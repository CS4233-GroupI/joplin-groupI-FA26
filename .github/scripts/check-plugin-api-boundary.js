const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../..');
const sourceRoot = path.join(repositoryRoot, 'packages/lib/services/plugins/api');
const declarationRoot = path.join(repositoryRoot, 'packages/lib/plugin_types/lib/services/plugins/api');
const sourceFiles = [];

const collectTypeScriptFiles = (directory, relativeDirectory = '') => {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const relativePath = path.join(relativeDirectory, entry.name);
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) collectTypeScriptFiles(fullPath, relativePath);
		else if (entry.isFile() && entry.name.endsWith('.ts')) sourceFiles.push(relativePath);
	}
};

if (!fs.existsSync(sourceRoot)) throw new Error('The Plugin API source boundary is missing');
if (!fs.existsSync(declarationRoot)) throw new Error('Generated Plugin API declarations are missing');

collectTypeScriptFiles(sourceRoot);
const missingDeclarations = sourceFiles.filter((sourceFile) => {
	const declarationFile = path.join(declarationRoot, sourceFile.replace(/\.ts$/, '.d.ts'));
	return !fs.existsSync(declarationFile);
});

if (!sourceFiles.length) throw new Error('The Plugin API boundary has no TypeScript sources');
if (missingDeclarations.length) {
	throw new Error(`Plugin API declarations were not generated for: ${missingDeclarations.join(', ')}`);
}

process.stdout.write(`Plugin API boundary check passed for ${sourceFiles.length} declarations.\n`);
