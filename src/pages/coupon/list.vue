<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <!-- 表格 -->
    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="优惠券名称" width="350">
        <template #default="{ row }">
          <div
            class="border border-dashed py-2 px-4 rounded"
            :class="row.statusText == '领取中' ? 'active' : 'inactive'"
          >
            <h5 class="font-bold text-md">{{ row.name }}</h5>
            <small>{{ row.start_time }} ~ {{ row.end_time }}</small>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="statusText" label="状态" />
      <el-table-column label="优惠">
        <template #default="{ row }">
          {{ row.type == 0 ? "满减" : "折扣" }}
          {{ row.type == 0 ? "￥" + row.value : row.value + "折" }}
        </template>
      </el-table-column>
      <el-table-column prop="total" label="发布数量" />
      <el-table-column prop="used" label="已使用" />
      <el-table-column label="操作" width="180" align="center"
        ><template #default="scope">
          <el-button
            v-if="scope.row.statusText == '未开始'"
            type="primary"
            size="small"
            text
            @click="handleEdit(scope.row)"
            >修改</el-button
          >

          <el-popconfirm
            v-if="scope.row.statusText !== '领取中'"
            title="是否要删除该优惠券？"
            confirmButtonText="确认"
            cancelButtonText="取消"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button text type="primary" size="small">删除</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm
            v-if="scope.row.statusText == '领取中'"
            title="是否让该优惠券失效？"
            confirmButtonText="失效"
            cancelButtonText="取消"
            @confirm="handleStatusChange(0,scope.row)"
          >
            <template #reference>
              <el-button type="danger" size="small">失效</el-button>
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
      <el-form ref="formRef" :model="form" label-width="auto">
        <el-form-item label="优惠券名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="优惠券名"
            style="width: 50%"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">满减</el-radio>
            <el-radio :label="0">折扣</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="面值" prop="value">
          <el-input v-model="form.value" placeholder="面值" style="width: 50%">
            <template #append>{{ form.type ? "元" : "折" }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="发行量" prop="total">
          <el-input-number
            v-model="form.total"
            :min="0"
            :max="10000"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="最低使用价格" prop="min_price">
          <el-input
            v-model="form.min_price"
            placeholder="最低使用价格"
            type="number"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number
            v-model="form.order"
            :min="0"
            :max="1000"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            :editable="false"
            v-model="timerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            placeholder="描述"
            type="textarea"
            :rows="5"
          ></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  getCouponList,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus,
} from "~/api/coupon.js";
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
  //typeof一元运算法判断数据类型
  if (typeof p == "number") {
    currentPage.value = p;
  }
  //打开动画
  loading.value = true;
  getCouponList(currentPage.value)
    .then((res) => {
      //   console.log(res);
      tableData.value = res.list.map((o) => {
        o.statusText = formatStatus(o);
        return o;
      });
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
  type: 0,
  value: 0,
  total: 100,
  min_price: 0,
  start_time: null,
  end_time: null,
  order: 50,
  desc: "",
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

  let body = {};
  if (beforeSubmit && typeof beforeSubmit == "function") {
    body = beforeSubmit({ ...form });
  } else {
    body = { ...form };
  }

  const fun = editId.value
    ? updateCoupon(editId.value, body)
    : createCoupon(body);
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
    type: 0,
    value: 0,
    total: 100,
    min_price: 0,
    start_time: null,
    end_time: null,
    order: 50,
    desc: "",
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
  deleteCoupon(id)
    .then((res) => {
      toast("删除成功");
      getData();
    })
    .finally(() => {
      loading.value = false;
    });
};

function formatStatus(row) {
  let s = "领取中";
  let start_time = new Date(row.start_time).getTime();
  let now = new Date().getTime();
  let end_time = new Date(row.end_time).getTime();
  if (start_time > now) {
    s = "未开始";
  } else if (end_time < now) {
    s = "已结束";
  } else if (row.status == 0) {
    s = "已失效";
  }
  return s;
}

//时间戳
const beforeSubmit = (f) => {
  try {
    if (typeof f.start_time === "string") {
      f.start_time = new Date(f.start_time).getTime();
    }
    if (typeof f.end_time === "string") {
      f.end_time = new Date(f.end_time).getTime();
    }
  } catch (error) {
    console.error("Invalid date format:", error);
  }
  return f;
};

const timerange = computed({
  get() {
    return form.start_time && form.end_time
      ? [form.start_time, form.end_time]
      : [];
  },
  set(val) {
    form.start_time = val[0];
    form.end_time = val[1];
  },
});

//删除失效状态
const handleStatusChange = (status, row) => {
  loading.value = true;
  updateCouponStatus(row.id, status)
    .then((res) => {
      toast("修改状态成功");
      row.status = status;
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<style scoped>
.active {
  @apply border-rose-200 bg-rose-50 text-red-400;
}

.inactive {
  @apply border-gray-200 bg-gray-50 text-gray-400;
}
</style>
