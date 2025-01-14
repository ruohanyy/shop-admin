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
        <SearchItem label="订单编号">
          <el-input
            v-model="searchForm.no"
            placeholder="订单编号"
            clearable
          ></el-input>
        </SearchItem>
        <template #show>
          <SearchItem label="收货人">
            <el-input
              v-model="searchForm.name"
              placeholder="收货人"
              clearable
            ></el-input>
          </SearchItem>
          <SearchItem label="手机号">
            <el-input
              v-model="searchForm.phone"
              placeholder="手机号"
              clearable
            ></el-input>
          </SearchItem>
          <SearchItem label="开始时间">
            <el-date-picker
              v-model="searchForm.starttime"
              type="date"
              style="width: 100%"
              placeholder="开始日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
            />
          </SearchItem>
          <SearchItem label="结束时间">
            <el-date-picker
              v-model="searchForm.endtime"
              type="date"
              style="width: 100%"
              placeholder="开始日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
            />
          </SearchItem>
        </template>
      </Search>

      <!-- 新增|刷新 -->
      <ListHeader
        layout="refresh,download"
        @refresh="getData"
        @download="handleExportExcel"
      >
        <el-button type="danger" size="small" @click="handleMultiDelete"
          >批量删除</el-button
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
            <div>
              <div class="flex text-sm">
                <div class="flex-1">
                  <p>订单号：</p>
                  <small>{{ row.no }}</small>
                </div>
                <div>
                  <p>下单时间：</p>
                  <small>{{ row.create_time }}</small>
                </div>
              </div>
              <div
                class="flex py-2"
                v-for="(item, index) in row.order_items"
                :key="index"
              >
                <el-image
                  :src="item.goods_item ? item.goods_item.cover : ''"
                  fit="cover"
                  :lazy="true"
                  style="width: 30px; height: 30px"
                >
                  {{ item.goods_item ? item.goods_item.cover : "" }}</el-image
                >
                <p class="text-blue-500 ml-2">
                  {{ item.goods_item ? item.goods_item.title : "商品已被删除" }}
                </p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="实际付款"
          width="100"
          prop="total_price"
          align="center"
        >
        </el-table-column>
        <el-table-column label="买家" width="120" align="center">
          <template #default="{ row }">
            <div>
              <p>{{ row.user.nickname || row.user.username }}</p>
              <small>(用户ID:{{ row.user_id }})</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="交易状态" width="200" align="center">
          <template #default="{ row }">
            <div>
              付款状态：
              <el-tag
                type="primary"
                size="small"
                v-if="row.payment_method == 'alipay'"
                >支付宝支付</el-tag
              >
              <el-tag
                type="success"
                size="small"
                v-else-if="row.payment_method == 'wechat'"
                >微信支付</el-tag
              >
              <el-tag type="info" size="small" v-else>未支付</el-tag>
            </div>
            <div>
              发货状态：<el-tag
                :type="row.ship_data ? 'success' : 'info'"
                size="small"
                >{{ row.ship_data ? "已发货" : "未发货" }}</el-tag
              >
            </div>
            <div>
              收货状态：<el-tag
                :type="row.ship_status == 'received' ? 'success' : 'info'"
                size="small"
                >{{
                  row.ship_status == "received" ? "已收货" : "未收货"
                }}</el-tag
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center"
          ><template #default="{ row }">
            <el-button
              class="px-1"
              type="primary"
              size="small"
              text
              @click="openInfoModal(row)"
              >订单详情</el-button
            >
            <el-button
              class="px-1"
              type="primary"
              size="small"
              text
              v-if="searchForm.tab === 'noship'"
              >订单发货</el-button
            >
            <el-button
              class="px-1"
              type="primary"
              size="small"
              text
              v-if="searchForm.tab === 'refunding'"
              @click="handleRefund(row.id, 1)"
              >同意退款</el-button
            >
            <el-button
              class="px-1"
              type="primary"
              size="small"
              text
              v-if="searchForm.tab === 'refunding'"
              @click="handleRefund(row.id, 0)"
              >拒绝退款</el-button
            >
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
    </el-card>
  </div>
  <ExportExcel :tabs="tabbars" ref="ExportExcelRef" />
  <InfoModal ref="InfoModalRef" :info="info" />
</template>

<script setup>
import { ref, reactive } from "vue";
import { getOrderList, deleteOrder, refundOrder } from "~/api/order";
import { showModal, showPrompt, toast } from "~/composables/util";
import ListHeader from "~/components/ListHeader.vue";
import Search from "~/components/Search.vue";
import SearchItem from "~/components/SearchItem.vue";
import ExportExcel from "./ExportExcel.vue";
import InfoModal from "./InfoModal.vue";
//搜索框
const searchForm = reactive({
  title: "",
  tab: "all",
  no: null,
});

//重置搜索框
const resetSearchForm = () => {
  searchForm.title = "";
  searchForm.tab = "all";
  searchForm.no = null;
  searchForm.starttime = null;
  searchForm.endtime = null;
  searchForm.phone = null;
  searchForm.name = null;
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
  getOrderList(currentPage.value, searchForm)
    .then((res) => {
      console.log(res);
      tableData.value = res.list;
      total.value = res.totalCount;
      roles.value = res.roles;
    })
    .finally(() => {
      loading.value = false;
    });
};
getData();

// tab
const tabbars = [
  {
    key: "all",
    name: "全部",
  },
  {
    key: "nopay",
    name: "待支付",
  },
  {
    key: "noship",
    name: "待发货",
  },
  {
    key: "noshiped",
    name: "待收货",
  },
  {
    key: "received",
    name: "已收货",
  },
  {
    key: "finish",
    name: "已完成",
  },
  {
    key: "closed",
    name: "已关闭",
  },
  {
    key: "refunding",
    name: "退款中",
  },
];

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
  deleteOrder(multiSelectionIds.value)
    .then((res) => {
      toast("批量删除");
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

//导出数据Excel
const ExportExcelRef = ref(null);
const handleExportExcel = () => {
  ExportExcelRef.value.open();
};

//订单详情
const InfoModalRef = ref(null);
const info = ref(null);
const openInfoModal = (row) => {
  row.order_items = row.order_items.map((o) => {
    if (o.skus_type == 1 && o.goods_skus) {
      let s = [];
      for (const k in o.goods_skus.skus) {
        s.push(o.goods_skus.skus[k].value);
      }
      o.sku = s.join(",");
    }
    return o;
  });
  info.value = row;
  InfoModalRef.value.open();
};

// 退款处理
const handleRefund = (id, agree) => {
  (agree
    ? showModal("是否要同意该订单退款?")
    : showPrompt("请输入拒绝的理由")
  ).then(({ value }) => {
    let data = { agree };
    if (!agree) {
      data.disagree_reason = value;
    }
    refundOrder(id, data).then((res) => {
      getData();
      toast("操作成功");
    });
  });
};
</script>

<style scoped></style>
