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
            名前 <input v-model="new_owner_name" :disabled="processing">
          </div>
          <slot/>
        </div>
        <footer class="modal-footer">
          <slot name="footer">
            <button @click="onDeleteOwnerClicked" :disabled="processing">Delete</button>
            <button @click="updateOwner" :disabled="processing || new_owner_name === owner.name">Update</button>
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
import { mapGetters } from 'vuex'

export default {
  props: {
    owner: {
      type: Object
    },
    registered_owner_names: {
      type: Array
    }
  },
  data() {
    return {
      processing: false,
      errors: [],
      new_owner_name: null
    }
  },
  methods: {
    checkForms: function() {
      this.errors = []
      if (this.registered_owner_names.includes(this.new_owner_name)) {
        this.errors.push('Name is already taken.')
      }
    },
    updateOwner: function() {
      // validation
      this.checkForms()
      if (this.errors.length) {
        return
      }

      const data_id = this.owner.key
      const currentUser = firebase.auth().currentUser
      const uid = currentUser.uid
      const target_year = this.$target_year

      this.processing = true

      firebase.database().ref('group').child(uid).child(target_year).child(data_id).update({
        name: this.new_owner_name,
      }, (err) => {
        if (err) {
          alert(err)
        }
        this.updateHorses(this.new_owner_name) // TODO: トランザクション
        this.processing = false
        this.$emit('close')
      })
    },
    onDeleteOwnerClicked: function() {
      if (this.owner_horses.length > 0) {
        this.$dialog
        .confirm({
          title: 'Confirmation',
          body: `登録馬${this.owner_horses.length}頭が削除されますがよいですか?`
        },{
          okText: 'はい',
          cancelText: 'キャンセル',
        })
        .then(function() {
          this.deleteOwner()
        })
        .catch(function() {
          console.log('cancelled')
        });
      } else {
        this.deleteOwner()
      }
    },
    deleteOwner: function() {
      const data_id = this.owner.key
      this.processing = true

      const currentUser = firebase.auth().currentUser
      const uid = currentUser.uid
      const target_year = this.$target_year
      firebase.database().ref('group').child(uid).child(target_year).child(data_id).remove((err) => {
        if (err) {
          alert(err)
        }
        this.deleteHorses() // TODO: トランザクション
        this.processing = false
        this.$emit('close')
      })
    },
    deleteHorses: function() {
      const currentUser = firebase.auth().currentUser
      const target_year = this.$target_year

      this.owner_horses.forEach(horse => {
        const data_id = horse.key
        firebase.database().ref('horse').child(currentUser.uid).child(target_year).child(data_id).remove((err) => {
          if (err) {
            alert(err)
          }
          // alert(`deleted ${horse.name}`)
        })
      })
    },
    updateHorses: function(newOwnerName) {
      const currentUser = firebase.auth().currentUser
      const target_year = this.$target_year

      this.owner_horses.forEach(horse => {
        const data_id = horse.key
        firebase.database().ref('horse').child(currentUser.uid).child(target_year).child(data_id).update({
          po_name: newOwnerName
        }, (err) => {
          if (err) {
            alert(err)
          }
          // alert(`updated ${horse.name}`) // TODO: トランザクション
        })
      })
    },
  },
  created() {
    this.new_owner_name = this.owner.name
    this.owner_horses = this.ownerHorses[this.owner.name] || []
  },
  computed: {
    ...mapGetters([
      'ownerHorses'
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
