<script setup lang="ts">
import { sendCreateVault, sendOpenVault } from '@/features/ipc/index.ipc.renderer';
import Button from '@ui/button.vue';
import AddIcon from '../ui/icons/add.icon.vue';
import LoadIcon from '../ui/icons/load.icon.vue';

</script>

<template>
	<div class="flex flex-col items-center justify-center h-full gap-12 text-xl font-bold">
		<Button :label="$t('selectVault.selectVault')" :title="$t('selectVault.selectVault')"
			:click="() => sendOpenVault({})" :icon="LoadIcon" />
		<hr class="w-[250px] border-t border-gray-300" />
		<Button :label="$t('selectVault.createVault')" :title="$t('selectVault.createVault')" :click="sendCreateVault"
			:icon="AddIcon" reverse />
	</div>
</template>