<script setup lang="ts">
	import {
		CategoryScale,
		Chart,
		Legend,
		LinearScale,
		LineElement,
		PointElement,
		Tooltip,
		defaults,
		TooltipItem,
		ChartEvent,
		ActiveElement
	} from 'chart.js';
	import dragDataPlugin from 'chartjs-plugin-dragdata';
	import { Line } from 'vue-chartjs';
	import { useChartStore } from '@/store/chart.store';
	import { formatTick } from '@utils/index.utils';
	import { computed, onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue';
	import { COLORS } from '@/features/data/index.data';
	import { i18n } from '@/features/internationalization/index.internationalization';
	import Button from '../ui/button.vue';
	import ZoomOutIcon from '../ui/icons/zoomOut.icon.vue';
	import ZoomInIcon from '../ui/icons/zoomIn.icon.vue';
	import FitIcon from '../ui/icons/fit.icon.vue';
	import ScaleButton from '../ui/scale.button.vue';

	const t = i18n.global.t;

	const { toggleComments } = defineProps<{
		toggleComments: () => void;
	}>();

	Chart.register(
		PointElement,
		LineElement,
		CategoryScale,
		LinearScale,
		Legend,
		Tooltip,
		dragDataPlugin
	);

	const updateWidth = () => {
		if (zoomed.value) {
			return;
		}
		setChartWidth(window.innerWidth - window.innerWidth * 0.03);
	};

	onMounted(() => {
		window.addEventListener("resize", updateWidth);
		setChartWidth(window.innerWidth - 50);
	});

	onUnmounted(() => {
		window.removeEventListener("resize", updateWidth);
		zoomed.value = false;
	});

	defaults.font.size = 12;
	defaults.maintainAspectRatio = false;

	const {
		chartData,
		chartWidth,
		tempPointValue,
		selectedDatasetIndex,
		toggleShowDataset,
		resetShowDatasets,
		updatePoint,
		addPoint,
		selectComment,
		addComment,
		zoomInChart,
		zoomOutChart,
		setChartWidth,
		zoomed
	} = useChartStore();

	const chartRef = useTemplateRef('chartRef');

	const mouseCoords = ref<{ x: number | null; y: number | null }>({
		x: null,
		y: null
	});

	watchEffect(onCleanup => {
		if (!chartRef.value || !chartRef.value.chart) {
			return;
		}

		const canvas = (
			chartRef.value.chart as { canvas: HTMLCanvasElement | undefined }
		).canvas;

		if (!canvas) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!chartRef.value || !chartRef.value.chart) {
				return;
			}
			const rect = canvas.getBoundingClientRect();
			const chart = chartRef.value.chart as Chart<'line'>;
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			chartRef.value;

			const xValue = Math.min(
				100,
				Math.max(0, chart.scales.x.getValueForPixel(x) || 0)
			);
			const yValue = Math.min(
				6,
				Math.floor(chart.scales.y.getValueForPixel(y) || 0)
			);

			if (xValue !== undefined && yValue !== undefined) {
				mouseCoords.value = {
					x: xValue,
					y: yValue
				};
			}
		};

		const handleMouseLeave = () => {
			mouseCoords.value = { x: null, y: null };
		};

		canvas.addEventListener('pointermove', handleMouseMove);
		canvas.addEventListener('mouseleave', handleMouseLeave);

		onCleanup(() => {
			if (canvas) {
				canvas.removeEventListener('pointermove', handleMouseMove);
				canvas.removeEventListener('mouseleave', handleMouseLeave);
			}
		});
	});

	const handleClick = (
		e: Event & {
			native: MouseEvent;
		},
		chartElements: ActiveElement[],
		chart: Chart<'line'>
	) => {
		const points = chart.getElementsAtEventForMode(
			e,
			'nearest',
			{ intersect: true },
			true
		);

		if (points.length && chartElements[0].datasetIndex === 4) {
			selectComment(chartElements[0].index);
			toggleComments();
			return;
		}

		if (mouseCoords.value.x !== null && mouseCoords.value.y !== null) {
			if (mouseCoords.value.y < 0) {
				const roundedTime =
					(Math.round((mouseCoords.value.x / 100) * chartData.value.duration) /
						chartData.value.duration) *
					100;
				addComment(roundedTime);
				const newCommentIndex = chartData.value.data.comments.findIndex(
					c => c.x === roundedTime
				);

				selectComment(newCommentIndex);
				toggleComments();
				return;
			}
			addPoint({ x: mouseCoords.value.x, y: mouseCoords.value.y });
		}
	};

	const handleHover = (e: ChartEvent, chartElement: ActiveElement[]) => {
		if (e && e.native && e.native.target) {
			(
				e.native.target as EventTarget & { style: { cursor: string } }
			).style.cursor =
				chartElement.length &&
					chartElement[0].datasetIndex < 4 &&
					chartElement[0].datasetIndex === selectedDatasetIndex.value
					? 'grab'
					: chartElement.length && chartElement[0].datasetIndex === 4
						? 'pointer'
						: 'default';
		}
	};

	const handleDragStart = (
		_event: any,
		_datasetIndex: number,
		_pointIndex: number,
		oldValue: { y: number }
	) => {
		tempPointValue.value = oldValue.y;
	};

	const handleDragEnd = (
		_event: any,
		datasetIndex: number,
		pointIndex: number,
		newValue: { y: number }
	) => {
		updatePoint(datasetIndex, pointIndex, newValue.y);
		tempPointValue.value = null;
	};

	const handleLegendItemClick = (e: MouseEvent, index: number) => {
		if (e.shiftKey && e.ctrlKey) {
			resetShowDatasets();
			return;
		}

		if (e.ctrlKey) {
			toggleShowDataset(index);
			return;
		}

		if (selectedDatasetIndex.value !== index) {
			selectedDatasetIndex.value = index;
		}
	};

	const handleResetWidth = () => {
		zoomed.value = false;
		setChartWidth(window.innerWidth - window.innerWidth * 0.03);
	};

	const hoverTime = computed(() => {
		if (mouseCoords.value.x === null) return '';
		return formatTick(mouseCoords.value.x, chartData.value.duration);
	});

	const computedData = computed(() => ({
		...chartData.value.data,
		datasets: [
			...chartData.value.data.datasets.map((dataset, index) => ({
				...dataset,
				data: dataset.data.map(point => ({
					...point,
					dragData: selectedDatasetIndex.value === index
				})),
				borderColor: COLORS[dataset.label.toUpperCase() as keyof typeof COLORS] || dataset.borderColor
			})),
			{
				label: 'comments',
				backgroundColor: '#50412e',
				borderColor: 'rgba(0, 0, 0, 0)',
				borderWidth: 0,
				data: chartData.value.data.comments.map(c => ({
					x: c.x,
					y: c.y,
					dragData: false
				})),
				pointStyle: 'rectRot',
				pointRadius: 4
			}
		]
	}));

	const chartOptions = {
		animation: {
			duration: 0
		},
		elements: {
			line: {
				spanGaps: true
			}
		},
		scales: {
			x: {
				type: 'linear',
				min: 0,
				max: 100,
				ticks: {
					stepSize: 1,
					callback: (value: number) => formatTick(value, chartData.value.duration)
				},
				afterDataLimits: (axis: any) => {
					axis.min -= 2;
					axis.max += 2;
				}
			},
			y: {
				min: 0,
				max: 6,
				ticks: {
					padding: 10,
					callback: (value: any) => ((value as number) >= 0 ? value : '')
				},
				afterDataLimits: (axis: any) => {
					axis.min -= 0.5;
					axis.max += 1;
				}
			}
		},
		plugins: {
			legend: {
				display: false
			},
			dragData: {
				round: 2,
				showTooltip: false,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd
			},
			tooltip: {
				enabled: true,
				mode: 'point',
				intersect: true,
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				bodyColor: '#ffffff',
				borderColor: '#ffffff',
				borderWidth: 1,
				padding: 12,
				caretPadding: 12,
				titleMarginBottom: 10,
				titleSpacing: 60,
				displayColors: false,
				callbacks: {
					title: (tooltipItems: TooltipItem<'line'>[], _i: any) => {
						return `${t('chart.time')}: ${formatTick(
							parseFloat(tooltipItems[0].label),
							chartData.value.duration
						)}`;
					},
					label: (tooltipItem: TooltipItem<'line'>) => {
						if (tooltipItem.datasetIndex > 3) {
							const current = chartData.value.data.comments[tooltipItem.dataIndex];

							return `${current.isBreak ? t('common.break') + ': ' : ''}` + (current.text.length > 50 ? `${current.text.slice(0, 50)}...` : current.text);
						}
						return `${tooltipItem.dataset.label}: ${Math.max(
							0,
							Math.min(6, Math.floor((tooltipItem.raw as { y: number }).y))
						)}`;
					}
				}
			}
		},
		onHover: handleHover,
		onClick: handleClick
	} as any;
