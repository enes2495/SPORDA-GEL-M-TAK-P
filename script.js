// Veri Yönetimi
class WorkoutTracker {
    constructor() {
        this.workouts = this.loadWorkouts();
        this.chart = null;
        this.currentFilter = 'all';
        
        // Kalori yakma oranları (70 kg kişi için kcal/saat)
        this.calorieRates = {
            'Koşu': 650,
            'Bisiklet': 450,
            'Yüzme': 550,
            'Ağırlık': 350,
            'Yoga': 225,
            'Kardiyo': 550,
            'Diğer': 300
        };
        
        // Antrenman türlerine göre egzersiz listeleri
        this.exercises = {
            'Koşu': [
                'Tempolu Koşu',
                'Sprint',
                'İnterval Koşu',
                'Uzun Mesafe',
                'Tepelik Koşu',
                'Treadmill',
                'Parkur Koşusu'
            ],
            'Bisiklet': [
                'Yol Bisikleti',
                'Dağ Bisikleti',
                'Spin/Sabit Bisiklet',
                'İnterval Bisiklet',
                'Uzun Tur',
                'Tepelik Bisiklet'
            ],
            'Yüzme': [
                'Serbest Stil',
                'Kurbağalama',
                'Kelebek',
                'Sırtüstü',
                'İnterval Yüzme',
                'Açık Su Yüzme'
            ],
            'Ağırlık': [
                'Bench Press',
                'Squat',
                'Deadlift',
                'Shoulder Press',
                'Barbell Row',
                'Pull-up/Chin-up',
                'Dips',
                'Lunges',
                'Biceps Curl',
                'Triceps Extension',
                'Leg Press',
                'Lat Pulldown',
                'Cable Exercises',
                'Full Body Workout'
            ],
            'Yoga': [
                'Hatha Yoga',
                'Vinyasa Yoga',
                'Ashtanga Yoga',
                'Bikram/Hot Yoga',
                'Yin Yoga',
                'Power Yoga',
                'Restorative Yoga',
                'Meditation'
            ],
            'Kardiyo': [
                'HIIT',
                'Burpees',
                'Jumping Jacks',
                'Mountain Climbers',
                'Box Jumps',
                'Zumba',
                'Aerobik',
                'Step Aerobik',
                'Kickboks',
                'Jump Rope (İp Atlama)'
            ],
            'Diğer': [
                'Pilates',
                'CrossFit',
                'Fonksiyonel Antrenman',
                'Germe/Esneklik',
                'Dans',
                'Basketbol',
                'Futbol',
                'Tenis',
                'Voleybol'
            ]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderWorkoutHistory();
        this.setupChart();
        this.setDefaultDate();
    }

    setDefaultDate() {
        const dateInput = document.getElementById('workoutDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    setupEventListeners() {
        // Form submit
        document.getElementById('workoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWorkout();
        });

        // Filter buttons
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Kalori hesaplama ve egzersiz listesi - antrenman türü değiştiğinde
        document.getElementById('workoutType').addEventListener('change', () => {
            this.updateExerciseList();
            this.updateCalorieSuggestion();
        });

        // Kalori hesaplama - süre değiştiğinde
        document.getElementById('duration').addEventListener('input', () => {
            this.updateCalorieSuggestion();
        });
    }

    updateExerciseList() {
        const workoutType = document.getElementById('workoutType').value;
        const exerciseGroup = document.getElementById('exerciseGroup');
        const exerciseSelect = document.getElementById('exercise');

        if (workoutType && this.exercises[workoutType]) {
            // Egzersiz listesini temizle
            exerciseSelect.innerHTML = '<option value="">Seçiniz veya boş bırakın</option>';
            
            // Seçilen türe göre egzersizleri ekle
            this.exercises[workoutType].forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise;
                option.textContent = exercise;
                exerciseSelect.appendChild(option);
            });
            
            // Egzersiz seçim alanını göster
            exerciseGroup.style.display = 'block';
        } else {
            // Antrenman türü seçilmemişse gizle
            exerciseGroup.style.display = 'none';
            exerciseSelect.innerHTML = '<option value="">Seçiniz veya boş bırakın</option>';
        }
    }

    updateCalorieSuggestion() {
        const workoutType = document.getElementById('workoutType').value;
        const duration = parseInt(document.getElementById('duration').value);
        const caloriesInput = document.getElementById('calories');
        const suggestionElement = document.getElementById('calorieSuggestion');

        if (workoutType && duration > 0) {
            const calorieRate = this.calorieRates[workoutType] || 300;
            const suggestedCalories = Math.round((calorieRate * duration) / 60);
            
            // Kalori alanı boşsa otomatik doldur
            if (!caloriesInput.value) {
                caloriesInput.value = suggestedCalories;
            }
            
            // Öneri mesajını göster
            suggestionElement.textContent = `💡 Önerilen: ${suggestedCalories} kcal (${calorieRate} kcal/saat)`;
            suggestionElement.style.display = 'block';
        } else {
            suggestionElement.textContent = '';
            suggestionElement.style.display = 'none';
        }
    }

    addWorkout() {
        const workout = {
            id: Date.now(),
            date: document.getElementById('workoutDate').value,
            type: document.getElementById('workoutType').value,
            exercise: document.getElementById('exercise').value || '',
            duration: parseInt(document.getElementById('duration').value),
            distance: parseFloat(document.getElementById('distance').value) || 0,
            calories: parseInt(document.getElementById('calories').value) || 0,
            notes: document.getElementById('notes').value
        };

        this.workouts.push(workout);
        this.saveWorkouts();
        this.updateStats();
        this.renderWorkoutHistory();
        this.updateChart();
        this.resetForm();
        this.showSuccessMessage();
    }

    deleteWorkout(id) {
        if (confirm('Bu antrenmanı silmek istediğinizden emin misiniz?')) {
            this.workouts = this.workouts.filter(w => w.id !== id);
            this.saveWorkouts();
            this.updateStats();
            this.renderWorkoutHistory();
            this.updateChart();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.renderWorkoutHistory();
    }

    getFilteredWorkouts() {
        const now = new Date();
        const workouts = [...this.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

        switch (this.currentFilter) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return workouts.filter(w => new Date(w.date) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
                return workouts.filter(w => new Date(w.date) >= monthAgo);
            default:
                return workouts;
        }
    }

    updateStats() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Bu ay istatistikleri
        const monthWorkouts = this.workouts.filter(w => new Date(w.date) >= monthStart);
        document.getElementById('monthWorkouts').textContent = monthWorkouts.length;
        document.getElementById('monthDuration').textContent = 
            monthWorkouts.reduce((sum, w) => sum + w.duration, 0);
        document.getElementById('monthDistance').textContent = 
            monthWorkouts.reduce((sum, w) => sum + w.distance, 0).toFixed(1);
        document.getElementById('monthCalories').textContent = 
            monthWorkouts.reduce((sum, w) => sum + w.calories, 0);

        // Toplam istatistikler
        document.getElementById('totalWorkouts').textContent = this.workouts.length;
        const totalMinutes = this.workouts.reduce((sum, w) => sum + w.duration, 0);
        document.getElementById('totalHours').textContent = (totalMinutes / 60).toFixed(1);
        document.getElementById('avgDuration').textContent = 
            this.workouts.length > 0 ? Math.round(totalMinutes / this.workouts.length) : 0;
        document.getElementById('streak').textContent = this.calculateStreak();
    }

    calculateStreak() {
        if (this.workouts.length === 0) return 0;

        const sortedDates = [...new Set(this.workouts.map(w => w.date))].sort().reverse();
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const dateStr of sortedDates) {
            const workoutDate = new Date(dateStr);
            workoutDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
                streak++;
                currentDate = workoutDate;
            } else {
                break;
            }
        }

        return streak;
    }

    renderWorkoutHistory() {
        const container = document.getElementById('workoutHistory');
        const workouts = this.getFilteredWorkouts();

        if (workouts.length === 0) {
            container.innerHTML = '<p class="empty-state">Bu filtre için antrenman kaydı bulunamadı.</p>';
            return;
        }

        container.innerHTML = workouts.map(workout => this.createWorkoutHTML(workout)).join('');

        // Add delete event listeners
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteWorkout(parseInt(btn.dataset.id));
            });
        });
    }

    createWorkoutHTML(workout) {
        const date = new Date(workout.date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const icon = this.getWorkoutIcon(workout.type);

        return `
            <div class="workout-item">
                <div class="workout-icon">${icon}</div>
                <div class="workout-details">
                    <div class="workout-header">
                        <div>
                            <span class="workout-type">${workout.type}</span>
                            ${workout.exercise ? `<span class="workout-exercise">→ ${workout.exercise}</span>` : ''}
                        </div>
                        <span class="workout-date">${date}</span>
                    </div>
                    <div class="workout-info">
                        <span>⏱️ ${workout.duration} dakika</span>
                        ${workout.distance > 0 ? `<span>📏 ${workout.distance} km</span>` : ''}
                        ${workout.calories > 0 ? `<span>🔥 ${workout.calories} kcal</span>` : ''}
                    </div>
                    ${workout.notes ? `<div class="workout-notes">"${workout.notes}"</div>` : ''}
                </div>
                <div class="workout-actions">
                    <button class="btn-delete" data-id="${workout.id}">🗑️ Sil</button>
                </div>
            </div>
        `;
    }

    getWorkoutIcon(type) {
        const icons = {
            'Koşu': '🏃',
            'Bisiklet': '🚴',
            'Yüzme': '🏊',
            'Ağırlık': '🏋️',
            'Yoga': '🧘',
            'Kardiyo': '💪',
            'Diğer': '🎯'
        };
        return icons[type] || '🎯';
    }

    setupChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        const data = this.getWeeklyData();
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Süre (dakika)',
                        data: data.durations,
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Mesafe (km)',
                        data: data.distances,
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(51, 65, 85, 0.5)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(51, 65, 85, 0.5)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    getWeeklyData() {
        const labels = [];
        const durations = [];
        const distances = [];
        
        const now = new Date();
        const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const dateStr = date.toISOString().split('T')[0];
            const dayName = days[date.getDay()];
            
            labels.push(dayName);
            
            const dayWorkouts = this.workouts.filter(w => w.date === dateStr);
            durations.push(dayWorkouts.reduce((sum, w) => sum + w.duration, 0));
            distances.push(dayWorkouts.reduce((sum, w) => sum + w.distance, 0));
        }
        
        return { labels, durations, distances };
    }

    updateChart() {
        if (!this.chart) return;
        
        const data = this.getWeeklyData();
        this.chart.data.labels = data.labels;
        this.chart.data.datasets[0].data = data.durations;
        this.chart.data.datasets[1].data = data.distances;
        this.chart.update();
    }

    resetForm() {
        document.getElementById('workoutForm').reset();
        this.setDefaultDate();
        
        // Kalori önerisini temizle
        const suggestionElement = document.getElementById('calorieSuggestion');
        if (suggestionElement) {
            suggestionElement.textContent = '';
            suggestionElement.style.display = 'none';
        }
        
        // Egzersiz seçim alanını gizle
        const exerciseGroup = document.getElementById('exerciseGroup');
        if (exerciseGroup) {
            exerciseGroup.style.display = 'none';
        }
    }

    showSuccessMessage() {
        const form = document.querySelector('.add-workout');
        form.classList.add('success-animation');
        setTimeout(() => form.classList.remove('success-animation'), 300);
        
        // Optional: Show a toast notification
        const toast = document.createElement('div');
        toast.textContent = '✅ Antrenman başarıyla eklendi!';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Local Storage
    saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(this.workouts));
    }

    loadWorkouts() {
        const data = localStorage.getItem('workouts');
        return data ? JSON.parse(data) : [];
    }
}

// Toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Uygulamayı başlat
const tracker = new WorkoutTracker();

