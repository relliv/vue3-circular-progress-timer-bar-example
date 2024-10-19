<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled } from '@tabler/icons-vue';

const progress = ref(0),
  currentTime = ref(0),
  minutes = ref('10'),
  seconds = ref('00'),
  isTimerRunning = ref(false),
  isTimerPaused = ref(false),
  isFinished = ref(false);

let initialTime = ref(600),
  timer: any = null,
  increment = ref(0);

const minutesRef = ref<HTMLElement | null>(null),
  secondsRef = ref<HTMLElement | null>(null);

// #region Timer

const startTimer = () => {
  clearInterval(timer);

  if (currentTime.value === -1) {
    currentTime.value = initialTime.value;
  } else if (currentTime.value === 0) {
    minutes.value = '00';
    seconds.value = '00';

    return;
  }

  isTimerRunning.value = true;
  isTimerPaused.value = false;
  isFinished.value = false;

  const totalSeconds = currentTime.value;
  increment.value = 100 / totalSeconds;

  timer = setInterval(() => {
    currentTime.value--;

    handleTimerProgress();

    if (currentTime.value <= 0) {
      clearInterval(timer);

      isTimerRunning.value = false;
      isFinished.value = true;
    }
  }, 1000);
};

const pauseTimer = () => {
  clearInterval(timer);
  
  isTimerPaused.value = true;
  isTimerRunning.value = false;
};

const stopTimer = () => {
  clearInterval(timer);

  isTimerRunning.value = false;
  isTimerPaused.value = false;
  progress.value = 0;
  currentTime.value = -1;
  isFinished.value = true;

  formatTime(initialTime.value);
};

const handleStartPause = () => {
  if (isTimerRunning.value) {
    pauseTimer();
  } else if (isTimerPaused.value) {
    startTimer();
  } else {
    startTimer();
  }
};

// #endregion

// #region Timer Input Events

const onTimerInputBlur = (
  event: FocusEvent,
  timePart: 'minutes' | 'seconds'
) => {
  console.log('onTimerInputBlur');

  let value = (event.target as HTMLElement).innerText;

  // ensure value is exactly two characters, pad with zeroes if needed
  if (timePart === 'minutes') {
    minutes.value = value.padStart(2, '0').substring(0, 2);
  } else if (timePart === 'seconds') {
    seconds.value = value.padStart(2, '0').substring(0, 2);
  }

  handleTimerLegendUpdate();
  handleTimerProgress();

  const totalSeconds = currentTime.value;
  increment.value = 100 / totalSeconds;

  progress.value = 0;
};

const onTimerInputKeyDown = (
  event: KeyboardEvent,
  timePart: 'minutes' | 'seconds'
) => {
  console.log('onTimerInputKeyDown');

  const value = (event.target as HTMLElement).innerText;

  // handle tabbing behavior for contenteditable
  if (event.key === 'Tab') {
    event.preventDefault();

    if (timePart === 'minutes') {
      secondsRef?.value?.focus();
    } else if (timePart === 'seconds') {
      minutesRef?.value?.focus();
    }
  }

  // handle enter key
  if (event.key === 'Enter') {
    event.preventDefault();
    
    // ensure value is exactly two characters, pad with zeroes if needed
    if (timePart === 'minutes') {
      minutes.value = value.padStart(2, '0').substring(0, 2);
    } else if (timePart === 'seconds') {
      seconds.value = value.padStart(2, '0').substring(0, 2);
    }
    
    (event.target as HTMLElement).blur();
    
    handleStartPause();
    
    return;
  }

  // only allow digits and backspace
  if (!/[0-9]/.test(event.key) && event.key !== 'Backspace') {
    event.preventDefault();

    return;
  }

  // left-shift the value and keep only two digits if already two characters
  if (value.length >= 2 && event.key !== 'Backspace') {
    const newValue = value.substring(1) + event.key;

    if (timePart === 'minutes') {
      minutes.value = newValue;
    } else if (timePart === 'seconds') {
      seconds.value = newValue;
    }

    event.preventDefault();
  }
};

// #endregion

// #region Global Events

const handleGlobalKeydownEventHandler = (event: KeyboardEvent) => {
  if (event.key == ' ' || event.code == 'Space' || event.keyCode == 32) {
    handleStartPause();
  }
};

// #endregion

// #region Helpers

const handleTimerProgress = () => {
  progress.value = Math.min(
    (initialTime.value - currentTime.value) * increment.value,
    100
  );

  console.log('initialTime.value', initialTime.value);
  console.log('currentTime.value', currentTime.value);
  console.log('increment', increment);
  console.log('progress', progress.value);

  formatTime(currentTime.value);
};

