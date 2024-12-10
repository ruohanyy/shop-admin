import { createStore } from 'vuex'
import { login, getinfo,logout } from "../api/manager";
import { setToken,removeToken } from "~/composables/auth";

// 创建一个新的 store 实例
const store = createStore({
  state () {
    return {
        //用户信息
      user: {},
      //侧边导航栏宽度
      asideWidth: "250px",
      menus: [],
      ruleNames: [],
      hasGetInfo: false
    }
  },
  mutations: {
    //记录用户信息
    SET_USERINFO(state, user) {
      state.user = user
      state.hasGetInfo = false
    },
    //控制菜单导航栏缩放
    handleAsideWidth(state) {
      state.asideWidth = state.asideWidth == "250px" ? "64px" : "250px"
    },
    //菜单导航栏数据
    SET_MENUS(state, menus) {
      state.menus = menus
    },
    SET_RULENAMES(state, ruleNames) {
      state.ruleNames = ruleNames
    }
  },
  actions: {
    //登录接口数据
    login({ commit }, {username, password}) {
        return new Promise((resolve, reject) => {
            login(username,password).then((res) => {
                setToken(res.token)
                resolve(res)
            }).catch((err) => {
                reject(err)
            })
        })
    },
    //获取登录用户信息
    getinfo({ commit }) {
        return new Promise((resolve, reject) => {
          getinfo().then((res) => {
                commit("SET_USERINFO", res)
                // console.log(res);
                commit("SET_MENUS", res.menus)
                commit("SET_RULENAMES", res.ruleNames)
                resolve(res)
              }).catch((err) => {
                reject(err)
              })
        })
    },
    // 退出登录
    logout({ commit }) {
        //清除token
        removeToken()
        //清空用户数据 user
        commit("SET_USERINFO", {})
    }
  }
})

export default store