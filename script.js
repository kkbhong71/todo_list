// 전역 변수
let todos = [];
let todoIdCounter = 1;
let currentDate = new Date();
let selectedDateFilter = null;
let currentView = 'week';
let currentFilters = {
    search: '',
    category: '',
    status: '',
    sort: 'date'
};
let isDarkMode = false;
let draggedElement = null;
let swipeStartX = 0;
let swipeStartY = 0;
let touchStartTime = 0;
let installPromptEvent = null;

// DOM 요소들 - 안전한 방식으로 선언
let todoInput, addBtn, todoList, emptyState, totalTasks, completedTasks, pendingTasks;
let searchInput, clearSearchBtn, categorySelect, prioritySelect, dueDateInput;
let categoryFilter, statusFilter, sortSelect, darkModeToggle, dashboardToggle;
let dashboard, closeDashboard, overdueTasks, dragGuide, swipeGuide;
let installPrompt, installBtn, dismissInstall, exportData, importBtn, importData, touchFeedback;
let prevPeriodBtn, nextPeriodBtn, currentPeriodEl, weekGrid, monthGrid, yearGrid;
let todayBtn, selectedDateEl, weekViewContainer, monthViewContainer, yearViewContainer;
let weekViewBtn, monthViewBtn, yearViewBtn, statusUpdates;

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', function() {
    console.log('앱 초기화 시작...');
    try {
        initializeElements();
        loadTodos();
        initializeEventListeners();
        initializeCalendar();
        loadSettings();
        
        // 오늘 날짜 설정
        if (dueDateInput) {
            dueDateInput.valueAsDate = new Date();
        }
        
        setTimeout(() => {
            updateUI();
            updateStats();
            updateDashboard();
            announceStatus('고급 할 일 관리 앱이 준비되었습니다');
            console.log('앱 초기화 완료!');
        }, 100);
    } catch (error) {
        console.error('앱 초기화 중 오류:', error);
        showErrorMessage('앱을 초기화하는 중 문제가 발생했습니다.');
    }
});

// DOM 요소 초기화 - 안전한 방식
function initializeElements() {
    // 기본 요소들
    todoInput = document.getElementById('todoInput');
    addBtn = document.getElementById('addBtn');
    todoList = document.getElementById('todoList');
    emptyState = document.getElementById('emptyState');
    totalTasks = document.getElementById('totalTasks');
    completedTasks = document.getElementById('completedTasks');
    pendingTasks = document.getElementById('pendingTasks');
    
    // 고급 기능 요소들
    searchInput = document.getElementById('searchInput');
    clearSearchBtn = document.getElementById('clearSearch');
    categorySelect = document.getElementById('categorySelect');
    prioritySelect = document.getElementById('prioritySelect');
    dueDateInput = document.getElementById('dueDateInput');
    categoryFilter = document.getElementById('categoryFilter');
    statusFilter = document.getElementById('statusFilter');
    sortSelect = document.getElementById('sortSelect');
    darkModeToggle = document.getElementById('darkModeToggle');
    dashboardToggle = document.getElementById('dashboardToggle');
    dashboard = document.getElementById('dashboard');
    closeDashboard = document.getElementById('closeDashboard');
    overdueTasks = document.getElementById('overdueTasks');
    dragGuide = document.getElementById('dragGuide');
    swipeGuide = document.getElementById('swipeGuide');
    installPrompt = document.getElementById('installPrompt');
    installBtn = document.getElementById('installBtn');
    dismissInstall = document.getElementById('dismissInstall');
    exportData = document.getElementById('exportData');
    importBtn = document.getElementById('importBtn');
    importData = document.getElementById('importData');
    touchFeedback = document.getElementById('touchFeedback');
    
    // 달력 요소들
    prevPeriodBtn = document.getElementById('prevPeriod');
    nextPeriodBtn = document.getElementById('nextPeriod');
    currentPeriodEl = document.getElementById('currentPeriod');
    weekGrid = document.getElementById('weekGrid');
    monthGrid = document.getElementById('monthGrid');
    yearGrid = document.getElementById('yearGrid');
    todayBtn = document.getElementById('todayBtn');
    selectedDateEl = document.getElementById('selectedDate');
    weekViewContainer = document.getElementById('weekViewContainer');
    monthViewContainer = document.getElementById('monthViewContainer');
    yearViewContainer = document.getElementById('yearViewContainer');
    weekViewBtn = document.getElementById('weekView');
    monthViewBtn = document.getElementById('monthView');
    yearViewBtn = document.getElementById('yearView');
    statusUpdates = document.getElementById('statusUpdates');
}

// 이벤트 리스너 초기화 - 강화된 에러 처리
function initializeEventListeners() {
    console.log('이벤트 리스너 초기화...');
    
    try {
        // 기본 기능
        if (addBtn) addBtn.addEventListener('click', addTodo);
        if (todoInput) {
            todoInput.addEventListener('keypress', handleKeyPress);
            todoInput.addEventListener('input', handleInputChange);
            todoInput.addEventListener('focus', handleInputFocus);
            todoInput.addEventListener('blur', handleInputBlur);
        }
        
        // 검색 기능
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
        
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', clearSearch);
        }
        
        // 필터링
        if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
        if (statusFilter) statusFilter.addEventListener('change', applyFilters);
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);
        
        // 다크모드
        if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
        
        // 대시보드
        if (dashboardToggle) dashboardToggle.addEventListener('click', toggleDashboard);
        if (closeDashboard) closeDashboard.addEventListener('click', hideDashboard);
        
        // 달력 네비게이션
        if (prevPeriodBtn) prevPeriodBtn.addEventListener('click', () => navigatePeriod(-1));
        if (nextPeriodBtn) nextPeriodBtn.addEventListener('click', () => navigatePeriod(1));
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                currentDate = new Date();
                selectedDateFilter = null;
                updateCalendarView();
                updateSelectedDateDisplay();
                updateUI();
                announceStatus('오늘 날짜로 이동했습니다');
            });
        }
        
        // 뷰 전환
        if (weekViewBtn) weekViewBtn.addEventListener('click', () => switchView('week'));
        if (monthViewBtn) monthViewBtn.addEventListener('click', () => switchView('month'));
        if (yearViewBtn) yearViewBtn.addEventListener('click', () => switchView('year'));
        
        // 데이터 관리
        if (exportData) exportData.addEventListener('click', exportTodos);
        if (importBtn) importBtn.addEventListener('click', () => {
            if (importData) importData.click();
        });
        if (importData) importData.addEventListener('change', importTodos);
        
        // 키보드 단축키
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        console.log('이벤트 리스너 초기화 완료');
    } catch (error) {
        console.error('이벤트 리스너 초기화 중 오류:', error);
    }
}