const handleTimerLegendUpdate = () => {
  const newTime = parseTimeInput(`${minutes.value}:${seconds.value}`);

  console.log('handleTimerLegendUpdate', newTime);

  currentTime.value = newTime;
  initialTime.value = newTime;
};

const parseTimeInput = (timeString: string) => {
  const [minutes, seconds] = timeString.split(':').map(Number);

  return minutes * 60 + seconds;
};

const formatTime = (totalSeconds: number) => {
  if (totalSeconds <= 0) {
    minutes.value = '00';
    seconds.value = '00';

    isFinished.value = true;
  }

  const minutesPart = Math.floor(totalSeconds / 60),
    secondsPart = totalSeconds % 60;

  minutes.value = String(minutesPart).padStart(2, '0');
  seconds.value = String(secondsPart).padStart(2, '0');
};

// #endregion

onMounted(() => {
  currentTime.value = initialTime.value;

  document.addEventListener('keydown', handleGlobalKeydownEventHandler);
});

onUnmounted(() => {
  clearInterval(timer);

  document.removeEventListener('keydown', handleGlobalKeydownEventHandler);
});
</script>

<template>
  <div class="timer-container">
    <!-- Timer -->
    <div class="circular-timer-container">
      <ve-progress
        :progress="progress"
        :angle="-90"
        color="#7012CE"
        :color-fill="colorFillGradient"
        empty-color="#1B143F"
        :empty-color-fill="emptyColorFillGradient"
        :size="300"
        :thickness="25"
        empty-thickness="25"
        empty-line-position="in"
        :hide-legend="true"
        legend-class="timer-legend-style"
        :noData="false"
        font-color="white"
      ></ve-progress>

      <!-- Editable Timer Container -->
      <div class="editable-timer-container">
        <!-- Timer Inputs -->
        <div
          class="editable-timer"
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2rem;
          "
        >
          <div
            ref="minutesRef"
            class="minutes"
            placeholder="00"
            :contenteditable="!isTimerRunning"
            @keydown="onTimerInputKeyDown($event, 'minutes')"
            @blur="onTimerInputBlur($event, 'minutes')"
          >
            {{ minutes }}
          </div>
          <span>:</span>
          <div
            ref="secondsRef"
            class="seconds"
            placeholder="00"
            :contenteditable="!isTimerRunning"
            @keydown="onTimerInputKeyDown($event, 'seconds')"
            @blur="onTimerInputBlur($event, 'seconds')"
          >
            {{ seconds }}
          </div>
        </div>

        <!-- Paused -->
        <span class="status">
          {{ isTimerPaused ? 'Paused' : ' ' }}
        </span>
      </div>
    </div>

    <!-- Timer Actions -->
    <div class="actions">
      <!-- Start / Pausee -->
      <div class="action">
        <button @click="handleStartPause">
          <!-- Pause -->
          <IconPlayerPauseFilled v-if="isTimerRunning"/>

          <!-- Play -->
          <IconPlayerPlayFilled v-if="isTimerPaused || (!isTimerRunning && !isTimerPaused)" />
        </button>

        <span>
          {{ isTimerRunning ? 'Pause' : 'Start' }}
        </span>
      </div>

      <!-- Stop -->
      <div
        class="action"
        :class="{
          disabled: isFinished,
        }"
      >
        <button @click="stopTimer" :disabled="isFinished">
          <IconPlayerStopFilled />
        </button>

        <span> Stop </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 50px;
  align-items: center;
}

.circular-timer-container {
  display: flex;
  position: relative;
  user-select: none;
}

.editable-timer-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.editable-timer-container .status {
  font-size: 14px;
  line-height: 16px;
  height: 17px;
}

.editable-timer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.editable-timer .minutes,
.editable-timer .seconds {
  font-weight: 500;
  font-size: 40px;
  padding: 3px 5px;
  border-radius: 5px;
  outline: none !important;
  height: 45px;
  width: 54px;
  text-align: center;
}

.editable-timer .minutes[contenteditable='true'],
.editable-timer .seconds[contenteditable='true'] {
  background-color: #1d1b27;
}

.editable-timer .minutes[contenteditable='true']:hover,
.editable-timer .seconds[contenteditable='true']:hover {
  font-weight: 500;
  font-size: 40px;
  background-color: #292639;
  transition: all 0.2s ease-in-out;
}

.editable-timer .minutes:focus,
.editable-timer .seconds:focus {
  background-color: #292639;
}

.button-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.actions .action {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 14px;
  width: 30%;
}

.actions .action.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions .action button {
  background-color: #292639;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #292639;
  border-radius: 50%;
  height: 60px;
  width: 60px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.actions .action button:hover {
  background-color: #372c70;
}

.actions .action svg{
  color: #fff;
}
</style>
