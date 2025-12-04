<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { buildAuthorizationUrl } from '@/config/oauthConfig'
import DefaultLayout from '@/layout/DefaultLayout.vue'

const route = useRoute()

// 라우트 메타에 따라 레이아웃 결정
const layout = computed(() => {
  return DefaultLayout
})

</script>

<style>
/* 스타일은 assets/styles에서 관리 */
</style>

