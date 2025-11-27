<script setup lang="ts">
	import { router } from '@/routes/index.routes';
	import { useVaultStore } from '@/store/vault.store';
	import { useChartStore } from '@/store/chart.store';
	import Chart from '@components/chart.vue';
	import CommentsEditor from '@components/editor.comments.vue';
	import Stats from '@components/stats.vue';
	import { computed, ref, toRaw, watch } from 'vue';
	import { sendSaveSession } from '@/features/ipc/index.ipc.renderer';
	import { formatDuration } from '@/features/utils/index.utils';
	import { i18n } from '@/features/internationalization/index.internationalization';
	import Button from '../ui/button.vue';
	import StatsIcon from '../ui/icons/stats.icon.vue';
	import UndoIcon from '../ui/icons/undo.icon.vue';
	import BackIcon from '../ui/icons/left.arrow.icon.vue';
	import SaveIcon from '../ui/icons/save.icon.vue';
	import CommentIcon from '../ui/icons/comment.icon.vue';
	import PointIcon from '../ui/icons/point.icon.vue';
	import NotesIcon from '../ui/icons/notes.icon.vue';
	import { DATASET_NAMES } from '@/features/data/index.data';
	import BreakIcon from '../ui/icons/break.icon.vue';
	import Curtain from '../ui/curtain.vue';
	import AddIcon from '../ui/icons/add.icon.vue';

	const t = i18n.global.t;

	const { vaultPath, selectedPatient, selectedSession, selectSession } =
		useVaultStore();
	const {
		chartData,
		selectedCommentIndex,
		undoable,
		redoable,
		selectedDatasetIndex,
		selectComment,
		deleteComment,
		undo,
		redo,
		clearHistory,
		addPoint,
		addComment,
		addBreak
	} = useChartStore();

	const editingComment = ref<boolean>(false);
	const showingStats = ref<boolean>(false);

	const localMinutes = ref<number>(0);
	const localSeconds = ref<number>(0);
	const localValue = ref<number>(0);

	const showBreak = ref<boolean>(false);
	const breakDuration = ref<number>(10);

	watch(localMinutes, () => {
		if (localMinutes.value * 60 === chartData.value.duration) {
			localSeconds.value = 0;
		}
	});

	const handleCloseChart = async () => {
		selectSession(null);
		router.push('/');
	};

	const handleSaveChart = async () => {
		if (vaultPath.value && selectedPatient.value && selectedSession.value) {
			clearHistory();
			const rawData = toRaw(chartData.value);
			const rawSession = toRaw(selectedSession.value);
			const rawPatient = toRaw(selectedPatient.value);
			const rawVaultPath = toRaw(vaultPath.value);
			const rawComments = rawData.data.comments.map(comment => toRaw(comment));

			const saveSessionResponse = await sendSaveSession({
				vaultPath: rawVaultPath,
				patientId: rawPatient,
				sessionId: rawSession,
				sessionData: {
					comments: rawComments,
					datasets: rawData.data.datasets.map(dataset => ({
						label: dataset.label,
						color: dataset.backgroundColor,
						data: dataset.data
							.map(point => ({
								...point,
								y: Math.floor(point.y)
							}))
							.filter((_point, index) => index % 2 === 0)
					})),
					id: rawSession,
					notes: rawData.notes,
					patientId: rawPatient,
					date: rawData.date,
					duration: rawData.duration,
					name: rawData.name
				}
			});

			if (!saveSessionResponse.success) {
				alert(t(`ipc.${saveSessionResponse.message}`));
			}
		}
	};

	const handleOpenComments = () => {
		if (
			selectedCommentIndex.value === null &&
			chartData.value.data.comments.length > 0
		) {
			selectComment(0);
		}
		editingComment.value = true;
	};

	const handleCloseComments = () => {
		chartData.value.data.comments.forEach(comment => {
			if (!comment.text.trim()) {
				deleteComment(chartData.value.data.comments.indexOf(comment));
			}
		});
		selectComment(null);

		selectedCommentIndex.value = null;
		editingComment.value = false;
	};

	const handleDeleteComment = (index: number) => {
		console.log('delete comment', index);

		if (index < 0 || index >= chartData.value.data.comments.length) return;

		deleteComment(index);

		handleCloseComments();
	};

	const handleOpenStats = () => {
		showingStats.value = true;
	};

	const handleCloseStats = () => {
		showingStats.value = false;
	};

	const handleSetPoint = () => {
		const seconds = isLastMinute.value
			? localMinutes.value * 60
			: localMinutes.value * 60 + localSeconds.value;

		const roundedTime = (seconds / chartData.value.duration) * 100;
		addPoint({
			x: roundedTime,
			y: localValue.value
		});
	};

	const handleCreateComment = () => {
		const roundedTime =
			((localMinutes.value * 60 + localSeconds.value) /
				chartData.value.duration) *
			100;
		addComment(roundedTime);
		const newCommentIndex = chartData.value.data.comments.findIndex(
			c => c.x === roundedTime && c.y === -0.1
		);

		selectComment(newCommentIndex);
		handleOpenComments();
	};

	const handleKeypress = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			handleCreateComment();
			return;
		}

		if (e.key === 'Enter') {
			handleSetPoint();
		}
	};

	const handleChangeLocalMinutes = (e: Event) => {
		const { value } = e.target as HTMLInputElement;
		localMinutes.value = parseInt(value);

		if (localMinutes.value === maxMinutes.value) {
			if (localSeconds.value > maxSeconds.value) {
				localSeconds.value = maxSeconds.value;
			}
		}
	};

	const handleChangeLocalSeconds = (e: Event) => {
		const { value } = e.target as HTMLInputElement;
		localSeconds.value = parseInt(value);

		if (localMinutes.value === maxMinutes.value) {
			if (localSeconds.value > maxSeconds.value) {
				localSeconds.value = maxSeconds.value;
			}
		}
	};

	const handleAddBreak = () => {
		addBreak(breakDuration.value, localMinutes.value * 60 + localSeconds.value);
		breakDuration.value = 10;
		showBreak.value = false;
	}

	const isLastMinute = computed(() => {
		return Math.round(localMinutes.value) === chartData.value.duration / 60;
	});

	const maxMinutes = computed(() => {
		return Math.floor(chartData.value.duration / 60);
	});

	const maxSeconds = computed(() => {
		return chartData.value.duration - localMinutes.value * 60;
	});

	const rangeClass = computed(() => ({
		'text-[var(--vqr)]': selectedDatasetIndex.value === 0,
		'text-[var(--peqr)]': selectedDatasetIndex.value === 1,
		'text-[var(--iqr)]': selectedDatasetIndex.value === 2,
		'text-[var(--tqr)]': selectedDatasetIndex.value === 3
	}));
