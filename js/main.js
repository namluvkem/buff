document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav ul li a');
    const tiktokIdInput = document.getElementById('tiktok-id');
    const boostBtn = document.getElementById('boost-btn');
    const statusContainer = document.getElementById('status-container');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    const countdown = document.getElementById('countdown');
    const successContainer = document.getElementById('success-container');
    const successId = document.getElementById('success-id');
    const followerCount = document.getElementById('follower-count');
    const successTime = document.getElementById('success-time');
    const boostAgainBtn = document.getElementById('boost-again-btn');
    const errorContainer = document.getElementById('error-container');
    const errorReason = document.getElementById('error-reason');
    const waitMessage = document.getElementById('wait-message');
    const errorCountdown = document.getElementById('error-countdown');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const recentSuccessList = document.getElementById('recent-success-list');
    const historyTableBody = document.getElementById('history-table-body');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const totalSuccessEl = document.getElementById('total-success');
    const lastUseEl = document.getElementById('last-use');
    
    let countdownInterval;
    let currentUserId = '';

    // Chuyển đổi giữa các tab
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(targetId).classList.add('active');
            
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            
            link.parentElement.classList.add('active');
        });
    });

    // Tải dữ liệu người dùng từ localStorage
    function loadUserData() {
        const userData = localStorage.getItem('tiktokBoosterUser');
        if (userData) {
            const user = JSON.parse(userData);
            tiktokIdInput.value = user.id || '';
            totalSuccessEl.textContent = user.successCount || '0';
            lastUseEl.textContent = user.lastUse || 'Chưa sử dụng';
        }
    }
    
    // Lưu dữ liệu người dùng
    function saveUserData(id) {
        const now = new Date();
        const formattedDate = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const userData = localStorage.getItem('tiktokBoosterUser');
        let user = userData ? JSON.parse(userData) : { successCount: 0 };
        
        user.id = id;
        user.lastUse = formattedDate;
        
        localStorage.setItem('tiktokBoosterUser', JSON.stringify(user));
        
        lastUseEl.textContent = formattedDate;
    }
    
    // Cập nhật số lần thành công
    function updateSuccessCount() {
        const userData = localStorage.getItem('tiktokBoosterUser');
        let user = userData ? JSON.parse(userData) : { successCount: 0 };
        
        user.successCount = (user.successCount || 0) + 1;
        localStorage.setItem('tiktokBoosterUser', JSON.stringify(user));
        
        totalSuccessEl.textContent = user.successCount;
    }
    
    // Tải lịch sử thành công
    function loadHistory() {
        const historyData = localStorage.getItem('tiktokBoosterHistory');
        let history = historyData ? JSON.parse(historyData) : [];
        
        recentSuccessList.innerHTML = '';
        historyTableBody.innerHTML = '';
        
        const recentHistory = history.slice(-5).reverse();
        
        recentHistory.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="time">${item.time}</span>
                <span>ID: ${item.id}</span>
                <span class="followers">${item.followers} followers</span>
            `;
            recentSuccessList.appendChild(li);
        });
        
        history.reverse().forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.time}</td>
                <td>${item.id}</td>
                <td>${item.followers}</td>
            `;
            historyTableBody.appendChild(tr);
        });
        
        if (history.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.textContent = 'Chưa có lịch sử buff thành công';
            recentSuccessList.appendChild(emptyLi);
            
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="3" style="text-align: center">Chưa có lịch sử buff thành công</td>';
            historyTableBody.appendChild(emptyRow);
        }
    }
    
    // Thêm kết quả thành công vào lịch sử
    function addSuccessToHistory(id, followers) {
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const formattedDate = `${now.getDate()}/${now.getMonth()+1} ${time}`;
        
        const historyData = localStorage.getItem('tiktokBoosterHistory');
        let history = historyData ? JSON.parse(historyData) : [];
        
        history.push({
            id,
            followers,
            time: formattedDate
        });
        
        localStorage.setItem('tiktokBoosterHistory', JSON.stringify(history));
        
        loadHistory();
    }
    
    // Format thời gian đếm ngược
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Bắt đầu đếm ngược
    function startCountdown(seconds, element, onComplete) {
        clearInterval(countdownInterval);
        
        let timeLeft = seconds;
        element.textContent = formatTime(timeLeft);
        
        countdownInterval = setInterval(() => {
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(countdownInterval);
                if (onComplete) onComplete();
            } else {
                element.textContent = formatTime(timeLeft);
            }
        }, 1000);
    }
    
    // Mô phỏng quá trình buff followers
    function simulateBoost(userId) {
        currentUserId = userId;
        
        // Ẩn các container khác
        successContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        
        // Hiển thị container trạng thái
        statusContainer.classList.remove('hidden');
        statusTitle.textContent = "Đang xử lý...";
        statusMessage.textContent = "Đang thiết lập kết nối...";
        progressBar.style.width = "0%";
        progressText.textContent = "0%";
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 1;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            
            // Thông báo trạng thái theo tiến trình
            if (progress === 20) {
                statusMessage.textContent = "Đang xác thực tài khoản...";
            } else if (progress === 40) {
                // Thay đổi thông báo để ẩn tên dịch vụ thực
                statusMessage.textContent = "Đang kết nối đến máy chủ...";
            } else if (progress === 60) {
                statusMessage.textContent = "Đang gửi yêu cầu...";
            } else if (progress === 80) {
                statusMessage.textContent = "Đang nhận phản hồi...";
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Hoàn thành quá trình xử lý
                statusMessage.textContent = "Đã hoàn thành xử lý!";
                
                setTimeout(() => {
                    // Random kết quả (80% thành công, 20% lỗi)
                    const isSuccess = Math.random() < 0.8;
                    
                    if (isSuccess) {
                        showSuccessResult(userId);
                    } else {
                        showErrorResult(userId);
                    }
                }, 1000);
            }
        }, 60);
    }
    
    // Hiển thị kết quả thành công
    function showSuccessResult(userId) {
        statusContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        
        const randomFollowers = Math.floor(Math.random() * 500) + 100;
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        successId.textContent = userId;
        followerCount.textContent = randomFollowers;
        successTime.textContent = time;
        
        updateSuccessCount();
        addSuccessToHistory(userId, randomFollowers);
    }
    
    // Hiển thị kết quả lỗi
    function showErrorResult(userId) {
        statusContainer.classList.add('hidden');
        errorContainer.classList.remove('hidden');
        
        // Các lỗi thường gặp
        const errors = [
            "ID TikTok không tồn tại",
            "Tài khoản riêng tư",
            "Đã đạt giới hạn buff cho ngày hôm nay",
            "Yêu cầu chờ giữa các lần buff"
        ];
        
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        errorReason.textContent = randomError;
        
        if (randomError === "Yêu cầu chờ giữa các lần buff") {
            const waitMinutes = Math.floor(Math.random() * 30) + 5;
            waitMessage.textContent = `Vui lòng chờ ${waitMinutes} phút trước khi thử lại.`;
            startCountdown(waitMinutes * 60, errorCountdown, () => {
                errorReason.textContent = "Đã hết thời gian chờ";
                waitMessage.textContent = "Bạn có thể thử lại ngay bây giờ.";
            });
        } else {
            waitMessage.textContent = "Vui lòng thử lại sau.";
            errorCountdown.textContent = "00:00";
        }
    }
    
    // Khởi tạo sự kiện khi trang tải xong
    loadUserData();
    loadHistory();
    
    // Sự kiện click nút Buff
    boostBtn.addEventListener('click', () => {
        const userId = tiktokIdInput.value.trim();
        
        if (!userId) {
            alert('Vui lòng nhập ID TikTok của bạn');
            tiktokIdInput.focus();
            return;
        }
        
        saveUserData(userId);
        simulateBoost(userId);
    });
    
    // Sự kiện click nút Buff lại
    boostAgainBtn.addEventListener('click', () => {
        simulateBoost(currentUserId);
    });
    
    // Sự kiện click nút Thử lại
    tryAgainBtn.addEventListener('click', () => {
        simulateBoost(currentUserId);
    });
    
    // Sự kiện click nút Xóa lịch sử
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử?')) {
            localStorage.removeItem('tiktokBoosterHistory');
            loadHistory();
        }
    });
});
