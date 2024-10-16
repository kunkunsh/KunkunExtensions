/**
 * @module get-images-metadata
 * @description Get metadata of images
 * This module is used to get the metadata of images
 * @example
 * ```bash
 * deno -A get-images-metadata.ts <base64 encoded image paths>
 * ```
 *
 * First argument is the base64 encoded image paths
 * Output is the metadata of the images
 * Only Last Line is the metadata of the image
 */
import { image } from '@hk/photographer-toolbox';
import { parseArgs } from 'jsr:@std/cli/parse-args';

const args = parseArgs(Deno.args);

if (args._.length !== 1) {
	console.error('Missing Arguments');
	Deno.exit(1);
}
const encodedArgs = args._[0];

const base64Decoded = atob(encodedArgs as string);

const decodedImagePaths: string[] = JSON.parse(base64Decoded);

Promise.all(decodedImagePaths.map((imgPath) => image.readImageMetadata(imgPath))).then((data) =>
	console.log(JSON.stringify(data))
);
