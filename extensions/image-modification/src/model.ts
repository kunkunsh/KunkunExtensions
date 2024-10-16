import * as v from "valibot"
import { sharpFormats } from "./constants.ts"

export const CommandType = v.union([v.literal("convert")])
export const ConvertCommandInput = v.object({
	imagePaths: v.array(v.string()),
	outputFormat: v.union(sharpFormats.map(v.literal))
})
export const CompressCommandInput = v.object({
	imagePaths: v.array(v.string()),
	quality: v.number()
})
export const FlipHorizontalCommandInput = v.object({
	imagePaths: v.array(v.string())
})
export const FlipVerticalCommandInput = v.object({
	imagePaths: v.array(v.string())
})

export const ResizeCommandInput = v.object({
	imagePaths: v.array(v.string()),
	width: v.number(),
	height: v.number()
})

export const GrayscaleCommandInput = v.object({
	imagePaths: v.array(v.string())
})

export const BlurCommandInput = v.object({
	imagePaths: v.array(v.string()),
	sigma: v.number()
})

export const RotateCommandInput = v.object({
	imagePaths: v.array(v.string()),
	angle: v.number()
})

export const ObtainImageSizeCommandInput = v.object({
	imagePaths: v.array(v.string())
})

export const AllInput = v.object({
	command: CommandType,
	options: v.union([
		ConvertCommandInput,
		CompressCommandInput,
		FlipHorizontalCommandInput,
		FlipVerticalCommandInput,
		ResizeCommandInput,
		GrayscaleCommandInput,
		BlurCommandInput,
		RotateCommandInput,
		ObtainImageSizeCommandInput
	])
})
