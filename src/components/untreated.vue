<template>
  <div>
    <div class="fd-nav-content">
      <div class="Utab">
        <div class="radioGroupBox">
          <el-radio-group v-model="taskstatusVal" size="medium" @change="doFilter">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="1">审核完成</el-radio-button>
            <el-radio-button label="0">审核后</el-radio-button>
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
            <el-input v-model="searchValue" placeholder="输入所属流程">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </div>
          <div class="Udate">办理时间：</div>
          <div class="Uchosedate">
            <el-date-picker
              v-model="value2"
              @change="dateChangebirthday1"
              style="width:240px"
              type="daterange"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              align="center"
              unlink-panels
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
            ></el-date-picker>
          </div>
          <div class="Ubtn">
            <el-button icon="el-icon-search" @click="doFilter">查 询</el-button>
            <!-- <el-button type="primary" @click="doClean">清 空</el-button> -->
          </div>
        </div>
      </div>
      <div class="UtableDiv">
        <el-table :data="taskLists" style="width: 100%;" border>
          <el-table-column label="标题" prop="formname" align="center"></el-table-column>
          <el-table-column label="任务所处环节" prop="nodename" align="center"></el-table-column>
          <el-table-column label="所属流程" prop="taskname" align="center"></el-table-column>
          <el-table-column label="发起任务人" prop="taskSponsor" align="center"></el-table-column>
          <el-table-column label="投送时间" prop="starttime" align="center" :formatter="dateFormatter"></el-table-column>
          <el-table-column label="流程状态" align="center">
            <template slot-scope="scope">
              <span v-show="scope.row.taskstatus=='0'" style="color:#5473e8;">审核中</span>
              <span v-show="scope.row.taskstatus=='1'" style="color:#23bcca;">审核通过</span>
              <span v-show="scope.row.taskstatus=='2'" style="color:#f56c6c;">审核失败</span>
            </template>
          </el-table-column>
          <el-table-column label="任务办理" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                round
                plain
                icon="el-icon-setting"
                @click="dealWith(scope.$index, scope.row)"
                class="purpleBtn"
              >办理</el-button>
            </template>
          </el-table-column>
          <!-- <el-table-column label="流程跟踪" align="center">
            <template slot-scope="scope">
              <el-button
                size="mini"
                round
                plain
                icon="el-icon-aim"
                @click="track(scope.$index, scope.row)"
                class="greenBtn"
              >查看</el-button>
            </template>
          </el-table-column> -->
        </el-table>
        <!-- 分页 分条数 -->
        <div class="Upage">
          <el-pagination
            background
            layout="prev, pager, next, sizes, total"
            :page-sizes="[4,6,8,10]"
            :page-size="pageSize"
            :total="totalItems"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            :current-page="currentPage"
          ></el-pagination>
        </div>
      </div>
    </div>

    <el-dialog class="Udialog" title="流程办理" :visible.sync="dealWithVisible" center @close="hideUdialog">
      <div class="UdiaLeft">
        <iframe :src="iframSrc" id="mapFrame" ref="mapFrame" style="width:100%;height:100%;overflow: auto;"></iframe>
      </div>
      <div class="UdiaRight" style="padding:10px">
        <p class="radioP">
          <el-radio v-model="rejectValue" label="0" @change="rejectRadio">通过</el-radio>
          <el-radio v-model="rejectValue" label="1" @change="rejectRadio">驳回</el-radio>
          <el-radio v-model="rejectValue" label="2" @change="rejectRadio">撤销</el-radio>
        </p>
        <p class="selectP" v-show="rejectSelectState" ref="selectYZ">
          <span>驳回到：</span>
          <el-select v-model="rejectToNode" placeholder="请选择" :class="{selectRed:selectRed=='y'}">
            <el-option
              v-for="(item, index) in rejectOptionsData"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>          
        </p>
        <p class="textareaP">
          <span>处理意见：</span>
          <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="suggestStr"></el-input>
        </p>
        <!-- 流程跟踪 -->
        <div class="untimeLine scrollbarSmall" :style="untimeLineHeight">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in nodeData"
              :key="index"
              :icon="activity.icon"
              :color="activity.color"
            >
              <p class="sendTime">
                <span>{{activity.sendTime}}</span>
              </p>
              <p class="nodeStatus" style="color:#666666;">
                <span v-show="activity.nodeStatus == 0">进行中</span>
                <span v-show="activity.nodeStatus == 1">已完成</span>
                <span v-show="activity.nodeStatus == 2">已撤销</span>
              </p>
              <p class="people">
                <span
                  class="peoName"
                  style="font-size: 14px;font-weight: bold;"
                >{{activity.nodeName}}</span>
              </p>
              <p class="people" style="color:#666666;">
                <span v-show="activity.nodeType == 0">发起人</span>
                <span v-show="activity.nodeType == 1">审核人</span>
                <span v-show="activity.nodeType == 2">抄送人</span>
                <span v-show="activity.nodeType == 3">条件</span>
                <span v-show="activity.nodeType == 4">路由</span>
              </p>
              <div class="nodeDetailsBox">
                 <div v-for="(item, index) in activity.nodeDetails" :key="index+'a'" class="nodeDetailsBox_for">
                    <div style="height: 100%;width:auto;">
                      <div class="handlerBox_n" v-show="item.agentingStatus == 0">{{item.taskSponsor}}
                        <span class="handlerIcon"><i class="el-icon-remove-outline"></i></span>
                      </div>
                      <div class="handlerBox_y" v-show="item.agentingStatus == 1">{{item.taskSponsor}}
                        <span class="handlerIcon"><i class="el-icon-circle-check"></i></span>
                      </div>
                      <div class="handlerBox_cx" v-show="item.agentingStatus == 2">{{item.taskSponsor}}
                        <span class="handlerIcon"><i class="el-icon-circle-close"></i></span>
                      </div>
                      <p v-show="item.suggestStr!=''&&item.suggestStr">“{{item.suggestStr}}”</p>
                      <!-- <p style="color:#666666;float: left;width: auto;display: inline-block;margin-right: 10px;">
                        <span v-show="item.agentingStatus == 0">（已完成）</span><span v-show="item.agentingStatus == 1">（审核中）</span><span v-show="item.agentingStatus == 2">（已撤销）</span>处理说明：<br>
                        “嘻嘻水水嘻嘻水水嘻嘻水水嘻嘻水水嘻嘻水水嘻嘻水水”
                      </p> -->
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dealWithVisible = false">取 消</el-button>
        <el-button class="checkButton" icon="el-icon-check" @click="handleSubmit()">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
