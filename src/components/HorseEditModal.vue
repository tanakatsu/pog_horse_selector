<template>
  <transition name="modal" appear>
    <div class="modal modal-overlay" @click.self="$emit('close')">
      <div class="modal-window">
        <div class="modal-content">
          <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
              <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
          </p>
          <div>
            ID <input v-model="target_horse.id" :disabled="processing">
          </div>
          <div>
            馬名 <input v-model="target_horse.name" :disabled="processing">
          </div>
          <div>
            父 <input v-model="target_horse.sire" :disabled="processing">
          </div>
          <div>
            母 <input v-model="target_horse.mare" :disabled="processing">
          </div>
          <div>
            No <input v-model="target_horse.po_order_no" type="number" :disabled="processing">
          </div>
          <slot/>
        </div>
        <footer class="modal-footer">
          <slot name="footer">
            <button @click="deleteHorse" :disabled="processing">Delete</button>
            <button @click="updateHorse" :disabled="!this.validateHorseName(target_horse.name) || !this.validateMareName(target_horse.mare) || processing">Update</button>
            <button @click="$emit('close')" :disabled="processing">Close</button>
            <div>
               <span v-show="processing">Processing...</span>
            </div>
          </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
import firebase from 'firebase'
import { mapState } from 'vuex'

export default {
  props: {
    horse: {
      type: Object
    }
  },
  data() {
    return {
      target_horse: null,
      processing: false,
      errors: []
    }
  },
  methods: {
    checkForms: function() {
      this.errors = []
      if (!/^\d{10}$/g.test(this.target_horse.id)) {
        this.errors.push('ID is invalid')
      }
    },
    validateHorseName: function(horseName) {
      if (horseName === '') {
        return false
      }
      if (horseName === this.temp_horse.name) {
        return true
      }
      if (this.horsename_list.includes(horseName)) {
        return false
      }
      return true
    },
    validateMareName: function(mareName) {
      if (mareName === '') {
        return false
      }
      if (mareName === this.temp_horse.mare) {
        return true
      }
      if (this.marename_list.includes(mareName)) {
        return false
      }
      return true
    },
    updateHorse: function() {
      // validation
      this.checkForms()
      if (this.errors.length) {
        return
      }

      const data_id = this.target_horse.key
      const currentUser = firebase.auth().currentUser
      const target_year = this.$target_year

      this.processing = true

      firebase.database().ref('horse').child(currentUser.uid).child(target_year).child(data_id).update({
        id: this.target_horse.id,
        name: this.target_horse.name,
        sire: this.target_horse.sire,
        mare: this.target_horse.mare,
        po_order_no: this.target_horse.po_order_no,
      }, (err) => {
        if (err) {
          alert(err)
        }
        this.processing = false
        this.$emit('close')
      })
    },
    deleteHorse: function() {
      const data_id = this.target_horse.key
      this.processing = true

      const currentUser = firebase.auth().currentUser
      const target_year = this.$target_year
      firebase.database().ref('horse').child(currentUser.uid).child(target_year).child(data_id).remove((err) => {
        if (err) {
          alert(err)
        }

        this.processing = false
        this.$emit('close')
      })
    }
  },
  created() {
    this.target_horse = this.horse
    this.temp_horse = Object.assign({}, this.horse)
    this.horsename_list = this.selected_horses.map(horse => horse.name).filter(horse => horse.name !== this.target_horse.name)
    this.marename_list = this.selected_horses.map(horse => horse.mare).filter(horse => horse.mare !== this.target_horse.mare)
  },
  computed: {
    ...mapState([
      'selected_horses'
    ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal.modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 30;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
}
.modal-window {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}
.modal-content {
  padding: 10px 20px;
}
.modal-footer {
  background: #ccc;
  padding: 10px;
  text-align: right;
  display: flex;
  justify-content: flex-end
}
/* オーバーレイのトランジション */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.4s;
}
.modal-enter-active .modal-window,
.modal-leave-active .modal-window {
  /* オーバーレイに包含されているモーダルウィンドウのトランジション */
  transition: opacity 0.4s, transform 0.4s;
}
/* ディレイを付けるとモーダルウィンドウが消えた後にオーバーレイが消える */
.modal-leave-active {
  transition: opacity 0.6s ease 0.4s;
}
.modal-enter,
.modal-leave-to {
  opacity: 0;
}
.modal-enter .modal-window,
.modal-leave-to .modal-window {
  opacity: 0;
  transform: translateY(-20px);
}
button:first-child {
  margin-right: auto;
}
</style>
