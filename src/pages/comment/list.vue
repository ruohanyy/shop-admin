<template>
  <el-card shadow="never" class="border-0" style="max-width: 1242px">
    <!-- 搜索 -->
    <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
      <SearchItem label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="商品标题"
          clearable
        ></el-input>
      </SearchItem>
    </Search>

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading" default-expand-all>
      <!-- 展开 -->
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="flex pl-22">
            <el-avatar
              :size="50"
              :src="row.user.avatar"
              fit="fill"
              class="mr-3"
            >
            </el-avatar>
            <div class="flex-1">
              <h6 class="flex items-center">
                {{ row.user.nickname || row.user.username }}
                <small class="text-gray-400 ml-2">{{ row.review_time }}</small>
                <el-button
                  size="small"
                  class="ml-auto"
                  @click="openTextarea(row)"
                  v-if="!row.textareaEdit && !row.extra"
                  >回复</el-button
                >
              </h6>
              {{ row.review.data }}
              <div class="py-2">
                <el-image
                  v-for="(item, index) in row.review.image"
                  :key="index"
                  :src="item"
                  fit="cover"
                  :lazy="true"
                  style="width: 100px; height: 100px"
                  class="rounded"
                ></el-image>
              </div>
              <div v-if="row.textareaEdit">
                <el-input
                  v-model="textarea"
                  placeholder="请输入评价内容"
                  type="textarea"
                  :rows="2"
                ></el-input>
                <div class="py-2">
                  <el-button type="primary" size="small" @click="review(row)"
                    >回复</el-button
                  >
                  <el-button
                    size="small"
                    class="ml-2"
                    @click="row.textareaEdit = false"
                    >取消</el-button
                  >
                </div>
              </div>


              <template v-else>
                <div
                  class="mt-3 bg-gray-100 p-3 rounded"
                  v-for="(item, index) in row.extra"
                  :key="index"
                >
                  <h6 class="flex font-bold">
                    客服
                    <el-button
                      type="info"
                      size="small"
                      class="ml-auto"
                      @click="openTextarea(row, item.data)"
                      >修改</el-button
                    >
                  </h6>
                  <p>{{ item.data }}</p>
                </div>
              </template>

            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="ID" width="90" prop="id" />
      <el-table-column label="商品" width="280">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-image
              :src="row.goods_item ? row.goods_item.cover : ''"
              fit="fill"
              :lazy="true"
              style="width: 50px; height: 50px"
              class="rounded"
            ></el-image>
            <div class="ml-3">
              <h6>{{ row.goods_item?.title ?? "商品已被删除" }}</h6>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评价信息" width="180">
        <template #default="{ row }">
          <p>用户：{{ row.user.nickname || row.user.username }}</p>
          <p>
            <el-rate
              v-model="row.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </p>
        </template>
      </el-table-column>
      <el-table-column label="评价时间" align="center" prop="review_time" width="280" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <!-- 通过 $event 访问到该事件对象 -->
          <el-switch
            :modelValue="row.status"
            :active-value="1"
            :inactive-value="0"
            :loading="row.statusLoading"
            @change="handleStatusChange($event, row)"
          >
          </el-switch>
        </template>
      </el-table-column>
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
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="密码" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <ChooseImage v-model="form.avatar" />
        </el-form-item>
        <el-form-item label="会员等级" prop="user_level_id">
          <el-select v-model="form.user_level_id" placeholder="选择会员等级">
            <el-option
              v-for="item in user_level"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="form.phone" placeholder="手机" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="content">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          >
          </el-switch>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive } from "vue";
import {
  getGoodsCommentList,
  updateGoodsCommentStatus,
  reviewGoodsComment,
} from "~/api/goods_comment";
import FormDrawer from "~/components/FormDrawer.vue";
import { toast } from "~/composables/util.js";
import ChooseImage from "~/components/ChooseImage.vue";
import Search from "~/components/Search.vue";
import SearchItem from "~/components/SearchItem.vue";

//搜索框
const searchForm = reactive({
  keyword: "",
  user_level_id: null,
});

//重置搜索框
const resetSearchForm = () => {
  searchForm.keyword = "";
  getData();
};

const tableData = ref([]);
const loading = ref(false);

// 分页
const currentPage = ref(1);
const total = ref(0);
const limit = ref(10);
const roles = ref([]);

// 获取表格数据
const getData = (p) => {
  if (typeof p == "number") {
    currentPage.value = p;
  }
  //打开动画
  loading.value = true;
  getGoodsCommentList(currentPage.value, searchForm)
    .then((res) => {
      console.log(res);
      tableData.value = res.list.map((o) => {
        o.statusLoading = false;
        o.textareaEdit = false
        return o;
      });
      total.value = res.totalCount;
      roles.value = res.roles;
    })
    .finally(() => {
      loading.value = false;
    });
};
getData();

//修改状态
const handleStatusChange = (status, row) => {
  row.statusLoading = true;
  updateGoodsCommentStatus(row.id, status)
    .then((res) => {
      toast("修改状态成功");
      row.status = status;
    })
    .finally(() => {
      row.statusLoading = false;
    });
};

const textarea = ref("")
const openTextarea = (row, data = "") => {
    textarea.value = data
    row.textareaEdit = true
}

const review = (row) => {
  if (textarea.value == "") {
    return toast("回复内容不能为空", "error");
  }
  reviewGoodsComment(row.id, textarea.value).then((res) => {
    row.textareaEdit = false;
    toast("回复成功");
    getData();
  });
};
</script>

<style scoped></style>
