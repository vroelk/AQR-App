<script setup lang="ts">
import { useVaultStore } from '@/store/vault.store';
import Button from '@ui/button.vue';
import CloseIcon from '../ui/icons/close.icon.vue';

const { vaultPath } = useVaultStore();
const { clearVaultData } = useVaultStore();
</script>

<template>
	<footer class="shadow-sm bg-[var(--primary)] p-4 text-[var(--secondary)]">
		<div v-if="vaultPath" class="flex justify-between items-center">
			<div class="text-sm hover:text-[var(--neutral)]">{{ $t('footer.vaultPath') }}: <span class="font-bold">{{
				vaultPath
					}}</span>
			</div>
			<Button :click="clearVaultData" :icon="CloseIcon" :title="$t('common.closeArchive')" />
		</div>
		<div v-else>
			<span class="hover:text-[var(--neutral)] hover:font-bold">{{ $t('footer.noVaultOpen') }}</span>

		</div>
	</footer>
</template>