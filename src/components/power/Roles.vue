<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
              </el-col>
              <!-- 二级与三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRight(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRight(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="roleScope">
            <!-- {{ roleScope.row }} -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoleMsg(roleScope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(roleScope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRightTree(roleScope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色的弹出框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleVisible"
        width="50%"
        @close="resetAddForm"
      >
        <!-- 主体内容 -->
        <el-form
          ref="addRoleRef"
          :model="addRoleForm"
          :rules="addRoleRules"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑角色的弹出框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="editRoleVisible"
        width="50%"
        @close="resetEditForm"
      >
        <!-- 主体内容 -->
        <el-form
          ref="editRoleRef"
          :model="editRoleForm"
          :rules="addRoleRules"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限的弹出框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="rightsVisible"
        width="50%"
        @close="resetDefKeys"
      >
        <!-- 主体内容 -->
        <el-tree
          :data="rightList"
          :props="treeProps"
          ref="rightTreeRef"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
        ></el-tree>
        <!-- 下方按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="rightsVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      // 添加角色对话框的显示与隐藏
      addRoleVisible: false,
      //    添加的角色信息
      addRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      //    添加角色的规则验证
      addRoleRules: {
        roleName: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
      // 编辑角色对话框的显示与隐藏
      editRoleVisible: false,
      //    编辑的角色信息
      editRoleForm: {},

      // 角色权限对话框的显示与隐藏
      rightsVisible: false,
      // 角色权限列表
      rightList: [],
      // 树形结构显示的内容
      treeProps: {
        children: "children",
        label: "authName",
      },
      // node-key用id来标识树节点唯一性，则这里面保存的是id的数组，默认显示的树节点
      defKeys: [],
      //   保存当前角色id
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: ret } = await this.$http.get("roles");
      console.log(ret.data);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.rolesList = ret.data;
    },
    // 监听添加角色对话框的关闭事件
    resetAddForm() {
      this.$refs.addRoleRef.resetFields();
    },
    // 点击添加角色
    addRole() {
      // 预验证之后再发送请求添加
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) return;
        // 发送请求添加数据
        const { data: ret } = await this.$http.post("roles", this.addRoleForm);
        if (ret.meta.status !== 201) return this.$msg.error(meta.msg);
        this.$msg.success("添加角色信息成功");
        this.getRolesList();
        this.addRoleVisible = false;
      });
    },
    // 编辑角色信息
    async editRoleMsg(id) {
      // 通过id获取点击的角色信息
      const { data: ret } = await this.$http.get("roles/" + id);
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      // 获取成功，将数据保存在 editForm 中
      this.editRoleForm = ret.data;
      this.editRoleVisible = true;
    },
    // 监听编辑角色对话框的关闭事件
    resetEditForm() {
      this.$refs.editRoleRef.resetFields();
    },
    // 点击确定发送请求修改角色信息
    editRole() {
      // 发送请求之前预验证
      this.$refs.editRoleRef.validate(async (valid) => {
        if (!valid) return;

        // 发送请求
        const { data: ret } = await this.$http.put(
          "roles/" + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          }
        );
        // console.log(ret);
        if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
        this.$msg.success("更新角色信息成功");
        this.getRolesList();
        this.editRoleVisible = false;
      });
    },
    // 删除角色
    async removeRole(id) {
      // 删除之前弹框
      const confirmRet = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 点击确定结果是字符串 confirm
      // 点击取消结果是字符串 cancel
      if (confirmRet !== "confirm") return this.$msg.info("已取消删除");

      // 点击确定发起请求删除角色
      const { data: ret } = await this.$http.delete("roles/" + id);
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("删除角色成功");
      this.getRolesList();
    },

    // 删除指定的权限
    async removeRight(role, rightId) {
      // 删除之前弹框
      const confirmRet = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmRet !== "confirm") return this.$msg.info("已取消删除");
      // 发送请求
      const { data: ret } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      //   console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("删除权限成功");

      //   this.getRolesList();   会重新刷新页面
      // 删除之后会返回最新的权限
      role.children = ret.data;
    },
    // 显示分配权限
    async showRightTree(role) {
      // 将当前id保存供后续分配权限使用
      this.roleId = role.id;
      // 发送请求获取权限的树形数据
      const { data: ret } = await this.$http.get("rights/tree");
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.rightList = ret.data;

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      this.rightsVisible = true;
    },
    // 通过递归形式，获取 三级id 并存在 defKeys中
    getLeafKeys(node, arr) {
      // 三级节点没有children属性
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr));
    },
    // 关闭分配权限对话框重置defKeys
    resetDefKeys() {
      this.defKeys = [];
    },
    // 点击确定分配权限,角色授权
    async allotRights() {
      // getCheckedKeys() getHalfCheckedKeys() 获取全选中和半选中的id
      const id = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys(),
      ];
      const idStr = id.join(",");

      // 发起请求分配权限
      const { data: ret } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.$msg.success("分配权限成功");
      this.getRolesList();
      this.rightsVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>