<script setup lang="ts">
  import { onMounted } from 'vue';
  import { COLORS } from './features/data/index.data';
  import { i18n } from './features/internationalization/index.internationalization';

  onMounted(() => {
    document.documentElement.style.setProperty('--vqr', COLORS.VQR);
    document.documentElement.style.setProperty('--peqr', COLORS.PEQR);
    document.documentElement.style.setProperty('--tqr', COLORS.TQR);
    document.documentElement.style.setProperty('--iqr', COLORS.IQR);

    const locale = i18n.global.locale;
    const lang = localStorage.getItem('lang') as 'en' | 'de' | 'it' || 'en';
    locale.value = lang;
  });
</script>

<template>
  <router-view />
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
}
</style>