// 전역 함수들을 window 객체에 명시적으로 연결 - CSP 안전 버전
function setupGlobalFunctions() {
    window.toggleTodo = function(id) {
        try {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                const wasCompleted = todo.completed;
                todo.completed = !todo.completed;
                
                saveTodos();
                updateCalendarView();
                updateUI();
                updateDashboard();
                
                if (todo.completed) {
                    showCelebration();
                    announceStatus(`할 일을 완료했습니다: ${todo.text}`);
                } else {
                    announceStatus(`할 일을 미완료로 변경했습니다: ${todo.text}`);
                }
            }
        } catch (error) {
            console.error('할 일 상태 변경 중 오류:', error);
            showErrorMessage('할 일 상태를 변경하는 중 오류가 발생했습니다');
        }
    };

    window.deleteTodo = function(id) {
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        
        if (todoItem) {
            try {
                const todo = todos.find(t => t.id === id);
                const todoText = todo ? todo.text : '할 일';
                
                todoItem.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                todoItem.style.transform = 'translateX(100%) rotateZ(15deg) scale(0.8)';
                todoItem.style.opacity = '0';
                
                setTimeout(() => {
                    todos = todos.filter(t => t.id !== id);
                    saveTodos();
                    updateCalendarView();
                    updateUI();
                    updateDashboard();
                    announceStatus(`할 일을 삭제했습니다: ${todoText}`);
                }, 400);
            } catch (error) {
                console.error('할 일 삭제 중 오류:', error);
                showErrorMessage('할 일을 삭제하는 중 오류가 발생했습니다');
            }
        }
    };

    window.editTodo = function(id) {
        try {
            const todo = todos.find(t => t.id === id);
            if (!todo) return;
            
            const newText = prompt('할 일을 수정하세요:', todo.text);
            if (newText !== null && newText.trim() !== '') {
                todo.text = newText.trim();
                saveTodos();
                updateUI();
                announceStatus(`할 일을 수정했습니다: ${newText}`);
            }
        } catch (error) {
            console.error('할 일 편집 중 오류:', error);
            showErrorMessage('할 일을 수정하는 중 오류가 발생했습니다');
        }
    };
}

// 전역 함수 설정 호출
setupGlobalFunctions();

// ===========================================
// 달력 기능 완전 구현
// ===========================================

// 달력 초기화
function initializeCalendar() {
    console.log('달력 초기화...');
    currentDate = new Date();
    switchView('week');
    updateSelectedDateDisplay();
}

// 뷰 전환
function switchView(view) {
    console.log('뷰 전환:', view);
    currentView = view;
    
    try {
        // 버튼 활성화 상태 변경
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (view === 'week' && weekViewBtn) {
            weekViewBtn.classList.add('active');
        } else if (view === 'month' && monthViewBtn) {
            monthViewBtn.classList.add('active');
        } else if (view === 'year' && yearViewBtn) {
            yearViewBtn.classList.add('active');
        }
        
        // 컨테이너 보이기/숨기기
        if (weekViewContainer) {
            weekViewContainer.classList.toggle('hidden', view !== 'week');
        }
        if (monthViewContainer) {
            monthViewContainer.classList.toggle('hidden', view !== 'month');
        }
        if (yearViewContainer) {
            yearViewContainer.classList.toggle('hidden', view !== 'year');
        }
        
        updateCalendarView();
        saveSettings();
    } catch (error) {
        console.error('뷰 전환 중 오류:', error);
    }
}

// 기간 네비게이션
function navigatePeriod(direction) {
    try {
        switch (currentView) {
            case 'week':
                currentDate.setDate(currentDate.getDate() + (direction * 7));
                break;
            case 'month':
                currentDate.setMonth(currentDate.getMonth() + direction);
                break;
            case 'year':
                currentDate.setFullYear(currentDate.getFullYear() + direction);
                break;
        }
        updateCalendarView();
    } catch (error) {
        console.error('기간 네비게이션 중 오류:', error);
    }
}

// 달력 뷰 업데이트
function updateCalendarView() {
    try {
        updatePeriodTitle();
        
        switch (currentView) {
            case 'week':
                renderWeekView();
                break;
            case 'month':
                renderMonthView();
                break;
            case 'year':
                renderYearView();
                break;
        }
    } catch (error) {
        console.error('달력 뷰 업데이트 중 오류:', error);
    }
}

