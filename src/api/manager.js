//管理员模块
import axios from '../axios'
import { queryParams } from "~/composables/util"

//登录接口
export function login(username, password) {
   return axios.post("/admin/login", {
        username, password
   })
}

//获取管理员信息和权限菜单接口
export function getinfo(){
   return axios.post("/admin/getinfo")
}

//退出登录
export function logout(){
   return axios.post("/admin/logout")
}

//修改密码
export function updatepassword(data){
   return axios.post("/admin/updatepassword", data)
}

//获取管理员信息
export function getManagerList(page,query = {}){
   let r = queryParams(query)
   return axios.get(`/admin/manager/${page}${r}`)
}

//修改状态
export function updateManagerStatus(id,status){
   return axios.post(`/admin/manager/${id}/update_status`,{status})
}


//新增
export function createManager(data){
   return axios.post(`/admin/manager`,data)
}

//修改
export function updateManager(id,data){
   return axios.post(`/admin/manager/${id}`,data)
}

//删除 
export function deleteManager(id){
   return axios.post(`/admin/manager/${id}/delete`)
}