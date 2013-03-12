/*
 * 获取YYeTs.com 的resourcelist
 */

var listHandle = require('./list')
  , page = 1;

function data() {
    listHandle(page, function(listHandle) {
        page++;
        data();
    });
}

function main() {
    data();
}

//取消 递归的调用
//main();
var seqList = function() {
    var todoList = [];
    var doneList = [
    
    ]
    var page = 1;
    var maxCount = 1;
    var statusDic = {
        BEFORE: 0,
        DOING: 1,
        DONE: 2
    };
    function createTask(id, handle) {
        var task = {
            id: id,
            handle: handle,
            status: statusDic.BEFORE
        };  
        return task;
    }
    /**
     * @param {String} id taskId 
     * 
     */
    var push = function(id, handle) {
        var task = createTask(id, handle);
        todoList.push(task);
    }
    var start = function() {
        var tasks = todoList;
        var hasTask = true; 
        if (tasks.length == 0) {
            return; 
        }
        var task =  tasks.shift();
        
        //TODO: 改成 setTimeout 比较合适
        var timer = setInterval(function() { 
            var id = task.id;
            //任务完成callback
            var done = function() {
                task.status =  statusDic.DONE; 
            }
            //开始状态
            if (task.status == statusDic.BEFORE) {
                task.status = statusDic.DOING;
                task.handle.call(null, id, done); 
            }
            //正在执行中 
            else if (task.status == statusDic.DOING) {
                //continue; 
            }
            //执行完毕一个task
            else if (task.status == statusDic.DONE) {
                if (tasks.length > 0) {
                    doneList.push(task);
                    task = tasks.shift(); 
                }      
                else {
                    //hasTask = false; 
                    clearInterval(timer);
                }
            }
        }, 100); 
    }
    var stop = function() {
    
    }
    return {
        push: push,
        start: start
    }
}()

//目前实验两页
for (var i = 0; i < 2; i ++) {
    seqList.push(i, listHandle);
}
seqList.start();
