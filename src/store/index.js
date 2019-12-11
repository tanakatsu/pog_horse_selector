import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selected_horses: [],
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
    clear_data(state) {
      state.selected_horses.length = 1
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
    clear_data ({ commit }) {
      const ref_horse = firebase.database().ref('horse')
      ref_horse.off('child_added')
      ref_horse.off('child_removed')
      ref_horse.off('child_changed')
      commit('clear_data')
      commit('set_fetch_flag', false)
    },
    fetch_data ({ commit, state }) {
      if (state.fetch_done) {
        return
      }
      const currentUser = firebase.auth().currentUser
      const target_year = this._vm.$target_year // https://github.com/vuejs/vuex/issues/1399
      const path = 'horse/' + currentUser.uid + '/' + target_year
      const ref_horse = firebase.database().ref(path)
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
      commit('set_fetch_flag', true)
    }
  },
  modules: {
  }
})
