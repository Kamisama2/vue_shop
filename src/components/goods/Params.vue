<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cate_select">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 1. 动态参数页签内容 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisbled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格区域 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加标签与输入框切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>

            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 2. 静态属性页签内容 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisbled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格区域 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加标签与输入框切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>

            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  size="mini"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加的对话框 -->
      <el-dialog
        :title="'添加' + titleDialog"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 主体内容 -->
        <el-form
          :model="addForm"
          :rules="addRules"
          ref="addRef"
          label-width="100px"
        >
          <el-form-item :label="labelDialog" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑的对话框 -->
      <el-dialog
        :title="'修改' + titleDialog"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 主体内容 -->
        <el-form
          :model="editForm"
          :rules="editRules"
          ref="editRef"
          label-width="100px"
        >
          <el-form-item :label="labelDialog" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      catelist: [],
      //   级联选择框的配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 级联选择框双向绑定到的数组
      selectedKeys: [],
      //   选中的页签名称
      activeName: "many",
      //   获取的动态参数数据
      manyTableData: [],
      //   获取的静态属性数据
      onlyTableData: [],
      // 添加属性和参数对话框的显示与隐藏
      addDialogVisible: false,
      //   添加的数据
      addForm: {
        attr_name: "",
      },
      //   添加的数据验证规则
      addRules: {
        attr_name: {
          required: true,
          message: "请输入活动名称",
          trigger: "blur",
        },
      },
      //   编辑属性和参数对话框的显示与隐藏
      editDialogVisible: false,
      //   编辑的数据
      editForm: {},
      //   编辑的数据验证规则
      editRules: {
        attr_name: {
          required: true,
          message: "请输入活动名称",
          trigger: "blur",
        },
      },
    };
  },
  computed: {
    isDisbled() {
      if (this.selectedKeys.length !== 3) {
        return true;
      } else {
        return false;
      }
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedKeys.length == 3) {
        return this.selectedKeys[2];
      } else {
        return null;
      }
    },
    // 对话框标题
    titleDialog() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
    // 添加的属性还是参数
    labelDialog() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: ret } = await this.$http.get("categories");
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.catelist = ret.data;
    },
    // 级联选择框选项改变时触发
    handleChange() {
      this.getParamsList();
    },
    // 页签点击切换触发
    handleClick() {
      this.getParamsList();
    },
    // 获取参数列表
    async getParamsList() {
      // 只能选中三级分类：通过 selectedKeys 判断
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const { data: ret } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);

      // 将数据存入data之前,处理展开行需要的标签数据
      ret.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 循环给每一项添加 inputVisible,控制切换
        item.inputVisible = false;
        // 循环给每一项添加 inputValue,绑定输入的值
        item.inputValue = "";
      });
      console.log(ret.data);

      // 根据 activeName 将获取的数据储存在不同的data中
      if (this.activeName === "many") {
        this.manyTableData = ret.data;
      } else {
        this.onlyTableData = ret.data;
      }
    },
    // 添加的对话框关闭事件
    addDialogClosed() {
      this.$refs.addRef.resetFields();
    },
    // 点击确定添加
    addParams() {
      // 预验证
      this.$refs.addRef.validate(async (valid) => {
        if (!valid) return;
        // 发送请求添加
        const { data: ret } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        // console.log(ret);
        if (ret.meta.status !== 201) return this.$msg.error(ret.meta.msg);
        this.$msg.success("添加成功");
        this.getParamsList();
        this.addDialogVisible = false;
      });
    },
    // 展示编辑对话框
    async showEditDialog(attr_id) {
      // 发送请求查询当前数据
      const { data: ret } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { attr_sel: this.activeName }
      );
      //   console.log(ret.data);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.editForm = ret.data;
      this.editDialogVisible = true;
    },
    // 编辑的对话框关闭事件
    editDialogClosed() {
      this.$refs.editRef.resetFields();
    },
    // 点击确定发送请求修改数据
    editParams() {
      // 预验证
      this.$refs.editRef.validate(async (valid) => {
        if (!valid) return;
        // 发送请求提交修改
        const { data: ret } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        // console.log(ret);
        if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
        this.$msg.success("修改数据成功");
        this.getParamsList();
        this.editDialogVisible = false;
      });
    },
    // 删除
    async removeParams(attr_id) {
      // 删除之前的弹出框
      const confirmRet = await this.$confirm(
        "此操作将永久删除该数据, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmRet !== "confirm") return this.$msg.info("已取消删除");
      //   发送请求删除
      const { data: ret } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("删除成功");
      this.getParamsList();
    },
    // 输入框失去焦点或者按下 enter 键触发
    handleInputConfirm(row) {
      // 如果输入框都是空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 如果输入的数据是合法的,则将数据储存在 attr_vals 数组中
      row.attr_vals.push(row.inputValue.trim());
      row.inputVisible = false;
      row.inputValue = "";
      this.saveAttrVals(row);
    },
    // 点击添加标签按钮触发
    showInput(row) {
      row.inputVisible = true;
      //   $nextTick等页面渲染完成再调用其中的函数
      this.$nextTick((_) => {
        //   自动获取焦点
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 将修改后的标签保存到后台
    async saveAttrVals(row) {
      // 后台接收的 attr_vals 是空格隔开的字符串
      const { data: ret } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("更新数据成功");
    },
    // 删除标签
    handleClose(i, row) {
      // 根据索引,将当前项从数组中移除
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
  },
};
</script>

<style lang="less" scoped>
.cate_select {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>