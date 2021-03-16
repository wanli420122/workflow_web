<template>
  <div>
    <div class="trackTop fd-nav">
      <div class="fd-nav-left">
        <div class="fd-nav-back" @click="goBack">
          <!-- <i class="anticon anticon-left"></i> -->
          <i class="el-icon-arrow-left" style="font-size:20px;"></i>
        </div>
      </div>
      <div class="fd-nav-center">
        <div class="fd-nav-container">
          <div class="title">
            流程跟踪 -
            <span style="margin-left:10px">{{taskName}}</span>
          </div>
        </div>
      </div>
      <div class="fd-nav-right"></div>
    </div>

    <div class="trackMain fd-nav-content">
      <div class="TtableDiv">
        <el-table :data="taskData" border style="width: 100%">
          <el-table-column prop="nodename" label="任务所处环节" align="center"></el-table-column>
          <el-table-column prop="taskname" label="任务名称" align="center"></el-table-column>
          <el-table-column prop="taskSponsor" label="发起任务人" align="center"></el-table-column>
          <el-table-column
            v-show="this.backUrl == '/compontents/untreated'"
            prop="starttime"
            label="投送时间"
            align="center"
            :formatter="dateFormatter"
          ></el-table-column>
          <el-table-column
            v-show="this.backUrl == '/compontents/handled'"
            prop="endTime"
            label="办理时间"
            align="center"
            :formatter="dateFormatter"
          ></el-table-column>
        </el-table>
      </div>
      <div class="Tmain">
        <div class="Ttitle">
          <p>当前状态</p>
        </div>
        <div class="stepDiv">
          <div class="step">
            <el-steps :active="taskStatus" v-show="taskStatus!=null">
              <el-step title="授理中" icon="el-icon-tickets"></el-step>
              <el-step title="审核中" icon="el-icon-time"></el-step>
              <el-step title="已完结" icon="el-icon-document-checked"></el-step>
            </el-steps>
            <el-steps :active="taskStatus" v-show="taskStatus==null" class="el-step_red">
              <el-step title="授理中" icon="el-icon-tickets"></el-step>
              <el-step title="审核中" icon="el-icon-time"></el-step>
              <el-step title="失败" icon="el-icon-document-delete" class="el-step_redno"></el-step>
            </el-steps>
          </div>
        </div>
        <div class="timeLine" style="min-width:540px;overflow:auto;">
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
              <p class="nodeStatus">
                <span v-show="activity.nodeStatus == 0">进行中</span>
                <span v-show="activity.nodeStatus == 1">已完成</span>
                <span v-show="activity.nodeStatus == 2">已撤销</span>
              </p>
              <p class="people">
                <span class="peoName" style="font-size: 15px;color: #333333;">{{activity.nodeName}}</span>
              </p>
              <p class="people" style="color:#666666;">
                <span v-show="activity.nodeType == 0">发起人</span>
                <span v-show="activity.nodeType == 1">审核人</span>
                <span v-show="activity.nodeType == 2">抄送人</span>
                <span v-show="activity.nodeType == 3">条件</span>
                <span v-show="activity.nodeType == 4">路由</span>
              </p>
              <!-- <el-card class="box-card">
                <div v-for="(item, index) in activity.nodeDetails" :key="index+'a'">
                  <p>办理人： {{item.taskSponsor}}</p>
                  <p v-if="item.agentingStatus == 0">办理状态：待办</p>
                  <p v-else>办理状态：已办</p>
                </div>
              </el-card> -->
              <el-card>
                <div v-for="(item, index) in activity.nodeDetails" :key="index+'a'" class="nodeDetailsBox_for">
                  <div style="float:left;padding-top:10px;height: 100%;" :style="{width:(item.suggestStr!=''&&item.suggestStr ?'428px':'auto')}">
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
                 </div>
                </div>
                 <!-- <div v-for="(item, index) in activity.nodeDetails" :key="index+'a'" style="float:left;padding-top:10px;height: 44px;line-height: 44px;">
                    <div class="handlerBox_n" v-show="item.agentingStatus == 0">{{item.taskSponsor}}
                      <span class="handlerIcon"><i class="el-icon-remove-outline"></i></span>
                    </div>
                    <div class="handlerBox_y" v-show="item.agentingStatus == 1">{{item.taskSponsor}}
                      <span class="handlerIcon"><i class="el-icon-circle-check"></i></span>
                    </div>
                    <div class="handlerBox_cx" v-show="item.agentingStatus == 2">{{item.taskSponsor}}
                      <span class="handlerIcon"><i class="el-icon-circle-close"></i></span>
                    </div>
                  </div> -->

              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <!-- Tmain -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
/*workflow.css存放至main.js 中，此处需该方式引入*/
@import "../assets/css/workflow.css";