// 기간 제목 업데이트
function updatePeriodTitle() {
    if (!currentPeriodEl) return;
    
    try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        switch (currentView) {
            case 'week':
                const weekStart = getWeekStart(currentDate);
                const weekEnd = getWeekEnd(weekStart);
                if (weekStart.getMonth() === weekEnd.getMonth()) {
                    currentPeriodEl.textContent = `${year}년 ${month}월 ${weekStart.getDate()}일 - ${weekEnd.getDate()}일`;
                } else {
                    currentPeriodEl.textContent = `${weekStart.getFullYear()}년 ${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 - ${weekEnd.getFullYear()}년 ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;
                }
                break;
            case 'month':
                currentPeriodEl.textContent = `${year}년 ${month}월`;
                break;
            case 'year':
                currentPeriodEl.textContent = `${year}년`;
                break;
        }
    } catch (error) {
        console.error('기간 제목 업데이트 중 오류:', error);
    }
}

// 주간 뷰 렌더링
function renderWeekView() {
    if (!weekGrid) return;
    
    try {
        weekGrid.innerHTML = '';
        
        const weekStart = getWeekStart(currentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            
            const dateEl = document.createElement('div');
            dateEl.className = 'week-date';
            
            // 오늘 날짜 체크
            if (date.getTime() === today.getTime()) {
                dateEl.classList.add('today');
            }
            
            // 선택된 날짜 체크
            if (selectedDateFilter === formatDateString(date)) {
                dateEl.classList.add('selected');
            }
            
            // 할 일이 있는 날짜 체크
            if (hasTasksOnDate(date)) {
                dateEl.classList.add('has-todos');
            }
            
            // 요일별 색상 적용
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0) { // 일요일
                dateEl.classList.add('sunday');
            } else if (dayOfWeek === 6) { // 토요일
                dateEl.classList.add('saturday');
            }
            
            const dateNumber = document.createElement('div');
            dateNumber.className = 'week-date-number';
            dateNumber.textContent = date.getDate();
            
            const dateLabel = document.createElement('div');
            dateLabel.className = 'week-date-label';
            dateLabel.textContent = getDayName(dayOfWeek);
            
            dateEl.appendChild(dateNumber);
            dateEl.appendChild(dateLabel);
            
            dateEl.addEventListener('click', () => {
                selectDate(date);
            });
            
            weekGrid.appendChild(dateEl);
        }
    } catch (error) {
        console.error('주간 뷰 렌더링 중 오류:', error);
    }
}

// 월간 뷰 렌더링
function renderMonthView() {
    if (!monthGrid) return;
    
    try {
        monthGrid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = getWeekStart(firstDay);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 6주분 날짜 생성 (42일)
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dateEl = document.createElement('div');
            dateEl.className = 'calendar-date';
            
            // 현재 월이 아닌 날짜
            if (date.getMonth() !== month) {
                dateEl.classList.add('other-month');
            }
            
            // 오늘 날짜
            if (date.getTime() === today.getTime()) {
                dateEl.classList.add('today');
            }
            
            // 선택된 날짜
            if (selectedDateFilter === formatDateString(date)) {
                dateEl.classList.add('selected');
            }
            
            // 할 일이 있는 날짜
            if (hasTasksOnDate(date)) {
                dateEl.classList.add('has-todos');
            }
            
            // 요일별 색상 적용
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0) { // 일요일
                dateEl.classList.add('sunday');
            } else if (dayOfWeek === 6) { // 토요일
                dateEl.classList.add('saturday');
            }
            
            dateEl.textContent = date.getDate();
            
            dateEl.addEventListener('click', () => {
                selectDate(date);
            });
            
            monthGrid.appendChild(dateEl);
        }
    } catch (error) {
        console.error('월간 뷰 렌더링 중 오류:', error);
    }
}

// 연간 뷰 렌더링
function renderYearView() {
    if (!yearGrid) return;
    
    try {
        yearGrid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let month = 0; month < 12; month++) {
            const monthContainer = document.createElement('div');
            monthContainer.className = 'year-month';
            
            const monthTitle = document.createElement('div');
            monthTitle.className = 'year-month-title';
            monthTitle.textContent = `${month + 1}월`;
            monthContainer.appendChild(monthTitle);
            
            const monthGrid = document.createElement('div');
            monthGrid.className = 'year-month-grid';
            
            // 요일 헤더
            const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
            weekdays.forEach((day, index) => {
                const dayEl = document.createElement('div');
                dayEl.className = 'year-weekday';
                dayEl.textContent = day;
                if (index === 0) dayEl.classList.add('sunday');
                if (index === 6) dayEl.classList.add('saturday');
                monthGrid.appendChild(dayEl);
            });
            
            const firstDay = new Date(year, month, 1);
            const startDate = getWeekStart(firstDay);
            
            // 6주분 날짜
            for (let i = 0; i < 42; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                
                const dateEl = document.createElement('div');
                dateEl.className = 'year-date';
                
                if (date.getMonth() === month) {
                    // 현재 월의 날짜
                    
                    // 오늘 날짜
                    if (date.getTime() === today.getTime()) {
                        dateEl.classList.add('today');
                    }
                    
                    // 선택된 날짜
                    if (selectedDateFilter === formatDateString(date)) {
                        dateEl.classList.add('selected');
                    }
                    
                    // 할 일이 있는 날짜
                    if (hasTasksOnDate(date)) {
                        dateEl.classList.add('has-todos');
                    }
                    
                    // 요일별 색상 적용
                    const dayOfWeek = date.getDay();
                    if (dayOfWeek === 0) { // 일요일
                        dateEl.classList.add('sunday');
                    } else if (dayOfWeek === 6) { // 토요일
                        dateEl.classList.add('saturday');
                    }
                    
                    dateEl.textContent = date.getDate();
                    
                    dateEl.addEventListener('click', () => {
                        selectDate(date);
                    });
                    
                } else {
                    // 다른 월의 날짜는 투명하게 표시
                    dateEl.classList.add('other-month');
                    dateEl.textContent = date.getDate();
                }
                
                monthGrid.appendChild(dateEl);
            }
            
            monthContainer.appendChild(monthGrid);
            yearGrid.appendChild(monthContainer);
        }
    } catch (error) {
        console.error('연간 뷰 렌더링 중 오류:', error);
    }
}

// 유틸리티 함수들
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekEnd(weekStart) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
}

function getDayName(dayIndex) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayIndex];
}

function hasTasksOnDate(date) {
    const dateStr = formatDateString(date);
    return todos.some(todo => todo.date === dateStr);
}

function selectDate(date) {
    try {
        const dateStr = formatDateString(date);
        
        if (selectedDateFilter === dateStr) {
            // 같은 날짜를 다시 클릭하면 필터 해제
            selectedDateFilter = null;
        } else {
            selectedDateFilter = dateStr;
        }
        
        updateCalendarView();
        updateSelectedDateDisplay();
        updateUI();
        
        const selectedText = selectedDateFilter ? 
            `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일` : 
            '전체 할 일';
        announceStatus(`${selectedText} 선택됨`);
    } catch (error) {
        console.error('날짜 선택 중 오류:', error);
    }
}

function updateSelectedDateDisplay() {
    if (!selectedDateEl) return;
    
    try {
        if (selectedDateFilter) {
            const date = parseLocalDate(selectedDateFilter);
            selectedDateEl.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 할 일`;
        } else {
            selectedDateEl.textContent = '전체 할 일';
        }
    } catch (error) {
        console.error('선택된 날짜 표시 업데이트 중 오류:', error);
    }
}

