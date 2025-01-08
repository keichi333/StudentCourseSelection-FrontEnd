<template>
    <div>
        <!-- 学期选择 -->
        <el-select v-model="selectionQuery.semester" placeholder="选择学期" style="width: 180px; margin-bottom: 20px;"
            @change="onSemesterChange">
            <el-option v-for="option in semesterOptions" :key="option.value" :label="option.label"
                :value="option.value" />
        </el-select>
        <!-- 课程选择 -->
        <el-select v-model="selectionQuery.courseId" placeholder="选择课程" style="width: 180px; margin-bottom: 20px;"
            :disabled="!selectionQuery.semester" @change="onSemesterAndCourseChange">
            <el-option v-for="option in courseOptions" :key="option.value" :label="option.label"
                :value="option.value" />
        </el-select>

        <!-- 班级选择 -->
        <el-select v-model="selectionQuery.class" placeholder="选择班级" style="width: 180px; margin-bottom: 20px;"
            :disabled="!selectionQuery.courseId">
            <el-option v-for="option in classOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>

        <!-- 筛选按钮 -->
        <el-button type="primary" @click="handleFilter" :disabled="!canFilter" style="margin-left: 10px;">筛选</el-button>

        <!-- 图表展示 -->
        <div class="chart-container" style="height: 400px; padding-top: 30px;">
            <line-chart v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>


