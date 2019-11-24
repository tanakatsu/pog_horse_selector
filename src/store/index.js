import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    selected_horses: [],
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
  },
  modules: {
  }
})
