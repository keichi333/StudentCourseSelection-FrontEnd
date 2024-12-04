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
            <el-menu-item index="3-2" @click="currentPage = ''">修改密码</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-aside>

    <!-- 内容区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header style="text-align: right; font-size: 12px;height: 40px; padding-top: 20px;">
        <i style="font-size: large; padding-right: 50px;">欢迎，{{ profile.name }}</i>
        <!-- 退出登录下拉框 -->
        <el-dropdown @command="handleCommand" style="cursor: pointer; padding-right: 20px;">
          <span class="el-dropdown-link">
            <i class="el-icon-user"></i> 退出登录
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

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
      profile: {}
    };
  },
  mounted() {
    this.fetchProfile();
  },
  methods: {
    // 处理下拉菜单点击事件
    handleCommand(command) {
      if (command === 'logout') {
        this.$router.push('/login');
      }
    },

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
  },
};
</script>