// ===========================================
// 기본 기능들 (검색, 필터, CRUD 등)
// ===========================================

// 검색 기능
function handleSearch(e) {
    try {
        const query = e.target.value.toLowerCase().trim();
        currentFilters.search = query;
        
        if (query && clearSearchBtn) {
            clearSearchBtn.style.display = 'block';
        } else if (clearSearchBtn) {
            clearSearchBtn.style.display = 'none';
        }
        
        applyFilters();
    } catch (error) {
        console.error('검색 중 오류:', error);
    }
}

function clearSearch() {
    try {
        if (searchInput) {
            searchInput.value = '';
            currentFilters.search = '';
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            applyFilters();
            searchInput.focus();
        }
    } catch (error) {
        console.error('검색 초기화 중 오류:', error);
    }
}

// 할 일 추가 (고급 기능 포함)
function addTodo() {
    if (!todoInput) return;
    
    try {
        const todoText = todoInput.value.trim();
        
        if (todoText === '') {
            showInputError();
            return;
        }
        
        const todoDate = selectedDateFilter || formatDateString(new Date());
        const category = categorySelect ? categorySelect.value : '개인';
        const priority = prioritySelect ? parseInt(prioritySelect.value) : 2;
        const dueDate = dueDateInput ? dueDateInput.value : null;
        
        const newTodo = {
            id: todoIdCounter++,
            text: todoText,
            completed: false,
            date: todoDate,
            category: category,
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString(),
            order: todos.length
        };
        
        todos.push(newTodo);
        todoInput.value = '';
        
        // 입력 옵션 초기화
        if (dueDateInput) dueDateInput.valueAsDate = new Date();
        
        showSuccessFeedback();
        saveTodos();
        updateCalendarView();
        updateUI();
        updateDashboard();
        
        requestAnimationFrame(() => {
            highlightNewItem(newTodo.id);
        });
        
        announceStatus(`새로운 할 일이 추가되었습니다: ${todoText} (${category})`);
    } catch (error) {
        console.error('할 일 추가 중 오류:', error);
        showErrorMessage('할 일을 추가하는 중 오류가 발생했습니다');
    }
}

// 필터 적용
function applyFilters() {
    try {
        currentFilters.category = categoryFilter ? categoryFilter.value : '';
        currentFilters.status = statusFilter ? statusFilter.value : '';
        currentFilters.sort = sortSelect ? sortSelect.value : 'date';
        
        updateUI();
    } catch (error) {
        console.error('필터 적용 중 오류:', error);
    }
}

// 할 일 목록 렌더링
function renderTodos() {
    if (!todoList) return;
    
    try {
        todoList.innerHTML = '';
        
        let filteredTodos = getFilteredTodos();
        filteredTodos = sortTodos(filteredTodos);
        
        filteredTodos.forEach((todo, index) => {
            const li = createTodoElement(todo, index);
            todoList.appendChild(li);
        });
        
        // 드래그 앤 드롭 안내
        if (dragGuide && currentFilters.sort === 'manual' && filteredTodos.length > 1) {
            dragGuide.classList.remove('hidden');
        } else if (dragGuide) {
            dragGuide.classList.add('hidden');
        }
        
        document.dispatchEvent(new CustomEvent('todo-rendered'));
    } catch (error) {
        console.error('할 일 목록 렌더링 중 오류:', error);
        if (todoList) {
            todoList.innerHTML = '<li class="error-message">할 일 목록을 불러오는 중 오류가 발생했습니다.</li>';
        }
    }
}

// 필터링된 할 일 목록 가져오기
function getFilteredTodos() {
    let filtered = todos;
    
    // 날짜 필터
    if (selectedDateFilter) {
        filtered = filtered.filter(todo => todo.date === selectedDateFilter);
    }
    
    // 검색 필터
    if (currentFilters.search) {
        filtered = filtered.filter(todo => 
            todo.text.toLowerCase().includes(currentFilters.search) ||
            (todo.category && todo.category.toLowerCase().includes(currentFilters.search))
        );
    }
    
    // 카테고리 필터
    if (currentFilters.category) {
        filtered = filtered.filter(todo => todo.category === currentFilters.category);
    }
    
    // 상태 필터
    if (currentFilters.status) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter(todo => {
            switch (currentFilters.status) {
                case 'pending':
                    return !todo.completed;
                case 'completed':
                    return todo.completed;
                case 'overdue':
                    if (todo.completed) return false;
                    if (!todo.dueDate) return false;
                    const dueDate = new Date(todo.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate < today;
                default:
                    return true;
            }
        });
    }
    
    return filtered;
}

// 할 일 정렬
function sortTodos(todos) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (currentFilters.sort) {
        case 'priority':
            return todos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed - b.completed;
                }
                return (b.priority || 2) - (a.priority || 2);
            });
            
        case 'category':
            return todos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed - b.completed;
                }
                return (a.category || '').localeCompare(b.category || '');
            });
            
        case 'dueDate':
            return todos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed - b.completed;
                }
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            
        case 'manual':
            return todos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed - b.completed;
                }
                return (a.order || 0) - (b.order || 0);
            });
            
        default: // date
            return todos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed - b.completed;
                }
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });
    }
}

