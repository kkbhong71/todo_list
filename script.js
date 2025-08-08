// 전역 변수
let todos = [];
let todoIdCounter = 1;
let currentDate = new Date();
let selectedDateFilter = null;
let currentView = 'week'; // 기본을 주간 뷰로 설정

// DOM 요소 선택 (HTML ID와 정확히 일치하도록 수정)
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
const pendingTasks = document.getElementById('pendingTasks');

// 달력 관련 DOM 요소 (HTML ID와 정확히 일치하도록 수정)
const prevPeriodBtn = document.getElementById('prevPeriod');
const nextPeriodBtn = document.getElementById('nextPeriod');
const currentPeriodEl = document.getElementById('currentPeriod');
const weekGrid = document.getElementById('weekGrid');
const monthGrid = document.getElementById('monthGrid');
const yearGrid = document.getElementById('yearGrid');
const todayBtn = document.getElementById('todayBtn');
const selectedDateEl = document.getElementById('selectedDate');

// 뷰 컨테이너들
const weekViewContainer = document.getElementById('weekViewContainer');
const monthViewContainer = document.getElementById('monthViewContainer');
const yearViewContainer = document.getElementById('yearViewContainer');

// 뷰 버튼들 (HTML ID와 정확히 일치하도록 수정)
const weekViewBtn = document.getElementById('weekView');
const monthViewBtn = document.getElementById('monthView');
const yearViewBtn = document.getElementById('yearView');

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소들이 존재하는지 확인
    if (!todoInput || !addBtn || !todoList || !emptyState || 
        !weekViewBtn || !monthViewBtn || !yearViewBtn) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    loadTodos();
    initializeEventListeners();
    setupIntersectionObserver();
    initializeCalendar();
    addCelebrationStyles();
    
    // 초기 통계 업데이트 강제 실행
    setTimeout(() => {
        updateUI();
        updateStats(); // 명시적으로 통계 업데이트
    }, 100);
});

function initializeEventListeners() {
    // 기본 투두 기능 이벤트 리스너
    if (addBtn) addBtn.addEventListener('click', addTodo);
    if (todoInput) {
        todoInput.addEventListener('keypress', handleKeyPress);
        todoInput.addEventListener('input', handleInputChange);
        todoInput.addEventListener('focus', handleInputFocus);
        todoInput.addEventListener('blur', handleInputBlur);
    }
    
    // 터치 및 마우스 이벤트 최적화
    if (addBtn) {
        addBtn.addEventListener('touchstart', handleButtonTouchStart, { passive: true });
        addBtn.addEventListener('touchend', handleButtonTouchEnd, { passive: true });
    }
    
    // 달력 네비게이션 이벤트 리스너
    if (prevPeriodBtn) {
        prevPeriodBtn.addEventListener('click', () => {
            navigatePeriod(-1);
        });
    }
    
    if (nextPeriodBtn) {
        nextPeriodBtn.addEventListener('click', () => {
            navigatePeriod(1);
        });
    }
    
    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            currentDate = new Date();
            selectedDateFilter = null;
            updateCalendarView();
            updateSelectedDateDisplay();
            updateUI();
        });
    }
    
    // 뷰 전환 이벤트 리스너
    if (weekViewBtn) weekViewBtn.addEventListener('click', () => switchView('week'));
    if (monthViewBtn) monthViewBtn.addEventListener('click', () => switchView('month'));
    if (yearViewBtn) yearViewBtn.addEventListener('click', () => switchView('year'));
}

function initializeCalendar() {
    currentDate = new Date();
    switchView('week'); // 기본을 주간 뷰로 설정
    updateSelectedDateDisplay();
}

// 뷰 전환 함수
function switchView(view) {
    currentView = view;
    
    // 모든 뷰 컨테이너 숨기기
    if (weekViewContainer) weekViewContainer.classList.add('hidden');
    if (monthViewContainer) monthViewContainer.classList.add('hidden');
    if (yearViewContainer) yearViewContainer.classList.add('hidden');
    
    // 모든 뷰 버튼 비활성화
    if (weekViewBtn) weekViewBtn.classList.remove('active');
    if (monthViewBtn) monthViewBtn.classList.remove('active');
    if (yearViewBtn) yearViewBtn.classList.remove('active');
    
    // 선택된 뷰 활성화
    switch(view) {
        case 'week':
            if (weekViewContainer) weekViewContainer.classList.remove('hidden');
            if (weekViewBtn) weekViewBtn.classList.add('active');
            break;
        case 'month':
            if (monthViewContainer) monthViewContainer.classList.remove('hidden');
            if (monthViewBtn) monthViewBtn.classList.add('active');
            break;
        case 'year':
            if (yearViewContainer) yearViewContainer.classList.remove('hidden');
            if (yearViewBtn) yearViewBtn.classList.add('active');
            break;
    }
    
    updateCalendarView();
}

