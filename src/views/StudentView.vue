<template>
  <el-container style="min-height: 100vh">
    <!-- 侧边栏 -->
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu :default-openeds="['1', '2', '3']" style="min-height: 100%; overflow: hidden; padding:0"
        background-color="rgb(48,65,86)" text-color="#fff" active-text-color="rgb(255,255,255,0.5)"
        class="sidebar-menu">
        <!-- 选课管理 -->
        <el-submenu index="1">
          <template slot="title"><i class="el-icon-notebook"></i>选课管理</template>
          <el-menu-item-group>
            <el-menu-item index="1-1" @click="currentPage = 'classList'">选课</el-menu-item>
            <el-menu-item index="1-2" @click="currentPage = 'deleteList'">退课</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <!-- 成绩管理 -->
        <el-submenu index="2">
          <template slot="title"><i class="el-icon-notebook"></i>成绩管理</template>
          <el-menu-item-group>
            <el-menu-item index="2-1" @click="currentPage = 'scoreList'">查看成绩</el-menu-item>
            <el-menu-item index="2-2" @click="currentPage = 'scoreBoard'">成绩统计</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <!-- 个人中心 -->
        <el-submenu index="3">
          <template slot="title"><i class="el-icon-notebook"></i>个人中心</template>
          <el-menu-item-group>
            <el-menu-item index="3-1" @click="currentPage = 'infoList'">个人信息</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-aside>

    <!-- 内容区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header
        style="text-align: right; font-size: 12px; height: 40px; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">

        <!-- 当前学期 -->
        <el-tag style="font-size:20px; margin: 5px; font-weight: bold;">当前学期：{{ semester }}</el-tag>

        <!-- 右侧区域（通知收件箱和欢迎 xxx） -->
        <div style="display: flex; align-items: center; gap: 20px;">
          <!-- 收件箱按钮 -->
          <el-button type="info" @click="OpenEmail" plain>通知收件箱</el-button>

          <!-- 退出登录下拉框 -->
          <el-dropdown @command="handleCommand" style="cursor: pointer;">
            <span class="el-dropdown-link" @mouseenter="hover = true" @mouseleave="hover = false"
              :class="{ 'hovered': hover }">
              <i class="el-icon-user-solid"></i><i style="font-size: large; padding-left: 10px;">欢迎，{{ profile.name
                }}</i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="handlePassword">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 通知收件箱弹框 -->
      <el-dialog title="通知收件箱" style="text-align: center; font-size: large;" :visible.sync="isEmailVisible" width="70%">
        <el-table :data="emailList"
          style="width: 100%; height: 60vh; padding-left: 50px; padding-right: 50px; overflow: auto;">
          <el-table-column type="expand">
            <template slot-scope="props">
              <div class="email-expand-container">
                <p class="email-expand-item">
                  <span class="email-expand-label">通知标题：</span>
                  <span class="email-expand-content">{{ props.row.header }}</span>
                </p>
                <p class="email-expand-item">
                  <span class="email-expand-label">通知内容：</span>
                  <span class="email-expand-content">{{ props.row.content }}</span>
                </p>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="学期" prop="semester">
          </el-table-column>
          <el-table-column label="教师" prop="staffName">
          </el-table-column>
          <el-table-column label="课程" prop="courseName" sortable>
          </el-table-column>
          <el-table-column label="班级" prop="classId" width="150">
          </el-table-column>
          <el-table-column label="发送时间" prop="sendTime" sortable>
          </el-table-column>
        </el-table>
      </el-dialog>


      <!-- 主要内容 -->
      <el-main>
        <!-- 学生信息 -->
        <classList v-if="currentPage === 'classList'"></classList>

        <!-- 退课组件 -->
        <deleteList v-if="currentPage === 'deleteList'"></deleteList>

        <!-- 成绩信息组件 -->
        <scoreList v-if="currentPage === 'scoreList'"></scoreList>

        <!-- 成绩图表组件 -->
        <scoreBoard v-if="currentPage === 'scoreBoard'"></scoreBoard>

        <!-- 个人信息组件 -->
        <infoList v-if="currentPage === 'infoList'"></infoList>
      </el-main>
    </el-container>

    <!-- 修改密码弹窗 -->
    <el-dialog v-if="dialogVisible" :visible.sync="dialogVisible" title="修改密码" width="400px" style="z-index: 9999;">
      <el-form :model="form" ref="form">
        <el-form-item label="当前密码" prop="currentPassword"
          :rules="[{ required: true, message: '请输入当前密码', trigger: 'blur' }]"
          style="padding-left: 20px; padding-right: 20px;">
          <el-input :type="showCurrentPassword ? 'text' : 'password'" v-model="form.currentPassword"
            placeholder="请输入当前密码">
            <template slot="suffix">
              <i class="el-icon-view" @click="togglePasswordVisibility('currentPassword')"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword" :rules="[{ required: true, message: '请输入新密码', trigger: 'blur' }]"
          style="padding-left: 20px; padding-right: 20px;">
          <el-input :type="showNewPassword ? 'text' : 'password'" v-model="form.newPassword" placeholder="请输入新密码">
            <template slot="suffix">
              <i class="el-icon-view" @click="togglePasswordVisibility('newPassword')"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword"
          :rules="[{ required: true, message: '请确认密码', trigger: 'blur' },]"
          style="padding-left: 20px; padding-right: 20px;">
          <el-input :type="showConfirmPassword ? 'text' : 'password'" v-model="form.confirmPassword"
            placeholder="请确认密码">
            <template slot="suffix">
              <i class="el-icon-view" @click="togglePasswordVisibility('confirmPassword')"></i>
            </template>
          </el-input>
        </el-form-item>

      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
      </span>
    </el-dialog>

  </el-container>
