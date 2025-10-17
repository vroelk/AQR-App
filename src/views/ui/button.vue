<script setup lang="ts">
interface Props {
	click: (e: MouseEvent) => void;
	label?: string;
	disabled?: boolean;
	small?: boolean;
	icon?: any;
	reverse?: boolean;
}

const { label, click, disabled } = defineProps<Props>();
</script>

<template>
	<button class="flex justify-center cursor-pointer hover:text-[var(--neutral)] outline-[var(--primary)]"
		@click="e => click(e)"
		:class="{ 'text-sm': small, 'px-0.5': small, 'px-1': !small, 'py-1': !small, 'py-0.5': small, border: !icon, 'flex-row-reverse': reverse }"
		:disabled="disabled">
		<component v-if="icon" :is="icon" class="size-6" />
		<span v-if="label" :class="{ 'mx-3': true }">{{ label }}</span>
	</button>
</template>
