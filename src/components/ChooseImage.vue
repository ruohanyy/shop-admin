<template>
  <div v-if="modelValue">
    <el-image
      v-if="typeof modelValue == 'string'"
      :src="modelValue"
      fit="cover"
      class="w-[100px] h-[100px] rounded border mr-2"
    ></el-image>
    <div v-else class="flex flex-wrap">
      <div
        class="relative mx-1 mb-2 w-[100px] h-[100px]"
        v-for="(url, index) in modelValue"
        :key="index"
      >
        <el-icon
          class="absolute right-[5px] top-[5px] cursor-pointer bg-white rounded-full"
          style="z-index: 10"
          @click="removeImage(url)"
          ><CircleClose
        /></el-icon>
        <el-image
          :src="url"
          fit="cover"
          class="w-[100px] h-[100px] rounded border mr-2"
        ></el-image>
      </div>
    </div>
  </div>

  <!-- 上传管理员头像按钮 -->
  <div class="choose-image-btn mb-2" @click="open">
    <el-icon :size="25" class="text-gray-500"><Plus /></el-icon>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="选择图片"
    width="80%"
    top="5vh"
    :before-close="handleClose"
  >
    <el-container class="bg-white rounded" style="height: 70vh">
      <el-header class="image-header">
        <el-button type="primary" size="small" @click="handleOpenCreate"
          >新增图片分类</el-button
        >
        <el-button type="warning" size="small" @click="handleOpenUpload"
          >上传图片</el-button
        >
      </el-header>
      <el-container>
        <ImageAside ref="ImageAsideRef" @change="handleAsideChange" />
        <ImageMain
          :limit="limit"
          openChoose
          ref="ImageMainRef"
          @choose="handleChoose"
        />
      </el-container>
    </el-container>

    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";
import ImageAside from "~/components/ImageAside.vue";
import ImageMain from "~/components/ImageMain.vue";
import { toast } from "~/composables/util";

const dialogVisible = ref(false);
const open = () => {
  dialogVisible.value = true;
};

const close = () => {
  dialogVisible.value = false;
};

const ImageAsideRef = ref(null);
//打开新增抽屉
const handleOpenCreate = () => {
  ImageAsideRef.value.handleCreate();
};
//
const ImageMainRef = ref(null);
//切换分类图片
const handleAsideChange = (image_class_id) =>
  ImageMainRef.value.loadData(image_class_id);

//上传图片
const handleOpenUpload = () => {
  ImageMainRef.value.openUploadFile();
};

const props = defineProps({
  modelValue: [String, Array],
  limit: {
    type: Number,
    default: 1,
  },
});
const emit = defineEmits(["update:modelValue"]);

//上传管理员图片
let urls = [];
const handleChoose = (e) => {
  urls = e.map((o) => o.url);
};

const submit = ()=>{
    let value = []
    if(props.limit == 1){
        value = urls[0]
    } else {
        value = [...props.modelValue,...urls]
        if(value.length > props.limit){
            return toast("最多还能选择"+ (props.limit - props.modelValue.length) + "张")
        }
    }
    if(value){
        emit("update:modelValue",value)
    }
    close()
}
const removeImage = (url) =>
  emit(
    "update:modelValue",
    props.modelValue.filter((u) => u != url)
  );
</script>

<style scoped>
.image-header {
  border-bottom: 1px solid #eeeeee;
  @apply flex items-center;
}
.choose-image-btn {
  @apply w-[100px] h-[100px] rounded border flex justify-center items-center cursor-pointer hover:(bg-gray-100);
}
</style>