<script>
import axios from "axios";
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
    name: "TscoreBoard",
    components: {
        LineChart: Line
    },

    data() {
        return {
            selectionQuery: {
                semester: "",
                courseId: "",
                class: ""
            },
            semesterOptions: [
                { label: "2023-2024秋季", value: "2023-2024秋季" },
                { label: "2023-2024冬季", value: "2023-2024冬季" },
                { label: "2023-2024春季", value: "2023-2024春季" }
            ],
            courseOptions: [],
            classOptions: [],
            scoreList: [],
            chartData: null,
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '课程总成绩分析'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '分数区间'
                        },
                        ticks: {
                            autoSkip: false // 确保所有区间都显示
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '人数'
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        },
                        max: 10
                    }
                }

            }
        };
    },
    computed: {
        canFilter() {
            return this.selectionQuery.semester && this.selectionQuery.courseId && this.selectionQuery.class;
        }
    },
    methods: {
        async onSemesterChange() {
            this.selectionQuery.courseId = "";
            this.selectionQuery.class = "";
            this.courseOptions = [];
            this.classOptions = [];

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8081/teacher/course', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester
                    }
                });

                if (response.data.code === 1) {
                    const rawData = response.data.data;
                    const uniqueData = Array.from(new Map(rawData.map(item => [item.courseId, item])).values());

                    this.courseOptions = uniqueData.map((item) => ({
                        label: item.courseId + " " + item.courseName,
                        value: item.courseId
                    }));
                } else {
                    console.error("获取课程数据失败:", response.data.msg);
                }
            } catch (error) {
                console.error("加载课程数据失败:", error);
                this.$message.error('加载课程数据失败，请稍后重试');
            }
        },

        async onSemesterAndCourseChange() {
            this.selectionQuery.class = "";
            this.classOptions = [];

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                console.log("当前选择的条件：", this.selectionQuery);

                const response = await axios.get('http://localhost:8081/teacher/course', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester,
                        courseId: this.selectionQuery.courseId
                    }
                });

                if (response.data.code === 1) {
                    const rawData = response.data.data;
                    const uniqueData = Array.from(new Map(rawData.map(item => [item.classId, item])).values());

                    this.classOptions = uniqueData.map((item) => ({
                        label: item.classId,
                        value: item.classId
                    }));
                } else {
                    console.error("获取课程数据失败:", response.data.msg);
                }
            } catch (error) {
                console.error("加载课程数据失败:", error);
                this.$message.error('加载课程数据失败，请稍后重试');
            }
        },
        handleFilter() {
            this.prepareChartData();
        },
        async prepareChartData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');
                    return;
                }

                // 三个接口请求
                const totalScoreResponse = axios.get('http://localhost:8081/teacher/ScoreDistribution', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: {
                        semester: this.selectionQuery.semester,
                        courseId: this.selectionQuery.courseId,
                        classId: this.selectionQuery.class
                    }
                });

                const testScoreResponse = axios.get('http://localhost:8081/teacher/TestScoreDistribution', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: {
                        semester: this.selectionQuery.semester,
                        courseId: this.selectionQuery.courseId,
                        classId: this.selectionQuery.class
                    }
                });

                const normalScoreResponse = axios.get('http://localhost:8081/teacher/NormalScoreDistribution', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: {
                        semester: this.selectionQuery.semester,
                        courseId: this.selectionQuery.courseId,
                        classId: this.selectionQuery.class
                    }
                });

                // 等待所有请求完成
                const [totalScoreData, testScoreData, normalScoreData] = await Promise.all([
                    totalScoreResponse,
                    testScoreResponse,
                    normalScoreResponse
                ]);

                // 处理数据
                if (
                    totalScoreData.data.code === 1 &&
                    testScoreData.data.code === 1 &&
                    normalScoreData.data.code === 1
                ) {
                    const totalScoreRaw = totalScoreData.data.data.map(item => ({
                        minScore: item.minScore,
                        maxScore: item.maxScore,
                        numberOfStudents: item.numberOfStudents
                    }));

                    const testScoreRaw = testScoreData.data.data.map(item => ({
                        minScore: item.minScore,
                        maxScore: item.maxScore,
                        numberOfStudents: item.numberOfStudents
                    }));

                    const normalScoreRaw = normalScoreData.data.data.map(item => ({
                        minScore: item.minScore,
                        maxScore: item.maxScore,
                        numberOfStudents: item.numberOfStudents
                    }));

                    // 定义完整分数区间
                    const completeIntervals = [];
                    for (let i = 0; i <= 90; i += 10) {
                        completeIntervals.push({
                            minScore: i,
                            maxScore: i + 9,
                            numberOfStudents: 0
                        });
                    }

                    // 合并数据
                    const mergeData = (rawData) =>
                        completeIntervals.map(interval => {
                            const match = rawData.find(
                                item =>
                                    item.minScore === interval.minScore &&
                                    item.maxScore === interval.maxScore
                            );
                            return {
                                minScore: interval.minScore,
                                maxScore: interval.maxScore,
                                numberOfStudents: match ? match.numberOfStudents : 0 // 若无匹配则默认0
                            };
                        });


                    const totalScoreMerged = mergeData(totalScoreRaw);
                    const testScoreMerged = mergeData(testScoreRaw);
                    const normalScoreMerged = mergeData(normalScoreRaw);

                    // 准备图表数据
                    const labels = completeIntervals.map(
                        interval => `${interval.minScore}-${interval.maxScore}`
                    );

                    this.chartData = {
                        labels: completeIntervals.map(
                            interval => `${interval.minScore}-${interval.maxScore}`
                        ),
                        datasets: [
                            {
                                label: '总成绩分布',
                                data: totalScoreMerged.map(item => item.numberOfStudents),
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                fill: false,
                                tension: 0.1
                            },
                            {
                                label: '考试成绩分布',
                                data: testScoreMerged.map(item => item.numberOfStudents),
                                borderColor: 'rgba(255, 99, 132, 1)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                fill: false,
                                tension: 0.1
                            },
                            {
                                label: '平时成绩分布',
                                data: normalScoreMerged.map(item => item.numberOfStudents),
                                borderColor: 'rgba(54, 162, 235, 1)',
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                fill: false,
                                tension: 0.1
                            }
                        ]
                    };

                } else {
                    this.$message.error('加载成绩分布数据失败，请稍后重试');
                }
            } catch (error) {
                console.error("加载学生成绩分布列表数据失败:", error);
                this.$message.error('加载学生成绩分布列表数据失败，请稍后重试');
            }
        }


    }
};

</script>

<style scoped>
.table-container {
    margin-top: 20px;
    overflow-y: auto;
}

.button-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
</style>
