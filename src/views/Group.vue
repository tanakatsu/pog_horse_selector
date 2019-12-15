<template>
  <div>
    <h1>My Group</h1>
    <div>
      <ul>
        <li v-for="(owner, index) in owners" :key="index">
          {{ owner }}
        </li>
      </ul>
      <input type="textbox" v-model="new_ownername" :disabled="processing" placeholder="オーナー名"/>
      <button @click="addOwner" :disabled="new_ownername === '' || processing">Add</button>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import { mapActions, mapState } from 'vuex'

export default {
  data() {
    return {
      new_ownername: "",
      processing: false
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
    ...mapActions([
      'fetch_data',
    ])
  },
  created() {
    this.fetch_data()
  },
  computed: {
    ...mapState([
      'owners'
    ])
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
