<template>
  <div>
    <el-row :gutter="20">
      <!-- 骨架 -->
      <template v-if="showSket">
        <el-col :span="6" v-for="i in 4" :key="i">
          <el-skeleton style="width: 100%" animated loading>
            <template #template>
              <el-card shadow="hover" class="border-0">
                <template #header>
                  <div class="flex justify-between">
                    <el-skeleton-item variant="text" style="width: 50%" />
                    <el-skeleton-item variant="text" style="width: 10%" />
                  </div>
                </template>
                <el-skeleton-item variant="h3" style="width: 80%" />
                <el-divider />
                <div class="flex justify-between text-sm text-gray-500">
                  <el-skeleton-item variant="text" style="width: 50%" />
                  <el-skeleton-item variant="text" style="width: 10%" />
                </div>
              </el-card>
            </template>
          </el-skeleton>
        </el-col>
      </template>

      <!-- 首页第一行 -->
      <el-col :span="6" v-for="(item, index) in panels" :key="index" v-else
        ><el-card shadow="hover" class="border-0">
          <template #header>
            <div class="flex justify-between">
              <span class="text-sm">{{ item.title }}</span>
              <el-tag :type="item.unitColor" effect="plain">{{
                item.unit
              }}</el-tag>
            </div>
          </template>
          <span class="text-3xl font-bold text-gray-500">
            <countTo :value="item.value"></countTo>
          </span>
          <el-divider />
          <div class="flex justify-between text-sm text-gray-500">
            <span>{{ item.subTitle }}</span> <span>{{ item.subValue }}</span>
          </div>
        </el-card></el-col
      >
    </el-row>

    <!-- 首页第二行 -->
    <IndexNavs />

    <el-row :gutter="20" class="mt-5">
      <!-- echarts图表 -->
      <el-col :span="12"><IndexChart /></el-col>
      <el-col :span="12"
        ><IndexCard
          title="店铺及商品提示"
          tip="店铺及商品提示"
          :btns="goods"
          class="mb-4"
        />
        <IndexCard
          title="交易提示"
          tip="需要立即处理的交易订单"
          :btns="order"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { statistics1, statistics2 } from "../api/index";
import countTo from "../components/CountTo.vue";
import IndexNavs from "../components/IndexNavs.vue";
import IndexChart from "../components/IndexChart.vue";
import IndexCard from "../components/IndexCard.vue";


const showSket = ref(true)

setTimeout(() => {
  showSket.value = false
}, 500);


const panels = ref([]);
const Statistics1List = () => {
  statistics1().then((res) => {
  panels.value = res.panels;
});
}
Statistics1List()
//店铺及商品提示
const goods = ref([]);
//交易提示
const order = ref([]);
statistics2().then((res) => {
  goods.value = res.goods;
  order.value = res.order;
});
</script>

<style lang="scss" scoped></style>
