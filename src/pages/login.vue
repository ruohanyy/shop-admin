<template>
  <div>
    <el-row style="min-height: 100vh" class="login-container">
      <el-col :lg="16" :md="12" class="left">
        <div>
          <div>欢迎光临</div>
        </div></el-col
      >
      <el-col :lg="8" :md="12" class="rigth">
        <h2 class="title">欢迎回来</h2>
        <div>
          <span class="lith"></span>
          <span>账号密码登录</span>
          <span class="lith"></span>
        </div>
        <el-form ref="formRef" :rules="rules" :model="form" class="w-[250px]">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名：admin">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              show-password
              v-model="form.password"
              placeholder="请输入密码：admin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              round
              color="#626aef"
              class="w-[250px]"
              type="primary"
              @click="onSubmit"
              :loading="loading"
              >登 录</el-button
            >
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { toast } from "~/composables/util";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const form = reactive({
  username: "",
  password: "",
});

//表单效验
const rules = {
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
};

//操控表单数据
const formRef = ref(null);
//登录loading 防止用户一直点登录
const loading = ref(false);

//点击登录
const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    loading.value = true;
    //获取登录接口数据
    store
      .dispatch("login", form)
      .then((res) => {
        toast("登录成功");
        router.push("/");
      })
      .finally(() => {
        loading.value = false;
      });
  });
};

//监听回车事件
function onKeyUp(e){
    if(e.key == "Enter") onSubmit()
}

//添加键盘监听
onMounted(()=>{
    document.addEventListener("keyup",onKeyUp)
})
//移除键盘监听
onBeforeUnmount(()=>{
    document.removeEventListener("keyup",onKeyUp)
})
</script>

<style scoped>
.login-container {
  @apply bg-indigo-400;
}
.left {
  @apply flex items-center justify-center;
}
.left > div > div {
  @apply font-bold text-5xl text-light-50;
}
.rigth {
  @apply bg-light-50 flex items-center justify-center flex-col;
}
.title {
  @apply font-bold text-3xl text-gray-800;
}
.rigth > div {
  @apply flex items-center justify-center my-5 text-gray-300 space-x-2;
}
.lith {
  @apply h-[1px] w-16 bg-gray-200;
}
</style>
