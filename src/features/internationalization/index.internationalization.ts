import { createI18n } from 'vue-i18n';
import translation from '@/features/internationalization/translations.json';

export const i18n = createI18n({
	legacy: false,
	locale: 'en',
	fallbackLocale: 'en',
	messages: translation
});
