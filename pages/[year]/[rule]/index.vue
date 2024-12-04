<template>
  <div>
    <Nav v-model="yearNav" />
    <UContainer class="flex flex-col gap-4 mt-4" v-if="!error">
      <UBreadcrumb :items="items" />

      <div v-html="data.text" class="prose max-w-full"></div
    ></UContainer>
    <UContainer class="flex flex-col gap-4 mt-4" v-else>
      <div
          class="flex flex-col items-center justify-center flex-1 px-6 py-14 sm:px-14"
        >
          <UIcon
            name="heroicons:exclamation-circle"
            class="size-10 mx-auto text-gray-400 dark:text-gray-500 mb-4"
          ></UIcon>
   

          <p class="text-sm text-center text-gray-900 dark:text-white">
            Something went wrong
          </p>
        </div>
    </UContainer>
  </div>
</template>

<script setup>
import {upperFirst} from 'scule'
const route = useRoute();
const validYears = useYears();
if (!validYears.includes(route.params.year)) {
  await navigateTo(`/${validYears[0]}`);
}
const year = ref(route.params.year);
const yearNav = computed({
  get: () =>
    useYearsNav().find((val) => {
      return val.value == year.value;
    }),
  set: (value) => {
    year.value = value.value;
  },
});

const rule = ref(route.params.rule);
const { data, status, error, clear } = await useFetch("/api/rule", {
  query: {
    year: year.value,
    query: rule.value,
  },
});
const items = computed(() => {
    return [
      {
        label: "Home",
        to: "/",
        icon: 'i-lucide-house'

      },
      {
        label: year.value,
        to: `/${year.value}`,
        icon: 'i-lucide-calendar'

      },
      {
        label: `${upperFirst(data.value.type)} ${data.value.name}`,
        to: `/${year.value}/${rule.value}`,
      },
    ];
  },
);
</script>

<style></style>
