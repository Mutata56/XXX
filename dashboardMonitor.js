(function() {
    'use strict';

	if (typeof dashboardSettings !== 'undefined' && !dashboardSettings.isDashboardEnabled()) {
		console.log('[dashboard] Мониторинг отключён пользователем');
		return;
	}

    console.log('[dashboard] старт');
    const TELEGRAM_BOT_TOKEN = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const TELEGRAM_CHAT_ID = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const STORAGE_KEY = '_dashboardTicketState';
    const TELEGRAM_MSG_LIMIT = 4096;

    async function notifyTelegram(message) {
        try {
            if (message.length <= TELEGRAM_MSG_LIMIT) {
                await sendTelegramMessage(message);
            } else {
                const chunks = chunkMessage(message, TELEGRAM_MSG_LIMIT);
                for (const chunk of chunks) {
                    await sendTelegramMessage(chunk);
                }
            }
        } catch (err) {
            console.error('Ошибка отправки в Telegram:', err);
        }
    }

    async function sendTelegramMessage(text) {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
        if (!response.ok) {
            console.error('Telegram error', await response.text());
        }
    }

    function chunkMessage(message, maxLength) {
        const lines = message.split('\n');
        const chunks = [];
        let current = '';

        for (const line of lines) {
            if ((current + '\n' + line).length > maxLength) {
                chunks.push(current);
                current = line;
            } else {
                current += (current ? '\n' : '') + line;
            }
        }

        if (current) chunks.push(current);
        return chunks;
    }

    function getDashboardTickets() {
        const rows = Array.from(document.querySelectorAll('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'));
        const result = {};
        let currentStatus = null;

        for (const row of rows) {
            if (row.classList.contains('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')) {
                const statusText = row.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')?.innerText.trim();
                currentStatus = statusText;
                if (!result[currentStatus]) result[currentStatus] = [];
            } else if (currentStatus) {
                const link = row.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"]');
                const updatedCell = row.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
                if (link && updatedCell) {
                    const url = link.href;
                    const title = row.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')?.innerText.trim() || link.innerText.trim();
                    const updated = updatedCell.innerText.trim();
                    result[currentStatus].push({
                        url,
                        title,
                        updated
                    });
                }
            }
        }

        return result;
    }

    function detectChanges() {
        const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const current = getDashboardTickets();
        const trackedStatuses = ['Новая', 'Новая информация', 'В процессе: В работе', 'Ожидание ответа от клиента'];

        const messages = {
            'Новая': [],
            'Новая информация': [],
            'В процессе: В работе': [],
            'Ожидание ответа от клиента': []
        };

        for (const [status, entries] of Object.entries(current)) {
            if (!trackedStatuses.includes(status)) continue;

            const prevEntries = (previous[status] || []);
            const prevMap = Object.fromEntries(prevEntries.map(x => [x.url, x]));

            for (const entry of entries.slice(0, 20)) {
                const prev = prevMap[entry.url];

                if (status === 'Новая' && !prev) {
                    messages[status].push(`\u2022 <b>${entry.title}</b>\n<code>${entry.url}</code>`);
                } else if (status === 'Новая информация' && (!prev || prev.updated !== entry.updated)) {
                    messages[status].push(`\u2022 <b>${entry.title}</b>\n<code>${entry.url}</code>`);
                } else if ((status === 'В процессе: В работе' || status === 'Ожидание ответа от клиента') && (!prev || prev.updated !== entry.updated)) {
                    messages[status].push(`\u2022 <b>${entry.title}</b>\n<code>${entry.url}</code>`);
                }
            }
        }

        const blocks = [];

        if (messages['Новая'].length > 0) {
            blocks.push('<b>🆕 Новая:</b>\n' + messages['Новая'].join('\n\n'));
        }

        if (messages['Новая информация'].length > 0) {
            blocks.push('<b>📨 Новая информация:</b>\n' + messages['Новая информация'].join('\n\n'));
        }

        if (messages['В процессе: В работе'].length > 0) {
            blocks.push('<b>🔧 В процессе (обновлены):</b>\n' + messages['В процессе: В работе'].join('\n\n'));
        }

        if (messages['Ожидание ответа от клиента'].length > 0) {
            blocks.push('<b>⏳ Ожидание ответа от клиента (обновлены):</b>\n' + messages['Ожидание ответа от клиента'].join('\n\n'));
        }

        if (blocks.length > 0) {
            notifyTelegram('---\n\n' + blocks.join('\n\n'));
        }

        const cleanedCurrent = {};
        for (const status of trackedStatuses) {
            if (current[status]) cleanedCurrent[status] = current[status].slice(0, 20);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedCurrent));
    }


    window.monitorDashboardChanges = function() {
        try {
            detectChanges();
            console.log('Мониторю👁️👁️');
        } catch (e) {
            console.error('Ошибка в monitorDashboardChanges:', e);
        }
    };
    window.addEventListener('load', () => {
        monitorDashboardChanges();
    });
})();