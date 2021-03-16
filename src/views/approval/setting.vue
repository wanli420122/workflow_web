<template>
  <div>
    <div class="setTop fd-nav" style="position: absolute;">
      <div class="fd-nav-left">
        <div class="fd-nav-back" @click="toReturn">
           <i class="el-icon-arrow-left" style="font-size:20px;"></i>
        </div>
      </div>
      <div class="fd-nav-center">
        <div class="fd-nav-container">
          <div class="title">
            流程设计 -
            <span style="margin-left:10px">{{processName}}</span>
          </div>
        </div>
      </div>
      <div class="fd-nav-right">
        <!-- <button type="button" class="ant-btn button-preview"><span>预 览</span></button> -->
        <button
          type="button"
          class="ant-btn button-publish"
          @click="saveSet"
          style="margin-right:40px;"
        >
          <span>发布</span>
        </button>
      </div>
    </div>
    <div class="setMain fd-nav-content">
      <section class="dingflow-design">
        <div class="zoom">
          <div :class="'zoom-out'+ (nowVal==50?' disabled':'')" @click="zoomSize(1)"></div>
          <span>{{nowVal}}%</span>
          <div :class="'zoom-in'+ (nowVal==300?' disabled':'')" @click="zoomSize(2)"></div>
        </div>
        <div
          class="box-scale"
          id="box-scale"
          :style="'transform: scale('+nowVal/100+'); transform-origin: 50% 0px 0px;'"
        >
          <nodeWrap
            :nodeConfig.sync="nodeConfig"
            :flowPermission.sync="flowPermission"
            :isTried.sync="isTried"
            :directorMaxLevel="directorMaxLevel"
            :tableId="tableId"
          ></nodeWrap>
          <div class="end-node">
            <div class="end-node-circle"></div>
            <div class="end-node-text">流程结束</div>
          </div>
        </div>
      </section>
    </div>
    <!-- <el-dialog title="提示" :visible.sync="tipVisible">
				<div class="ant-confirm-body">
					<i class="anticon anticon-close-circle" style="color: #f00;"></i>
					<span class="ant-confirm-title">当前无法发布</span>
					<div class="ant-confirm-content">
						<div>
							<p class="error-modal-desc">以下内容不完善，需进行修改</p>
							<div class="error-modal-list">
								<div class="error-modal-item" v-for="(item,index) in tipList" :key="index">
									<div class="error-modal-item-label">流程设计</div>
									<div class="error-modal-item-content">{{item.name}} 未选择{{item.type}}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button @click="tipVisible = false">我知道了</el-button>
					<el-button type="primary" @click="tipVisible = false">前往修改</el-button>
				</span>
    </el-dialog>-->
  </div>
