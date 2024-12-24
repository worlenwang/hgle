class EarTraining {
    constructor() {
        // 创建更接近钢琴音色的合成器
        this.piano = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "triangle" // 使用三角波，听起来更柔和
            },
            envelope: {
                attack: 0.005, // 更快的起音
                decay: 0.1,
                sustain: 0.3,
                release: 1.4 // 更长的释放时间，模拟钢琴余音
            },
            volume: -12,
            portamento: 0 // 关闭滑音
        }).toDestination();

        // 初始化各个训练模块
        this.singleNoteTraining = new SingleNoteTraining(this.piano);
        this.intervalTraining = new IntervalTraining(this.piano);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 标准音事件
        document.getElementById('playStandardA').addEventListener('click', () => {
            this.piano.triggerAttackRelease('A4', '2');
        });

        // 练习类型切换事件
        document.querySelectorAll('.selector-btn').forEach(button => {
            button.addEventListener('click', (e) => this.switchSection(e.target));
        });
    }

    switchSection(button) {
        // 移除所有按钮的active类
        document.querySelectorAll('.selector-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加当前按钮的active类
        button.classList.add('active');
        
        // 隐藏所有section
        document.querySelectorAll('.training-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // 显示选中的section
        const sectionId = button.dataset.section + '-section';
        document.getElementById(sectionId).classList.remove('hidden');
        
        // 清除结果显示
        document.getElementById('result').textContent = '';
    }
}

// 单音训练类
class SingleNoteTraining {
    constructor(piano) {
        this.piano = piano;
        this.currentNote = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('playNote').addEventListener('click', () => this.generateAndPlayNote());
        document.getElementById('replayNote').addEventListener('click', () => this.replayNote());
        
        document.querySelectorAll('#single-section .note-btn').forEach(button => {
            button.addEventListener('click', (e) => this.checkAnswer(e.target.dataset.note));
        });
    }

    generateRandomNote() {
        const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
        return notes[Math.floor(Math.random() * notes.length)];
    }

    generateAndPlayNote() {
        this.currentNote = this.generateRandomNote();
        this.playNote();
    }

    playNote() {
        this.piano.triggerAttackRelease(this.currentNote, '1');
    }

    replayNote() {
        if (this.currentNote) {
            this.playNote();
        }
    }

    checkAnswer(userAnswer) {
        if (!this.currentNote) {
            document.getElementById('result').textContent = '请先播放音符！';
            return;
        }

        const isCorrect = userAnswer === this.currentNote;
        const resultElement = document.getElementById('result');
        
        if (isCorrect) {
            resultElement.textContent = '回答正确！';
            resultElement.style.color = 'green';
        } else {
            resultElement.textContent = `回答错误。正确答案是：${this.getNoteNameInChinese(this.currentNote)}`;
            resultElement.style.color = 'red';
        }
    }

    getNoteNameInChinese(note) {
        const noteNames = {
            'C4': 'Do',
            'D4': 'Re',
            'E4': 'Mi',
            'F4': 'Fa',
            'G4': 'Sol',
            'A4': 'La',
            'B4': 'Si'
        };
        return noteNames[note];
    }
}

// 音程训练类 (保持原来的代码)
class IntervalTraining {
    constructor(piano) {
        this.piano = piano;
        this.currentLowerNote = null;
        this.currentHigherNote = null;
        this.userLowerNote = null;
        this.userHigherNote = null;
        this.isHarmonicMode = false;  // 默认为旋律音程模式
        this.selectedNotes = []; // 存储用户选择的音符
        this.isDoubleOctave = false; // 默认为单八度模式

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('playInterval').addEventListener('click', () => this.generateAndPlayInterval());
        document.getElementById('replayInterval').addEventListener('click', () => this.replayInterval());

        // 低音和高音按钮事件
        document.querySelectorAll('.lower-note .note-btn').forEach(button => {
            button.addEventListener('click', (e) => this.selectLowerNote(e.target));
        });
        document.querySelectorAll('.higher-note .note-btn').forEach(button => {
            button.addEventListener('click', (e) => this.selectHigherNote(e.target));
        });

        // 模式切换事件
        document.querySelectorAll('.mode-btn').forEach(button => {
            button.addEventListener('click', (e) => this.switchMode(e.target));
        });

        // 音符按钮点击事件
        document.querySelectorAll('#interval-section .note-btn').forEach(button => {
            button.addEventListener('click', (e) => this.selectNote(e.target));
        });

        // 提交按钮点击事件
        document.getElementById('submitInterval').addEventListener('click', () => this.checkAnswer());

        // 添加八度范围切换事件
        document.querySelectorAll('.range-btn').forEach(button => {
            button.addEventListener('click', (e) => this.switchRange(e.target));
        });
    }

    switchMode(button) {
        // 更新按钮状态
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // 设置模式
        this.isHarmonicMode = button.dataset.mode === 'harmonic';
        
        // 清除当前答案
        this.clearSelection();
        document.getElementById('result').textContent = '';
    }

    switchRange(button) {
        // 更新按钮状态
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // 设置范围模式
        this.isDoubleOctave = button.dataset.range === 'double';
        
        // 显示或隐藏高八度音符
        const higherOctave = document.querySelector('.higher-octave');
        if (this.isDoubleOctave) {
            higherOctave.classList.remove('hidden');
        } else {
            higherOctave.classList.add('hidden');
        }

        // 清除当前答案
        this.clearSelection();
    }

    generateRandomNote() {
        // 根据模式选择音符范围
        const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
        if (this.isDoubleOctave) {
            notes.push('C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5');
        }
        return notes[Math.floor(Math.random() * notes.length)];
    }

    generateAndPlayInterval() {
        // 清除之前的反馈和选择
        document.querySelector('#interval-section .feedback').classList.add('hidden');
        this.selectedNotes = [];
        document.querySelectorAll('#interval-section .note-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('submitInterval').disabled = true;

        this.clearSelection();
        
        // 生成两个不同的音符
        do {
            this.currentLowerNote = this.generateRandomNote();
            this.currentHigherNote = this.generateRandomNote();
        } while (
            Tone.Frequency(this.currentHigherNote).toMidi() <= Tone.Frequency(this.currentLowerNote).toMidi() ||
            (!this.isDoubleOctave && Tone.Frequency(this.currentHigherNote).toMidi() - Tone.Frequency(this.currentLowerNote).toMidi() > 12)
        );

        this.playInterval();
    }

    playInterval() {
        if (this.isHarmonicMode) {
            // 和声音程：同时播放
            this.piano.triggerAttackRelease([this.currentLowerNote, this.currentHigherNote], '1');
        } else {
            // 旋律音程：先后播放
            this.piano.triggerAttackRelease(this.currentLowerNote, '1');
            setTimeout(() => {
                this.piano.triggerAttackRelease(this.currentHigherNote, '1');
            }, 1000);
        }
    }

    replayInterval() {
        if (this.currentLowerNote && this.currentHigherNote) {
            this.playInterval();
        }
    }

    selectLowerNote(button) {
        // 清除其他低音按钮的选中状态
        document.querySelectorAll('.lower-note .note-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        button.classList.add('selected');
        this.userLowerNote = button.dataset.note;
        this.checkAnswer();
    }

    selectHigherNote(button) {
        // 清除其他高音按钮的选中状态
        document.querySelectorAll('.higher-note .note-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        button.classList.add('selected');
        this.userHigherNote = button.dataset.note;
        this.checkAnswer();
    }

    clearSelection() {
        document.querySelectorAll('.note-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.userLowerNote = null;
        this.userHigherNote = null;
    }

    checkAnswer() {
        if (!this.currentLowerNote || !this.currentHigherNote) {
            alert('请先播放音程！');
            return;
        }

        if (this.selectedNotes.length !== 2) {
            alert('请选择两个音符！');
            return;
        }

        const feedback = document.querySelector('#interval-section .feedback');
        feedback.classList.remove('hidden', 'show-correct', 'show-incorrect');

        const isCorrect = this.selectedNotes[0] === this.currentLowerNote && 
                         this.selectedNotes[1] === this.currentHigherNote;

        if (isCorrect) {
            feedback.classList.add('show-correct');
        } else {
            feedback.classList.add('show-incorrect');
            feedback.querySelector('.correct-answer').textContent = 
                `${this.getNoteNameInChinese(this.currentLowerNote)} - ${this.getNoteNameInChinese(this.currentHigherNote)}`;
        }
        feedback.classList.remove('hidden');

        // 重置选择
        this.selectedNotes = [];
        document.querySelectorAll('#interval-section .note-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('submitInterval').disabled = true;
    }

    getNoteNameInChinese(note) {
        const noteName = note.slice(0, -1); // 移除八度数字
        const noteNames = {
            'C': 'Do',
            'D': 'Re',
            'E': 'Mi',
            'F': 'Fa',
            'G': 'Sol',
            'A': 'La',
            'B': 'Si'
        };
        return noteNames[noteName];
    }

    selectNote(button) {
        if (this.selectedNotes.length < 2) {
            button.classList.add('selected');
            this.selectedNotes.push(button.dataset.note);
        }
        if (this.selectedNotes.length === 2) {
            document.getElementById('submitInterval').disabled = false;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new EarTraining();
}); 