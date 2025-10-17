<script setup lang="ts">
	import { useVaultStore } from '@/store/vault.store';
	import Button from '../ui/button.vue';
	import { i18n } from '@/features/internationalization/index.internationalization';
	import EditIcon from '../ui/icons/edit.icon.vue';
	import DeleteIcon from '../ui/icons/delete.icon.vue';
	import { getAge } from '@/features/utils/index.utils';

	const { t } = i18n.global;

	const emit = defineEmits<{
		(e: 'edit-patient', id: string): void
	}>()

	const { patients, selectedPatient, selectPatient, deletePatient } = useVaultStore();

	const handleSelect = (id: string) => {
		if (selectedPatient.value === id) selectPatient(null)
		else selectPatient(id);
	};

	const handleClickEdit = (e: MouseEvent) => {
		e.stopPropagation();
		if (!selectedPatient.value) return;
		emit('edit-patient', selectedPatient.value);
	};

	const handleClickDelete = (e: MouseEvent) => {
		e.stopPropagation();

		if (!selectedPatient.value) return;

		const confirmed = confirm(t('home.confirmDeletePatient'));
		if (!confirmed) return;

		deletePatient(selectedPatient.value);
	};
</script>

<template>
	<ul v-if="patients.length > 0">
		<li v-for="patient in patients.sort((x, y) => x.surname.localeCompare(y.surname))" :key="patient.id" :class="[
			'flex items-center gap-2 pl-4 p-2 hover:bg-[var(--neutralLight)] cursor-pointer text-sm min-h-12',
			patient.id === selectedPatient ? '!bg-[var(--secondary)] hover:font-bold' : ''
		]" @click="(_e) => handleSelect(patient.id)">
			<div class="w-full flex justify-between items-center">
				<div><span class="font-bold">{{ patient.surname }}</span> {{ patient.name }} ({{
					getAge(patient.birthDate) }})
				</div>
				<div v-if="patient.id === selectedPatient" class="flex gap-2">
					<Button :click="handleClickEdit" :icon="EditIcon" :title="$t('common.edit')" />
					<Button :click="handleClickDelete" :icon="DeleteIcon" small :title="$t('common.delete')" />
				</div>

			</div>

		</li>
	</ul>
	<div v-else class="text-sm text-gray-500 p-2">
		{{ $t('home.noPatients') }}
	</div>
</template>