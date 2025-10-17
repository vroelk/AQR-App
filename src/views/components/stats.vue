<script setup lang="ts">
	import { formatDuration } from '@/features/utils/index.utils';
	import { useChartStore } from '@/store/chart.store';
	import Curtain from '@ui/curtain.vue';
	import Fragment from '../ui/fragment.vue';
	import { COLORS } from '@/features/data/index.data';
	import Button from '../ui/button.vue';
	import LeftArrowIcon from '../ui/icons/left.arrow.icon.vue';

	defineProps<{
		isOpen: boolean;
		close: () => void;
	}>();

	const { sessionStats, chartData } = useChartStore();
</script>

<template>
	<Curtain :trigger="isOpen" className="absolute left-0 top-0 bg-white w-full h-full overflow-hidden">
		<header class="flex px-4 py-2 items-center justify-between">
			<h2 class="font-bold text-lg">{{ $t('editSession.stats') }}</h2>
			<Button :click="close" :title="$t('common.close')" :icon="LeftArrowIcon" />
		</header>
		<div class="w-full flex flex-col items-center overflow-scroll h-full pb-12">
			<Fragment v-for="dataset in sessionStats" :key="dataset.label">
				<header :style="{ color: COLORS[dataset.label as keyof typeof COLORS] }" class="font-bold text-lg">
					{{ dataset.label }}</header>
				<table class="min-w-[500px] text-sm my-4">
					<thead>
						<tr class="w-full text-center border-b">
							<th class="py-2">{{ $t('common.modus') }}</th>
							<th class="py-2">{{ $t('common.duration') }}</th>
							<th class="py-2">{{ $t('common.percentage') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(stat) in Object.entries(dataset.stats).sort((a: any, b: any) => a[0] - b[0])"
							:key="stat[0]"
							class="w-full text-center border-b border-gray-200 hover:bg-[var(--secondary)]">
							<td class="py-1">{{ Math.floor(parseInt(stat[0])) }}</td>
							<td class="py-1">{{ formatDuration(Math.round(chartData.duration / 100 * stat[1])) }}</td>
							<td class="py-1">{{ stat[1].toFixed(1) }}%</td>
						</tr>
					</tbody>
				</table>
			</Fragment>
		</div>
	</Curtain>
</template>
