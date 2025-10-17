<script setup lang="ts">
interface Props {
	click: (e: MouseEvent) => void;
	label: string;
	hidden: boolean;
	faded: boolean;
	dataset: string;
}

const { label, click } = defineProps<Props>();
</script>

<template>
	<button class="flex justify-center cursor-pointer border rounded-sm items-center w-12 text-sm py-0"
		:class="{ 'border-2': !faded }" @click="e => click(e)">
		<span :class="{
			'text-[var(--vqr)]': dataset === 'VQR',
			'text-[var(--peqr)]': dataset === 'PEQR',
			'text-[var(--tqr)]': dataset === 'TQR',
			'text-[var(--iqr)]': dataset === 'IQR',
			'opacity-85': faded,
			'line-through': hidden,
			'font-bold': !faded,

		}">{{ label }}</span>
	</button>
</template>
