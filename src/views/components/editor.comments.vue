<script setup lang="ts">
	import Curtain from '@ui/curtain.vue';
	import { useChartStore } from '@/store/chart.store';
	import { computed, ref, watch } from 'vue';
	import { formatTick } from '@/features/utils/index.utils';
	import { COLORS } from '@/features/data/index.data';
	import Button from '../ui/button.vue';
	import RightArrowIcon from '../ui/icons/right.arrow.icon.vue';
	import LeftArrowIcon from '../ui/icons/left.arrow.icon.vue';
	import DeleteIcon from '../ui/icons/delete.icon.vue';

	defineProps<{
		isOpen: boolean;
	}>();

	defineEmits<{
		(e: 'close'): void;
		(e: 'delete', index: number): void;
	}>();

	const { chartData, selectedCommentIndex, selectComment } = useChartStore();

	type CommentType = { x: number; y: number; text: string, isBreak?: boolean };
	const localComment = ref<CommentType | null>(
		chartData.value.data.comments[selectedCommentIndex.value ?? 0] || null
	);

	watch(selectedCommentIndex, newIndex => {
		if (newIndex === null) {
			localComment.value = null;
		} else {
			localComment.value = chartData.value.data.comments[newIndex] || null;
		}
	});

	const handleSelectNext = () => {
		selectComment(
			selectedCommentIndex.value === null
				? 0
				: selectedCommentIndex.value < chartData.value.data.comments.length - 1
					? selectedCommentIndex.value + 1
					: selectedCommentIndex.value
		);
	};

	const handleSelectPrevious = () => {
		selectComment(
			selectedCommentIndex.value && selectedCommentIndex.value > 0
				? selectedCommentIndex.value - 1
				: selectedCommentIndex.value
		);
	};

	const values = computed(() => {
		if (selectedCommentIndex.value === null) {
			return [];
		}

		return chartData.value.data.datasets.slice(0, 4).map(dataset => {
			return {
				label: dataset.label,
				value: Math.floor(
					dataset.data
						.filter(
							point =>
								point.x <=
								chartData.value.data.comments[selectedCommentIndex.value!].x
						)
						.at(-1)?.y || 0
				)
			};
		});
	});
	const isBreak = computed(() => {
		return localComment.value && 'isBreak' in localComment.value && localComment.value.isBreak
	})
</script>

<template>
	<Curtain :trigger="isOpen" className="absolute left-0 top-0 bg-white w-full h-full flex justify-center">
		<div class="absolute top-0 w-full flex flex-col justify-center items-center p-2">
			<nav class="flex w-full items-center justify-between p-2">
				<Button :click="_e => $emit('delete', selectedCommentIndex ?? -1)" :title="$t('common.delete')"
					:icon="DeleteIcon" />
				<Button :click="_e => $emit('close')" :title="$t('common.close')" :icon="LeftArrowIcon" />
			</nav>
			<div class="flex items-center gap-8 w-[800px] h-full">
				<Button v-if="chartData.data.comments.length > 1 && selectedCommentIndex && selectedCommentIndex > 0"
					class="w-16 px-2 border rounded-full" :click="handleSelectPrevious"
					:title="$t('editorComments.previousComment')" :icon="LeftArrowIcon" />
				<div v-else class="w-16" />
				<div class="flex-1">
					<div v-if="localComment" class="flex flex-col gap-6 divide-y">
						<div class="flex flex-col justify-between gap-4">
							<div class="flex w-full justify-between items-center">
								<div v-if="selectedCommentIndex !== null"><span class="font-bold">{{
									$t('common.comment')
										}}</span>: {{ selectedCommentIndex + 1 }} / {{
											chartData.data.comments.length }}
								</div>
								<div><span class="font-bold">{{ $t('chart.time') }}</span>: {{ formatTick(
									localComment.x,
									chartData.duration
								) }}
								</div>
								<div><span class="font-bold">{{ $t('common.sessionDuration') }}</span>: {{
									formatTick(100, chartData.duration)
								}}
								</div>
							</div>

							<div class="flex w-full justify-between items-center">
								<div v-for="dataset in values">
									<span :style="{ color: COLORS[dataset.label] }" class="font-bold mr-2">{{
										$t(`datasets.${dataset.label.toLowerCase()}`) }}</span>: {{
											dataset.value }}
								</div>
							</div>
						</div>
						<div v-if="isBreak"
							class="w-full h-[400px] p-2 border rounded outline-none text-sm resize-none">
							<div>{{ $t('common.break') }}</div>
							<div>{{ localComment.text }}</div>
						</div>
						<textarea v-else class="w-full h-[400px] p-2 border rounded outline-none text-sm resize-none"
							v-model="localComment.text" :placeholder="$t('editorComments.addComment')"
							:disabled="isBreak as boolean" />
					</div>
				</div>
				<Button
					v-if="chartData.data.comments.length > 1 && selectedCommentIndex !== null && selectedCommentIndex >= 0 && selectedCommentIndex < chartData.data.comments.length - 1"
					class="w-16 px-4 rounded-full border" :click="handleSelectNext"
					:title="$t('editorComments.nextComment')" :icon="RightArrowIcon" />
				<div v-else class="w-16" />
			</div>
		</div>
	</Curtain>
</template>
