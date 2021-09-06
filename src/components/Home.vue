<template>
  <el-container class="homePage">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <div class="header-img">
          <img src="../assets/5.jpg" alt="" />
        </div>
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边菜单栏 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="(item, index) in menulsit"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconObj[index]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveNavState('/' + subitem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menulsit: [],
      iconObj: {
        0: "iconfont icon-user",
        1: "iconfont icon-tijikongjian",
        2: "iconfont icon-shangpin",
        3: "iconfont icon-danju",
        4: "iconfont icon-baobiao",
      },
      // 侧边栏是否展开
      isCollapse: false,
      // 高亮的菜单栏
      activePath: "",
    };
  },
  created() {
    this.getMenus();
    // 页面创建 从sessionStorage取出高亮状态的值
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    logout() {
      // 点击清除 sessionStorage  重定向到登录页面
      window.sessionStorage.removeItem("token");
      window.sessionStorage.removeItem("activePath");
      this.$router.push("/login");
    },
    async getMenus() {
      const { data: ret } = await this.$http.get("menus");
      // console.log(ret);
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.menulsit = ret.data;
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    saveNavState(activePath) {
      this.activePath = activePath;
      // 将高亮状态保存在 sessionStorage
      window.sessionStorage.setItem("activePath", activePath);
    },
  },
};
</script>


<style lang="less" scoped>
.homePage {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 20px;
  padding-left: 0;
  > div {
    display: flex;
    align-items: center;
    .header-img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin: 0 10px;
      img {
        width: 100%;
        border-radius: 50%;
        margin-right: 15px;
      }
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4a5064;
    color: #fff;
    text-align: center;
    line-height: 24px;
    font-size: 10px;
    letter-spacing: 0.3em;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 15px;
}
</style>