// 기간 네비게이션 함수
function navigatePeriod(direction) {
    switch(currentView) {
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
}

// 통합 달력 업데이트 함수
function updateCalendarView() {
    switch(currentView) {
        case 'week':
            updateWeekView();
            break;
        case 'month':
            updateMonthView();
            break;
        case 'year':
            updateYearView();
            break;
    }
    updatePeriodTitle();
}

// 기간 제목 업데이트
function updatePeriodTitle() {
    if (!currentPeriodEl) {
        console.error('currentPeriod 요소를 찾을 수 없습니다.');
        return;
    }
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    switch(currentView) {
        case 'week':
            const weekNumber = getWeekNumber(currentDate);
            currentPeriodEl.textContent = `${year}년 ${month}월 ${weekNumber}주`;
            break;
        case 'month':
            currentPeriodEl.textContent = `${year}년 ${month}월`;
            break;
        case 'year':
            currentPeriodEl.textContent = `${year}년`;
            break;
    }
}

// 날짜를 YYYY-MM-DD 형식으로 안전하게 변환하는 함수
function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 문자열을 로컬 날짜로 안전하게 변환하는 함수
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// 주차 계산 함수
function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay();
    const firstWeekStart = new Date(firstDay);
    firstWeekStart.setDate(firstDay.getDate() - dayOfWeek);
    
    const diffTime = date.getTime() - firstWeekStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
    }
}

function handleInputChange(e) {
    const value = e.target.value;
    const btn = addBtn.querySelector('span');
    
    if (value.trim()) {
        btn.style.transform = 'scale(1.1)';
        addBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
    } else {
        btn.style.transform = 'scale(1)';
        addBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
    }
}

function handleInputFocus() {
    this.parentElement.style.transform = 'scale(1.02) translateY(-2px)';
    this.style.boxShadow = '0 20px 40px rgba(139, 69, 255, 0.25), 0 12px 24px rgba(255, 0, 128, 0.15)';
}

function handleInputBlur() {
    this.parentElement.style.transform = 'scale(1) translateY(0)';
    this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
}

function handleButtonTouchStart() {
    this.style.transform = 'scale(0.95)';
}

function handleButtonTouchEnd() {
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 150);
}

// 로컬 스토리지에서 데이터 불러오기
function loadTodos() {
    try {
        // 실제 브라우저에서 사용할 때는 아래 코드의 주석을 해제하세요
        // const savedTodos = localStorage.getItem('cuteTodos');
        // if (savedTodos) {
        //     todos = JSON.parse(savedTodos);
        //     // 기존 할 일에 날짜가 없으면 오늘 날짜로 설정
        //     todos.forEach(todo => {
        //         if (!todo.date) {
        //             todo.date = formatDateString(new Date());
        //         }
        //     });
        //     todoIdCounter = Math.max(...todos.map(t => t.id), 0) + 1;
        // }
        
        // 데모용 초기 데이터 (실제 사용시에는 제거해도 됩니다)
        todos = [];
    } catch (error) {
        console.log('데이터를 불러오는 중 오류가 발생했습니다:', error);
        todos = [];
    }
}

// 로컬 스토리지에 데이터 저장
function saveTodos() {
    try {
        // 실제 브라우저에서 사용할 때는 아래 코드의 주석을 해제하세요
        // localStorage.setItem('cuteTodos', JSON.stringify(todos));
    } catch (error) {
        console.log('데이터를 저장하는 중 오류가 발생했습니다:', error);
    }
}

