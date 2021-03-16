<template>
    <div>
        <div class="node-wrap" v-if="nodeConfig.type!=4">
            <div class="node-wrap-box" :class="(nodeConfig.type==0?'start-node ':'')+(isTried&&nodeConfig.error?'active error':'')">
                <div>
                    <div class="title" :style="'background: rgb('+ ['87, 106, 149','255, 148, 62','50, 150, 250'][nodeConfig.type] +');'">
                        <span class="iconfont" v-show="nodeConfig.type==1"></span>
                        <span class="iconfont" v-show="nodeConfig.type==2"></span>
                        <span v-if="nodeConfig.type==0">{{nodeConfig.nodeName}}</span>
                        <input type="text" class="ant-input editable-title-input" v-if="nodeConfig.type!=0&&isInput"
                        @blur="blurEvent()" @focus="$event.currentTarget.select()" v-focus
                        v-model="nodeConfig.nodeName" :placeholder="placeholderList[nodeConfig.type]">
                        <span class="editable-title" @click="clickEvent()" v-if="nodeConfig.type!=0&&!isInput">{{nodeConfig.nodeName}}</span>
                        <i class="anticon anticon-close close" v-if="nodeConfig.type!=0" @click="delNode()"></i>
                    </div>
                    <div class="content" @click="setPerson">
                        <div class="text" v-if="nodeConfig.type==0">{{arrToStr(flowPermission)?arrToStr(flowPermission):'所有人'}}</div>
                        <div class="text" v-if="nodeConfig.type==1">
                            <span class="placeholder" v-if="!setApproverStr(nodeConfig)">请选择{{placeholderList[nodeConfig.type]}}</span>
                            {{setApproverStr(nodeConfig)}}
                        </div>
                        <div class="text" v-if="nodeConfig.type==2">
                            <span class="placeholder" v-if="!copyerStr(nodeConfig)">请选择{{placeholderList[nodeConfig.type]}}</span>
                            {{copyerStr(nodeConfig)}}
                        </div>
                        <i class="anticon anticon-right arrow" v-show="nodeConfig.type!=0"></i>
                    </div>
                    <div class="error_tip" v-if="isTried&&nodeConfig.error">
                        <i class="anticon anticon-exclamation-circle" style="color: rgb(242, 86, 67);"></i>
                    </div>
                </div>
            </div>
            <addNode :childNodeP.sync="nodeConfig.childNode"></addNode>
        </div>
        <div class="branch-wrap" v-if="nodeConfig.type==4">
            <div class="branch-box-wrap">
                <div class="branch-box">
                    <button class="add-branch" @click="addTerm">添加条件</button>
                    <div class="col-box" v-for="(item,index) in nodeConfig.conditionNodes" :key="index">
                        <div class="condition-node">
                            <div class="condition-node-box">
                                <!-- 未设置条件的红色警示框 -->
                                <!-- <div class="auto-judge" :class="isTried&&item.error?'error active':''"> -->
                                <div class="auto-judge">
                                    <div class="sort-left" v-if="index!=0" @click="arrTransfer(index,-1)">&lt;</div>
                                    <div class="title-wrapper">
                                        <input type="text" class="ant-input editable-title-input" v-if="isInputList[index]"
                                        @blur="blurEvent(index)" @focus="$event.currentTarget.select()" v-focus v-model="item.nodeName">
                                        <span class="editable-title" @click="clickEvent(index)" v-if="!isInputList[index]">{{item.nodeName}}</span>
                                        <span class="priority-title" @click="setPerson(item.priorityLevel)">优先级{{item.priorityLevel}}</span>
                                        <i class="anticon anticon-close close" @click="delTerm(index)"></i>
                                    </div>
                                    <div class="sort-right" v-if="index!=nodeConfig.conditionNodes.length-1"
                                        @click="arrTransfer(index)">&gt;</div>
                                    <!-- 条件描述 -->
                                    <!-- 前端同级显示重复，数据不重复 -->
                                    <div class="content" @click="setExpressions(item.priorityLevel)">{{conditionStr(item,index)}}</div>
                                    <!-- 前端同级显示重复，同级数据也重复-->
                                    <!-- <div class="content" @click="setExpressions(item.priorityLevel)">条件表达式：{{conditionConfig.expressions}}</div> -->
                                    <!-- <div class="content" @click="setPerson(item.priorityLevel)">{{conditionStr(item,index)}}</div> -->
                                    <!-- 未设置条件的红色感叹号 -->
                                    <!-- <div class="error_tip" v-if="isTried&&item.error">
                                        <i class="anticon anticon-exclamation-circle" style="color: rgb(242, 86, 67);"></i>
                                    </div> -->
                                </div>
                                <addNode :childNodeP.sync="item.childNode"></addNode>
                            </div>
                        </div>
                        <nodeWrap v-if="item.childNode && item.childNode" :nodeConfig.sync="item.childNode" :tableId="tableId"
                        :isTried.sync="isTried" :directorMaxLevel="directorMaxLevel"></nodeWrap>
                        <!-- 分支线 -->
                        <div class="top-left-cover-line" v-if="index==0"></div>
                        <div class="bottom-left-cover-line" v-if="index==0"></div>
                        <div class="top-right-cover-line" v-if="index==nodeConfig.conditionNodes.length-1"></div>
                        <div class="bottom-right-cover-line" v-if="index==nodeConfig.conditionNodes.length-1"></div>
                    </div>
                </div>
                <addNode :childNodeP.sync="nodeConfig.childNode"></addNode>
            </div>
        </div>
        <el-drawer title="发起人" :visible.sync="promoterDrawer" direction="rtl" class="set_promoter" size="550px" :before-close="savePromoter"> 
            <div class="demo-drawer__content">
                <div class="promoter_content drawer_content">
                    <p>{{arrToStr(flowPermission1)?arrToStr(flowPermission1):'所有人'}}</p>
                    <el-button class="purpleButton"  @click="addPromoter">添加/修改发起人</el-button>
                </div>
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="savePromoter">确 定</el-button>
                    <el-button @click="promoterDrawer = false">取 消</el-button>
                </div>
                <el-dialog title="选择成员" :visible.sync="promoterVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="promoterSearchName" @input="getDebounceData($event)">
                            <!-- 发起人 - 设备管理系统 数据 开始 -->
                            <ul class="scrollbarSmall">
                                <li v-for="(item,index) in loadPersonTree" :key="index+'b'" class="check_box">
                                    <a class="treeA" :class="toggleClass(checkedDepartmentList,item)&&'active'" @click="toChecked(checkedDepartmentList,item)"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                    <i @click="employeesList(item.id)">下级</i>
                                    
                                    <ul class="treeUI" v-if="item.id == activeNameChecked">
                                        <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                            <a v-if="item.children.length>0" class="treeA" :class="toggleClass(checkedDepartmentList,item)&&'active'" @click="toChecked(checkedDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                            <a v-else class="treeA" :class="toggleClass(checkedDepartmentEmployees,item,'id')&&'active'" @click="toChecked(checkedDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                            
                                            <ul class="treeUI" v-if="item.children.length>0">
                                                <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                                    <a v-if="item.children.length>0" class="treeA" :class="toggleClass(checkedDepartmentList,item)&&'active'" @click="toChecked(checkedDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                                    <a v-else class="treeA" :class="toggleClass(checkedDepartmentEmployees,item,'id')&&'active'" @click="toChecked(checkedDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                                    
                                                    <ul class="treeUI" v-if="item.children.length>0">
                                                        <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                                            <a v-if="item.children.length>0" class="treeA" :class="toggleClass(checkedDepartmentList,item)&&'active'" @click="toChecked(checkedDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                                            <a v-else class="treeA" :class="toggleClass(checkedDepartmentEmployees,item,'id')&&'active'" @click="toChecked(checkedDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                                        </li>
                                                    </ul>

                                                </li>
                                            </ul>

                                        </li>
                                    </ul>

                                </li>
                            </ul>
                            <!--  发起人 - 设备管理系统 数据 结束 -->
                        </div>
                        <div class="has_selected l">
                            <!--  发起人 设备管理系统 数据  -->
                            <p class="clear">已选（{{checkedDepartmentList.length+checkedDepartmentEmployees.length+checkedEmployessList.length}}）
                                <a @click="checkedDepartmentList=[];checkedDepartmentEmployees=[];checkedEmployessList=[];">清空</a>
                            </p>
                            <ul>
                                <!-- 公司、部门 -->
                                <li v-for="(item,index) in checkedDepartmentList" :key="index+'d'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(checkedDepartmentList,item)">
                                </li>
                                <!-- 员工 -->
                                <li v-for="(item,index) in checkedDepartmentEmployees" :key="index+'e1_1'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(checkedDepartmentEmployees,item)">
                                </li>
                                <!-- 原逻辑，暂时用不到 -->
                                <li v-for="(item,index) in checkedEmployessList" :key="index+'e'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(checkedEmployessList,item)">
                                </li>
                            </ul>
                            <!--  发起人 设备管理系统 数据  -->

                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="promoterVisible = false">取 消</el-button>
                        <el-button class="purpleButton" @click="surePromoter">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
        </el-drawer>
        <el-drawer title="审批人设置" :visible.sync="approverDrawer" direction="rtl" class="set_promoter" size="550px" :before-close="saveApprover"> 
            <div class="demo-drawer__content">
                <div class="drawer_content">
                    <!-- 在审批模块中增添环节定义中的属性 Begin-->
                    <div class="addDiv">
                        <p class="selected_list">执行人：
                            <!-- <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">{{approvalToStr(item)}}
                                <img src="@/assets/images/add-close1.png" @click="removeEle(approverConfig.nodeUserList,item,'id')">
                            </span> -->
                            <span v-for="(item,index) in approverConfigItem" :key="index">{{approvalToStr(item)}}
                                <img v-if="item.type==2" src="@/assets/images/add-close1.png" @click="removeEle1(approverConfigItem,item,'targetId','delectApproverRole')">
                                <img v-else src="@/assets/images/add-close1.png" @click="removeEle1(approverConfigItem,item,'targetId')">
                            </span>
                            <a v-if="approverConfig.nodeUserList&&approverConfig.nodeUserList.length!=0" @click="approverConfig.nodeUserList=[];approverConfigItem=[]">清除</a>
                            <button type="submit" @click="addApproverMember">添加审核成员</button>
                        </p>
                        <div class="addList">
                            <!-- <p class="sceneCoding">场景编码:
                                <input type="text" placeholder="请填写场景编码" style="width:380px;" v-model.number="propertyList.sceneCoding">
                            </p> -->
                            <!-- <div class="sqlDiv">
                                <p class="sqlInput">执行sql脚本:
                                    <textarea name="textarea" cols="50" rows="4" v-model="propertyList.sqlString"></textarea>
                                </p>
                            </div>
                            <div style="color:red">sql编写规则：<p>where条件替换字段'{userid}'(发起任务人的用户id),'{fromdataid}(表单任务主键id)'</p></div> -->
                            <p class="ifway" style="margin-bottom:15px">执行方式：
                                <el-radio-group v-model="propertyList.executionMode">
                                    <el-radio :label="0">会签</el-radio>
                                    <el-radio :label="1">竞争</el-radio>
                                </el-radio-group>
                            </p>
                            <p class="ifway">待办人等于发起人时跳过:
                                    <el-checkbox v-model="propertyList.jump" style="margin-left:10px;">跳过</el-checkbox>
                            </p>
                            <!-- <p class="ifway">代办类型：
                                <el-radio-group v-model="propertyList.handlerType">
                                    <el-radio :label="1">知会</el-radio>
                                    <el-radio :label="2">审批</el-radio>
                                </el-radio-group>
                            </p> -->
                        </div>
                    </div>
                    <!-- 在审批模块中增添环节定义中的属性 End -->
                </div>

                <!-- <div class="drawer_content">
                    <div class="approver_content">
                        <el-radio-group v-model="approverConfig.settype" class="clear" @change="changeType">
                            <el-radio :label="1">指定成员</el-radio>
                            <el-radio :label="2">主管</el-radio>
                            <el-radio :label="4">发起人自选</el-radio>
                            <el-radio :label="5">发起人自己</el-radio>
                            <el-radio :label="7">连续多级主管</el-radio>
                        </el-radio-group>
                        <el-button type="primary" @click="addApprover" v-if="approverConfig.settype==1">添加/修改成员</el-button>
                        <p class="selected_list" v-if="approverConfig.settype==1">
                            <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">{{item.name}}
                                <img src="@/assets/images/add-close1.png" @click="removeEle(approverConfig.nodeUserList,item,'targetId')">
                            </span>
                            <a v-if="approverConfig.nodeUserList.length!=0" @click="approverConfig.nodeUserList=[]">清除</a>
                        </p>
                    </div>
                    <div class="approver_manager" v-if="approverConfig.settype==2">
                        <p>
                            <span>发起人的：</span>
                            <select v-model="approverConfig.directorLevel">
                                <option v-for="item in directorMaxLevel" :value="item" :key="item">{{item==1?'直接':'第'+item+'级'}}主管</option>
                            </select>
                        </p>
                        <p class="tip">找不到主管时，由上级主管代审批</p>
                    </div>
                    <div class="approver_self" v-if="approverConfig.settype==5">
                        <p>该审批节点设置“发起人自己”后，审批人默认为发起人</p>
                    </div>
                    <div class="approver_self_select" v-show="approverConfig.settype==4">
                        <el-radio-group v-model="approverConfig.selectMode" style="width: 100%;">
                            <el-radio :label="1">选一个人</el-radio>
                            <el-radio :label="2">选多个人</el-radio>
                        </el-radio-group>
                        <h3>选择范围</h3>
                        <el-radio-group v-model="approverConfig.selectRange" style="width: 100%;" @change="changeRange">
                            <el-radio :label="1">全公司</el-radio>
                            <el-radio :label="2">指定成员</el-radio>
                            <el-radio :label="3">指定角色</el-radio>
                        </el-radio-group>
                        <el-button type="primary" @click="addApprover" v-if="approverConfig.selectRange==2">添加/修改成员</el-button>
                        <el-button type="primary" @click="addRoleApprover" v-if="approverConfig.selectRange==3">添加/修改角色</el-button>
                        <p class="selected_list" v-if="approverConfig.selectRange==2||approverConfig.selectRange==3">
                            <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">{{item.name}}
                                <img src="@/assets/images/add-close1.png" @click="removeEle(approverConfig.nodeUserList,item,'targetId')">
                            </span>
                            <a v-if="approverConfig.nodeUserList.length!=0&&approverConfig.selectRange!=1" @click="approverConfig.nodeUserList=[]">清除</a>
                        </p>
                    </div>
                    <div class="approver_manager" v-if="approverConfig.settype==7">
                        <p>审批终点</p>
                        <p style="padding-bottom:20px">
                            <span>发起人的：</span>
                            <select v-model="approverConfig.examineEndDirectorLevel">
                                <option v-for="item in directorMaxLevel" :value="item" :key="item">{{item==1?'最高':'第'+item}}层级主管</option>
                            </select>
                        </p>
                    </div>
                    <div class="approver_some" v-if="(approverConfig.settype==1&&approverConfig.nodeUserList.length>1)||approverConfig.settype==2||(approverConfig.settype==4&&approverConfig.selectMode==2)">
                        <p>多人审批时采用的审批方式</p>
                        <el-radio-group v-model="approverConfig.examineMode" class="clear">
                            <el-radio :label="1">依次审批</el-radio>
                            <br/>
                            <el-radio :label="2" v-if="approverConfig.settype!=2">会签(须所有审批人同意)</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="approver_some" v-if="approverConfig.settype==2||approverConfig.settype==7">
                        <p>审批人为空时</p>
                        <el-radio-group v-model="approverConfig.noHanderAction" class="clear">
                            <el-radio :label="1">自动审批通过/不允许发起</el-radio>
                            <br/>
                            <el-radio :label="2">转交给审核管理员</el-radio>
                        </el-radio-group>
                    </div>
                </div> -->

                <!-- 在审批模块中增添环节定义中的属性:人员选择 Begin -->
                <el-dialog title="选择审批成员" :visible.sync="approverVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="approverSearchName" @input="getDebounceData($event,activeName)">
                            <el-tabs v-model="activeName" @tab-click="handleClick">
                                <el-tab-pane label="组织架构" name="1"></el-tab-pane>
                                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                            </el-tabs>

                            <!-- 审批 设备管理系统 数据 开始 -->
                            <ul class="scrollbarSmall" style="height: 390px;" v-if="activeName==1">
                                <li v-for="(item,index) in loadPersonTree" :key="index+'b'" class="check_box">
                                    <a class="treeA" :class="toggleClass(approverDepartmentList,item)&&'active'" @click="toChecked(approverDepartmentList,item)"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                    <i @click="getDepartmentList(item.id)">下级</i>

                                    <ul class="treeUI" v-if="item.id == activeNameApprover">
                                        <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                            <a v-if="item.children.length>0" class="treeA" :class="toggleClass(approverDepartmentList,item)&&'active'" @click="toChecked(approverDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                            <a v-else class="treeA" :class="toggleClass(approverDepartmentEmployees,item,'id')&&'active'" @click="toChecked(approverDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                            
                                            <!-- <ul class="treeUI" v-if="item.children.length>0">
                                                {{childrenItem(item.children)}}
                                            </ul> -->

                                            <ul class="treeUI" v-if="item.children.length>0">
                                                <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                                    <a v-if="item.children.length>0" class="treeA" :class="toggleClass(approverDepartmentList,item)&&'active'" @click="toChecked(approverDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                                    <a v-else class="treeA" :class="toggleClass(approverDepartmentEmployees,item,'id')&&'active'" @click="toChecked(approverDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                                    
                                                    <ul class="treeUI" v-if="item.children.length>0">
                                                        <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                                            <a v-if="item.children.length>0" class="treeA" :class="toggleClass(approverDepartmentList,item)&&'active'" @click="toChecked(approverDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                                            <a v-else class="treeA" :class="toggleClass(approverDepartmentEmployees,item,'id')&&'active'" @click="toChecked(approverDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                                        </li>
                                                    </ul>

                                                </li>
                                            </ul>

                                        </li>
                                    </ul>

                                </li>
                            </ul>
                            <ul class="scrollbarSmall" style="height: 390px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(approverRoleList,item,'id','approverRoleItem')&&'active'" @click="toChecked(approverRoleList,item,'id','approverRoleItem')" :title="item.title">
                                        <img src="@/assets/images/icon_role.png">{{item.title}}</a>
                                        <!-- <p v-for="(item,index) in item.children" :key="index">{{item.title}}</p> -->
                                </li>
                            </ul>
                            <!--  审批 设备管理系统 数据 结束 -->

                        </div>
                        <div class="has_selected l">

                            <!-- 审批人-设备管理系统 数据  -->
                            <p class="clear">已选（{{approverDepartmentList.length+approverRoleList.length+approverDepartmentEmployees.length}}）
                                <a @click="approverDepartmentList=[];approverRoleList=[];approverDepartmentEmployees=[];approverRoleItem=[]">清空</a>
                            </p>
                            <ul>
                                <!-- 角色列表 -->
                                <li v-for="(item,index) in approverRoleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverRoleList,item,'id','approverRole')">
                                </li>
                                <!-- 公司、部门 存在下级 -->
                                <li v-for="(item,index) in approverDepartmentList" :key="index+'d'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverDepartmentList,item)">
                                </li>
                                <!-- 员工 -->
                                <li v-for="(item,index) in approverDepartmentEmployees" :key="index+'e1_1'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverDepartmentEmployees,item)">
                                </li>
                                <!-- ??? -->
                                <!-- <li v-for="(item,index) in approverEmployessList" :key="index+'e2'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverEmployessList,item)">
                                </li> -->
                            </ul>
                            <!-- 审批人-设备管理系统 数据  -->
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="approverVisible = false">取 消</el-button>
                        <el-button class="purpleButton" @click="sureApproverMember">确 定</el-button>
                    </span>
                </el-dialog>
                <!-- 在审批模块中增添环节定义中的属性:人员选择 End -->
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="saveApprover">确 定</el-button>
                    <el-button @click="approverDrawer = false">取 消</el-button>
                </div>
            </div>
        </el-drawer>
        <el-drawer title="抄送人设置" :visible.sync="copyerDrawer" direction="rtl" class="set_copyer" size="550px" :before-close="saveCopyer"> 
            <div class="demo-drawer__content">
                <div class="copyer_content drawer_content">
                    <el-button class="purpleButton" @click="addCopyer">添加成员</el-button>
                    <p class="selected_list">
                        <!-- <span v-for="(item,index) in copyerConfig.nodeUserList" :key="index">{{approvalToStr(item)}}
                            <img src="@/assets/images/add-close1.png" @click="removeEle(copyerConfig.nodeUserList,item,'id')">
                        </span> -->
                        <span v-for="(item,index) in copyerConfigItem" :key="index">{{approvalToStr(item)}}
                            <img v-if="item.type==2" src="@/assets/images/add-close1.png" @click="removeEle2(copyerConfigItem,item,'targetId','delectCopyerItem')">
                            <img v-else src="@/assets/images/add-close1.png" @click="removeEle2(copyerConfigItem,item,'targetId')">
                        </span>
                        <a v-if="copyerConfig.nodeUserList&&copyerConfig.nodeUserList.length!=0" @click="copyerConfig.nodeUserList=[];copyerConfigItem=[]">清除</a>
                    </p>
                    <el-checkbox-group v-model="ccSelfSelectFlag" class="clear">
                        <el-checkbox :label="1">允许发起人自选抄送人</el-checkbox>
                    </el-checkbox-group>
                    <!-- 抄送模块增加字段 Begin -->
                    <div class="copyerList">
                        <!-- <p class="sceneCoding">场景编码:
                            <input type="text" placeholder="请填写场景编码" style="width:380px;" v-model.number="propertyList.sceneCoding">
                        </p> -->
                        <!-- <div class="sqlDiv">
                            <p class="sqlInput">执行sql脚本:
                                <textarea name="textarea" cols="50" rows="4" v-model="propertyList.sqlString"></textarea>
                            </p>
                        </div>
                        <div style="color:red">sql编写规则：<p>where条件替换字段'{userid}'(发起任务人的用户id),'{fromdataid}(表单任务主键id)'</p></div> -->
                        <!-- <div class="ifway" style="margin-bottom:15px">执行方式：
                            <el-radio-group v-model="propertyList.executionMode">
                                <el-radio :label="1">会签</el-radio>
                                <el-radio :label="2">竞争</el-radio>
                            </el-radio-group>
                        </div> -->
                        <div class="ifway">待办人等于发起人时跳过:
                                <el-checkbox v-model="propertyList.jump" style="margin-left:10px;">跳过</el-checkbox>
                        </div>
                        <!-- <div class="ifway">代办类型：
                            <el-radio-group v-model="propertyList.handlerType">
                                <el-radio :label="1">知会</el-radio>
                                <el-radio :label="2">审批</el-radio>
                            </el-radio-group>
                        </div> -->
                    </div>
                    <!-- 抄送模块增加字段 End -->
                </div>
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="saveCopyer">确 定</el-button>
                    <el-button @click="copyerDrawer = false">取 消</el-button>
                </div>
                <el-dialog title="选择成员" :visible.sync="copyerVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="copyerSearchName" @input="getDebounceData($event,activeName)">
                            <el-tabs v-model="activeName" @tab-click="handleClick">
                                <el-tab-pane label="组织架构" name="1"></el-tab-pane>
                                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                            </el-tabs>
                            <!-- <p class="ellipsis tree_nav" v-if="activeName==1&&!copyerSearchName">
                                <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                                <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                                :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
                            </p> -->

                            <!-- 抄送人 - 原 -->
                            <!-- <ul style="height: 360px;" v-if="activeName==1">
                                <li v-for="(item,index) in departments.childDepartments" :key="index+'b'" class="check_box">
                                    <a :class="toggleClass(copyerDepartmentList,item)&&'active'" @click="toChecked(copyerDepartmentList,item)">
                                        <img src="@/assets/images/icon_file.png">{{item.departmentName}}</a>
                                    <i @click="getDepartmentList(item.id)">下级</i> -->
                                    <!-- 抄送人 - 部门下级循环 disabled="disabled"-->
                                    <!-- <ul style="height: auto;margin-left:20px;" v-if="item.id == activeNameCopyer">
                                        <li v-for="(item,index) in item.departmentEmployees" :key="index+'b_'" class="check_box">
                                            <a :class="toggleClass(copyerDepartmentEmployees,item,'eid')&&'active'" @click="toChecked(copyerDepartmentEmployees,item,'eid')" :title="item.description">
                                                <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                        </li>
                                    </ul>
                                </li>
                                <li v-for="(item,index) in departments.employees" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(copyerEmployessList,item)&&'active'" @click="toChecked(copyerEmployessList,item)" :title="item.departmentNames">
                                        <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                </li>
                            </ul>
                            <ul style="height: 360px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(copyerRoleList,item,'roleId')&&'active'" @click="toChecked(copyerRoleList,item,'roleId')" :title="item.description">
                                        <img src="@/assets/images/icon_role.png">{{item.roleName}}</a>
                                </li>
                            </ul> -->
                            <!-- 抄送人 - 原 -->

                            <!-- 抄送人 - 设备管理系统 数据 开始 -->
                            <ul class="scrollbarSmall" style="height: 390px;" v-if="activeName==1">
                                <li v-for="(item,index) in loadPersonTree" :key="index+'b'" class="check_box">
                                    <a class="treeA" :class="toggleClass(copyerDepartmentList,item)&&'active'" @click="toChecked(copyerDepartmentList,item)"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                    <i @click="employeesList(item.id)">下级</i>
                                    
                                    <ul class="treeUI" v-if="item.id == activeNameChecked">
                                        <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                            <a v-if="item.children.length>0" class="treeA" :class="toggleClass(copyerDepartmentList,item)&&'active'" @click="toChecked(copyerDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                            <a v-else class="treeA" :class="toggleClass(copyerDepartmentEmployees,item,'id')&&'active'" @click="toChecked(copyerDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                            
                                            <ul class="treeUI" v-if="item.children.length>0">
                                                <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                                    <a v-if="item.children.length>0" class="treeA" :class="toggleClass(copyerDepartmentList,item)&&'active'" @click="toChecked(copyerDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                                    <a v-else class="treeA" :class="toggleClass(copyerDepartmentEmployees,item,'id')&&'active'" @click="toChecked(copyerDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                                    
                                                    <ul class="treeUI" v-if="item.children.length>0">
                                                        <li v-for="(item,index) in item.children" :key="index" class="check_box">
                                                            <a v-if="item.children.length>0" class="treeA" :class="toggleClass(copyerDepartmentList,item)&&'active'" @click="toChecked(copyerDepartmentList,item)" :title="item.title"><img src="@/assets/images/icon_file.png">{{item.title}}</a>
                                                            <a v-else class="treeA" :class="toggleClass(copyerDepartmentEmployees,item,'id')&&'active'" @click="toChecked(copyerDepartmentEmployees,item,'id')" :title="item.title"><img src="@/assets/images/icon_people.png">{{item.title}}</a>
                                                        </li>
                                                    </ul>
                                                    
                                                </li>
                                            </ul>

                                        </li>
                                    </ul>

                                </li>
                            </ul>
                            <ul class="scrollbarSmall" style="height: 390px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(copyerRoleList,item,'id','copyerRoleItem')&&'active'" @click="toChecked(copyerRoleList,item,'id','copyerRoleItem')" :title="item.title">
                                        <img src="@/assets/images/icon_role.png">{{item.title}}</a>
                                        <!-- <p v-for="(item,index) in item.children" :key="index">{{item.title}}</p> -->
                                </li>
                            </ul>
                            <!-- <ul style="height: 360px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(copyerRoleList,item,'id','approverRoleItem')&&'active'" @click="toChecked(copyerRoleList,item,'id','approverRoleItem')" :title="item.title">
                                        <img src="@/assets/images/icon_role.png">{{item.title}}</a>
                                        <p v-for="(item,index) in item.children" :key="index">{{item.title}}</p>
                                </li>
                            </ul> -->
                            <!--  抄送人 - 设备管理系统 数据 结束 -->


                        </div>
                        <div class="has_selected l">
                            <!-- <p class="clear">已选（{{copyerEmployessList.length+copyerRoleList.length}}）
                                <a @click="copyerEmployessList=[];copyerRoleList=[];copyerDepartmentEmployees=[];">清空</a>
                            </p> -->
                            <!-- <ul>
                                <li v-for="(item,index) in copyerRoleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.roleName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerRoleList,item,'roleId')">
                                </li>
                                <li v-for="(item,index) in copyerDepartmentList" :key="index+'e1'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.departmentName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerDepartmentList,item)">
                                </li>
                                <li v-for="(item,index) in copyerDepartmentEmployees" :key="index+'e1_1'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerDepartmentEmployees,item)">
                                </li>
                                <li v-for="(item,index) in copyerEmployessList" :key="index+'e2'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerEmployessList,item)">
                                </li>
                            </ul> -->

                            <!-- 抄送人-设备管理系统 数据  -->
                            <p class="clear">已选（{{copyerRoleList.length+copyerDepartmentList.length+copyerDepartmentEmployees.length}}）
                                <a @click="copyerRoleList=[];copyerDepartmentList=[];copyerDepartmentEmployees=[];copyerRoleItem=[]">清空</a>
                            </p>
                            <ul>
                                <!-- 角色列表 -->
                                <li v-for="(item,index) in copyerRoleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerRoleList,item,'id','copyerRoleItem')">
                                </li>
                                <!-- 公司、部门 存在下级 -->
                                <li v-for="(item,index) in copyerDepartmentList" :key="index+'e1'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerDepartmentList,item)">
                                </li>
                                <!-- 员工 -->
                                <li v-for="(item,index) in copyerDepartmentEmployees" :key="index+'e1_1'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.title}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerDepartmentEmployees,item)">
                                </li>
                                <!-- ??? -->
                                <!-- <li v-for="(item,index) in copyerEmployessList" :key="index+'e2'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerEmployessList,item)">
                                </li> -->
                            </ul>
                            <!-- 抄送人-设备管理系统 数据  -->

                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="copyerVisible = false">取 消</el-button>
                        <el-button class="purpleButton" @click="sureCopyer">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
        </el-drawer>
        <el-drawer title="条件设置" :visible.sync="conditionDrawer" direction="rtl" class="condition_copyer" size="550px" :before-close="saveCondition"> 
            <select v-model="conditionConfig.priorityLevel">
                <option v-for="item in conditionsConfig.conditionNodes.length" :value="item" :key="item">优先级{{item}}</option>
            </select>
            <div class="demo-drawer__content">
                <div class="condition_content drawer_content">
                    <!-- 在条件模块中增添旧版属性 Begin -->
                    <p class="formChose" style="margin-bottom:70px">表单选择</p>
                    <div class="tableChose">
                         <!-- <select name="tableName" lay-verify="" lay-search style="width:210px;height:40px;font-size:14px;top:0;right: 45px;">
                            <option value="">请选择一个表格</option> -->
                            <!-- <option value="item" v-for="(item,index) in tableName" :key="index">{{item}}</option> -->
                            <!-- <option value="item" v-for="(item,index) in conditionSelect" :key="index">{{item.menu_name}}</option>
                        </select> -->
                        <el-select @change="conditionSelectChange" v-model="conditionSelectValue" placeholder="请选择一个表格" name="tableName" lay-verify="" lay-search style="width:210px;height:40px;font-size:14px;top:0;right: 45px;">
                            <el-option
                                v-for="(item,index) in conditionSelect"
                                :key="index"
                                :label="item.menu_name"
                                :value="item.menu_uuid">
                            </el-option>
                        </el-select>
                    </div>
                     <!-- 按钮选择表格 -->
                    <!-- <el-radio-group v-model="conditionConfig.settype" class="clear" @change="changeType">
                        <el-radio :label="index" v-for="(item,index) in tableName" :key="index" @click="getIndex(index)">{{item}}</el-radio>
                    </el-radio-group> -->

                    <p class="formChose">表单属性列表</p>
                    <!-- 未和tableName 动态绑定 -->
                    <div class="approver_some" style="margin-top: -25px;padding-left: 0;padding-right: 0">
                        <!-- <el-table :data="formdata"  :header-cell-style="headClass" height="285" border borderstyle="width: 100%" style="font-size:12px" :row-style="{height:'0'}" :cell-style="{padding:'5px'}">
                            <el-table-column prop="name" align="center" label="属性名" width="140"></el-table-column>
                            <el-table-column prop="desc" align="center" label="属性描述"></el-table-column>
                        </el-table> -->
                        <el-table :data="conditionTable"  :header-cell-style="headClass" height="285" border borderstyle="width: 100%" style="font-size:12px" :row-style="{height:'0'}" :cell-style="{padding:'5px'}">
                            <el-table-column prop="name" align="center" label="属性名"></el-table-column>
                            <el-table-column prop="value" align="center" label="属性描述"></el-table-column>
                        </el-table>
                    </div>
                    <div class="sqlDiv" style="margin:20px 0px 50px 0px;height:75px">
                        <p class="formChose">条件表达式</p>
                        <el-input type="textarea" :rows="2" placeholder="请输入条件表达式" v-model="conditionConfig.expressions"></el-input>
                    </div>
                    <!-- 在条件模块中增添旧版属性 End -->

                    <!-- <ul>
                        <li v-for="(item,index) in conditionConfig.conditionList" :key="index"> -->
                            <!-- 在条件模块中增添新属性 Begin-->
                            <!-- <p class="sceneCoding">场景编码:
                                <input type="text" placeholder="请填写场景编码" style="width:380px;" v-model="item.sceneCoding">
                            </p> -->
                            <!-- 在条件模块中增添新属性 End -->
                            <!-- <span class="ellipsis">{{item.type==1?'发起人(修改选择人员json)':item.showName}}：</span>
                            <div v-if="item.type==1">
                                <p :class="conditionConfig.nodeUserList.length > 0?'selected_list':''" @click.self="addConditionRole" style="cursor:text">
                                    <span v-for="(item1,index1) in conditionConfig.nodeUserList" :key="index1">
                                        {{item1.name}}<img src="@/assets/images/add-close1.png" @click="removeEle(conditionConfig.nodeUserList,item1,'targetId')">
                                    </span>
                                    <input type="text" placeholder="请选择具体人员/角色/部门" v-if="conditionConfig.nodeUserList.length == 0" @click="addConditionRole">
                                </p>
                            </div>
                            <div v-else-if="item.columnType == 'String' && item.showType == 3">
                                <p class="check_box">
                                    <a :class="toggleStrClass(item,item1.key)&&'active'" @click="toStrChecked(item,item1.key)"
                                    v-for="(item1,index1) in JSON.parse(item.fixedDownBoxValue)" :key="index1">{{item1.value}}</a>
                                </p>
                            </div>
                            <div v-else>
                                <p>
                                    <select v-model="item.optType" :style="'width:'+(item.optType==6?370:100)+'px'" @change="changeOptType(item)">
                                        <option value="1">小于</option>
                                        <option value="2">大于</option>
                                        <option value="3">小于等于</option>
                                        <option value="4">等于</option>
                                        <option value="5">大于等于</option>
                                        <option value="6">介于两个数之间</option>
                                    </select>
                                    <input v-if="item.optType!=6" type="text" :placeholder="'请输入'+item.showName" v-enter-number="2" v-model="item.zdy1">
                                </p>
                                <p v-if="item.optType==6">
                                    <input type="text" style="width:75px;" class="mr_10" v-enter-number="2" v-model="item.zdy1">
                                    <select style="width:60px;" v-model="item.opt1">
                                        <option value="<">&lt;</option>
                                        <option value="≤">≤</option>
                                    </select>
                                    <span class="ellipsis" style="display:inline-block;width:60px;vertical-align: text-bottom;">{{item.showName}}</span>
                                    <select style="width:60px;" class="ml_10" v-model="item.opt2">
                                        <option value="<">&lt;</option>
                                        <option value="≤">≤</option>
                                    </select>
                                    <input type="text" style="width:75px;" v-enter-number="2" v-model="item.zdy2">
                                </p>
                            </div> -->
                            <!-- 条件：选择人员input删除(清空conditionList，无最外围v-for数据) -->
                            <!-- <a v-if="item.type==1" @click="conditionConfig.nodeUserList= [];removeEle(conditionConfig.conditionList,item,'columnId')">删除</a>
                            <a v-if="item.type==2" @click="removeEle(conditionConfig.conditionList,item,'columnId')">删除</a> -->
                        <!-- </li> -->
                        <!-- 在条件模块中增添新属性 Begin-->
                        <!-- <li v-for="(item,index) in conditionConfig.conditionList" :key="'info' + index"> -->
                        <!-- :key="'info' + index" 为了解决有两个一样的v-for -->
                            <!-- <div class="sqlDiv">
                                <p class="sqlInput">执行人sql脚本:
                                    <textarea name="textarea" cols="55" rows="4" v-model="item.sqlString"></textarea>
                                </p>
                            </div>
                            <p style="color:red">sql编写规则：where条件替换字段'{userid}'(发起任务人的用户id),'{fromdataid}(表单任务主键id)'</p>
                            <p class="ifway">执行方式：
                                <el-radio-group v-model="item.executionMode">
                                    <el-radio :label="1">会签</el-radio>
                                    <el-radio :label="2">竞争</el-radio>
                                </el-radio-group>
                            </p>
                            <p class="ifway">待办人等于发起人时跳过:
                                    <el-checkbox v-model="item.jump" style="margin-left:10px;">跳过</el-checkbox>
                            </p>
                            <p class="ifway">代办类型：
                                <el-radio-group v-model="item.handlerType">
                                    <el-radio :label="1">知会</el-radio>
                                    <el-radio :label="2">审批</el-radio>
                                </el-radio-group>
                            </p>
                        </li> -->
                        <!-- 在条件模块中增添新属性 End -->
                    <!-- </ul> -->
                    <!-- <el-button type="primary" @click="addCondition">添加条件</el-button> -->
                    <!-- <el-dialog title="选择条件" :visible.sync="conditionVisible" width="480px" append-to-body class="condition_list">
                        <p>请选择用来区分审批流程的条件字段</p>
                        <p class="check_box">
                            <a :class="toggleClass(conditionList,{columnId:0},'columnId')&&'active'" @click="toChecked(conditionList,{columnId:0},'columnId')">发起人</a>
                            <a v-for="(item,index) in conditions" :key="index" :class="toggleClass(conditionList,item,'columnId')&&'active'" 
                            @click="toChecked(conditionList,item,'columnId')">{{item.showName}}</a>
                        </p>
                        <span slot="footer" class="dialog-footer">
                            <el-button @click="conditionVisible = false">取 消</el-button>
                            <el-button type="primary" @click="sureCondition">确 定</el-button>
                        </span>
                    </el-dialog> -->
                </div>
                <!-- <el-dialog title="选择成员" :visible.sync="conditionRoleVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="conditionRoleSearchName" @input="getDebounceData($event,activeName)">
                            <el-tabs v-model="activeName" @tab-click="handleClick">
                                <el-tab-pane label="组织架构" name="1"></el-tab-pane>
                                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                            </el-tabs>
                            <p class="ellipsis tree_nav" v-if="activeName==1&&!conditionRoleSearchName">
                                <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                                <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                                :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
                            </p>
                            <ul style="height: 360px;" v-if="activeName==1">
                                <li v-for="(item,index) in departments.childDepartments" :key="index+'b'" class="check_box">
                                    <a :class="toggleClass(conditionDepartmentList,item)&&'active'" @click="toChecked(conditionDepartmentList,item)">
                                        <img src="@/assets/images/icon_file.png">{{item.departmentName}}</a>
                                    <i @click="getDepartmentList(item.id)">下级</i>
                                </li>
                                <li v-for="(item,index) in departments.employees" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(conditionEmployessList,item)&&'active'" @click="toChecked(conditionEmployessList,item)" :title="item.departmentNames">
                                        <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                </li>
                            </ul>
                            <ul style="height: 360px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(conditionRoleList,item,'roleId')&&'active'" @click="toChecked(conditionRoleList,item,'roleId')" :title="item.description">
                                        <img src="@/assets/images/icon_role.png">{{item.roleName}}</a>
                                </li>
                            </ul>
                        </div>
                        <div class="has_selected l">
                            <p class="clear">已选（{{conditionDepartmentList.length+conditionEmployessList.length+conditionRoleList.length}}）
                                <a @click="conditionDepartmentList=[];conditionEmployessList=[];conditionRoleList=[]">清空</a>
                            </p>
                            <ul>
                                <li v-for="(item,index) in conditionRoleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.roleName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(conditionRoleList,item,'roleId')">
                                </li>
                                <li v-for="(item,index) in conditionDepartmentList" :key="index+'e1'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.departmentName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(conditionDepartmentList,item)">
                                </li>
                                <li v-for="(item,index) in conditionEmployessList" :key="index+'e2'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(conditionEmployessList,item)">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="conditionRoleVisible = false">取 消</el-button>
                        <el-button type="primary" @click="sureConditionRole">确 定</el-button>
                    </span>
                </el-dialog> -->
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="saveCondition">确 定</el-button>
                    <el-button @click="conditionDrawer = false">取 消</el-button>
                </div>
            </div>
        </el-drawer>
        <nodeWrap v-if="nodeConfig.childNode && nodeConfig.childNode" :nodeConfig.sync="nodeConfig.childNode" :tableId="tableId"
        :isTried.sync="isTried" :directorMaxLevel="directorMaxLevel"></nodeWrap>
    </div>
</template>
<script>
export default {
    props: ["nodeConfig", "flowPermission", "directorMaxLevel", "isTried", "tableId"],
    data() {
        return {
            placeholderList: ["发起人", "审核人", "抄送人"],
            isInputList: [],
            isInput: false,
            promoterVisible: false,
            promoterDrawer: false,
            departments: {},
            checkedDepartmentList: [], // 发起人：部门下级
            checkedEmployessList: [],
            checkedDepartmentEmployees: [], // 发起人：职工
            activeNameChecked: "",
            promoterSearchName: "",
            flowPermission1: this.flowPermission,
            approverDrawer: false,
            approverVisible: false,
            approverRoleVisible: false,
            approverConfig: {},
            approverEmplyessList: [],
            approverSearchName: "",
            //添加审批模块新字段 Begin
            // 增添抄送approverList propertyList
            propertyList: {
                executionMode:0,
                sqlString:'',
                jump:false,
                // sceneCoding:'',
                // handlerType:1
            },
            approverDepartmentList:[],
            approverEmployessList: [],
            approverRoleList: [],
            approverDepartmentEmployees: [], // 审核人:部门下级
            activeNameApprover: "", // 审核人：审批成员下级
            //添加审批模块新字段 End
            roles: [],
            roleList: [],
            approverRoleSearchName: "",
            copyerDrawer: false,
            copyerVisible: false,
            copyerConfig: {},

            // 增添抄送 copyerList propertyList
            // propertyList: {
            //     sqlString:'',
            //     jump:false,
            //     executionMode:0,
            //     // sceneCoding:'',
            //     // handlerType:1
            // },

            copyerSearchName: "",
            activeName: "1",
            // 添加抄送部门列表
            copyerDepartmentList: [], // 抄送部门
            copyerEmployessList: [],
            copyerConfigItem: [], //抄送最外层
            copyerRoleList: [], //抄送角色
            copyerRoleItem: [], //抄送角色对应人员
            copyerDepartmentEmployees: [], // 抄送人 - 部门下级
            activeNameCopyer: "", // 抄送人 - 部门下级
            ccSelfSelectFlag: [],
            conditionDrawer: false,
            conditionVisible: false,
            conditionConfig: {}, //条件设置
            conditionsConfig: {
                conditionNodes: [],
            },
            bPriorityLevel: "",
            conditions: [],
            conditionList: [],
            conditionRoleVisible: false,
            conditionRoleSearchName: "",
            conditionDepartmentList: [],
            conditionEmployessList: [],
            conditionRoleList: [],
            // 在条件列表中添加新属性
            // 执行方式
            executionMode:0,
            // 场景编码
            // sceneCoding:'',
            // 执行sql脚本
            sqlString:'',
            // 待办人等于发起人时跳过:
            jump:false,
            // 代办类型
            // handlerType:1,
            // 条件模块下的sql
            expressions:'',
            // 条件form表格测试数据
             formdata:[
                {
                "name": "test1",
                "desc": "测试1",
                "value": "10"
                },
                {
                "name": "test2",
                "desc": "测试2",
                "value": "50"
                },
                {
                "name": "test3",
                "desc": "测试3",
                "value": "100"
                }
            ],
            // 条件from表单名字数据
            tableName:['技术问题申报','我的发起','FromOne','FromTwo','FromThree','FromFour'],

            conditionTable: [], // 条件表格
            conditionSelect: [], // 条件下拉
            conditionSelectValue: "", //选中项id

            loadPersonTree:[], // 组织架构
            loadUserRoleTree:[], // 角色列表

            approverRoleItem: [], // 角色下的人员

            approverConfigItem:[], // 最外层
        }
    },
    mounted() {
        if (this.nodeConfig.type == 1) {
            this.nodeConfig.error = !this.setApproverStr(this.nodeConfig)
        } else if (this.nodeConfig.type == 2) {
            this.nodeConfig.error = !this.copyerStr(this.nodeConfig)
        } else if (this.nodeConfig.type == 4) {
            for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
                // 修改请先设置条件
                this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "mounted Test" && i != this.nodeConfig.conditionNodes.length - 1
            }
        }
    },
    methods: {
        childrenItem(list){
            console.log(list)
            var txt = "";
            if(list.length>0){
                list.map(item=>{
                    // if(item.children.length>0){
                    //     return(
                    //         <li class="check_box">{item.name}</li>
                    //     )
                    // }
                    
                    if(item.children.length>0){
                        txt+='<li class="check_box"><a class="treeA" title="'+item.title+'"><img src="@/assets/images/icon_file.png">'+item.title+'</a></li>'
                    }
                })
            }
            console.log(txt)
            return txt;
            
            // return(
            //     "   <li v-for=\"(item,index) in list\" :key=\"index\" class=\"check_box\">\n" +
            //     "       <a v-if=\"item.children.length>0\" class=\"treeA\" :class=\"toggleClass(approverDepartmentList,item)&&'active'\" @click=\"toChecked(approverDepartmentList,item)\" :title=\"item.title\"><img src=\"@/assets/images/icon_file.png\">{{item.title}}</a>\n" +
            //     "       <a v-else class=\"treeA\" :class=\"toggleClass(approverDepartmentEmployees,item,'id')&&'active'\" @click=\"toChecked(approverDepartmentEmployees,item,'id')\" :title=\"item.title\"><img src=\"@/assets/images/icon_people.png\">{{item.title}}</a>\n" +
            //     "       <ul class=\"treeUI\" v-if=\"item.children.length>0\">{{childrenItem(item.children)}}</ul>\n" +
            //     "   </li>\n"
                    
            //     )
            // if(list.length>0){
            //     return(

            // );
            // }
            
        },
        // el-table 表头居中
        headClass(){
            return "text-align:center";
        },
        clickEvent(index) {
            if (index || index === 0) {
                this.$set(this.isInputList, index, true)
            } else {
                this.isInput = true;
            }
        },
        blurEvent(index) {
            if (index || index === 0) {
                this.$set(this.isInputList, index, false)
                this.nodeConfig.conditionNodes[index].nodeName = this.nodeConfig.conditionNodes[index].nodeName ? this.nodeConfig.conditionNodes[index].nodeName : "条件"
            } else {
                this.isInput = false;
                this.nodeConfig.nodeName = this.nodeConfig.nodeName ? this.nodeConfig.nodeName : this.placeholderList[this.nodeConfig.type]
            }
        },

        // -------------------------- 抄送人设置 --------------------------
        // 添加抄送成员 - 打开弹框
        addCopyer() {
            // 设备管理系统 ->组织架构
            this.$axios.get("/web/mes/inspectionplan/treeloadPerson.do")
            .then(res => {
                this.loadPersonTree = res.data;
            })
            // 设备管理系统 ->角色列表
            this.$axios.get("/web/mes/User/selectUserRoleTree.do ")
            .then(res => {
                this.roles = res.data;
                this.loadUserRoleTree = res.data;
            })

            this.copyerSearchName = "";
            this.copyerVisible = true;
            this.activeName = "1";
            this.getDepartmentList();
            this.copyerEmployessList = [];
            this.copyerDepartmentEmployees = [];
            // 添加抄送部门列表 
            this.copyerDepartmentList = [];
            this.copyerRoleList = []; //角色
            this.copyerRoleItem= []; //角色人员

            this.copyerConfig.nodeUserList.map(item => {
                if(item.targetId){
                    item.id = item['targetId'];
                    delete item.targetId;
                    item.title = item['name'];
                    delete item.name;

                    // 抄送人 - 设备管理
                    if (item.type == 1) {
                        this.copyerEmployessList.push({
                            employeeName: name,
                            id: targetId,
                        });
                    } else if (item.type == 2) { //角色
                        this.copyerRoleList.push({
                            title: item.title,
                            id: item.id,
                        });
                    }else  if (item.type == 3) {// 抄送 部门
                        this.copyerDepartmentList.push({
                            title: item.title,
                            id: item.id,
                        });
                    }else if (item.type == 4) { // 抄送人员
                        this.copyerDepartmentEmployees.push({
                            title: item.title,
                            id: item.id,
                        });
                    }else if(item.type == 5) { //角色对应人员
                        var itemArr = item;
                        if(this.copyerRoleList.length!=0){
                            var objC = {};
                            this.copyerRoleList.map(item=>{ // 循环角色列表
                                if(item.id != itemArr.parentId){
                                    objC['type'] = 2;
                                    objC['title'] = itemArr.parentname;
                                    objC['id'] = itemArr.parentid;
                                }
                            })
                            this.copyerRoleList.push(objC)
                            
                        }else{
                            this.copyerRoleList.push({
                                type: 2,
                                title: itemArr.parentname,
                                id: itemArr.parentid
                            });
                        }
                        this.copyerRoleItem.push(item);                        
                    }

                }
                // else{
                //     // 抄送人 - 设备管理
                //     if (item.type == 1) {
                //         this.copyerEmployessList.push({
                //             employeeName: name,
                //             id: targetId,
                //         });
                //     } else if (item.type == 2) {
                //         this.copyerRoleList.push({
                //             title: item.title,
                //             id: item.id,
                //         });
                //     }else if (item.type == 3) {// 添加抄送部门列 type
                //         this.copyerDepartmentList.push({
                //             title: item.title,
                //             id: item.id,
                //         });
                //     }else if (item.type == 4) { // 抄送人 - 下级部门
                //         this.copyerDepartmentEmployees.push({
                //             title: item.title,
                //             id: item.id,
                //         });
                //     }
                // } 
            })
            // copyerConfigItem;
            // 需要处理 角色下的人员
            var listData = this.deteleObject(this.copyerRoleList);
            this.copyerRoleList = listData
        },
        // 添加抄送成员 - 确定
        sureCopyer() {
            this.copyerConfig.nodeUserList = [];
            this.copyerConfigItem = [];
            // 抄送人 - 设备管理
            this.copyerRoleList.map(item => { // 角色列表
                // this.copyerConfig.nodeUserList.push({
                //     type: 2,
                //     targetId: item.id,
                //     name: item.title
                // });
                this.copyerConfigItem.push({
                    type: 2,
                    targetId: item.id,
                    name: item.title
                });
            });
            // 抄送 角色对应的人员
            this.copyerRoleItem.map(item => {
                this.copyerConfig.nodeUserList.push(item);
            });
            // 抄送部门
            this.copyerDepartmentList.map(item => {
                this.copyerConfig.nodeUserList.push({
                    type: 3,
                    targetId: item.id,
                    name: item.title
                });
                this.copyerConfigItem.push({
                    type: 3,
                    targetId: item.id,
                    name: item.title
                });
            });
            // 抄送人员
            this.copyerDepartmentEmployees.map(item => {
                this.copyerConfig.nodeUserList.push({
                    type: 4,
                    targetId: item.id,
                    name: item.title
                });
                this.copyerConfigItem.push({
                    type: 4,
                    targetId: item.id,
                    name: item.title
                });
            });
            // 抄送人 - 设备管理

            // 抄送模块添加新字段propertyList[]
            this.copyerConfig.propertyList =this.propertyList; 
            // this.copyerConfig.copyerList =this.copyerList; 

            // console.log(this.copyerConfig.propertyList)
            // console.log(this.copyerConfig.nodeUserList)
            this.copyerVisible = false;
        },
        // 抄送抽屉 - 确定
        saveCopyer() {
            this.copyerConfig.ccSelfSelectFlag = this.ccSelfSelectFlag.length == 0 ? 0 : 1;
            this.copyerConfig.error = !this.copyerStr(this.copyerConfig);
            this.$emit("update:nodeConfig", this.copyerConfig);
            this.copyerDrawer = false;
        },
        // 抄送人员文字设置 - 流程框架图中的展示
        copyerStr(nodeConfig) {
            if (nodeConfig.nodeUserList.length != 0) {
                return this.arrToStr(nodeConfig.nodeUserList)
            } else {
                if (nodeConfig.ccSelfSelectFlag == 1) {
                    return "发起人自选"
                }
            }
        },


        // -------------------------- 审批人设置 --------------------------
        // 抽屉 - 人员显示文字设置（审批人、抄送人）
        approvalToStr(arr){
            if (arr.name) {
                return arr.name
            }else if(arr.title){
                return arr.title
            }
        },
        // 选择范围 - 已注释
        changeRange(val) {
            this.approverConfig.nodeUserList = [];
        },
        // 按钮选择表格 - 已注释
        changeType(val) {
            this.approverConfig.nodeUserList = [];
            this.approverConfig.examineMode = 1;
            this.approverConfig.noHanderAction = 2;
            if (val == 2) {
                this.approverConfig.directorLevel = 1;
            } else if (val == 4) {
                this.approverConfig.selectMode = 1;
                this.approverConfig.selectRange = 1;
            } else if (val == 7) {
                this.approverConfig.examineEndDirectorLevel = 1
            }
        },
        // 审批模块新方法 Begin :
        // 添加审批成员 - 打开弹框
        addApproverMember(){
            // 设备管理系统 ->组织架构
            this.$axios.get("/web/mes/inspectionplan/treeloadPerson.do")
            .then(res => {
                this.loadPersonTree = res.data;
            })
            // 设备管理系统 ->角色列表 
            this.$axios.get("/web/mes/User/selectUserRoleTree.do ")
            .then(res => {
                this.roles = res.data;
                this.loadUserRoleTree = res.data;
                // this.loadUserRoleTree.map(item => {
                //     console.log(item)
                // })
            })

            // debugger
            this.conditionList = [];
            this.approverSearchName = "";
            this.approverVisible = true;
            this.activeName = "1";
            this.getDepartmentList();
            this.approverEmployessList = [];
            this.approverDepartmentList = []; //公司、部门
            this.approverDepartmentEmployees = []; //部门人员
            this.approverRoleList = []; //角色
            this.approverRoleItem= []; //角色人员

            // console.log("打开弹框：")
            // console.log(this.approverConfig.nodeUserList)
            // this.approverConfigItem
            this.approverConfig.nodeUserList.map(item => {
                if(item.targetId){
                    item.id = item['targetId'];
                    delete item.targetId;
                    item.title = item['name'];
                    delete item.name;
                }
                if (item.type == 1) { // 暂时用不到
                    this.approverEmployessList.push({
                        title: item.title,
                        id: item.id
                    });
                }else  if(item.type == 2) { // 审批人 - 角色列表
                    this.approverRoleList.push({
                        title: item.title,
                        id: item.id
                    });
                }else  if(item.type == 5) { // 审批人 - 角色对应人员
                    var itemArr = item; // 角色对应的人员（当前）
                    if(this.approverRoleList.length!=0){
                        var objC = {};
                        this.approverRoleList.map(item=>{ // 循环角色列表
                            if(item.id != itemArr.parentId){
                                objC['type'] = 2;
                                objC['title'] = itemArr.parentname;
                                objC['id'] = itemArr.parentid;
                            }
                        })
                        this.approverRoleList.push(objC)
                        
                    }else{
                        this.approverRoleList.push({
                            type: 2,
                            title: itemArr.parentname,
                            id: itemArr.parentid
                        });
                    }
                    this.approverRoleItem.push(item);                        
                }else if(item.type == 3) { // 审批人 - 公司、部门
                    this.approverDepartmentList.push({
                        title: item.title,
                        id: item.id
                    });
                }else if(item.type == 4){ // 审批人 - 职工
                    this.approverDepartmentEmployees.push({
                        title: item.title,
                        id: item.id
                    })
                }
            })
            // 需要处理 角色下的人员
            var listData = this.deteleObject(this.approverRoleList);
            this.approverRoleList = listData
        },
        // 去掉数组重复项 obj为需要处理的数组
        deteleObject(obj) {
            var uniques = [];
            var stringify = {};
            for (var i = 0; i < obj.length; i++) {
                var keys = Object.keys(obj[i]);
                keys.sort(function(a, b) {
                    return (Number(a) - Number(b));
                });
                var str = '';
                for (var j = 0; j < keys.length; j++) {
                    str += JSON.stringify(keys[j]);
                    str += JSON.stringify(obj[i][keys[j]]);
                }
                if (!stringify.hasOwnProperty(str)) {
                    uniques.push(obj[i]);
                    stringify[str] = true;
                }
            }
            uniques = uniques;
            return uniques;
        },
        // 添加审批人员 - 确定按钮
        sureApproverMember(){
            this.approverConfig.nodeUserList = [];
            this.approverConfigItem = [];

            // 设备管理系统 - 新
            // 暂时用不到
            this.approverEmployessList.map(item => {
                this.approverConfig.nodeUserList.push({
                    type: 1,
                    targetId: item.id,
                    name: item.employeeName,
                })
            });
            // 角色
            this.approverRoleList.map(item => {
                // this.approverConfig.nodeUserList.push({
                //     type: 2,
                //     targetId: item.id,
                //     name: item.title,
                // });
                this.approverConfigItem.push({
                    type: 2,
                    targetId: item.id,
                    name: item.title,
                });
            });
            // 角色 - 对应的人员
            this.approverRoleItem.map(item => {
                this.approverConfig.nodeUserList.push(item);
            });
            // 审批人 - 公司、部门
            this.approverDepartmentList.map(item => {
                this.approverConfig.nodeUserList.push({
                    type: 3,
                    targetId: item.id,
                    name: item.title,
                })
                this.approverConfigItem.push({ // 审批人 - 公司、部门
                    type: 3,
                    targetId: item.id,
                    name: item.title,
                })
            });
            // 审批人 - 部门下的人员
            this.approverDepartmentEmployees.map(item => {
                this.approverConfig.nodeUserList.push({
                    type: 4,
                    targetId: item.id,
                    name: item.title,
                })
                this.approverConfigItem.push({ //审批人 - 部门下级
                    type: 4,
                    targetId: item.id,
                    name: item.title,
                })
            });

            // 审批模块添加新字段propertyList[]
            // this.approverConfig.approverList =this.approverList;
            this.approverConfig.propertyList =this.propertyList;
            // console.log(this.approverConfig.nodeUserList)
            // console.log(this.approverConfigItem)
            this.approverVisible = false;
        },
        // 审批抽屉 - 确定
        saveApprover() {
            this.approverConfig.propertyList =this.propertyList;
            // console.log(this.approverConfig.propertyList)
            // console.log(this.approverConfig.nodeUserList)
            
            this.approverConfig.error = !this.setApproverStr(this.approverConfig)
            this.$emit("update:nodeConfig", this.approverConfig);
            this.approverDrawer = false;
        },
        // 审批模块新方法 End .
        // 文字设置 - 流程框架图中的展示
        setApproverStr(nodeConfig) {
            if (nodeConfig.settype == 1) {
                if (nodeConfig.nodeUserList.length == 1) {
                    return nodeConfig.nodeUserList[0].name
                } else if (nodeConfig.nodeUserList.length > 1) {
                    if (nodeConfig.examineMode == 1) {
                        return this.arrToStr(nodeConfig.nodeUserList)
                    } else if (nodeConfig.examineMode == 2) {
                        return nodeConfig.nodeUserList.length + "人会签"
                    }
                }
            } else if (nodeConfig.settype == 2) {
                let level = nodeConfig.directorLevel == 1 ? '直接主管' : '第' + nodeConfig.directorLevel + '级主管'
                if (nodeConfig.examineMode == 1) {
                    return level
                } else if (nodeConfig.examineMode == 2) {
                    return level + "会签"
                }
            } else if (nodeConfig.settype == 4) {
                if (nodeConfig.selectRange == 1) {
                    return "发起人自选"
                } else {
                    if (nodeConfig.nodeUserList.length > 0) {
                        if (nodeConfig.selectRange == 2) {
                            return "发起人自选"
                        } else {
                            return '发起人从' + nodeConfig.nodeUserList[0].name + '中自选'
                        }
                    } else {
                        return "";
                    }
                }
            } else if (nodeConfig.settype == 5) {
                return "发起人自己"
            } else if (nodeConfig.settype == 7) {
                return '从直接主管到通讯录中级别最高的第' + nodeConfig.examineEndDirectorLevel + '个层级主管'
            }
        },


        // --------------- 原旧版就注释的部分 审批设置 开始VVVV--------------- 
        addApprover() {
            this.approverVisible = true;
            this.approverSearchName = "";
            this.getDepartmentList();
            this.approverEmplyessList = [];
            for (var i = 0; i < this.approverConfig.nodeUserList.length; i++) {
                var { name, targetId } = this.approverConfig.nodeUserList[i];
                this.approverEmplyessList.push({
                    employeeName: name,
                    id: targetId
                });
            }
        },
        addRoleApprover() {
            this.approverRoleVisible = true;
            this.approverRoleSearchName = "";
            this.getRoleList();
            this.roleList = [];
            for (var i = 0; i < this.approverConfig.nodeUserList.length; i++) {
                var { name, targetId } = this.approverConfig.nodeUserList[i];
                this.roleList.push({
                    roleName: name,
                    roleId: targetId
                });
            }
        },
        sureApprover() {
            this.approverConfig.nodeUserList = [];
            if (this.approverConfig.settype == 1 || (this.approverConfig.settype == 4 && this.approverConfig.selectRange == 2)) {
                this.approverEmplyessList.map(item => {
                    this.approverConfig.nodeUserList.push({
                        type: 1,
                        targetId: item.id,
                        name: item.employeeName
                    })
                });
                this.approverVisible = false;
            } else if (this.approverConfig.settype == 4 && this.approverConfig.selectRange == 3) {
                this.roleList.map(item => {
                    this.approverConfig.nodeUserList.push({
                        type: 2,
                        targetId: item.roleId,
                        name: item.roleName
                    })
                });
                this.approverRoleVisible = false;
            }
        },
        // --------------- 原旧版就注释的部分 审批设置 结束^^^^--------------- 
    

        // -------------------------- 发起人设置 --------------------------
        // 添加/修改发起人 - 打开弹框
        addPromoter() {
            // 设备管理系统 ->组织架构
            this.$axios.get("/web/mes/inspectionplan/treeloadPerson.do")
            .then(res => {
                this.loadPersonTree = res.data;
            })

            this.promoterVisible = true;
            this.getDepartmentList();
            this.promoterSearchName = "";
            this.checkedEmployessList = []; // 原逻辑-确认无用后可删除
            this.checkedDepartmentList = []; // 部门
            this.checkedDepartmentEmployees = []; // 员工

            // console.log("打开弹框：")
            // console.log(this.flowPermission1)
            this.flowPermission1.map(item => {
                if(item.targetId){
                    item.id = item['targetId'];
                    delete item.targetId;
                    item.title = item['name'];
                    delete item.name;
                }
                if (item.type == 1) {
                    this.checkedEmployessList.push({
                        title: item.title,
                        id: item.id
                    });
                } else if (item.type == 3) {
                    // 部门
                    this.checkedDepartmentList.push({
                        title: item.title,
                        id: item.id
                    });
                } else if (item.type == 4) {
                    // 职工
                    this.checkedDepartmentEmployees.push({
                        title: item.title,
                        id: item.id
                    });
                }                
            })
        },
        // 添加/修改发起人 - 弹框确认
        surePromoter() {
            this.flowPermission1 = [];
            this.checkedEmployessList.map(item => {
                this.flowPermission1.push({
                    type: 1,
                    targetId: item.id,
                    name: item.title
                })
            });
            // 发起人 - 公司、部门
            this.checkedDepartmentList.map(item => {
                this.flowPermission1.push({
                    type: 3,
                    targetId: item.id,
                    name: item.title
                })
            });
            // 发起人 - 职工
            this.checkedDepartmentEmployees.map(item => {
                this.flowPermission1.push({
                    type: 4,
                    targetId: item.id,
                    name: item.title,
                })
            });
            this.promoterVisible = false;
        },
        // 发起人- 抽屉确认
        savePromoter() {
            this.$emit("update:flowPermission", this.flowPermission1);
            this.promoterDrawer = false;
        },
        // 文字设置 - 流程框架图中的展示（发起人、审批、抄送）
        arrToStr(arr) {
            if (arr) {
                // 显示时，人员转换为对应的角色
                var newArr = [];
                arr.map(item=>{
                    if(item.parentid){
                        var pId = item.parentid;
                        var pName = item.parentname;
                        newArr.push({
                            type:2,
                            name:pName,
                            targetId:pId
                        })
                    }else{
                        newArr.push(item)
                    }
                })
                var list = this.deteleObject(newArr);
                // 返回处理后的
                return list.map(item => {
                    if(item.name){
                        return item.name
                    }else if(item.title){
                        return item.title
                    }
                    
                }).toString()

            }
        },


        // ------------------------- 条件设置 -------------------------- 
        // 条件文字设置
        conditionStr(item, index) {
            var { conditionList, nodeUserList } = item;
            // if (conditionList.length == 0) {
            if (item.expressions == undefined || item.expressions == "") {
                // 初始条件显示
                // return (index == this.nodeConfig.conditionNodes.length - 1) && this.nodeConfig.conditionNodes[0].conditionList.length != 0 ? '条件表达式：'+ this.conditionConfig.expressions : '条件表达式：'+ this.conditionConfig.expressions
                // return (index == this.nodeConfig.conditionNodes.length - 1) && this.nodeConfig.conditionNodes[0].conditionList.length != 0 ? '其他条件进入此流程' : '请设置条件'
                return (index == this.nodeConfig.conditionNodes.length - 1) && this.nodeConfig.conditionNodes[0].conditionList.length != 0 ? '请设置条件' : '请设置条件'
            } else {
                // let str = ""
                // for (var i = 0; i < conditionList.length; i++) {
                //     var { columnId, columnType, showType, showName, optType, zdy1, opt1, zdy2, opt2, fixedDownBoxValue } = conditionList[i];
                //     if (columnId == 0) {
                //         if (nodeUserList.length != 0) {
                //             str += '发起人属于：'
                //             str += nodeUserList.map(item => { return item.name }).join("或") + " 并且 "
                //         }
                //     }
                //     if (columnType == "String" && showType == "3") {
                //         if (zdy1) {
                //             str += showName + '属于：' + this.dealStr(zdy1, JSON.parse(fixedDownBoxValue)) + " 并且 "
                //         }
                //     }
                //     if (columnType == "Double") {
                //         if (optType != 6 && zdy1) {
                //             var optTypeStr = ["", "<", ">", "≤", "=", "≥"][optType]
                //             str += `${showName} ${optTypeStr} ${zdy1} 并且 `
                //         } else if (optType == 6 && zdy1 && zdy2) {
                //             str += `${zdy1} ${opt1} ${showName} ${opt2} ${zdy2} 并且 `
                //         }
                //     }
                // }
                // // return str ? str.substring(0, str.length - 4) : '条件表达式：'+ this.conditionConfig.expressions
                // return str ? str.substring(0, str.length - 4) : '请设置条件'
                return item.expressions;
            }
        },
        dealStr(str, obj) {
            let arr = [];
            let list = str.split(",");
            for (var elem in obj) {
                list.map(item => {
                    if (item == elem) {
                        arr.push(obj[elem].value)
                    }
                })
            }
            return arr.join("或")
        },
        // 设置条件弹框 - 打开 （设置抽抽屉中的语句、加载选择表单下拉菜单）
        setExpressions(priorityLevel){
            // alert('设置条件抽抽屉中的语句')
            this.conditionDrawer = true
            this.bPriorityLevel = priorityLevel;
            this.conditionsConfig = JSON.parse(JSON.stringify(this.nodeConfig))
            this.conditionConfig = this.conditionsConfig.conditionNodes[priorityLevel - 1]
        
            // 加载流程id关联菜单
            this.conditionSelectValue = "";
            this.conditionTable = [];
            this.$axios.get("/web/mes/MaintenanceOrderAction/selectFormByFlowId.do", {
                params: {
                    flow_id: this.$route.query.id
                }
            }).then(res => {
                this.conditionSelect = res.data;
            })            
        },
        // 条件设置弹框 - 表单选择下拉菜单选中-加载流程id关联菜单项
        conditionSelectChange(){
            // 条件表单
            this.$axios.get("/web/mes/MaintenanceOrderAction/selectMaintenanceOrderFlow.do", {
                params: {
                    menu_uuid: this.conditionSelectValue
                }
            }).then(res => {
                var obj = res.data;
                for(var key in obj){    
                    this.conditionTable.push({
                        name: obj[key],
                        value: key
                    });
                }
            })           
        },
        // 条件设置-抽屉-确定按钮
        saveCondition() {
            this.conditionDrawer = false;
            var a = this.conditionsConfig.conditionNodes.splice(this.bPriorityLevel - 1, 1)//截取旧下标
            this.conditionsConfig.conditionNodes.splice(this.conditionConfig.priorityLevel - 1, 0, a[0])//填充新下标
            this.conditionsConfig.conditionNodes.map((item, index) => {
                item.priorityLevel = index + 1
            });

            // for (var i = 0; i < this.conditionsConfig.conditionNodes.length; i++) {
            //     this.conditionsConfig.conditionNodes[i].error = this.conditionStr(this.conditionsConfig.conditionNodes[i], i) == "请设置条件" && i != this.conditionsConfig.conditionNodes.length - 1
            // }
            
            // 条件模块中添加sql表达式 -位置错误待修改
            // this.conditionConfig.conditionList= this.expressions; //覆盖条件模块的conditionList为前端添加的expressions
            this.conditionConfig.expressions = this.conditionConfig.expressions; //在条件模块的字段中新增expressions字段
            this.$emit("update:nodeConfig", this.conditionsConfig);
        },


        // ------------------ 原旧版就注释的部分 条件设置 开始VVVV---------------- 
        // 已注释
        addConditionRole() {
            this.conditionRoleSearchName = "";
            this.conditionRoleVisible = true;
            this.activeName = "1";
            this.getDepartmentList();
            this.conditionDepartmentList = [];
            this.conditionEmployessList = [];
            this.conditionRoleList = [];
            for (var i = 0; i < this.conditionConfig.nodeUserList.length; i++) {
                var { type, name, targetId } = this.conditionConfig.nodeUserList[i];
                if (type == 1) {
                    this.conditionEmployessList.push({
                        employeeName: name,
                        id: targetId
                    });
                } else if (type == 2) {
                    this.conditionRoleList.push({
                        roleName: name,
                        roleId: targetId
                    });
                } else if (type == 3) {
                    this.conditionDepartmentList.push({
                        departmentName: name,
                        id: targetId
                    });
                }
            }
        },
        // 已注释
        sureConditionRole() {
            this.conditionConfig.nodeUserList = [];
            this.conditionRoleList.map(item => {
                this.conditionConfig.nodeUserList.push({
                    type: 2,
                    targetId: item.roleId,
                    name: item.roleName,
                })
            });
            this.conditionDepartmentList.map(item => {
                this.conditionConfig.nodeUserList.push({
                    type: 3,
                    targetId: item.id,
                    name: item.departmentName,
                })
            });
            this.conditionEmployessList.map(item => {
                this.conditionConfig.nodeUserList.push({
                    type: 1,
                    targetId: item.id,
                    name: item.employeeName,
                })
            });
            this.conditionRoleVisible = false;
        },
        // 已注释 - 添加条件节点
        addCondition() {
            this.conditionList = [];
            this.conditionVisible = true;
            // 
            this.$axios.get(`${process.env.BASE_URL}conditions.json?tableId=${this.tableId}`).then(res => {
                this.conditions = res.data;
                if (this.conditionConfig.conditionList) {
                    for (var i = 0; i < this.conditionConfig.conditionList.length; i++) {
                        var { columnId } = this.conditionConfig.conditionList[i]
                        if (columnId == 0) {
                            // 当添加条件语句字段为空
                            this.conditionList.push({ columnId: 0})
                        } else {
                            this.conditionList.push(this.conditions.filter(item => { return item.columnId == columnId})[0])
                        }
                    }
                }
            })
        },
        // 已注释
        changeOptType(item) {
            if (item.optType == 1) {
                item.zdy1 = 2;
            } else {
                item.zdy1 = 1;
                item.zdy2 = 2;
            }
        },
        // 已注释 添加条件弹出窗
        sureCondition() {
            //1.弹窗有，外面无+
            //2.弹窗有，外面有不变
            for (var i = 0; i < this.conditionList.length; i++) {
                var { columnId, showName, columnName, showType, columnName, columnType, fixedDownBoxValue} = this.conditionList[i];
                if (this.toggleClass(this.conditionConfig.conditionList, this.conditionList[i], "columnId")) {
                    continue;
                }
                if (columnId == 0) {
                    this.conditionConfig.nodeUserList == [];
                    this.conditionConfig.conditionList.push({
                        "type": 1,
                        "columnId": columnId,
                        "showName": '发起人',
                    });
                } else {
                    if (columnType == "Double") {
                        this.conditionConfig.conditionList.push({
                            "showType": showType,
                            "columnId": columnId,
                            "type": 2,
                            "showName": showName,
                            "optType": "1",
                            "zdy1": "2",
                            "opt1": "<",
                            "zdy2": "",
                            "opt2": "<",
                            "columnDbname": columnName,
                            "columnType": columnType,
                        })
                    } else if (columnType == "String" && showType == "3") {
                        this.conditionConfig.conditionList.push({
                            "showType": showType,
                            "columnId": columnId,
                            "type": 2,
                            "showName": showName,
                            "zdy1": "",
                            "columnDbname": columnName,
                            "columnType": columnType,
                            "fixedDownBoxValue": fixedDownBoxValue,
                        })
                    }
                }
            }
            ////3.弹窗无，外面有-
            for (var i = this.conditionConfig.conditionList.length - 1; i >= 0; i--) {
                if (!this.toggleClass(this.conditionList, this.conditionConfig.conditionList[i], "columnId")) {
                    this.conditionConfig.conditionList.splice(i, 1);
                }
            }
            this.conditionConfig.conditionList.sort(function (a, b) { return a.columnId - b.columnId; });
            this.conditionVisible = false;
        },
        // 已注释
        toggleStrClass(item, key) {
            let a = item.zdy1 ? item.zdy1.split(",") : []
            return a.some(item => { return item == key });
        },
        // 已注释
        toStrChecked(item, key) {
            let a = item.zdy1 ? item.zdy1.split(",") : []
            var isIncludes = this.toggleStrClass(item, key);
            if (!isIncludes) {
                a.push(key)
                item.zdy1 = a.toString()
            } else {
                this.removeStrEle(item, key);
            }
        },
        // toStrChecked()注释后无调用
        removeStrEle(item, key) {
            let a = item.zdy1 ? item.zdy1.split(",") : []
            var includesIndex;
            a.map((item, index) => {
                if (item == key) {
                    includesIndex = index
                }
            });
            a.splice(includesIndex, 1);
            item.zdy1 = a.toString()
        },
        // --------------- 原旧版就注释的部分 条件设置 结束^^^^^--------------- 


        // -------------------- 成员选中与删除 处理 ----------------------- 
        // 成员选中
        toggleClass(arr, elem, key = 'id') {
            return arr.some(item => { return item[key] == elem[key] });
        },
        // 成员选中
        toChecked(arr, elem, key = 'id',roleItem) {
            var isIncludes = this.toggleClass(arr, elem, key);
            // !isIncludes ? arr.push(elem) : this.removeEle(arr, elem, key , roleItem);
            if(!isIncludes){
                arr.push(elem)
                // 添加角色下的人员
                var parentname = elem.title;
                if(roleItem=="approverRoleItem"){
                    elem.children.map(item => {
                        this.approverRoleItem.push({
                            type: 5,
                            targetId: item.id,
                            name: item.title,
                            parentid: item.parentid,
                            parentname: parentname
                        })
                    })
                }
                if(roleItem=="copyerRoleItem"){
                    elem.children.map(item => {
                        this.copyerRoleItem.push({
                            type: 5,
                            targetId: item.id,
                            name: item.title,
                            parentid: item.parentid,
                            parentname: parentname
                        })
                    })
                }
            }else{
                this.removeEle(arr, elem, key , roleItem);
            }
        },
        // 成员删除（添加成员弹框内）
        removeEle(arr, elem, key = 'id' , roleItem) {
            var includesIndex;
            arr.map((item, index) => {
                if (item[key] == elem[key]) {
                    includesIndex = index
                }
            });
            arr.splice(includesIndex, 1);
            // 审批人删除
            if(roleItem == "approverRoleItem"){
                var arr2 = [];
                var pId = elem.id;
                var parentname = elem.title;
                this.approverRoleItem.map(item=>{
                    if(item.parentid != pId){
                        arr2.push({
                            type: 5,
                            targetId: item.id,
                            name: item.title,
                            parentid: item.parentid,
                            parentname: item.parentname
                        })
                    }
                })
                this.approverRoleItem = arr2;
            }
            // 抄送人删除
            if(roleItem == "copyerRoleItem"){
                var arr2 = [];
                var pId = elem.id;
                var parentname = elem.title;
                this.copyerRoleItem.map(item=>{
                    if(item.parentid != pId){
                        arr2.push({
                            type: 5,
                            targetId: item.id,
                            name: item.title,
                            parentid: item.parentid,
                            parentname: item.parentname
                        })
                    }
                })
                this.copyerRoleItem = arr2;
            }
        },
        // 审批人设置抽屉-成员删除
        removeEle1(arr, elem, key = 'targetId' , roleItem) {
            var includesIndex;
            arr.map((item, index) => {
                if (item[key] == elem[key]) {
                    includesIndex = index
                }
            });
            arr.splice(includesIndex, 1);

            var data3 = [];
            // 审批人-点击删除角色：删除角色对应的人员
            if(roleItem=="delectApproverRole"){
                var pId = elem.targetId; // 所属角色id
                // 符合条件的 角色对应人
                this.approverConfig.nodeUserList.map(item=>{
                    if(pId != item.parentid){
                        data3.push(item)
                    }
                })
                // 符合条件的 组织架构
                arr.map(item=>{
                    if(item.type!=2){
                        data3.push(item)
                    }
                })
            // 点击删除人员
            }else if(roleItem==undefined){
                var tId = elem.targetId;
                this.approverConfig.nodeUserList.map(item=>{
                    if(tId != item.targetId){
                        data3.push(item)
                    }
                })
            }
            this.approverConfig.nodeUserList = this.deteleObject(data3);
            // console.log(this.approverConfig.nodeUserList)
        },
        // 抄送人设置抽屉-成员删除
        removeEle2(arr, elem, key = 'targetId' , roleItem) {
            var includesIndex;
            arr.map((item, index) => {
                if (item[key] == elem[key]) {
                    includesIndex = index
                }
            });
            arr.splice(includesIndex, 1);

            var data3 = [];
            // 抄送人-点击删除角色：删除角色对应的人员
            if(roleItem=="delectCopyerItem"){
                var pId = elem.targetId; // 所属角色id
                // 符合条件的 角色对应人
                this.copyerConfig.nodeUserList.map(item=>{
                    if(pId != item.parentid){
                        data3.push(item)
                    }
                })
                // 符合条件的 组织架构
                arr.map(item=>{
                    if(item.type!=2){
                        data3.push(item)
                    }
                })
            // 点击删除人员
            }else if(roleItem==undefined){
                var tId = elem.targetId;
                this.copyerConfig.nodeUserList.map(item=>{
                    if(tId != item.targetId){
                        data3.push(item)
                    }
                })
            }
            this.copyerConfig.nodeUserList = this.deteleObject(data3);
            // console.log(this.copyerConfig.nodeUserList)
        },
        // 添加成员弹框 - 切换到角色列表
        getRoleList() {
            // this.$axios.get(`${process.env.BASE_URL}roles.json`).then(res => {
            //     this.roles = res.data.list;
            // })

            // 设备管理系统 ->角色列表 
            this.$axios.get("/web/mes/User/selectUserRoleTree.do ")
            .then(res => {
                this.roles = res.data;
                this.loadUserRoleTree = res.data;
            })
        },
        // 添加成员弹框 - 切换到组织架构列表
        getDepartmentList(parentId = 0) {
            // this.$axios.get(`${process.env.BASE_URL}departments.json?parentId=${parentId}`).then(res => {
            //     this.departments = res.data;
            //     this.activeNameApprover = parentId;
            //     this.activeNameCopyer = parentId;
            // })

            // 设备管理系统 ->组织架构
            // this.$axios.get("/mes/inspectionplan/treeloadPerson.do")
            // .then(res => {
            //     this.loadPersonTree = res.data;
            // })
            this.activeNameApprover = parentId
        },
        // 添加成员弹框 - 组织架构展开下级（设备管理系统）
        employeesList(id = 0) {
            // this.$axios.get(`${process.env.BASE_URL}departments.json?id=${id}`).then(res => {
            //     this.departments = res.data;
            //     this.activeNameChecked = id;
            // })
            this.activeNameChecked = id;
        },
        // 添加成员弹框 - 搜索
        getDebounceData(event, type = 1) {
            this.$func.debounce(function () {
                if (event.target.value) {
                    console.log(event.target.value)
                    console.log(type)
                    if (type == 1) {
                        this.departments.childDepartments = [];
                        // this.$axios.get(`${process.env.BASE_URL}employees.json?searchName=${event.target.value}&pageNum=1&pageSize=30`).then(res => {
                        //     this.departments.employees = res.data.list;
                        //     console.log(res.data.list);
                        // })
                    } else {
                        // this.$axios.get(`${process.env.BASE_URL}roles.json?searchName=${event.target.value}&pageNum=1&pageSize=30`).then(res => {
                        //     this.roles = res.data.list
                        // })

                        // 设备管理系统 ->角色列表 
                        // this.$axios.get("/mes/User/selectUserRoleTree.do ")
                        // .then(res => {
                        //     this.roles = res.data;
                        //     this.loadUserRoleTree = res.data;
                        // })
                    }
                } else {
                    type == 1 ? this.getDepartmentList() : this.getRoleList();
                }
            }.bind(this))()
        },
        // 添加成员弹框 - 搜索
        handleClick() {
            this.copyerSearchName = "";
            this.conditionRoleSearchName = "";
            if (this.activeName == 1) {
                // this.getDepartmentList();
            } else {
                // this.getRoleList();
            }
        },        


        // -------------------- 流程图结构处理 其他项 -----------------------  
        // 节点 - 删除审批人/抄送人
        delNode() {
            this.$emit("update:nodeConfig", this.nodeConfig.childNode);
        },
        // 节点 - 添加条件
        addTerm() {
            let len = this.nodeConfig.conditionNodes.length + 1
            this.nodeConfig.conditionNodes.push({
                "nodeName": "条件" + len,
                "type": 3,
                "priorityLevel": len,
                "conditionList": [],
                "nodeUserList": [],
                "childNode": null
            });
            // for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
            //     this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "请设置条件" && i != this.nodeConfig.conditionNodes.length - 1
            // }
            this.$emit("update:nodeConfig", this.nodeConfig);
        },
        // 节点 - 删除条件
        delTerm(index) {
            this.nodeConfig.conditionNodes.splice(index, 1)
            // for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
            //     this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "请设置条件" && i != this.nodeConfig.conditionNodes.length - 1
            // }
            this.$emit("update:nodeConfig", this.nodeConfig);
            if (this.nodeConfig.conditionNodes.length == 1) {
                if (this.nodeConfig.childNode) {
                    if (this.nodeConfig.conditionNodes[0].childNode) {
                        this.reData(this.nodeConfig.conditionNodes[0].childNode, this.nodeConfig.childNode)
                    } else {
                        this.nodeConfig.conditionNodes[0].childNode = this.nodeConfig.childNode
                    }
                }
                this.$emit("update:nodeConfig", this.nodeConfig.conditionNodes[0].childNode);
            }
        },
        reData(data, addData) {
            if (!data.childNode) {
                data.childNode = addData
            } else {
                this.reData(data.childNode, addData)
            }
        },
        // 打开设置弹框 根据type判断（发起人/审批人/抄送人/..）
        setPerson(priorityLevel) {
            var { type } = this.nodeConfig;
            if (type == 0) {
                // 现在发起人不可更改，故为false
                this.promoterDrawer = false;
                // this.promoterDrawer = true;
                this.flowPermission1 = this.flowPermission;
            } else if (type == 1) { //审批人
                this.approverDrawer = true;
                this.approverConfig = JSON.parse(JSON.stringify(this.nodeConfig))
                this.approverConfig.settype = this.approverConfig.settype ? this.approverConfig.settype : 1
                // 根据数据显示会签状态
                this.propertyList = this.approverConfig.propertyList;
                // console.log(this.approverConfig.propertyList.executionMode)

                const lists = this.approverConfig.nodeUserList;
                const arrDemo = [];
                lists.map(item => {
                    var objC = {};
                    if(item.type == 5) { // 审批人 - 角色对应人员
                        objC['type'] = 2;
                        objC['name'] = item.parentname;
                        objC['targetId'] = item.parentid;  
                        arrDemo.push(objC)                 
                    }else{
                        arrDemo.push(item)
                    }
                })
                this.approverConfigItem = this.deteleObject(arrDemo)
                // console.log(this.approverConfigItem)
                
            } else if (type == 2) { //抄送人
                this.copyerDrawer = true;
                this.copyerConfig = JSON.parse(JSON.stringify(this.nodeConfig))
                this.ccSelfSelectFlag = this.copyerConfig.ccSelfSelectFlag == 0 ? [] : [this.copyerConfig.ccSelfSelectFlag]

                const lists = this.copyerConfig.nodeUserList;
                const arrDemo = [];
                lists.map(item => {
                    var objC = {};
                    if(item.type == 5) { // 抄送人 - 角色对应人员
                        objC['type'] = 2;
                        objC['name'] = item.parentname;
                        objC['targetId'] = item.parentid;  
                        arrDemo.push(objC)                 
                    }else{
                        arrDemo.push(item)
                    }
                })
                this.copyerConfigItem = this.deteleObject(arrDemo)
                // console.log(this.copyerConfigItem)
            } else {
                this.conditionDrawer = true
                this.bPriorityLevel = priorityLevel;
                this.conditionsConfig = JSON.parse(JSON.stringify(this.nodeConfig))
                this.conditionConfig = this.conditionsConfig.conditionNodes[priorityLevel - 1]
            }
        },
        // 流程项 - 左右位置移动
        arrTransfer(index, type = 1) {//向左-1,向右1
            this.nodeConfig.conditionNodes[index] = this.nodeConfig.conditionNodes.splice(index + type, 1, this.nodeConfig.conditionNodes[index])[0];
            this.nodeConfig.conditionNodes.map((item, index) => {
                item.priorityLevel = index + 1
            })
            // for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
            //     this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "请设置条件" && i != this.nodeConfig.conditionNodes.length - 1
            // }
            this.$emit("update:nodeConfig", this.nodeConfig);
        }
    }
}
</script>
<style lang="scss" scoped>
    .treeSpan{
        display: inline-block;
        width: max-content;
        max-width: calc(100% - 20px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: top;
    }
    .treeA{
        margin-right:0;
        vertical-align: revert;
    }
    .treeUI{
        height: auto;
        margin-left:20px;
    }
    .person_tree li i{
        // vertical-align: text-bottom;
        // text-align: right;
    }
</style>   
<style>
    /* 紫色按钮 */
    .purpleButton{
        background-color: #5473e8 !important;
        color: #fff !important;
        border: none !important;
        height: 30px;
    }
    .purpleButton:hover{
        background-color: rgba(84,115,232, .8) !important;
    }
    .selected_list a{
        color:#5473e8;
    }
    .approver_some .el-table--border th{
        padding: 5px !important;
        color: #778ca2;
    }
    .approver_some .el-table__body td{
        color: #333333;
    }
    .sqlDiv .el-textarea__inner{
        color: #333333;
    }
    .tableChose .el-select{
        height: 40px !important;
        line-height: 40px !important;
    }
    .tableChose .el-select .el-input__inner:focus {
        background-color: #f6f7fc !important;
        border-radius: 4px !important;
        border: solid 1px #e2e8ee !important;
    }
     .tableChose .el-select .el-input__inner{
        height: 40px !important;
        line-height: 40px !important;
        background-color: #f6f7fc !important;
        border-radius: 4px !important;
        border: solid 1px #e2e8ee !important;
    }
</style>