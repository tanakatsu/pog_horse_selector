<template>
  <div>
    <h1>My Group</h1>
    <div>
      <ul>
        <li v-for="(owner, index) in sorted_owners" :key="index">
          <router-link :event="''" @click.native.prevent="openModal(owner)" to="">{{ owner.name }}</router-link>
        </li>
      </ul>
      <input type="textbox" v-model="new_ownername" :disabled="processing" placeholder="オーナー名"/>
      <button @click="addOwner" :disabled="new_ownername === '' || processing">Add</button>
    </div>
    <OwnerEditModal @close="closeModal" :owner="target_owner" :registered_owner_names="registered_owner_names" v-if="showModal">
    </OwnerEditModal>
  </div>
</template>

<script>
import firebase from 'firebase'
import { mapActions, mapGetters } from 'vuex'
import OwnerEditModal from '../components/OwnerEditModal.vue'

export default {
  components: { OwnerEditModal },
  data() {
    return {
      new_ownername: "",
      target_owner: null,
      registered_owner_names: [],
      processing: false,
      showModal: false,
    }
  },
  methods: {
    addOwner: function() {
      const currentUser = firebase.auth().currentUser
      const uid = currentUser.uid
      const target_year = this.$target_year
      const newOwner = {name: this.new_ownername}

      this.processing = true
      firebase.database().ref('group').child(uid).child(target_year).push(newOwner, (err) => {
        this.processing = false

        if (err) {
          alert(err)
        } else {
          this.new_ownername = ""
        }
      })
    },
    openModal: function(owner) {
      this.target_owner = owner
      this.registered_owner_names = this.sorted_owners.map(o => o.name)
      this.showModal = true
    },
    closeModal: function() {
      this.showModal = false
    },
    ...mapActions([
      'fetch_data',
    ])
  },
  created() {
    this.fetch_data()
  },
  computed: {
    ...mapGetters([
      'sorted_owners'
    ])
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
