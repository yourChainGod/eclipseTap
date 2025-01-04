let wasmInstance;
let currentEditingTask = null;
let grassUpdateIntervals = {};  // 存储每个任务的更新定时器
let isGuideExpanded = true;

async function initWasm() {
    const go = new Go();
    const result = await WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject);
    wasmInstance = result.instance;
    go.run(wasmInstance);
}

function showModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitButton = document.getElementById('submitButton');
    
    if (taskId) {
        // 编辑模式
        modalTitle.textContent = '编辑任务';
        currentEditingTask = taskId;
        // 填充现有数据
        const taskCard = document.getElementById(taskId);
        const address = taskCard.getAttribute('data-address');
        const privateKey = taskCard.getAttribute('data-private-key');
        const delays = taskCard.getAttribute('data-delays').split('-');
        
        document.getElementById('mainAddress').value = address;
        document.getElementById('userPrivateKey').value = privateKey;
        document.getElementById('minDelay').value = delays[0];
        document.getElementById('maxDelay').value = delays[1];
    } else {
        // 新建模式
        modalTitle.textContent = '新建任务';
        currentEditingTask = null;
        clearForm();
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentEditingTask = null;
    clearForm();
}

function submitTask() {
    const mainAddress = document.getElementById('mainAddress').value;
    const userPrivateKey = document.getElementById('userPrivateKey').value;
    const minDelay = parseInt(document.getElementById('minDelay').value);
    const maxDelay = parseInt(document.getElementById('maxDelay').value);

    if (!mainAddress || !userPrivateKey) {
        alert('请填写完整信息');
        return;
    }

    if (currentEditingTask) {
        // 更新现有任务
        updateTask(currentEditingTask, mainAddress, userPrivateKey, minDelay, maxDelay);
    } else {
        // 创建新任务
        createTask(mainAddress, userPrivateKey, minDelay, maxDelay);
    }
    
    hideModal();
}

function createTask(mainAddress, userPrivateKey, minDelay, maxDelay) {
    const taskId = 'task-' + Date.now();
    const taskCard = createTaskCard(taskId, mainAddress, minDelay, maxDelay);
    
    const addCard = document.querySelector('.add-card');
    document.getElementById('taskGrid').insertBefore(taskCard, addCard);
    
    // 保存私钥到DOM元素（实际应用中建议使用更安全的方式）
    taskCard.setAttribute('data-address', mainAddress);
    taskCard.setAttribute('data-private-key', userPrivateKey);
    taskCard.setAttribute('data-delays', `${minDelay}-${maxDelay}`);
    
    // 调用Go函数启动任务
    window.startClickerTask(taskId, mainAddress, userPrivateKey, minDelay, maxDelay);
    
    // 启动草的数量更新
    setTimeout(() => {
        startGrassUpdate(taskId);
    }, 2000); // 等待2秒后开始更新，确保任务已经启动
}

function updateTask(taskId, mainAddress, userPrivateKey, minDelay, maxDelay) {
    // 停止旧任务和定时器
    stopTask(taskId);
    
    // 更新任务卡片
    const taskCard = document.getElementById(taskId);
    taskCard.querySelector('p:nth-child(1)').textContent = 
        `地址: ${mainAddress.slice(0, 6)}...${mainAddress.slice(-4)}`;
    taskCard.querySelector('p:nth-child(2)').textContent = 
        `延迟: ${minDelay}-${maxDelay}ms`;
    
    // 更新存储的数据
    taskCard.setAttribute('data-address', mainAddress);
    taskCard.setAttribute('data-private-key', userPrivateKey);
    taskCard.setAttribute('data-delays', `${minDelay}-${maxDelay}`);
    
    // 重新启动任务
    window.startClickerTask(taskId, mainAddress, userPrivateKey, minDelay, maxDelay);
    
    // 重新启动草的数量更新
    startGrassUpdate(taskId);
    
    // 更新状态显示
    const statusSpan = taskCard.querySelector('.status-running, .status-stopped');
    statusSpan.className = 'status-running';
    statusSpan.textContent = '运行中';
}

