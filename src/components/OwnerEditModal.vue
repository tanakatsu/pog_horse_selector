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
          <div>
            No <input v-model="new_owner_no" :disabled="processing" type="number">
          </div>
          <slot/>
        </div>
        <footer class="modal-footer">
          <slot name="footer">
            <button @click="onDeleteOwnerClicked" :disabled="processing">Delete</button>
            <button @click="updateOwner" :disabled="processing || (new_owner_name === owner.name && String(new_owner_no || '') === String(owner.no || ''))">Update</button>
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
      new_owner_name: null,
      new_owner_no: null
    }
  },
  methods: {
    checkForms: function() {
      const regex = /^\d+$/
      this.errors = []
      if (this.owner.name !== this.new_owner_name && this.registered_owner_names.includes(this.new_owner_name)) {
        this.errors.push('Name is already taken.')
      }
      if (this.owner.no !== this.new_owner_no && this.new_owner_no !== '' && !regex.test(this.new_owner_no)) {
        this.errors.push('No must be number.')
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

      const ref = firebase.database().ref()
      const new_owner_name = this.new_owner_name
      const new_owner_no = this.new_owner_no ? parseInt(this.new_owner_no) : null
      let updates = {}
      if (this.owner.name !== this.new_owner_name) {
        updates[`/group/${uid}/${target_year}/${data_id}/name`] = new_owner_name
        this.owner_horses.forEach(horse => {
          const horse_data_id = horse.key
          updates[`/horse/${uid}/${target_year}/${horse_data_id}/po_name`] = new_owner_name
        })
      }
      if (this.owner.no !== this.new_owner_no) {
        updates[`/group/${uid}/${target_year}/${data_id}/no`] = new_owner_no
      }
      ref.update(updates, (err) => {
        if (err) {
          alert(err)
        }
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
          // console.log('cancelled')
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
      const ref = firebase.database().ref()
      let updates = {}
      updates[`/group/${uid}/${target_year}/${data_id}`] = null
      this.owner_horses.forEach(horse => {
        const horse_data_id = horse.key
        updates[`/horse/${uid}/${target_year}/${horse_data_id}`] = null
      })
      ref.update(updates, (err) => {
        if (err) {
          alert(err)
        }
        this.processing = false
        this.$emit('close')
      })
    },
  },
  created() {
    this.new_owner_name = this.owner.name
    this.new_owner_no = this.owner.no
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
