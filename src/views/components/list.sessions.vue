<script setup lang="ts">
	import { formatDuration } from '@/features/utils/index.utils';
	import { router } from '@/routes/index.routes';
	import { useVaultStore } from '@/store/vault.store';
	import Button from '@ui/button.vue';
	import { i18n } from '@/features/internationalization/index.internationalization';
	import EditIcon from '../ui/icons/edit.icon.vue';
	import DeleteIcon from '../ui/icons/delete.icon.vue';

	defineProps<{
		lastFirst: boolean;
	}>();

	const { t } = i18n.global;

	const {
		selectedSession,
		selectedPatient,
		selectedPatientSessions,
		selectSession,
		deleteSession
	} = useVaultStore();

	const handleOpenEditSession = (e: MouseEvent, id: string) => {
		e.stopPropagation();
		if (selectedSession.value !== id) {
			selectSession(id);
		}
		router.push('/edit-session');
	};

	const handleDeleteSession = (e: MouseEvent, id: string) => {
		e.stopPropagation();

		const confirmed = confirm(t('home.confirmDeleteSession'));
		if (!confirmed) return;

		deleteSession(id);
	};

	const handleSelect = (id: string) => {
		if (selectedSession.value === id) selectSession(null)
		else selectSession(id);
	};
</script>

<template>
	<ul v-if="selectedPatientSessions.length > 0">
		<li v-for="session in selectedPatientSessions.sort((x, y) => new Date((lastFirst ? x : y).date).getTime() - new Date((lastFirst ? y : x).date).getTime())"
			:key="session.id" :class="[
				'flex items-center gap-2 pl-4 p-2 hover:bg-gray-100 cursor-pointer text-sm min-h-12',
				session.id === selectedSession ? '!bg-[var(--secondary)] hover:font-bold' : ''
			]" @click="() => handleSelect(session.id)">
			<div class="w-full flex justify-between items-center">
				<div class="flex justify-between items-center w-full">
					<div class="flex-1 text-center">{{ session.date }}</div>
					<div class="flex-1 text-center font-bold">{{ session.name || 'Session' }}</div>
					<div class="flex-1 text-center">{{ formatDuration(session.duration) }}</div>
				</div>
				<div class="w-18">
					<div v-if="selectedSession === session.id" class="flex gap-2">
						<Button :click="e => handleOpenEditSession(e, session.id)" :icon="EditIcon" small
							:title="$t('common.edit')" />
						<Button :click="e => handleDeleteSession(e, session.id)" :icon="DeleteIcon" small
							:title="$t('common.delete')" />
					</div>

				</div>
			</div>
		</li>
	</ul>
	<div v-else-if="selectedPatient" class="flex items-center justify-center h-full w-full text-sm text-gray-500 p-2">
		{{ $t('home.noSessions') }}
	</div>
	<div v-else class="flex items-center justify-center h-full w-full text-sm text-gray-500 p-2">
		{{ $t('home.noPatientsSelected') }}
	</div>
</template>
