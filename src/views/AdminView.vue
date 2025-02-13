<template>
    <el-container style="min-height: 100vh">
        <!-- 侧边栏 -->
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
            <el-menu :default-openeds="['1', '2', '3']" style="min-height: 100%; overflow: hidden; padding:0"
                background-color="rgb(48,65,86)" text-color="#fff" active-text-color="rgb(255,255,255,0.5)"
                class="sidebar-menu">
                <!-- 学生管理 -->
                <el-submenu index="1">
                    <template slot="title"><i class="el-icon-notebook"></i>学生管理</template>
                    <el-menu-item-group>
                        <el-menu-item index="1-1" @click="currentPage = 'AdmStudentInfo'">学生信息管理</el-menu-item>
                        <el-menu-item index="1-2" @click="currentPage = 'AdmStudentSelection'">学生选课情况查看</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

                <!-- 教师管理 -->
                <el-submenu index="2">
                    <template slot="title"><i class="el-icon-notebook"></i>教师管理</template>
                    <el-menu-item-group>
                        <el-menu-item index="2-1" @click="currentPage = 'AdmTeacherInfo'">教师信息管理</el-menu-item>
                        <el-menu-item index="2-2" @click="currentPage = 'AdmTeacherSelection'">教师课程安排查看</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

                <!-- 课程管理 -->
                <el-submenu index="3">
                    <template slot="title"><i class="el-icon-notebook"></i>课程管理</template>
                    <el-menu-item-group>
                        <el-menu-item index="3-1" @click="currentPage = 'AdmCourseInfo'">课程信息管理</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

                <!-- 成绩管理 -->
                <el-submenu index="4">
                    <template slot="title"><i class="el-icon-notebook"></i>成绩管理</template>
                    <el-menu-item-group>
                        <el-menu-item index="4-1" @click="currentPage = ''">成绩管理</el-menu-item>
                        <el-menu-item index="4-2" @click="currentPage = ''">成绩统计与分析</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

                <!-- 统计报表 -->
                <el-submenu index="5">
                    <template slot="title"><i class="el-icon-notebook"></i>统计报表</template>
                    <el-menu-item-group>
                        <el-menu-item index="5-1" @click="currentPage = ''">学生选课统计</el-menu-item>
                        <el-menu-item index="5-2" @click="currentPage = ''">教师课程统计</el-menu-item>
                    </el-menu-item-group>
                </el-submenu>

            </el-menu>
        </el-aside>

        <!-- 内容区域 -->
        <el-container>
            <!-- 顶部栏 -->
            <el-header
                style="text-align: right; font-size: 12px; height: 40px; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">

                <div>
                    <!-- 当前学期按钮 -->
                    <el-button type="primary" style="font-size:20px; font-weight: bold;"
                        @click="SemesterDialogVisible = true" plain>
                        当前学期：{{ semester }}
                    </el-button>

                    <el-dialog :visible.sync="SemesterDialogVisible" width="40%" @close="resetForm">
                        <!-- 自定义标题 -->
                        <template #title>
                            <div style="text-align: left; font-size: 18px;">
                                修改当前学期
                            </div>
                        </template>

                        <!-- 表单部分 -->
                        <el-form :model="SemesterForm" :rules="rules" ref="semesterForm" style="padding-left: 80px; padding-right: 80px;" >
                            <!-- 年份输入框 -->
                            <el-form-item label="年份" prop="year1">
                                <el-input v-model="SemesterForm.year1" placeholder="请输入年份（如：2023）"
                                    style="width: 80%;"></el-input>
                                <el-input v-model="SemesterForm.year2" placeholder="请输入年份（如：2024）"
                                    style="width: 80%;"></el-input>
                            </el-form-item>

                            <!-- 学期选择框 -->
                            <el-form-item label="学期" prop="semester">
                                <el-select v-model="SemesterForm.semester" placeholder="请选择学期" style="width: 100%;">
                                    <el-option label="春季" value="Spring"></el-option>
                                    <el-option label="夏季" value="Summer"></el-option>
                                    <el-option label="秋季" value="Fall"></el-option>
                                    <el-option label="冬季" value="Winter"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>

                        <!-- 底部按钮 -->
                        <div slot="footer" class="dialog-footer">
                            <el-button @click="SemesterDialogVisible = false">取消</el-button>
                            <el-button type="primary" @click="submitSemesterForm">确定</el-button>
                        </div>
                    </el-dialog>
                </div>

                <!-- 右侧区域（欢迎 xxx） -->
                <div style="display: flex; align-items: center; gap: 20px;">

                    <!-- 退出登录下拉框 -->
                    <el-dropdown @command="handleCommand" style="cursor: pointer;">
                        <span class="el-dropdown-link" @mouseenter="hover = true" @mouseleave="hover = false"
                            :class="{ 'hovered': hover }">
                            <i class="el-icon-user-solid"></i><i style="font-size: large; padding-left: 10px;">欢迎，{{
                                profile.name
                                }}</i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="handlePassword">修改密码</el-dropdown-item>
                            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </el-header>



            <!-- 主要内容 -->
            <el-main>
                <!-- 学生信息管理 -->
                <AdmStudentInfo v-if="currentPage === 'AdmStudentInfo'"></AdmStudentInfo>
                <AdmStudentSelection v-if="currentPage === 'AdmStudentSelection'"></AdmStudentSelection>

                <!-- 教师信息管理 -->
                <AdmTeacherInfo v-if="currentPage === 'AdmTeacherInfo'"></AdmTeacherInfo>
                <AdmTeacherSelection v-if="currentPage === 'AdmTeacherSelection'"></AdmTeacherSelection>
                
                <AdmCourseInfo v-if="currentPage === 'AdmCourseInfo'"></AdmCourseInfo>


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

                <el-form-item label="新密码" prop="newPassword"
                    :rules="[{ required: true, message: '请输入新密码', trigger: 'blur' }]"
                    style="padding-left: 20px; padding-right: 20px;">
                    <el-input :type="showNewPassword ? 'text' : 'password'" v-model="form.newPassword"
                        placeholder="请输入新密码">
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

