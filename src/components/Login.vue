<template>
  <div class="login" :class="colorChange">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avater">
        <img src="../assets/5.jpg" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <!-- 下方按钮 -->
        <el-form-item prop="password" class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      bgcolorArr: ["bgcolor1", "bgcolor2", "bgcolor3", "bgcolor4", "bgcolor5"],
      colorChange: "",
      // 登录表单绑定的数据
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 登录表单绑定的数据验证规则
      loginFormRules: {
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
      },
    };
  },
  mounted() {
    this.timer = setInterval(() => {
      const index = Math.floor(Math.random() * 5);
      this.colorChange = this.bgcolorArr[index];
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    reset() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      // 预验证表单数据
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: ret } = await this.$http.post("login", this.loginForm);
        // console.log(ret);
        if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
        // 登录成功，提示消息，保存token，路由跳转
        this.$msg.success("登录成功");
        window.sessionStorage.setItem("token", ret.data.token);
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.bgcolor1 {
  background: -webkit-linear-gradient(
    left bottom,
    #f2cac9,
    #bdaead,
    #efafad
  ) !important;
}
.bgcolor2 {
  background: -webkit-linear-gradient(
    left bottom,
    rgb(179, 255, 228),
    rgb(173, 255, 180)
  ) !important;
}
.bgcolor3 {
  background: -webkit-linear-gradient(
    left bottom,
    rgb(218, 184, 255),
    rgb(239, 158, 255)
  ) !important;
}
.bgcolor4 {
  background: -webkit-linear-gradient(
    left bottom,
    rgb(189, 255, 211),
    rgb(216, 255, 153)
  ) !important;
}
.bgcolor5 {
  background: -webkit-linear-gradient(
    left bottom,
    rgb(255, 227, 189),
    rgb(189, 248, 255)
  ) !important;
}
.login {
  height: 100%;
  background: -webkit-linear-gradient(left bottom, #f2cac9, #bdaead, #efafad);
  .login-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background: rgba(0, 0, 0, 0.2);
    .avater {
      width: 130px;
      height: 130px;
      border: 1px solid #ccc;
      border-radius: 50%;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .login-form {
      position: absolute;
      bottom: 0;
      padding: 20px;
      width: 100%;
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
