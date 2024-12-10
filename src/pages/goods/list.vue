<template>
  <div>
    <el-tabs v-model="searchForm.tab" @tab-change="getData">
      <el-tab-pane
        :label="item.name"
        :name="item.key"
        v-for="(item, index) in tabbars"
        :key="index"
      ></el-tab-pane>
    </el-tabs>

    <el-card shadow="never" class="border-0">
      <!-- 搜索 -->
      <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
        <SearchItem label="关键词">
          <el-input
            v-model="searchForm.title"
            placeholder="商品名称"
            clearable
          ></el-input>
        </SearchItem>
        <template #show>
          <SearchItem label="商品分类">
            <el-select
              v-model="searchForm.category_id"
              placeholder="请选择商品分类"
              clearable
            >
              <el-option
                v-for="item in category_list"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </SearchItem>
        </template>
      </Search>

      <!-- 新增|刷新 -->
      <ListHeader
        layout="create,refresh"
        @create="handleCreate"
        @refresh="getData"
      >
        <el-button
          type="danger"
          size="small"
          @click="handleMultiDelete"
          v-if="searchForm.tab != 'delete'"
          >批量删除</el-button
        >
        <el-button
          type="warning"
          size="small"
          @click="handleRestoreGoods"
          v-else
          >恢复商品</el-button
        >
        <el-popconfirm
          v-if="searchForm.tab == 'delete'"
          title="是否要删除该商品？"
          confirmButtonText="确认"
          cancelButtonText="取消"
          @confirm="handledestroyGoods"
        >
          <template #reference>
            <el-button type="danger" size="small">彻底删除</el-button>
          </template>
        </el-popconfirm>
        <el-button
          size="small"
          @click="handleMultiStatusChange(1)"
          v-if="searchForm.tab == 'all' || searchForm.tab == 'off'"
          >上架</el-button
        >
        <el-button
          size="small"
          @click="handleMultiStatusChange(0)"
          v-if="searchForm.tab == 'all' || searchForm.tab == 'saling'"
          >下架</el-button
        >
      </ListHeader>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        v-loading="loading"
        ref="multipleTableRef"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column label="商品" width="300">
          <template #default="{ row }">
            <div class="flex">
              <el-image
                class="mr-3 rounded"
                :src="row.cover"
                fit="cover"
                :lazy="true"
                style="width: 50px; height: 50px"
              />
              <div class="flex-1">
                <p>{{ row.title }}</p>
                <div>
                  <!-- // 商品最低价 -->
                  <span class="text-rose-500">￥{{ row.min_price }}</span>
                  <el-divider direction="vertical" />
                  <!-- // 商品原价最低价 -->
                  <span class="text-gray-500 text-xs"
                    >￥{{ row.min_oprice }}</span
                  >
                </div>
                <!-- 判断所属分类 -->
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
        <el-table-column
          label="实际销量"
          width="100"
          prop="sale_count"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="商品状态"
          width="100"
          prop="sale_count"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" size="small">{{
              row.status ? "上架" : "仓库"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120" align="center" v-if="searchForm.tab != 'delete'">
          <template #default="{ row }">
            <div class="flex flex-col" v-if="row.ischeck == 0">
              <el-button type="success" size="small" plain>审核通过</el-button>
              <el-button class="mt-2 !ml-0" type="danger" size="small" plain>审核拒绝</el-button>
            </div>
            <span v-else>{{ row.ischeck == 1 ? '通过' : '拒绝' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总库存" width="90" prop="stock" align="center">
        </el-table-column>
        <el-table-column label="操作" align="center"
          ><template #default="scope">
            <div v-if="searchForm.tab != 'delete'">
              <el-button
                class="px-1"
                type="primary"
                size="small"
                text
                @click="handleEdit(scope.row)"
                >修改</el-button
              >
              <el-button
                class="px-1"
                size="small"
                text
                :type="
                  (scope.row.sku_type == 0 && !scope.row.sku_value) ||
                  (scope.row.sku_type == 1 && !scope.row.goods_skus.length)
                    ? 'danger'
                    : 'primary'
                "
                :loading="scope.row.skusLoading"
                @click="handleSetGoodsSkus(scope.row)"
                >商品规格</el-button
              >
              <el-button
                class="px-1"
                size="small"
                text
                @click="handleSetGoodsBanners(scope.row)"
                :loading="scope.row.bannersLoading"
                :type="
                  scope.row.goods_banner.length == 0 ? 'danger' : 'primary'
                "
                >设置轮播图</el-button
              >
              <el-button
                class="px-1"
                size="small"
                text
                :type="!scope.row.content ? 'danger' : 'primary'"
                @click="handleSetGoodsContent(scope.row)"
                :loading="scope.row.contentLoading"
                >商品详情</el-button
              >

              <el-popconfirm
                title="是否要删除该商品？"
                confirmButtonText="确认"
                cancelButtonText="取消"
                @confirm="handleDelete([scope.row.id])"
              >
                <template #reference>
                  <el-button class="px-1" text type="primary" size="small"
                    >删除</el-button
                  >
                </template>
              </el-popconfirm>
            </div>
            <span v-else>暂无操作</span>
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

      <FormDrawer
        :title="drawerTitle"
        ref="formDrawerRef"
        @submit="handleSubmit"
      >
        <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
          <el-form-item label="商品名称" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入商品名称，不能超过60个字符
"
            />
          </el-form-item>
          <el-form-item label="封面" prop="cover">
            <ChooseImage v-model="form.cover" />
          </el-form-item>
          <el-form-item label="商品分类" prop="category_id">
            <el-select
              v-model="form.category_id"
              placeholder="选择所属商品分类"
              clearable
            >
              <el-option
                v-for="item in category_list"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="商品描述" prop="desc">
            <el-input
              type="textarea"
              v-model="form.desc"
              placeholder="选填，商品卖点
"
            />
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input
              v-model="form.unit"
              placeholder="请输入单位"
              style="width: 50%"
            />
          </el-form-item>
          <el-form-item label="总库存" prop="stock">
            <el-input v-model="form.stock" type="number" style="width: 50%" />
            <template #append>件</template>
          </el-form-item>
          <el-form-item label="库存预警" prop="min_stock">
            <el-input
              v-model="form.min_stock"
              type="number"
              style="width: 50%"
            />
            <template #append>件</template>
          </el-form-item>
          <el-form-item label="最低销售价" prop="min_price">
            <el-input
              v-model="form.min_price"
              type="number"
              style="width: 50%"
            />
            <template #append>元</template>
          </el-form-item>
          <el-form-item label="最低原价" prop="min_oprice">
            <el-input
              v-model="form.min_oprice"
              type="number"
              style="width: 50%"
            />
            <template #append>元</template>
          </el-form-item>
          <el-form-item label="库存显示" prop="stock_display">
            <el-radio-group v-model="form.stock_display">
              <el-radio :label="0" size="large">隐藏</el-radio>
              <el-radio :label="1" size="large">显示</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否上架" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0" size="large">放入仓库</el-radio>
              <el-radio :label="1" size="large">立即上架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </FormDrawer>
    </el-card>

    <banners ref="bannersRef" @reload-data="getData" />
    <!-- <content ref="contentRef" @reload-data="getData" /> -->
    <skus ref="skusRef" @reload-data="getData" />
  </div>
</template>

<script setup>
import { ElNotification  } from 'element-plus'
import { ref, reactive } from "vue";
import {
  getGoodsList,
  updateGoodsStatus,
  deleteGoods,
  createGoods,
  updateGoods,
  restoreGoods,
  destroyGoods
} from "~/api/goods.js";
import { getCategoryList } from "~/api/category.js";
import { toast } from "~/composables/util.js";
import { computed } from "@vue/reactivity";
import FormDrawer from "~/components/FormDrawer.vue";
import ListHeader from "~/components/ListHeader.vue";
import Search from "~/components/Search.vue";
import SearchItem from "~/components/SearchItem.vue";
import ChooseImage from "~/components/ChooseImage.vue";
import banners from "./banners.vue";
// import content from "./content.vue";
import skus from "./skus.vue";

//搜索框
const searchForm = reactive({
  title: "",
  tab: "all",
  category_id: null,
});

//重置搜索框
const resetSearchForm = () => {
  searchForm.keyword = "";
  searchForm.title = ""
  searchForm.category_id = ""
  getData();
};

const tableData = ref([]);
const loading = ref(false);

// 分页
const currentPage = ref(1);
const total = ref(0);
const limit = ref(10);

const roles = ref([]);

const editId = ref(0);
const drawerTitle = computed(() => (editId.value ? "修改" : "新增"));

// 获取表格数据
const getData = (p) => {
  if (typeof p == "number") {
    currentPage.value = p;
  }
  //打开动画
  loading.value = true;
  getGoodsList(currentPage.value, searchForm)
    .then((res) => {
      tableData.value = res.list.map((o) => {
        o.bannersLoading = false;
        o.contentLoading = false;
        o.skusLoading = false;
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

//操控抽屉组件
const formDrawerRef = ref(null);
//操控抽屉组件表单
const formRef = ref(null);
const form = reactive({
  title: null,
  category_id: null,
  cover: null,
  desc: null,
  unit: "件",
  stock: 100,
  min_stock: 10,
  status: 1,
  stock_display: 1,
  min_price: 0,
  min_oprice: 0,
});

const rules = {};

//提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
  });
  formDrawerRef.value.showLoading();
  const fun = editId.value
    ? updateGoods(editId.value, form)
    : createGoods(form);
  fun
    .then((res) => {
      toast(drawerTitle.value + "成功");
      //添加到第一行
      getData(editId.value ? false : 1);
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
    title: null,
    category_id: null,
    cover: null,
    desc: null,
    unit: "件",
    stock: 100,
    min_stock: 10,
    status: 1,
    stock_display: 1,
    min_price: 0,
    min_oprice: 0,
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
  deleteGoods(id)
    .then((res) => {
      toast("删除成功");
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};




// tab
const tabbars = [
  {
    key: "all",
    name: "全部",
  },
  {
    key: "checking",
    name: "审核中",
  },
  {
    key: "saling",
    name: "出售中",
  },
  {
    key: "off",
    name: "已下架",
  },
  {
    key: "min_stock",
    name: "库存预警",
  },
  {
    key: "delete",
    name: "回收站",
  },
];
//商品分类
const category_list = ref([]);
getCategoryList().then((res) => {
  category_list.value = res;
});

// const showSearch = ref(false);

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
  //接口方法
  useActionGoods(deleteGoods, '批量删除')
};

//批量上架下架商品
const handleMultiStatusChange = (status) => {
  loading.value = true;
  updateGoodsStatus(multiSelectionIds.value, status)
    .then((res) => {
      toast("修改状态成功");
      // 清空选中
      if (multipleTableRef.value) {
        multipleTableRef.value.clearSelection();
      }
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};

//批量商品恢复
const handleRestoreGoods = () => {
  //接口方法
  useActionGoods(restoreGoods, '恢复')
};

//彻底删除
const handledestroyGoods = () => {
  //接口方法
  useActionGoods(destroyGoods, '彻底删除')
}

//封装相同代码
function useActionGoods(func, msg) {
  loading.value = true;
  func(multiSelectionIds.value)
    .then((res) => {
      toast(msg + "成功");
      // 清空选中
      if (multipleTableRef.value) {
        multipleTableRef.value.clearSelection();
      }
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
}

//设置轮播图
const bannersRef = ref(null);
const handleSetGoodsBanners = (row) => {
  bannersRef.value.open(row);
};

// 设置商品详情
// const contentRef = ref(null);
const handleSetGoodsContent = () => {
  ElNotification({
    message: '暂未开通',
    type: 'warning',
  })
};

//设置sku规格
const skusRef = ref(null);
const handleSetGoodsSkus = (row) => {
  skusRef.value.open(row);
};
</script>

<style scoped></style>
