<template>
    <!-- 图库列表 -->
  <el-aside width="200px" class="image-aside" v-loading="loading">
    <div class="top">
      <AsideList
        :active="activeId == item.id"
        v-for="(item, index) in list"
        :key="index"
        @edit="handleEdit(item)"
        @delete="handleDelete(item.id)"
        @click="handleChangeActiveId(item.id)"
      >
        {{ item.name }}
      </AsideList>
    </div>
    <!-- 分页 -->
    <div class="bottom">
      <el-pagination
        background
        layout="prev, next"
        :total="total"
        :current-page="currentPage"
        :page-size="limit"
        @current-change="getData"
      />
    </div>
  </el-aside>

  <!-- 修改框 -->
  <FormDrawer :title="drawerTitle" ref="formDrawerRef" @submit="handleSubmit">
    <el-form
      ref="formRef"
      style="max-width: 600px"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="排序" prop="order">
        <el-input-number v-model="form.order" :min="0" :max="1000" />
      </el-form-item>
    </el-form>
  </FormDrawer>
</template>

<script setup>
import { ref, reactive } from "vue";
import AsideList from "./AsideList.vue";
import {
  getImageClassList,
  createImageClass,
  updateImageClass,
  deleteImageClass,
} from "~/api/image_class.js";
import FormDrawer from "~/components/FormDrawer.vue";
import { toast } from "../composables/util.js";
import { computed } from "@vue/reactivity";

// 加载动画
const loading = ref(false);
const list = ref([]);


//默认第一页 分页
const currentPage = ref(1);
//共有多少条数据
const total = ref(0);
//每页10条数据
const limit = ref(10);

//图库列表数据
const getData = (p) => {
  if (typeof p == "number") {
    currentPage.value = p;
  }
  //打开动画
  loading.value = true;
  getImageClassList(currentPage.value)
    .then((res) => {
      total.value = res.totalCount;
      list.value = res.list;
      let item = list.value[0];
      //判断有数据就让第一个选中
      if (item) {
       
        handleChangeActiveId(item.id)
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
getData();

const editId = ref(0);
const drawerTitle = computed(() => (editId.value ? "修改" : "新增"));
//操控FormDrawer组件
const formDrawerRef = ref(null);
const form = reactive({
  name: "",
  order: 50,
});

//表单验证
const rules = {
  name: [
    {
      required: true,
      message: "图库分类名称不能为空",
      trigger: "blur",
    },
  ],
};

//操控表单
const formRef = ref(null);
//添加
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    formDrawerRef.value.showLoading();
    //updateImageClass是修改接口 createImageClass是添加接口
    const fun = editId.value
      ? updateImageClass(editId.value, form)
      : createImageClass(form);
    fun
      .then((res) => {
        toast(drawerTitle.value + "成功");
        //添加到第一行
        getData(editId.value ? currentPage.value : 1);
        // 关闭抽屉
        formDrawerRef.value.close();
      })
      .finally(() => {
        formDrawerRef.value.hideLoading();
      });
  });
};

//新增 打开抽屉
const handleCreate = () => {
  editId.value = 0;
  form.name = "";
  form.order = 50;
  formDrawerRef.value.open();
};

//修改
const handleEdit = (row) => {
  editId.value = row.id;
  //初始化表单
  form.name = row.name;
  form.order = row.order;
  // 打开抽屉
  formDrawerRef.value.open();
};

//删除
const handleDelete = (id) => {
  loading.value = true;
  deleteImageClass(id)
    .then((res) => {
      toast("删除成功");
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};

// 选中图库分类ID
const activeId = ref(0);
const emit = defineEmits(["change"])
//切换分类
const handleChangeActiveId = (id) => {
    activeId.value = id
    emit("change", id)
}

defineExpose({ handleCreate });
</script>

<style scoped>
.image-aside {
  border-right: 1px solid #eeeeee;
  position: relative;
}
.image-aside .top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}
.image-aside .bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}
</style>
