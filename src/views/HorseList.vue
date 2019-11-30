<template>
  <div>
    <h1>This is a {{this.$route.params.owner_name}}'s horse list page</h1>

    <ul>
      <li v-for="(horse, index) in owner_horses" :key="index">
        {{ horse.po_order_no }} {{ horse.id }}
        <a href="javascript:valid(0)" @click.prevent="openModal(horse)">{{ horse.name }}</a>
        (父: {{ horse.sire }}, 母: {{ horse.mare }})
      </li>
    </ul>

    <HorseEditModal @close="closeModal" :horse="target_horse" v-if="showModal">
    </HorseEditModal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import HorseEditModal from '../components/HorseEditModal.vue'

export default {
  name: "HorseList",
  components: { HorseEditModal },
  data() {
    return {
      target_owner: null,
      target_horse: null,
      owner_horses: [],
      showModal: false
    }
  },
  methods: {
    openModal: function(horse) {
      this.target_horse = horse
      this.showModal = true
    },
    closeModal: function() {
      this.showModal = false
    },
    get_owner_horses: function() {
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
    ...mapActions([
      'fetch_data',
    ])
  },
  created() {
    this.target_owner = this.$route.params.owner_name
    this.get_owner_horses()

    // https://dev.to/viniciuskneves/watch-for-vuex-state-changes-2mgj
    this.$store.watch(
      (state) => state.selected_horses,
      () => {
        this.get_owner_horses()
      })

    this.fetch_data()
  },
  computed: {
    ...mapState([
      'selected_horses'
    ])
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