import axios from 'axios';
import AdmTeacherInfo from '@/components/admin/AdmTeacherInfo.vue';
import AdmStudentInfo from '@/components/admin/AdmStudentInfo.vue';
import AdmStudentSelection from '@/components/admin/AdmStudentSelection.vue';
import AdmTeacherSelection from '@/components/admin/AdmTeacherSelection.vue';
import AdmCourseInfo from '@/components/admin/AdmCourseInfo.vue';

export default {
    components: {
        AdmTeacherInfo,
        AdmStudentInfo,
        AdmStudentSelection,
        AdmTeacherSelection,
        AdmCourseInfo,
    },
    data() {
        return {
            currentPage: 'AdmStudentInfo', // 默认显示学生信息页面
            profile: {},
            dialogVisible: false,  // 控制弹窗显示
            SemesterDialogVisible: false,  // 控制学期弹窗显示
            form: {}, // 用于绑定表单
            SemesterForm: {
                year1: '',  // 年份
                year2: '',  // 年份
                semester: '',  // 学期
            },
            rules: {
                year1: [
                    { required: true, message: '请输入年份', trigger: 'blur' },
                    { pattern: /^\d{4}$/, message: '年份格式不正确（如：2023）', trigger: 'blur' }
                ],
                year2: [
                    { required: true, message: '请输入年份', trigger: 'blur' },
                    { pattern: /^\d{4}$/, message: '年份格式不正确（如：2024）', trigger: 'blur' }
                ],
                semester: [
                    { required: true, message: '请选择学期', trigger: 'change' }
                ],
            },
            showCurrentPassword: false,  // 当前密码是否可见
            showNewPassword: false,      // 新密码是否可见
            showConfirmPassword: false,  // 确认密码是否可见
            hover: false,
            semester: '',
        };
    },
    mounted() {
        this.fetchProfile();
        this.fetchSemester();
    },
    methods: {
        async fetchSemester() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/semester', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (response.data && response.data.data) {
                    this.semester = response.data.data;
                    console.log(this.semester);  // 输出学期信息
                } else {
                    this.semester = '';  // 如果数据为空，设置默认值
                    this.$message.error('未获取到学期数据');
                }

            } catch (error) {
                console.error('请求学期数据失败', error);
                this.$message.error('数据请求失败，请稍后重试');
                if (error.response && error.response.status === 401) {
                    this.$router.push('/login');
                }
            }
        },

        // 提交表单
        submitSemesterForm() {
            this.$refs.semesterForm.validate((valid) => {
                if (valid) {
                    this.updateSemester();  // 调用更新学期的方法
                } else {
                    this.$message.error('请填写完整信息');
                    return false;
                }
            });
        },

        async updateSemester() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                // 将 semester 转换为中文
                let semesterChinese = '';
                if (this.SemesterForm.semester === 'Spring') {
                    semesterChinese = '春季';
                } else if (this.SemesterForm.semester === 'Fall') {
                    semesterChinese = '秋季';
                } else if (this.SemesterForm.semester === 'Summer') {
                    semesterChinese = '夏季';
                } else if (this.SemesterForm.semester === 'Winter') {
                    semesterChinese = '冬季';
                }

                // 合并 year1, year2, semester 为一个字符串
                const semesterString = `${this.SemesterForm.year1}-${this.SemesterForm.year2}${semesterChinese}`;

                // 发送 PUT 请求，将合并后的字符串传给后端
                const response = await axios.put('http://localhost:8081/admin/updatesemester', null, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    params: {
                        semester: semesterString,
                    },
                });

                this.fetchSemester();  // 刷新数据

                this.SemesterDialogVisible = false;  // 关闭对话框
                this.$message.success('学期修改成功');

            } catch (error) {
                console.error('请求学期数据失败', error);
                this.$message.error('数据请求失败，请稍后重试');
                if (error.response && error.response.status === 401) {
                    this.$router.push('/login');
                }
            }
        },


        // 重置表单
        resetForm() {
            this.form.year1 = '';
            this.form.year2 = '';
            this.form.semester = '';
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

                const response = await axios.get('http://localhost:8081/admin/info', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.data) {
                    this.profile = response.data.data;
                    console.log(this.profile);
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

                const response = await axios.put('http://localhost:8081/admin/updatepassword', this.form, {
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