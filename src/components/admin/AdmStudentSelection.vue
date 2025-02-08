<template>
    <div class="main-container">
        <!-- 搜索框区域 -->
        <div class="search-container" style="margin-bottom: 10px;">
            <h3>学生选课信息</h3>

            <el-input v-model="searchQuery.studentId" placeholder="学号"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.name" placeholder="学生姓名"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.courseId" placeholder="课程号"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.courseName" placeholder="课程名"
                style="width: 100px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.classId" placeholder="班级"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.staffId" placeholder="教师号"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.staffName" placeholder="教师名"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.credit" placeholder="学分"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.classTime" placeholder="上课时间"
                style="width: 150px; margin-right: 10px;"></el-input>

            <!-- 搜索按钮 -->
            <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">搜索</el-button>

            <!-- 清空按钮 -->
            <el-button @click="clearSearch" style="margin-left: 10px;">清空</el-button>


        </div>

        <!-- 新增按钮 -->
        <el-button type="primary" @click="handleAdd()"
            style="margin-left: 10px; margin-top: 20px; margin-bottom: 10px;">新增</el-button>

        <!-- 学生选课信息表格 -->
        <el-table :data="StudentCourseList" stripe style="width: 100%; margin-bottom: 20px;">
            <el-table-column prop="studentId" label="学号"></el-table-column>
            <el-table-column prop="name" label="学生姓名"></el-table-column>
            <el-table-column prop="courseId" label="课程号"></el-table-column>
            <el-table-column prop="courseName" label="课程名"></el-table-column>
            <el-table-column prop="classId" label="班级"></el-table-column>
            <el-table-column prop="staffId" label="教师号"></el-table-column>
            <el-table-column prop="staffName" label="教师名"></el-table-column>
            <el-table-column prop="credit" label="学分"></el-table-column>
            <el-table-column prop="classTime" label="上课时间" width="250px"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="danger" @click="handleDelete(scope.row)" size="small">退课</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total"
            @current-change="handlePageChange" layout="total, prev, pager, next, jumper"
            :page-size-options="[3, 5, 10, 20]" :disabled-next="currentPage >= pageCount">
        </el-pagination>



        <!-- 新增选课信息表单 -->
        <el-dialog title="新增选课信息" :visible.sync="AddDialogVisible" width="80%"
            :style="{ maxHeight: '90%', overflow: 'auto' }" @close="resetAddForm">
            <el-row :gutter="20" >
                
                <!-- 左侧：学生选课信息 -->
                <el-col :span="12">
                    <h1>学生选课信息</h1>
                    <el-form :model="addForm" label-width="80px">
                        <el-form-item label="学号">
                            <el-input v-model="addForm.studentId" placeholder="请输入学号"
                                @blur="fetchStudentCourses" style="width: 200px;"></el-input>
                            <!-- 查询按钮 -->
                            <el-button type="primary" @click="fetchStudentCourses"
                                style="margin-left: 10px;">查询</el-button>
                        </el-form-item>
                        <el-table :data="studentCourses" stripe style="width: 100%;">
                            <el-table-column prop="courseId" label="课程号"></el-table-column>
                            <el-table-column prop="courseName" label="课程名"></el-table-column>
                            <el-table-column prop="staffId" label="教师号"></el-table-column>
                            <el-table-column prop="staffName" label="教师名"></el-table-column>
                            <el-table-column prop="classId" label="班级"></el-table-column>
                            <el-table-column prop="classTime" label="上课时间"></el-table-column>
                        </el-table>
                    </el-form>
                </el-col>

                <!-- 右侧：所有课程列表 -->
                <el-col :span="12">
                    <h1>所有课程列表</h1>
                    <!-- 课程号搜索框 -->
                    <el-input v-model="courseSearchQuery.courseId" placeholder="输入课程号搜索"
                        style="width: 200px; margin-bottom: 10px;" @input="fetchAllCourses"></el-input>
                    <el-table :data="allCourses" stripe style="width: 100%;">
                        <el-table-column prop="courseId" label="课程号"></el-table-column>
                        <el-table-column prop="courseName" label="课程名"></el-table-column>
                        <el-table-column prop="staffId" label="教师号"></el-table-column>
                        <el-table-column prop="name" label="教师姓名"></el-table-column>
                        <el-table-column prop="classId" label="班级"></el-table-column>
                        <el-table-column prop="classTime" label="上课时间"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="addCourseToStudent(scope.row)"
                                    size="small">添加</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>

        </el-dialog>
    </div>


</template>


<script>
import axios from 'axios';

