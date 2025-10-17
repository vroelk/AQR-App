<script setup lang="ts">
	import { watch } from 'vue';
	import { useVaultStore } from '@/store/vault.store';
	import { sendOpenVault } from '@/features/ipc/index.ipc.renderer';
	import { router } from '@/routes/index.routes';
	import Footer from '@components/footer.vue';
	import Header from '@components/header.vue';

	const { vaultPath } = useVaultStore();

	watch(
		vaultPath,
		(newVaule, oldValue) => {
			if (newVaule && oldValue === undefined) {
				sendOpenVault({ path: newVaule });
			}
			if (!newVaule) router.push('/select-vault');
			if (newVaule) router.push('/');
		},
		{ immediate: true }
	)
</script>

<template>
	<Header />
	<main class="flex-1 overflow-auto">
		<router-view />
	</main>
	<Footer />

</template>