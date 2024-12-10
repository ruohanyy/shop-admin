//图库模块
import axios from "../axios";

//图库列表接口
export function getImageClassList(page) {
  return axios.get("/admin/image_class/" + page);
}

//增加图库分类接口
export function createImageClass(data){
  return axios.post("/admin/image_class",data)
}
//修改图库分类接口
export function updateImageClass(id,data){
  return axios.post("/admin/image_class/"+id,data)
}

//删除图库分类接口
export function deleteImageClass(id){
  return axios.post(`/admin/image_class/${id}/delete`)
}