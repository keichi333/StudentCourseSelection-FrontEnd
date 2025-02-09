<template>
    <div class="main-container">
        <!-- 搜索框区域 -->
        <div class="search-container" style="margin-bottom: 10px;">
            <h3>教师课程安排信息</h3>

            <el-input v-model="searchQuery.staffId" placeholder="教师号"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.name" placeholder="教师姓名"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.courseId" placeholder="课程号"
                style="width: 150px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.courseName" placeholder="课程名"
                style="width: 100px; margin-right: 10px;"></el-input>
            <el-input v-model="searchQuery.classId" placeholder="班级"
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

        <!-- 教师课程安排信息表格 -->
        <el-table :data="TeacherCourseList" stripe style="width: 100%; margin-bottom: 20px;">
            <el-table-column prop="staffId" label="教师号"></el-table-column>
            <el-table-column prop="name" label="教师姓名"></el-table-column>
            <el-table-column prop="courseId" label="课程号"></el-table-column>
            <el-table-column prop="courseName" label="课程名"></el-table-column>
            <el-table-column prop="classId" label="班级"></el-table-column>
            <el-table-column prop="classTime" label="上课时间" width="250px"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="danger" @click="handleDelete(scope.row)" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total"
            @current-change="handlePageChange" layout="total, prev, pager, next, jumper"
            :page-size-options="[3, 5, 10, 20]" :disabled-next="currentPage >= pageCount">
        </el-pagination>



        <!-- 新增课程安排信息表单 -->
        <el-dialog title="新增课程安排" :visible.sync="AddDialogVisible" width="80%"
            :style="{ maxHeight: '90%', overflow: 'auto' }" @close="resetAddForm">
            <el-row :gutter="20">
                <!-- 左侧：教师选课信息 -->
                <el-col :span="12">
                    <h1>教师选课信息</h1>
                    <el-form :model="addForm" label-width="80px">
                        <el-form-item label="教师号">
                            <el-input v-model="addForm.staffId" placeholder="请输入教师号" @blur="fetchTeacherCourses"
                                style="width: 200px;"></el-input>
                            <!-- 查询按钮 -->
                            <el-button type="primary" @click="fetchTeacherCourses"
                                style="margin-left: 10px;">查询</el-button>
                        </el-form-item>
                        <el-table :data="teacherCourses" stripe style="width: 100%;" height="400px">
                            <el-table-column prop="courseId" label="课程号"></el-table-column>
                            <el-table-column prop="courseName" label="课程名"></el-table-column>
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
                    <el-table :data="allCourses" stripe style="width: 100%;" height="400px">
                        <el-table-column prop="courseId" label="课程号"></el-table-column>
                        <el-table-column prop="courseName" label="课程名"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" @click="openCourseForm(scope.row)" size="small">添加</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-dialog>

        <!-- 添加课程弹窗 -->
        <el-dialog title="添加课程" :visible.sync="courseFormVisible" width="30%" @close="resetCourseForm">
            <el-form ref="courseFormRef" :model="courseForm" :rules="courseFormRules" label-width="100px">
                <el-form-item label="课程号">
                    <el-input v-model="courseForm.courseId" disabled></el-input>
                </el-form-item>
                <el-form-item label="课程名">
                    <el-input v-model="courseForm.courseName" disabled></el-input>
                </el-form-item>
                <el-form-item label="上课时间" prop="classTime">
                    <el-input v-model="courseForm.classTime" placeholder="请输入上课时间"></el-input>
                </el-form-item>
                <el-form-item label="最大人数" prop="maxStudents">
                    <el-input v-model="courseForm.maxStudents" placeholder="请输入最大人数"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="courseFormVisible = false">取消</el-button>
                <el-button type="primary" @click="submitCourseForm">确定</el-button>
            </span>
        </el-dialog>

    </div>


</template>


<script>
import axios from 'axios';