export default {
    data() {
        return {
            // 学生列表
            StudentCourseList: [], // 初始化为空数组
            // 其他数据
            currentPage: 1,
            pageSize: 10,
            total: 0,
            pageCount: 0,
            searchQuery: {
                semester: '',
                studentId: '',
                name: '',
                courseId: '',
                courseName: '',
                classId: '',
                staffId: '',
                staffName: '',
                credit: '',
                classTime: '',
            },

            AddDialogVisible: false,
            addForm: {
                studentId: '', // 学号
            },
            studentCourses: [], // 学生的选课信息
            allCourses: [], // 所有课程列表

            courseSearchQuery: {
                courseId: '', // 课程号搜索项
            },


        };
    },
    mounted() {
        this.fetchSemester();
        this.fetchStudentData();
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


                this.searchQuery.semester = response.data.data;
                this.fetchStudentCourseData();  // 刷新学生数据

            } catch (error) {
                console.error('请求学期数据失败', error);
                this.$message.error('数据请求失败，请稍后重试');
                if (error.response && error.response.status === 401) {
                    this.$router.push('/login');
                }
            }
        },

        // ******************************
        // ******************************
        // 请求学生选课数据
        async fetchStudentCourseData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/studentcourselist', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        semester: this.searchQuery.semester,
                        studentId: this.searchQuery.studentId,
                        name: this.searchQuery.name,
                        courseId: this.searchQuery.courseId,
                        courseName: this.searchQuery.courseName,
                        classId: this.searchQuery.classId,
                        staffId: this.searchQuery.staffId,
                        staffName: this.searchQuery.staffName,
                        credit: this.searchQuery.credit,
                        classTime: this.searchQuery.classTime,
                    },

                });

                this.StudentCourseList = response.data.data.studentCourseList;
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



        // ******************************
        // ******************************
        // 删除
        async handleDelete(CourseSelection) {
            try {
                this.$confirm('确认退课吗?', '提示', {
                    confirmButtonText: '退课',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        this.$message.error('请先登录');
                        this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                        return;
                    }
                    console.log("当前学期：", this.searchQuery.semester);

                    // 使用 params 传递参数
                    const response = await axios.delete(
                        `http://localhost:8081/admin/studentcourse`,
                        {
                            headers: { 'Authorization': `Bearer ${token}` },
                            params: {
                                studentId: CourseSelection.studentId,
                                courseId: CourseSelection.courseId,
                                classId: CourseSelection.classId,
                                semester: this.searchQuery.semester
                            }
                        }
                    );

                    if (response.data.code === 1) {
                        this.$message.success('退课成功');
                        this.fetchStudentCourseData();  // 刷新学生数据
                    } else {
                        this.$message.error('退课失败: ' + response.data.msg);
                    }
                }).catch(() => {
                    this.$message.info('退课操作已取消');
                });
            } catch (error) {
                console.error('退课失败', error);
                this.$message.error('退课失败，请稍后重试');
            }
        },




        // ******************************
        // ******************************
        // 新增
        // 打开新增弹窗
        handleAdd() {
            this.AddDialogVisible = true;
            this.fetchAllCourses(); // 加载所有课程
        },

        // 根据学号获取学生的选课信息
        async fetchStudentCourses() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/selection', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        studentId: this.addForm.studentId,
                        semester: this.searchQuery.semester,
                    },
                });

                this.studentCourses = response.data.data;
                console.log("学生的选课信息：", this.studentCourses);
            } catch (error) {
                console.error('获取学生选课信息失败', error);
                this.$message.error('获取学生选课信息失败，请稍后重试');
            }
        },

        // 获取所有课程
        async fetchAllCourses() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/courses', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.searchQuery.semester,
                        courseId: this.courseSearchQuery.courseId, // 添加课程号搜索参数
                    },
                });

                this.allCourses = response.data.data;
            } catch (error) {
                console.error('获取课程列表失败', error);
                this.$message.error('获取课程列表失败，请稍后重试');
            }
        },

        // 添加课程到学生的选课信息
        async addCourseToStudent(course) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                console.log("添加课程：", course);
                console.log("学生学号：", this.addForm.studentId);
                console.log("当前学期：", this.searchQuery.semester);
                const response = await axios.post(
                    'http://localhost:8081/admin/studentcourse',
                    null,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                        params: {
                            studentId: this.addForm.studentId,
                            semester: this.searchQuery.semester,
                            courseId: course.courseId,
                            staffId: course.staffId,
                            classId: course.classId,
                            classTime: course.classTime,
                        }
                    }
                );

                if (response.data.code === 1) {
                    this.$message.success('添加成功');
                    this.fetchStudentCourses(); // 刷新学生的选课信息
                    this.fetchStudentCourseData();
                } else {
                    this.$message.error('添加失败: ' + response.data.msg);
                }
            } catch (error) {
                console.error('添加失败', error);
                this.$message.error('添加失败，请稍后重试');
            }
        },

        // 保存新增选课信息
        async handleAddSave() {
            this.AddDialogVisible = false;
            this.fetchStudentCourseData(); // 刷新主表格数据
        },

        // 重置新增表单
        resetAddForm() {
            this.addForm = {
                studentId: '',
            };
            this.studentCourses = [];
        },




        // ******************************
        // ******************************
        // 其他零碎功能

        // 处理搜索
        handleSearch() {
            this.fetchStudentCourseData();
        },

        // 清空搜索条件
        clearSearch() {
            this.searchQuery = {
                semester: this.searchQuery.semester,
                studentId: '',
                name: '',
                courseId: '',
                courseName: '',
                classId: '',
                staffId: '',
                staffName: '',
                credits: '',
                classTime: '',
            };
            this.fetchStudentCourseData();
        },



        // 切换分页
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchStudentCourseData();
        },


    },
};
</script>

<style scoped></style>