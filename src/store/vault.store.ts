import { ref, watch } from 'vue';
import {
	PatientMetadata,
	SessionMetadata,
	VaultMetadata
} from '@/types/vault.types';
import { useLocalStorage } from '@vueuse/core';
import { defineStore, storeToRefs } from 'pinia';
import {
	sendDeletePatient,
	sendDeleteSession,
	sendGetPatientSessions
} from '@/features/ipc/index.ipc.renderer';
import { useChartStore } from './chart.store';

export const vaultStore = defineStore('vault', () => {
	const { updateChartData, clearChartData } = useChartStore();

	const vaultPath = useLocalStorage<string | null>('vaultPath', null);
	const vaultData = ref<VaultMetadata>({
		therapistName: '',
		dateCreated: '',
		notes: ''
	});
	const patients = ref<PatientMetadata[]>([]);
	const selectedPatient = ref<string | null>(null);
	const selectedPatientSessions = ref<SessionMetadata[]>([]);
	const selectedSession = ref<string | null>(null);
	const editingPatient = ref<boolean>(false);

	watch(selectedPatient, () => {
		selectedSession.value = null;
	});

	const setEditingPatient = (editing: boolean) => {
		editingPatient.value = editing;
	};

	const setVaultData = (
		path: string,
		newVaultData: VaultMetadata,
		newPatients: PatientMetadata[]
	) => {
		vaultPath.value = path;
		vaultData.value = newVaultData;
		patients.value = newPatients.sort((a, b) =>
			a.surname.localeCompare(b.surname)
		);
	};

	const clearVaultData = () => {
		vaultPath.value = null;
		vaultData.value = {
			therapistName: '',
			dateCreated: '',
			notes: ''
		};
		patients.value = [];
		selectedPatient.value = null;
		selectedPatientSessions.value = [];
		selectedSession.value = null;
	};

	const addPatient = (patient: PatientMetadata) => {
		patients.value = [...patients.value, patient].sort((a, b) =>
			a.surname.localeCompare(b.surname)
		);
	};

	const updatePatient = (updatedPatient: PatientMetadata) => {
		patients.value = patients.value.map(patient =>
			patient.id === updatedPatient.id ? updatedPatient : patient
		);
	};

	const selectPatient = async (patientId: string | null) => {
		if (patientId && vaultPath.value) {
			const patientSessions = await sendGetPatientSessions({
				patientId,
				vaultPath: vaultPath.value
			});
			if (patientSessions.success && patientSessions.data) {
				selectedPatientSessions.value = patientSessions.data.sessions;
			} else {
				console.error(
					'Error fetching patient sessions:',
					patientSessions.message
				);
			}
		}

		if (patientId === null) {
			selectedPatientSessions.value = [];
		}

		selectedPatient.value = patientId;
	};

	const addSelectedPatientSession = (newSession: SessionMetadata) => {
		if (selectedPatient.value) {
			selectedPatientSessions.value = [
				...selectedPatientSessions.value,
				{
					...newSession
				}
			].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		}
	};

	const selectSession = (sessionId: string | null) => {
		selectedSession.value = sessionId;

		if (!sessionId) {
			clearChartData();
			return;
		}

		if (sessionId && vaultPath.value && selectedPatient.value) {
			updateChartData(sessionId, vaultPath.value, selectedPatient.value);
		}
	};

	const deleteSession = async (sessionId: string) => {
		if (!vaultData.value && !selectedPatient.value) {
			return;
		}
		const deleteSessionResponse = await sendDeleteSession({
			vaultPath: vaultPath.value || '',
			patientId: selectedPatient.value || '',
			sessionId
		});

		if (!deleteSessionResponse.success) {
			console.error('Error deleting session:', deleteSessionResponse.message);
			return;
		}

		selectedPatientSessions.value = selectedPatientSessions.value.filter(
			session => session.id !== sessionId
		);

		selectedSession.value = null;
	};

	const deletePatient = async (patientId: string) => {
		if (!vaultData.value || !vaultPath.value) {
			return;
		}
		const deletePatientResponse = await sendDeletePatient({
			vaultPath: vaultPath.value,
			patientId
		});

		if (!deletePatientResponse.success) {
			console.error('Error deleting patient:', deletePatientResponse.message);
			return;
		}

		patients.value = patients.value.filter(patient => patient.id !== patientId);
		selectedPatient.value = null;
		selectedPatientSessions.value = [];
	};

	return {
		vaultPath,
		patients,
		selectedPatient,
		selectedPatientSessions,
		selectedSession,
		editingPatient,
		setEditingPatient,
		setVaultData,
		clearVaultData,
		addPatient,
		selectPatient,
		addSelectedPatientSession,
		selectSession,
		deleteSession,
		updatePatient,
		deletePatient
	};
});

export const useVaultStore = () => {
	const store = vaultStore();
	const {
		vaultPath,
		patients,
		selectedPatient,
		selectedPatientSessions,
		selectedSession,
		editingPatient
	} = storeToRefs(store);

	return {
		vaultPath,
		patients,
		selectedPatient,
		selectedPatientSessions,
		selectedSession,
		editingPatient,
		clearVaultData: store.clearVaultData,
		setVaultData: store.setVaultData,
		addPatient: store.addPatient,
		selectPatient: store.selectPatient,
		addSelectedPatientSession: store.addSelectedPatientSession,
		selectSession: store.selectSession,
		deleteSession: store.deleteSession,
		setEditingPatient: store.setEditingPatient,
		updatePatient: store.updatePatient,
		deletePatient: store.deletePatient
	};
};
