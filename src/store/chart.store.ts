import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { sendGetSessionData } from '@/features/ipc/index.ipc.renderer';
import { ChartData } from '@/types/vault.types';
import { ScriptableContext } from 'chart.js';
import { LINES_OFFSET } from '@/features/data/index.data';
import { i18n } from '@/features/internationalization/index.internationalization';
import { formatDuration } from '@/features/utils/index.utils';

const HISTORY_LIMIT = 50;

const t = i18n.global.t;

const cleanPoints = (
	points: { x: number; y: number }[]
): { x: number; y: number }[] => {
	return points.filter((point, index) => {
		if (
			index > 0 &&
			index < points.length - 1 &&
			((points[index - 1].x === point.x && points[index - 1].y === point.y) ||
				(points[index + 1].x === point.x && points[index + 1].y === point.y))
		) {
			return false;
		}
		return true;
	});
};

export const chartStore = defineStore('chart', () => {
	const chartWidth = ref(800);
	const zoomed = ref(false);
	const chartData = ref<ChartData>({
		duration: 0,
		data: { datasets: [], comments: [] },
		notes: '',
		date: '',
		name: ''
	});
	const tempPointValue = ref<number | null>(null);
	const selectedDatasetIndex = ref<number>(0);
	const selectedCommentIndex = ref<number | null>(null);

	const history = ref<ChartData[]>([]);
	const historyIndex = ref(-1);
	const undoable = computed(() => historyIndex.value > 0);
	const redoable = computed(
		() => historyIndex.value < history.value.length - 1
	);
	const backupHistory = ref<ChartData | null>(null);

	const edited = computed(() => {
		return (
			JSON.stringify(chartData.value) !== JSON.stringify(backupHistory.value)
		);
	});

	const sessionStats = computed(() => {
		return chartData.value.data.datasets.map(dataset => {
			const datasetStats: { [key: number]: number } = {};
			dataset.data.forEach((point, index) => {
				if (index % 2 !== 0) {
					if (index === 1) {
						datasetStats[point.y] = point.x;
					} else {
						if (point.y in datasetStats) {
							datasetStats[point.y] += point.x - dataset.data[index - 2].x;
						} else {
							datasetStats[point.y] = point.x - dataset.data[index - 2].x;
						}
					}
				}
			});

			return { label: dataset.label, stats: datasetStats };
		});
	});

	const addBreak = (breakDuration: number, breakStartSecond: number) => {
		const startPercent = breakStartSecond / chartData.value.duration * 100;
		const existingBreak = chartData.value.data.comments.find(
			comment =>
				comment.isBreak &&
				comment.x === startPercent
		);

		if (existingBreak) {
			return;
		}

		chartData.value.data.comments = [
			...chartData.value.data.comments,
			{
				x: startPercent,
				y: -0.3,
				text: `${formatDuration(breakStartSecond)} - ${formatDuration(
					breakStartSecond + breakDuration
				)}`,
				isBreak: true
			},
		].sort((a, b) => a.x - b.x);
		addToHistory(chartData.value);
	}

	const zoomOutChart = () => {
		chartWidth.value = Math.max(chartWidth.value - 100, 250);
		if (!zoomed.value) {
			zoomed.value = true;
		}
	};

	const zoomInChart = () => {
		chartWidth.value = Math.min(chartWidth.value + 100, 15000);
		if (!zoomed.value) {
			zoomed.value = true;
		}
	};

	const setChartWidth = (width: number) => {
		chartWidth.value = width;
	};

	const initializeHistory = (initialData: ChartData) => {
		backupHistory.value = initialData;
		history.value = [initialData];
		historyIndex.value = 0;
	};

	const addToHistory = (data: ChartData) => {
		if (redoable.value) {
			history.value.splice(historyIndex.value + 1);
		}

		if (history.value.length >= HISTORY_LIMIT) {
			history.value.shift();
		}

		history.value.push(data);
		historyIndex.value = history.value.length - 1;
	};

	const clearHistory = () => {
		history.value = [];
		historyIndex.value = -1;
	};

	const undo = () => {
		if (undoable.value) {
			historyIndex.value--;
			chartData.value = history.value[historyIndex.value];
		}
	};

	const redo = () => {
		if (redoable.value) {
			historyIndex.value++;
			chartData.value = history.value[historyIndex.value];
		}
	};

	const updateChartData = async (
		sessionId: string,
		vaultPath: string,
		patientId: string
	) => {
		const sessionDataRes = await sendGetSessionData({
			vaultPath,
			patientId,
			sessionId
		});

		if (!sessionDataRes.success) {
			alert(t(`ipc.${sessionDataRes.message}`));
			return;
		}

		const newChartData = {
			duration: sessionDataRes.data.sessionData.duration,
			name: sessionDataRes.data.sessionData.name,
			notes: sessionDataRes.data.sessionData.notes,
			date: sessionDataRes.data.sessionData.date,
			data: {
				datasets: sessionDataRes.data.sessionData.datasets.map(
					(dataset, datasetIndex) => {
						const newData: { x: number; y: number }[] = [];
						dataset.data.forEach((point, index) => {
							newData.push({
								x: point.x,
								y: point.y + LINES_OFFSET * (datasetIndex + 1)
							});

							const nextPoint =
								index !== dataset.data.length - 1
									? dataset.data[index + 1]
									: null;

							if (nextPoint) {
								newData.push({
									x: nextPoint.x,
									y: point.y + LINES_OFFSET * (datasetIndex + 1)
								});
							} else {
								newData.push({
									x: 100,
									y: point.y + LINES_OFFSET * (datasetIndex + 1)
								});
							}
						});

						return {
							...dataset,
							backgroundColor: dataset.color,
							borderColor: dataset.color,
							borderWidth: 2,
							data: newData,
							hidden: false,
							pointStyle: (ctx: ScriptableContext<'line'>) => {
								if (ctx.dataset.label === 'comments') {
									return 'rectRot';
								}

								return 'circle';
							},
							pointRadius: 1.5,
							pointHoverRadius: 5
						};
					}
				),
				comments: sessionDataRes.data.sessionData.comments
			}
		};

		chartData.value = newChartData;
		initializeHistory(chartData.value);
	};

	const clearChartData = () => {
		chartData.value = {
			duration: 0,
			data: { datasets: [], comments: [] },
			notes: '',
			date: '',
			name: ''
		};
		backupHistory.value = null;
		history.value = [];
		historyIndex.value = -1;
		selectedDatasetIndex.value = 0;
		selectedCommentIndex.value = null;
		tempPointValue.value = null;
	};

	const updatePoint = (
		draggedDatasetIndex: number,
		draggedPointIndex: number,
		newValue: number
	) => {
		const newChartData = {
			...chartData.value,
			data: {
				...chartData.value.data,
				datasets: chartData.value.data.datasets.map((dataset, index) => {
					if (index === draggedDatasetIndex) {
						const baseValue = Math.min(6, Math.max(0, Math.floor(newValue)));
						const correctedValue =
							baseValue + LINES_OFFSET * (draggedDatasetIndex + 1);

						const newPoints: {
							x: number;
							y: number;
						}[] = [];

						dataset.data.forEach((point, index) => {
							const isDraggingPoint = index === draggedPointIndex;
							const isEven = index % 2 === 0;

							if (isEven) {
								newPoints.push({
									x: point.x,
									y: isDraggingPoint ? correctedValue : point.y
								});
								return;
							}

							if (isDraggingPoint) {
								newPoints[index - 1].y = correctedValue;
							}

							newPoints.push({
								x: point.x,
								y: isDraggingPoint ? correctedValue : newPoints[index - 1].y
							});
						});

						return {
							...dataset,
							data: cleanPoints(newPoints)
						};
					}

					return dataset;
				})
			}
		};

		chartData.value = newChartData;
		addToHistory(chartData.value);
	};

	const addPoint = (mouseCoords: { x: number; y: number }) => {
		const newPoints: { x: number; y: number }[] = [];

		const newChartData = {
			...chartData.value,
			data: {
				...chartData.value.data,
				datasets: chartData.value.data.datasets.map((dataset, datasetIndex) => {
					const roundedX =
						(Math.round((mouseCoords.x / 100) * chartData.value.duration) /
							chartData.value.duration) *
						100;

					if (datasetIndex === selectedDatasetIndex.value) {
						dataset.data.forEach((point, index) => {
							const isEven = index % 2 === 0;
							if (isEven) {
								newPoints.push({
									x: point.x,
									y:
										point.x !== roundedX
											? point.y
											: mouseCoords.y + LINES_OFFSET * (datasetIndex + 1)
								});

								if (
									roundedX > point.x &&
									(index === dataset.data.length - 1 ||
										roundedX < dataset.data[index + 1].x)
								) {
									newPoints.push({
										x: roundedX,
										y: point.y
									});

									newPoints.push({
										x: roundedX,
										y: mouseCoords.y + LINES_OFFSET * (datasetIndex + 1)
									});

									newPoints.push({
										x:
											index !== dataset.data.length - 1
												? dataset.data[index + 1].x
												: 100,
										y: mouseCoords.y + LINES_OFFSET * (datasetIndex + 1)
									});

									return;
								}

								newPoints.push({
									x:
										index !== dataset.data.length - 1
											? dataset.data[index + 1].x
											: 100,
									y:
										point.x !== roundedX
											? point.y
											: mouseCoords.y + LINES_OFFSET * (datasetIndex + 1)
								});
							}
						});

						if (roundedX == 100) {
							newPoints.push({
								x: 100,
								y: mouseCoords.y + LINES_OFFSET * (datasetIndex + 1)
							});
						}

						return {
							...dataset,
							data: cleanPoints(newPoints)
						};
					}
					return dataset;
				})
			}
		};

		chartData.value = newChartData;
		addToHistory(chartData.value);
	};

	const addComment = (time: number) => {
		if (chartData.value.data.comments.some(comment => comment.x === time && comment.y === -0.1)) {
			return;
		}

		const newChartData = {
			...chartData.value,
			data: {
				...chartData.value.data,
				comments: [
					...chartData.value.data.comments,
					{
						x: time,
						y: -0.1,
						text: ''
					}
				].sort((a, b) => a.x - b.x)
			}
		};

		chartData.value = newChartData;
		addToHistory(chartData.value);
	};

	const deleteComment = (commentIndex: number) => {
		const newChartData = {
			...chartData.value,
			data: {
				...chartData.value.data,
				comments: chartData.value.data.comments.filter(
					(_, index) => index !== commentIndex
				)
			}
		};

		chartData.value = newChartData;
		addToHistory(chartData.value);
	};

	const selectComment = (commentIndex: number | null) => {
		selectedCommentIndex.value = commentIndex;
	};

	const toggleShowDataset = (datasetIndex: number) => {
		const newChartData = {
			...chartData.value,
			data: {
				...chartData.value.data,
				datasets: chartData.value.data.datasets.map((dataset, index) => {
					if (index === datasetIndex) {
						return {
							...dataset,
							hidden: !dataset.hidden
						};
					}
					return dataset;
				})
			}
		};

		chartData.value = newChartData;
		addToHistory(chartData.value);
	};

	const resetShowDatasets = () => {
		const newChartData = {
			...chartData.value,
			data: {
				...chartData.value.data,
				datasets: chartData.value.data.datasets.map(dataset => ({
					...dataset,
					hidden: false
				}))
			}
		};

		chartData.value = newChartData;
		addToHistory(chartData.value);
	};

	const updateSessionNotes = (notes: string) => {
		const newChartData = {
			...chartData.value,
			notes: notes.trim()
		};

		chartData.value = newChartData;
		addToHistory(chartData.value);
	};

	return {
		chartWidth,
		chartData,
		tempPointValue,
		selectedDatasetIndex,
		selectedCommentIndex,
		undoable,
		redoable,
		edited,
		sessionStats,
		zoomed,
		updateChartData,
		toggleShowDataset,
		resetShowDatasets,
		updatePoint,
		addPoint,
		addComment,
		selectComment,
		deleteComment,
		undo,
		redo,
		clearHistory,
		clearChartData,
		zoomOutChart,
		zoomInChart,
		setChartWidth,
		updateSessionNotes,
		addBreak
	};
});

export const useChartStore = () => {
	const store = chartStore();
	const {
		chartWidth,
		chartData,
		tempPointValue,
		selectedDatasetIndex,
		selectedCommentIndex,
		undoable,
		redoable,
		edited,
		sessionStats,
		zoomed
	} = storeToRefs(store);

	return {
		chartWidth,
		chartData,
		tempPointValue,
		selectedDatasetIndex,
		selectedCommentIndex,
		undoable,
		redoable,
		edited,
		sessionStats,
		zoomed,
		updateChartData: store.updateChartData,
		toggleShowDataset: store.toggleShowDataset,
		resetShowDatasets: store.resetShowDatasets,
		updatePoint: store.updatePoint,
		addPoint: store.addPoint,
		addComment: store.addComment,
		selectComment: store.selectComment,
		deleteComment: store.deleteComment,
		undo: store.undo,
		redo: store.redo,
		clearHistory: store.clearHistory,
		clearChartData: store.clearChartData,
		zoomOutChart: store.zoomOutChart,
		zoomInChart: store.zoomInChart,
		setChartWidth: store.setChartWidth,
		updateSessionNotes: store.updateSessionNotes,
		addBreak: store.addBreak
	};
};
