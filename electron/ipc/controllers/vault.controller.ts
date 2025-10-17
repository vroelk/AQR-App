import { dialog, IpcMainInvokeEvent } from 'electron';
import {
	checkVaultPath,
	createPatientPath,
	createVaultPath,
	deletePatient,
	deleteSession,
	getPatientSessionsData,
	getSessionData,
	saveSessionData,
	updatePatientData
} from '../../features/utils/index.fsutils';
import { generateDate, generateId } from '../../features/utils/index.utils';
import {
	CreatePatientPayload,
	CreateSessionPayload,
	DeletePatientPayload,
	DeleteSessionPayload,
	GetPatientSessionsPayload,
	GetSessionDataPayload,
	OpenVaultPayload,
	SavePatientPayload,
	SaveSessionPayload
} from '@typeDefs/ipc.types';
import { PatientMetadata } from '@typeDefs/vault.types';

export const openVaultController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: OpenVaultPayload
) => {
	let vaultPath = payload.path;
	if (!vaultPath) {
		const dialogResult = await dialog.showOpenDialog({
			properties: ['openDirectory', 'createDirectory']
		});

		if (dialogResult.canceled) {
			return {
				success: false,
				message: 'VAULTPATHNOTSELECTED',
				data: null
			};
		}

		vaultPath = dialogResult.filePaths[0];
	}

	const vaultPathCheck = checkVaultPath(vaultPath);

	if (!vaultPathCheck.success || !vaultPathCheck.data) {
		return {
			success: false,
			message: vaultPathCheck.message,
			data: null
		};
	}

	return {
		success: true,
		message: 'DIRECTORYSELECTED',
		data: {
			vaultPath,
			vaultMetadata: vaultPathCheck.data,
			patients: vaultPathCheck.data.patients
		}
	};
};

export const createVaultController = async (
	_invokeEvent: IpcMainInvokeEvent
) => {
	const dialogResult = await dialog.showOpenDialog({
		properties: ['openDirectory', 'createDirectory']
	});

	if (dialogResult.canceled) {
		return {
			success: false,
			message: 'VAULTPATHNOTSELECTED',
			data: null
		};
	}

	const selectedVaultPath = dialogResult.filePaths[0];

	const vaultPathCheck = createVaultPath(selectedVaultPath);

	if (!vaultPathCheck.success || !vaultPathCheck.data) {
		return {
			success: false,
			message: vaultPathCheck.message,
			data: null
		};
	}

	return {
		success: true,
		message: 'DIRECTORYSELECTED',
		data: { vaultPath: selectedVaultPath, vaultMetadata: vaultPathCheck.data }
	};
};

export const createPatientController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: CreatePatientPayload
) => {
	const { vaultPath, newPatient } = payload;

	if (!newPatient.name || !newPatient.surname || !newPatient.birthDate) {
		return {
			success: false,
			message: 'NAMESREQUIRED',
			data: null
		};
	}

	const newPatientData: PatientMetadata = {
		...newPatient,
		id: generateId(),
		dateCreated: generateDate()
	};

	const createPathRes = createPatientPath(vaultPath, newPatientData);

	if (!createPathRes.success || !createPathRes.data) {
		return {
			success: false,
			message: createPathRes.message,
			data: null
		};
	}

	return {
		success: true,
		message: 'PATIENTCREATED',
		data: { newPatient: createPathRes.data }
	};
};

export const getPatientSessionsController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: GetPatientSessionsPayload
) => {
	const { vaultPath, patientId } = payload;

	const patientSessionsData = getPatientSessionsData(vaultPath, patientId);

	if (!patientSessionsData.success || !patientSessionsData.data) {
		return {
			success: false,
			message: patientSessionsData.message,
			data: null
		};
	}

	return {
		success: true,
		message: 'SESSIONRETRIEVED',
		data: {
			patientId: patientSessionsData.data.patientId,
			sessions: patientSessionsData.data.sessions
		}
	};
};

export const createSessionController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: CreateSessionPayload
) => {
	const { vaultPath, patientId, newSession } = payload;

	const createSessionRes = saveSessionData(vaultPath, patientId, {
		...newSession,
		duration: newSession.duration,
		id: generateId(),
		patientId,
		datasets: [
			{
				label: 'VQR',
				color: '#184cf7',
				data: [
					{
						x: 0,
						y: 0
					}
				]
			},
			{
				label: 'PEQR',
				color: 'red',
				data: [
					{
						x: 0,
						y: 0
					}
				]
			},
			{
				label: 'IQR',
				color: 'orange',
				data: [
					{
						x: 0,
						y: 0
					}
				]
			},
			{
				label: 'TQR',
				color: 'green',
				data: [
					{
						x: 0,
						y: 0
					}
				]
			}
		],
		date: newSession.date || generateDate(),
		comments: []
	});

	if (!createSessionRes.success || !createSessionRes.data) {
		return {
			success: false,
			message: createSessionRes.message,
			data: null
		};
	}

	return {
		success: true,
		message: 'SESSIONCREATED',
		data: { newSession: createSessionRes.data }
	};
};

export const getSessionDataController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: GetSessionDataPayload
) => {
	const { vaultPath, patientId, sessionId } = payload;

	const sessionDataRes = getSessionData(vaultPath, patientId, sessionId);

	if (!sessionDataRes.success || !sessionDataRes.data) {
		return {
			success: false,
			message: sessionDataRes.message,
			data: null
		};
	}

	return {
		success: true,
		message: 'SESSIONDATARETRIEVED',
		data: sessionDataRes.data
	};
};

export const saveSessionController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: SaveSessionPayload
) => {
	const saveSessionResponse = saveSessionData(
		payload.vaultPath,
		payload.patientId,
		payload.sessionData,
		false
	);

	if (!saveSessionResponse.success) {
		return {
			success: false,
			message: saveSessionResponse.message,
			data: null
		};
	}
	return {
		success: true,
		message: 'SESSIONDATASAVED',
		data: saveSessionResponse.data
	};
};

export const deleteSessionController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: DeleteSessionPayload
) => {
	const { vaultPath, patientId, sessionId } = payload;

	return deleteSession(vaultPath, patientId, sessionId);
};

export const savePatientController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: SavePatientPayload
) => {
	const { vaultPath, patient } = payload;

	if (!patient.name || !patient.surname) {
		return {
			success: false,
			message: 'NAMESREQUIRED',
			data: null
		};
	}

	const savePatientRes = updatePatientData(vaultPath, patient);

	if (!savePatientRes.success || !savePatientRes.data) {
		return {
			success: false,
			message: savePatientRes.message,
			data: null
		};
	}

	return {
		success: true,
		message: 'PATIENTUPDATED',
		data: savePatientRes.data
	};
};

export const deletePatientController = async (
	_invokeEvent: IpcMainInvokeEvent,
	payload: DeletePatientPayload
) => {
	const { vaultPath, patientId } = payload;

	const deletePatientRes = deletePatient(vaultPath, patientId);

	if (!deletePatientRes.success) {
		return {
			success: false,
			message: deletePatientRes.message,
			data: null
		};
	}

	return deletePatientRes;
};
