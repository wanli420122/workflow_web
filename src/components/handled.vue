<template>
  <div>
    <div class="fd-nav-content">
      <div class="Utab">
        <div class="radioGroupBox">
          <el-radio-group v-model="taskstatusVal" size="medium" @change="doFilter">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="1">审核通过</el-radio-button>
            <el-radio-button label="0">审核中</el-radio-button>
            <el-radio-button label="2">已撤销</el-radio-button>
          </el-radio-group>
        </div>
        <div class="screenInpBox">
          <div class="Utip">标题：</div>
          <div class="Userchinput">
            <el-input v-model="searchFormname" placeholder="输入标题">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </div>
          <div class="Utip">所属流程：</div>
          <div class="Userchinput">
            <el-input v-model="searchValue" placeholder="输入所属流程"><i slot="prefix"
                class="el-input__icon el-icon-search"></i></el-input>
          </div>
          <div class="Udate">办理时间：</div>
          <div class="Uchosedate">
            <el-date-picker v-model="value2" @change="dateChangebirthday1" style="width:240px" type="daterange"
              format="yyyy-MM-dd" value-format="yyyy-MM-dd" align="center" unlink-panels start-placeholder="开始日期"
              end-placeholder="结束日期" :picker-options="pickerOptions"></el-date-picker>
          </div>
          <div class="Ubtn">
            <el-button icon="el-icon-search" @click="doFilter">查 询</el-button>
          </div>
        </div>
      </div>
      <div class="UtableDiv">
        <el-table :data="tableData" style="width: 100%;" border>
          <el-table-column label="标题" prop="formname" align="center"></el-table-column>
          <el-table-column label="任务所处环节" prop="nodename" align="center"></el-table-column>
          <el-table-column label="所属流程" prop="taskname" align="center"></el-table-column>
          <el-table-column label="发起任务人" prop="taskSponsor" align="center"></el-table-column>
          <el-table-column label="办理时间" prop="endtime" align="center" :formatter="dateFormatter"></el-table-column>
          <el-table-column label="流程状态" align="center">
            <template slot-scope="scope">
              <span v-show="scope.row.taskstatus=='0'" style="color:#5473e8;">审核中</span>
              <span v-show="scope.row.taskstatus=='1'" style="color:#23bcca;">审核通过</span>
              <span v-show="scope.row.taskstatus=='2'" style="color:#f56c6c;">审核失败</span>
            </template>
          </el-table-column>
          <el-table-column label="流程跟踪" align="center">
            <template slot-scope="scope">
              <el-button size="mini" round plain icon="el-icon-aim"
                @click="track(scope.$index, scope.row)" class="greenBtn">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 分条数 -->
        <div class="Upage">
          <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="currentPage" :page-sizes="[4,6,8,10]" :page-size="pageSize"
            layout="prev, pager, next, sizes, total" :total="totalItems"></el-pagination>
        </div>
      </div>
    </div>

  </div>
</template>
<style lang="scss" scoped>
@import "../assets/css/workflow.css";
  /* table 展开行功能 */
  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 110px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
</style>
<style>
  /* 这里是全局样式 */
