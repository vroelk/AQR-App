import { ipcMain } from 'electron';
import {
	createPatientController,
	createSessionController,
	createVaultController,
	deletePatientController,
	deleteSessionController,
	getPatientSessionsController,
	getSessionDataController,
	openVaultController,
	savePatientController,
	saveSessionController
} from './controllers/vault.controller';

export const useIpcControllers = () => {
	ipcMain.handle('open-vault', openVaultController);
	ipcMain.handle('create-vault', createVaultController);
	ipcMain.handle('create-patient', createPatientController);
	ipcMain.handle('get-patient-sessions', getPatientSessionsController);
	ipcMain.handle('create-session', createSessionController);
	ipcMain.handle('get-session-data', getSessionDataController);
	ipcMain.handle('save-session', saveSessionController);
	ipcMain.handle('delete-session', deleteSessionController);
	ipcMain.handle('save-patient', savePatientController);
	ipcMain.handle('delete-patient', deletePatientController);
};