// 할 일 요소 생성 - CSP 안전 버전
function createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority || 2}`;
    li.setAttribute('data-id', todo.id);
    li.setAttribute('draggable', currentFilters.sort === 'manual');
    
    // 마감일 체크
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let isOverdue = false;
    
    if (todo.dueDate && !todo.completed) {
        const dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
            isOverdue = true;
            li.classList.add('overdue');
        } else if (dueDate.getTime() === today.getTime()) {
            li.classList.add('due-today');
        }
    }
    
    // 드래그 핸들
    if (currentFilters.sort === 'manual') {
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '⋮⋮';
        li.appendChild(dragHandle);
    }
    
    // 체크박스
    const checkbox = document.createElement('div');
    checkbox.className = `todo-checkbox ${todo.completed ? 'checked' : ''}`;
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', todo.completed);
    checkbox.setAttribute('tabindex', '0');
    if (todo.completed) {
        checkbox.textContent = '✓';
    }
    
    // 체크박스 이벤트 - CSP 안전 방식
    checkbox.addEventListener('click', () => window.toggleTodo(todo.id));
    checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.toggleTodo(todo.id);
        }
    });
    
    li.appendChild(checkbox);
    
    // 콘텐츠 영역
    const content = document.createElement('div');
    content.className = 'todo-content';
    
    const main = document.createElement('div');
    main.className = 'todo-main';
    
    // 우선순위 아이콘
    const priority = document.createElement('span');
    priority.className = 'todo-priority';
    priority.title = '우선순위';
    const priorityIcon = {
        3: '🔴',
        2: '🟡',
        1: '🟢'
    }[todo.priority || 2];
    priority.textContent = priorityIcon;
    
    // 카테고리 아이콘
    const category = document.createElement('span');
    category.className = 'todo-category';
    category.title = `카테고리: ${todo.category}`;
    const categoryIcon = {
        '개인': '🙋‍♂️',
        '업무': '💼',
        '취미': '🎨',
        '건강': '💪',
        '학습': '📚',
        '쇼핑': '🛒'
    }[todo.category] || '📝';
    category.textContent = categoryIcon;
    
    // 텍스트
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    
    main.appendChild(priority);
    main.appendChild(category);
    main.appendChild(text);
    
    // 메타 정보
    const meta = document.createElement('div');
    meta.className = 'todo-meta';
    
    // 날짜 정보
    if (!selectedDateFilter) {
        const todoDate = parseLocalDate(todo.date);
        const diffTime = todoDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'todo-date';
        
        if (diffDays === 0) {
            dateSpan.className += ' today-date';
            dateSpan.textContent = '오늘';
        } else if (diffDays === 1) {
            dateSpan.className += ' tomorrow-date';
            dateSpan.textContent = '내일';
        } else if (diffDays === -1) {
            dateSpan.className += ' yesterday-date';
            dateSpan.textContent = '어제';
        } else if (diffDays > 1) {
            dateSpan.className += ' future-date';
            dateSpan.textContent = `${diffDays}일 후`;
        } else {
            dateSpan.className += ' past-date';
            dateSpan.textContent = `${Math.abs(diffDays)}일 전`;
        }
        
        meta.appendChild(dateSpan);
    }
    
    // 마감일 정보
    if (todo.dueDate) {
        const dueDate = new Date(todo.dueDate);
        const dueDiffTime = dueDate.getTime() - today.getTime();
        const dueDiffDays = Math.ceil(dueDiffTime / (1000 * 60 * 60 * 24));
        
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'due-date';
        
        let dueDateText = '';
        
        if (isOverdue) {
            dueDateSpan.className += ' overdue-date';
            dueDateText = `${Math.abs(dueDiffDays)}일 지연`;
        } else if (dueDiffDays === 0) {
            dueDateSpan.className += ' due-today';
            dueDateText = '오늘 마감';
        } else if (dueDiffDays === 1) {
            dueDateSpan.className += ' due-tomorrow';
            dueDateText = '내일 마감';
        } else if (dueDiffDays > 1) {
            dueDateText = `${dueDiffDays}일 후 마감`;
        }
        
        dueDateSpan.textContent = `⏰ ${dueDateText}`;
        meta.appendChild(dueDateSpan);
    }
    
    content.appendChild(main);
    content.appendChild(meta);
    li.appendChild(content);
    
    // 액션 버튼들
    const actions = document.createElement('div');
    actions.className = 'todo-actions';
    
    // 편집 버튼
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.title = '수정';
    editBtn.setAttribute('aria-label', '할 일 수정');
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => window.editTodo(todo.id));
    
    // 삭제 버튼
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = '삭제';
    deleteBtn.setAttribute('aria-label', '할 일 삭제');
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => window.deleteTodo(todo.id));
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);
    
    return li;
}

// 다크모드
function toggleDarkMode() {
    try {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        if (darkModeToggle) {
            darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        }
        
        saveSettings();
        announceStatus(`${isDarkMode ? '다크' : '라이트'} 모드로 전환되었습니다`);
    } catch (error) {
        console.error('다크모드 전환 중 오류:', error);
    }
}

// 통계 대시보드
function toggleDashboard() {
    try {
        if (dashboard && dashboard.classList.contains('hidden')) {
            showDashboard();
        } else {
            hideDashboard();
        }
    } catch (error) {
        console.error('대시보드 전환 중 오류:', error);
    }
}

function showDashboard() {
    try {
        if (dashboard) {
            dashboard.classList.remove('hidden');
            updateDashboard();
            announceStatus('통계 대시보드가 열렸습니다');
        }
    } catch (error) {
        console.error('대시보드 표시 중 오류:', error);
    }
}

function hideDashboard() {
    try {
        if (dashboard) {
            dashboard.classList.add('hidden');
            announceStatus('통계 대시보드가 닫혔습니다');
        }
    } catch (error) {
        console.error('대시보드 숨김 중 오류:', error);
    }
}

function updateDashboard() {
    try {
        // 진행률
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
        
        // 연속 완료 일수
        const streak = calculateStreak();
        const streakNumber = document.getElementById('streakNumber');
        if (streakNumber) {
            streakNumber.textContent = streak;
        }
        
        // 카테고리별 통계
        updateCategoryStats();
        
        // 주간 통계
        updateWeeklyStats();
        
    } catch (error) {
        console.error('대시보드 업데이트 중 오류:', error);
    }
}

function calculateStreak() {
    try {
        const completedDates = [...new Set(
            todos.filter(t => t.completed)
                .map(t => t.date)
        )].sort().reverse();
        
        let streak = 0;
        const today = formatDateString(new Date());
        
        for (let i = 0; i < completedDates.length; i++) {
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);
            const expected = formatDateString(expectedDate);
            
            if (completedDates[i] === expected) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    } catch (error) {
        console.error('연속 완료 일수 계산 중 오류:', error);
        return 0;
    }
}

function updateCategoryStats() {
    try {
        const categoryStats = document.getElementById('categoryStats');
        if (!categoryStats) return;
        
        const stats = {};
        todos.forEach(todo => {
            const category = todo.category || '기타';
            if (!stats[category]) {
                stats[category] = { total: 0, completed: 0 };
            }
            stats[category].total++;
            if (todo.completed) {
                stats[category].completed++;
            }
        });
        
        const categoryIcons = {
            '개인': '🙋‍♂️',
            '업무': '💼',
            '취미': '🎨',
            '건강': '💪',
            '학습': '📚',
            '쇼핑': '🛒'
        };
        
        categoryStats.innerHTML = '';
        
        Object.entries(stats).forEach(([category, data]) => {
            const item = document.createElement('div');
            item.className = 'category-stat-item';
            
            const icon = document.createElement('span');
            icon.className = 'category-icon';
            icon.textContent = categoryIcons[category] || '📝';
            
            const name = document.createElement('span');
            name.className = 'category-name';
            name.textContent = category;
            
            const progress = document.createElement('span');
            progress.className = 'category-progress';
            const percentage = Math.round((data.completed / data.total) * 100) || 0;
            progress.textContent = `${percentage}%`;
            
            item.appendChild(icon);
            item.appendChild(name);
            item.appendChild(progress);
            categoryStats.appendChild(item);
        });
    } catch (error) {
        console.error('카테고리 통계 업데이트 중 오류:', error);
    }
}

function updateWeeklyStats() {
    try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        let weeklyCompleted = 0;
        let weeklyAdded = 0;
        
        todos.forEach(todo => {
            const createdDate = new Date(todo.createdAt);
            const todoDate = parseLocalDate(todo.date);
            
            if (createdDate >= weekStart && createdDate <= weekEnd) {
                weeklyAdded++;
            }
            
            if (todo.completed && todoDate >= weekStart && todoDate <= weekEnd) {
                weeklyCompleted++;
            }
        });
        
        const weeklyCompletedEl = document.getElementById('weeklyCompleted');
        const weeklyAddedEl = document.getElementById('weeklyAdded');
        
        if (weeklyCompletedEl) weeklyCompletedEl.textContent = weeklyCompleted;
        if (weeklyAddedEl) weeklyAddedEl.textContent = weeklyAdded;
    } catch (error) {
        console.error('주간 통계 업데이트 중 오류:', error);
    }
}

// 기본 이벤트 핸들러들
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
    }
}

function handleInputChange(e) {
    try {
        const value = e.target.value;
        const btn = addBtn?.querySelector('span');
        
        if (btn) {
            if (value.trim()) {
                btn.style.transform = 'scale(1.1)';
                addBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
            } else {
                btn.style.transform = 'scale(1)';
                addBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
            }
        }
    } catch (error) {
        console.error('입력 변경 처리 중 오류:', error);
    }
}

function handleInputFocus() {
    try {
        if (this.parentElement) {
            this.parentElement.style.transform = 'scale(1.02) translateY(-2px)';
        }
        this.style.boxShadow = '0 20px 40px rgba(139, 69, 255, 0.25), 0 12px 24px rgba(255, 0, 128, 0.15)';
    } catch (error) {
        console.error('입력 포커스 처리 중 오류:', error);
    }
}

function handleInputBlur() {
    try {
        if (this.parentElement) {
            this.parentElement.style.transform = 'scale(1) translateY(0)';
        }
        this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
    } catch (error) {
        console.error('입력 블러 처리 중 오류:', error);
    }
}

// UI 업데이트
function updateUI() {
    try {
        renderTodos();
        requestAnimationFrame(() => {
            updateStats();
            toggleEmptyState();
        });
    } catch (error) {
        console.error('UI 업데이트 중 오류:', error);
        showErrorMessage('화면을 업데이트하는 중 오류가 발생했습니다');
    }
}

function toggleEmptyState() {
    if (!emptyState || !todoList) return;
    
    try {
        const filteredTodos = getFilteredTodos();
            
        if (filteredTodos.length === 0) {
            emptyState.classList.remove('hidden');
            todoList.style.display = 'none';
            
            const emptyIcon = emptyState.querySelector('.empty-icon');
            const emptyMessages = emptyState.querySelectorAll('p');
            
            if (emptyIcon && emptyMessages.length >= 2) {
                if (selectedDateFilter || currentFilters.search || currentFilters.category || currentFilters.status) {
                    emptyIcon.textContent = '🔍';
                    emptyMessages[0].textContent = '검색 결과가 없습니다!';
                    emptyMessages[1].textContent = '다른 검색어나 필터를 시도해보세요 ✨';
                } else {
                    emptyIcon.textContent = '📝';
                    emptyMessages[0].textContent = '등록된 할 일이 없습니다!';
                    emptyMessages[1].textContent = '위에서 새로운 할 일을 추가해보세요 ✨';
                }
            }
        } else {
            emptyState.classList.add('hidden');
            todoList.style.display = 'block';
        }
    } catch (error) {
        console.error('빈 상태 토글 중 오류:', error);
    }
}

// 통계 업데이트
function updateStats() {
    try {
        const filteredTodos = getFilteredTodos();
        const total = filteredTodos.length;
        const completed = filteredTodos.filter(t => t.completed).length;
        const pending = total - completed;
        
        // 지연된 할 일 계산
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdue = filteredTodos.filter(todo => {
            if (todo.completed || !todo.dueDate) return false;
            const dueDate = new Date(todo.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        }).length;
        
        // 애니메이션으로 업데이트
        if (totalTasks) animateNumber(totalTasks, parseInt(totalTasks.textContent) || 0, total);
        if (completedTasks) animateNumber(completedTasks, parseInt(completedTasks.textContent) || 0, completed);
        if (pendingTasks) animateNumber(pendingTasks, parseInt(pendingTasks.textContent) || 0, pending);
        if (overdueTasks) animateNumber(overdueTasks, parseInt(overdueTasks.textContent) || 0, overdue);
    } catch (error) {
        console.error('통계 업데이트 중 오류:', error);
    }
}

// 유틸리티 함수들
function animateNumber(element, start, end) {
    if (!element || start === end) {
        if (element) element.textContent = end;
        return;
    }
    
    try {
        const duration = 400;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easedProgress);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = end;
            }
        };
        
        requestAnimationFrame(animate);
    } catch (error) {
        console.error('숫자 애니메이션 중 오류:', error);
        element.textContent = end;
    }
}

function formatDateString(date) {
    try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('날짜 형식 변환 중 오류:', error);
        return formatDateString(new Date());
    }
}

function parseLocalDate(dateString) {
    try {
        const parts = dateString.split('-').map(Number);
        if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
            throw new Error('잘못된 날짜 형식');
        }
        return new Date(parts[0], parts[1] - 1, parts[2]);
    } catch (error) {
        console.error('날짜 파싱 중 오류:', error, dateString);
        return new Date();
    }
}

function escapeHtml(text) {
    try {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    } catch (error) {
        console.error('HTML 이스케이프 중 오류:', error);
        return String(text).replace(/[&<>"']/g, function (s) {
            const entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return entities[s];
        });
    }
}

// 로컬 스토리지 함수들
function loadTodos() {
    try {
        const savedTodos = localStorage.getItem('todoManagerData');
        if (savedTodos) {
            todos = JSON.parse(savedTodos);
            todos.forEach(todo => {
                if (!todo.date) todo.date = formatDateString(new Date());
                if (!todo.id) todo.id = todoIdCounter++;
                if (typeof todo.category === 'undefined') todo.category = '개인';
                if (typeof todo.priority === 'undefined') todo.priority = 2;
                if (typeof todo.order === 'undefined') todo.order = todos.length;
            });
            
            if (todos.length > 0) {
                todoIdCounter = Math.max(...todos.map(t => t.id || 0)) + 1;
            }
        }
        console.log('데이터 로드 완료:', todos.length, '개 항목');
    } catch (error) {
        console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
        todos = [];
        showErrorMessage('저장된 데이터를 불러오는 중 오류가 발생했습니다');
    }
}

function saveTodos() {
    try {
        localStorage.setItem('todoManagerData', JSON.stringify(todos));
        console.log('데이터 저장 완료:', todos.length, '개 항목');
    } catch (error) {
        console.error('데이터를 저장하는 중 오류가 발생했습니다:', error);
        showErrorMessage('데이터를 저장하는 중 오류가 발생했습니다');
    }
}

// 설정 저장/불러오기
function saveSettings() {
    try {
        const settings = {
            isDarkMode: isDarkMode,
            currentFilters: currentFilters,
            currentView: currentView
        };
        localStorage.setItem('todoManagerSettings', JSON.stringify(settings));
    } catch (error) {
        console.error('설정 저장 중 오류:', error);
    }
}

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('todoManagerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            if (typeof settings.isDarkMode === 'boolean') {
                isDarkMode = settings.isDarkMode;
                document.body.classList.toggle('dark-mode', isDarkMode);
                if (darkModeToggle) {
                    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
                }
            }
            
            if (settings.currentFilters) {
                currentFilters = { ...currentFilters, ...settings.currentFilters };
                
                // UI에 필터 상태 반영
                if (categoryFilter && settings.currentFilters.category) {
                    categoryFilter.value = settings.currentFilters.category;
                }
                if (statusFilter && settings.currentFilters.status) {
                    statusFilter.value = settings.currentFilters.status;
                }
                if (sortSelect && settings.currentFilters.sort) {
                    sortSelect.value = settings.currentFilters.sort;
                }
            }
            
            if (settings.currentView) {
                currentView = settings.currentView;
            }
        }
    } catch (error) {
        console.error('설정 불러오기 중 오류:', error);
    }
}

// 피드백 및 에러 처리 함수들
function showInputError() {
    if (!todoInput) return;
    
    try {
        todoInput.style.transform = 'translateX(-10px)';
        todoInput.style.borderColor = '#FFB6C1';
        todoInput.style.background = 'rgba(255, 182, 193, 0.2)';
        todoInput.placeholder = '할 일을 입력해 주세요! 📝';
        
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            todoInput.style.transform = shakeCount % 2 === 0 ? 'translateX(5px)' : 'translateX(-5px)';
            shakeCount++;
            if (shakeCount >= 6) {
                clearInterval(shakeInterval);
                todoInput.style.transform = 'translateX(0)';
            }
        }, 100);
        
        setTimeout(() => {
            todoInput.style.borderColor = '';
            todoInput.style.background = 'rgba(255, 255, 255, 0.9)';
            todoInput.placeholder = '할 일을 입력하세요 📝';
        }, 2000);
        
        announceStatus('할 일 내용을 입력해 주세요');
    } catch (error) {
        console.error('입력 오류 표시 중 오류:', error);
    }
}

function showSuccessFeedback() {
    if (!addBtn) return;
    
    try {
        const btn = addBtn.querySelector('span');
        if (!btn) return;
        
        const originalContent = btn.innerHTML;
        
        addBtn.style.transform = 'scale(1.2)';
        btn.innerHTML = '✨';
        
        createRippleEffect(addBtn);
        
        setTimeout(() => {
            addBtn.style.transform = 'scale(1)';
            btn.innerHTML = originalContent;
        }, 1200);
    } catch (error) {
        console.error('성공 피드백 표시 중 오류:', error);
    }
}

function createRippleEffect(element) {
    if (!element) return;
    
    try {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.8s ease-out;
            left: ${rect.width / 2}px;
            top: ${rect.height / 2}px;
            width: 10px;
            height: 10px;
            margin-left: -5px;
            margin-top: -5px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 800);
    } catch (error) {
        console.error('리플 효과 생성 중 오류:', error);
    }
}

function highlightNewItem(id) {
    try {
        const newItem = document.querySelector(`[data-id="${id}"]`);
        if (newItem) {
            newItem.style.transform = 'scale(1.05) translateY(-4px)';
            newItem.style.background = 'linear-gradient(135deg, rgba(255, 182, 193, 0.2) 0%, rgba(221, 160, 221, 0.2) 100%)';
            newItem.style.boxShadow = '0 20px 40px rgba(255, 182, 193, 0.3)';
            
            setTimeout(() => {
                newItem.style.transform = 'scale(1) translateY(0)';
                newItem.style.background = '';
                newItem.style.boxShadow = '';
            }, 800);
        }
    } catch (error) {
        console.error('새 항목 하이라이트 중 오류:', error);
    }
}

function showErrorMessage(message) {
    try {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6b6b;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 9999;
            font-weight: 500;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    } catch (error) {
        console.error('에러 메시지 표시 중 오류:', error);
    }
}

function announceStatus(message) {
    try {
        if (statusUpdates) {
            statusUpdates.textContent = message;
            setTimeout(() => {
                statusUpdates.textContent = '';
            }, 1000);
        }
        console.log('상태:', message);
    } catch (error) {
        console.error('상태 알림 중 오류:', error);
    }
}

// 축하 효과 및 애니메이션
function showCelebration() {
    try {
        createParticleEffect();
        createScreenEffect();
        createSoundVisualization();
    } catch (error) {
        console.error('축하 효과 생성 중 오류:', error);
    }
}

function createParticleEffect() {
    try {
        const particles = ['🌸', '✨', '🌺', '💫', '🌼', '⭐', '💕'];
        const colors = ['#FFB6C1', '#DDA0DD', '#FFCCCB', '#F0E68C', '#98FB98'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                const emoji = particles[Math.floor(Math.random() * particles.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                particle.textContent = emoji;
                particle.style.cssText = `
                    position: fixed;
                    top: ${Math.random() * 30 + 20}%;
                    left: ${Math.random() * 80 + 10}%;
                    font-size: ${Math.random() * 20 + 20}px;
                    pointer-events: none;
                    z-index: 1000;
                    color: ${color};
                    animation: celebrate-fall ${2 + Math.random() * 2}s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => particle.remove(), 4000);
            }, i * 100);
        }
    } catch (error) {
        console.error('파티클 효과 생성 중 오류:', error);
    }
}

