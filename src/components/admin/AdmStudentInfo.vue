<template>
    <div class="main-container">
        <!-- 搜索框区域 -->
        <div class="search-container" style="margin-bottom: 10px;">
            <h3>学生信息</h3>

            <el-input v-model="searchQuery.studentId" placeholder="学号"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.name" placeholder="学生姓名"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.sex" placeholder="性别" style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.dateOfBirth" placeholder="出生日期"
                style="width: 100px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.nativePlace" placeholder="籍贯"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.mobilePhone" placeholder="联系方式"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.deptName" placeholder="学院"
                style="width: 150px; margin-right: 10px;"></el-input>

            <!-- 搜索按钮 -->
            <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">搜索</el-button>

            <!-- 清空按钮 -->
            <el-button @click="clearSearch" style="margin-left: 10px;">清空</el-button>


        </div>

        <!-- 新增按钮 -->
        <el-button type="primary" @click="handleAdd()"
            style="margin-left: 10px; margin-top: 20px; margin-bottom: 10px;">新增</el-button>

        <!-- 学生信息表格 -->
        <el-table :data="StudentList" stripe style="width: 100%; margin-bottom: 20px;">
            <el-table-column prop="studentId" label="学号"></el-table-column>
            <el-table-column prop="name" label="学生姓名"></el-table-column>
            <el-table-column prop="sex" label="性别"></el-table-column>
            <el-table-column prop="dateOfBirth" label="出生日期">
                <template slot-scope="scope">
                    {{ formatDate(scope.row.dateOfBirth) }}
                </template>
            </el-table-column>
            <el-table-column prop="nativePlace" label="籍贯"></el-table-column>
            <el-table-column prop="mobilePhone" label="联系方式"></el-table-column>
            <el-table-column prop="deptName" label="学院"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button @click="handleSelect(scope.row)" size="small">修改</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row)" size="small">删除</el-button>
                    <el-button type="success" @click="handlePasswdReset(scope.row)" size="small">重置密码</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total"
            @current-change="handlePageChange" layout="total, prev, pager, next, jumper"
            :page-size-options="[3, 5, 10, 20]" :disabled-next="currentPage >= pageCount">
        </el-pagination>

        <el-dialog title="修改学生信息" :visible.sync="UpdateDialogVisible" width="500px" @close="resetForm">
            <el-form :model="currentStudent" ref="studentForm" :rules="rules" label-width="100px"
                style="padding-right: 50px; padding-left: 30px;">
                <el-form-item label="学号" prop="studentId">
                    <el-input v-model="currentStudent.studentId" disabled></el-input>
                </el-form-item>
                <el-form-item label="学生姓名" prop="name">
                    <el-input v-model="currentStudent.name"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-input v-model="currentStudent.sex"></el-input>
                </el-form-item>
                <el-form-item label="出生日期" prop="dateOfBirth">
                    <el-date-picker v-model="currentStudent.dateOfBirth" type="date" placeholder="选择出生日期"
                        style="width: 100%;" format="yyyy-MM-dd"></el-date-picker>
                </el-form-item>
                <el-form-item label="籍贯">
                    <el-input v-model="currentStudent.nativePlace"></el-input>
                </el-form-item>
                <el-form-item label="联系方式">
                    <el-input v-model="currentStudent.mobilePhone"></el-input>
                </el-form-item>
                <el-form-item label="学院" prop="deptName">
                    <el-select v-model="currentStudent.deptName" placeholder="请选择学院">
                        <el-option v-for="dept in deptOptions" :key="dept" :label="dept" :value="dept">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="UpdateDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="UpdateHandleSave">保存</el-button>
            </div>
        </el-dialog>

        <!-- 新增学生信息表单 -->
        <el-dialog title="新增学生信息" :visible.sync="AddDialogVisible" width="500px" @close="resetAddForm">
            <el-form :model="newStudent" ref="studentForm" :rules="rules" label-width="100px"
                style="padding-right: 50px; padding-left: 30px;">
                <el-form-item label="学号" prop="studentId">
                    <el-input v-model="newStudent.studentId"></el-input>
                </el-form-item>
                <el-form-item label="学生姓名" prop="name">
                    <el-input v-model="newStudent.name"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-input v-model="newStudent.sex"></el-input>
                </el-form-item>
                <el-form-item label="出生日期" prop="dateOfBirth">
                    <el-date-picker v-model="newStudent.dateOfBirth" type="date" placeholder="选择出生日期"
                        style="width: 100%;" format="yyyy-MM-dd"></el-date-picker>
                </el-form-item>
                <el-form-item label="籍贯">
                    <el-input v-model="newStudent.nativePlace"></el-input>
                </el-form-item>
                <el-form-item label="联系方式">
                    <el-input v-model="newStudent.mobilePhone"></el-input>
                </el-form-item>
                <el-form-item label="学院" prop="deptName">
                    <el-select v-model="newStudent.deptName" placeholder="请选择学院">
                        <el-option v-for="dept in deptOptions" :key="dept" :label="dept" :value="dept">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="AddDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAddSave">保存</el-button>
            </div>
        </el-dialog>
    </div>


