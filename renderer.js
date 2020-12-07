const {ipcRenderer} = require('electron')
const ProgressBar = require('progressbar.js')
const Timer = require('timer.js')

let timerContainer = document.getElementById('timer-container')
let switchButton = document.getElementById('switch-button')
let progressBar = new ProgressBar.Circle('#timer-container', {
    strokeWidth: 2,
    color: '#F44336',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: null
})
let workTime = 10 // 10s 工作时间
let restTime = 5 // 5s 休息时间
let state = {}

// 0 开始工作、1 停止工作、2 开始休息、3 停止休息
const STATE_WORK = 0
const STOP_WORK = 1
const STATE_REST = 2
const STOP_REST = 3

const STATE_WORK_STR = '开始工作'
const STOP_WORK_STR = '停止工作'
const STATE_REST_STR = '开始休息'
const STOP_REST_STR = '停止休息'



// 渲染index.html
function render () {
    // ??? 啥写发？
    let {remainTime: s , type} = state
    console.log({s , type})
    let maxTime = type < STATE_REST ? workTime: restTime
    let ss = s % 60
    let mm = ((s - ss) / 60).toFixed()
    progressBar.set(1 - s/maxTime)
    progressBar.setText(`${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`)
    if(type === STATE_WORK) {
        switchButton.innerText = STATE_WORK_STR
    } else if(type === STOP_WORK) {
        switchButton.innerText = STOP_WORK_STR
    } else if (type === STATE_REST){
        switchButton.innerText = STATE_REST_STR
    } else {
        switchButton.innerText = STOP_REST_STR
    }
}

function setState(_state) {
    // Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象分配到目标对象。
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    Object.assign(state, _state)
    render()
}

function startWork() {
    setState({type: STOP_WORK, remainTime: workTime})
    workTimer.start(workTime)
}

function startRest() {
    setState({type: STOP_REST, remainTime: restTime})
    workTimer.start(restTime)
}

// 按钮点击事件
switchButton.onclick = function() {
    console.log('switch-button is click')
    if (this.innerText === STATE_WORK_STR) {
        startWork()
    } else if (this.innerText === STATE_REST_STR) {
        startRest()
    } else {
        workTimer.stop()
    }
}

// JavaScritp async???
async function notification({title, body, actionText, closeButtonText, onclose, onaction}) {
    // 发送通知
    let res = await ipcRenderer.invoke('notification', {
        title, 
        body,
        actions: [{text: actionText, type: 'button'}],
        closeButtonText
    })
    res.event === 'close' ? onclose(): onaction()
}

const workTimer = new Timer({
    ontick: (ms) => { setState({remainTime: (ms/1000).toFixed(0)}) },
    onstop: () => { setState({type: 0 , remainTime: 0})},
    onend: function() {
        let {type} = state
        if (type === STOP_WORK) {
            setState({type:STATE_REST, remainTime: 0})
            // 只有 Mac 下才能使用 notification
            if(process.platform === 'darwin') { // 在Mac下才能使用notification
                notification({
                    title: '恭喜你完成任务', 
                    body: '是否开始休息？',
                    actionText: `休息${restTime}秒`,
                    closeButtonText: '继续工作',
                    onaction: startRest,
                    onclose: startWork
                }) 
            } else { // windows直接alert
                alert('工作结束')
            }
        }else if (type === STOP_REST) {
            setState({type: STATE_WORK, remainTime: 0})
            if(process.platform === 'darwin') {
                notification({
                    body: '开始新的工作吧!',
                    title: '休息结束', 
                    closeButtonText: '继续休息',
                    actionText: '开始工作',
                    onaction: startWork,
                    onclose: startRest
                })
            } else {
                alert('工作结束')
            }
        }
    }
})

setState({
    remainTime: 0,
    type: STATE_WORK
})