import { ref, reactive } from "vue";
import { logout, updatepassword } from "~/api/manager";
import { toast, showModal } from "~/composables/util";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

//修改密码主要逻辑
export function useRepassword() {
    const store = useStore();
    const router = useRouter();
    //操控组件ref
    const formDrawerRef = ref(null);
    const form = reactive({
      oldpassword: "",
      password: "",
      repassword: "",
    });
    //表单效验
    const rules = {
      oldpassword: [
        {
          required: true,
          message: "旧密码不能为空",
          trigger: "blur",
        },
      ],
      password: [
        {
          required: true,
          message: "新密码不能为空",
          trigger: "blur",
        },
      ],
      repassword: [
        {
          required: true,
          message: "确认密码不能为空",
          trigger: "blur",
        },
      ],
    };
    //操控表单
    const formRef = ref(null);
    //修改密码
    const onSubmit = () => {
      formRef.value.validate((valid) => {
        if (!valid) {
          return;
        }
        //开启loading
        formDrawerRef.value.showLoading();
        updatepassword(form)
          .then((res) => {
            toast("修改密码成功，请重新登录");
            //退出登录
            store.dispatch("logout");
            router.push("/login");
          })
          .finally(() => {
            //关闭loading
            formDrawerRef.value.hideLoading();
          });
      });
    };
    const openRePasswordForm = () => {
      formDrawerRef.value.open();
    };
    return {
      formDrawerRef,
      form,
      rules,
      formRef,
      onSubmit,
      openRePasswordForm
    }
  }

//退出登录主要逻辑
export function useLogout() {
    const store = useStore();
    const router = useRouter();
    //退出登录
    const handleLogout = () => {
      //获取封装弹窗组件
      showModal("是否要退出登录？", "退出登录").then((res) => {
        logout().finally(() => {
          //获取vuex退出登录接口
          store.dispatch("logout");
          router.push("/login");
          toast("退出登录成功");
        });
      });
    };
    return {
      handleLogout,
    };
  }