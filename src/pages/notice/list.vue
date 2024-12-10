<template>
  <el-card shadow="never" class="border-0" >
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="公告标题" />
      <el-table-column prop="update_time" label="发布时间" width="380" />
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
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="form.content"
            placeholder="公告内容"
            type="textarea"
            :rows="5"
          ></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive,computed } from "vue";
import {
  getNoticeList,
  createNotice,
  updateNotice,
  deleteNotice,
} from "~/api/notice.js";
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
  getNoticeList(currentPage.value)
    .then((res) => {
      // console.log(res);
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
  title: "",
  content: "",
});

const rules = {
  title: [
    {
      required: true,
      message: "公告标题不能为空",
      trigger: "blur",
    },
  ],
  content: [
    {
      required: true,
      message: "公告内容不能为空",
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
    ? updateNotice(editId.value, form)
    : createNotice(form);
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
    title: "",
    content: "",
  });

  //通过ref拿到打开抽屉方法
  formDrawerRef.value.open();
};

//修改
const handleEdit = (row) => {
  editId.value = row.id;
  //初始化表单resetForm(row)
  resetForm(row)
  // 打开抽屉
  formDrawerRef.value.open();
};

// 删除
const handleDelete = (id) => {
  loading.value = true;
  deleteNotice(id)
    .then((res) => {
      toast("删除成功");
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<style lang="scss" scoped></style>