@import "../assets/css/workflow.css";
// 这里的样式适用于本组件

/* 流程办理 - 弹框 */
.Udialog .el-dialog {
  /* 左侧 */
  .UdiaLeft {
    padding: 10px;
    background: #f4f4f5;
    /*border-color: rgb(230, 230, 235) !important;*/
    border: none !important;
    height: 100% !important;
    margin-right: 0 !important;
  }

  .UdiaLeft .UdiaLeftP {
    width: 100%;
    height: 35px;
    line-height: 35px;
    margin-bottom: 10px;
    text-align: left;
  }

  .UdiaLeft .UdiaLeftP .el-input {
    width: 300px;
    height: 35px;
  }

  .UdiaLeft .UdiaLeftP .el-input .el-input__inner {
    height: 35px;
  }

  /* 右侧 */
  .UdiaRight {
    background: #f4f4f5;
    /*border-color: rgb(230, 230, 235) !important;*/
    border: none !important;
    height: 100% !important;
    width: 33.5% !important;
    float: right !important;
  }

  .UdiaRight .radioP {
    height: 35px;
    line-height: 35px;
    margin-bottom: 10px;
    background: #fff;
    padding: 0 10px;
  }

  .UdiaRight .selectP {
    line-height: 35px;
    margin-bottom: 10px;
    background: #fff;
    padding: 10px;
  }

  .UdiaRight .selectP .el-select {
    width: calc(100% - 70px);
  }

  .UdiaRight .radioP .el-radio {
    margin-top: 0;
    margin-bottom: 0;
  }

  .UdiaRight .selectP .el-select .el-input__inner {
    height: 35px;
    line-height: 35px;
  }

  .UdiaRight .selectP > span,
  .UdiaRight .textareaP > span {
    display: inline-block;
    width: 70px;
    float: left;
  }

  .UdiaRight .textareaP {
    margin-bottom: 10px;
    background: #fff;
    padding: 10px;
  }

  .UdiaRight .textareaP .el-textarea {
    width: calc(100% - 70px);
  }

  /*底部按钮*/
  .dialog-footer .el-button {
    height: 30px;
  }

  /* 流程跟踪 - 时间线部分 */
  .untimeLine {
    width: 100%;
    height: calc(100% - 171px);
    padding: 0;
    position: relative;
    overflow: auto;
    padding: 10px;
    background-color: #fff;
    box-sizing: border-box;
  }

  .untimeLine .el-timeline-item {
    padding-bottom: 5px;
  }

  .untimeLine .el-timeline-item__wrapper {
    padding-left: 20px;
  }

  .untimeLine .el-timeline-item__content {
    width: 100%;
    height: auto;
  }

  .untimeLine .el-card__body {
    width: calc(100% - 180px);
  }
  .untimeLine .handlerBox_y{
    position: relative;
    margin-right:10px;
    float:left;
    width: max-content;
    height:32px;
    line-height:32px;
    padding:0 5px;
    background-color:#5473e8;
    color: #fff;
    border-radius: 5px;
    font-size:12px;
    .handlerIcon{
      position: absolute;
      height: 15px;
      line-height: 15px;
      width: 16px;
      border-radius: 50%;
      display: inline-block;
      background-color: #fff;
      text-align: center;
      font-size: 15px;
      color: #23bcca;
      top: -6px;
      right: -8px;
    }
  }
  .untimeLine .handlerBox_n{
    position: relative;
    margin-right:10px;
    float:left;
    width: max-content;
    height:32px;
    line-height:32px;
    padding:0 5px;
    background-color:#5473e8;
    color: #fff;
    border-radius: 5px;
    font-size:12px;
    .handlerIcon{
      position: absolute;
      height: 15px;
      line-height: 15px;
      width: 16px;
      border-radius: 50%;
      display: inline-block;
      background-color: #fff;
      text-align: center;
      font-size: 15px;
      color: #5473e8;
      top: -6px;
      right: -8px;
    }
  }
  .untimeLine .handlerBox_cx{
    position: relative;
    margin-right:10px;
    float:left;
    width: max-content;
    height:32px;
    line-height:32px;
    padding:0 5px;
    background-color:#5473e8;
    color: #fff;
    border-radius: 5px;
    font-size:12px;
    .handlerIcon{
      position: absolute;
      height: 15px;
      line-height: 15px;
      width: 16px;
      border-radius: 50%;
      display: inline-block;
      background-color: #fff;
      text-align: center;
      font-size: 15px;
      color: #f56c6c;
      top: -6px;
      right: -8px;
    }
  }

  .untimeLine .el-timeline {
    margin-left: 120px !important;
  }

  .untimeLine .el-timeline-item__content p {
    font-size: 12px;
  }

  .untimeLine .sendTime {
    position: absolute;
    left: -125px;
    width: 115px;
    text-align: right;
  }

  .untimeLine .nodeStatus {
    position: absolute;
    left: -125px;
    width: 115px;
    text-align: right;
    top: 25px;
  }
  
  // 流程-具体办理人样式
  .nodeDetailsBox{
    width:auto;height:auto;overflow:auto;margin-top: -2px;
    .nodeDetailsBox_for{
      float:left;padding-top: 6px;height:auto;
      p{
        width: auto;display: inline-block;margin-right: 10px;margin-top:12px;color:#666666;
      }
    }
  }
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
.UdiaRight .el-timeline-item__content {
  width: 100% !important;
  height: auto !important;
}
.checkButton {
  background-color: #5473e8 !important;
  color: #fff !important;
  border: none !important;
}
.checkButton:hover {
  background-color: rgba(84, 115, 232, 0.8) !important;
}
.Udialog .UdiaRight .el-card.is-always-shadow{
  padding: 8px !important;
}
.Udialog .UdiaRight .el-card__body {
  padding: 0 !important;
}
.Uchosedate .el-date-editor .el-range-separator {
  line-height: 24px;
}

/* 驳回到 未填验证 */
.selectRed .el-input__inner,.el-input__inner:after, .el-input__inner:before{
  border-color: #f56c6c !important;
}
.selectRed .el-input__inner::-webkit-input-placeholder { 
/* WebKit browsers */ 
  color: #f56c6c; 
} 
.selectRed .el-input__inner:-moz-placeholder { 
/* Mozilla Firefox 4 to 18 */ 
  color: #f56c6c; 
} 
.selectRed .el-input__inner::-moz-placeholder { 
/* Mozilla Firefox 19+ */ 
  color: #f56c6c; 
} 
.selectRed .el-input__inner:-ms-input-placeholder { 
/* Internet Explorer 10+ */ 
  color: #f56c6c; 
}
.selectRed .el-input .el-select__caret{
  color: #f56c6c; 
}
</style>
<script>
export default {
  data() {
    return {
      taskstatusVal: 'all',

      iframSrc: "", // 内嵌form表单url
      untimeLineHeight: { 'height':'calc(100% - 171px)' },

      // 流程办理左侧表单：
      rejectValue: "0", //通过驳回
      rejectSelectState: false, // 驳回到是否显示
      rejectOptionsData: [], // 驳回到 数据
      rejectToNode: "", // 驳回到 选中值
      selectRed: "n", //驳回到空值状态 y标红 n正常
      resData: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      value1: "",
      value2: "",
      //搜索条件
      searchFormname: "", //搜索：标题
      searchValue: "", //搜索：所属流程
      pageSize: 10, //每页显示条数
      currentPage: 1, //页码
      totalItems: 0, //总条数
      taskLists: [], // 待办数据
      filterTableData: [],
      flag: false,
      //
      getSearchInfo: [],
      // 获取时间范围
      startTime: "",
      staffList: [],
      isNaN: false,
      //办理弹窗
      dealWithVisible: false,
      dealTitle: "",
      taskName: "", // 传递的任务名称
      agentingid: "", // 传递的事件id
      taskData: [], //传递的事件行数据
      nodeData: [], //环节数据
      suggestStr: "", // 流程办理弹框 - 处理意见

      dormitory: [],

      formid: "", // 流程办理表单 formid

      taskSponsor: "", // 待办任务人
      loadPersonTree: [], // 组织架构(已完成base64解码)
      base64_lpData: window.sessionStorage.loadPersonTree, // 组织架构-base64
    };
  },
  mounted() {
    // this.getId();

    // 引入base64
    let Base64 = require("js-base64").Base64;
    // 设备管理:组织架构 本地缓存
    if(window.sessionStorage.loadPersonTree == undefined){
      this.$axios.get("/web/mes/inspectionplan/treeloadPerson.do")
        .then(res => {
          this.loadPersonTree = res.data;
          window.sessionStorage.loadPersonTree = Base64.encode(JSON.stringify(res.data), "utf-8");
          // console.log(this.loadPersonTree)
          this.queryTaskLists();
      })
    }else{
      this.loadPersonTree = JSON.parse(Base64.decode(this.base64_lpData));
      // console.log(this.loadPersonTree)
      this.queryTaskLists();
    }
  },
  methods: {
    // 查询待办表格数据获取
    queryTaskLists(){
      this.$axios.get("/api/qdc/queryTaskLists", {
          params: {
            userid: "sa",
            flag: "0"
          }
        })
        .then(res => {                         
          var lpData = this.loadPersonTree; // 组织架构数据
          var tlData = res.data; // 待办任务数据
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
            item['taskSponsor']=this.taskSponsor; // 待办任务数据添加 taskSponsor:"超级管理员"
          });
          // this.taskLists = tlData;
          this.resData = tlData;
          this.mockRequset();
        }).catch(function(error) {
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
    // 日期格式化
    dateFormatter(row, column) {
      function add0(m) {
        return m < 10 ? "0" + m : m;
      }
      let datetime = row.starttime;
      if (datetime) {
        datetime = new Date(datetime);
        let year = datetime.getFullYear();
        let month = datetime.getMonth() + 1;
        let day = datetime.getDate();
        var hours = datetime.getHours();
        var minutes = datetime.getMinutes();
        var seconds = datetime.getSeconds();
        return (
          year +
          "-" +
          add0(month) +
          "-" +
          add0(day) +
          " " +
          add0(hours) +
          ":" +
          add0(minutes) +
          ":" +
          add0(seconds)
        );
      }
      return "";
    },
    dateFormatter2(sendTime) {
      function add0(m) {
        return m < 10 ? "0" + m : m;
      }
      let datetime = sendTime;
      if (datetime) {
        datetime = new Date(datetime);
        let year = datetime.getFullYear();
        let month = datetime.getMonth() + 1;
        let day = datetime.getDate();
        var hours = datetime.getHours();
        var minutes = datetime.getMinutes();
        var seconds = datetime.getSeconds();
        return (
          year +
          "-" +
          add0(month) +
          "-" +
          add0(day) +
          " " +
          add0(hours) +
          ":" +
          add0(minutes) +
          ":" +
          add0(seconds)
        );
      }
      return "";
    },

    // 分页设置
    mockRequset() {
      this.totalItems = this.resData.length;
      if (this.totalItems > this.pageSize) {
        for (let index = 0; index < this.pageSize; index++) {
          this.taskLists.push(this.resData[index]);
        }
      } else {
        this.taskLists = this.resData;
      }
    },

    // 筛选 - 根据状态
    screenTaskstatus(){

    },

    // 查询
    // 前端搜索功能需要区分是否检索,因为对应的字段的索引不同
    doFilter() {
      // debugger
      this.taskLists = [];
      this.filterTableData = [];

      // 获取时间范围的时间戳
      var cstarTime = new Date(this.startTime[0]);
      var cendTime = new Date(this.startTime[1]);
      var starTime = cstarTime.getTime();
      var endTime = cendTime.getTime();
      var taskstatusVal = this.taskstatusVal; //状态

      this.resData.filter(item => {
        // debugger
        if ("formname" in item || "taskname" in item || "starttime" in item || "taskstatus" in item) {          
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
          // if (this.searchValue == null) {
          //   // 只有时间范围
          //   if (new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
          //     this.filterTableData.push(item);
          //   }
          // } else if (this.searchValue != null) {
          //   if (Number.isNaN(starTime)) {
          //     //true
          //     // 只有事件搜索框
          //     if (item.taskname.indexOf(this.searchValue.toUpperCase()) > -1) {
          //       this.filterTableData.push(item);
          //     }
          //   } else {
          //     // 搜索框 时间 都存在
          //     if (item.taskname.indexOf(this.searchValue.toUpperCase()) > -1 && new Date(item.starttime).getTime() >= starTime && new Date(item.starttime).getTime() <= endTime) {
          //       this.filterTableData.push(item);
          //     }
          //   }
          // }
        }
      });
      // 页面数据改变重新统计数据数量和当前页
      this.currentPage = 1;
      this.totalItems = this.filterTableData.length;
      // 渲染表格,根据值
      this.currentChangePage(this.filterTableData);
      // 页面初始化数据需要判断是否检索过
      this.flag = true;
    },
    // 清空查询
    doClean() {
      this.value2 = "";
      this.searchValue = "";
      // 重新拉取表格数据 或 刷新页面
      // window.location.reload(); //闪烁
      this.$router.go(0);
    },
    // 每页显示条数改变触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.handleCurrentChange(1);
    },
    // 当前页改变触发
    handleCurrentChange(val) {
      this.currentPage = val; //页码1
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
      this.taskLists = [];
      for (; fromNum < toNum; fromNum++) {
        if (list[fromNum]) {
          this.taskLists.push(list[fromNum]);
        }
      }
    },
    // 获取时间范围
    dateChangebirthday1(val) {
      if (val == null) {
        this.startTime = "";
      } else {
        this.startTime = val;
      }
    },

    // 跳转 -流程跟踪
    track(index, row) {
      var taskData = JSON.stringify(row);
      this.$router.replace({
        path: "/compontents/track",
        query: { url: this.$route.path, taskData: taskData }
      });
    },

    // 流程办理 打开弹框
    dealWith(index, row) {
      this.dealWithVisible = true;
      this.dealTitle = row.name;
      this.agentingid = row.agentingid;

      this.rejectValue = "0";
      this.rejectSelectState = false;
      this.rejectOptionsData = [];
      this.rejectToNode = "";

      // 请求 - 流程跟踪
      this.$axios.get("/api/qdc/queryNode", {
          params: {
            agentingid: row.agentingid
          }
        })
        .then(res => {
          var nodeData = res.data;
          nodeData.forEach(item => {
            item.sendTime = this.dateFormatter2(item.sendTime);
            if (item.nodeStatus == 0) {
              this.$set(item, "icon", "el-icon-more");
              this.$set(item, "color", "#5473e8");
            }else if(item.nodeStatus == 1) {
              this.$set(item, "icon", "el-icon-check");
              this.$set(item, "color", "#23bcca");
            }else{
              this.$set(item, "icon", "el-icon-close");
              this.$set(item, "color", "#f56c6c");
            }
          });
          this.nodeData = nodeData;
          // 遍历组织架构,根据userid找到组织架构中对应的发起任务人
          nodeData.map(item => {
            var lpData = this.loadPersonTree; // 组织架构数据
            var tlData = item.nodeDetails; // 办理人数据
            tlData.map(item=>{ 
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
              item['taskSponsor']=this.taskSponsor; // 办理人添加 taskSponsor:"超级管理员"
            });
          })
          // console.log(this.nodeData)
        })
        .catch(function(error) {
          console.log(error);
        });

      // iframSrc
      this.formid = row.formid;
      this.iframSrc = "/web/mes/platform/jsp/hgtlc/maintenance/maintenanceFlow.jsp?work_id="+row.formid;
    },
    // 单选 通过 驳回 撤销
    rejectRadio(label){
      this.selectRed = "n"
      if(label=="0"){
        this.rejectValue = "0";
        this.rejectSelectState = false;
        this.rejectOptionsData = [];
        this.rejectToNode = "";
        this.untimeLineHeight = {"height":"calc(100% - 171px) !important"}
      }else if(label=="1"){
        this.rejectValue = "1";
        this.rejectSelectState = true;
        this.rejectOptionsData = [];
        this.$axios.get("/api/qdc/queryCanRejectNode", {
          params: { agentingid: this.agentingid}
        })
        .then(res => {
          var arr = res.data;
          arr.map(item => {
          this.rejectOptionsData.push({
              value: item.id,
              label: item.nodename
            })
          });
        })
        this.untimeLineHeight = {"height":"calc(100% - 241px) !important"};
      }else{
        this.rejectValue = "2";
        this.rejectSelectState = false;
        this.rejectOptionsData = [];
        this.rejectToNode = "";
        this.untimeLineHeight = {"height":"calc(100% - 171px) !important"}
      }
    },
    // 流程办理 - 提交
    handleSubmit() {
      var this_ = this;
      // this.iframDom();

      var mapFrame = this.$refs["mapFrame"].contentWindow.document;
      // 维修人部门
      var maintenance_organid = mapFrame.getElementById("maintenance_organid").value;
      // 维修人员
      var maintenance_person = mapFrame.getElementById("maintenance_person").value;
      // 维修截止时间
      var repair_time = mapFrame.getElementById("repair_time").value;
      // 处理说明
      var dealwith_details = mapFrame.getElementById("dealwith_details").value;
      // 工单状态
      var state = mapFrame.getElementById("state").value;

      // 非空限制
      this.nullCheck(maintenance_organid,maintenance_person,repair_time,dealwith_details,state);   
    },
    // 流程办理 非空校验
    nullCheck(maintenance_organid,maintenance_person,repair_time,dealwith_details,state){
      // 未分配  通过/撤销
      if(state == "未分配" && this.rejectValue != "1"){
        var arr = [];
        arr.length = 0;
        var str = "请填写";
        if(maintenance_organid=="" || maintenance_person=="" || repair_time==""){
          if(maintenance_organid==""){
            arr.push("维修人部门")
          }
          if(maintenance_person==""){
            arr.push("维修人员")
          }
          if(repair_time==""){
            arr.push("维修截止时间")
          }
          for (var i = 0; i < arr.length; i++) {
            str += arr[i]+ "、";
          }
          //去掉最后一个逗号(如果不需要去掉，就不用写)
          if (str.length > 0) {
            str = str.substr(0, str.length - 1);
          }
          this.$message({
              message: str,
              type: 'warning'
            });
        }else{
          this.rejectRadioConfirm(maintenance_organid,maintenance_person,repair_time,dealwith_details,state); 
        }
      // 未分配 驳回状态
      }else if(state == "未分配" && this.rejectValue == "1"){
        var arr = [];
        var str = "请填写";
        if(maintenance_organid=="" || maintenance_person=="" || repair_time=="" || this.rejectToNode==""){
          if(maintenance_organid==""){
            arr.push("维修人部门")
          }
          if(maintenance_person==""){
            arr.push("维修人员")
          }
          if(repair_time==""){
            arr.push("维修截止时间")
          }
          if(this.rejectToNode==""){
            this.selectRed = "y"
            arr.push("驳回环节")
          }
          for (var i = 0; i < arr.length; i++) {
            str += arr[i]+ "、";
          }
          //去掉最后一个逗号(如果不需要去掉，就不用写)
          if (str.length > 0) {
            str = str.substr(0, str.length - 1);
          }
          this.$message({
            message: str,
            type: 'warning'
          });
        }else{
          this.rejectRadioConfirm(maintenance_organid,maintenance_person,repair_time,dealwith_details,state); 
        }
      // 未处理 通过/撤销     
      }else if(state == "未处理"  && this.rejectValue != "1"){
        if(dealwith_details==""){
          this.$message({
            message: "请填写处理说明",
            type: 'warning'
          });
        }else{
          this.rejectRadioConfirm(maintenance_organid,maintenance_person,repair_time,dealwith_details,state); 
        }
      // 未处理 驳回 
      }else if(state == "未处理"  && this.rejectValue == "1"){
        var arr = [];
        var str = "请填写";
        if(dealwith_details=="" || this.rejectToNode==""){
          if(dealwith_details==""){
            arr.push("处理说明")
          }
          if(this.rejectToNode==""){
            this.selectRed = "y"
            arr.push("驳回环节")
          }
          for (var i = 0; i < arr.length; i++) {
            str += arr[i]+ "、";
          }
          //去掉最后一个逗号(如果不需要去掉，就不用写)
          if (str.length > 0) {
            str = str.substr(0, str.length - 1);
          }
          this.$message({
            message: str,
            type: 'warning'
          });
        }else{
          this.rejectRadioConfirm(maintenance_organid,maintenance_person,repair_time,dealwith_details,state);
        }
      // 处理完成 通过/撤销
      }else if(state == "处理完成" && this.rejectValue != "1"){
        this.rejectRadioConfirm(maintenance_organid,maintenance_person,repair_time,dealwith_details,state);
      // 处理完成 驳回
      }else if(state == "处理完成" && this.rejectValue == "1"){
        if(this.rejectToNode==""){
          this.selectRed = "y"
          this.$message({
            message: "请填写驳回环节",
            type: 'warning'
          });
        }else{
          this.rejectRadioConfirm(maintenance_organid,maintenance_person,repair_time,dealwith_details,state);
        }
      }
    },
    // 流程办理提交 驳回/撤销确认
    rejectRadioConfirm(maintenance_organid,maintenance_person,repair_time,dealwith_details,state) {
      this.selectRed = "n"
      if(this.rejectValue=="0"){
        this.transactMaintenanceFlow(maintenance_organid,maintenance_person,repair_time,dealwith_details,state);
      }else if(this.rejectValue=="1"){
        // 驳回
        this.$confirm('确定要驳回吗', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.transactMaintenanceFlow(maintenance_organid,maintenance_person,repair_time,dealwith_details,state);
        })
      }else if(this.rejectValue=="2"){
        // 撤销
        this.$confirm('确定要撤销吗', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.transactMaintenanceFlow(maintenance_organid,maintenance_person,repair_time,dealwith_details,state);
        })
      }
    },
    // 流程办理提交 - 数据处理后提交
    transactMaintenanceFlow(maintenance_organid,maintenance_person,repair_time,dealwith_details,state){
      var formdataObj = {};
      formdataObj['formid'] = this.formid;
      var formdata = [];
      var mapFrame = this.$refs["mapFrame"].contentWindow.document;
      formdata.push(
        {
          // name : mapFrame.getElementById("maintenance_organid").name,
          name: "maintenance_organ",
          value: maintenance_organid
        },{
          name : mapFrame.getElementById("maintenance_person").name,
          value: maintenance_person
        },{ 
          name : mapFrame.getElementById("repair_time").name,
          value : repair_time
        },{
          name : mapFrame.getElementById("dealwith_details").name,
          value: dealwith_details
        },{
          name : mapFrame.getElementById("state").name,
          value: state
        });
      formdataObj.formdata = formdata;
      // formdataObj = Base64.encode(JSON.stringify(formdataObj), "utf-8")
      formdataObj = JSON.stringify(formdataObj)
      this.$axios({
        method: "post",
        url: "/web/mes/MaintenanceOrderAction/transactMaintenanceFlow.do",
        headers: {
          contentType: 'text/json,charset=utf-8'
        },
        params:{
          agentid: this.agentingid,
          formdata: formdataObj,
          flag: this.rejectValue,
          rejectToNode: this.rejectToNode,
          suggestStr: this.suggestStr
        }
      }).then((res)=> {
        if(res.status=="success"){
          this.dealWithVisible = false;
          this.queryTaskLists();
          this.$message({
            message: res.message,
            type: 'success'
          });   
        }else{
          this.$message.error(res.message);
        } 
      }).catch((error)=> {
          this.$message.error(res.message);
      });
    },

    // 流程办理 关闭弹框
    hideUdialog(){
      this.rejectValue = "0"; //驳回单选，默认通过状态
      this.rejectSelectState = false; //驳回下拉隐藏
      this.rejectOptionsData = []; //驳回下拉数据
      this.rejectToNode = ""; //驳回到
      this.selectRed = "n"; //驳回到未填写颜色状态
      this.suggestStr = ""; //处理意见
      this.untimeLineHeight = {"height":"calc(100% - 171px) !important"};
      this.formid = "";   
      this.iframSrc="";

      //表单输入项清空
      // var mapFrame = this.$refs["mapFrame"].contentWindow.document;
      // mapFrame.getElementById("maintenance_dept").value = "";
      // mapFrame.getElementById("maintenance_organid").value = "";
      // mapFrame.getElementById("maintenance_person").value = "";
      // mapFrame.getElementById("repair_time").value = "";
      // mapFrame.getElementById("dealwith_details").value = "";
    },

    //ifram 提交方法 根据元素名获取值
    iframDom(){
      // ifram
      var this_ = this;
      var mapFrame = this_.$refs["mapFrame"];
      // 加载完毕后返回
      this.$nextTick(function() {
        // console.log("我加载完成了！");
        // console.log(mapFrame.contentWindow.document.body);

        const formdata = []; // 所有处理好的数据 value name

        // 输入框 input (text、password、radio、checkbox、)
        const inputList = mapFrame.contentWindow.document.getElementsByTagName("input"); // 所有input
        // 循环所有input
        for (let i = 0; i < inputList.length; i++) {
          // 判断->文本框类型（文本框可以拿到，下拉框也可以拿到）
          if (inputList[i].type == "text" && inputList[i].name != "") {
            const objTxtInp = {}; // 声明一个空对象，用来存放获取到所填写的信息
            objTxtInp["name"] = inputList[i].name; // 利用方括号法添加属性和属性值
            objTxtInp["value"] = inputList[i].value;
            formdata.push(objTxtInp);
          } else if (inputList[i].type == "password") {
            // 判断->密码类型
            const objPwdInp = {};
            objPwdInp["name"] = inputList[i].name;
            objPwdInp["value"] = inputList[i].value;
            formdata.push(objPwdInp);
          } else if (inputList[i].type == "radio" && inputList[i].checked) {
            // 判断->单选类型
            const objRadioInp = {};
            objRadioInp["name"] = inputList[i].name;
            objRadioInp["value"] = inputList[i].value;
            formdata.push(objRadioInp);
          } else if (inputList[i].type == "checkbox" && inputList[i].checked) {
            // 判断->复选框类型
            const objCheckboxInp = {};
            objCheckboxInp["name"] = inputList[i].name;
            objCheckboxInp["value"] = inputList[i].value;
            formdata.push(objCheckboxInp);
          }
        }

        // 文本域 textarea
        const textareaList = mapFrame.contentWindow.document.getElementsByTagName("textarea"); // 所有文本域
        for (let i = 0; i < textareaList.length; i++) {
          const objTextarea = {};
          objTextarea["name"] = textareaList[i].name;
          objTextarea["value"] = textareaList[i].value;
          formdata.push(objTextarea);
        }

        // 下拉框 select
        const selectList = mapFrame.contentWindow.document.getElementsByTagName("select");
        const selectL = []; // 处理后下拉框
        for (let i = 0; i < selectList.length; i++) {
          const objSelect = {};
          objSelect["name"] = selectList[i].name;
          objSelect["value"] = selectList[i].value;
          formdata.push(objSelect);
        }

        // easyUI 专属 （下拉框、时间框、文本框
        const easyUIList = mapFrame.contentWindow.document.getElementsByClassName(
          "textbox-value"
        ); // 所有input easyUI
        const easyZong = []; // 处理后
        for (let i = 0; i < easyUIList.length; i++) {
          const inputEasy = {};
          inputEasy["name"] = easyUIList[i].name;
          inputEasy["value"] = easyUIList[i].value;
          easyZong.push(inputEasy);
          formdata.push(inputEasy);
        }

        console.log("总集合：");
        console.log(formdata);
        
      });    
    }

  }

  // 解决跳转页面不刷新
  // watch:{
  //     '$route'(to,from){
  //         this.$router.replace('/compontents/untreated')
  //     }
  // },

  // 载入前
  // beforeMount() {
  //   this.mockRequset();
  // }
};
</script>