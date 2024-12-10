<template>
  <el-container>
    <el-header>
      <FHeader></FHeader>
    </el-header>
    <el-container>
      <el-aside :width="$store.state.asideWidth"><FMenu></FMenu></el-aside>
      <el-main>
        <FTagList></FTagList>
        <router-view v-slot="{ Component }">
          <!--  动画效果  -->
          <transition name="fade">
            <!-- 路由缓存 -->
            <KeepAlive>
              <component :is="Component" />
            </KeepAlive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import FHeader from "./components/FHeader.vue";
import FMenu from "./components/FMenu.vue";
import FTagList from "./components/FTagList.vue";
</script>

<style scoped>
.el-aside{
    transition: all 0.2s;
}
/* 动画效果 */
.fade-enter-from{
    opacity: 0;
}
.fade-enter-to{
    opacity: 1;
}
.fade-leave-from{
    opacity: 1;
}
.fade-leave-to{
    opacity: 0;
}
.fade-enter-active,
.fade-leave-active{
    transition: all 0.3s;
}
.fade-enter-active{
    transition-delay: 0.3s;
}
</style>
