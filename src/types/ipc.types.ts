import { PatientMetadata, SessionMetadata, VaultMetadata } from './vault.types';

export interface IpcResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

export interface OpenVaultPayload {
	path?: string;
}

export interface OpenVaultResponseData {
	vaultPath: string;
	vaultMetadata: VaultMetadata;
	patients: PatientMetadata[];
}

export interface CreatePatientPayload {
	newPatient: Omit<PatientMetadata, 'id' | 'dateCreated'>;
	vaultPath: string;
}

export interface SavePatientPayload {
	patient: PatientMetadata;
	vaultPath: string;
}

export interface CreatePatientResponseData {
	newPatient: PatientMetadata;
}

export interface GetPatientSessionsPayload {
	vaultPath: string;
	patientId: string;
}

export interface GetPatientSessionsResponseData {
	patientId: string;
	sessions: SessionMetadata[];
}

export interface CreateSessionPayload {
	vaultPath: string;
	patientId: string;
	newSession: Omit<SessionMetadata, 'id' | 'patientId' | 'datasets'>;
}

export interface CreateSessionResponseData {
	newSession: SessionMetadata;
}

export interface GetSessionDataPayload {
	vaultPath: string;
	patientId: string;
	sessionId: string;
}

export interface GetSessionDataResponseData {
	sessionData: SessionMetadata;
}

export interface SaveSessionPayload {
	vaultPath: string;
	patientId: string;
	sessionId: string;
	sessionData: SessionMetadata;
}

export interface DeleteSessionPayload {
	vaultPath: string;
	patientId: string;
	sessionId: string;
}

export interface DeletePatientPayload {
	vaultPath: string;
	patientId: string;
}