function createScreenEffect() {
    try {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle, rgba(255, 182, 193, 0.15) 0%, transparent 70%);
            pointer-events: none; z-index: 999; animation: screen-flash 1.5s ease-out;
        `;
        
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1500);
    } catch (error) {
        console.error('화면 효과 생성 중 오류:', error);
    }
}

function createSoundVisualization() {
    try {
        const waves = document.createElement('div');
        waves.style.cssText = `
            position: fixed; top: 50%; left: 50%; width: 100px; height: 100px;
            border: 3px solid rgba(255, 182, 193, 0.5); border-radius: 50%;
            transform: translate(-50%, -50%); pointer-events: none; z-index: 1000;
            animation: sound-wave 1s ease-out;
        `;
        
        document.body.appendChild(waves);
        setTimeout(() => waves.remove(), 1000);
    } catch (error) {
        console.error('사운드 시각화 효과 생성 중 오류:', error);
    }
}

// 간단한 데이터 관리 기능들
function exportTodos() {
    try {
        const data = {
            todos: todos,
            settings: {
                isDarkMode: isDarkMode,
                currentFilters: currentFilters
            },
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `할일관리_백업_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        announceStatus('데이터를 내보냈습니다');
    } catch (error) {
        console.error('데이터 내보내기 중 오류:', error);
        showErrorMessage('데이터를 내보내는 중 오류가 발생했습니다');
    }
}

