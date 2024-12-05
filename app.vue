<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>
<script setup>
onMounted(() => {
  if (
    window &&
    !localStorage.getItem("bingo-25-shown") &&
    new Date().getTime() > 1735102800000
  ) {
    // christmas 2024
    const toast = useToast().add({
      title: "Kickoff Bingo",
      description: `Check out kickoff bingo!`,
      icon: "i-lucide-calendar-days",
      duration: 0,
      actions: [
        {
          icon: "i-lucide-square-arrow-out-up-right",
          label: "Go to bingo",
          color: "neutral",
          variant: "outline",
          onClick: async (e) => {
            e?.stopPropagation();
            localStorage.setItem("bingo-25-shown", true);
            await navigateTo("/bingo");

          },
        },
      ],
    });
  }
});
</script>
