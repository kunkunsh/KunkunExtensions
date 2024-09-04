import { WebhookClient } from "discord.js"
import { DISCORD_WEBHOOK_URL } from "./constant"

const webhookClient = new WebhookClient({
	url: DISCORD_WEBHOOK_URL
})

export function sendNewExtensionNotification(
	name: string,
	identifier: string,
	version: string,
	shortDescription: string
) {
	webhookClient.send({
		content: `New extension "${name}" v${version} is released!`,
		embeds: [
			{
				title: "More Information",
				// description: shortDescription,
				// url: "https://discord.com/developers/docs/resources/webhook#execute-webhook",
				color: 0x00ffff, // Cyan color
				fields: [
					{
						name: "Identifier",
						value: identifier
					},
					{
						name: "Description",
						value: shortDescription
					}
				]
				// footer: {
				// 	text: "Click the title to learn more about Discord webhooks"
				// }
			}
		]
	})
}