export default {
    data() {
        return {
            // 教师课程安排列表
            TeacherCourseList: [], // 初始化为空数组
            // 其他数据
            currentPage: 1,
            pageSize: 10,
            total: 0,
            pageCount: 0,
            searchQuery: {
                semester: '',
                staffId: '',
                name: '',
                courseId: '',
                courseName: '',
                classId: '',
                classTime: '',
            },

            AddDialogVisible: false,
            courseFormVisible: false, // 控制添加课程表单的显示
            addForm: {
                staffId: '', // 教师号
            },
            teacherCourses: [], // 教师的选课信息
            allCourses: [], // 所有课程列表
            courseSearchQuery: {
                courseId: '', // 课程号搜索项
            },
            courseForm: {
                courseId: '', // 课程号
                courseName: '', // 课程名
                classTime: '', // 上课时间
                maxStudents: '', // 最大人数
            },

            courseFormRules: {
                classId: [
                    { required: true, message: '请输入班级', trigger: 'blur' }
                ],
                classTime: [
                    { required: true, message: '请输入上课时间', trigger: 'blur' }
                ],
                maxStudents: [
                    { required: true, message: '请输入最大人数', trigger: 'blur' }
                ]
            },


        };
    },
    mounted() {
        this.fetchSemester();
        this.fetchTeacherCourseData();
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
                this.fetchTeacherCourseData();  // 刷新教师课程安排数据

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
        // 请求教师课程安排数据
        async fetchTeacherCourseData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/teachercourselist', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        semester: this.searchQuery.semester,
                        staffId: this.searchQuery.staffId,
                        name: this.searchQuery.name,
                        courseId: this.searchQuery.courseId,
                        courseName: this.searchQuery.courseName,
                        classId: this.searchQuery.classId,
                        classTime: this.searchQuery.classTime,
                    },

                });

                this.TeacherCourseList = response.data.data.teacherCourseList;
                this.total = response.data.data.total;
                this.pageCount = Math.ceil(this.total / this.pageSize);


                // 如果当前页大于总页数，且总页数不为0，则跳转到最后一页
                if (this.currentPage > this.pageCount && this.pageCount !== 0) {
                    this.currentPage = this.pageCount;
                    this.fetchTeacherCourseData();
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
                this.$confirm('确认删除该课程安排吗?', '提示', {
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
                    console.log("当前学期：", this.searchQuery.semester);

                    // 使用 params 传递参数
                    const response = await axios.delete(
                        `http://localhost:8081/admin/teachercourse`,
                        {
                            headers: { 'Authorization': `Bearer ${token}` },
                            params: {
                                staffId: CourseSelection.staffId,
                                courseId: CourseSelection.courseId,
                                classId: CourseSelection.classId,
                                semester: this.searchQuery.semester
                            }
                        }
                    );

                    if (response.data.code === 1) {
                        this.$message.success('删除成功');
                        this.fetchTeacherCourseData();  // 刷新教师课程安排数据
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
        // 打开新增弹窗
        handleAdd() {
            this.AddDialogVisible = true;
            this.fetchAllCourses(); // 加载所有课程
        },

        // 根据教师号获取教师的选课信息
        async fetchTeacherCourses() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8081/admin/teachercourse', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        staffId: this.addForm.staffId,
                        semester: this.searchQuery.semester,
                    },
                });

                this.teacherCourses = response.data.data;
                console.log("教师的选课信息：", this.teacherCourses);
            } catch (error) {
                console.error('获取教师选课信息失败', error);
                this.$message.error('获取教师选课信息失败，请稍后重试');
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

                const response = await axios.get('http://localhost:8081/admin/allcourses', {
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

        // 打开添加课程表单
        openCourseForm(course) {
            this.courseForm.courseId = course.courseId;
            this.courseForm.courseName = course.courseName;
            this.courseFormVisible = true;
        },

        submitCourseForm() {
            this.$refs.courseFormRef.validate((valid) => {
                if (valid) {
                    // 表单验证通过后，调用添加课程的方法
                    this.addCourseToTeacher();
                } else {
                    this.$message.error('请完善必填信息');
                    return false;
                }
            });
        },

        async addCourseToTeacher() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                const response = await axios.post(
                    'http://localhost:8081/admin/teachercourse',
                    null,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                        params: {
                            semester: this.searchQuery.semester,
                            courseId: this.courseForm.courseId,
                            staffId: this.addForm.staffId,
                            classTime: this.courseForm.classTime,
                            maxStudents: this.courseForm.maxStudents,
                        }
                    }
                );

                if (response.data.code === 1) {
                    this.$message.success('添加成功');
                    this.fetchTeacherCourses(); // 刷新教师的选课信息
                    this.fetchTeacherCourseData();  // 刷新教师课程安排数据
                    this.courseFormVisible = false; // 关闭表单
                } else {
                    this.$message.error('添加失败: ' + response.data.msg);
                }
            } catch (error) {
                console.error('添加失败', error);
                this.$message.error('添加失败，请稍后重试');
            }
        },

        // 重置添加课程弹窗的表单（关闭时调用）
        resetCourseForm() {
            this.courseForm = {
                courseId: '',
                courseName: '',
                classId: '',
                classTime: '',
                maxStudents: '',
            };
            // 重置表单验证状态
            if (this.$refs.courseFormRef) {
                this.$refs.courseFormRef.resetFields();
            }
        },

        // 重置新增表单
        resetAddForm() {
            this.addForm = {
                staffId: '',
            };
            this.teacherCourses = [];
        },





        // ******************************
        // ******************************
        // 其他零碎功能

        // 处理搜索
        handleSearch() {
            this.fetchTeacherCourseData();
        },

        // 清空搜索条件
        clearSearch() {
            this.searchQuery = {
                semester: this.searchQuery.semester,
                staffId: '',
                name: '',
                courseId: '',
                courseName: '',
                classId: '',
                classTime: '',
            };
            this.fetchTeacherCourseData();
        },



        // 切换分页
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchTeacherCourseData();
        },


    },
};
</script>

<style scoped></style>