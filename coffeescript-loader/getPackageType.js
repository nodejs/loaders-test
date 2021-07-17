import { readFile } from 'fs/promises';
import { resolve } from 'path';


export default function getPackageType(dir) {
	const packagePath = resolve(dir, 'package.json');

	return readFile(packagePath, { encoding: 'utf8' })
		.then((filestring) => JSON.parse(filestring))
		.then(({ type }) => type)
		.catch((err) => {
			if (err?.code !== 'ENOENT') console.error(err);

			return dir.length > 1 && getPackageType(resolve(dir, '..'))
		});
}
