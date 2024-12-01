<template>
  <header
    class="w-full border-b border-b-1 border-blue-400 bg-blue-50/50 backdrop-blur"
  >
    <div
      class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between gap-3 h-[var(--ui-header-height)]"
    >
      <h1 class="font-bold font-display text-3xl text-blue-950">FRCTools</h1>
      <div>
        <USelectMenu :items="validYears" v-model="year">
          <template #leading="{ modelValue, ui }">
            <span v-if="modelValue" class="size-5 text-center">
              {{ modelValue?.emoji }}
            </span>
          </template>
          <template #item-leading="{ item }">
            <span class="size-5 text-center">
              {{ item.emoji }}
            </span>
          </template>
        </USelectMenu>
      </div>
    </div>
  </header>
</template>
<script setup>
const validYears = useYearsNav();
const year = defineModel();
watch(year, async (value)=> {
   await navigateTo(`/${value.value}`)

})
</script>