</template>

<script>
import classList from '@/components/student/classList.vue';  // 引入学生信息组件
import deleteList from '@/components/student/deleteList.vue';  // 引入退课组件
import scoreList from '@/components/student/scoreList.vue'; // 引入成绩组件
import scoreBoard from '@/components/student/scoreBoard.vue';
import infoList from '@/components/student/infoList.vue';
import axios from 'axios';

export default {
  components: {
    classList,
    deleteList,
    scoreList,
    scoreBoard,
    infoList
  },
  data() {
    return {
      currentPage: 'classList', // 默认显示学生信息页面
      profile: {},
      dialogVisible: false,  // 控制弹窗显示
      form: {}, // 用于绑定表单
      showCurrentPassword: false,  // 当前密码是否可见
      showNewPassword: false,      // 新密码是否可见
      showConfirmPassword: false,  // 确认密码是否可见
      hover: false,
      isEmailVisible: false,
      emailList: [],
      semester: '',
    };
  },
  mounted() {
    this.fetchProfile();
    this.fetchSemester();
  },
  methods: {
    // 获取当前学期
    async fetchSemester() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');  // 如果没有 token，跳转到登录页面
          return;
        }

        const response = await axios.get('http://localhost:8081/student/semester', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });

        this.semester = response.data.data;

        console.log(response.data);

      } catch (error) {
        console.error('请求学期数据失败', error);
        this.$message.error('数据请求失败，请稍后重试');
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },


    // 处理下拉菜单点击事件
    handleCommand(command) {
      if (command === 'logout') {
        this.$router.push('/login');
      }
      if (command === 'handlePassword') {
        this.dialogVisible = true;  // 显示修改密码的弹窗
      }
    },
    togglePasswordVisibility(field) {
      if (field === 'currentPassword') {
        this.showCurrentPassword = !this.showCurrentPassword;
      } else if (field === 'newPassword') {
        this.showNewPassword = !this.showNewPassword;
      } else if (field === 'confirmPassword') {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },


    // 获取个人信息
    async fetchProfile() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');  // 如果没有 token，跳转到登录页面
          return;
        }

        const response = await axios.get('http://localhost:8081/student/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.data) {
          this.profile = response.data.data;
        }
      } catch (error) {
        console.error('请求个人信息失败', error);
        this.$message.error('个人信息请求失败，请稍后重试');
      }
    },

    // 修改密码处理函数
    async handleChangePassword() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');  // 如果没有 token，跳转到登录页面
          return;
        }

        const response = await axios.put('http://localhost:8081/student/updatepassword', this.form, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.code === 1) {
          this.$message.success('密码修改成功');
          this.fetchProfile();  // 刷新数据
          this.dialogVisible = false;  // 关闭对话框
        } else {
          this.$message.error('修改失败: ' + response.data.msg);
        }
      } catch (error) {
        console.error('请求密码修改失败', error);
        this.$message.error('密码修改请求失败，请稍后重试');
      }
    },

    // 打开通知收件箱
    OpenEmail() {
      this.isEmailVisible = true;
      this.fetchEmailList();
    },

    async fetchEmailList() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');  // 如果没有 token，跳转到登录页面
          return;
        }

        const response = await axios.get('http://localhost:8081/student/EmailList', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.data) {
          this.emailList = response.data.data.map(item => ({
            semester: item.semester,
            staffName: item.staffName,
            courseName: item.courseName,
            classId: item.classId,
            header: item.header,
            content: item.content,
            sendTime: this.formatDateTime(item.sendTime)
          }));
        }
      } catch (error) {
        console.error('请求通知信息失败', error);
        this.$message.error('通知信息请求失败，请稍后重试');
      }
    },

    // 添加一个用于格式化时间的辅助方法
    formatDateTime(dateString) {
      if (!dateString) return ""; // 防止空值导致错误
      const date = new Date(dateString); // 将字符串转换为 Date 对象
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }; // 定义日期格式化选项，不包括时区
      return date.toLocaleString('zh-CN', options); // 使用 zh-CN 格式化
    },


  },
};
</script>

<style scoped>
.hovered {
  color: rgb(80, 121, 245);
  text-decoration: underline;
}

.email-expand-container {
  width: 60%;
  color: #333;
  /* 默认字体颜色 */
  line-height: 1.8;
  /* 行高 */
}

.email-expand-item {
  margin-bottom: 10px;
  /* 间距 */
  display: flex;
  /* 横向排列 */
}

.email-expand-label {
  flex-shrink: 0;
  /* 防止标签被压缩 */
  white-space: nowrap;
  /* 防止标签换行 */
  font-weight: bold;
  /* 加粗 */
  margin-right: 10px;
  /* 标签和内容的间距 */
}
</style>