// 새로운 할 일 추가
function addTodo() {
    const todoText = todoInput.value.trim();
    
    if (todoText === '') {
        showInputError();
        return;
    }
    
    // 선택된 날짜가 있으면 해당 날짜로, 없으면 오늘 날짜로 설정
    const todoDate = selectedDateFilter || formatDateString(new Date());
    
    // 새로운 할 일 객체 생성
    const newTodo = {
        id: todoIdCounter++,
        text: todoText,
        completed: false,
        date: todoDate,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    todoInput.value = '';
    
    // 성공 피드백 with modern animation
    showSuccessFeedback();
    
    saveTodos();
    updateCalendarView(); // 달력 업데이트 추가
    updateUI();
    
    // 새로 추가된 항목에 spotlight 효과
    requestAnimationFrame(() => {
        highlightNewItem(newTodo.id);
    });
}

function showInputError() {
    todoInput.style.transform = 'translateX(-10px)';
    todoInput.style.borderColor = '#FFB6C1';
    todoInput.style.background = 'rgba(255, 182, 193, 0.2)';
    todoInput.placeholder = '작은 꿈이라도 적어주세요! 🌸';
    
    // 진동 효과
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
        todoInput.placeholder = '오늘의 작은 꿈을 적어보세요 🌺';
    }, 2000);
}

function showSuccessFeedback() {
    const btn = addBtn.querySelector('span');
    const originalContent = btn.innerHTML;
    
    // 버튼 애니메이션
    addBtn.style.transform = 'scale(1.2)';
    btn.innerHTML = '✨';
    
    // 리플 효과 생성
    createRippleEffect(addBtn);
    
    setTimeout(() => {
        addBtn.style.transform = 'scale(1)';
        btn.innerHTML = originalContent;
    }, 1200);
}

function createRippleEffect(element) {
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
}

function highlightNewItem(id) {
    const newItem = document.querySelector(`[data-id="${id}"]`);
    if (newItem) {
        newItem.style.transform = 'scale(1.05) translateY(-4px)';
        newItem.style.background = 'linear-gradient(135deg, rgba(255, 182, 193, 0.2) 0%, rgba(221, 160, 221, 0.2) 100%)';
        newItem.style.boxShadow = '0 20px 40px rgba(255, 182, 193, 0.3)';
        
        setTimeout(() => {
            newItem.style.transform = 'scale(1) translateY(0)';
            newItem.style.background = 'rgba(255, 255, 255, 0.8)';
            newItem.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
        }, 800);
    }
}

// 할 일 완료 상태 토글
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        updateCalendarView(); // 달력도 업데이트
        updateUI();
        
        // 완료 시 축하 효과
        if (todo.completed) {
            showCelebration();
        }
    }
}

// 할 일 삭제 (향상된 애니메이션)
function deleteTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    
    if (todoItem) {
        // 삭제 애니메이션 시퀀스
        todoItem.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        todoItem.style.transform = 'translateX(100%) rotateZ(15deg) scale(0.8)';
        todoItem.style.opacity = '0';
        
        // 다른 아이템들 부드럽게 위로 이동
        const siblings = Array.from(todoList.children);
        const index = siblings.indexOf(todoItem);
        
        siblings.slice(index + 1).forEach((sibling, i) => {
            sibling.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            sibling.style.transform = 'translateY(-60px)';
            
            setTimeout(() => {
                sibling.style.transform = 'translateY(0)';
            }, 200);
        });
        
        setTimeout(() => {
            todos = todos.filter(t => t.id !== id);
            saveTodos();
            updateCalendarView(); // 달력도 업데이트
            updateUI();
        }, 400);
    }
}

// UI 업데이트
function updateUI() {
    renderTodos();
    updateStats();
    toggleEmptyState();
}

