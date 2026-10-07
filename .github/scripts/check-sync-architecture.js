const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../..');
const packagesRoot = path.join(repositoryRoot, 'packages');
const workflowPath = path.join(repositoryRoot, '.github/workflows/ci.yml');
const errors = [];

const readPackage = (packagePath) => JSON.parse(fs.readFileSync(path.join(packagesRoot, packagePath, 'package.json'), 'utf8'));
const hasDependency = (manifest, dependencyName) => Boolean(
	manifest.dependencies?.[dependencyName] || manifest.devDependencies?.[dependencyName],
);
const requiredConsumers = [
	{ directory: 'app-desktop', name: '@joplin/app-desktop' },
	{ directory: 'app-mobile', name: '@joplin/app-mobile' },
	{ directory: 'app-cli', name: 'joplin' },
];

const sharedBackend = readPackage('lib');
if (sharedBackend.name !== '@joplin/lib') errors.push('packages/lib must remain the @joplin/lib shared backend');
if (!sharedBackend.scripts.test?.trim()) errors.push('@joplin/lib must define its test command');

const synchronizerPath = path.join(packagesRoot, 'lib/services/synchronizer');
if (!fs.existsSync(path.join(packagesRoot, 'lib/Synchronizer.ts'))) errors.push('The shared Synchronizer entry point is missing');
if (!fs.existsSync(synchronizerPath)) { errors.push('The shared synchronizer module directory is missing'); } else if (!fs.readdirSync(synchronizerPath).some((fileName) => fileName.endsWith('.test.ts'))) {
	errors.push('The shared synchronizer module must have tests');
}

for (const consumer of requiredConsumers) {
	const manifest = readPackage(consumer.directory);
	if (manifest.name !== consumer.name) errors.push(`${consumer.directory} is expected to be workspace ${consumer.name}`);
	if (!hasDependency(manifest, '@joplin/lib')) errors.push(`${consumer.name} must depend on @joplin/lib`);
	if (!manifest.scripts.build?.trim()) errors.push(`${consumer.name} must define a build command`);
	if (!manifest.scripts['test-ci']?.trim()) errors.push(`${consumer.name} must define a CI test command`);
}

const workflow = fs.readFileSync(workflowPath, 'utf8');
const requiredCommands = [
	'yarn test-ci',
	'yarn buildSequential',
	'yarn workspace @joplin/lib tsc',
	...requiredConsumers.map((consumer) => `yarn workspace ${consumer.name} build`),
];
for (const command of requiredCommands) {
	if (!workflow.includes(command)) errors.push(`CI is missing required shared-backend check: ${command}`);
}

if (errors.length) {
	console.error(errors.join('\n'));
	process.exitCode = 1;
} else {
	const consumers = fs.readdirSync(packagesRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => readPackage(entry.name))
		.filter((manifest) => hasDependency(manifest, '@joplin/lib'))
		.map((manifest) => manifest.name)
		.sort();
	process.stdout.write(`Shared synchronization architecture checks passed. @joplin/lib consumers: ${consumers.join(', ')}\n`);
}
