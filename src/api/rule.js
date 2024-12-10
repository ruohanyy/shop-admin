//权限管理模块
import axios from "~/axios";

//权限列表接口
export function getRuleList(page) {
  return axios.get(`/admin/rule/${page}`);
}

//新增接口
export function createRule(data) {
  return axios.post("/admin/rule", data);
}

//修改接口
export function updateRule(id, data) {
  return axios.post("/admin/rule/" + id, data);
}

//修改菜单权限状态
export function updateRuleStatus(id, status) {
  return axios.post(`/admin/rule/${id}/update_status`, {
    status,
  });
}

//删除接口
export function deleteRule(id) {
  return axios.post(`/admin/rule/${id}/delete`);
}
