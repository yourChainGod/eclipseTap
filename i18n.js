const i18n = {
    'zh-CN': {
        langName: '中文',
        title: '全自动养牛场',
        guide: '使用说明',
        export: '导出配置',
        import: '导入配置',
        opensource: '开源',
        switchLang: '切换语言',
        addTask: '添加新任务',
        newTask: '新建任务',
        editTask: '编辑任务',
        running: '运行中',
        stopped: '已停止',
        stop: '停止',
        start: '开始',
        edit: '编辑',
        cancel: '取消',
        confirm: '确定',
        mainAddress: '主账号地址',
        mainAddressDesc: '填写你的 BackPack 钱包地址',
        privateKey: '用户私钥',
        privateKeyDesc: '游戏私钥，不是 BackPack 私钥',
        minDelay: '最小延迟 (ms)',
        maxDelay: '最大延迟 (ms)',
        delayDesc: '建议 {0}ms',
        grassAmount: '草的数量',
        task: '任务',
        delay: '延迟',
        address: '地址',
        importConfirm: '确认导入 {0} 个任务配置？',
        importSuccess: '任务导入完成！',
        importError: '导入配置失败，请检查文件格式是否正确！',
        fillAll: '请填写完整信息',
        guideTitle: {
            mainAddress: '主账号地址',
            delay: '延迟设置',
            privateKey: '用户私钥获取方法',
            notice: '注意事项'
        },
        guideContent: {
            mainAddressDesc: '填写你的 BackPack 钱包地址',
            delayDesc: '建议最小延迟 1000ms，最大延迟 2000ms',
            privateKeyWarn: '用户私钥不是你backpack的私钥，是游戏私钥',
            privateKeySteps: [
                '打开 Chrome 开发者工具（F12）',
                '在控制台输入代码：',
                '复制输出的私钥'
            ],
            noticeDesc: '所有操作均在本地执行，关闭浏览器后任务将停止'
        },
        adText: '号多多 | 推特低至1毛5 | hdd.cm',
        codeCopied: '代码已复制到剪贴板',
        importPartialSuccess: '成功导入 {0}/{1} 个任务\n失败原因:',
    },
    'en-US': {
        langName: 'English',
        title: 'Auto Farming Bot',
        guide: 'Guide',
        export: 'Export',
        import: 'Import',
        opensource: 'Open Source',
        switchLang: 'Switch Language',
        addTask: 'Add New Task',
        newTask: 'New Task',
        editTask: 'Edit Task',
        running: 'Running',
        stopped: 'Stopped',
        stop: 'Stop',
        start: 'Start',
        edit: 'Edit',
        cancel: 'Cancel',
        confirm: 'Confirm',
        mainAddress: 'Main Address',
        mainAddressDesc: 'Enter your BackPack wallet address',
        privateKey: 'User Private Key',
        privateKeyDesc: 'Game private key, not BackPack private key',
        minDelay: 'Min Delay (ms)',
        maxDelay: 'Max Delay (ms)',
        delayDesc: 'Recommend {0}ms',
        grassAmount: 'Grass Amount',
        task: 'Task',
        delay: 'Delay',
        address: 'Address',
        importConfirm: 'Confirm import {0} tasks?',
        importSuccess: 'Tasks imported successfully!',
        importError: 'Import failed, please check the file format!',
        fillAll: 'Please fill in all fields',
        guideTitle: {
            mainAddress: 'Main Address',
            delay: 'Delay Settings',
            privateKey: 'How to Get Private Key',
            notice: 'Notice'
        },
        guideContent: {
            mainAddressDesc: 'Enter your BackPack wallet address',
            delayDesc: 'Recommend min delay 1000ms, max delay 2000ms',
            privateKeyWarn: 'User private key is NOT your BackPack private key',
            privateKeySteps: [
                'Open Chrome DevTools (F12)',
                'Enter the code in console:',
                'Copy the output private key'
            ],
            noticeDesc: 'All operations are executed locally, tasks will stop when browser is closed'
        },
        adText: 'HDD.cm | Twitter Account From $0.015',
        codeCopied: 'Code copied to clipboard',
        importPartialSuccess: 'Successfully imported {0}/{1} tasks\nFailure reasons:',
    },
    'ru-RU': {
        langName: 'Русский',
        title: 'Авто Фермер',
        guide: 'Руководство',
        export: 'Экспорт',
        import: 'Импорт',
        opensource: 'Открытый код',
        switchLang: 'Сменить язык',
        addTask: 'Добавить задачу',
        newTask: 'Новая задача',
        editTask: 'Изменить задачу',
        running: 'Работает',
        stopped: 'Остановлено',
        stop: 'Стоп',
        start: 'Старт',
        edit: 'Изменить',
        cancel: 'Отмена',
        confirm: 'Подтвердить',
        mainAddress: 'Основной адрес',
        mainAddressDesc: 'Введите адрес вашего кошелька BackPack',
        privateKey: 'Приватный ключ',
        privateKeyDesc: 'Ключ игры, не ключ BackPack',
        minDelay: 'Мин. задержка (мс)',
        maxDelay: 'Макс. задержка (мс)',
        delayDesc: 'Рекомендуется {0}мс',
        grassAmount: 'Количество травы',
        task: 'Задача',
        delay: 'Задержка',
        address: 'Адрес',
        importConfirm: 'Подтвердить импорт {0} задач?',
        importSuccess: 'Задачи успешно импортированы!',
        importError: 'Ошибка импорта, проверьте формат файла!',
        fillAll: 'Заполните все поля',
        guideTitle: {
            mainAddress: 'Основной адрес',
            delay: 'Настройки задержки',
            privateKey: 'Как получить приватный ключ',
            notice: 'Примечание'
        },
        guideContent: {
            mainAddressDesc: 'Введите адрес вашего кошелька BackPack',
            delayDesc: 'Рекомендуется мин. задержка 1000мс, макс. задержка 2000мс',
            privateKeyWarn: 'Приватный ключ НЕ является ключом BackPack',
            privateKeySteps: [
                'Откройте инструменты разработчика Chrome (F12)',
                'Введите код в консоль:',
                'Скопируйте полученный ключ'
            ],
            noticeDesc: 'Все операции выполняются локально, задачи остановятся при закрытии браузера'
        },
        adText: 'HDD.cm | Аккаунты Twitter от $0.015',
        codeCopied: 'Код скопирован в буфер обмена',
        importPartialSuccess: 'Успешно импортировано {0}/{1} задач\nПричины ошибок:',
    }
};

