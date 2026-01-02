const tg = window.Telegram.WebApp;
tg.expand();

// Данные пользователя
const user = tg.initDataUnsafe.user || { username: 'Guest', id: 0, photo_url: '' };
document.getElementById('username').innerText = '@' + user.username;
document.getElementById('prof-username').innerText = '@' + user.username;
if(user.photo_url) {
    document.getElementById('avatar').src = user.photo_url;
    document.getElementById('prof-avatar').src = user.photo_url;
}

// 1. НАВИГАЦИЯ
function openPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
    event.currentTarget.classList.add('active-nav'); // Простой фикс подсветки
}

// 2. РАКЕТА (Acid Rocket)
let isFlying = false;
function placeBet(type) {
    if(isFlying) return;
    // Проверка баланса (фейк)
    if(type === 'stars' && 1000 < 10) { alert("Мало звезд!"); return; }

    isFlying = true;
    let multiplier = 1.00;
    const rocket = document.getElementById('rocket');
    const bg = document.body;
    
    bg.classList.add('shaking-bg'); // Включаем тряску фона

    let timer = setInterval(() => {
        multiplier += 0.01;
        document.getElementById('multiplier').innerText = multiplier.toFixed(2) + 'x';

        // Усиливаем тряску с ростом кэфа
        let intensity = (0.5 / multiplier) + 's';
        bg.style.setProperty('--shake-speed', intensity);

        // Шанс краша (рандом)
        if(Math.random() < 0.01 && multiplier > 1.2) {
            clearInterval(timer);
            isFlying = false;
            bg.classList.remove('shaking-bg');
            bg.style.removeProperty('--shake-speed');
            
            tg.showConfirm(`Ракета долетела до ${multiplier.toFixed(2)}x!\nВы выиграли! Продать за звезды (OK) или в инвентарь (Cancel)?`, (ok) => {
                if(ok) alert("Продано! Баланс пополнен.");
                else alert("Предмет добавлен в инвентарь!");
            });
            document.getElementById('multiplier').innerText = "1.00x";
        }
    }, 80);
}

// 3. МИНЫ
function startMines() {
    const grid = document.getElementById('mines-grid');
    grid.innerHTML = '';
    for(let i=0; i<25; i++) {
        let cell = document.createElement('div');
        cell.className = 'mine-cell';
        cell.onclick = function() {
            if(this.classList.contains('safe') || this.classList.contains('boom')) return;
            // 20% шанс взрыва
            if(Math.random() < 0.2) {
                this.classList.add('boom');
                this.innerText = '💀';
                tg.HapticFeedback.notificationOccurred('error');
                setTimeout(() => { alert("ВЗРЫВ! Ты проиграл."); startMines(); }, 500);
            } else {
                this.classList.add('safe');
                this.innerText = '💎';
                tg.HapticFeedback.impactOccurred('medium');
            }
        }
        grid.appendChild(cell);
    }
}
startMines(); // Запуск при старте

// 4. КОЛЕСО (Upgrade)
function spinWheel() {
    const wheel = document.getElementById('wheel');
    let deg = Math.floor(3000 + Math.random() * 3000);
    wheel.style.transform = `rotate(${deg}deg)`;
    setTimeout(() => {
        alert("Выпал редкий скин! Проверь инвентарь.");
    }, 3500);
}

// 5. МЕНЕДЖЕР И ОПЛАТА
function contactManager() {
    tg.openTelegramLink("https://t.me/retyereee");
}

function depositStars() {
    // Отправляем боту сигнал выставить счет
    tg.sendData(JSON.stringify({action: "invoice_stars", amount: 50}));
}

// 6. АДМИН ПАНЕЛЬ
const ADMIN_ID = 12345678; // ЗАМЕНИ НА СВОЙ ID
if(user.id === ADMIN_ID) {
    document.getElementById('admin-btn').style.display = 'block';
}

function openAdmin() {
    let target = prompt("Введите ID игрока:");
    let type = prompt("Что выдать? (ton/stars/nft)");
    alert(`Выдано ${type} игроку ${target}`);
}