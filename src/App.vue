<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
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

    const startTimer = () => {
      clearInterval(timer);

      if (currentTime.value <= 0) {
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

    const onTimerInputBlur = (
      event: FocusEvent,
      timePart: 'minutes' | 'seconds'
    ) => {
      console.log('onTimerInputBlur');

      let value = (event.target as HTMLElement).innerText;

      console.log('********', timePart, value);

      // Ensure value is exactly two characters, pad with zeroes if needed
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
          secondsRef.value.focus();
        } else if (timePart === 'seconds') {
          minutesRef.value.focus();
        }
      }

      // handle enter key
      if (event.key === 'Enter') {
        event.preventDefault();

        console.log('ENTER');

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

    const onTimerInputFocus = (event: MouseEvent): void => {
      var range = document.createRange();
      var sel = window.getSelection();

      range.setStart(event.target.childNodes[0], 0);
      range.collapse(true);

      sel.removeAllRanges();
      sel.addRange(range);
    };

    const handleGlobalKeydownEventHandler = (event: KeyboardEvent) => {
      if (event.key == ' ' || event.code == 'Space' || event.keyCode == 32) {
        handleStartPause();
      }
    };

    onMounted(() => {
      currentTime.value = initialTime.value;

      document.addEventListener('keydown', handleGlobalKeydownEventHandler);
    });

    onUnmounted(() => {
      clearInterval(timer);

      document.removeEventListener('keydown', handleGlobalKeydownEventHandler);
    });

    return {
      progress,
      minutes,
      seconds,
      isTimerRunning,
      isTimerPaused,
      handleStartPause,
      stopTimer,
      onTimerInputBlur,
      onTimerInputKeyDown,
      minutesRef,
      secondsRef,
      onTimerInputFocus,
    };
  },
};
</script>

<template>
  <div class="timer-container">
    <!-- Timer -->
    <div class="circular-timer-container">
      <ve-progress
        :progress="progress"
        :data="circles"
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
    </div>

    <!-- Timer Actions -->
    <div class="actions">
      <!-- Start / Pausee -->
      <div
        class="action"
        :class="{
          disabled: isFinished,
        }"
      >
        <button @click="handleStartPause" :disabled="isFinished">
          <!-- Pause -->
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            v-if="isTimerRunning"
          >
            <path
              d="M9 20H6C5.73478 20 5.48043 19.9234 5.29289 19.787C5.10536 19.6506 5 19.4656 5 19.2727V4.72727C5 4.53439 5.10536 4.3494 5.29289 4.21301C5.48043 4.07662 5.73478 4 6 4H9C9.26522 4 9.51957 4.07662 9.70711 4.21301C9.89464 4.3494 10 4.53439 10 4.72727V19.2727C10 19.4656 9.89464 19.6506 9.70711 19.787C9.51957 19.9234 9.26522 20 9 20Z"
              fill="white"
            />
            <path
              d="M18 20H15C14.7348 20 14.4804 19.9234 14.2929 19.787C14.1054 19.6506 14 19.4656 14 19.2727V4.72727C14 4.53439 14.1054 4.3494 14.2929 4.21301C14.4804 4.07662 14.7348 4 15 4H18C18.2652 4 18.5196 4.07662 18.7071 4.21301C18.8946 4.3494 19 4.53439 19 4.72727V19.2727C19 19.4656 18.8946 19.6506 18.7071 19.787C18.5196 19.9234 18.2652 20 18 20Z"
              fill="white"
            />
          </svg>

          <!-- Play -->
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            v-if="isTimerPaused || (!isTimerRunning && !isTimerPaused)"
          >
            <path
              d="M6.23433 20.625C5.94653 20.6244 5.66382 20.549 5.41402 20.4061C4.85152 20.0873 4.50183 19.4686 4.50183 18.7968V5.20309C4.50183 4.52949 4.85152 3.91262 5.41402 3.59387C5.66977 3.44688 5.96031 3.3713 6.25526 3.37501C6.55022 3.37872 6.83876 3.46159 7.09074 3.61496L18.7087 10.5693C18.9508 10.7212 19.1504 10.932 19.2888 11.1821C19.4272 11.4321 19.4997 11.7132 19.4997 11.999C19.4997 12.2848 19.4272 12.5659 19.2888 12.816C19.1504 13.0661 18.9508 13.2769 18.7087 13.4287L7.08886 20.385C6.831 20.5409 6.53565 20.6238 6.23433 20.625Z"
              fill="white"
            />
          </svg>
        </button>

        <span>
          {{ isTimerRunning ? 'Pause' : 'Start' }}
        </span>
      </div>

      <!-- Stop -->
      <div
        class="action"
        :class="{
          disabled: !isTimerRunning,
        }"
      >
        <button @click="stopTimer" :disabled="!isTimerRunning">
          <!-- Stop -->
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z"
              fill="white"
            />
          </svg>
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

.editable-timer {
  color: #ffffff;
  display: flex;
  flex-direction: row;
  gap: 2px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
  gap: 20px;
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
</style>
