// WII MESSAGE BOARD
// Calendar + memos you write yourself + letters from WiiDesk.
// Everything is saved in localStorage under 'wiidesk-msgboard'.
(function () {
    var KEY = 'wiidesk-msgboard';
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];

    // Letters from WiiDesk. Each one is delivered once, the first time it's seen,
    // dated that day. To "send" a new letter in a future update, add an entry here
    // with a new id. Letters the user deletes never come back.
    var SYSTEM_LETTERS = [
        {
            id: 'sys-welcome',
            title: 'Welcome!',
            text: 'Welcome to the WiiDesk Message Board!\n' +
                '\n' +
                'Pick a day on the calendar to see its messages, or press Write Memo to leave yourself a note on that day.\n' +
                '\n' +
                'Memos are saved in this browser, so they will still be here next time.'
        },
        {
            id: 'sys-news-1',
            title: 'What\'s New',
            text: 'New in this version of WiiDesk:\n' +
                '\n' +
                '- A working Message Board (you are reading it!)\n' +
                '- Wii Settings: volume, clock format and Format Wii System Memory\n' +
                '- The News Channel now opens\n' +
                '- Right-click opens the HOME Menu, as the welcome screen promised\n' +
                '- Your channel layout is now kept between visits'
        }
    ];

    var state = load();
    var fresh = [];                 // ids delivered during this page load
    var today = new Date();
    var view = { y: today.getFullYear(), m: today.getMonth() };
    var selected = ymd(today);
    var openId = null;              // letter being read/edited, or null for a new memo
    var editing = false;

    function pad(n) { return String(n).padStart(2, '0'); }
    function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function sfx(name) { if (window.playSFX) playSFX(name, userConfig.sfxVol); }
    function el(id) { return document.getElementById(id); }

    function load() {
        var s = null;
        try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
        if (!s || !Array.isArray(s.letters)) s = { letters: [], removed: [] };
        if (!Array.isArray(s.removed)) s.removed = [];
        return s;
    }
    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }

    // Deliver any system letters that haven't been delivered (or deleted) yet
    function deliver() {
        var now = ymd(new Date());
        SYSTEM_LETTERS.forEach(function (sl) {
            var have = state.letters.some(function (l) { return l.id === sl.id; });
            if (have || state.removed.indexOf(sl.id) !== -1) return;
            state.letters.push({
                id: sl.id, date: now, title: sl.title, text: sl.text,
                system: true, read: false
            });
            fresh.push(sl.id);
        });
        save();
    }

    function unreadCount() {
        return state.letters.filter(function (l) { return !l.read; }).length;
    }

    function refreshBadge() {
        var badge = el('mbBadge');
        if (!badge) return;
        var n = unreadCount();
        badge.style.display = n ? 'flex' : 'none';
        badge.textContent = n > 9 ? '9+' : n;
    }

    // Called once the main menu is on screen after the startup animation
    window.mbAnnounceNew = function () {
        if (fresh.length) {
            sfx('letter-in.mp3');
            fresh = [];
        }
    };

    function lettersOn(date) {
        return state.letters.filter(function (l) { return l.date === date; });
    }

    function firstLine(text) {
        var line = (text || '').split('\n').filter(function (t) { return t.trim(); })[0] || '(empty)';
        return line.length > 34 ? line.slice(0, 33) + '\u2026' : line;
    }

    // ---------- calendar ----------
    function renderCalendar() {
        el('mbMonthLabel').textContent = MONTHS[view.m] + ' ' + view.y;
        var grid = el('mbGrid');
        grid.innerHTML = '';

        var firstDow = new Date(view.y, view.m, 1).getDay();
        var daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
        var todayStr = ymd(new Date());

        for (var i = 0; i < firstDow; i++) {
            var blank = document.createElement('div');
            blank.className = 'mb-cell blank';
            grid.appendChild(blank);
        }
        for (var d = 1; d <= daysInMonth; d++) {
            (function (day) {
                var str = view.y + '-' + pad(view.m + 1) + '-' + pad(day);
                var cell = document.createElement('div');
                cell.className = 'mb-cell';
                if (str === todayStr) cell.classList.add('today');
                if (str === selected) cell.classList.add('selected');
                var letters = lettersOn(str);
                if (letters.length) {
                    cell.classList.add('has-mail');
                    if (letters.some(function (l) { return !l.read; })) cell.classList.add('unread');
                }
                cell.textContent = day;
                cell.addEventListener('mouseenter', function () { sfx('button-hover.mp3'); });
                cell.addEventListener('click', function () {
                    selected = str;
                    sfx('button-select.mp3');
                    renderCalendar();
                    renderDay();
                });
                grid.appendChild(cell);
            })(d);
        }
    }

    function renderDay() {
        var parts = selected.split('-');
        var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        el('mbDayTitle').textContent = names[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();

        var list = el('mbLetters');
        list.innerHTML = '';
        var letters = lettersOn(selected);
        if (!letters.length) {
            var none = document.createElement('div');
            none.className = 'mb-empty';
            none.textContent = 'No messages on this day.';
            list.appendChild(none);
        }
        letters.forEach(function (l) {
            var row = document.createElement('div');
            row.className = 'mb-letter' + (l.read ? '' : ' unread') + (l.system ? ' system' : '');
            var icon = document.createElement('span');
            icon.className = 'mb-letter-icon';
            var text = document.createElement('span');
            text.className = 'mb-letter-text';
            var title = document.createElement('strong');
            title.textContent = l.title || 'Memo';
            var preview = document.createElement('span');
            preview.className = 'mb-letter-preview';
            preview.textContent = firstLine(l.text);
            text.appendChild(title);
            text.appendChild(preview);
            row.appendChild(icon);
            row.appendChild(text);
            row.addEventListener('mouseenter', function () { sfx('button-hover.mp3'); });
            row.addEventListener('click', function () { openLetter(l.id); });
            list.appendChild(row);
        });
    }

    function renderAll() {
        renderCalendar();
        renderDay();
        refreshBadge();
    }

    // ---------- letter / editor ----------
    function showOpened() {
        el('mbOpened').style.display = 'flex';
        document.querySelector('.msgboard .bg').style.display = 'block';
    }
    function hideOpened() {
        el('mbOpened').style.display = 'none';
        document.querySelector('.msgboard .bg').style.display = 'none';
        openId = null;
        editing = false;
    }

    function setButtons(save, edit, del) {
        el('mbSave').style.display = save ? '' : 'none';
        el('mbEdit').style.display = edit ? '' : 'none';
        el('mbDelete').style.display = del ? '' : 'none';
    }

    function openLetter(id) {
        var l = state.letters.find(function (x) { return x.id === id; });
        if (!l) return;
        openId = id;
        editing = false;
        if (!l.read) { l.read = true; save(); renderAll(); }
        el('mbMemoTitle').textContent = l.title || 'Memo';
        var lines = el('mbMemoLines');
        lines.style.display = '';
        lines.innerHTML = '';
        // Keep blank lines so paragraphs show up; each line sits on a ruled line like a real memo
        l.text.split('\n').forEach(function (t) {
            var s = document.createElement('span');
            s.textContent = t || '\u00a0';
            lines.appendChild(s);
        });
        el('mbMemoText').style.display = 'none';
        setButtons(false, !l.system, true);
        sfx('button-select-big.mp3');
        showOpened();
    }

    function openEditor(id) {
        var l = id ? state.letters.find(function (x) { return x.id === id; }) : null;
        openId = l ? l.id : null;
        editing = true;
        el('mbMemoTitle').textContent = l ? 'Edit Memo' : 'New Memo';
        el('mbMemoLines').style.display = 'none';
        var ta = el('mbMemoText');
        ta.style.display = 'block';
        ta.value = l ? l.text : '';
        setButtons(true, false, !!l);
        showOpened();
        setTimeout(function () { ta.focus(); }, 50);
    }

    function saveMemo() {
        var text = el('mbMemoText').value.replace(/\s+$/, '');
        if (!text.trim()) {
            sfx('alert.mp3');
            if (window.cmAlert) cmAlert('Write something first!');
            return;
        }
        if (openId) {
            var l = state.letters.find(function (x) { return x.id === openId; });
            if (l) l.text = text;
        } else {
            state.letters.push({
                id: 'memo-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                date: selected, title: 'Memo', text: text, system: false, read: true
            });
        }
        save();
        sfx('channel-open.mp3');
        hideOpened();
        renderAll();
    }

    function deleteOpen() {
        var l = state.letters.find(function (x) { return x.id === openId; });
        if (!l) { hideOpened(); return; }
        var doDelete = function () {
            state.letters = state.letters.filter(function (x) { return x.id !== l.id; });
            if (l.system && state.removed.indexOf(l.id) === -1) state.removed.push(l.id);
            save();
            sfx('button-cancel.mp3');
            hideOpened();
            renderAll();
        };
        if (window.cmConfirm) cmConfirm('Delete this message?', doDelete);
        else doDelete();
    }

    // ---------- wiring ----------
    function init() {
        deliver();
        refreshBadge();

        $('.diary-btn').on('click', function () {
            // open on the current month with today selected
            var n = new Date();
            view = { y: n.getFullYear(), m: n.getMonth() };
            selected = ymd(n);
            hideOpened();
            renderAll();
            $('.msgboard').css('display', 'flex');
        });

        $('.backtowiimenu').on('click', function () {
            hideOpened();
            $('.msgboard').fadeOut();
        });

        el('mbPrev').addEventListener('click', function () {
            view.m--; if (view.m < 0) { view.m = 11; view.y--; }
            sfx('nextprev.mp3'); renderCalendar();
        });
        el('mbNext').addEventListener('click', function () {
            view.m++; if (view.m > 11) { view.m = 0; view.y++; }
            sfx('nextprev.mp3'); renderCalendar();
        });

        el('mbWrite').addEventListener('click', function () { sfx('button-select-big.mp3'); openEditor(null); });
        el('mbSave').addEventListener('click', saveMemo);
        el('mbEdit').addEventListener('click', function () { sfx('button-select.mp3'); openEditor(openId); });
        el('mbDelete').addEventListener('click', deleteOpen);
        el('mbBack').addEventListener('click', function () { sfx('button-cancel.mp3'); hideOpened(); });

        // Hover sounds for the alt-buttons on this screen
        document.querySelectorAll('.msgboard .alt-btn, .msgboard .mb-nav').forEach(function (b) {
            b.addEventListener('mouseenter', function () { sfx('button-hover.mp3'); });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