function importTodos(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.todos && Array.isArray(data.todos)) {
                    const confirmed = confirm(`${data.todos.length}개의 할 일을 가져오시겠습니까? 기존 데이터는 백업됩니다.`);
                    
                    if (confirmed) {
                        // 기존 데이터 백업
                        localStorage.setItem('todoManagerBackup', JSON.stringify(todos));
                        
                        // 새 데이터 적용
                        todos = data.todos;
                        
                        // ID 카운터 업데이트
                        if (todos.length > 0) {
                            todoIdCounter = Math.max(...todos.map(t => t.id || 0)) + 1;
                        }
                        
                        saveTodos();
                        saveSettings();
                        updateUI();
                        updateDashboard();
                        
                        announceStatus(`${data.todos.length}개의 할 일을 가져왔습니다`);
                    }
                } else {
                    throw new Error('올바른 형식의 백업 파일이 아닙니다');
                }
            } catch (error) {
                console.error('데이터 가져오기 중 오류:', error);
                showErrorMessage('올바른 형식의 백업 파일이 아닙니다');
            }
        };
        
        reader.readAsText(file);
        e.target.value = '';
    } catch (error) {
        console.error('파일 읽기 중 오류:', error);
        showErrorMessage('파일을 읽는 중 오류가 발생했습니다');
    }
}

