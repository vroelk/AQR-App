<script setup lang="ts">
	import { i18n } from '@/features/internationalization/index.internationalization';

	const locale = i18n.global.locale;
	const handleChange = () => {
		localStorage.setItem('lang', locale.value);
	}
</script>

<template>
	<header class="bg-[var(--primary)] flex items-center justify-between p-4 shadow-sm">
		<h1 class="text-xl font-bold select-none text-[var(--neutralLight)] hover:text-[var(--neutral)]">
			{{ $t('header.appName') }}
		</h1>
		<div>
			<select v-model="$i18n.locale" @change="handleChange"
				class="outline-none border-1 border-black p-0.5 bg-white">
				<option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
					{{ locale.toUpperCase() }}
				</option>
			</select>
		</div>
	</header>
</template>
