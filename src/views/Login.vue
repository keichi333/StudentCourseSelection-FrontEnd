<template>
  <div class="login-page">
    <h1 class="page-title">SHU选课管理系统</h1>
    <div class="login-container">
      <!-- 身份选择 -->
      <el-radio-group v-model="role" style="margin-bottom: 20px;">
        <el-radio label="student">学生</el-radio>
        <el-radio label="teacher">老师</el-radio>
        <el-radio label="admin">管理员</el-radio>
      </el-radio-group>

      <!-- 学号输入框 -->
      <el-input v-model="studentId" placeholder="请输入学号/工号" style="width: 300px; margin-bottom: 20px;"></el-input>

      <!-- 密码输入框 -->
      <el-input type="password" v-model="password" placeholder="请输入密码"
        style="width: 300px; margin-bottom: 20px;"></el-input>

      <!-- 登录按钮 -->
      <el-button type="primary" @click="login" style="width: 300px;">登录</el-button>

    </div>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      studentId: '',
      password: '',
      role: 'student',  // 默认角色为学生
    };
  },
  mounted() {
    // 禁用滚轮
    window.addEventListener('wheel', this.preventScroll, { passive: false });
  },
  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('wheel', this.preventScroll);
  },
  methods: {
    async login() {
      try {
        // 根据选择的身份，构建请求的 URL 和跳转页面
        let apiUrl;
        let redirectUrl;

        if (this.role === 'student') {
          apiUrl = 'http://localhost:8081/login';
          redirectUrl = '/student';
        } else if (this.role === 'teacher') {
          apiUrl = '#';
          redirectUrl = '/teacher';
        } else if (this.role === 'admin') {
          apiUrl = '#';
          redirectUrl = '/admin';
        }

        // 向后端发送登录请求
        const response = await axios.post(apiUrl, {
          studentId: this.studentId,
          password: this.password,
        });

        // 判断响应码，如果成功（code == 1），获取并存储 JWT
        if (response.data.code === 1) {
          // 获取后台返回的 JWT 令牌
          const token = response.data.data; // 令牌是返回数据的 'data' 字段

          // 存储 JWT 令牌到 localStorage
          localStorage.setItem('token', token);

          // 登录成功，跳转到对应页面
          this.$router.push(redirectUrl);
        } else {
          // 登录失败，提示错误信息
          this.$message.error(response.data.msg || '用户名或密码错误');
        }
      } catch (error) {
        // 请求失败时的处理
        this.$message.error('登录请求失败，请稍后重试');
      }
    },

    preventScroll(event) {
      event.preventDefault(); // 阻止默认滚动行为
    },
  },
};
</script>

<style scoped>
/* 禁用页面滚动 */
html, body {
  overflow: hidden; /* 禁止页面滚动 */
  height: 100%; /* 确保页面高度为100% */
}

.login-page {
  background-color: #2a3d66; /* 墨蓝色背景 */
  height: 100vh;  /* 设置为视口高度，确保页面占满整个屏幕 */
  display: flex;
  justify-content: flex-start; /* 使内容向上对齐 */
  align-items: center; /* 使内容向左对齐 */
  flex-direction: column;
  padding-top: 100px; /* 给页面顶部留出空间 */
}
/* 页面的标题 */
.page-title {
  font-size: 40px;  /* 将标题字体调大 */
  font-weight: bold;
  color: white;
  margin-bottom: 0px; /* 减少标题下方的间距 */
}

.login-container {
  width: 400px;
  margin: 80px auto;
  text-align: center;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  background-color: #f9f9f9;
}

.el-radio-group {
  margin-bottom: 20px;
}

.el-input {
  margin-bottom: 20px;
}

.el-button {
  width: 100%;
}

.footer-text {
  margin-top: 20px;
  font-size: 14px;
  color: #888;
}

.footer-text a {
  color: #409EFF;
  text-decoration: none;
}

.footer-text a:hover {
  text-decoration: underline;
}
</style>
