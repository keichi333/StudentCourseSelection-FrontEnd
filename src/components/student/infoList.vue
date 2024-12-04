<template>
    <div class="profile-container">
        <h3 class="profile-title">个人信息</h3>

        <el-card class="profile-card" shadow="hover">
            <el-descriptions class="margin-top" title="" :column="3" :size="'big'" border>
                <template slot="extra">
                    <el-button type="primary" @click="handleModify">修改</el-button>
                </template>

                <!-- 学号 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-school"></i>
                        学号
                    </template>
                    {{ profile.studentId }}
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

                <!-- 户籍 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-location"></i>
                        户籍
                    </template>
                    {{ profile.nativePlace }}
                </el-descriptions-item>

                <!-- 手机号 -->
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-mobile-phone"></i>
                        手机号
                    </template>
                    {{ profile.mobilePhone }}
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

        <!-- 修改个人信息弹出框 -->
        <el-dialog title="修改个人信息" :visible.sync="dialogVisible" width="500px">
            <el-form :model="form" ref="form" label-width="100px">
                <el-form-item label="学号">
                    <el-input v-model="form.studentId" :disabled="true" style="width: 300px;"></el-input>
                </el-form-item>

                <el-form-item label="姓名">
                    <el-input v-model="form.name" :disabled="true" style="width: 300px;"></el-input>
                </el-form-item>

                <el-form-item label="性别">
                    <el-input v-model="form.sex" :disabled="true" style="width: 300px;"></el-input>
                </el-form-item>

                <el-form-item label="出生日期">
                    <el-date-picker v-model="form.dateOfBirth" type="date" placeholder="选择出生日期"></el-date-picker>
                </el-form-item>

                <el-form-item label="户籍">
                    <el-input v-model="form.nativePlace" placeholder="请输入户籍" style="width: 300px;"></el-input>
                </el-form-item>

                <el-form-item label="手机号">
                    <el-input v-model="form.mobilePhone" placeholder="请输入手机号" style="width: 300px;"></el-input>
                </el-form-item>

                <el-form-item label="学院">
                    <el-input v-model="form.deptName" :disabled="true" style="width: 300px;"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button plain @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">提交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'profile',
    

    data() {
        return {
            profile: {},  // 存储个人信息
            form: {},      // 存储弹窗表单数据
            dialogVisible: false,  // 控制弹窗显示
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

                const response = await axios.get('http://localhost:8081/student/info', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.data) {
                    this.profile = response.data.data;
                    // 回显个人信息
                    this.form = { ...this.profile };
                }
            } catch (error) {
                console.error('请求个人信息失败', error);
                this.$message.error('个人信息请求失败，请稍后重试');
            }
        },

        // 修改按钮点击处理
        handleModify() {
            this.dialogVisible = true;
        },

        // 提交修改
        async handleSubmit() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                const response = await axios.put('http://localhost:8081/student/updateinfo', this.form, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.code === 1) {
                    this.$message.success('个人信息修改成功');
                    this.fetchProfile();  // 刷新数据
                    this.dialogVisible = false;  // 关闭对话框
                } else {
                    this.$message.error('修改失败: ' + response.data.msg);
                }
            } catch (error) {
                console.error('修改失败', error);
                this.$message.error('修改失败，请稍后重试');
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
