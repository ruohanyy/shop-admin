import axios from "../axios";

//指定分类下的图片列表接口http://ceshi13.dishait.cn
export function getImageList(id,page = 1){
  return axios.get(`/admin/image_class/${id}/image/${page}`)
}

//重命名图片接口
export function updateImage(id, name){
  return axios.post(`/admin/image/${id}`, {name})
}

//删除图片接口
export function deleteImage(ids){
  return axios.post(`/admin/image/delete_all`, {ids})
}

//上传图片接口
export const uploadImageAction = "/api/admin/image/upload"