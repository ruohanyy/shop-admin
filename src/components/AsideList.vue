<template>
  <div class="aside-list" :class="{ active: active }">
    <!-- 分类标题 -->
    <span class="truncate"><slot /></span>
    <!-- 图标按钮 -->
    <el-button
      class="ml-auto px-1"
      text
      type="primary"
      size="small"
      @click="$emit('edit')"
      ><el-icon :size="12"><Edit /></el-icon
    ></el-button>
    <el-popconfirm
      title="是否要删除该分类？"
      confirmButtonText="确认"
      cancelButtonText="取消"
      @confirm="$emit('delete')"
    >
      <template #reference>
        <el-button class="ml-auto px-1" text type="primary" size="small"
          ><el-icon :size="12"><Close /></el-icon
        ></el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
});
//对外暴露两个点击按钮
defineEmits(["edit", "delete"]);
</script>

<style scoped>
.aside-list {
  border-bottom: 1px solid #f4f4f4;
  cursor: pointer;
  @apply flex items-center p-3 text-sm text-gray-600;
}
.aside-list:hover,
.active {
  @apply bg-blue-50;
}
</style>