</template>


<script>
import axios from 'axios';

export default {
    data() {
        return {
            // 学生列表
            StudentList: [], // 初始化为空数组
            deptOptions: [], // 存储学院数据
            // 其他数据
            currentPage: 1,
            pageSize: 10,
            total: 0,
            pageCount: 0,
            searchQuery: {
                studentId: '',
                name: '',
                sex: '',
                dateOfBirth: '',
                nativePlace: '',
                mobilePhone: '',
                deptName: '',
            },
            UpdateDialogVisible: false,
            currentStudent: {
                studentId: '',
                name: '',
                sex: '',
                dateOfBirth: '',
                nativePlace: '',
                mobilePhone: '',
                deptName: '',
            },
            AddDialogVisible: false,
            newStudent: { // 用于存储新增学生信息
                studentId: '',
                name: '',
                sex: '',
                dateOfBirth: '',
                nativePlace: '',
                mobilePhone: '',
                deptName: '',
            },
            rules: {
                studentId: [
                    { required: true, message: '请输入学号', trigger: 'blur' }
                ],
                name: [
                    { required: true, message: '请输入学生姓名', trigger: 'blur' }
                ],
                sex: [
                    { required: true, message: '请输入性别', trigger: 'blur' }
                ],
                dateOfBirth: [
                    { required: true, message: '请选择出生日期', trigger: 'change' }
                ],
                deptName: [
                    { required: true, message: '请选择学院', trigger: 'change' }
                ]
            }
        };
    },
    mounted() {
        this.fetchDeptData();
        this.fetchStudentData();
    },
    methods: {
        // ******************************
        // ******************************
        // 请求学生数据
        async fetchStudentData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/studentlist', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        studentId: this.searchQuery.studentId,
                        name: this.searchQuery.name,
                        sex: this.searchQuery.sex,
                        dateOfBirth: this.searchQuery.dateOfBirth,
                        nativePlace: this.searchQuery.nativePlace,
                        mobilePhone: this.searchQuery.mobilePhone,
                        deptName: this.searchQuery.deptName,
                    }
                });

                this.StudentList = response.data.data.studentList;
                this.total = response.data.data.total;
                this.pageCount = Math.ceil(this.total / this.pageSize);


                // 如果当前页大于总页数，且总页数不为0，则跳转到最后一页
                if (this.currentPage > this.pageCount && this.pageCount !== 0) {
                    this.currentPage = this.pageCount;
                    this.fetchData();  // 重新请求数据
                }
            } catch (error) {
                console.error('请求课程数据失败', error);
                this.$message.error('数据请求失败，请稍后重试');
                if (error.response && error.response.status === 401) {
                    this.$router.push('/login');
                }
            }
        },
        // 请求学院数据
        async fetchDeptData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/deptlist', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },

                });

                if (response.data.code === 1) {
                    this.deptOptions = response.data.data;
                    console.log("学院选择", this.deptOptions);

                } else {
                    this.$message.error('查询失败: ' + response.data.msg);
                }
            } catch (error) {
                console.error('查询失败', error);
                this.$message.error('查询失败，请稍后重试');
            }
        },

        // ******************************
        // ******************************
        // 修改
        handleSelect(student) {
            this.currentStudent = { ...student }; // 将选中的学生信息复制到 currentStudent
            this.UpdateDialogVisible = true;            // 显示弹窗
        },

        // 保存修改后的信息
        async UpdateHandleSave() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                // 发送 PUT 请求更新学生信息
                const response = await axios.put(
                    `http://localhost:8081/admin/student/${this.currentStudent.studentId}`,
                    this.currentStudent,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }
                );

                if (response.data.code === 1) {
                    this.$message.success('修改成功');

                    this.UpdateDialogVisible = false;  // 退课成功后关闭对话框
                    this.fetchStudentData();  // 刷新学生数据

                } else {
                    this.$message.error('修改失败: ' + response.data.msg);
                    this.UpdateDialogVisible = false;  // 退课失败后关闭对话框
                }

            } catch (error) {
                console.error('修改失败', error);
                this.$message.error('修改失败，请稍后重试');
            }
        },

        // 重置表单
        resetForm() {
            this.currentStudent = {
                studentId: '',
                name: '',
                sex: '',
                dateOfBirth: '',
                nativePlace: '',
                mobilePhone: '',
                deptName: '',
            };
        },

        // ******************************
        // ******************************
        // 删除
        async handleDelete(student) {
            try {
                this.$confirm('确认删除该学生信息吗?', '提示', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        this.$message.error('请先登录');
                        this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                        return;
                    }

                    // 发送 DELETE 请求删除学生信息
                    const response = await axios.delete(
                        `http://localhost:8081/admin/student/${student.studentId}`,
                        {
                            headers: { 'Authorization': `Bearer ${token}` },
                        }
                    );

                    if (response.data.code === 1) {
                        this.$message.success('删除成功');
                        this.fetchStudentData();  // 刷新学生数据
                    } else {
                        this.$message.error('删除失败: ' + response.data.msg);
                    }
                }).catch(() => {
                    this.$message.info('删除操作已取消');
                });
            } catch (error) {
                console.error('删除失败', error);
                this.$message.error('删除失败，请稍后重试');
            }
        },

        // ******************************
        // ******************************
        // 重置密码
        async handlePasswdReset(student) {
            try {
                this.$confirm('确认重置该学生密码吗?', '提示', {
                    confirmButtonText: '重置',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        this.$message.error('请先登录');
                        this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                        return;
                    }

                    // 发送 PUT 请求重置密码
                    const response = await axios.put(
                        `http://localhost:8081/admin/student/passwordreset/${student.studentId}`, null,
                        {
                            headers: { 'Authorization': `Bearer ${token}` },
                        }
                    );

                    if (response.data.code === 1) {
                        this.$message.success('重置密码成功');
                    } else {
                        this.$message.error('重置失败: ' + response.data.msg);
                    }
                }).catch(() => {
                    this.$message.info('重置密码操作已取消');
                });
            } catch (error) {
                console.error('重置失败', error);
                this.$message.error('重置失败，请稍后重试');
            }
        },


        // ******************************
        // ******************************
        // 新增
        handleAdd() {
            this.newStudent = { // 清空新增表单
                studentId: '',
                name: '',
                sex: '',
                dateOfBirth: '',
                nativePlace: '',
                mobilePhone: '',
                deptName: '',
            };
            this.AddDialogVisible = true;
        },
        // 保存新增学生信息
        async handleAddSave() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                // 发送 POST 请求新增学生信息
                const response = await axios.post(
                    'http://localhost:8081/admin/student',
                    this.newStudent,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }
                );

                if (response.data.code === 1) {
                    this.$message.success('新增成功');
                    this.AddDialogVisible = false; // 关闭新增表单
                    this.fetchStudentData(); // 刷新学生数据
                } else {
                    this.$message.error('新增失败: ' + response.data.msg);
                }
            } catch (error) {
                console.error('新增失败', error);
                this.$message.error('新增失败，请稍后重试');
            }
        },

        // 重置新增表单
        resetAddForm() {
            this.newStudent = {
                studentId: '',
                name: '',
                sex: '',
                dateOfBirth: '',
                nativePlace: '',
                mobilePhone: '',
                deptName: '',
            };
        },




        // ******************************
        // ******************************
        // 其他零碎功能

        // 处理搜索
        handleSearch() {
            this.fetchStudentData();
        },

        // 清空搜索条件
        clearSearch() {
            this.searchQuery = {
                studentId: '',
                name: '',
                sex: '',
                dateOfBirth: '',
                nativePlace: '',
                mobilePhone: '',
                deptName: '',
            };
            this.fetchStudentData();
        },



        // 切换分页
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchData();
        },

        formatDate(dateStr) {
            const date = new Date(dateStr); // 将 ISO 日期字符串转换为 Date 对象
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' }; // 格式化选项
            return date.toLocaleDateString('zh-CN', options); // 使用中文格式输出日期
        }
    },
};
</script>

<style scoped></style>