.timeLine .sendTime {
  width: max-content;
  position: absolute;
  left: -150px;
  color: #333333;
}

.timeLine .nodeStatus {
  width: 60px;
  position: absolute;
  left: -70px;
  top: 25px;
  color: #666666;
}
.trackTop {
  width: calc(100% - 165px);
  height: 50px;
  line-height: 50px;
  position: absolute;
  left: 150px;
  top: 55px;
  z-index: 10;
  background-color: #fff;
  border-radius: 4px;

  .fd-nav-back {
    border: none;
    i {
      color: #778ca2;
      font-size: 18px;
    }
  }

  .fd-nav-back:hover {
    background-color: #5473e8;
    i {
      color: #fff;
    }
  }
  .fd-nav-center {
    color: #5473e8;
  }
}

.TtableDiv {
  border-radius: 4px;
  .el-table--border,
  .el-table--group {
    border-radius: 4px;
  }
}

.Tmain .el-card {
  border-radius: 4px;
  padding: 10px;
  padding-top: 1px;
}

  .timeLine .handlerBox_y{
    position: relative;
    margin-right:12px;
    float:left;
    width: max-content;
    height:34px;
    line-height:34px;
    padding:0 7px;
    background-color:#5473e8;
    color: #fff;
    border-radius: 5px;
    font-size:14px;
    .handlerIcon{
      position: absolute;
      height: 18px;
      line-height: 18px;
      width: 18px;
      border-radius: 50%;
      display: inline-block;
      background-color: #fff;
      text-align: center;
      top: -6px;
      right: -8px;
      i{
        margin-top: 1px;
        font-size: 17px;
        color: #23bcca;
      }
    }
  }
  .timeLine .handlerBox_n{
    position: relative;
    margin-right:12px;
    float:left;
    width: max-content;
    height:34px;
    line-height:34px;
    padding:0 7px;
    background-color:#5473e8;
    color: #fff;
    border-radius: 5px;
    font-size:14px;
    .handlerIcon{
      position: absolute;
      height: 18px;
      line-height: 18px;
      width: 18px;
      border-radius: 50%;
      display: inline-block;
      background-color: #fff;
      text-align: center;
      top: -6px;
      right: -8px;
      i{
        margin-top: 1px;
        font-size: 17px;
        color: #5473e8;
      }
    }
  }
  .timeLine .handlerBox_cx{
    position: relative;
    margin-right:12px;
    float:left;
    width: max-content;
    height:34px;
    line-height:34px;
    padding:0 7px;
    background-color:#5473e8;
    color: #fff;
    border-radius: 5px;
    font-size:14px;
    .handlerIcon{
      position: absolute;
      height: 18px;
      line-height: 18px;
      width: 18px;
      border-radius: 50%;
      display: inline-block;
      background-color: #fff;
      text-align: center;
      top: -6px;
      right: -8px;
      i{
        margin-top: 1px;
        font-size: 17px;
        color: #f56c6c;
      }
    }
  }

  .nodeDetailsBox_for{
    float:left;
    height:auto;
    p{
      width: auto;
      display: inline-block;
      margin-top:7px;
    }
  }
</style>
<style>
.timeLine .el-timeline-item__content {
  height: auto;
}

.timeLine .el-card__body {
  padding: 0;
  color: #666666;
}

.trackTop .fd-nav-left,
.trackTop .fd-nav-center,
.trackTop .fd-nav-right,
.trackTop .fd-nav-left .fd-nav-back {
  height: 50px;
  line-height: 50px;
}

.trackTop .fd-nav-back .anticon {
  line-height: 50px;
}

.trackTop .zoom {
  margin-top: 50px !important;
}
.trackMain {
  height: calc(100% - 110px);
  top: 110px;
  padding: 15px !important;
}

/* 红色步骤条 */
.el-step_red .el-step.is-horizontal .el-step__line {
  background-color: #f56c6c !important;
}
.el-step_red .el-step__icon.is-icon {
  color: #f56c6c !important;
}
.el-step_red .el-step__title.is-wait {
  color: #f56c6c !important;
}
.el-step_redno .el-step__title is-wait {
  margin-left: 6px !important;
}
.el-step_red .el-step:nth-child(3) .el-step__main {
  text-align: center !important;
}
</style>

