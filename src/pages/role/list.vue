<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="desc" label="角色描述" />
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
            @click="openSetRule(scope.row)"
            >配置权限
          </el-button>
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
    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form
        :model="form"
        ref="formRef"
        :rules="rules"
        label-width="80px"
        :inline="false"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="desc">
          <el-input
            v-model="form.desc"
            placeholder="角色描述"
            type="textarea"
            :rows="5"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          >
          </el-switch>
        </el-form-item>
      </el-form>
    </FormDrawer>

    <!-- 权限配置 -->
    <FormDrawer
      ref="setRuleFormDrawerRef"
      title="权限配置"
      @submit="handleSetRuleSubmit"
    >
      <el-tree-v2
        ref="elTreeRef"
        node-key="id"
        :check-strictly="checkStrictly"
        :default-expanded-keys="defaultExpandedKeys"
        :data="ruleList"
        :props="{ label: 'name', children: 'child' }"
        show-checkbox
        :height="treeHeight"
        @check="handleTreeCheck"
        class="pt-1"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <el-tag size="small" :type="data.menu ? '' : 'info'">{{
              data.menu ? "菜单" : "权限"
            }}</el-tag>
            <span>{{ data.name }}</span>
          </div>
        </template>
      </el-tree-v2>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import ListHeader from "~/components/ListHeader.vue";
import FormDrawer from "~/components/FormDrawer.vue";
import { toast } from "~/composables/util.js";
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  setRoleRules,
} from "~/api/role.js";
import { getRuleList } from "~/api/rule.js";

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
  getRoleList(currentPage.value)
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
  name: "",
  desc: "",
  status: 1,
});
const rules = {
  name: [
    {
      required: true,
      message: "角色名称标题不能为空",
      trigger: "blur",
    },
  ],
  desc: [
    {
      required: true,
      message: "角色描述内容不能为空",
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
  const fun = editId.value ? updateRole(editId.value, form) : createRole(form);
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
  deleteRole(id)
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
  updateRoleStatus(row.id, status)
    .then((res) => {
      toast("修改成功");
      row.status = status;
    })
    .finally(() => {
      row.statusLoading = false;
    });
};

//操控抽屉组件ref
const setRuleFormDrawerRef = ref(null);
const ruleList = ref([]);
//树形组件的高度
const treeHeight = ref(0);
//存储当前角色的ID
const roleId = ref(0);
//默认展开数据
const defaultExpandedKeys = ref([]);
//设置勾选状态
const elTreeRef = ref(null);
// 当前角色拥有的权限ID
const ruleIds = ref([]);
const checkStrictly = ref(false);

const openSetRule = (row) => {
  roleId.value = row.id;
  //计算树形组件的高度
  treeHeight.value = window.innerHeight - 180;
  //勾选模式
  checkStrictly.value = true;

  getRuleList(1).then((res) => {
    // console.log(res);
    ruleList.value = res.list;
    //设置默认展开的节点
    defaultExpandedKeys.value = res.list.map((o) => o.id);
    setRuleFormDrawerRef.value.open();
    ruleIds.value = row.rules.map((o) => o.id);
    setTimeout(() => {
      elTreeRef.value.setCheckedKeys(ruleIds.value);
      checkStrictly.value = false;
    }, 150);
  });
};

//配置权限提交
const handleSetRuleSubmit = () => {
  //开启loading
  setRuleFormDrawerRef.value.showLoading();
  setRoleRules(roleId.value, ruleIds.value)
    .then((res) => {
      toast("配置成功");
      getData();
      setRuleFormDrawerRef.value.close();
    })
    .finally(() => {
      setRuleFormDrawerRef.value.hideLoading();
    });
};

//处理树形组件的勾选事件
const handleTreeCheck = (...e) => {
  const { checkedKeys, halfCheckedKeys } = e[1];
  ruleIds.value = [...checkedKeys, ...halfCheckedKeys];
};
</script>

<style></style>
