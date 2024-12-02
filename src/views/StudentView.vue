<template>
  <el-container style="min-height: 100vh">
    <!-- 侧边栏 -->
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu :default-openeds="['1', '3']" style="min-height: 100%; overflow: hidden; padding:0" background-color="rgb(48,65,86)"
        text-color="#fff" active-text-color="rgb(255,255,255,0.5)" class="sidebar-menu">
        <!-- 选课管理 -->
        <el-submenu index="1">
          <template slot="title"><i class="el-icon-notebook"></i>选课管理</template>
          <el-menu-item-group>
            <el-menu-item index="1-1" @click="currentPage = 'classList'">选课</el-menu-item>
            <el-menu-item index="1-2" @click="currentPage = 'courseSelection'">退课</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-aside>

    <!-- 内容区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header style="text-align: right; font-size: 12px;height: 20px;">
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

        <!-- 学生选课情况 -->
        <courseSelection v-if="currentPage === 'courseSelection'"></courseSelection>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import classList from '@/components/student/classList.vue';  // 引入学生信息组件
import courseSelection from '@/components/student/courseSelection.vue';  // 引入学生选课情况组件

export default {
  components: {
    classList,  // 正确注册 classList 组件
    courseSelection  // 正确注册 courseSelection 组件
  },
  data() {
    return {
      currentPage: 'classList', // 默认显示学生信息页面
    };
  },
  methods: {
    // 处理下拉菜单点击事件
    handleCommand(command) {
      if (command === 'logout') {
        this.$router.push('/login');
      }
    },
  },
};
</script>

