<template>
  <el-dialog
    title="商品选择"
    v-model="dialogvisible"
    width="80%"
    destroy-on-close
  >
    <el-table
      ref="multipleTableRef"
      @selection-change="handleSelectionChange"
      :data="tableData"
      stripe
      style="width: 100%"
      v-loading="loading"
      height="300px"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="商品">
        <template #default="{ row }">
          <div class="flex">
            <el-image
              class="mr-3 rounded"
              :src="row.cover"
              fit="cover"
              :lazy="true"
              style="width: 50px; height: 50px"
            >
            </el-image>
            <div class="flex-1">
              <p>{{ row.title }}</p>
              <p class="text-gray-400 text-xs mb-1">
                分类:{{ row.category ? row.category.name : "未分类" }}
              </p>
              <p class="text-gray-400 text-xs">
                创建时间：{{ row.create_time }}
              </p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="总库存" width="90" prop="stock" align="center" />
      <el-table-column label="价格（元）" width="150" align="center">
        <template #default="{ row }">
          <span class="text-rose-500">￥{{ row.min_price }}</span>
          <el-divider direction="vertical"></el-divider>
          <span class="text-gray-500 text-xs">￥{{ row.min_oprice }}</span>
        </template>
      </el-table-column>
    </el-table>

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

    <template #footer>
      <span>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import { getGoodsList } from "~/api/goods.js";

const tableData = ref([]);
const loading = ref(false);
// 分页
const currentPage = ref(1);
const total = ref(0);
const limit = ref(10);
const roles = ref([]);

const dialogvisible = ref(false);

// 获取表格数据
const getData = (p) => {
  if (typeof p == "number") {
    currentPage.value = p;
  }
  //打开动画
  loading.value = true;
  getGoodsList(currentPage.value)
    .then((res) => {
      tableData.value = res.list
      total.value = res.totalCount;
      roles.value = res.roles;
    })
    .finally(() => {
      loading.value = false;
    });
};
getData();

// 多选选中ID
const multiSelectionIds = ref([]);
const handleSelectionChange = (e) => {
  multiSelectionIds.value = e.map((o) => o.id);
};

// 定义一个关闭对话框的函数
function close() {
  dialogvisible.value = false;
}
//存储一个回调函数
const callbackFunction = ref(null);
//打开弹框
const open = (callback = null) => {
  callbackFunction.value = callback;
  dialogvisible.value = true;
};
//提交按钮
const submit = () => {
  if (typeof callbackFunction.value == "function") {
    callbackFunction.value(multiSelectionIds.value);
  }
  close()
};
defineExpose({
  open,
});
</script>

<style lang="scss" scoped></style>
