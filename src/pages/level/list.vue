<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="会员等级" />
      <el-table-column prop="discount" label="折扣率" width="180" />
      <el-table-column prop="level" label="等级序号" width="180" />
      <el-table-column label="状态" width="180">
        <template #default="{ row }"  width="120">
          <!-- 通过 $event 访问到该事件对象 -->
          <el-switch
            :modelValue="row.status"
            :active-value="1"
            :inactive-value="0"
            :loading="row.statusLoading"
            :disabled="row.super == 1"
            @change="handleStatusLevel($event, row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center"
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

    <FormDrawer :title="drawerTitle" ref="formDrawerRef" @submit="handleSubmit">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="等级名称" />
        </el-form-item>
        <el-form-item label="等级权重" prop="level">
          <el-input type="number" v-model="form.level" placeholder="等级权重" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="升级条件">
          <div>
            <small class="text-xs mr-2">累计消费满</small>
            <el-input
              type="number"
              v-model="form.max_price"
              placeholder="累计消费满"
              style="width: 50%"
              ><template #append>元</template></el-input
            >
            <small class="text-gray-400 flex">
              设置会员等级所需要的累计消费必须大于等于0,单位：元
            </small>
          </div>
          <div>
            <small class="text-xs mr-2">累计次数满</small>
            <el-input
              type="number"
              v-model="form.max_price"
              placeholder="累计次数满"
              style="width: 50%"
              ><template #append>%</template></el-input
            >
            <small class="text-gray-400 flex">
              设置会员等级所需要的购买量必须大于等于0,单位：笔
            </small>
          </div>
        </el-form-item>
        <el-form-item label="折扣率(%)" prop="discount">
          <el-input
            type="number"
            v-model="form.discount"
            placeholder="折扣率(%)"
            style="width: 50%"
            ><template #append>%</template></el-input
          >
          <small class="text-gray-400 flex">
            折扣率单位为百分比，如输入90，表示该会员等级的用户可以以商品原价的90%购买
          </small>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  getUserLevelList,
  createUserLevel,
  updateUserLevel,
  deleteUserLevel,
  updateUserLevelStatus,
} from "~/api/level";
import FormDrawer from "~/components/FormDrawer.vue";
import ListHeader from "~/components/ListHeader.vue";
import { toast } from "~/composables/util.js";

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
  getUserLevelList(currentPage.value)
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
  level: 100,
  status: 1,
  discount: 0,
  max_price: 0,
  max_times: 0,
});

const rules = {
  name: [
    {
      required: true,
      message: "会员等级名称不能为空",
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
  const fun = editId.value
    ? updateUserLevel(editId.value, form)
    : createUserLevel(form);
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
    level: 100,
    status: 1,
    discount: 0,
    max_price: 0,
    max_times: 0,
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
  deleteUserLevel(id)
    .then((res) => {
      toast("删除成功");
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};

//修改状态
const handleStatusLevel = (status, row) => {
  row.statusLoading = true;
  updateUserLevelStatus(row.id, status)
    .then((res) => {
      toast("修改成功");
      row.status = status;
    })
    .finally(() => {
      row.statusLoading = false;
    });
};
</script>

<style lang="scss" scoped></style>
