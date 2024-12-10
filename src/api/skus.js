// 商品规格管理模块
import axios from "~/axios";

//商品规格列表接口
export function getSkusList(page) {
  return axios.get(`/admin/skus/${page}`);
}

//增加商品规格接口
export function createSkus(data) {
  return axios.post("/admin/skus", data);
}

//修改商品规格接口
export function updateSkus(id, data) {
  return axios.post("/admin/skus/" + id, data);
}

//删除商品规格接口
export function deleteSkus(ids) {
  ids = !Array.isArray(ids) ? [ids] : ids;
  return axios.post(`/admin/skus/delete_all`, { ids });
}
//修改修改商品规格状态
export function updateSkusStatus(id,status){
    return axios.post(`/admin/skus/${id}/update_status`,{
        status
    })
}