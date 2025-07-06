

(function () {
    'use strict';
    console.log("start");

    const STORAGE_KEY = '_ticketShiftStorage';
    const DARK_MODE_KEY = '_ticketShiftDarkMode';
	let submenu2;
    let previewBox = null;
	let overlayBox = null;
	function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[а]/g, 'a')
        .replace(/[е]/g, 'e')
        .replace(/[о]/g, 'o')
        .replace(/[р]/g, 'p')
        .replace(/[с]/g, 'c')
        .replace(/[у]/g, 'y')
        .replace(/[к]/g, 'k')
        .replace(/[х]/g, 'x')
        .replace(/[в]/g, 'b')
        .replace(/[н]/g, 'h')
        .replace(/[м]/g, 'm')
        .replace(/[т]/g, 't')
        .replace(/[з]/g, '3')
        .replace(/[^a-z0-9]/g, ''); // ← удаление всех символов, кроме латинских букв и цифр
}

	 function showOverlayBox(text) {
        if (overlayBox) overlayBox.remove();

        overlayBox = document.createElement('div');
        overlayBox.className = 'shift-modal';

        const isDark = isDarkMode();

        Object.assign(overlayBox.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '10050'
        });

        const modalContent = document.createElement('div');
        Object.assign(modalContent.style, {
            background: isDark ? '#1f1f1f' : '#fff',
            color: isDark ? '#f1f1f1' : '#000',
            padding: '20px',
            borderRadius: '12px',
            width: '80%',
            maxWidth: '900px',
            maxHeight: '80%',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.6',
            position: 'relative',
            animation: 'fadeIn 0.2s ease-out'
        });

        const header = document.createElement('div');
        header.innerText = '📋 Текущая смена';
        Object.assign(header.style, {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '12px'
        });

        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✖';
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '12px',
            right: '16px',
            border: 'none',
            background: 'transparent',
            color: isDark ? '#aaa' : '#333',
            fontSize: '18px',
            cursor: 'pointer'
        });
        closeBtn.onclick = () => overlayBox.remove();

        const copyBtn = document.createElement('button');
        copyBtn.innerText = '📄 Скопировать';
        Object.assign(copyBtn.style, {
            marginBottom: '12px',
            padding: '6px 12px',
            background: isDark ? '#333' : '#eee',
            border: '1px solid ' + (isDark ? '#555' : '#ccc'),
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            color: isDark ? '#eee' : '#000'
        });
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(text);
                copyBtn.innerText = '✅ Скопировано!';
                setTimeout(() => {
                    copyBtn.innerText = '📄 Скопировать';
                }, 1500);
            } catch (e) {
                alert('Ошибка копирования');
            }
        };

        const content = document.createElement('pre');
        content.innerText = text;
        Object.assign(content.style, {
            whiteSpace: 'pre-wrap',
            userSelect: 'text'
        });

        modalContent.appendChild(header);
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(copyBtn);
        modalContent.appendChild(content);
        overlayBox.appendChild(modalContent);
        document.body.appendChild(overlayBox);
    }


	let menu;
	
	function removeMenu() {
    //	console.log("Вызов метода removeMenu");
        if (menu) menu.remove();
        if (previewBox) previewBox.remove();
        menu = null;
        previewBox = null;
    }

    function getStoredShift() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            "В работе": [], "Ожидание ответа от клиента": [], "Решена": [], "Новая": [], "Нет трудозатрат": [], "Нет причины обращения": []
        };
    }

    function saveStorage(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function isDarkMode() {
        return localStorage.getItem(DARK_MODE_KEY) === 'true';
    }

    function toggleDarkMode(value) {
        localStorage.setItem(DARK_MODE_KEY, value ? 'true' : 'false');
        console.log('Dark mode set to:', value);
    }

    function getCategoryByStatus(status) {
        if (status.includes('В процессе') || status.includes('В работе')) return "В работе";
        if (status.includes('Ожидание')) return "Ожидание ответа от клиента";
        if (status.includes('Решена') || status.includes('Закрыта')) return "Решена";
        if (status.includes('Новая')) return "Новая";
        return null;
    }

    function getVisibleText(el) {
        const clone = el.cloneNode(true);
        clone.style.all = 'unset';
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        document.body.appendChild(clone);
        const text = clone.innerText.trim();
        document.body.removeChild(clone);
        return text;
    }

    function sortCategoryByUrl(entries) {
        return entries.slice().sort((a, b) => a.localeCompare(b));
    }

    function formatShiftText(s) {
        const sortedWork = sortCategoryByUrl(s["В работе"] || []);
        const sortedWait = sortCategoryByUrl(s["Ожидание ответа от клиента"] || []);
        const sortedDone = sortCategoryByUrl(s["Решена"] || []);
        const sortedNew = sortCategoryByUrl(s["Новая"] || []);
        const sortedNoTime = sortCategoryByUrl(s["Нет трудозатрат"] || []);
        const sortedNoReason = sortCategoryByUrl(s["Нет причины обращения"] || []);

        return (
            'Доброе утро! По смене:\n\n' +
            'В работе:\n\n' +
            sortedWork.join('\n') + '\n\n' +
            'Ожидание ответа от клиента:\n\n' +
            sortedWait.join('\n') + '\n\n' +
            'Решена:\n\n' +
            sortedDone.join('\n') + '\n\n' +
            'Новая:\n\n' +
            sortedNew.join('\n') + '\n\n' +
            'Нет трудозатрат:\n\n' +
            sortedNoTime.join('\n') + '\n\n' +
            'Нет причины обращения:\n\n' +
            sortedNoReason.join('\n')
        );
    }

    function createHintBox(anchorElement, message) {
        previewBox?.remove();

        const rect = anchorElement.getBoundingClientRect();

        previewBox = document.createElement('pre');
        Object.assign(previewBox.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.right + 10}px`,
            padding: '10px',
            maxWidth: '400px',
            fontSize: '12px',
            zIndex: 10001,
            fontFamily: 'monospace',
            background: isDarkMode() ? '#2b2b2b' : '#f9f9f9',
            color: isDarkMode() ? '#f1f1f1' : '#000',
            border: isDarkMode() ? '1px solid #555' : '1px solid #ccc'
        });

        previewBox.textContent = message;
        document.body.appendChild(previewBox);
    }
	
	function createPreviewBox(anchorEl, fullText, highlightLine, highlightStyle) {
    if (previewBox) previewBox.remove();
    previewBox = document.createElement('pre');
    previewBox.className = 'ticket-preview';

    if (!highlightStyle) {
        highlightStyle = isDarkMode() ? '#444b2c' : '#ffeeba';
    }

    // Координаты от DOM-элемента
    const rect = anchorEl.getBoundingClientRect();
    const top = rect.top;
    const left = rect.right + 10;

    Object.assign(previewBox.style, {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        padding: '10px',
        maxWidth: '600px',
        maxHeight: '400px',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
        zIndex: 10001,
        fontFamily: 'monospace',
        background: isDarkMode() ? '#2b2b2b' : '#f9f9f9',
        color: isDarkMode() ? '#f1f1f1' : '#000',
        border: isDarkMode() ? '1px solid #555' : '1px solid #ccc'
    });

    const lines = fullText.split('\n').map(l => {
        const isHighlight = l === highlightLine;
        const safeLine = l.trim() === '' ? '&nbsp;' : l;
        return `<div style="${isHighlight ? `background: ${highlightStyle}; padding: 2px; font-weight: bold;` : ''}">${safeLine}</div>`;
    }).join('');

    previewBox.innerHTML = lines;
    document.body.appendChild(previewBox);
}
	
    function getIssueIdsFromDOM() {
        const h3s = Array.from(document.querySelectorAll('#activity h3'));
        const relevantH3s = h3s.slice(0, 2);
        let issueIds = [];

        relevantH3s.forEach(h3 => {
            let next = h3.nextElementSibling;
            if (next && next.tagName === 'DL') {
                const links = next.querySelectorAll('dt > a[href*="/issues/"]');
                links.forEach(a => {
                    if (!a.textContent.includes('Алерт')) {
                        const match = a.href.match(/\/issues\/(\d+)/);
                        if (match) issueIds.push(match[1]);
                    }
                });
            }
        });

        return [...new Set(issueIds)];
    }

	async function fetchIssuesToShift(issueIds, shiftBase) {
        const newShift = JSON.parse(JSON.stringify(shiftBase));
		["В работе", "Ожидание ответа от клиента", "Решена", "Новая", "Нет трудозатрат", "Нет причины обращения"].forEach(k => {
    if (!newShift[k]) newShift[k] = [];
});

const existingIds = new Set();
    Object.values(newShift).forEach(arr => {
        arr.forEach(line => {
            const match = line.match(/\/issues\/(\d+)/);
            if (match) existingIds.add(match[1]);
        });
    });

        for (const id of issueIds) {
			console.log(`📡 Fetching /issues/${id}...`);
            try {
				if (existingIds.has(id)) {
					console.log(`⏩ Пропуск ID ${id}, уже в смене`);
					continue;
				}
                const res = await fetch(`/issues/${id}`);
                if (!res.ok) continue;

                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');

                const statusElement = [...doc.querySelectorAll('#content .status.attribute .value')].pop();
                if (!statusElement) continue;
                const status = statusElement.innerText.trim();
                const category = getCategoryByStatus(status);

                const clientElement = doc.querySelector('span.current-project');
                const clientName = getVisibleText(clientElement);

                const subjectElement = doc.querySelector('.subject h3');
                const cloned = subjectElement.cloneNode(true);
                cloned.querySelectorAll('span').forEach(span => span.remove());
                const subject = cloned.textContent.trim();

                const url = location.origin + `/issues/${id}`;
                const line = `${url} – ${clientName}: ${subject}`;
				
			const bannedPatterns = ['НS','HS','Alert','alert', 'healthscript', 'Lamoda','lamoda','регламентные работы','Регламентные работы'];
			const shouldSkip = bannedPatterns.some(p => 
			{return line.includes(p);}
			);	
			
			if (shouldSkip) continue;
                const reasonElement = doc.querySelector('.cf_109.attribute .value');
                const hasReason = reasonElement && reasonElement.textContent.trim() !== '';

                const hasTime = !!doc.querySelector('#tab-time_entries');

                if (!hasReason) {
                    newShift["Нет причины обращения"].push(line);
                } else if (!hasTime) {
                    newShift["Нет трудозатрат"].push(line);
                } else if (category) {
                    newShift[category].push(line);
                }
            } catch (err) {
				console.warn(`⚠️ /issues/${id} failed`);
                console.error('Ошибка при fetch issue', id, err);
            }
			console.log(`✅ /issues/${id} is processed`);
			await sleep(3000);
        }

        return newShift;
    }


    function createContextMenu(x, y) {
        removeMenu();
        const current = getStoredShift();
 
        menu = document.createElement('div');
        menu.classList.add('ticket-menu');
		// Настройки тёмной темы - не трогать!!!
		menu.classList.add(isDarkMode() ? 'dark-theme' : 'light-theme');
        Object.assign(menu.style, {
            top: `${y}px`,
            left: `${x}px`
        });
		
        const darkToggle = document.createElement('label');
        darkToggle.style.display = 'block';
        darkToggle.style.margin = '4px';
        darkToggle.style.cursor = 'pointer';
        darkToggle.innerHTML = `
		<input id="sysIdKKRLL56" type="checkbox" ${isDarkMode() ? 'checked' : ''} style="margin-right: 6px;" />
    🌙Тёмный режим
`;
		menu.appendChild(darkToggle);
        const checkbox = darkToggle.querySelector('#sysIdKKRLL56');
		checkbox.onclick = (e) => {
			e.preventDefault();
			toggleDarkMode(e.target.checked);
			if (e.target.checked) {
				menu.classList.remove('light-theme');
				menu.classList.add('dark-theme');
			} else {
				menu.classList.remove('dark-theme');
				menu.classList.add('light-theme');
			}
		};
        
		//  Не трогать
        function previewWithTempChange(modifyFn, highlightLine, color) {
			const previewData = JSON.parse(JSON.stringify(current));
			modifyFn(previewData);
			const previewText = formatShiftText(previewData);
			
			// если color не передан — установить по теме
			const effectiveColor = color ?? (isDarkMode() ? '#444b2c' : '#ffeeba');

			createPreviewBox(submenu2, previewText, highlightLine, effectiveColor);
		}
		// Не трогать
		const makeSubBtn = (temp,label, url, actionFn,actionHover,actionHoverLeave) => {
				const btn = document.createElement('button');
				btn.innerText = label;
				btn.onclick = () => {
					actionFn?.(); // вызывается кастомная логика, если передана
					temp?.remove();
					previewBox?.remove();
					removeMenu();
				};
				btn.onmouseenter = () => {
					actionHover?.();
				}
				btn.onmouseleave = () => {
					actionHoverLeave?.();
				}
				return btn;
		};


const workBtn = document.createElement('button');
workBtn.innerText = '👷️ Смена';
let submenu2Timeout = null;
// Удаление подменю с задержкой
function removeSubmenu2WithDelay() {
    submenu2Timeout = setTimeout(() => {
        submenu2?.remove();
        submenu2 = null;
    }, 200);
}
// Отмена удаления, если курсор снова навёлся
function cancelSubmenu2Removal() {
    if (submenu2Timeout) {
        clearTimeout(submenu2Timeout);
        submenu2Timeout = null;
    }
}

workBtn.onclick = () => {}; // ничего при клике
workBtn.onmouseleave = removeSubmenu2WithDelay;
workBtn.onmouseenter = () => {

   

    cancelSubmenu2Removal();
    if (submenu2) submenu2.remove();

    // Получаем позицию кнопки на экране
    const rect = workBtn.getBoundingClientRect();

    submenu2 = document.createElement('div');
    submenu2.className = 'ticket-menu';
    submenu2.classList.add(isDarkMode() ? 'dark-theme' : 'light-theme');

     Object.assign(submenu2.style, {
        position: 'fixed',
        top: `${rect.top}px`,              // по вертикали совпадает
        left: `${rect.right + 10}px`,      // появляется справа от кнопки
        zIndex: 10002,
        padding: '4px'
    });

    let syncCooldown = false;
	
	const viewTemp = makeSubBtn(submenu2, '👁️ Просмотр смены', '', async () => {
                submenu2?.remove();
                previewBox?.remove();
                removeMenu();
                showOverlayBox(formatShiftText(current));
            }, async () => {}, async () => {
                previewBox?.remove();
            });

            viewTemp.onmouseenter = () => {
                createPreviewBox(submenu2, formatShiftText(current), 'NOTHING TO HIGHLIGHT');
            };

            submenu2.appendChild(viewTemp);
	
	const exportView = makeSubBtn(submenu2,'📄 Экспорт смены','',async () => {
		const text = formatShiftText(current);
            const blob = new Blob([text], { type: 'text/plain' });
            const urlBlob = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            a.href = urlBlob;
            a.download = `смена_${date}.txt`;
            a.click();
            URL.revokeObjectURL(urlBlob);
             submenu2?.remove();
            previewBox?.remove();
            removeMenu();
	}, async () => {},async() => {previewBox?.remove();});
	
	exportView.onmouseenter = () => {createHintBox(exportView, 'Скачать .txt файл со сменой');};
	
	submenu2.appendChild(exportView);
	
	const clearTemp = makeSubBtn(submenu2,'🗑️ Очистить смену','',async () => {
			submenu2?.remove();
            previewBox?.remove();
            removeMenu();
			clearStorage();
	}, async () => {},async() => {previewBox?.remove();});
	clearTemp.onmouseenter = () => {createHintBox(clearTemp, 'Очистить всё содержимое смены');};
	submenu2.appendChild(clearTemp);
	
	submenu2.onmouseenter = cancelSubmenu2Removal;
    submenu2.onmouseleave = removeSubmenu2WithDelay;

	const addAllBtn = makeSubBtn(submenu2, '🔁 Добавить все задачи за смену', '', async () => {
			
			await syncAllStatuses?.();
            const shift = getStoredShift();
            const issueIds = getIssueIdsFromDOM();
            const updated = await fetchIssuesToShift(issueIds, shift);
            saveStorage(updated);
            alert('Все задачи добавлены в смену.');
}, async () => {
    createHintBox(addAllBtn, 'Добавить все кроме алертов, синхронизация)');
}, async () => {
    previewBox?.remove();
});
const addAllBtnWithoutSync = makeSubBtn(submenu2, '🔁 Добавить все задачи за смену (без синх.)', '', async () => {
			
			
            const shift = getStoredShift();
            const issueIds = getIssueIdsFromDOM();
            const updated = await fetchIssuesToShift(issueIds, shift);
            saveStorage(updated);
            alert('Все задачи добавлены в смену.');
}, async () => {
    createHintBox(addAllBtnWithoutSync, 'Добавить все кроме алертов, без синхронизации)');
}, async () => {
    previewBox?.remove();
});


submenu2.appendChild(addAllBtn);
submenu2.appendChild(addAllBtnWithoutSync);

    document.body.appendChild(submenu2);
};






menu.appendChild(workBtn)

        document.body.appendChild(menu);
        setTimeout(() => {
            window.addEventListener('click', removeMenu, { once: true });
        });
    }

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        createContextMenu(e.clientX, e.clientY);
    });

    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            console.log('Смена обновлена в другой вкладке');
        }
    });

    
	


})();