</script>

<template>
	<div class="w-full h-full flex flex-col">
		<div class="flex justify-between p-2">
			<div class="flex gap-2 items-center">
				<Button :click="zoomOutChart" :disabled="chartWidth <= 250" :icon="ZoomOutIcon"
					:title="$t('editSession.zoomOut')" />
				<input type="range" v-model.number="chartWidth" :min="250" :max="15000" step="1"
					class="outline-[var(--primary)]" @input="zoomed = true" />
				<Button :click="zoomInChart" :disabled="chartWidth >= 15000" :icon="ZoomInIcon"
					:title="$t('editSession.zoomIn')" />
				<Button v-if="zoomed" :click="handleResetWidth" :disabled="!zoomed" :title="$t('common.reset')"
					:icon="FitIcon" />
			</div>
			<div v-if="mouseCoords.x !== null && mouseCoords.y !== null" class="flex gap-4">
				<div>
					{{ `${$t('chart.time')}: ${hoverTime}` }}
				</div>
				<div v-if="mouseCoords.y >= 0">
					{{ `${$t('common.modus')}: ${mouseCoords.y}` }}
				</div>
				<div v-else>{{ $t('chart.addComment') }}</div>
			</div>
			<div class="flex gap-2">
				<ScaleButton v-if="chartData.data.datasets.length > 0"
					v-for="(dataset, index) in chartData.data.datasets"
					:click="(e: MouseEvent) => handleLegendItemClick(e, index)" :class="{
						'text-[var(--vqr)]': dataset.label === 'VQR',
						'text-[var(--peqr)]': dataset.label === 'PEQR',
						'text-[var(--tqr)]': dataset.label === 'TQR',
						'text-[var(--iqr)]': dataset.label === 'IQR',
						'opacity-50': selectedDatasetIndex !== index,
						'line-through': chartData.data.datasets[index].hidden
					}" :dataset="dataset.label" :hidden="chartData.data.datasets[index].hidden"
					:faded="selectedDatasetIndex !== index" :label="$t(`datasets.${dataset.label.toLowerCase()}`)"
					small />
			</div>
		</div>
		<div class="w-full h-full flex flex-col divide-y overflow-x-scroll overflow-y-hidden">
			<div class="h-[90%]" :style="{ width: `${chartWidth}px` }">
				<Line ref="chartRef" :data="computedData" :options="chartOptions" />
			</div>
		</div>
	</div>
</template>
