// 首页模块
import axios from "../axios";

//后台首页统计1
export function statistics1() {
  return axios.get("/admin/statistics1");
}

//后台首页统计2
export function statistics2() {
  return axios.get("/admin/statistics2");
}

//后台首页统计3
export function statistics3(type) {
  return axios.get("/admin/statistics3?type=" + type);
}