</script>

<template>
	<div class="w-full h-full flex flex-col divide-y relative">
		<nav class="flex justify-between items-center p-2">
			<div class="flex gap-4 items-center">
				<Button :click="handleCloseChart" :title="$t('common.close')" :icon="BackIcon" />
				<div>{{ chartData.date }}</div>
				<div>{{ chartData.name || 'Session' }}</div>
				<div>{{ formatDuration(chartData.duration) }}</div>
				<div>
					<Button :click="handleOpenStats" :title="$t('editSession.stats')" :icon="StatsIcon" />
				</div>
			</div>

			<div class="flex gap-2">
				<Button :class="`${!undoable && 'opacity-35'} cursor-pointer`" :click="undo"
					:title="$t('editSession.undo')" :icon="UndoIcon" />
				<Button class="scale-x-[-1]" :class="`${!redoable && 'opacity-35'} cursor-pointer`" :click="redo"
					:title="$t('editSession.redo')" :icon="UndoIcon" />
			</div>
			<div class="flex gap-2">
				<Button :click="handleSaveChart" :title="$t('common.save')" :icon="SaveIcon"
					:class="`${!undoable && 'opacity-35'}`" />

			</div>
		</nav>
		<section class="h-full w-full overflow-hidden">
			<Chart :toggleComments="handleOpenComments" />
		</section>
		<section class="flex justify-between">
			<div class="flex flex-col items-center w-96 p-2" @keydown="handleKeypress">
				<header class="font-bold mb-2" :class="rangeClass">
					{{ DATASET_NAMES[selectedDatasetIndex] }}
				</header>
				<div class="w-full flex flex-col items-center">
					<div class="flex gap-2">
						<input class="w-32 outline-[var(--primary)]" type="range" min="0" :max="maxMinutes"
							@input="handleChangeLocalMinutes" :value="localMinutes" />
						<div class="w-32 flex gap-2">
							<div class="w-18">{{ $t('common.minutes') }}</div>
							<div class="font-bold">{{ localMinutes }}</div>
						</div>
					</div>
					<div class="flex gap-2">
						<input class="w-32 outline-[var(--primary)]" type="range" min="0" max="59"
							@input="handleChangeLocalSeconds" :value="localSeconds" />
						<div class="w-32 flex gap-2">
							<div class="w-18">{{ $t('common.seconds') }}</div>
							<div class="font-bold">{{ localSeconds }}</div>
						</div>
					</div>
					<div class="flex gap-2">
						<input class="w-32 outline-[var(--primary)]" type="range" min="0" :max="6"
							v-model.number="localValue" />
						<div class="w-32 flex gap-2">
							<div class="w-18">{{ $t('common.modus') }}</div>
							<div class="font-bold">{{ localValue }}</div>
						</div>
					</div>
					<div class="flex gap-16 mt-2" :class="rangeClass">
						<Button :click="handleSetPoint" :title="$t('editSession.setPoint')" :icon="PointIcon" />
						<Button :click="handleCreateComment" :title="$t('editSession.createComment')"
							:icon="CommentIcon" />
						<Button :click="() => showBreak = !showBreak" :title="$t('editSession.addBreak')"
							:icon="BreakIcon" />
						<Curtain :trigger="showBreak"
							className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
							<div class="absolute z-1 bg-[var(--secondary)]/80 top-0 left-0 w-screen h-screen"
								@click="showBreak = false" />
							<div class="z-2 bg-white p-16 border rounded" @blur="showBreak = false">
								<header class="flex flex-col items-center mb-8">
									<h2 class="font-bold text-lg">{{ $t('editSession.addBreak') }}</h2>
									<h3>{{ formatDuration(localMinutes * 60 + localSeconds) }}</h3>
								</header>
								<div class="flex flex-col gap-2 items-center">
									<label for="breakDuration" class="font-bold">{{ $t('common.duration') }} ({{
										$t("common.seconds") }})</label>
									<input type="number" id="breakDuration" class="w-18 outline-none p-1 border"
										v-model.number="breakDuration" min="1" />
								</div>
								<div class="flex justify-center mt-4">
									<Button :click="handleAddBreak" :title="$t('common.add')" :icon="AddIcon" />
								</div>
							</div>
						</Curtain>
					</div>
				</div>
			</div>
			<div class="flex flex-col flex-1 p-2">
				<div class="flex items-center gap-2 mb-2">
					<div class="size-6 hover:text-[var(--neutral)]">
						<NotesIcon />
					</div>
					<header class="font-bold hover:text-[var(--neutral)]">{{ $t('editSession.notes') }}</header>
				</div>
				<textarea class="outline-none border grow-1 resize-none p-1 text-sm flex-1" name="sessionNotes"
					id="sessionNotes" v-model="chartData.notes" />
			</div>
		</section>
		<CommentsEditor @close="handleCloseComments" @delete="handleDeleteComment" :isOpen="editingComment" />
		<Stats :close="handleCloseStats" :isOpen="showingStats" />
	</div>
</template>
