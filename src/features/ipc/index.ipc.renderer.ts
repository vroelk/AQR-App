import { i18n } from '@/features/internationalization/index.internationalization';
import { useVaultStore } from '@/store/vault.store';
import {
	CreatePatientPayload,
	CreatePatientResponseData,
	CreateSessionPayload,
	CreateSessionResponseData,
	DeletePatientPayload,
	DeleteSessionPayload,
	GetPatientSessionsPayload,
	GetPatientSessionsResponseData,
	GetSessionDataPayload,
	GetSessionDataResponseData,
	IpcResponse,
	OpenVaultPayload,
	OpenVaultResponseData,
	SavePatientPayload,
	SaveSessionPayload
} from '@/types/ipc.types';

const ipc = window.ipcRenderer;
const t = i18n.global.t;

export const sendOpenVault = async (payload: OpenVaultPayload) => {
	const { setVaultData, clearVaultData } = useVaultStore();

	const res: IpcResponse<OpenVaultResponseData> = await ipc.invoke(
		'open-vault',
		payload
	);

	if (!res.success) {
		alert(payload ? t('ipc.VAULTPATHINVALID') : t(res.message));
		clearVaultData();
		return;
	}

	setVaultData(res.data.vaultPath, res.data.vaultMetadata, res.data.patients);
};

export const sendCreateVault = async () => {
	const { setVaultData, clearVaultData } = useVaultStore();

	const res: IpcResponse<OpenVaultResponseData> = await ipc.invoke(
		'create-vault'
	);

	if (!res.success) {
		alert(t(`ipc.${res.message}`));
		clearVaultData();
		return;
	}

	setVaultData(res.data.vaultPath, res.data.vaultMetadata, []);
};

export const sendCreatePatient = async (payload: CreatePatientPayload) => {
	const { addPatient } = useVaultStore();
	const res: IpcResponse<CreatePatientResponseData> = await ipc.invoke(
		'create-patient',
		payload
	);

	if (!res.success) {
		alert(t(`ipc.${res.message}`));
		return false;
	}

	addPatient(res.data.newPatient);

	return res.success;
};

export const sendSavePatient = async (payload: SavePatientPayload) => {
	const res: IpcResponse<null> = await ipc.invoke('save-patient', payload);

	if (!res.success) {
		alert(t(`ipc.${res.message}`));
		return false;
	}
	return res.success;
};

export const sendGetPatientSessions = async (
	payload: GetPatientSessionsPayload
) => {
	return (await ipc.invoke(
		'get-patient-sessions',
		payload
	)) as IpcResponse<GetPatientSessionsResponseData>;
};

export const sendCreateSession = async (payload: CreateSessionPayload) => {
	const { addSelectedPatientSession } = useVaultStore();
	const res: IpcResponse<CreateSessionResponseData> = await ipc.invoke(
		'create-session',
		payload
	);

	if (!res.success) {
		alert(t(`ipc.${res.message}`));
		return false;
	}

	addSelectedPatientSession(res.data.newSession);

	return { success: res.success, id: res.data.newSession.id };
};

export const sendGetSessionData = async (payload: GetSessionDataPayload) => {
	return (await ipc.invoke(
		'get-session-data',
		payload
	)) as IpcResponse<GetSessionDataResponseData>;
};

export const sendSaveSession = async (payload: SaveSessionPayload) => {
	return (await ipc.invoke('save-session', payload)) as IpcResponse<null>;
};

export const sendDeleteSession = async (payload: DeleteSessionPayload) => {
	return (await ipc.invoke('delete-session', payload)) as IpcResponse<null>;
};

export const sendDeletePatient = async (payload: DeletePatientPayload) => {
	return (await ipc.invoke('delete-patient', payload)) as IpcResponse<null>;
};
