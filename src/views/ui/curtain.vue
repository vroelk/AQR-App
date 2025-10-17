<script setup lang="ts">
	import { AnimatePresence, motion } from 'motion-v';

	defineProps<{
		trigger: boolean,
		className?: string,
	}>()
</script>

<template>
	<animate-presence>
		<motion.div v-if="trigger" :initial="{ scaleY: 0, opacity: 0 }" :animate="{ scaleY: 1, opacity: 100 }"
			:exit="{ scaleY: 0, opacity: 0 }" :style="{ originY: 0 }" :transition="{ duration: 0.3 }"
			:class="className">
			<slot />
		</motion.div>
	</animate-presence>
</template>