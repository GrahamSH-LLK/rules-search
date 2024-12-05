<template>
  <UModal>
    <template #body>
      Congratulations for winning 2025 bingo! Make sure to check out our <a class="bold text-blue-400" @click="navigate" href="#">rule search</a>!
    </template>
    <template #footer>
      <UButton color="neutral" label="Keep playing" @click="modal.close()" />
    </template>
  </UModal>
</template>
<script setup>
const modal = useModal();
const navigate = async () => {
   modal.close();
   await navigateTo("/");
}
</script>
