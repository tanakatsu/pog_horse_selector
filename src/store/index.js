import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selected_horses: [],
    owners: [],
    fetch_done: false,
  },
  getters: {
    ownerHorseCount: state => {
      const horse_cnt = state.selected_horses.reduce((acc, val) => {
        if (acc[val.po_name]) {
          acc[val.po_name] += 1
        } else {
          acc[val.po_name] = 1
        }
        return acc
      }, {})
      return horse_cnt
    },
    ownerHorseLastNo: state => {
      const horse_last_no = state.selected_horses.reduce((acc, val) => {
        if (acc[val.po_name]) {
          if (acc[val.po_name] < val.po_order_no) {
            acc[val.po_name] = val.po_order_no
          }
        } else {
          acc[val.po_name] = val.po_order_no
        }
        return acc
      }, {})
      return horse_last_no
    },
    ownerHorses: state => {
      const owner_horses = state.selected_horses.reduce((acc, val) => {
        if (acc[val.po_name]) {
          acc[val.po_name].push(val)
        } else {
          acc[val.po_name] = [val]
        }
        return acc
      }, {})
      return owner_horses
    },
    sorted_owners: state => {
      return state.owners.sort(function(a, b) {
        if (Number.isInteger(a.no) && Number.isInteger(b.no)) {
          return a.no - b.no
        } else if (Number.isInteger(a.no)) {
          return -1
        } else if (Number.isInteger(b.no)) {
          return 1
        } else {
          return 0
        }
      })
    }
  },
  mutations: {
    add_horse(state, payload) {
      const index = state.selected_horses.findIndex((v) => v.key === payload.key)
      if (index < 0) {
        state.selected_horses.push(payload)
      }
    },
    update_horse(state, payload) {
      // forEachでもよい?
      state.selected_horses = state.selected_horses.map((v) => {
        if (v.key === payload.key) {
          v = payload
        }
        return v
      })
    },
    remove_horse(state, key) {
      const index = state.selected_horses.findIndex((v) => v.key === key)
      if (index >= 0) {
        state.selected_horses.splice(index, 1)
      }
    },
    add_owner(state, payload) {
      const index = state.owners.findIndex((v) => v.key === payload.key)
      if (index < 0) {
        state.owners.push(payload)
      }
    },
    update_owner(state, payload) {
      // forEachでもよい?
      state.owners = state.owners.map((v) => {
        if (v.key === payload.key) {
          v = payload
        }
        return v
      })
    },
    remove_owner(state, key) {
      const index = state.owners.findIndex((v) => v.key === key)
      if (index >= 0) {
        state.owners.splice(index, 1)
      }
    },
    clear_data(state) {
      state.selected_horses.length = 0
      state.owners.length = 0
    },
    set_fetch_flag(state, flag) {
      state.fetch_done = flag
    }
  },
  actions: {
    add_horse ({ commit }, payload) {
      // keyのチェックはactionsの中でやったほうがよい?
      commit('add_horse', payload)
    },
    update_horse ({ commit }, payload) {
      commit('update_horse', payload)
    },
    remove_horse ({ commit }, key) {
      commit('delete_horse', key)
    },
    add_owner ({ commit }, payload) {
      commit('add_owner', payload)
    },
    update_owner ({ commit }, payload) {
      commit('update_owner', payload)
    },
    remove_owner ({ commit }, key) {
      commit('delete_owner', key)
    },
    clear_data ({ commit }) {
      commit('clear_data')
      commit('set_fetch_flag', false)
    },
    fetch_data ({ commit, state }) {
      if (state.fetch_done) {
        return
      }
      const currentUser = firebase.auth().currentUser
      const target_year = this._vm.$target_year // https://github.com/vuejs/vuex/issues/1399
      const ref_horse = firebase.database().ref('horse').child(currentUser.uid).child(target_year)
      ref_horse.on('child_added', function(snap) {
        const horse = snap.val()
        commit('add_horse', {...horse, key: snap.key})
      })
      ref_horse.on('child_removed', function(snap) {
        commit('remove_horse', snap.key)
      })
      ref_horse.on('child_changed', function(snap) {
        const horse = snap.val()
        commit('update_horse', {...horse, key: snap.key})
      })

      const ref_group = firebase.database().ref('group').child(currentUser.uid).child(target_year)
      ref_group.on('child_added', function(snap) {
        const owner = snap.val()
        commit('add_owner', {...owner, key: snap.key})
      })
      ref_group.on('child_removed', function(snap) {
        commit('remove_owner', snap.key)
      })
      ref_group.on('child_changed', function(snap) {
        const owner = snap.val()
        commit('update_owner', {...owner, key: snap.key})
      })

      commit('set_fetch_flag', true)
    }
  },
  modules: {
  }
})