</template>
<script>
import qs from "qs";
import axios from "axios";
export default {
  components: {},
  data() {
    return {
      isTried: false,
      tipList: [],
      // tipVisible: false,
      nowVal: 100,
      processConfig: {},
      nodeConfig: {},
      // workFlowDef: {},
      flowPermission: [],
      directorMaxLevel: 0,
      dialogVisible: true,
      tableId: "",
      // 添加字段存放数据
      conditions: {},
      // 传递的参数
      processName: "",
      proId: "",
      proJsondata: "",
      // 上传jsondata字段
      upJsondata: {}
    };
  },
  created() {
    // this.$axios.get(`${process.env.BASE_URL}data.json`, {
    // 	workFlowDefId: this.$route.params.workFlowDefId
    // }).then(res => {
    // 	this.processConfig = res.data;
    // 	this.nodeConfig = this.processConfig.nodeConfig;
    // 	this.flowPermission = this.processConfig.flowPermission;
    // 	this.directorMaxLevel = this.processConfig.directorMaxLevel;
    // 	// this.workFlowDef = this.processConfig.workFlowDef
    // 	this.tableId = this.processConfig.tableId
    // })
    // ////////////////////////////////////////////////////////////////////////////
    // 引入Base64
    let Base64 = require("js-base64").Base64;
    this.processName = this.$route.query.name;
    this.proId = this.$route.query.id;
    // this.proJsondata = Base64.decode(this.$route.query.jsondata);//解码
    // Base64.encode('潘高')  // 5r2Y6auY 编码
    this.getJsondata();
  },
  methods: {
    // 获取jsondata
    getJsondata() {
      this.$axios
        .get(`${process.env.BASE_URL}data.json`, {
          workFlowDefId: this.$route.params.workFlowDefId
        })
        .then(res => {
          res = JSON.parse(Base64.decode(this.$route.query.jsondata));
          this.processConfig = res.data;
          this.nodeConfig = this.processConfig.nodeConfig; // 流程结构
          this.flowPermission = this.processConfig.flowPermission; // 发起人数据
          this.directorMaxLevel = this.processConfig.directorMaxLevel; // 4 数字不知道是什么
          this.tableId = this.processConfig.tableId; // 1 不知道是什么

          // console.log("111:")
          // console.log(this.processConfig)
          // console.log("222流程json:")
          // console.log(this.nodeConfig)
          // console.log("333发起人:")
          // console.log(this.flowPermission)
          // console.log("444：数字4")
          // console.log(this.directorMaxLevel)
          // console.log("555:数字1")
          // console.log(this.tableId)
        });
    },
    gotoLink() {
      this.$router.push({
        name: "process",
        params: {
          id: "2"
        }
      });
    },
    toReturn() {
      //window.location.href = ""
      this.$router.replace("/compontents/process");
    },
    reErr(data) {
      if (data.childNode) {
        if (data.childNode.type == 1) {
          //审批人
          if (data.childNode.error) {
            this.tipList.push({
              name: data.childNode.nodeName,
              type: "审核人"
            });
          }
          this.reErr(data.childNode);
        } else if (data.childNode.type == 2) {
          if (data.childNode.error) {
            this.tipList.push({
              name: data.childNode.nodeName,
              type: "抄送人"
            });
          }
          this.reErr(data.childNode);
        } else if (data.childNode.type == 3) {
          this.reErr(data.childNode.childNode);
        } else if (data.childNode.type == 4) {
          this.reErr(data.childNode);
          for (var i = 0; i < data.childNode.conditionNodes.length; i++) {
            if (data.childNode.conditionNodes[i].error) {
              this.tipList.push({
                name: data.childNode.conditionNodes[i].nodeName,
                type: "条件"
              });
            }
            this.reErr(data.childNode.conditionNodes[i]);
          }
        }
      } else {
        data.childNode = null;
      }
    },
    skip() {
      this.$alert("流程发布成功", "流程发布", {
        confirmButtonText: "确定",
        callback: action => {
          this.$message({
            type: "info",
            message: `action: ${action}`
          });
        }
      });
    },
    saveSet() {
      let that = this;
      this.isTried = true;
      this.tipList = [];
      this.reErr(this.nodeConfig);
      this.processConfig.flowPermission = this.flowPermission;
      // 给json文件添加精确到毫秒的时间戳字段
      this.processConfig.timestamp = new Date()
      // 将获取的数据放入至condition.js的data中
      this.$axios.get(`${process.env.BASE_URL}conditions.json`).then(res => {
        res.data = this.processConfig;
        // this.upJsondata = Base64.encode(JSON.stringify(res));
        this.upJsondata = Base64.encode(JSON.stringify(res), "utf-8");
        // ////////////////////////////////////////////////////////////////////////////
        this.upForm = {
          jsondata: this.upJsondata,
          deployid: this.proId
        };
        var params = new URLSearchParams();
        params.append("jsondata", this.upJsondata);
        params.append("deployid", this.proId);
        this.$axios({
          method: "post",
          // url: "/api/act/saveDeployment",
          url: "/api/act/saveOrUpdateDeploy",
          headers: {
            // 'Content-type': 'application/json',//解析data数据为空，请检查！"
            "Content-type": "application/x-www-form-urlencoded",
            charset: "UTF-8"
          },
          data: params
        })
          .then(function(res) {
            // alert("流程发布成功");
            this.$message.success("流程发布成功！");
            // 设置跳转
            if (true) {
              // debugger
              that.$router.replace("/compontents/process"); //this指向问题
            }
            return res;
          })
          .catch(function(error) {
            console.log(error);
          });
      });
    },
    zoomSize(type) {
      if (type == 1) {
        if (this.nowVal == 50) {
          return;
        }
        this.nowVal -= 10;
      } else {
        if (this.nowVal == 300) {
          return;
        }
        this.nowVal += 10;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/css/workflow.css";

.error-modal-list {
  width: 455px;
}

.setTop {
  width: calc(100% - 165px);
  height: 50px;
  line-height: 50px;
  position: absolute;
  left: 150px;
  top: 55px;
  z-index: 10;
  background-color: #fff;

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

.setTop .fd-nav-left,
.setTop .fd-nav-center,
.setTop .fd-nav-right,
.setTop .fd-nav-left .fd-nav-back {
  height: 50px;
  line-height: 50px;
}

.setTop .fd-nav-back .anticon {
  line-height: 50px;
}

.setMain .zoom {
  margin-top: 5px !important;
}

.setMain {
  height: calc(100% - 105px);
  top: 105px;
}
</style>
<style>
</style>