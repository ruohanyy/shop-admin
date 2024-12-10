// 角色管理模块
import axios from "~/axios";

//角色列表接口
export function getRoleList(page) {
  return axios.get(`/admin/role/${page}`);
}

//添加角色接口
export function createRole(data) {
  return axios.post("/admin/role", data);
}

//修改接口
export function updateRole(id, data) {
  return axios.post("/admin/role/" + id, data);
}

//删除接口 http://ceshi13.dishait.cn
export function deleteRole(id) {
  return axios.post(`/admin/role/${id}/delete`);
}

//修改角色状态
export function updateRoleStatus(id, status) {
  return axios.post(`/admin/role/${id}/update_status`, {
    status,
  });
}

//配置角色权限
export function setRoleRules(id, rule_ids) {
  return axios.post(`/admin/role/set_rules`, { id, rule_ids });
}
