<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { ui } from '@kksh/api/ui/iframe';
	import { updateTheme } from '@kksh/svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		ui.registerDragRegion();
		ui.getTheme().then((theme) => {
			updateTheme(theme);
		});
	});
</script>

<ModeWatcher />
<slot></slot>
