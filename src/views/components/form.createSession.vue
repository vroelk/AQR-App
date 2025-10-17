<script setup lang="ts">
	import { useVaultStore } from '@/store/vault.store';
	import { SessionMetadata } from '@/types/vault.types';
	import Button from '@ui/button.vue';
	import Curtain from '@ui/curtain.vue';
	import { computed, ref } from 'vue';
	import BackIcon from '../ui/icons/left.arrow.icon.vue';
	import AddIcon from '../ui/icons/add.icon.vue';

	const props = defineProps<{
		showCreateSession: boolean;
		newSession: Omit<SessionMetadata, 'id' | 'patientId' | 'datasets'>;
		createSession: () => void;
	}>();

	const emit = defineEmits(['close-create-session'])

	const { selectedPatient, patients } = useVaultStore();

	const localDurationMinutes = ref<number>(45);
	const localDurationSeconds = ref<number>(0);

	const handleCreateSession = () => {
		props.newSession.duration =
			localDurationMinutes.value * 60 + localDurationSeconds.value;
		props.createSession();
	};

	const handleClose = () => {
		localDurationMinutes.value = 45;
		localDurationSeconds.value = 0;
		emit('close-create-session');
	}

	const selectedPatientName = computed(() => {
		const patient = patients.value.find(p => p.id === selectedPatient.value);
		return patient ? `${patient.name} ${patient.surname}` : '';
	});
</script>

<template>
	<Curtain :trigger="showCreateSession" :className="'absolute left-0 top-0 bg-white w-full h-full'">
		<section>
			<header class="flex items-center justify-between py-2 px-8">
				<div class="text-xl font-bold">{{ $t('createSessionForm.createSession') }}</div>
				<div v-if="selectedPatient">{{ $t('createSessionForm.patient') }}: <span class="font-bold">{{
					selectedPatientName }}</span></div>
				<Button :click="handleClose" :title="$t('common.close')" :icon="BackIcon" />
			</header>
			<form @submit.prevent="" class="flex flex-col gap-4 p-4 items-center justify-center">
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<label class="self-start font-bold" for="new-session-name">{{ $t('createSessionForm.name')
					}}</label>
					<input class="w-full outline-none p-1 border" id="new-session-name" v-model="newSession.name" />
				</div>
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<label class="self-start font-bold" for="new-session-date">{{ $t('createSessionForm.date')
					}}</label>
					<input class="w-full outline-none p-1 border" type="date" id="new-session-date"
						v-model="newSession.date" />
				</div>
				<div class="flex flex-col gap-2 w-[80%] min-w-[400px] max-w-[900px] justify-center items-center">
					<h2 class="font-bold self-start">{{ $t('createSessionForm.duration') }}</h2>
					<div class="flex self-start gap-2 justify-center items-center">
						<div class="flex gap-2 justify-center items-center">
							<label class="font-bold" for="new-session-duration">{{ $t('common.minutes')
							}}</label>
							<input class="w-[75px] outline-none p-1 border" type="number" id="new-session-duration"
								v-model="localDurationMinutes" min="0" />
						</div>
						<div class="flex gap-2 justify-center items-center">
							<label class="font-bold" for="new-session-duration">{{ $t('common.seconds')
							}}</label>
							<input class="w-[75px] outline-none p-1 border" type="number" id="new-session-duration"
								v-model="localDurationSeconds" max="59" min="0" />
						</div>
					</div>
				</div>
				<Button :click="handleCreateSession" :label="$t('common.create')" :icon="AddIcon" class="font-bold"
					:title="$t('createSessionForm.createSession')" />
			</form>
		</section>
	</Curtain>
</template>
