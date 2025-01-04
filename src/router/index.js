import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/views/Login.vue'; // 登录页面
import StudentView from '@/views/StudentView.vue'; // 学生页面
import TeacherView from '@/views/TeacherView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/login',  // 根路径重定向到登录页
  },
  {
    path: '/login',
    name: 'login',
    component: Login,  // 登录页路由
  },
  {
    path: '/student',
    name: 'student',
    component: StudentView  // 学生页
  },
  {
    path: '/teacher',
    name: 'teacher',
    component: TeacherView  // 教师页
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});


export default router;
