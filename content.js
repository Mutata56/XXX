(function() {
    'use strict';
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX -> Content.js запущен - отвечает за контекстное меню");

    const STORAGE_KEY = '_ticketShiftStorage';
    let submenu2;
    let overlayBox = null;

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

    function getVisibleText(el) {
        //	console.log("Вызов метода getVisibleText");
        const clone = el.cloneNode(true);
        clone.style.all = 'unset';
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        document.body.appendChild(clone);
        const text = clone.innerText.trim();
        document.body.removeChild(clone);
        return text;
    }

    const clientElement = document.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
    const statusElement = [...document.querySelectorAll('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')].pop();
    const subjectElement = document.querySelector('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

    if (!clientElement || !subjectElement || !statusElement) {
        console.warn('⚠️ Один из обязательных элементов не найден');
        return;
    }

    const cloned = subjectElement.cloneNode(true);
    cloned.querySelectorAll('span').forEach(span => span.remove());
    const subject = cloned.textContent.trim();

    const clientName = getVisibleText(clientElement);
    const status = statusElement.innerText.trim();
    const url = location.origin + location.pathname;
    const line = `${url} – ${clientName}: ${subject}`;

    let menu = null;
    let previewBox = null;




    function removeMenu() {
        //	console.log("Вызов метода removeMenu");
        if (menu) menu.remove();
        if (previewBox) previewBox.remove();
        menu = null;
        previewBox = null;
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

    function createContextMenu(x, y) {
        //	console.log("Вызов метода createContextMenu");
        removeMenu();
        const current = getStoredShift();
        const exists = Object.values(current).flat().some(item => item.startsWith(url));

        menu = document.createElement('div');
        menu.classList.add('ticket-menu');
        menu.classList.add(isDarkMode() ? 'dark-theme' : 'light-theme');

        Object.assign(menu.style, {
            top: `${y}px`,
            left: `${x}px`
        });

        const darkToggle = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.id = 'sysIdKKRLL56';
        checkbox.type = 'checkbox';
        checkbox.checked = isDarkMode();
        checkbox.style.marginRight = '6px';
        darkToggle.appendChild(checkbox);
        darkToggle.appendChild(document.createTextNode('🌙Тёмный режим'));
        darkToggle.style.display = 'block';
        darkToggle.style.margin = '4px';
        darkToggle.style.cursor = 'pointer';
        menu.appendChild(darkToggle);

        checkbox.onclick = (e) => {
            e.preventDefault();
            toggleDarkMode(e.target.checked);

            if (!menu) return; // <- предотвращаем ошибку

            if (e.target.checked) {
                menu.classList.remove('light-theme');
                menu.classList.add('dark-theme');
            } else {
                menu.classList.remove('dark-theme');
                menu.classList.add('light-theme');
            }
        };


        function previewWithTempChange(modifyFn, highlightLine, color) {
            const previewData = JSON.parse(JSON.stringify(current));
            modifyFn(previewData);
            const previewText = formatShiftText(previewData);

            // если color не передан — установить по теме
            const effectiveColor = color ?? (isDarkMode() ? '#444b2c' : '#ffeeba');

            createPreviewBox(submenu2, previewText, highlightLine, effectiveColor);
        }




        const connectBtn = document.createElement('button');
        connectBtn.classList.add('custom-button');
        connectBtn.innerText = '🔌 HS';

        let submenu = null;
        let submenuTimeout = null;

        // Удаление подменю с задержкой
        function removeSubmenuWithDelay() {
            submenuTimeout = setTimeout(() => {
                submenu?.remove();
                submenu = null;
            }, 200);
        }

        // Отмена удаления, если курсор снова навёлся
        function cancelSubmenuRemoval() {
            if (submenuTimeout) {
                clearTimeout(submenuTimeout);
                submenuTimeout = null;
            }
        }

        const makeSubBtn = (temp, label, url, actionFn, actionHover, actionHoverLeave) => {
            const btn = document.createElement('button');
            btn.innerText = label;

            btn.classList.add('custom-button');

            btn.onclick = () => {
                actionFn?.();
                temp?.remove();
                previewBox?.remove();
                removeMenu();
            };

            btn.onmouseenter = () => {
                actionHover?.();
            };

            btn.onmouseleave = () => {
                actionHoverLeave?.();
            };

            return btn;
        };

        connectBtn.onmouseenter = () => {
            submenu1?.remove();
            submenu1 = null;


            cancelSubmenuRemoval();
            if (submenu) submenu.remove();

            // Получаем позицию кнопки на экране
            const rect = connectBtn.getBoundingClientRect();

            submenu = document.createElement('div');
            submenu.className = 'ticket-menu';
            submenu.classList.add(isDarkMode() ? 'dark-theme' : 'light-theme');

            Object.assign(submenu.style, {
                position: 'fixed',
                top: `${rect.top}px`, // по вертикали совпадает
                left: `${rect.right + 10}px`, // появляется справа от кнопки
                zIndex: 10002,
                padding: '4px'
            });



            submenu.appendChild(makeSubBtn(submenu, '🟢 Ева', '', async () => {
                try {
                    const res = await fetch('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
                    if (!res.ok) {
                        alert(`Ошибка загрузки страницы: ${res.status}`);
                        return;
                    }

                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const pre = doc.querySelector('pre');
                    if (!pre) {
                        alert('Элемент <pre> не найден');
                        return;
                    }

                    const text = pre.innerText.trim();

                    // Скопировать в буфер обмена
                    await navigator.clipboard.writeText(text);
                    alert('Текст скрипта скопирован в буфер обмена!');
                } catch (err) {
                    alert('Ошибка при получении скрипта: ' + err.message);
                }
            }));
            submenu.appendChild(makeSubBtn(submenu, '⚡ Молния', '', async () => {
                try {
                    const res = await fetch('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
                    if (!res.ok) {
                        alert(`Ошибка загрузки страницы: ${res.status}`);
                        return;
                    }

                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');

                    const codeEl = doc.querySelector('pre > code.sql.syntaxhl');
                    if (!codeEl) {
                        alert('Элемент <code> внутри <pre> не найден');
                        return;
                    }

                    const text = codeEl.innerText.trim();

                    await navigator.clipboard.writeText(text);
                    alert('⚡ Молния: текст скопирован в буфер обмена!');
                } catch (err) {
                    alert('Ошибка при получении скрипта Молнии: ' + err.message);
                }
            }));
            submenu.appendChild(makeSubBtn(submenu, '🔧 Остальные', '', async () => {
                try {
                    const res = await fetch('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
                    if (!res.ok) {
                        alert(`Ошибка загрузки страницы: ${res.status}`);
                        return;
                    }

                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const preEl = doc.querySelector('pre');
                    if (!preEl) {
                        alert('Элемент <pre> не найден');
                        return;
                    }

                    const text = preEl.innerText.trim();
                    await navigator.clipboard.writeText(text);
                    alert('🔧 Остальные: текст скопирован в буфер обмена!');
                } catch (err) {
                    alert('Ошибка при получении скрипта Остальные: ' + err.message);
                }
            }));
            submenu.appendChild(makeSubBtn(submenu, '🤦‍♂️ Правка Евы', '', async () => {

                window.open('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '_blank');
            }));

            submenu.onmouseenter = cancelSubmenuRemoval;
            submenu.onmouseleave = removeSubmenuWithDelay;

            document.body.appendChild(submenu);
        };

        connectBtn.onmouseleave = removeSubmenuWithDelay;
        connectBtn.onclick = () => {
            submenu?.remove(); // <-- закрываем подменю
            submenu = null;
            window.open('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', '_blank');
        };




        const dboBtn = document.createElement('button');
        dboBtn.classList.add('custom-button');
        dboBtn.innerText = '🗄️ DBA';

        let submenu1 = null;

        dboBtn.onclick = () => {}; // ничего при клике

        dboBtn.onmouseenter = () => {
            submenu?.remove();
            submenu = null;

            previewBox?.remove();

            if (submenu1) submenu1.remove();

            const rect = dboBtn.getBoundingClientRect();

            submenu1 = document.createElement('div');
            submenu1.className = 'ticket-menu';
            submenu1.classList.add(isDarkMode() ? 'dark-theme' : 'light-theme');

            Object.assign(submenu1.style, {
                position: 'fixed',
                top: `${rect.top}px`,
                left: `${rect.right + 10}px`,
                zIndex: 10002,
                padding: '4px'
            });

            // --- Кнопка "Графана"
            const grafanaBtn = document.createElement('button');
            grafanaBtn.innerText = '📊 Графана';
            grafanaBtn.onmouseenter = () => createHintBox(grafanaBtn, 'переход на графану');
            grafanaBtn.onmouseleave = () => previewBox?.remove();
            grafanaBtn.onclick = () => {
                window.open('http://192.168.89.10/', '_blank');
                submenu1?.remove();
                previewBox?.remove();
                removeMenu();
            };
            submenu1.appendChild(grafanaBtn);

            // --- Кнопка "Запрос для LOCK"
            const lockBtn = document.createElement('button');
            lockBtn.innerText = '🔐 Запрос для LOCK';
            lockBtn.onmouseenter = () => createHintBox(lockBtn, 'скопировать в буфер');
            lockBtn.onmouseleave = () => previewBox?.remove();
            lockBtn.onclick = () => {
                const sqlText = `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`;

                navigator.clipboard.writeText(sqlText).then(() => {
                    alert('Запрос скопирован в буфер');
                    submenu1?.remove();
                    previewBox?.remove();
                    removeMenu();
                });
            };
            submenu1.appendChild(lockBtn);

            // закроется только если курсор ушёл и с кнопки, и с подменю
            submenu1.onmouseenter = () => clearTimeout(closeTimer);
            submenu1.onmouseleave = () => delayedClose();

            document.body.appendChild(submenu1);
        };

        let closeTimer;
        dboBtn.onmouseleave = () => delayedClose();

        function delayedClose() {
            closeTimer = setTimeout(() => {
                if (!submenu1?.matches(':hover')) {
                    submenu1?.remove();
                    previewBox?.remove();
                }
            }, 200);
        }



        let closeTimer1;
        //--
        const workBtn = document.createElement('button');
        workBtn.innerText = '👷️ Смена';
        workBtn.classList.add('custom-button');




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

        ///////////////////////////////////////////////////////////////////////
        workBtn.onclick = () => {}; // ничего при клике
        workBtn.onmouseleave = removeSubmenu2WithDelay;
        workBtn.onmouseenter = () => {
            submenu?.remove();
            submenu = null;


            cancelSubmenu2Removal();
            if (submenu2) submenu2.remove();

            // Получаем позицию кнопки на экране
            const rect = workBtn.getBoundingClientRect();

            submenu2 = document.createElement('div');
            submenu2.className = 'ticket-menu';
            submenu2.classList.add(isDarkMode() ? 'dark-theme' : 'light-theme');

            Object.assign(submenu2.style, {
                position: 'fixed',
                top: `${rect.top}px`, // по вертикали совпадает
                left: `${rect.right + 10}px`, // появляется справа от кнопки
                zIndex: 10002,
                padding: '4px'
            });

            if (!exists) {
                submenu2.appendChild(makeSubBtn(submenu2, '➕ Добавить без проверок', '', async () => {
                        const category = getCategoryByStatus(status);

                        if (!category) {
                            alert('Неизвестный статус: ' + status);
                            return;
                        }

                        current[category].push(line);
                        saveStorage(current);
                        submenu2?.remove();
                        previewBox?.remove();
                        removeMenu();
                        alert('Тикет добавлен принудительно:\n' + line);
                    },
                    async () => {
                            previewWithTempChange(previewData => {
                                const category = getCategoryByStatus(status);
                                if (category)
                                    previewData[category].push(line);
                            }, line, isDarkMode() ? '#3b4d2a' : '#d4edda')
                        },
                        async () => {
                            previewBox?.remove()
                        }));
                submenu2.appendChild(makeSubBtn(submenu2, '➕ Добавить с проверками', '', async () => {
                        if (!document.querySelector('#tab-time_entries')) {
                            alert('Не проставлены трудозатраты');
                            return;
                        }

                        const reasonElement = document.querySelector('.cf_109.attribute .value');
                        if (!reasonElement || reasonElement.textContent.trim() === '') {
                            alert('Не указана причина обращения');
                            return;
                        }

                        for (const key of Object.keys(current)) {
                            current[key] = current[key].filter(item => !item.startsWith(url));
                        }

                        const category = getCategoryByStatus(status);
                        if (!category) {
                            alert('Неизвестный статус: ' + status);
                            return;
                        }

                        current[category].push(line);
                        saveStorage(current);
                        submenu2?.remove();
                        previewBox?.remove();
                        removeMenu();
                        alert('Тикет добавлен:\n' + line);
                    },
                    async () => {
                            previewWithTempChange(previewData => {
                                const category = getCategoryByStatus(status);
                                if (category) previewData[category].push(line);
                            }, line)
                        },
                        async () => {
                            previewBox?.remove()
                        }));
            } else {
                submenu2.appendChild(makeSubBtn(submenu2, '❌ Удалить из смены', '', async () => {
                    for (const key of Object.keys(current)) {
                        current[key] = current[key].filter(item => !item.startsWith(url));
                    }
                    saveStorage(current);
                    submenu2?.remove();
                    previewBox?.remove();
                    removeMenu();
                    alert('Удалено');
                }, async () => {
                    const removeColor = isDarkMode() ? '#5c2a2a' : '#f8d7da';
                    createPreviewBox(submenu2, formatShiftText(current), line, removeColor);
                }, async () => {
                    previewBox?.remove()
                }));
            }
            let syncCooldown = false;


            const updateStatusesTemp = makeSubBtn(submenu2, '🔄 Обновить все статусы', '', async () => {
                    if (syncCooldown) return;

                    syncCooldown = true;

                    syncAllStatuses().finally(() => {
                        setTimeout(() => {
                            syncCooldown = false;
                        }, 60000);
                    });
                    submenu2?.remove();
                    previewBox?.remove();
                    removeMenu();
                }, async () => {}, async () => {
                    previewBox?.remove();
                }

            );

            updateStatusesTemp.onmouseenter = () => {
                createHintBox(clearTemp, 'Синхронизировать все статусы. (См. консоль)');
            };

            submenu2.appendChild(updateStatusesTemp);

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

            const exportView = makeSubBtn(submenu2, '📄 Экспорт смены', '', async () => {
                const text = formatShiftText(current);
                const blob = new Blob([text], {
                    type: 'text/plain'
                });
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
            }, async () => {}, async () => {
                previewBox?.remove();
            });

            exportView.onmouseenter = () => {
                createHintBox(exportView, 'Скачать .txt файл со сменой');
            };

            submenu2.appendChild(exportView);

            const clearTemp = makeSubBtn(submenu2, '🗑️ Очистить смену', '', async () => {
                submenu2?.remove();
                previewBox?.remove();
                removeMenu();
                clearStorage();
            }, async () => {}, async () => {
                previewBox?.remove();
            });
            clearTemp.onmouseenter = () => {
                createHintBox(clearTemp, 'Очистить всё содержимое смены');
            };
            submenu2.appendChild(clearTemp);

            submenu2.onmouseenter = cancelSubmenu2Removal;
            submenu2.onmouseleave = removeSubmenu2WithDelay;

            document.body.appendChild(submenu2);
        };




        menu.appendChild(workBtn)

        menu.appendChild(connectBtn);
        menu.appendChild(dboBtn);
		
		const settingsBtn = document.createElement('button');
settingsBtn.innerText = '⚙ Настройки';

let settingsSubmenu = null;
let settingsTimer = null;

function removeSettingsSubmenuDelayed() {
    settingsTimer = setTimeout(() => {
        settingsSubmenu?.remove();
        settingsSubmenu = null;
    }, 200);
}

function cancelSettingsSubmenuRemove() {
    clearTimeout(settingsTimer);
    settingsTimer = null;
}

settingsBtn.onmouseenter = () => {
    submenu?.remove(); submenu1?.remove(); submenu2?.remove();

    cancelSettingsSubmenuRemove();
    if (settingsSubmenu) settingsSubmenu.remove();

    const rect = settingsBtn.getBoundingClientRect();

    settingsSubmenu = document.createElement('div');
    settingsSubmenu.className = 'ticket-menu';
    settingsSubmenu.classList.add(isDarkMode() ? 'dark-theme' : 'light-theme');

    Object.assign(settingsSubmenu.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.right + 10}px`,
        zIndex: 10002,
        padding: '6px',
        width: '300px'
    });

    // Чекбокс "мониторинг"
    const dashLabel = document.createElement('label');
    dashLabel.style.display = 'block';
    dashLabel.innerHTML = `
        <input type="checkbox" id="dashToggle" ${dashboardSettings.isDashboardEnabled() ? 'checked' : ''} />
        Включить мониторинг тикетов
    `;
    dashLabel.querySelector('#dashToggle').onchange = (e) => {
        dashboardSettings.setDashboardEnabled(e.target.checked);
        alert(`Мониторинг ${e.target.checked ? 'включён' : 'отключён'}`);
    };
    settingsSubmenu.appendChild(dashLabel);

    // Чекбокс "автосинхронизация"
    const autoLabel = document.createElement('label');
    autoLabel.style.display = 'block';
    autoLabel.innerHTML = `
        <input type="checkbox" id="autoSyncToggle" ${dashboardSettings.isAutoSyncEnabled() ? 'checked' : ''} />
        Включить автосинхронизацию смены
    `;
    autoLabel.querySelector('#autoSyncToggle').onchange = (e) => {
        dashboardSettings.setAutoSyncEnabled(e.target.checked);
        alert(`Автосинхронизация ${e.target.checked ? 'включена' : 'отключена'}`);
    };
    settingsSubmenu.appendChild(autoLabel);

    settingsSubmenu.onmouseenter = cancelSettingsSubmenuRemove;
    settingsSubmenu.onmouseleave = removeSettingsSubmenuDelayed;

    document.body.appendChild(settingsSubmenu);
};

settingsBtn.onmouseleave = removeSettingsSubmenuDelayed;
menu.appendChild(settingsBtn);
		
		
        document.body.appendChild(menu);
        setTimeout(() => {
            window.addEventListener('click', removeMenu, {
                once: true
            });
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