import { video } from '@hk/photographer-toolbox';
import { parseArgs } from 'jsr:@std/cli/parse-args';

const args = parseArgs(Deno.args);

if (args._.length !== 1) {
	console.error('Missing Arguments');
	Deno.exit(1);
}
const encodedArgs = args._[0];

const base64Decoded = atob(encodedArgs as string);

const decodedVideoPaths: string[] = JSON.parse(base64Decoded);

Promise.all(decodedVideoPaths.map((videoPath) => video.readMainVideoMetadata(videoPath))).then(
	(data) => console.log(JSON.stringify(data))
);
