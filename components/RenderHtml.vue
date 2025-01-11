<template>
   <div class="prose max-w-full dark:prose-invert overflow-x-auto px-4" v-html="html"></div>
</template>
<script setup lang="ts">
const props = defineProps<{
   html: string,
}>()
</script>