<script setup lang="ts">
	import { ref, toRaw } from 'vue';
	import PatientsList from '@/views/components/list.patients.vue';
	import SessionsList from '@/views/components/list.sessions.vue';
	import CreatePatientForm from '@/views/components/form.createPatient.vue';
	import CreateSessionForm from '@/views/components/form.createSession.vue';
	import Button from '@ui/button.vue';
	import Fragment from '@/views/ui/fragment.vue';
	import { PatientMetadata, SessionMetadata } from '@/types/vault.types';
	import {
		sendCreatePatient,
		sendCreateSession,
		sendSavePatient
	} from '@/features/ipc/index.ipc.renderer';
	import { useVaultStore } from '@/store/vault.store';
	import AddIcon from '../ui/icons/add.icon.vue';
	import PatientIcon from '../ui/icons/patient.icon.vue';
	import SessionIcon from '../ui/icons/session.icon.vue';
	import LoadIcon from '../ui/icons/load.icon.vue';
	import { router } from '@/routes/index.routes';

	const { vaultPath, selectedPatient, patients, editingPatient, setEditingPatient, selectPatient, updatePatient, selectSession } = useVaultStore();

	const showCreatePatient = ref(false);
	const showCreateSession = ref(false);
	const newPatient = ref<Omit<PatientMetadata, 'id' | 'dateCreated'>>({
		name: '',
		surname: '',
		diagnosis: '',
		notes: '',
		birthDate: ''
	});
	const newSession = ref<Omit<SessionMetadata, 'id' | 'patientId' | 'datasets'>>({
		date: new Date().toISOString().split('T')[0],
		notes: '',
		duration: 45,
		comments: [],
		name: ''
	});
	const lastFirst = ref(false);

	const handleCreatePatient = async () => {
		if (!vaultPath.value) {
			return;
		}

		if (editingPatient.value) {
			const patient = patients.value.find(p => p.id === selectedPatient.value);
			if (!patient) return;

			const updatedPatientData = toRaw({ ...patient, ...newPatient.value })

			const patientSaved = await sendSavePatient({
				patient: updatedPatientData,
				vaultPath: vaultPath.value
			});

			if (patientSaved) {
				showCreatePatient.value = false;
				newPatient.value = {
					name: '',
					surname: '',
					diagnosis: '',
					notes: '',
					birthDate: ''
				};
			}
			updatePatient(updatedPatientData);
			setEditingPatient(false);
			selectPatient(null);
			return;
		}

		const userCreated = await sendCreatePatient({
			newPatient: toRaw(newPatient.value),
			vaultPath: vaultPath.value
		});

		if (userCreated) {
			showCreatePatient.value = false;
			newPatient.value = {
				name: '',
				surname: '',
				diagnosis: '',
				notes: '',
				birthDate: ''
			};
		}
	};

	const handleCloseCreatePatient = () => {
		newPatient.value = {
			name: '',
			surname: '',
			diagnosis: '',
			notes: '',
			birthDate: ''
		};
		setEditingPatient(false);
		if (showCreatePatient.value) {
			showCreatePatient.value = false;
		}
	};

	const handleCreateSession = async () => {
		if (!vaultPath.value || !selectedPatient.value) {
			return;
		}

		const sessionCreated = await sendCreateSession({
			newSession: toRaw(newSession.value),
			vaultPath: vaultPath.value,
			patientId: selectedPatient.value
		});

		if (sessionCreated) {
			showCreateSession.value = false;
			newSession.value = {
				date: '',
				notes: '',
				duration: 45,
				comments: [],
				name: ''
			};

			selectSession(sessionCreated.id);
			router.push('/edit-session');
		}
	};

	const handleCloseCreateSession = () => {
		if (showCreateSession.value) {
			showCreateSession.value = false;
			newSession.value = {
				date: '',
				notes: '',
				duration: 45,
				comments: [],
				name: ''
			};
		}
	};

	const handleEditPatient = (id: string) => {
		const patient = patients.value.find(p => p.id === id);
		if (patient) {
			setEditingPatient(true);
			selectPatient(id);
			newPatient.value = {
				name: patient.name,
				surname: patient.surname,
				diagnosis: patient.diagnosis,
				notes: patient.notes,
				birthDate: patient.birthDate
			};
			showCreatePatient.value = true;
		}
	};

	const handleToggleOrder = () => {
		lastFirst.value = !lastFirst.value;
	};
</script>

<template>
	<div class="relative h-full">
		<div class="flex h-full divide-x divide-gray-200">
			<section class="flex flex-col flex-1">
				<header class="flex items-center justify-between border-b border-gray-200 h-[50px] p-2 select-none">
					<h2 class="flex items-center gap-3 font-bold hover:text-[var(--neutral)]">
						<div class="size-6">
							<PatientIcon />
						</div>
						{{ $t('home.patients') }}
					</h2>
					<Button :click="() => (showCreatePatient = !showCreatePatient)" :label="''" small :icon="AddIcon"
						:title="$t('common.create')" />
				</header>
				<PatientsList @edit-patient="handleEditPatient" />
			</section>
			<section class="flex flex-col flex-1">
				<header class="flex items-center justify-between border-b border-gray-200 h-[50px] p-2 select-none">
					<h2 class="flex items-center gap-3 font-bold hover:text-[var(--neutral)]">
						<div class="size-6">
							<SessionIcon />
						</div>
						{{ $t('home.sessions') }}
						<div class="size-6" :title="$t('home.toggleOrder')">
							<LoadIcon class="transition-all duration-300 cursor-pointer"
								:class="{ 'rotate-180': lastFirst }" @click="handleToggleOrder" />
						</div>
					</h2>
					<Button v-if="selectedPatient" :click="() => (showCreateSession = !showCreateSession)" :label="''"
						small :icon="AddIcon" :title="$t('common.create')" />
				</header>
				<SessionsList :last-first="lastFirst" />
			</section>
		</div>

		<Fragment>
			<CreatePatientForm :newPatient="newPatient" :showCreatePatient="showCreatePatient"
				:createPatient="handleCreatePatient" @close-create-patient="handleCloseCreatePatient" />
			<CreateSessionForm :newSession="newSession" :showCreateSession="showCreateSession"
				:createSession="handleCreateSession" @close-create-session="handleCloseCreateSession" />
		</Fragment>
	</div>
</template>
