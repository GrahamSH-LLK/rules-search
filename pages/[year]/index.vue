<template>
  <div>
    <Nav v-model="yearNav" page="Search" />
    <UContainer class="pt-4 flex flex-col gap-4">
      <div class="flex justify-between gap-2 items-center">
        <UInput
          placeholder="Search..."
          class="flex-1 shrink"
          size="lg"
          v-model="query"
        />
        <UCheckbox
          v-model="semanticEnabled"
          label="Semantic search"
          size="xl"
        />
      </div>
      <div
        v-if="!resultData.hits.length || loading"
        class="flex justify-center items-center"
      >
        <div
          class="flex flex-col items-center justify-center flex-1 px-6 py-14 sm:px-14"
        >
          <UIcon
            name="heroicons:circle-stack-20-solid"
            class="size-10 mx-auto text-gray-400 dark:text-gray-500 mb-4"
            v-if="!loading"
          ></UIcon>
          <UIcon
            name="heroicons:arrow-path-20-solid"
            class="size-10 mx-auto text-gray-400 dark:text-gray-500 mb-4 animate-spin"
            v-else
          ></UIcon>

          <p class="text-sm text-center text-gray-900 dark:text-white">
            <span v-if="!query.length"
              >Nothing yet.
              <span
                class="bold text-blue-400 cursor-pointer"
                @click="randomSearch"
                >Search something!</span
              ></span
            >
            <span v-else-if="!loading"
              >No results found for "{{ query }}".</span
            >
            <span v-else>Loading...</span>
          </p>
        </div>
      </div>
      <div class="flex gap-4 flex-col" v-if="!loading">
        <UCard v-for="result of resultData.hits" :key="result.id">
          <template #header>
            <div class="flex justify-between">
              <NuxtLink
                class="font-bold text-xl"
                :to="`/${year}/rule/${result.name}`"
              >
                {{ upperFirst(result.type) }} {{ result.name }}
              </NuxtLink>
              <UButton
                size="sm"
                variant="outline"
                icon="heroicons-solid:share"
                @click="share(result)"
              ></UButton>
            </div>
          </template>
          <div
            class="prose max-w-full dark:prose-invert overflow-x-auto"
            v-html="result.text"
          ></div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
import { upperFirst } from "scule";
import { watch } from "vue";
import { useRouteQuery } from "@vueuse/router";
const route = useRoute();
const validYears = useYears();
if (!validYears.includes(route.params.year)) {
  await navigateTo(`/${validYears[0]}`);
}
const query = useRouteQuery("query", "");
const semanticEnabled = useRouteQuery("semantic", true);
const year = ref(route.params.year);
const loading = ref(false);

const yearNav = computed({
  get: () =>
    useYearsNav().find((val) => {
      return val.value == year.value;
    }),
  set: (value) => {
    year.value = value.value;
  },
});

const { data, status, error, clear } = await useFetch("/api/search", {
  query: {
    year: year.value,
    query: query.value,
    semantic: semanticEnabled.value,
  },
  onResponse() {
    loading.value = false;
  },
});
const resultData = ref(data);
resultData.value = data.value;
const refresh = async (value) => {
  loading.value = true;

  resultData.value = await $fetch("/api/search", {
    query: {
      year: year.value,
      query: query.value,
      semantic: semanticEnabled.value,
    },
    onResponse() {
      useTrackEvent(semanticEnabled.value ? "semantic_search" : "search");
      loading.value = false;
    },
  });
};
const share = async (result) => {
  const shareData = {
    title: `${upperFirst(result.type)} ${result.name}`,
    text: `Learn about rule ${result.name}`,
    url: `https://frctools.com/${year.value}/rule/${result.name}`,
  };
  if (navigator.share && navigator.canShare(shareData)) {
    navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(
      `https://frctools.com/${year.value.value}/rule/${result.name}`,
    );
  }
};
const randomSearches = [
  "batteries",
  "wire gauge",
  "scoring",
  "wiring",
  "event rules",
  "alliance selection",
  "extension limits",
  "game piece",
];
const randomSearch = () => {
  query.value =
    randomSearches[Math.floor(Math.random() * randomSearches.length - 1)];
};
watch(query, refresh);
watch(semanticEnabled, refresh);
useSeoMeta({
  title: `Search the manual`,
});
</script>
<style>
html {
  scrollbar-gutter: stable;
}
.prose > *:is([style*="text-indent:-.25in"]) {
  text-indent: revert !important;
}
</style>
