<template>
  <div class="f-menu" :style="{ width: $store.state.asideWidth }">
    <el-menu
      class="el-menu-vertical-demo"
      @select="handleSelect"
      :collapse="isCollapse"
      :collapse-transition="false"
      unique-opened
      :default-active="defaultActive"
    >
      <template v-for="(item, index) in asideMenus" :key="index">
        <el-sub-menu
          v-if="item.child && item.child.length > 0"
          :index="item.name"
        >
          <!-- 一级菜单 -->
          <template #title>
            <el-icon> <component :is="item.icon"></component></el-icon>
            <span>{{ item.name }}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item
            v-for="(item2, index2) in item.child"
            :key="index2"
            :index="item2.frontpath"
            ><el-icon> <component :is="item2.icon"></component></el-icon>
            <span>{{ item2.name }}</span></el-menu-item
          >
        </el-sub-menu>
        <!-- 没有二级菜单 就正常显示 -->
        <el-menu-item v-else :index="item.frontpath"
          ><el-icon> <component :is="item.icon"></component></el-icon>
          <span>{{ item.name }}</span></el-menu-item
        >
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from "vuex";
import { useRoute, useRouter,onBeforeRouteUpdate  } from "vue-router";
const store = useStore();
const route = useRoute()
const router = useRouter();

const defaultActive = ref(route.path)

onBeforeRouteUpdate((to, from) =>{
  defaultActive.value = to.path
})

//是否折叠菜单
const isCollapse = computed(()=> !(store.state.asideWidth == '250px'))
const asideMenus = computed(() => (store.state.menus))

const handleSelect = (e) => {
  router.push(e)
};
</script>

<style scoped>
.f-menu {
  transition: all 0.2s;
  top: 64px;
  bottom: 0;
  left: 0;
  overflow-y: auto;
  overflow-x: hidden;
  @apply shadow-md fixed bg-light-50;
}
.f-menu::-webkit-scrollbar {
    width: 0px;
}

.el-menu {
    border-width: 0px;
}
</style>
