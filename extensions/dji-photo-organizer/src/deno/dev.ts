import { exec, OutputMode } from 'https://deno.land/x/exec/mod.ts';

/* -------------------------------------------------------------------------- */
/*                             Get Image Metadata                             */
/* -------------------------------------------------------------------------- */
// (async function () {
// 	const imagePaths = [
// 		'/Volumes/EditDrive/2024-QC/DJI-mini-4/DJI_20241004100425_0102_D.JPG',
// 		'/Volumes/EditDrive/2024-QC/DJI-mini-4/DJI_20241004161809_0104_D.JPG'
// 	];
// 	// base64 encode imagePaths
// 	const base64EncodedImagePaths = btoa(JSON.stringify(imagePaths));
// 	const result = await exec(`deno -A get-images-metadata.ts ${base64EncodedImagePaths}`, {
// 		output: OutputMode.Capture
// 	});

// 	if (!result.status.success) {
// 		console.error(result.output);
// 		Deno.exit(1);
// 	}
// 	const metadata = JSON.parse(result.output.split('\n').at(0) ?? 'null');
// 	console.log(metadata);
// })();

/* -------------------------------------------------------------------------- */
/*                             Get Video Metadata                             */
/* -------------------------------------------------------------------------- */
(async function () {
	const videoPaths = [
		'/Volumes/EditDrive/2024-QC/DJI-mini-4/DJI_20241006115200_0131_D.MP4',
		'/Volumes/EditDrive/2024-QC/DJI-mini-4/DJI_20241006114908_0130_D.MP4',
		'/Volumes/EditDrive/2024-QC/DJI-mini-4/DJI_20241006114752_0128_D.MP4'
	];
	// base64 encode VideoPaths
	const base64EncodedVideoPaths = btoa(JSON.stringify(videoPaths));
	const result = await exec(`deno -A get-video-metadata.ts ${base64EncodedVideoPaths}`, {
		output: OutputMode.Capture
	});

	if (!result.status.success) {
		console.error(result.output);
		Deno.exit(1);
	}

	const data = JSON.parse(result.output.split('\n').at(0) ?? 'null');
	console.log(data);
})();
