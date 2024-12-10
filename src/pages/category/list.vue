<template>
  <el-card shadow="never" class="border-0">
    <ListHeader @create="handleCreate" @refresh="getData" />
    <el-tree
      :data="tableData"
      :props="{ label: 'name', children: 'child' }"
      v-loading="loading"
      node-key="id"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span>{{ data.name }}</span>
          <div class="ml-auto">
            <el-button
              text
              type="primary"
              size="small"
              @click="openGoodsDrawer(data)"
              :loading="data.goodsDrawerLoading"
              >推荐商品</el-button
            >
            <el-switch
              :modelValue="data.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($event, data)"
            />
            <el-button
              text
              type="primary"
              size="small"
              @click.stop="handleEdit(data)"
              >修改</el-button
            >
            <el-popconfirm
              title="是否要删除该记录？"
              confirmButtonText="确认"
              cancelButtonText="取消"
              @confirm="handleDelete(data.id)"
            >
              <template #reference>
                <el-button text type="primary" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </template>
    </el-tree>

    <FormDrawer :title="drawerTitle" ref="formDrawerRef" @submit="handleSubmit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="form.name"
            style="width: 100%"
            placeholder="分类名称"
          />
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>

  <GoodsDrawer ref="GoodsDrawerRef" />
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  getCategoryList,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "~/api/category.js";
import ListHeader from "~/components/ListHeader.vue";
import FormDrawer from "~/components/FormDrawer.vue";
import { toast } from "~/composables/util.js";
import GoodsDrawer from "./components/GoodsDrawer.vue";

const tableData = ref([]);
const loading = ref(false);
const rules = ref([]);

// 获取表格数据
const getData = (p) => {
  //打开动画
  loading.value = true;
  getCategoryList(1)
    .then((res) => {
      tableData.value = res.map(i => {
        i.goodsDrawerLoading = false
        return i
      })
    })
    .finally(() => {
      loading.value = false;
    });
};
getData();

//操控抽屉组件
const formDrawerRef = ref(null);
//操控抽屉组件表单
const formRef = ref(null);
const form = reactive({
  name: "",
});
const editId = ref(0);
const drawerTitle = computed(() => (editId.value ? "修改" : "新增"));

//提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
  });
  formDrawerRef.value.showLoading();
  const fun = editId.value
    ? updateCategory(editId.value, form)
    : createCategory(form);
  fun
    .then((res) => {
      toast(drawerTitle.value + "成功");
      //添加到第一行
      getData(editId.value);
      //关闭抽屉
      formDrawerRef.value.close();
    })
    .finally(() => {
      formDrawerRef.value.hideLoading();
    });
};

// 重置表单
function resetForm(row = false) {
  if (formRef.value) formRef.value.clearValidate();
  if (row) {
    for (const key in form) {
      form[key] = row[key];
    }
  }
}

//新增
const handleCreate = () => {
  editId.value = 0;
  //打开前让表单为空
  resetForm({
    name: "",
  });
  //通过ref拿到打开抽屉方法
  formDrawerRef.value.open();
};

//修改
const handleEdit = (row) => {
  editId.value = row.id;
  //初始化表单resetForm(row)
  resetForm(row);
  // 打开抽屉
  formDrawerRef.value.open();
};

//修改状态
const handleStatusChange = (status, row) => {
  updateCategoryStatus(row.id, status).then((res) => {
    // toast("修改成功");
    row.status = status;
  });
};

// 添加子分类
const addChild = (id) => {
  handleCreate();
  form.rule_id = id;
  form.status = 1;
};

// 删除
const handleDelete = (id) => {
  loading.value = true;
  deleteCategory(id)
    .then((res) => {
      toast("删除成功");
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};

//推荐商品
const GoodsDrawerRef = ref(null);
const openGoodsDrawer = (data) => {
    GoodsDrawerRef.value.open(data)
};
</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-right: 8px;
}
.el-tree-node__content {
  padding: 20px 0;
}
</style>
