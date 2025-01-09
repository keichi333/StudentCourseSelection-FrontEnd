<template>
    <div class="profile-container">
        <h3 class="profile-title" style="padding-top: 50px;">个人信息</h3>

        <el-card class="profile-card" shadow="hover">
            <el-descriptions class="margin-top" title="" :column="3" :size="'big'" border style="padding-top: 30px;">

                <!-- 教师号 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-school"></i>
                        教师号
                    </template>
                    {{ profile.staffId }}
                </el-descriptions-item>

                <!-- 姓名 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-user"></i>
                        姓名
                    </template>
                    {{ profile.name }}
                </el-descriptions-item>

                <!-- 性别 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-male"></i>
                        性别
                    </template>
                    {{ profile.sex }}
                </el-descriptions-item>

                <!-- 出生日期 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-date"></i>
                        出生日期
                    </template>
                    {{ formatDate(profile.dateOfBirth) }}
                </el-descriptions-item>

                <!-- 职称 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-data-line"></i>
                        职称
                    </template>
                    {{ profile.professionalRanks }}
                </el-descriptions-item>

                <!-- 薪资 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-coin"></i>
                        薪资
                    </template>
                    {{ profile.salary }}
                </el-descriptions-item>

                <!-- 学院 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-office-building"></i>
                        学院
                    </template>
                    {{ profile.deptName }}
                </el-descriptions-item>
            </el-descriptions>
        </el-card>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'TinfoList',
    

    data() {
        return {
            profile: {},  // 存储个人信息
        };
    },

    mounted() {
        // 在组件加载时调用后端接口获取数据
        this.fetchProfile();
    },

    methods: {
        // 获取个人信息
        async fetchProfile() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/teacher/info', {
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

    

        // 格式化日期
        formatDate(dateString) {
            const date = new Date(dateString);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }
    }
};
</script>

<style scoped>
.profile-card {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.el-descriptions {
    margin-top: 10px;
    margin-bottom: 70px;
}

.el-descriptions-item i {
    font-size: medium;
    margin-right: 8px;
}

.el-card {
    margin-top: 20px;
}
</style>