// 할 일 목록 렌더링 (필터링 기능 추가)
function renderTodos() {
    todoList.innerHTML = '';
    
    // 선택된 날짜에 따라 필터링
    const filteredTodos = selectedDateFilter 
        ? todos.filter(todo => todo.date === selectedDateFilter)
        : todos;
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        
        // 안전한 날짜 파싱 사용
        const todoDate = parseLocalDate(todo.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        todoDate.setHours(0, 0, 0, 0);
        
        let dateInfo = '';
        if (!selectedDateFilter) {
            const diffTime = todoDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                dateInfo = '<span class="todo-date today-date">오늘</span>';
            } else if (diffDays === 1) {
                dateInfo = '<span class="todo-date tomorrow-date">내일</span>';
            } else if (diffDays === -1) {
                dateInfo = '<span class="todo-date yesterday-date">어제</span>';
            } else if (diffDays > 1) {
                dateInfo = `<span class="todo-date future-date">${diffDays}일 후</span>`;
            } else {
                dateInfo = `<span class="todo-date past-date">${Math.abs(diffDays)}일 전</span>`;
            }
        }
        
        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 onclick="toggleTodo(${todo.id})">
                ${todo.completed ? '✓' : ''}
            </div>
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${dateInfo}
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})" title="삭제">
                🗑️
            </button>
        `;
        
        todoList.appendChild(li);
    });
    
    // 렌더링 완료 이벤트 발생
    document.dispatchEvent(new CustomEvent('todo-rendered'));
}

// 통계 업데이트
function updateStats() {
    const filteredTodos = selectedDateFilter 
        ? todos.filter(todo => todo.date === selectedDateFilter)
        : todos;
        
    const total = filteredTodos.length;
    const completed = filteredTodos.filter(t => t.completed).length;
    const pending = total - completed;
    
    // 즉시 값 설정 (애니메이션 없이)
    if (totalTasks.textContent === '0' && total === 0) {
        totalTasks.textContent = '0';
        completedTasks.textContent = '0';
        pendingTasks.textContent = '0';
    } else {
        // 숫자 카운트 애니메이션
        animateNumber(totalTasks, parseInt(totalTasks.textContent) || 0, total);
        animateNumber(completedTasks, parseInt(completedTasks.textContent) || 0, completed);
        animateNumber(pendingTasks, parseInt(pendingTasks.textContent) || 0, pending);
    }
}

// 숫자 카운트 애니메이션
function animateNumber(element, start, end) {
    const duration = 500;
    const increment = (end - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// 빈 상태 토글
function toggleEmptyState() {
    const filteredTodos = selectedDateFilter 
        ? todos.filter(todo => todo.date === selectedDateFilter)
        : todos;
        
    if (filteredTodos.length === 0) {
        emptyState.classList.remove('hidden');
        todoList.style.display = 'none';
        
        // 빈 상태 메시지 업데이트
        const emptyIcon = emptyState.querySelector('.empty-icon');
        const emptyMessages = emptyState.querySelectorAll('p');
        
        if (selectedDateFilter) {
            emptyIcon.textContent = '🌸';
            emptyMessages[0].textContent = '선택한 날짜에 꽃이 없어요!';
            emptyMessages[1].textContent = '새로운 꿈을 심거나 다른 날짜를 선택해보세요 ✨';
        } else {
            emptyIcon.textContent = '🌸';
            emptyMessages[0].textContent = '아직 꽃봉오리가 없어요!';
            emptyMessages[1].textContent = '위에서 새로운 꿈을 심어보세요 🌱';
        }
    } else {
        emptyState.classList.add('hidden');
        todoList.style.display = 'block';
    }
}

// 주간 뷰 업데이트
function updateWeekView() {
    if (!weekGrid) {
        console.error('weekGrid 요소를 찾을 수 없습니다.');
        return;
    }
    
    weekGrid.innerHTML = '';
    
    // 주의 시작일 계산 (일요일)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        const dateEl = document.createElement('div');
        dateEl.className = 'week-date';
        
        // 안전한 날짜 형식 변환 사용
        const dateString = formatDateString(date);
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDateFilter === dateString;
        const hasTodos = todos.some(todo => todo.date === dateString);
        
        // 클래스 추가
        if (isToday) {
            dateEl.classList.add('today');
        }
        if (isSelected) {
            dateEl.classList.add('selected');
        }
        if (hasTodos) {
            dateEl.classList.add('has-todos');
        }
        
        // 요일 이름
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[date.getDay()];
        
        dateEl.innerHTML = `
            <div class="week-date-number">${date.getDate()}</div>
            <div class="week-date-label">${dayName}</div>
        `;
        
        // 클릭 이벤트
        dateEl.addEventListener('click', () => selectDate(dateString, dateEl));
        
        weekGrid.appendChild(dateEl);
    }
}

// 월간 뷰 업데이트 (기존 함수 이름 변경)
function updateMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    generateMonthGrid(year, month);
}

// 월간 달력 그리드 생성 (기존 함수 수정)
function generateMonthGrid(year, month) {
    if (!monthGrid) {
        console.error('monthGrid 요소를 찾을 수 없습니다.');
        return;
    }
    
    monthGrid.innerHTML = '';
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 6주 x 7일 = 42개 날짜 생성
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateEl = document.createElement('div');
        dateEl.className = 'calendar-date';
        dateEl.textContent = date.getDate();
        
        // 안전한 날짜 형식 변환 사용
        const dateString = formatDateString(date);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDateFilter === dateString;
        const hasTodos = todos.some(todo => todo.date === dateString);
        
        // 클래스 추가
        if (!isCurrentMonth) {
            dateEl.classList.add('other-month');
        }
        if (isToday) {
            dateEl.classList.add('today');
        }
        if (isSelected) {
            dateEl.classList.add('selected');
        }
        if (hasTodos) {
            dateEl.classList.add('has-todos');
        }
        
        // 클릭 이벤트
        dateEl.addEventListener('click', () => selectDate(dateString, dateEl));
        
        monthGrid.appendChild(dateEl);
    }
}

// 연간 뷰 업데이트
function updateYearView() {
    if (!yearGrid) {
        console.error('yearGrid 요소를 찾을 수 없습니다.');
        return;
    }
    
    yearGrid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let month = 0; month < 12; month++) {
        const monthEl = document.createElement('div');
        monthEl.className = 'year-month';
        
        const monthNames = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        
        monthEl.innerHTML = `
            <div class="year-month-title">${monthNames[month]}</div>
            <div class="year-month-grid" id="yearMonth${month}"></div>
        `;
        
        yearGrid.appendChild(monthEl);
        
        // 각 월의 날짜들 생성
        generateYearMonthGrid(year, month);
    }
}

// 연간 뷰의 각 월 그리드 생성
function generateYearMonthGrid(year, month) {
    const monthGridEl = document.getElementById(`yearMonth${month}`);
    if (!monthGridEl) {
        console.error(`yearMonth${month} 요소를 찾을 수 없습니다.`);
        return;
    }
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 6주 x 7일
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dateEl = document.createElement('div');
        dateEl.className = 'year-date';
        
        // 안전한 날짜 형식 변환 사용
        const dateString = formatDateString(date);
        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDateFilter === dateString;
        const hasTodos = todos.some(todo => todo.date === dateString);
        
        if (isCurrentMonth) {
            dateEl.textContent = date.getDate();
            
            // 클래스 추가
            if (isToday) {
                dateEl.classList.add('today');
            }
            if (isSelected) {
                dateEl.classList.add('selected');
            }
            if (hasTodos) {
                dateEl.classList.add('has-todos');
            }
            
            // 클릭 이벤트
            dateEl.addEventListener('click', () => selectDate(dateString, dateEl));
        } else {
            dateEl.style.visibility = 'hidden';
        }
        
        monthGridEl.appendChild(dateEl);
    }
}

// 날짜 선택 (모든 뷰에서 공통 사용)
function selectDate(dateString, dateEl) {
    // 이전 선택 제거 (모든 뷰에서)
    document.querySelectorAll('.calendar-date.selected, .week-date.selected, .year-date.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 새로운 선택 적용
    if (selectedDateFilter === dateString) {
        // 같은 날짜 클릭 시 선택 해제
        selectedDateFilter = null;
    } else {
        selectedDateFilter = dateString;
        if (dateEl) {
            dateEl.classList.add('selected');
        }
    }
    
    updateSelectedDateDisplay();
    updateUI();
    
    // 선택 효과
    if (dateEl) {
        const originalTransform = dateEl.style.transform;
        dateEl.style.transform = 'scale(1.15)';
        setTimeout(() => {
            if (selectedDateFilter === dateString) {
                if (currentView === 'week') {
                    dateEl.style.transform = 'scale(1.08)';
                } else {
                    dateEl.style.transform = 'scale(1.1)';
                }
            } else {
                dateEl.style.transform = 'scale(1)';
            }
        }, 150);
    }
}

// 선택된 날짜 표시 업데이트
function updateSelectedDateDisplay() {
    if (!selectedDateEl) {
        console.error('selectedDate 요소를 찾을 수 없습니다.');
        return;
    }
    
    if (selectedDateFilter) {
        // 안전한 날짜 파싱 사용
        const selectedDate = parseLocalDate(selectedDateFilter);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        const diffTime = selectedDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let displayText = '';
        if (diffDays === 0) {
            displayText = '오늘의 꽃들';
        } else if (diffDays === 1) {
            displayText = '내일의 꽃들';
        } else if (diffDays === -1) {
            displayText = '어제의 꽃들';
        } else {
            const month = selectedDate.getMonth() + 1;
            const date = selectedDate.getDate();
            displayText = `${month}월 ${date}일의 꽃들`;
        }
        
        selectedDateEl.textContent = displayText;
    } else {
        selectedDateEl.textContent = '모든 꽃들';
    }
}

// 완료 축하 효과
function showCelebration() {
    // 파티클 효과 생성
    createParticleEffect();
    
    // 화면 전체 축하 효과
    createScreenEffect();
    
    // 성취 사운드 시뮬레이션 (시각적 피드백)
    createSoundVisualization();
}

function createParticleEffect() {
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
            
            setTimeout(() => {
                particle.remove();
            }, 4000);
        }, i * 100);
    }
}

function createScreenEffect() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255, 182, 193, 0.15) 0%, transparent 70%);
        pointer-events: none;
        z-index: 999;
        animation: screen-flash 1.5s ease-out;
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.remove();
    }, 1500);
}

function createSoundVisualization() {
    const waves = document.createElement('div');
    waves.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border: 3px solid rgba(255, 182, 193, 0.5);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        animation: sound-wave 1s ease-out;
    `;
    
    document.body.appendChild(waves);
    
    setTimeout(() => {
        waves.remove();
    }, 1000);
}

