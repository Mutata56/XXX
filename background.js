// Вычисляет время следующего xx:55
function getNext55Time() {
    const now = new Date();
    const next = new Date();
    next.setMinutes(55, 0, 0);
    if (next <= now) next.setHours(now.getHours() + 1);
    return next.getTime();
}

// Создаёт будильник, который будет срабатывать каждый час в xx:55
function scheduleHourly55Alarm() {
    chrome.alarms.create('hourly55', {
        when: getNext55Time(),
        periodInMinutes: 60
    });
	console.log('[BG] Будильник hourly55 установлен');
}

// Запускает syncAllStatuses во вкладке, если найдена подходящая
function launchSync() {
	
    chrome.tabs.query({
        url: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX*"
    }, tabs => {
        if (tabs.length === 0)  {
			console.warn('[BG] Вкладка XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX не найдена, синхронизация пропущена');
			return;
		}
        chrome.scripting.executeScript({
            target: {
                tabId: tabs[0].id
            },
            func: () => window.syncAllStatuses?.()
        });
    });
}

// Установка будильника при установке или обновлении расширения
chrome.runtime.onInstalled.addListener(() => {
    scheduleHourly55Alarm();
});

// Обработка срабатывания будильника
chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'hourly55') {
		if (typeof dashboardSettings !== 'undefined' && !dashboardSettings.isDashboardEnabled()) {
			console.log('[dashboard] Мониторинг отключён');
			return;
		}
        launchSync();
    }
});