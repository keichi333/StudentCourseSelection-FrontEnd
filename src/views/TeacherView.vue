<template>
  <el-container style="min-height: 100vh">
    <!-- 侧边栏 -->
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu :default-openeds="['1', '2', '3']" style="min-height: 100%; overflow: hidden; padding:0"
        background-color="rgb(48,65,86)" text-color="#fff" active-text-color="rgb(255,255,255,0.5)"
        class="sidebar-menu">

        <!-- 课程管理 -->
        <el-submenu index="1">
          <template slot="title"><i class="el-icon-notebook"></i>课程管理</template>
          <el-menu-item-group>
            <el-menu-item index="1-1" @click="currentPage = 'classList'">课程信息</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <!-- 成绩管理 -->
        <el-submenu index="2">
          <template slot="title"><i class="el-icon-notebook"></i>成绩管理</template>
          <el-menu-item-group>
            <el-menu-item index="2-1" @click="currentPage = 'scoreList'">登记成绩</el-menu-item>
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
      <el-header style="text-align: right; font-size: 12px;height: 40px; padding-top: 20px;">
        <i class="el-icon-user-solid"></i>
        <i style="font-size: large; padding-left: 10px;">欢迎，{{ profile.name || '用户' }}</i>
      </el-header>

      <!-- 主要内容 -->
      <el-main>
        <div v-if="currentPage === 'classList'">课程信息内容</div>
        <div v-if="currentPage === 'scoreList'">成绩登记内容</div>
        <div v-if="currentPage === 'scoreBoard'">成绩统计内容</div>
        <div v-if="currentPage === 'infoList'">个人信息内容</div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      hover: false,
      currentPage: '', // 默认页面为空
      profile: {
        name: '', // 用户名初始化为空
      }
    };
  },
  mounted() {
    // 假设你从API获取用户信息
    this.getUserProfile();
  },
  methods: {
    // 获取用户资料
    async getUserProfile() {
      try {
        const response = await axios.get('/api/user/profile');  // 替换为实际API
        if (response.data.code === 1) {
          this.profile = response.data.data;  // 假设返回的数据包含用户信息
        }
      } catch (error) {
        console.error('无法获取用户信息', error);
      }
    }
  },
};
</script>
