<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text=""
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 列的模板展示 -->
        <template slot="isOk" slot-scope="scope">
          <i
            v-if="!scope.row.cat_deleted"
            class="el-icon-success"
            style="color: #57c3c2"
          ></i>
          <i v-else class="el-icon-error" style="color: #ed5a65"></i>
        </template>
        <!-- 排序 列的模板展示 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 列的模板展示 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateVisible"
      width="50%"
      @close="addCateClosed"
    >
      <!-- 主体内容 -->
      <el-form
        :model="addCateForm"
        :rules="addCateRule"
        ref="addCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定数据源 -->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 下方按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editCateVisible"
      width="50%"
      @close="editCateClosed"
    >
      <!-- 主体内容 -->
      <el-form
        :model="editCateForm"
        :rules="addCateRule"
        ref="editCateRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="修改分类" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 下方按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      //   查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //   获取的商品分类  作为表格的数据源
      catelist: [],
      total: 0,
      //   指定表格每一列的属性
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          // 定义模板名称
          template: "isOk",
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 定义模板名称
          template: "order",
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 定义模板名称
          template: "opt",
        },
      ],
      // 添加分类对话框的显示与隐藏
      addCateVisible: false,
      // 添加分类的数据
      addCateForm: {
        // 将要添加分类的名称
        cat_name: "",
        // 父级的id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0,
      },
      // 添加分类的验证规则
      addCateRule: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true,
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 编辑分类对话框的显示与隐藏
      editCateVisible: false,
      // 将被编辑的分类数据
      editCateForm: {},
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: ret } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.catelist = ret.data.result;
      this.total = ret.data.total;
    },
    // 监听 pagesize 变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听 当前页 变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击展示添加分类对话框
    showAddCateDialog() {
      // 展示之前先获取所有父级分类
      this.getParentCate();
      this.addCateVisible = true;
    },
    // 获取所有父级分类
    async getParentCate() {
      const { data: ret } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      // console.log(ret.data);
      this.parentCateList = ret.data;
    },
    // 选项发生改变触发
    handleChange() {
      // console.log(this.selectedKeys);
      // selectedKeys保存的是选中的父级分类的id
      // 如果 selectedKeys 为空，则未选择父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 对话框关闭重置表单和级联选择框
    addCateClosed() {
      this.$refs.addCateRef.resetFields();
      // 清空级联选择框的数据
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 点击确定添加分类
    addCate() {
      //  预验证
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) return;
        // 发送请求添加分类
        const { data: ret } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (ret.meta.status !== 201) return this.$msg.error(ret.meta.msg);
        this.$msg.success("添加分类成功");
        this.getCateList();
        this.addCateVisible = false;
      });
    },
    // 点击展示编辑分类对话框
    async showEditCateDialog(id) {
      const { data: ret } = await this.$http.get("categories/" + id);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      // console.log(ret.data);
      this.editCateForm = ret.data;
      this.editCateVisible = true;
    },
    // 编辑分类对话框关闭事件
    editCateClosed() {
      this.$refs.editCateRef.resetFields();
    },
    // 点击确定发送请求修改
    editCate() {
      // 预验证
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) return;
        const { data: ret } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        );
        if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
        this.$msg.success("修改分类成功");
        this.getCateList();
        this.editCateVisible = false;
      });
    },
    // 删除分类
    async removeCate(id) {
      // 弹出删除询问框
      const confirmRet = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmRet);
      if (confirmRet !== "confirm") return this.$msg.info("已取消删除");
      // 发送请求删除分类
      const { data: ret } = await this.$http.delete("categories/" + id);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("删除成功");
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>