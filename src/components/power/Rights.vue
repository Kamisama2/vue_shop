<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 表格区域 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <!-- 根据level 显示不同的等级 -->
          <template slot-scope="rightMsg">
            <!-- {{ rightMsg.row }} -->
            <el-tag v-if="rightMsg.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-if="rightMsg.row.level === '1'"
              >二级</el-tag
            >
            <el-tag type="warning" v-if="rightMsg.row.level === '2'"
              >三级</el-tag
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data() {
    return {
      rightsList: [],
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    async getRightsList() {
      const { data: ret } = await this.$http.get("rights/list");
      //   console.log(ret.data);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.rightsList = ret.data;
    },
  },
};
</script>
