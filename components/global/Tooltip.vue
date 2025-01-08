<script setup lang="ts">
const props = defineProps<{
  label: string;
}>();
</script>

<template>
  <UTooltip :text="props.label"
    ><span class="decoration-dotted	 underline text-semibold"><slot/></span></UTooltip
  >
</template>
