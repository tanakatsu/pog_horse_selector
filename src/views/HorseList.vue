<template>
  <div>
    <h1>This is a {{this.$route.params.owner_name}}'s horse list page</h1>
  </div>
</template>

<script>
export default {
  name: "HorseList",
  data() {
    return {
    }
  },
}
</script>

<style scoped>
</style>
