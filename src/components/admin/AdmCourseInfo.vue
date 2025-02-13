<template>
    <div class="main-container">
        <!-- 搜索框区域 -->
        <div class="search-container" style="margin-bottom: 10px;">
            <h3>课程信息</h3>

            <el-input v-model="searchQuery.courseId" placeholder="课程号"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.courseName" placeholder="课程名"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.credit" placeholder="学分" style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.creditHours" placeholder="课时"
                style="width: 100px; margin-right: 10px;"></el-input>
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

        <!-- 课程信息表格 -->
        <el-table :data="CourseList" stripe style="width: 100%; margin-bottom: 20px;">
            <el-table-column prop="courseId" label="课程号"></el-table-column>
            <el-table-column prop="courseName" label="课程名"></el-table-column>
            <el-table-column prop="credit" label="学分"></el-table-column>
            <el-table-column prop="creditHours" label="课时"></el-table-column>
            <el-table-column prop="deptName" label="学院"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button @click="handleSelect(scope.row)" size="small">修改</el-button>
                    <el-button type="danger" @click="handleDelete(scope.row)" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total"
            @current-change="handlePageChange" layout="total, prev, pager, next, jumper"
            :page-size-options="[3, 5, 10, 20]" :disabled-next="currentPage >= pageCount">
        </el-pagination>

        <el-dialog title="修改课程信息" :visible.sync="UpdateDialogVisible" width="500px" @close="resetForm">
            <el-form :model="currentCourse" ref="CourseForm" :rules="rules" label-width="100px"
                style="padding-right: 50px; padding-left: 30px;">
                <el-form-item label="课程号" prop="courseId">
                    <el-input v-model="currentCourse.courseId" disabled></el-input>
                </el-form-item>
                <el-form-item label="课程名" prop="courseName">
                    <el-input v-model="currentCourse.courseName"></el-input>
                </el-form-item>
                <el-form-item label="学分" prop="credit">
                    <el-input v-model="currentCourse.credit"></el-input>
                </el-form-item>
                <el-form-item label="课时" prop="creditHours">
                    <el-input v-model="currentCourse.creditHours"></el-input>
                </el-form-item>
                <el-form-item label="学院" prop="deptName">
                    <el-select v-model="currentCourse.deptName" placeholder="请选择学院">
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

        <!-- 新增教师信息表单 -->
        <el-dialog title="新增课程信息" :visible.sync="AddDialogVisible" width="500px" @close="resetAddForm">
            <el-form :model="newCourse" ref="CourseForm" :rules="rules" label-width="100px"
                style="padding-right: 50px; padding-left: 30px;">
                <el-form-item label="课程号" prop="courseId">
                    <el-input v-model="newCourse.courseId"></el-input>
                </el-form-item>
                <el-form-item label="课程名" prop="CourseName">
                    <el-input v-model="newCourse.courseName"></el-input>
                </el-form-item>
                <el-form-item label="学分" prop="credit">
                    <el-input v-model="newCourse.credit"></el-input>
                </el-form-item>
                <el-form-item label="课时" prop="creditHours">
                    <el-input v-model="newCourse.creditHours"></el-input>
                </el-form-item>
                <el-form-item label="学院" prop="deptName">
                    <el-select v-model="newCourse.deptName" placeholder="请选择学院">
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
            // 课程信息
            CourseList: [], // 初始化为空数组
            deptOptions: [], // 存储学院数据
            // 其他数据
            currentPage: 1,
            pageSize: 10,
            total: 0,
            pageCount: 0,
            searchQuery: {
                courseId: '',
                courseName: '',
                credit: '',
                creditHours: '',
                deptName: '',
            },
            UpdateDialogVisible: false,
            currentCourse: {
                courseId: '',
                courseName: '',
                credit: '',
                creditHours: '',
                deptName: '',
            },
            AddDialogVisible: false,
            newCourse: { // 用于存储新增的课程信息
                courseId: '',
                courseName: '',
                credit: '',
                creditHours: '',
                deptName: '',
            },
            rules: {
                courseId: [
                    { required: true, message: '请输入课程号', trigger: 'blur' }
                ],
                courseName: [
                    { required: true, message: '请输入课程名', trigger: 'blur' }
                ],
                credit: [
                    { required: true, message: '请输入学分', trigger: 'blur' }
                ],
                creditHours: [
                    { required: true, message: '请输入课时', trigger: 'blur' }
                ],
                deptName: [
                    { required: true, message: '请选择学院', trigger: 'change' }
                ]
            }
        };
    },
    mounted() {
        this.fetchDeptData();
        this.fetchCourseData();
    },
    methods: {
        // ******************************
        // ******************************
        // 请求课程数据
        async fetchCourseData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/courselist', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        courseId: this.searchQuery.courseId,
                        courseName: this.searchQuery.courseName,
                        credit: this.searchQuery.credit,
                        creditHours: this.searchQuery.creditHours,
                        deptName: this.searchQuery.deptName,
                    }
                });

                this.CourseList = response.data.data.courseList;
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

        // TODO
        // ******************************
        // ******************************
        // 修改
        handleSelect(course) {
            this.currentCourse = { ...course }; 
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

                // 发送 PUT 请求更新课程信息
                const response = await axios.put(
                    `http://localhost:8081/admin/course/${this.currentCourse.courseId}`,
                    this.currentCourse,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }
                );

                if (response.data.code === 1) {
                    this.$message.success('修改成功');

                    this.UpdateDialogVisible = false;  // 退课成功后关闭对话框
                    this.fetchCourseData();           // 刷新课程数据

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
            this.currentCourse = {
                courseId: '',
                courseName: '',
                credit: '',
                creditHours: '',
                deptName: '',
            };
        },

        // ******************************
        // ******************************
        // 删除
        async handleDelete(course) {
            try {
                this.$confirm('确认删除该课程信息吗?', '提示', {
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

                    // 发送 DELETE 请求删除课程信息
                    const response = await axios.delete(
                        `http://localhost:8081/admin/course/${course.courseId}`,
                        {
                            headers: { 'Authorization': `Bearer ${token}` },
                        }
                    );

                    if (response.data.code === 1) {
                        this.$message.success('删除成功');
                        this.fetchCourseData();  // 刷新课程数据
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
        // 新增
        handleAdd() {
            this.newCourse = { // 清空新增表单
                courseId: '',
                courseName: '',
                credit: '',
                creditHours: '',
                deptName: '',
            };
            this.AddDialogVisible = true;
        },
        // 保存新增课程信息
        async handleAddSave() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                // 发送 POST 请求新增课程信息
                const response = await axios.post(
                    'http://localhost:8081/admin/course',
                    this.newCourse,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }
                );

                if (response.data.code === 1) {
                    this.$message.success('新增成功');
                    this.AddDialogVisible = false; // 关闭新增表单
                    this.fetchCourseData();     // 刷新课程数据
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
            this.newCourse = {
                courseId: '',
                courseName: '',
                credit: '',
                creditHours: '',
                deptName: '',
            };
        },




        // ******************************
        // ******************************
        // 其他零碎功能

        // 处理搜索
        handleSearch() {
            this.fetchCourseData();
        },

        // 清空搜索条件
        clearSearch() {
            this.searchQuery = {
                courseId: '',
                courseName: '',
                credit: '',
                creditHours: '',
                deptName: ''
            };
            this.fetchCourseData();
        },



        // 切换分页
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchCourseData();
        },

    },
};
</script>

<style scoped></style>