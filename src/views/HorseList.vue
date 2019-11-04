<template>
  <div>
    <h1>This is a {{this.$route.params.owner_name}}'s horse list page</h1>

    <ul>
      <li v-for="(horse, index) in owner_horses" :key="index">
        {{ horse.po_order_no }} {{ horse.id }} {{ horse.name }}
        (父: {{ horse.sire }}, 母: {{ horse.mare }})
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "HorseList",
  data() {
    return {
      selected_horses: [],
      target_owner: null,
      owner_horses: []
    }
  },
  created() {
    this.selected_horses = this.$selected_horses
    this.target_owner = this.$route.params.owner_name
    this.owner_horses = this.selected_horses.filter(horse => {
      if (horse.po_name === this.target_owner) {
        return true
      } else {
        return false
      }
    })
    this.owner_horses = this.owner_horses.sort((horse1, horse2) => {
      return horse1.po_order_no - horse2.po_order_no
    })
  },
}
</script>

<style scoped>
</style>
