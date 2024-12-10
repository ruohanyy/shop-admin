import { ref } from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { useCookies } from "@vueuse/integrations/useCookies";
import { router } from "~/router";

export function useTabList() {
  const route = useRoute();
  const cookie = useCookies();

  const activeTab = ref(route.path);
  const tabList = ref([
    {
      title: "后台首页",
      path: "/",
    }
  ]);

  //添加标签导航
  const addTab = (tab) => {
    //使用findIndex查找是否有径相同的标签 有相同标签就等于-1 不进行添加 findIndex方法空数组不会执行
    let noTab = tabList.value.findIndex((t) => t.path == tab.path) == -1;
    //否则就进行添加标签导航
    if (noTab) {
      tabList.value.push(tab);
    }
    //更新后的标签保存到cookie中
    cookie.set("tabList", tabList.value);
  };

  //标签导航到新的页面 导航守卫控制路由变化
  onBeforeRouteUpdate((to, from) => {
    //点击菜单 让标签导航栏处于激活状态
    activeTab.value = to.path;
    // 添加新的标签
    addTab({
      title: to.meta.title,
      path: to.path,
    });
  });

  // 有标签导航情况 刷新不会消失
  function initTabList() {
    //拿到之前cookie保存的标签
    let tbs = cookie.get("tabList");
    if (tbs) {
      tabList.value = tbs;
    }
  }
  //初始化标签
  initTabList();

  //点击标签导航栏跳转页面
  const changeTab = (t) => {
    activeTab.value = t
    router.push(t)
}

  //关闭标签导航栏
  const removeTab = (t) => {
    let tabs = tabList.value;
    let a = activeTab.value;
    //判断删除的标签是否为激活状态
    if (a == t) {
      // 遍历标签列表，找到下一个或上一个标签作为新的激活标签
      tabs.forEach((tab, index) => {
        if (tab.path == t) {
          const nextTab = tabs[index + 1] || tabs[index - 1];
          if (nextTab) {
            a = nextTab.path;
          }
        }
      });
    }
    // 更新当前激活的标签
    activeTab.value = a;
    //删除不是激活状态的标签 filter方法创建一个新数组
    tabList.value = tabList.value.filter((tab) => tab.path != t);
    // 将更新后的标签保存到cookie中
    cookie.set("tabList", tabList.value);
    router.push(a)
  };

  //关闭其他或者全部标签
  const handleClose = (e) => {
    if (e == "clearAll") {
      //切换首页
      activeTab.value = "/";
      //过滤只剩首页
      tabList.value = [
        {
          title: "后台首页",
          path: "/",
        },
      ];
    } else if (e == "clearOther") {
      tabList.value = tabList.value.filter(
        (tab) => tab.path == "/" || tab.path == activeTab.value
      );
    }
    cookie.set("tabList", tabList.value);
    router.push(activeTab.value)
  };

  return {
    activeTab,
    tabList,
    changeTab,
    removeTab,
    handleClose,
  };
}
