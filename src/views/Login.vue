<template>
  <div class="login-page">
    <h1 class="page-title">SHU选课管理系统</h1>
    <div class="login-container">
      <!-- 身份选择 -->
      <el-radio-group v-model="role" style="margin-bottom: 20px;">
        <el-radio label="student">学生</el-radio>
        <el-radio label="teacher">教师</el-radio>
        <el-radio label="admin">管理员</el-radio>
      </el-radio-group>

      <!-- 根据身份动态显示输入框 -->
      <el-input v-if="role === 'student'" v-model="studentId" placeholder="请输入学号"
        style="width: 300px; margin-bottom: 20px;"></el-input>
      <el-input v-if="role === 'teacher'" v-model="staffId" placeholder="请输入工号"
        style="width: 300px; margin-bottom: 20px;"></el-input>

      <!-- 密码输入框 -->
      <el-input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="请输入密码"
        style="width: 300px; margin-bottom: 20px;">
        <template slot="suffix">
          <i class="el-icon-view" @click="togglePasswordVisibility" style="font-size: 18px;"></i>
        </template>
      </el-input>

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
      studentId: '', // 学号
      staffId: '', // 工号
      password: '',
      role: 'student',  // 默认角色为学生
      showPassword: false,
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
          apiUrl = 'http://localhost:8081/login';  // 学生登录 API
          redirectUrl = '/student';
        } else if (this.role === 'teacher') {
          apiUrl = 'http://localhost:8081/login/teacher';  // 教师登录 API
          redirectUrl = '/teacher';
        } else if (this.role === 'admin') {
          // apiUrl = 'http://localhost:8081/admin/login';  // 管理员登录 API
          // redirectUrl = '/admin';
        }

        // 根据角色动态设置字段名
        const loginData = {
          password: this.password,
        };

        if (this.role === 'student') {
          loginData.studentId = this.studentId;  // 学生时使用 studentId
        } else if (this.role === 'teacher') {
          loginData.staffId = this.staffId;  // 教师时使用 staffId
        }

        // 发送请求
        const response = await axios.post(apiUrl, loginData);

        // 判断响应码，如果成功（code == 1），获取并存储 JWT
        if (response.data.code === 1) {
          const token = response.data.data; // 获取返回的 JWT
          localStorage.setItem('token', token);  // 存储 token
          this.$router.push(redirectUrl);  // 跳转到对应页面
        } else {
          this.$message.error(response.data.msg || '用户名或密码错误');
        }
      } catch (error) {
        this.$message.error('登录请求失败，请稍后重试');
      }
    },


    preventScroll(event) {
      event.preventDefault(); // 阻止默认滚动行为
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  },
};
</script>

<style scoped>
/* 禁用页面滚动 */
html,
body {
  overflow: hidden;
  height: 100%;
}

.login-page {
  background-color: #2a3d66;
  height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding-top: 100px;
}

.page-title {
  font-size: 40px;
  font-weight: bold;
  color: white;
  margin-bottom: 0px;
}

.login-container {
  width: 400px;
  margin: 80px auto;
  text-align: center;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
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
