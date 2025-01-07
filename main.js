let wasmInstance;
let currentEditingTask = null;
let grassUpdateIntervals = {};  // 存储每个任务的更新定时器
let isGuideExpanded = true;
let wasmLoaded = false;

async function initWasm() {
    const go = new Go();
    const result = await WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject);
    wasmInstance = result.instance;
    go.run(wasmInstance);
    wasmLoaded = true;
}

function waitForWasm(timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (wasmLoaded) {
            resolve();
            return;
        }
        
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (wasmLoaded) {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                reject(new Error('WASM 加载超时'));
            }
        }, 100);
    });
}

function showModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (taskId) {
        // 编辑模式，先停止任务
        toggleTask(taskId);
        modalTitle.textContent = t('editTask');
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
        modalTitle.textContent = t('newTask');
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
        alert(t('fillAll'));
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

async function createTask(mainAddress, userPrivateKey, minDelay, maxDelay) {
    try {
        await waitForWasm();
    } catch (error) {
        console.error('WASM 未就绪:', error);
        throw new Error('系统未就绪，请稍后重试');
    }

    const taskId = 'task-' + Date.now();
    const taskCard = createTaskCard(taskId, mainAddress, minDelay, maxDelay);
    
    const addCard = document.querySelector('[onclick="showModal()"]');
    document.getElementById('taskGrid').insertBefore(taskCard, addCard);
    
    // 保存私钥到DOM元素
    taskCard.setAttribute('data-address', mainAddress);
    taskCard.setAttribute('data-private-key', userPrivateKey);
    taskCard.setAttribute('data-delays', `${minDelay}-${maxDelay}`);
    
    // 调用Go函数启动任务
    window.startClickerTask(taskId, mainAddress, userPrivateKey, minDelay, maxDelay);
    
    // 启动草的数量更新
    setTimeout(() => {
        startGrassUpdate(taskId);
    }, 2000);
}

function updateTask(taskId, mainAddress, userPrivateKey, minDelay, maxDelay) {
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
    
    // 更新按钮和状态显示
    const toggleBtn = taskCard.querySelector('.toggle-btn');
    const statusSpan = taskCard.querySelector('.status-running, .status-stopped');
    
    toggleBtn.textContent = '停止';
    toggleBtn.className = 'toggle-btn flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500';
    statusSpan.className = 'status-running px-2 py-1 text-sm rounded-full bg-green-100 text-green-800';
    statusSpan.textContent = '运行中';
    
    // 重新启动草的数量更新
    startGrassUpdate(taskId);
}

function createTaskCard(taskId, mainAddress, minDelay, maxDelay) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 space-y-4';
    div.id = taskId;
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                <span class="material-icons mr-2 text-blue-500">task_alt</span>
                <span class="task-title">
                    <span class="task-text">${t('task')}</span> ${taskId.split('-')[1]}
                </span>
            </h3>
            <span class="status-running px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 flex items-center">
                <span class="material-icons text-sm mr-1">radio_button_checked</span>
                ${t('running')}
            </span>
        </div>
        <div class="space-y-3">
            <p class="text-gray-600 flex items-center">
                <span class="material-icons text-sm mr-2">account_balance_wallet</span>
                <span class="address-text">${t('address')}: ${mainAddress.slice(0, 6)}...${mainAddress.slice(-4)}</span>
            </p>
            <p class="text-gray-600 flex items-center">
                <span class="material-icons text-sm mr-2">timer</span>
                <span class="delay-text">${t('delay')}: ${minDelay}-${maxDelay}ms</span>
            </p>
            <div class="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                <span class="material-icons text-green-600">grass</span>
                <span class="text-gray-600 grass-text">${t('grassAmount')}:</span>
                <span class="text-lg font-semibold text-green-600" id="grass-${taskId}">0</span>
            </div>
        </div>
        <div class="flex space-x-3 mt-6">
            <button onclick="toggleTask('${taskId}')" 
                    class="toggle-btn mui-btn flex-1 px-4 py-2 rounded-md flex items-center justify-center transition-all duration-200
                           text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                <span class="material-icons text-sm mr-2">stop</span>
                ${t('stop')}
            </button>
            <button onclick="showModal('${taskId}')" 
                    class="mui-btn flex-1 px-4 py-2 rounded-md flex items-center justify-center transition-all duration-200
                           text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span class="material-icons text-sm mr-2">edit</span>
                <span class="edit-text">${t('edit')}</span>
            </button>
        </div>
    `;
    return div;
}

function toggleTask(taskId) {
    const taskCard = document.getElementById(taskId);
    const toggleBtn = taskCard.querySelector('.toggle-btn');
    const statusSpan = taskCard.querySelector('.status-running, .status-stopped');
    
    if (toggleBtn.innerHTML.includes('停止')) {
        // 停止任务
        window.stopClickerTask(taskId);
        toggleBtn.innerHTML = `
            <span class="material-icons text-sm mr-2">play_arrow</span>
            开始
        `;
        toggleBtn.className = 'toggle-btn mui-btn flex-1 px-4 py-2 rounded-md flex items-center justify-center transition-all duration-200 text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2';
        statusSpan.innerHTML = `
            <span class="material-icons text-sm mr-1">radio_button_unchecked</span>
            已停止
        `;
        statusSpan.className = 'status-stopped px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 flex items-center';
        
        if (grassUpdateIntervals[taskId]) {
            clearInterval(grassUpdateIntervals[taskId]);
            delete grassUpdateIntervals[taskId];
        }
    } else {
        // 重启任务
        const address = taskCard.getAttribute('data-address');
        const privateKey = taskCard.getAttribute('data-private-key');
        const delays = taskCard.getAttribute('data-delays').split('-').map(Number);
        
        window.startClickerTask(taskId, address, privateKey, delays[0], delays[1]);
        toggleBtn.innerHTML = `
            <span class="material-icons text-sm mr-2">stop</span>
            停止
        `;
        toggleBtn.className = 'toggle-btn mui-btn flex-1 px-4 py-2 rounded-md flex items-center justify-center transition-all duration-200 text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
        statusSpan.innerHTML = `
            <span class="material-icons text-sm mr-1">radio_button_checked</span>
            运行中
        `;
        statusSpan.className = 'status-running px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 flex items-center';
        
        startGrassUpdate(taskId);
    }
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
    const taskCard = document.getElementById(taskId);
    const toggleBtn = taskCard.querySelector('.toggle-btn');
    if (toggleBtn.textContent.trim() === '停止') {
        toggleTask(taskId);
    }
}

function clearForm() {
    document.getElementById('mainAddress').value = '';
    document.getElementById('userPrivateKey').value = '';
    document.getElementById('minDelay').value = '1000';
    document.getElementById('maxDelay').value = '2000';
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

// 添加一个新的函数来检查是否是首次访问
function isFirstVisit() {
    if (!localStorage.getItem('hasVisited')) {
        localStorage.setItem('hasVisited', 'true');
        return true;
    }
    return false;
}

// 修改 DOMContentLoaded 事件处理函数
document.addEventListener('DOMContentLoaded', function() {
    // 如果是首次访问，显示使用说明
    if (isFirstVisit()) {
        setTimeout(() => {
            showGuide();
        }, 500); // 延迟500ms显示，让页面完全加载
    }
});

// 使用说明相关函数
function showGuide() {
    const modal = document.getElementById('guideModal');
    const modalContent = modal.querySelector('.bg-white');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // 添加入场动画
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        modalContent.style.transition = 'all 0.3s ease-out';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
}

function hideGuide() {
    const modal = document.getElementById('guideModal');
    const modalContent = modal.querySelector('.bg-white');
    
    // 添加退场动画
    modalContent.style.transition = 'all 0.2s ease-in';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        // 重置样式以便下次显示
        modalContent.style.opacity = '';
        modalContent.style.transform = '';
    }, 200);
}

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
                if (!confirm(`${t('importConfirm', config.tasks.length)}`)) {
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
                let importedCount = 0;
                let errors = [];
                
                for (const task of config.tasks) {
                    try {
                        await createTask(
                            task.address,
                            task.privateKey,
                            task.delays[0],
                            task.delays[1]
                        );
                        importedCount++;
                    } catch (err) {
                        errors.push(err.message);
                    }
                    // 添加延迟以避免并发问题
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                if (importedCount > 0) {
                    if (errors.length > 0) {
                        alert(`${t('importPartialSuccess', importedCount, config.tasks.length)}\n${errors.join('\n')}`);
                    } else {
                        alert(t('importSuccess'));
                    }
                } else {
                    alert(t('importError'));
                }
                
            } catch (error) {
                console.error('导入配置失败:', error);
                alert(t('importError'));
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
} 

function showGuide() {
    const modal = document.getElementById('guideModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideGuide() {
    const modal = document.getElementById('guideModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert(t('codeCopied')); // 需要在 i18n.js 中添加这个翻译
    }).catch(err => {
        console.error('复制失败:', err);
    });
} 