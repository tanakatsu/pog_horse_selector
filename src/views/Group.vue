<template>
  <v-container>
    <v-row class="justify-center mt-2">
      <v-col
        class="mb-5"
        cols="6"
        >
        <v-card>
          <v-card-title>
            My Group
            <v-spacer />
            <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line />
          </v-card-title>

          <v-btn fab x-small class="mx-2" @click="add">
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>

          <v-data-table
            :headers="headers"
            :items="sorted_owners"
            :items-per-page="7"
            :search="search"
            sort-by="no"
            :sort-desc="true"
            class="elevation-1"
            >
            <template v-slot:top>
              <v-dialog v-model="showInputDialog" max-width="500px">
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field v-model="owner.name" label="名前" required />
                        </v-col>
                        <v-col cols="6">
                          <v-text-field v-model.number="owner.no" type="number" label="No" />
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <div class="text-center" v-show="processing">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn @click="closeInputDialog">閉じる</v-btn>
                    <v-btn v-if="isPersistedOwner" class="primary" @click="updateOwner" :disabled="owner.name === ''">更新する</v-btn>
                    <v-btn v-else class="primary" @click="addOwner" :disabled="owner.name ===''">追加する</v-btn>
                    <v-spacer />
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="showConfirmDialog" max-width="500px">
                <v-card>
                  <v-card-title>
                    確認
                  </v-card-title>
                  <v-card-text>
                    <div>登録馬{{current_owner_horses.length}}頭が削除されますがよいですか?</div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" text @click="closeConfirmDialog">キャンセル</v-btn>
                    <v-btn color="primary" text @click="doDelete">はい</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon small @click="edit(item)">mdi-pencil</v-icon>
              <v-icon small @click="remove(item)">mdi-delete</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from 'firebase'
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      owner: {},
      orig_owner: {},
      current_owner_horses: [],
      search: null,
      showInputDialog: false,
      showConfirmDialog: false,
      headers: [
        { text: '名前', value: 'name' },
        { text: 'No', value: 'no' },
        { text: '操作', value: 'actions' }
      ],
      processing: false,
    }
  },
  methods: {
    add() {
      const aryMax = function(a, b) { return Math.max(a, b) }
      const no_list = this.sorted_owners.map(o => o.no).filter(no => no)
      const last_no = no_list.length ? no_list.reduce(aryMax) + 1 : 1
      this.owner = {name: null, no: last_no}
      this.showInputDialog = true
    },
    edit(owner) {
      this.owner = Object.assign({}, owner)
      this.orig_owner = Object.assign({}, owner)
      this.showInputDialog = true
    },
    remove(owner) {
      this.owner = Object.assign({}, owner)
      this.orig_owner = Object.assign({}, owner)

      this.current_owner_horses = this.ownerHorses[this.orig_owner.name] || []
      if (this.current_owner_horses.length > 0) {
        this.showConfirmDialog = true
      } else {
        this.deleteOwner()
      }
    },
    addOwner: function() {
      const currentUser = firebase.auth().currentUser
      const uid = currentUser.uid
      const target_year = this.$target_year
      const payload = this.owner

      this.processing = true
      firebase.database().ref('group').child(uid).child(target_year).push(payload, (err) => {
        this.processing = false

        if (err) {
          alert(err)
        }

        this.owner = {}
        this.closeInputDialog()
      })
    },
    updateOwner() {
      const data_id = this.owner.key
      const currentUser = firebase.auth().currentUser
      const uid = currentUser.uid
      const target_year = this.$target_year
      const ref = firebase.database().ref()
      const new_owner_name = this.owner.name
      const new_owner_no = this.owner.no ? parseInt(this.owner.no) : null

      this.processing = true
      this.current_owner_horses = this.ownerHorses[this.orig_owner.name] || []
      let updates = {}
      if (this.orig_owner.name !== this.new_owner_name) {
        updates[`/group/${uid}/${target_year}/${data_id}/name`] = new_owner_name
        this.current_owner_horses.forEach(horse => {
          const horse_data_id = horse.key
          updates[`/horse/${uid}/${target_year}/${horse_data_id}/po_name`] = new_owner_name
        })
      }
      if (this.orig_owner.no !== this.new_owner_no) {
        updates[`/group/${uid}/${target_year}/${data_id}/no`] = new_owner_no
      }
      ref.update(updates, (err) => {
        if (err) {
          alert(err)
        }
        this.processing = false
        this.closeInputDialog()
      })
    },
    deleteOwner() {
      const data_id = this.owner.key
      this.processing = true

      const currentUser = firebase.auth().currentUser
      const uid = currentUser.uid
      const target_year = this.$target_year
      const ref = firebase.database().ref()
      this.current_owner_horses = this.ownerHorses[this.orig_owner.name] || []

      let updates = {}
      updates[`/group/${uid}/${target_year}/${data_id}`] = null
      this.current_owner_horses.forEach(horse => {
        const horse_data_id = horse.key
        updates[`/horse/${uid}/${target_year}/${horse_data_id}`] = null
      })
      ref.update(updates, (err) => {
        if (err) {
          alert(err)
        }
        this.processing = false
      })
    },
    closeInputDialog: function() {
      this.showInputDialog = false
      this.owner = {}
    },
    closeConfirmDialog: function() {
      this.showConfirmDialog = false
    },
    doDelete: function() {
      this.closeConfirmDialog()
      this.deleteOwner()
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
      'sorted_owners',
      'ownerHorses'
    ]),
    isPersistedOwner() {
      return this.owner.key
    },
    formTitle() {
      return this.isPersistedOwner ? 'オーナー編集' : 'オーナー追加'
    }
  },
  watch: {
  }
}
</script>

<style scoped>
</style>