.fd-nav-content .Utab .el-input__inner {
  /* width: 250px; */
  height: 40px;
  font-size: 14px;
  height: 34px;
  background-color: #f6f7fc;
  border-radius: 4px;
  border: solid 1px #e2e8ee;
}
.fd-nav-content .Utab .el-range-editor .el-range-input {
  background-color: transparent;
}
</style>
<script>
  export default {
    data() {
      return {
       taskstatusVal: "all",

        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        resData: [],
        value1: '',
        value2: '',
        //搜索条件
        searchFormname: "", //搜索-标题
        searchValue: "", // 搜索-任务名称
        pageSize: 10, //每页条数
        currentPage: 1, // 第几页
        totalItems: 0, // 总条数
        tableData: [], // 已办任务集合
        filterTableData: [], //搜索集合
        flag: false, // 是否检索
        // 
        getSearchInfo: [],
        // 获取时间范围
        startTime: "", // 搜索-日期范围
        staffList: [],

        taskSponsor: "", // 任务发起人
        loadPersonTree: [], // 设备管理 组织架构(已完成base64解码)
        base64_lpData: window.sessionStorage.loadPersonTree, // 组织架构-base64
      }
    },
    mounted() {

      // 引入base64
      let Base64 = require("js-base64").Base64;
      // 设备管理:组织架构 本地缓存
      if(this.base64_lpData == undefined){
        this.$axios.get("/web/mes/inspectionplan/treeloadPerson.do")
          .then(res => {
            this.loadPersonTree = res.data;
            window.sessionStorage.loadPersonTree = Base64.encode(JSON.stringify(res.data), "utf-8");
            this.queryTaskLists();
        })
      }else{
        this.loadPersonTree = JSON.parse(Base64.decode(this.base64_lpData));
        this.queryTaskLists();
      }      
    },
    methods: {
      queryTaskLists(){
        // 查询已办
        this.$axios.get('/api/qdc/queryTaskLists', {
          params: {
            userid: "sa",
            flag: "1"
          }
        }).then(res => {
          var lpData = this.loadPersonTree; // 设备管理:组织架构数据
          var tlData = res.data; // 已办任务数据
          // 遍历待办任务数据
          tlData.map(item => {
            var useridNow = item.userid;
            // 遍历组织架构,根据userid找到组织架构中对应的发起任务人
            lpData.map(item => {
              if(useridNow!=item.id){
                if(item.children.length>0){
                  this.itemFun(item,useridNow);
                }
              }else{
                  this.taskSponsor = item.title;
                  return false;
              }
            });
            item['taskSponsor']=this.taskSponsor;
          });
          this.resData = tlData;
          this.mockRequset();
        }).catch(function (error) {
          console.log(error);
        });
      },
      // 组织架构递归循环,找到发起任务人
      itemFun(itemCan,useridNow){
        var itemChildren = itemCan.children;
        itemChildren.map(item => {
          if(useridNow!=item.id){
            if(item.children.length>0){
              this.itemFun(item,useridNow);            
            }
          }else{
            this.taskSponsor = item.title;
            return false;
          }
        })
      },
      // 表格日期转换
      dateFormatter (row, column) {
        function add0(m){return m<10?'0'+m:m }
        let datetime = row.starttime;
        if(datetime){
          datetime = new Date(datetime);
          let year = datetime.getFullYear();
          let month = datetime.getMonth()+1;
          let day = datetime.getDate();
          var hours = datetime.getHours();
          var minutes = datetime.getMinutes();
          var seconds = datetime.getSeconds();
          return year +'-'+ add0(month) +'-'+ add0(day)  +' '+  add0(hours) +':'+ add0(minutes) +':'+ add0(seconds);
        }
        return ''
      },


      //获取信息
      // info(){
      // //后端拿取数据
      // let Data=[
      //     {
      //     date: "2016-05-01",
      //     processName: "故障审批",
      //     processVersion:2016050101
      //     },
      //     {
      //     date: "2016-05-02",
      //     processName: "审批流程",
      //     processVersion:2016050201
      //     },
      //     {
      //     date: "2016-05-03",
      //     processName: "王大虎",
      //     processVersion:2016050301
      //     },
      // ];
      // this.getSearchInfo = Data;
      // // console.log(this.getSearchInfo)
      // },

      mockRequset() {
        this.totalItems = this.resData.length;
        if (this.totalItems > this.pageSize) {
          for (let index = 0; index < this.pageSize; index++) {
            this.tableData.push(this.resData[index]);
          }
        } else {
          this.tableData = this.resData;
        }
      },
      // 前端搜索功能需要区分是否检索,因为对应的字段的索引不同
      doFilter() {
        // debugger
        this.tableData = [];
        this.filterTableData = [];
        // 获取时间范围的时间戳
        var cstarTime = new Date(this.startTime[0]);
        var cendTime = new Date(this.startTime[1]);
        var starTime = cstarTime.getTime();
        var endTime = cendTime.getTime();
        var taskstatusVal = this.taskstatusVal; //状态

        this.resData.filter((item) => {
          // debugger
          if ('formname' in item || 'taskname' in item || 'endtime' in item || "taskstatus" in item) {
            if(taskstatusVal == item.taskstatus){
              // 所属流程存在
              if (this.searchValue == null) {
                if(this.searchFormname == null){
                  // console.log(111)
                  // 只有时间范围
                  if (new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                    this.filterTableData.push(item);
                  }
                }else{
                  // console.log(222)
                  // 只有时间范围
                  if (item.formname.indexOf(this.searchFormname.toUpperCase()) > -1 && new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                    this.filterTableData.push(item);
                  }
                }
              // 所属流程不存在
              } else if (this.searchValue != null) {
                if(this.searchFormname == null){
                  // console.log(333)
                  if (Number.isNaN(starTime)) {
                    //true
                    // 只有事件搜索框
                    if (item.taskname.indexOf(this.searchValue.toUpperCase()) > -1) {
                      this.filterTableData.push(item);
                    }
                  } else {
                    // 搜索框 时间 都存在
                    if (item.taskname.indexOf(this.searchValue.toUpperCase()) > -1 && new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                      this.filterTableData.push(item);
                    }
                  }
                }else{
                  // console.log(444)
                  if (Number.isNaN(starTime)) {
                    //true
                    // 只有事件搜索框
                    if (item.formname.indexOf(this.searchFormname.toUpperCase()) > -1 && item.taskname.indexOf(this.searchValue.toUpperCase()) > -1) {
                      this.filterTableData.push(item);
                    }
                  } else {
                    // 搜索框 时间 都存在
                    if (item.formname.indexOf(this.searchFormname.toUpperCase()) > -1 && item.taskname.indexOf(this.searchValue.toUpperCase()) > -1 && new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                      this.filterTableData.push(item);
                    }
                  }
                }
              }
            }else if(taskstatusVal=="all"){
              // 所属流程存在
              if (this.searchValue == null) {
                if(this.searchFormname == null){
                  // console.log(555)
                  // 只有时间范围
                  if (new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                    this.filterTableData.push(item);
                  }
                }else{
                  // console.log(666)
                  // 只有时间范围
                  if (item.formname.indexOf(this.searchFormname.toUpperCase()) > -1 && new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                    this.filterTableData.push(item);
                  }
                }
              // 所属流程不存在
              } else if (this.searchValue != null) {
                if(this.searchFormname == null){
                  // console.log(777)
                  if (Number.isNaN(starTime)) {
                    //true
                    // 只有事件搜索框
                    if (item.taskname.indexOf(this.searchValue.toUpperCase()) > -1) {
                      this.filterTableData.push(item);
                    }
                  } else {
                    // 搜索框 时间 都存在
                    if (item.taskname.indexOf(this.searchValue.toUpperCase()) > -1 && new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                      this.filterTableData.push(item);
                    }
                  }
                }else{
                  // console.log(888)
                  if (Number.isNaN(starTime)) {
                    //true
                    // 只有事件搜索框
                    if (item.formname.indexOf(this.searchFormname.toUpperCase()) > -1 && item.taskname.indexOf(this.searchValue.toUpperCase()) > -1) {
                      this.filterTableData.push(item);
                    }
                  } else {
                    // 搜索框 时间 都存在
                    if (item.formname.indexOf(this.searchFormname.toUpperCase()) > -1 && item.taskname.indexOf(this.searchValue.toUpperCase()) > -1 && new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
                      this.filterTableData.push(item);
                    }
                  }
                }
              }
            }
          }
        })
        // 页面数据改变重新统计数据数量和当前页
        this.currentPage = 1;
        this.totalItems = this.filterTableData.length;
        // 渲染表格,根据值
        this.currentChangePage(this.filterTableData);
        // 页面初始化数据需要判断是否检索过
        this.flag = true;
      },
      // 每页显示条数改变触发
      handleSizeChange(val) {
        this.pageSize = val;
        this.handleCurrentChange(1);
      },
      // 当前页改变触发
      handleCurrentChange(val) {
        this.currentPage = val;
        // 判断是否为搜索的数据,传入对应值
        if (!this.flag) {
          this.currentChangePage(this.resData);
        } else {
          this.currentChangePage(this.filterTableData);
        }
      },
      // 根据分页，确定当前显示的数据
      currentChangePage(list) {
        let fromNum = (this.currentPage - 1) * this.pageSize;
        let toNum = this.currentPage * this.pageSize;
        this.tableData = [];
        for (; fromNum < toNum; fromNum++) {
          if (list[fromNum]) {
            this.tableData.push(list[fromNum]);
          }
        }
      },
      // 获取时间范围
      dateChangebirthday1(val) {
        if(val == null){
          this.startTime = "";
        }else{
          this.startTime = val;
        }
      },
      // 流程跟踪
      track(index, row) {
        var taskData = JSON.stringify(row);
        this.$router.replace({ path: '/compontents/track', query: { url: this.$route.path,taskData: taskData } })
      },
    },
    // 解决跳转页面不刷新
    // watch:{
    //     '$route'(to,from){
    //         this.$router.replace('/compontents/untreated')
    //     }
    // },

    
    // beforeMount() {
    //   this.mockRequset()
    // }

  }
</script>