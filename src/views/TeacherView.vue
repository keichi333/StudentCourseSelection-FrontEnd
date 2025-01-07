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
            <el-menu-item index="1-1" @click="currentPage = 'TclassList'">课程信息</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <!-- 成绩管理 -->
        <el-submenu index="2">
          <template slot="title"><i class="el-icon-notebook"></i>成绩管理</template>
          <el-menu-item-group>
            <el-menu-item index="2-1" @click="currentPage = 'TscoreList'">登记成绩</el-menu-item>
            <el-menu-item index="2-2" @click="currentPage = 'TscoreBoard'">成绩统计</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <!-- 个人中心 -->
        <el-submenu index="3">
          <template slot="title"><i class="el-icon-notebook"></i>个人中心</template>
          <el-menu-item-group>
            <el-menu-item index="3-1" @click="currentPage = ''">个人信息</el-menu-item>
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
        <keep-alive>
          <TclassList v-if="currentPage === 'TclassList'"></TclassList>
          <TscoreList v-if="currentPage === 'TscoreList'"></TscoreList>
          <TscoreBoard v-if="currentPage === 'TscoreBoard'"></TscoreBoard>
        </keep-alive>
        
        
        
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import TclassList from '@/components/teacher/TclassList.vue';
import TscoreList from '@/components/teacher/TscoreList.vue'; 
import TscoreBoard from '@/components/teacher/TscoreBoard.vue';
import axios from 'axios';

export default {
  components: {
    TclassList,
    TscoreList,
    TscoreBoard,
  },
  data() {
    return {
      hover: false,
      currentPage: 'TclassList', // 默认页面为课程页
      profile: {
        name: '', // 用户名初始化为空
      }
    };
  },
  mounted() {
    this.getUserProfile();
  },
  methods: {
    async getUserProfile() {
      
    }
  },
};
</script>
