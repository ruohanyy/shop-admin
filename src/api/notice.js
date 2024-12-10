//公告管理模块
import axios from "~/axios";

//公告列表接口
export function getNoticeList(page) {
  return axios.get(`/admin/notice/${page}`);
}

//新增接口
export function createNotice(data) {
  return axios.post("/admin/notice", data);
}

//修改接口
export function updateNotice(id,data){
  return axios.post("/admin/notice/"+id,data)
}

//删除接口
export function deleteNotice(id){
  return axios.post(`/admin/notice/${id}/delete`)
}
