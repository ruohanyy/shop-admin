//优惠券管理模块
import axios from "~/axios";

//优惠券列表接口
export function getCouponList(page) {
  return axios.get(`/admin/coupon/${page}`);
}

//新增接口
export function createCoupon(data) {
  return axios.post("/admin/coupon", data);
}

//修改接口
export function updateCoupon(id, data) {
  return axios.post("/admin/coupon/" + id, data);
}

//删除接口
export function deleteCoupon(id) {
  return axios.post(`/admin/coupon/${id}/delete`);
}

//失效优惠券接口
export function updateCouponStatus(id) {
  return axios.post(`/admin/coupon/${id}/update_status`, { status: 0 });
}