<script>
var _index; //定义一个全局变量，以获取行数据的行号
export default {
  data() {
    return {
      backUrl: "",
      sendTime: "",
      taskName: "", // 传递的任务名称（待办/已办/我发起的）
      agentingid: "", // 传递的事件id（待办/已办）
      taskid: "", //传递的事件id（我发起的）
      taskData: [], //传递的事件行数据
      nodeData: [], //环节数据
      taskStatus: 1, //环节状态
      taskSponsor: "", //办理人
      loadPersonTree: [], // 组织架构(已完成base64解码)
      base64_lpData: window.sessionStorage.loadPersonTree // 组织架构-base64
    };
  },
  mounted() {
    this.backUrl = this.$route.query.url;
    if(JSON.parse(this.$route.query.taskData).agentingid){
      this.agentingid = JSON.parse(this.$route.query.taskData).agentingid;
      this.taskName = JSON.parse(this.$route.query.taskData).taskname;
    }else{
      this.taskid = JSON.parse(this.$route.query.taskData).id;
      this.taskName = JSON.parse(this.$route.query.taskData).formname;
      var status = JSON.parse(this.$route.query.taskData).status;
      if (status == "0") {
        this.taskStatus += 1;
      } else if (status == "1") {
        this.taskStatus += 2;
      } else if (status == "2") {
        this.taskStatus = null;
      }
    }
    this.taskData.push(JSON.parse(this.$route.query.taskData));
    // console.log(this.taskData);

    // 引入base64
    let Base64 = require("js-base64").Base64;
    // 设备管理:组织架构 本地缓存
    if (window.sessionStorage.loadPersonTree == undefined) {
      this.$axios.get("/web/mes/inspectionplan/treeloadPerson.do").then(res => {
        this.loadPersonTree = res.data;
        window.sessionStorage.loadPersonTree = Base64.encode(
          JSON.stringify(res.data),
          "utf-8"
        );
        if(this.agentingid){
          this.queryNode();
          this.queryTaskStatus();
        }else{
          this.queryDetailByTaskid();
        }
      });
    } else {
      this.loadPersonTree = JSON.parse(Base64.decode(this.base64_lpData));
      if(this.agentingid){
        this.queryNode();
        this.queryTaskStatus();
      }else{
        this.queryDetailByTaskid();
      }
    }


  },
  methods: {
    // 待办/已办：请求流程环节详情
    queryNode() {
      this.$axios.get("/api/qdc/queryNode", {
        params: {
          agentingid: this.agentingid
        }
      }).then(res => {
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
        // console.log(nodeData);
        this.nodeData = nodeData;
        // 遍历组织架构,根据userid找到组织架构中对应的发起任务人
        nodeData.map(item => {
          var lpData = this.loadPersonTree; // 组织架构数据
          var tlData = item.nodeDetails; // 办理人数据
          tlData.map(item => {
            var useridNow = item.userid;
            // 遍历组织架构,根据userid找到组织架构中对应的发起任务人
            lpData.map(item => {
              if (useridNow != item.id) {
                if (item.children.length > 0) {
                  this.itemFun(item, useridNow);
                }
              } else {
                this.taskSponsor = item.title;
                return false;
              }
            });
            item["taskSponsor"] = this.taskSponsor; // 办理人添加 taskSponsor:"超级管理员"
          });
        });
      }).catch(function(error) {
        console.log(error);
      });
    },
    //  待办/已办：请求流程环节状态
    queryTaskStatus(){
      this.$axios.get("/api/qdc/queryTaskStatus", {
        params: {
          agentingid: this.agentingid
        }
      }).then(res => {
        if (res.data == 0) {
          this.taskStatus += 1;
        } else if (res.data == 1) {
          this.taskStatus += 2;
        } else if (res.data == 2) {
          this.taskStatus = null;
        }
      }).catch(function(error) {
        console.log(error);
      });
    },
    // 我发起的：根据任务id查询该任务执行明细
    queryDetailByTaskid(){
      this.$axios.get("/api/qdc/queryDetailByTaskid", {
        params: {
          taskid: this.taskid
        }
      }).then(res => {
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
        // console.log(nodeData);
        this.nodeData = nodeData;
        // 遍历组织架构,根据userid找到组织架构中对应的发起任务人
        nodeData.map(item => {
          var lpData = this.loadPersonTree; // 组织架构数据
          var tlData = item.nodeDetails; // 办理人数据
          tlData.map(item => {
            var useridNow = item.userid;
            // 遍历组织架构,根据userid找到组织架构中对应的发起任务人
            lpData.map(item => {
              if (useridNow != item.id) {
                if (item.children.length > 0) {
                  this.itemFun(item, useridNow);
                }
              } else {
                this.taskSponsor = item.title;
                return false;
              }
            });
            item["taskSponsor"] = this.taskSponsor; // 办理人添加 taskSponsor:"超级管理员"
          });
        });
      });
    },
    
    // 组织架构递归循环,找到发起任务人
    itemFun(itemCan, useridNow) {
      var itemChildren = itemCan.children;
      itemChildren.map(item => {
        if (useridNow != item.id) {
          if (item.children.length > 0) {
            this.itemFun(item, useridNow);
          }
        } else {
          this.taskSponsor = item.title;
          return false;
        }
      });
    },
    // 日期格式化
    dateFormatter(row) {
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

    goBack() {
      this.$router.replace(this.backUrl);
    }
  }
};
</script>