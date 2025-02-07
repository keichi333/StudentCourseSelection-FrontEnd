<template>
    <div>
        <h3>成绩统计</h3>

        <!-- 图表展示 -->
        <div class="chart-container">
            <bar-chart v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
    name: 'scoreBoard',

    components: {
        BarChart: Bar
    },

    methods: {
        // 获取当前学期
        async fetchSemester() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/student/semester', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
                this.selectionQuery.semester = response.data.data;

                this.fetchSelectionData();

            } catch (error) {
                console.error('请求学期数据失败', error);
                this.$message.error('数据请求失败，请稍后重试');
                if (error.response && error.response.status === 401) {
                    this.$router.push('/login');
                }
            }
        },


        // 显示逻辑
        async fetchSelectionData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/student/selection', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester
                    }
                });

                if (response.data && Array.isArray(response.data.data)) {
                    this.selectionList = response.data.data;
                    this.prepareChartData();
                }
            } catch (error) {
                console.error('请求选课数据失败', error);
                this.$message.error('选课数据请求失败，请稍后重试');
            }
        },

        // 处理图表数据
        prepareChartData() {
            const labels = this.selectionList.map(item => item.courseName);
            const normalScores = this.selectionList.map(item => item.normalScore);
            const testScores = this.selectionList.map(item => item.testScore);
            const totalScores = this.selectionList.map(item => item.totalScore);

            this.chartData = {
                labels: labels,
                datasets: [
                    {
                        label: '平时成绩',
                        data: normalScores,
                        backgroundColor: 'rgba(66, 165, 245, 0.8)', 
                    },
                    {
                        label: '考试成绩',
                        data: testScores,
                        backgroundColor: 'rgba(102, 187, 106, 0.8)', 
                    },
                    {
                        label: '总成绩',
                        data: totalScores,
                        backgroundColor: 'rgba(255, 112, 67, 0.8)',  
                    }
                ]

            };
        },

        handleSelectionFilter() {
            this.fetchSelectionData();
        },
    },

    data() {
        return {
            selectionQuery: {
                semester: '' 
            },
            selectionList: [],
            chartData: null,
            chartOptions: {
                responsive: true,  // 确保图表自适应大小
                maintainAspectRatio: false,  // 禁止维持固定比例
                plugins: {
                    title: {
                        display: true,
                        text: '课程成绩分析'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        stepSize: 10,
                        ticks: {
                            callback: function (value) {
                                return value;
                            }
                        }
                    }
                }
            }
        };
    },

    mounted() {
        this.fetchSemester();
        this.fetchSelectionData();
    }
};
</script>

<style scoped>
.search-row {
    margin-bottom: 20px;
}

.el-select {
    width: 100%;
}

strong {
    font-size: 16px;
    color: #575e64;
}

/* 图表容器 */
.chart-container {
    position: relative;
    height: 400px;
    /* 设置图表容器的高度 */
    width: 100%;
    /* 让容器自适应宽度 */
    max-width: 800px;
    /* 限制最大宽度，避免过于拉伸 */
    margin: 0 auto;
    /* 居中显示 */
}
</style>