// 当前语言
let currentLang = localStorage.getItem('lang') || 'zh-CN';

// 获取翻译文本
function t(key, ...args) {
    let text = key.split('.').reduce((obj, k) => obj && obj[k], i18n[currentLang]) || key;
    return args.reduce((str, arg, i) => str.replace(`{${i}}`, arg), text);
}

// 切换语言
function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updatePageText();
    updateLanguageButtons();
    // 触发自定义事件，通知其他需要更新的组件
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// 更新页面文本
function updatePageText() {
    // 更新页面标题
    document.getElementById('pageTitle').textContent = t('title') + '🐂';

    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        // 检查是否有占位符参数
        const args = el.getAttribute('data-i18n-args');
        if (args) {
            el.textContent = t(key, ...args.split(','));
        } else {
            el.textContent = t(key);
        }
        
        // 更新 placeholder 属性（如果存在）
        if (el.hasAttribute('placeholder')) {
            el.placeholder = t(key);
        }
        
        // 更新 title 属性（如果存在）
        if (el.hasAttribute('title')) {
            el.title = t(key);
        }
    });

    // 更新动态创建的内容
    updateDynamicContent();
}

// 更新动态创建的内容
function updateDynamicContent() {
    // 更新任务卡片
    document.querySelectorAll('[id^="task-"]').forEach(card => {
        const statusSpan = card.querySelector('.status-running, .status-stopped');
        const toggleBtn = card.querySelector('.toggle-btn');
        const addressText = card.querySelector('.address-text');
        const delayText = card.querySelector('.delay-text');
        const grassText = card.querySelector('.grass-text');
        const editText = card.querySelector('.edit-text');
        const taskText = card.querySelector('.task-text');
        
        if (statusSpan) {
            const isRunning = statusSpan.classList.contains('status-running');
            statusSpan.innerHTML = `
                <span class="material-icons text-sm mr-1">
                    ${isRunning ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
                ${t(isRunning ? 'running' : 'stopped')}
            `;
        }
        
        if (toggleBtn) {
            const isRunning = toggleBtn.innerHTML.includes('stop');
            toggleBtn.innerHTML = `
                <span class="material-icons text-sm mr-2">
                    ${isRunning ? 'stop' : 'play_arrow'}
                </span>
                ${t(isRunning ? 'stop' : 'start')}
            `;
        }
        
        if (addressText) {
            const address = card.getAttribute('data-address');
            addressText.textContent = `${t('address')}: ${address.slice(0, 6)}...${address.slice(-4)}`;
        }
        
        if (delayText) {
            const delays = card.getAttribute('data-delays').split('-');
            delayText.textContent = `${t('delay')}: ${delays[0]}-${delays[1]}ms`;
        }
        
        if (grassText) {
            grassText.textContent = `${t('grassAmount')}:`;
        }
        
        if (taskText) {
            taskText.textContent = t('task');
        }
        
        if (editText) {
            editText.textContent = t('edit');
        }
    });
}

// 初始化语言设置
document.addEventListener('DOMContentLoaded', () => {
    // 更新语言切换按钮状态
    updateLanguageButtons();
    // 初始化页面文本
    updatePageText();
});

// 更新语言切换按钮状态
function updateLanguageButtons() {
    document.querySelectorAll('.language-switcher').forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        if (lang === currentLang) {
            btn.classList.add('bg-blue-500', 'text-white');
            btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
        } else {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('text-gray-600', 'hover:bg-gray-100');
        }
    });
}

// 导出需要的函数和变量
window.t = t;
window.switchLang = switchLang;
window.updatePageText = updatePageText;
window.currentLang = currentLang; 