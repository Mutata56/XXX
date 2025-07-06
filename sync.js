// ФУНКЦИЯ, КОТОРУЮ МЫ ПОДКЛЮЧАЕМ ГЛОБАЛЬНО
async function syncAllStatuses() {
    const current = getStoredShift();
    const updated = {
        "В работе": [],
        "Ожидание ответа от клиента": [],
        "Решена": [],
        "Новая": []
    };

    const entries = Object.entries(current).flatMap(([status, items]) =>
        items.map(urlText => ({
            status,
            urlText
        }))
    );

    console.log(`🔄 Начинаю синхронизацию ${entries.length} тикетов`);

    let i = 0;
    for (const {
            urlText
        }
        of entries) {
        const [url] = urlText.split(' – ');
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`⚠️ Неуспешный ответ ${res.status} для ${url}`);
                continue;
            }

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const statusEl = doc.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
            if (!statusEl) {
                console.warn(`⚠️ Статус не найден для ${url}`);
                continue;
            }

            const actualStatus = statusEl.innerText.trim();
            let cat = getCategoryByStatus(actualStatus);
            if (!cat) {
                console.warn(`⚠️ Неизвестный статус '${actualStatus}' для ${url}`);
                continue;
            }

            updated[cat].push(urlText);
            console.log(`✅ [${++i}/${entries.length}] ${cat} ← ${url}`);

        } catch (err) {
            console.error(`❌ Ошибка при обработке ${url}:`, err);
        }

        await sleep(1000);
    }

    saveStorage(updated);
    console.log('✔️ Смена обновлена по актуальным статусам');
}

// Делаем функцию глобальной, чтобы background.js мог её вызвать
window.syncAllStatuses = syncAllStatuses;