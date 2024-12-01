<template>
  <div>
    <Nav v-model="yearNav" />
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

      <div class="flex gap-4 flex-col">
        <UCard v-for="result of resultData.hits" :key="result.id">
          <template #header>
            <div class="flex justify-between">
              <h2 class=" font-bold text-xl">
                {{ upperFirst(result.type) }} {{ result.name }}
              </h2>
              <UButton
                size="sm"
                variant="outline"
                icon="heroicons-solid:share"
                @click="share(result)"
              ></UButton>
            </div>
          </template>
          <div class="prose max-w-7/8" v-html="result.text"></div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
import { upperFirst } from "scule";
import { watch } from "vue";
const route = useRoute();
const validYears = useYears();
if (!validYears.includes(route.params.year)) {
  await navigateTo(`/${validYears[0]}`);
}
const query = ref("");
const semanticEnabled = ref(true);
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

const { data, status, error, clear } = await useFetch("/api/search", {
  query: {
    year: year.value,
    query: query.value,
    semantic: semanticEnabled.value,
  },
});
const resultData = ref(data);
resultData.value = data.value;
const refresh = async (value) => {
  resultData.value = await $fetch("/api/search", {
    query: {
      year: year.value,
      query: query.value,
      semantic: semanticEnabled.value,
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
      `https://frctools.com/${year.value.value}/rule/${result.name}`
    );
  }
};

watch(query, refresh);
watch(semanticEnabled, refresh);
</script>
<style>
.prose > *:is([style*="text-indent:-.25in"]) {
   text-indent: revert !important;
}

</style>