// CSS 애니메이션 동적 추가
function addCelebrationStyles() {
    if (!document.getElementById('celebration-styles')) {
        const style = document.createElement('style');
        style.id = 'celebration-styles';
        style.textContent = `
            @keyframes celebrate-fall {
                0% {
                    transform: translateY(-100px) rotate(0deg) scale(0);
                    opacity: 1;
                }
                15% {
                    transform: translateY(0) rotate(180deg) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg) scale(0.5);
                    opacity: 0;
                }
            }
            
            @keyframes screen-flash {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            @keyframes sound-wave {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(3);
                    opacity: 0;
                }
            }
            
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Intersection Observer for scroll animations
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // 초기화 시 애니메이션 적용
    document.addEventListener('todo-rendered', () => {
        const todoItems = document.querySelectorAll('.todo-item');
        todoItems.forEach(item => {
            observer.observe(item);
        });
    });
}

// HTML 이스케이프 함수 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 키보드 단축키 (향상된 버전)
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter로 빠른 추가
    if (e.ctrlKey && e.key === 'Enter') {
        todoInput.focus();
        todoInput.select();
    }
    
    // ESC로 입력창 클리어
    if (e.key === 'Escape') {
        if (document.activeElement === todoInput) {
            todoInput.value = '';
            todoInput.blur();
        }
    }
    
    // Ctrl + D로 완료된 할 일 일괄 삭제
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        const completedTodos = todos.filter(t => t.completed);
        if (completedTodos.length > 0) {
            confirmBulkDelete(completedTodos);
        }
    }
});

function confirmBulkDelete(completedTodos) {
    // 간단한 확인 효과
    const confirmEl = document.createElement('div');
    confirmEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.3);
    `;
    
    confirmEl.innerHTML = `
        <p style="margin-bottom: 20px; font-size: 16px; color: #6B7280;">
            완료된 ${completedTodos.length}개의 꽃을 정리하시겠어요?
        </p>
        <button onclick="bulkDeleteConfirmed()" style="
            background: linear-gradient(135deg, #FFB6C1 0%, #FFA0B4 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            margin-right: 10px;
            cursor: pointer;
            font-weight: 500;
        ">정리하기</button>
        <button onclick="cancelBulkDelete()" style="
            background: rgba(0, 0, 0, 0.1);
            color: #6B7280;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 500;
        ">취소</button>
    `;
    
    document.body.appendChild(confirmEl);
    window.currentConfirmEl = confirmEl;
}

function bulkDeleteConfirmed() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    updateCalendarView();
    updateUI();
    cancelBulkDelete();
    showBulkDeleteSuccess();
}