function createTaskCard(taskId, mainAddress, minDelay, maxDelay) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4';
    div.id = taskId;
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">任务 ${taskId.split('-')[1]}</h3>
            <span class="status-running px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">运行中</span>
        </div>
        <div class="space-y-2">
            <p class="text-gray-600">地址: ${mainAddress.slice(0, 6)}...${mainAddress.slice(-4)}</p>
            <p class="text-gray-600">延迟: ${minDelay}-${maxDelay}ms</p>
            <p class="flex items-center space-x-2">
                <span class="text-gray-600">草的数量:</span>
                <span class="text-lg font-semibold text-green-600" id="grass-${taskId}">0</span>
            </p>
        </div>
        <div class="flex space-x-3 mt-4">
            <button onclick="stopTask('${taskId}')" class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                停止
            </button>
            <button onclick="showModal('${taskId}')" class="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                编辑
            </button>
        </div>
    `;
    return div;
}

function startGrassUpdate(taskId) {
    // 清除可能存在的旧定时器
    if (grassUpdateIntervals[taskId]) {
        clearInterval(grassUpdateIntervals[taskId]);
    }
    
    // 立即更新一次
    updateGrassCount(taskId);
    
    // 设置定时更新
    grassUpdateIntervals[taskId] = setInterval(() => {
        try {
            updateGrassCount(taskId);
        } catch (error) {
            console.error('更新草数量时出错:', error);
            clearInterval(grassUpdateIntervals[taskId]);
            delete grassUpdateIntervals[taskId];
        }
    }, 10000);  // 改为每10秒更新一次
}

function updateGrassCount(taskId) {
    try {
        const grassCount = window.getGrass(taskId);
        const count = parseInt(grassCount, 10);
        const grassElement = document.getElementById(`grass-${taskId}`);
        if (grassElement && !isNaN(count)) {
            grassElement.textContent = count.toLocaleString();
        } else {
            console.warn('无效的草数量:', grassCount);
        }
    } catch (error) {
        console.error('获取草数量时出错:', error);
        throw error;
    }
}

function stopTask(taskId) {
    try {
        window.stopClickerTask(taskId);
        const statusSpan = document.querySelector(`#${taskId} .status-running`);
        if (statusSpan) {
            statusSpan.className = 'px-2 py-1 text-sm rounded-full bg-red-100 text-red-800';
            statusSpan.textContent = '已停止';
        }
    } catch (error) {
        console.error('停止任务时出错:', error);
    } finally {
        if (grassUpdateIntervals[taskId]) {
            clearInterval(grassUpdateIntervals[taskId]);
            delete grassUpdateIntervals[taskId];
        }
    }
}

function clearForm() {
    document.getElementById('mainAddress').value = '';
    document.getElementById('userPrivateKey').value = '';
    document.getElementById('minDelay').value = '0';
    document.getElementById('maxDelay').value = '0';
}

function toggleGuide() {
    const content = document.getElementById('guideContent');
    const arrow = document.getElementById('guideArrow');
    isGuideExpanded = !isGuideExpanded;
    
    if (isGuideExpanded) {
        content.style.maxHeight = '500px';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        content.style.maxHeight = '0';
        arrow.style.transform = 'rotate(-90deg)';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // 初始展开使用说明
    toggleGuide();
});

initWasm(); 

function exportTasks() {
    const tasks = [];
    const taskCards = document.querySelectorAll('[id^="task-"]');
    
    taskCards.forEach(card => {
        if (!card.classList.contains('add-card')) {
            tasks.push({
                id: card.id,
                address: card.getAttribute('data-address'),
                privateKey: card.getAttribute('data-private-key'),
                delays: card.getAttribute('data-delays').split('-').map(Number)
            });
        }
    });
    
    const config = {
        exportTime: new Date().toISOString(),
        tasks: tasks
    };
    
    // 创建下载链接
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-config-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importTasks() {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async event => {
            try {
                const config = JSON.parse(event.target.result);
                
                // 确认导入
                if (!confirm(`确认导入 ${config.tasks.length} 个任务配置？`)) {
                    return;
                }
                
                // 停止所有现有任务
                const existingTasks = document.querySelectorAll('[id^="task-"]');
                existingTasks.forEach(task => {
                    if (!task.classList.contains('add-card')) {
                        stopTask(task.id);
                        task.remove();
                    }
                });
                
                // 创建新任务
                for (const task of config.tasks) {
                    createTask(
                        task.address,
                        task.privateKey,
                        task.delays[0],
                        task.delays[1]
                    );
                    // 添加延迟以避免并发问题
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                alert('任务导入完成！');
                
            } catch (error) {
                console.error('导入配置失败:', error);
                alert('导入配置失败，请检查文件格式是否正确！');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
} 