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
import firebase from 'firebase'
import HorseEditModal from '../components/HorseEditModal.vue'

export default {
  name: "HorseList",
  components: { HorseEditModal },
  data() {
    return {
      selected_horses: [],
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
    childAdded: function(snap) {
      const horse = snap.val()
      const index = this.selected_horses.findIndex((v) => v.key === snap.key)

      if (index < 0) {
        this.selected_horses.push({...horse, key: snap.key})
        this.$selected_horses = this.selected_horses
      }
    },
    childRemoved: function(snap) {
      const index = this.selected_horses.findIndex((v) => v.key === snap.key)
      if (index >= 0) {
        this.selected_horses.splice(index, 1)
        this.$selected_horses = this.selected_horses
      }
    },
    childChanged: function(snap) {
      const horse = snap.val()
      this.selected_horses = this.selected_horses.map((v) => {
        if (v.key === snap.key) {
          v = Object.assign(v, horse)
        }
        return v
      })
      this.$selected_horses = this.selected_horses
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
    }
  },
  created() {
    this.selected_horses = this.$selected_horses
    this.target_owner = this.$route.params.owner_name

    this.get_owner_horses()

    const ref_horse = firebase.database().ref('horse')
    ref_horse.on('child_added', this.childAdded)
    ref_horse.on('child_removed', this.childRemoved)
    ref_horse.on('child_changed', this.childChanged)
  },
  watch: {
    selected_horses: function() {
      this.get_owner_horses()
    }
  }
}
</script>

<style scoped>
</style>
