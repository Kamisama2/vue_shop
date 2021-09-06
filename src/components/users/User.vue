<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 栅格系统 -->
        <el-col :span="10">
          <!-- 搜索框 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格展示区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="邮箱" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- 作用域插槽 -->
          <template slot-scope="userScope">
            <el-switch
              v-model="userScope.row.mg_state"
              @change="userStateChanged(userScope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- 作用域插槽 -->
          <template slot-scope="userScope">
            <!-- 编辑 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUserMsg(userScope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(userScope.row.id)"
            ></el-button>
            <!-- tooltip提供文字提示 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showRoleInfo(userScope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加用户的对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="resetAddForm"
      >
        <!-- 主体内容 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑用户的对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="resetEditForm"
      >
        <!-- 主体内容 -->
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="100px"
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色的对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleVisible"
        width="50%"
        @close="setRoleClose"
      >
        <!-- 主体内容 -->
        <div>
          <p>当前的用户: {{ userInfo.username }}</p>
          <p>当前的角色: {{ userInfo.role_name }}</p>
          <p>
            分配新角色:
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
        </div>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "User",
  data() {
    // 自定义校验规则
    //   1.邮箱自定义验证规则
    var checkEmail = (rules, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (!regEmail.test(value)) return callback(new Error("请输入合法的邮箱"));
      return callback();
    };
    //   2.密码自定义验证规则
    var checkMobile = (rules, value, callback) => {
      // 验证密码的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (!regMobile.test(value))
        return callback(new Error("请输入合法的手机号"));
      return callback();
    };

    return {
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      // 添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //    添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //    添加用户的表单数据验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 编辑用户信息对话框的显示与隐藏
      editDialogVisible: false,
      //    根据id获取的用户信息
      editForm: {},
      //    编辑用户信息对话框验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },

      // 分配角色对话框的显示与隐藏
      setRoleVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 角色列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: ret } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      //   console.log(ret);
      this.userlist = ret.data.users;
      this.total = ret.data.total;
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      //   console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值变化
    handleCurrentChange(newPage) {
      //   console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听用户状态事件
    async userStateChanged(userinfo) {
      //   console.log(userinfo);
      const { data: ret } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      //   console.log(ret);
      if (ret.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$msg.error("修改用户状态失败！");
      }
      this.$msg.success("修改用户状态成功");
    },
    // 添加用户对话框关闭重置表单事件
    resetAddForm() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击确定添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        // 发起请求添加用户数据
        const { data: ret } = await this.$http.post("users", this.addForm);
        if (ret.meta.status !== 201) return this.$msg.error(meta.msg);
        this.$msg.success("添加用户成功");
        this.addDialogVisible = false;
        this.getUserList();
      });
    },
    // 点击编辑用户信息
    async editUserMsg(id) {
      // 通过id发送请求获取当前用户信息
      const { data: ret } = await this.$http.get(`users/${id}`);
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      // 获取成功，将数据保存在 editForm 中
      this.editForm = ret.data;

      this.editDialogVisible = true;
    },
    // 编辑对话框关闭重置表单事件
    resetEditForm() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击确定修改用户信息
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发送请求修改用户信息
        const { data: ret } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        // console.log(ret);
        if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
        this.$msg.success("更新用户信息成功");
        // 重新获取用户信息
        this.getUserList();
        // 关闭对话框
        this.editDialogVisible = false;
      });
    },
    // 删除用户事件
    async removeUser(id) {
      //删除之前的弹出框
      const confirmRet = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //   console.log(confirmRet);
      // 点击确定结果是字符串 confirm
      // 点击取消结果是字符串 cancel
      if (confirmRet !== "confirm") return this.$msg.info("已取消删除");

      // 发送请求删除当前用户信息
      const { data: ret } = await this.$http.delete("users/" + id);
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("删除用户成功");
      this.getUserList();
    },
    //展示分配角色对话框
    async showRoleInfo(userInfo) {
      this.userInfo = userInfo;

      // 先获取角色列表 保存到data中
      const { data: ret } = await this.$http.get("roles");
      // console.log(ret.data);s
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.rolesList = ret.data;
      this.setRoleVisible = true;
    },
    // 点击确定分配角色
    async setRole() {
      if (!this.selectedRoleId) return this.$msg.error("请选择要分配的角色!");

      const { data: ret } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      );
      // console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("分配角色成功");
      this.getUserList();
      this.setRoleVisible = false;
    },
    // 分配角色对话框关闭重置对话框
    setRoleClose() {
      this.selectedRoleId = "";
      this.userInfo = {};
    },
  },
};
</script>

<style lang="less" scoped>
</style>