<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader
      layout="create,delete,refresh"
      @create="handleCreate"
      @delete="handleMultiDelete"
      @refresh="getData"
    />

    <!-- 表格 -->
    <el-table
      ref="multipleTableRef"
      @selection-change="handleSelectionChange"
      :data="tableData"
      stripe
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column type="selection" />
      <el-table-column prop="name" label="规格名称" />
      <el-table-column prop="default" label="规格值" />
      <el-table-column prop="order" label="排序" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <!-- 通过 $event 访问到该事件对象 -->
          <el-switch
            :modelValue="row.status"
            :active-value="1"
            :inactive-value="0"
            :loading="row.statusLoading"
            :disabled="row.super == 1"
            @change="handleStatusChange($event, row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center"
        ><template #default="scope">
          <el-button
            type="primary"
            size="small"
            text
            @click="handleEdit(scope.row)"
            >修改</el-button
          >

          <el-popconfirm
            title="是否要删除该公告？"
            confirmButtonText="确认"
            cancelButtonText="取消"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button text type="primary" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template></el-table-column
      >
    </el-table>

    <!-- 分页 -->
    <div class="flex items-center justify-center mt-5">
      <el-pagination
        background
        layout="prev, pager ,next"
        :total="total"
        :current-page="currentPage"
        :page-size="limit"
        @current-change="getData"
      />
    </div>

    <!-- 新增 修改 -->
    <FormDrawer
      destroyOnClose
      ref="formDrawerRef"
      :title="drawerTitle"
      @submit="handleSubmit"
    >
      <el-form
        :model="form"
        ref="formRef"
        :rules="rules"
        label-width="80px"
        :inline="false"
      >
        <el-form-item label="规模名称" prop="name">
          <el-input v-model="form.name" placeholder="规模名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" :max="1000">
          </el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="规格值" prop="default">
          <TagInput v-model="form.default" />
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import ListHeader from "~/components/ListHeader.vue";
import FormDrawer from "~/components/FormDrawer.vue";
import TagInput from "~/components/TagInput.vue";
import { toast } from "~/composables/util.js";
import {
  getSkusList,
  createSkus,
  updateSkus,
  deleteSkus,
  updateSkusStatus,
} from "~/api/skus";

const tableData = ref([]);
const loading = ref(false);

// 分页
const currentPage = ref(1);
const total = ref(0);
const limit = ref(10);

// 获取表格数据
const getData = (p) => {
  if (typeof p == "number") {
    currentPage.value = p;
  }
  //打开动画
  loading.value = true;
  getSkusList(currentPage.value)
    .then((res) => {
      console.log(res);
      tableData.value = res.list;
      total.value = res.totalCount;
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
  desc: "",
  status: 1,
});
const rules = {
  name: [
    {
      required: true,
      message: "规格名称不能为空",
      trigger: "blur",
    },
  ],
};

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
  const fun = editId.value ? updateSkus(editId.value, form) : createSkus(form);
  fun
    .then((res) => {
      toast(drawerTitle.value + "成功");
      //添加到第一行
      getData(editId.value ? currentPage.value : 1);
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
    desc: "",
    status: 1,
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

// 删除
const handleDelete = (id) => {
  loading.value = true;
  deleteSkus(id)
    .then((res) => {
      toast("删除成功");
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};

//修改状态
const handleStatusChange = (status, row) => {
  row.statusLoading = true;
  updateSkusStatus(row.id, status)
    .then((res) => {
      toast("修改成功");
      row.status = status;
    })
    .finally(() => {
      row.statusLoading = false;
    });
};

//勾选的id数组
const multiSelectionIds = ref([]);
// 使用数组的map方法遍历e 提取选中项的id属性 并赋值给multiSelectionIds数组
const handleSelectionChange = (e) => {
  multiSelectionIds.value = e.map((o) => o.id);
};

//操控表格 用于存储多选组件
const multipleTableRef = ref(null);
// 批量删除
const handleMultiDelete = () => {
  loading.value = true;
  deleteSkus(multiSelectionIds.value)
    .then((res) => {
      toast("删除成功");
      //清空选中状态
      if (multipleTableRef.value) {
        //clearSelection方法用来清除所有选中的选择
        multipleTableRef.value.clearSelection();
      }
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