function cancelBulkDelete() {
    if (window.currentConfirmEl) {
        window.currentConfirmEl.remove();
        window.currentConfirmEl = null;
    }
}

function showBulkDeleteSuccess() {
    const successEl = document.createElement('div');
    successEl.textContent = '🌸 깔끔하게 정리됐어요!';
    successEl.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: #98FB98;
        pointer-events: none;
        z-index: 1000;
        animation: success-fade 2s ease-out;
    `;
    
    document.body.appendChild(successEl);
    setTimeout(() => successEl.remove(), 2000);
}

// 페이지 언로드 시 데이터 저장
window.addEventListener('beforeunload', function() {
    saveTodos();
});

// 향상된 터치 지원
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // 터치 디바이스를 위한 최적화된 스타일
    const touchStyle = document.createElement('style');
    touchStyle.textContent = `
        .touch-device .todo-item:hover {
            transform: none;
        }
        .touch-device .todo-item:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
        }
        .touch-device .add-btn:active {
            transform: scale(0.95);
        }
        .touch-device .delete-btn:active {
            transform: scale(0.9);
        }
        
        @keyframes success-fade {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(touchStyle);
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized save function
const debouncedSave = debounce(saveTodos, 300);

// 사용자 경험 개선을 위한 프리로더
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
});