import './bootstrap';
import '../css/app.css';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <style>
            .main-container {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #f6f7f9 0%, #e9ecef 100%);
                padding: 20px;
            }
            .game-title {
                font-size: 3.5rem;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 2rem;
                text-align: center;
            }
            .game-modes {
                display: flex;
                gap: 2rem;
                flex-wrap: wrap;
                justify-content: center;
                max-width: 800px;
                width: 100%;
            }
            .mode-card {
                background: white;
                border-radius: 16px;
                padding: 2rem;
                width: 300px;
                text-align: center;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .mode-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }
            .mode-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .mode-title {
                font-size: 1.5rem;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 0.5rem;
            }
            .mode-description {
                color: #64748b;
                font-size: 0.9rem;
                line-height: 1.5;
            }
            .offline-mode {
                border: 2px solid #3b82f6;
            }
            .online-mode {
                border: 2px solid #22c55e;
            }
            .offline-mode .mode-icon {
                color: #3b82f6;
            }
            .online-mode .mode-icon {
                color: #22c55e;
            }
        </style>
        <div class="main-container">
            <h1 class="game-title">لعبة XO</h1>
            <div class="game-modes">
                <div class="mode-card offline-mode" id="offline-mode">
                    <div class="mode-icon">🎮</div>
                    <h2 class="mode-title">وضع غير متصل</h2>
                    <p class="mode-description">العب ضد صديقك على نفس الجهاز</p>
                </div>
                <div class="mode-card online-mode" id="online-mode">
                    <div class="mode-icon">🌐</div>
                    <h2 class="mode-title">وضع متصل</h2>
                    <p class="mode-description">العب ضد لاعبين آخرين عبر الإنترنت</p>
                </div>
            </div>
        </div>
    `;

    // إضافة مستمعي الأحداث لأزرار اختيار وضع اللعب
    document.getElementById('offline-mode').addEventListener('click', () => {
        window.location.href = '/offline-game';
    });

    document.getElementById('online-mode').addEventListener('click', () => {
        window.location.href = '/online-game';
    });
});
