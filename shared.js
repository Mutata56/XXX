const DASHBOARD_ENABLED_KEY = '_ticketDashboardEnabled';
    const AUTO_SYNC_ENABLED_KEY = '_ticketAutoSyncEnabled';

    function isDashboardEnabled() {
        return localStorage.getItem(DASHBOARD_ENABLED_KEY) !== 'false';
    }

    function setDashboardEnabled(flag) {
        localStorage.setItem(DASHBOARD_ENABLED_KEY, flag ? 'true' : 'false');
    }

    function isAutoSyncEnabled() {
        return localStorage.getItem(AUTO_SYNC_ENABLED_KEY) !== 'false';
    }

    function setAutoSyncEnabled(flag) {
        localStorage.setItem(AUTO_SYNC_ENABLED_KEY, flag ? 'true' : 'false');
    }

    // Экспорт в глобальный scope
    window.dashboardSettings = {
        isDashboardEnabled,
        setDashboardEnabled,
        isAutoSyncEnabled,
        setAutoSyncEnabled
    };

const DARK_MODE_KEY = '_ticketShiftDarkMode';

function getStoredShift() {
    return JSON.parse(localStorage.getItem('_ticketShiftStorage')) || {
        "В работе": [],
        "Ожидание ответа от клиента": [],
        "Решена": [],
        "Новая": []
    };
}

function saveStorage(data) {
    localStorage.setItem('_ticketShiftStorage', JSON.stringify(data));
}

function getCategoryByStatus(status) {
    if (status.includes('В процессе') || status.includes('В работе')) return "В работе";
    if (status.includes('Ожидание')) return "Ожидание ответа от клиента";
    if (status.includes('Решена') || status.includes('Закрыта')) return "Решена";
    if (status.includes('Новая')) return "Новая";
    return null;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearStorage() {
    //	console.log("Вызов метода clearStorage");
    saveStorage({
        "В работе": [],
        "Ожидание ответа от клиента": [],
        "Решена": [],
        "Новая": []
    });
    alert('Смена очищена');
}

function addSqlCopyButtons() {
    const codeBlocks = document.querySelectorAll('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

    codeBlocks.forEach(code => {
        const pre = code.closest('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
        if (!pre || pre.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')) return;

        const btn = document.createElement('button');
        btn.className = 'sql-copy-btn';
        btn.textContent = '📋';
        btn.title = 'Скопировать SQL';

        btn.onclick = () => {
            const text = code.innerText;
            navigator.clipboard.writeText(text).then(() => {
                btn.textContent = '✅';
                setTimeout(() => {
                    btn.textContent = '📋';
                }, 1500);
            });
        };

        pre.appendChild(btn); // ⬅️ ВАЖНО: внутрь <pre>
    });
}

addSqlCopyButtons();
setInterval(addSqlCopyButtons, 1500);

document.querySelectorAll('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX').forEach(pre => {
    const btn = pre.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    if (!btn) return;

    pre.addEventListener('scroll', () => {
        btn.style.right = `${4 - pre.scrollLeft}px`;
    });
});

 function isDarkMode() {
        //console.log("Вызов метода isDarkMode")
        return localStorage.getItem(DARK_MODE_KEY) === 'true';
    }

    function toggleDarkMode(value) {
        //	console.log("Вызов метода toggleDarkMode")
        localStorage.setItem(DARK_MODE_KEY, value ? 'true' : 'false');
        console.log('Dark mode set to:', value);
    }


	
	function sortCategoryByUrl(entries) {
        //console.log("Вызов метода sortCategoryByUrl");
        return entries.slice().sort((a, b) => a.localeCompare(b));
    }
	 function formatShiftText(s) {
        //	console.log("Вызов метода formatShiftText");
        const sortedWork = sortCategoryByUrl(s["В работе"]);
        const sortedWait = sortCategoryByUrl(s["Ожидание ответа от клиента"]);
        const sortedDone = sortCategoryByUrl(s["Решена"]);
        const sortedNew = sortCategoryByUrl(s["Новая"]);
        return (
            'Доброе утро! По смене:\n\n' +
            'В работе:\n\n' +
            sortedWork.join('\n') + '\n\n' +
            'Ожидание ответа от клиента:\n\n' +
            sortedWait.join('\n') + '\n\n' +
            'Решена:\n\n' +
            sortedDone.join('\n') + '\n\n' +
            'Новая:\n\n' +
            sortedNew.join('\n')
        );
    }