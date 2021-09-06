<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部提示区域 -->
      <el-alert title="消息提示的文案" type="info" center show-icon> </el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表格和标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          tabPosition="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="handleTabChange()"
        >
          <!-- 基本信息模块 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品参数模块 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 通过循环渲染 item 项 -->
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- 多选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cbox, index) in item.attr_vals"
                  :key="index"
                  :label="cbox"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品属性模块 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品图片模块 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- 
              headerObj 设置上传的请求头部 
              因为上传结构没有使用 axios,需要设置请求token
             -->
            <el-upload
              class="upload-demo"
              :action="picURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <!-- 商品内容模块 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addGoood"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
      <img :src="picSrc" alt="" class="picView" />
    </el-dialog>
  </div>
</template>

<script>
// 引入深拷贝模块
import _ from "lodash";

export default {
  name: "Add",
  data() {
    return {
      // 指定步骤条(数字型) 和 标签页切换(字符串)
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的商品分类
        goods_cat: [],
        // 上传的图片路径
        pics: [],
        // 商品描述
        goods_introduce: "",
        // 商品的参数
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" },
        ],
      },
      // 保存所有分类
      cateList: [],
      // 级联选择框配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 获取的商品参数数据
      manyTableData: [],
      // 获取的商品属性数据
      onlyTableData: [],
      // 图片上传的路径
      picURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 设置图片上传的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 控制图片预览对话框的显示与隐藏
      picDialogVisible: false,
      // 预览图片的src地址
      picSrc: "",
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      } else {
        return null;
      }
    },
  },
  methods: {
    async getCateList() {
      const { data: ret } = await this.$http.get("categories");
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      //   console.log(ret.data);
      this.cateList = ret.data;
    },
    // 级联选择框选项改变时触发
    handleChange() {
      // 只能选中三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // tab页签切换之前触发
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(activeName, oldActiveName);
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$msg.error("请选择商品分类！");
        return false;
      }
    },
    // tab 被选中时触发
    async handleTabChange() {
      // 根据 activeIndex 确定页签模块
      if (this.activeIndex === "1") {
        const { data: ret } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "many" } }
        );
        // console.log(ret.data);
        if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
        // 将获取的字符串数据转换成数组
        ret.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length !== 0 ? item.attr_vals.split(" ") : [];
        });
        this.manyTableData = ret.data;
      } else if (this.activeIndex === "2") {
        const { data: ret } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "only" } }
        );
        // console.log(ret.data);
        if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
        this.onlyTableData = ret.data;
      }
    },
    // 点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      // console.log(file);
      this.picSrc = file.response.data.url;
      this.picDialogVisible = true;
    },
    //文件列表移除文件时的钩子
    async handleRemove(file) {
      // console.log(file);
      // 1.获得被删除的图片路径
      const picPath = file.response.data.tmp_path;
      // 2.找到该路径在 pics 中的索引
      const index = this.addForm.pics.findIndex((item) => {
        item.pic === picPath;
      });
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm);
    },
    //文件上传成功时的钩子
    handleSuccess(response) {
      this.$msg.success("图片上传成功");
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 点击添加商品
    addGoood() {
      // 预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$msg.error("请填写必要的表单项！");

        // 预验证通过
        // 为了不影响双向绑定在页面中的数据，将addForm深拷贝
        // 在发送请求提交之前，对数据进行格式处理

        // 1.商品分类处理
        const form = _.cloneDeep(this.addForm);
        console.log(form);
        form.goods_cat = form.goods_cat.join(",");

        // 2.动态参数处理
        this.manyTableData.forEach((item) => {
          const manyDataObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          form.attrs.push(manyDataObj);
        });

        // 3.静态属性处理
        this.onlyTableData.forEach((item) => {
          const onlyDataObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          form.attrs.push(onlyDataObj);
        });

        // console.log(form);

        // 发送请求添加
        const { data: ret } = await this.$http.post("goods", form);
        // console.log(ret.data);
        if (ret.meta.status !== 201) return this.$msg.error(ret.meta.msg);
        this.$msg.success("添加商品成功");
        this.$router.push("/goods");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 2px 10px 0 0 !important;
}
.picView {
  width: 100%;
}
.addBtn {
  margin-top: 15px;
}
</style>