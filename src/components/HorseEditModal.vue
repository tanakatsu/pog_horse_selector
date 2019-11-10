<template>
  <transition name="modal" appear>
    <div class="modal modal-overlay" @click.self="$emit('close')">
      <div class="modal-window">
        <div class="modal-content">
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
            <button @click="updateHorse" :disabled="processing">Update</button>
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
    }
  },
  methods: {
    updateHorse: function() {
      const data_id = this.target_horse.key
      this.processing = true

      firebase.database().ref('horse/' + data_id).update({
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

      firebase.database().ref('horse/' + data_id).remove((err) => {
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
