import { ElNotification, ElMessageBox  } from "element-plus";
import nprogress from 'nprogress'

//封装消息提示 使用方法toast("请注意，这是一个警告！", "success");
export function toast(message , type = "success",dangerouslyUseHTMLString = false) {
  return ElNotification({
    message,
    type,
    dangerouslyUseHTMLString,
    duration: 3000,
  })
}

//封装弹出框 使用方法 showModal("自定义内容", "自定义标题", { type: 'success' }); 
export function showModal(content = "提示内容" ,title = '') {
  return ElMessageBox.confirm(
    content,
    title,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
}

//显示全屏loading
export function showFullLoading() {
  nprogress.start()
}
//隐藏全屏loading
export function hideFullLoading() {
  nprogress.done()
}

//封装重命名弹出输入框
export function showPrompt(tip, value = "") {
  return ElMessageBox.prompt(tip, '', {
    onfirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue:value
  })
}

// 将query对象转成url参数
export function queryParams(query){
  let q = []
  for (const key in query) {
      if(query[key]){
          q.push(`${key}=${encodeURIComponent(query[key])}`)
      }
  }
  let r = q.join("&")
  r = r ? ("?"+r) : ""
  return r
}

// 上移
export function useArrayMoveUp(arr,index){
  swapArray(arr,index,index - 1)
}

// 下移
export function useArrayMoveDown(arr,index){
  swapArray(arr,index,index + 1)
}

function swapArray(arr,index1,index2){
  arr[index1] = arr.splice(index2,1,arr[index1])[0]
  return arr
}

// sku排列算法
export function cartesianProductOf() {
  return Array.prototype.reduce.call(arguments, function (a, b) {
      var ret = [];
      a.forEach(function (a) {
          b.forEach(function (b) {
              ret.push(a.concat([b]));
          });
      });
      return ret;
  }, [
      []
  ]);
}