<template>
  <el-form
    :model="model"
    label-width="80px"
    size="small"
    class="mb-3"
  >
    <el-row :gutter="20">
         <!-- 默认插槽，用于插入基本的表单项 -->  
        <slot />
         <!-- 条件渲染的插槽，用于显示额外的搜索条件 -->  
      <template v-if="showSearch">
        <slot name="show" />
      </template>

      <el-col :span="8" :offset="showSearch ? 0 : 8">
        <div class="flex items-center justify-end">
          <el-button type="primary" @click="$emit('search')">搜索</el-button>
          <el-button @click="$emit('reset')">重置</el-button>
          <el-button type="primary" text @click="showSearch = !showSearch" v-if="hasShowSearch"
            >{{ showSearch ? "收起" : "展开" }}
            <el-icon>
                 <!-- 使用ArrowUp或ArrowDown图标，根据showSearch的值决定 -->  
              <ArrowUp v-if="showSearch" />
              <ArrowDown v-else />
            </el-icon>
          </el-button>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
import { ref,useSlots } from 'vue';
defineProps({
    model: Object
})
defineEmits(["search", "reset"])
const showSearch = ref(false)

const slots = useSlots()
const hasShowSearch = ref(!!slots.show)
</script>

<style lang="scss" scoped></style>