// 키보드 단축키
function handleKeyboardShortcuts(e) {
    try {
        // Ctrl + Enter: 할 일 입력창 포커스
        if (e.ctrlKey && e.key === 'Enter') {
            if (todoInput) {
                todoInput.focus();
                todoInput.select();
            }
        }
        
        // ESC: 입력창 클리어 또는 대시보드 닫기
        if (e.key === 'Escape') {
            if (dashboard && !dashboard.classList.contains('hidden')) {
                hideDashboard();
            } else if (document.activeElement === todoInput && todoInput) {
                todoInput.value = '';
                todoInput.blur();
            } else if (document.activeElement === searchInput && searchInput) {
                clearSearch();
            }
        }
        
        // Ctrl + F: 검색창 포커스
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl + Shift + D: 다크모드 토글
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleDarkMode();
        }
        
        // Ctrl + Shift + S: 통계 대시보드 토글
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            toggleDashboard();
        }
        
        // Ctrl + S: 데이터 내보내기
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportTodos();
        }
    } catch (error) {
        console.error('키보드 이벤트 처리 중 오류:', error);
    }
}

// 전역 에러 핸들링 개선 - CSP 안전 버전
window.addEventListener('error', function(e) {
    console.error('전역 에러:', e.error);
    // 콘솔 로그만 남기고 사용자에게는 표시하지 않음
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('처리되지 않은 Promise 거부:', e.reason);
    // 콘솔 로그만 남기고 사용자에게는 표시하지 않음
});

// 페이지 언로드 시 데이터 저장
window.addEventListener('beforeunload', function() {
    saveTodos();
    saveSettings();
});

console.log('할 일 관리 앱 스크립트 로드 완료! (CSP 안전 버전)');