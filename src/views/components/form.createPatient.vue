<script setup lang="ts">
	import { useVaultStore } from '@/store/vault.store';
	import { PatientMetadata } from '@/types/vault.types';
	import Button from '@ui/button.vue';
	import Curtain from '@ui/curtain.vue';
	import BackIcon from '../ui/icons/left.arrow.icon.vue';
	import AddIcon from '../ui/icons/add.icon.vue';

	const emit = defineEmits<{
		(e: 'close-create-patient'): void
	}>();

	defineProps<{
		showCreatePatient: boolean,
		newPatient: Omit<PatientMetadata, 'id' | 'dateCreated'>,
		createPatient: () => void,
	}>();

	const { editingPatient } = useVaultStore();
</script>

<template>
	<Curtain :trigger="showCreatePatient" :className="'absolute left-0 top-0 bg-white w-full h-full'">
		<section>
			<header class="flex items-center justify-between py-2 px-8">
				<div class="text-xl font-bold">
					{{ editingPatient ? $t('createPatientForm.updatePatient') : $t('createPatientForm.createPatient') }}
				</div>
				<Button :click="() => emit('close-create-patient')" :title="$t('common.close')" :icon="BackIcon" />
			</header>
			<form @submit.prevent="" class="flex flex-col gap-4 p-4 items-center justify-center">
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<label class="self-start font-bold" for="new-patient-name">{{
						$t('createPatientForm.firstName')
					}}</label>
					<input class="w-full outline-none p-1 border" type="text" id="new-patient-name"
						v-model="newPatient.name" />
				</div>
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<label class="self-start font-bold" for="new-patient-surname">{{
						$t('createPatientForm.lastName')
					}}</label>
					<input class="w-full outline-none p-1 border" type="text" id="new-patient-surname"
						v-model="newPatient.surname" />
				</div>
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<label class="self-start font-bold" for="new-patient-birthdate">{{
						$t('createPatientForm.birthDate')
					}}</label>
					<input class="w-full outline-none p-1 border" type="date" id="new-patient-birthdate"
						v-model="newPatient.birthDate" />
				</div>
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<label class="self-start font-bold" for="new-patient-diagnosis">{{
						$t('createPatientForm.diagnosis')
					}}</label>
					<textarea class="w-full h-[150px] outline-none border resize-none p-1" id="new-patient-diagnosis"
						v-model="newPatient.diagnosis"></textarea>
				</div>
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<label class="self-start font-bold" for="new-patient-notes">{{
						$t('createPatientForm.notes')
					}}</label>
					<textarea class="w-full h-[150px] outline-none border resize-none p-1" id="new-patient-notes"
						v-model="newPatient.notes"></textarea>
				</div>
				<Button :click="createPatient" :label="editingPatient ? $t('common.save') : $t('common.create')"
					:icon="AddIcon" class="font-bold"
					:title="editingPatient ? $t('createPatientForm.updatePatient') : $t('createPatientForm.createPatient')" />
			</form>
		</section>
	</Curtain>
</template>