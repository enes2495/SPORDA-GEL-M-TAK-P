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
        this.updateComparison();
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

        // Beslenme tab'ları
        document.querySelectorAll('.nutrition-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchNutritionTab(e.target.dataset.tab);
            });
        });

        // Beslenme program filtreleri
        document.querySelectorAll('.program-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.filterPrograms(e.target.dataset.goal);
            });
        });
    }

    switchNutritionTab(tabName) {
        // Tüm tab'ları deaktif et
        document.querySelectorAll('.nutrition-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Tüm içerikleri gizle
        document.querySelectorAll('.nutrition-content').forEach(content => {
            content.classList.remove('active');
        });

        // Seçilen tab'ı aktif et
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Seçilen içeriği göster
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    filterPrograms(goal) {
        // Tüm filtre butonlarını deaktif et
        document.querySelectorAll('.program-filter').forEach(btn => {
            btn.classList.remove('active');
        });

        // Seçilen filtreyi aktif et
        const activeFilter = document.querySelector(`[data-goal="${goal}"]`);
        if (activeFilter) {
            activeFilter.classList.add('active');
        }

        // Program kartlarını filtrele
        const programCards = document.querySelectorAll('.program-card');
        programCards.forEach(card => {
            if (goal === 'all' || card.dataset.goal === goal) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateExerciseList() {
        const workoutType = document.getElementById('workoutType').value;
        const exerciseGroup = document.getElementById('exerciseGroup');
        const exerciseSelect = document.getElementById('exercise');
        const weightGroup = document.getElementById('weightGroup');

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
            
            // Ağırlık antrenmanı ise set ve kilo alanlarını göster
            if (workoutType === 'Ağırlık') {
                weightGroup.style.display = 'block';
            } else {
                weightGroup.style.display = 'none';
            }
        } else {
            // Antrenman türü seçilmemişse gizle
            exerciseGroup.style.display = 'none';
            weightGroup.style.display = 'none';
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
            sets: parseInt(document.getElementById('sets').value) || 0,
            weight: parseFloat(document.getElementById('weight').value) || 0,
            notes: document.getElementById('notes').value
        };

        this.workouts.push(workout);
        this.saveWorkouts();
        this.updateStats();
        this.renderWorkoutHistory();
        this.updateChart();
        this.updateComparison();
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
                        ${workout.sets > 0 && workout.weight > 0 ? `<span>🏋️ ${workout.sets} set x ${workout.weight} kg</span>` : ''}
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
        
        // Ağırlık alanlarını gizle
        const weightGroup = document.getElementById('weightGroup');
        if (weightGroup) {
            weightGroup.style.display = 'none';
        }
    }

    updateComparison() {
        const container = document.getElementById('comparisonContent');
        if (!container) return;

        const now = new Date();
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);
        
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setHours(23, 59, 59, 999);
        
        const previousWeekStart = new Date(lastWeekStart);
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);
        
        const previousWeekEnd = new Date(lastWeekStart);
        previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
        previousWeekEnd.setHours(23, 59, 59, 999);

        // Geçen hafta verileri
        const lastWeekWorkouts = this.workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= lastWeekStart && workoutDate <= lastWeekEnd;
        });

        // Önceki hafta verileri
        const previousWeekWorkouts = this.workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= previousWeekStart && workoutDate <= previousWeekEnd;
        });

        if (lastWeekWorkouts.length === 0 && previousWeekWorkouts.length === 0) {
            container.innerHTML = '<p class="empty-state">Karşılaştırma için yeterli veri yok. En az 2 haftalık veri gerekli.</p>';
            return;
        }

        // Antrenman türlerine göre grupla
        const lastWeekByType = this.groupByType(lastWeekWorkouts);
        const previousWeekByType = this.groupByType(previousWeekWorkouts);

        // Tüm antrenman türlerini birleştir
        const allTypes = new Set([
            ...Object.keys(lastWeekByType),
            ...Object.keys(previousWeekByType)
        ]);

        if (allTypes.size === 0) {
            container.innerHTML = '<p class="empty-state">Karşılaştırma için yeterli veri yok.</p>';
            return;
        }

        let html = '<div class="comparison-grid">';
        
        allTypes.forEach(type => {
            const lastWeek = lastWeekByType[type] || this.getEmptyStats();
            const previousWeek = previousWeekByType[type] || this.getEmptyStats();
            
            const durationDiff = lastWeek.duration - previousWeek.duration;
            const distanceDiff = lastWeek.distance - previousWeek.distance;
            const caloriesDiff = lastWeek.calories - previousWeek.calories;
            const countDiff = lastWeek.count - previousWeek.count;
            
            // Ağırlık antrenmanı için set ve kilo karşılaştırması
            const setsDiff = lastWeek.sets - previousWeek.sets;
            const weightDiff = lastWeek.avgWeight - previousWeek.avgWeight;
            const totalVolumeDiff = lastWeek.totalVolume - previousWeek.totalVolume;

            const icon = this.getWorkoutIcon(type);
            
            html += `
                <div class="comparison-card">
                    <div class="comparison-header">
                        <h3>${icon} ${type}</h3>
                    </div>
                    <div class="comparison-stats">
                        <div class="comparison-stat">
                            <div class="stat-label">Antrenman Sayısı</div>
                            <div class="stat-values">
                                <span class="previous">${previousWeek.count}</span>
                                <span class="arrow">→</span>
                                <span class="current">${lastWeek.count}</span>
                                ${countDiff !== 0 ? `<span class="diff ${countDiff > 0 ? 'positive' : 'negative'}">${countDiff > 0 ? '+' : ''}${countDiff}</span>` : ''}
                            </div>
                        </div>
                        <div class="comparison-stat">
                            <div class="stat-label">Toplam Süre (dk)</div>
                            <div class="stat-values">
                                <span class="previous">${previousWeek.duration}</span>
                                <span class="arrow">→</span>
                                <span class="current">${lastWeek.duration}</span>
                                ${durationDiff !== 0 ? `<span class="diff ${durationDiff > 0 ? 'positive' : 'negative'}">${durationDiff > 0 ? '+' : ''}${durationDiff}</span>` : ''}
                            </div>
                        </div>
                        ${type === 'Ağırlık' ? `
                            <div class="comparison-stat">
                                <div class="stat-label">Toplam Set</div>
                                <div class="stat-values">
                                    <span class="previous">${previousWeek.sets}</span>
                                    <span class="arrow">→</span>
                                    <span class="current">${lastWeek.sets}</span>
                                    ${setsDiff !== 0 ? `<span class="diff ${setsDiff > 0 ? 'positive' : 'negative'}">${setsDiff > 0 ? '+' : ''}${setsDiff}</span>` : ''}
                                </div>
                            </div>
                            <div class="comparison-stat">
                                <div class="stat-label">Ortalama Ağırlık (kg)</div>
                                <div class="stat-values">
                                    <span class="previous">${previousWeek.avgWeight.toFixed(1)}</span>
                                    <span class="arrow">→</span>
                                    <span class="current">${lastWeek.avgWeight.toFixed(1)}</span>
                                    ${weightDiff !== 0 ? `<span class="diff ${weightDiff > 0 ? 'positive' : 'negative'}">${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)}</span>` : ''}
                                </div>
                            </div>
                            <div class="comparison-stat">
                                <div class="stat-label">Toplam Hacim (set x kg)</div>
                                <div class="stat-values">
                                    <span class="previous">${previousWeek.totalVolume.toFixed(1)}</span>
                                    <span class="arrow">→</span>
                                    <span class="current">${lastWeek.totalVolume.toFixed(1)}</span>
                                    ${totalVolumeDiff !== 0 ? `<span class="diff ${totalVolumeDiff > 0 ? 'positive' : 'negative'}">${totalVolumeDiff > 0 ? '+' : ''}${totalVolumeDiff.toFixed(1)}</span>` : ''}
                                </div>
                            </div>
                        ` : ''}
                        ${lastWeek.distance > 0 || previousWeek.distance > 0 ? `
                            <div class="comparison-stat">
                                <div class="stat-label">Toplam Mesafe (km)</div>
                                <div class="stat-values">
                                    <span class="previous">${previousWeek.distance.toFixed(1)}</span>
                                    <span class="arrow">→</span>
                                    <span class="current">${lastWeek.distance.toFixed(1)}</span>
                                    ${distanceDiff !== 0 ? `<span class="diff ${distanceDiff > 0 ? 'positive' : 'negative'}">${distanceDiff > 0 ? '+' : ''}${distanceDiff.toFixed(1)}</span>` : ''}
                                </div>
                            </div>
                        ` : ''}
                        <div class="comparison-stat">
                            <div class="stat-label">Yakılan Kalori</div>
                            <div class="stat-values">
                                <span class="previous">${previousWeek.calories}</span>
                                <span class="arrow">→</span>
                                <span class="current">${lastWeek.calories}</span>
                                ${caloriesDiff !== 0 ? `<span class="diff ${caloriesDiff > 0 ? 'positive' : 'negative'}">${caloriesDiff > 0 ? '+' : ''}${caloriesDiff}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    groupByType(workouts) {
        const grouped = {};
        
        workouts.forEach(workout => {
            if (!grouped[workout.type]) {
                grouped[workout.type] = {
                    count: 0,
                    duration: 0,
                    distance: 0,
                    calories: 0,
                    sets: 0,
                    totalWeight: 0,
                    weightCount: 0
                };
            }
            
            const stats = grouped[workout.type];
            stats.count++;
            stats.duration += workout.duration || 0;
            stats.distance += workout.distance || 0;
            stats.calories += workout.calories || 0;
            
            if (workout.sets > 0 && workout.weight > 0) {
                stats.sets += workout.sets || 0;
                stats.totalWeight += workout.weight || 0;
                stats.weightCount++;
            }
        });

        // Ortalama ağırlık ve toplam hacim hesapla
        Object.keys(grouped).forEach(type => {
            const stats = grouped[type];
            stats.avgWeight = stats.weightCount > 0 ? stats.totalWeight / stats.weightCount : 0;
            stats.totalVolume = stats.sets * stats.avgWeight;
        });

        return grouped;
    }

    getEmptyStats() {
        return {
            count: 0,
            duration: 0,
            distance: 0,
            calories: 0,
            sets: 0,
            avgWeight: 0,
            totalVolume: 0
        };
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





