<script>
// Public
import { appWindow } from "@tauri-apps/api/window";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { currentMonitor } from "@tauri-apps/api/window";
import { Close, Check } from "@element-plus/icons-vue";
import {
  isRegistered,
  unregister,
  register,
} from "@tauri-apps/api/globalShortcut";

export default {
  name: "App",
  components: { Close, Check },
  data() {
    return {
      listeners: [],
      windowWidth: 0,
      windowHeight: 0,
      startPointX: 0,
      startPointY: 0,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      isMoving: false,
      isDragging: false,
      resizingType: "",
      balls: [
        "top-left",
        "top-middle",
        "top-right",
        "middle-left",
        "middle-right",
        "bottom-left",
        "bottom-middle",
        "bottom-right",
      ],
      toolSize: 28,
      toolbarOffset: 10,
    };
  },
  computed: {
    right() {
      return this.left + this.width;
    },
    bottom() {
      return this.top + this.height;
    },
    isBallShow() {
      return this.width >= 125 || this.height >= 85;
    },
    draggable() {
      return !this.isMoving && this.width === 0 && this.height === 0;
    },
    maskStyle() {
      return {
        "--left": this.left + "px",
        "--top": this.top + "px",
        "--width": this.width + "px",
        "--height": this.height + "px",
        cursor:
          this.width === 0 && this.height === 0 ? "crosshair" : "se-resize",
      };
    },
    toolStyle() {
      return {
        width: this.toolSize + "px",
        height: this.toolSize + "px",
      };
    },
    toolbarStyle() {
      const offset = 0;
      const style = {};
      if (
        this.bottom + this.toolbarOffset + this.toolSize <
        this.windowHeight - offset
      ) {
        style.bottom = -(this.toolSize + this.toolbarOffset) + "px";
      } else if (this.top - this.toolbarOffset - this.toolSize > offset) {
        style.top = -(this.toolSize + this.toolbarOffset) + "px";
      } else {
        style.bottom = "0px";
      }
      if (this.right - 2 * this.toolSize > 10) {
        style.right = "0px";
      } else {
        style.left = "0px";
      }
      return {
        display:
          !this.isMoving && this.width > 0 && this.height > 0 ? "flex" : "none",
        ...style,
      };
    },
    rectangleStyle() {
      return {
        left: this.left + "px",
        top: this.top + "px",
        width: this.width + "px",
        height: this.height + "px",
        display: this.draggable ? "none" : "block",
      };
    },
  },
  methods: {
    async clear() {
      this.left = 0;
      this.top = 0;
      this.width = 0;
      this.height = 0;
      await appWindow.hide();
    },
    async capture() {
      const { left, top, width, height } = this;
      await this.clear();
      this.$nextTick(async () => {
        try {
          const response = await invoke("screenshot", {
            x: left + "",
            y: top + "",
            width: width + "",
            height: height + "",
          });
          await emit("screenshot_result", "data:image/png;base64," + response);
        } catch (err) {
          console.error(err);
          await emit("screenshot_result", "");
        }
      });
    },
    resizeDown(e, type) {
      if (!this.isMoving) {
        this.resizingType = type;
        const { x, y, opposite_x, opposite_y } = this.getPointAndOppositePoint(
          this.resizingType
        );
        this.startPointX = opposite_x;
        this.startPointY = opposite_y;
        this.left = Math.min(x, this.startPointX);
        this.width = parseInt(Math.abs(x - this.startPointX));
        this.top = Math.min(y, this.startPointY);
        this.height = parseInt(Math.abs(y - this.startPointY));
        this.isMoving = true;
      }
    },
    getPointAndOppositePoint(type) {
      let x = this.left;
      let y = this.top;
      let opposite_x = this.left + this.width;
      let opposite_y = this.top + this.height;

      if (type.indexOf("right") !== -1) {
        opposite_x = this.left;
        x = this.left + this.width;
      }
      if (type.indexOf("bottom") !== -1) {
        opposite_y = this.top;
        y = this.top + this.height;
      }
      return { x, y, opposite_x, opposite_y };
    },
    dragDown(e) {
      if (e.target.id !== "rectangle") {
        return;
      }
      if (!this.isDragging) {
        this.startPointX = e.offsetX;
        this.startPointY = e.offsetY;
        this.isDragging = true;
      }
    },
    dragMove(e) {
      const x = e.offsetX;
      const y = e.offsetY;
      if (this.isDragging) {
        const targetX = this.left + x - this.startPointX;
        const targetY = this.top + y - this.startPointY;
        if (targetX < 0) {
          this.left = 0;
        } else if (targetX > this.windowWidth - this.width) {
          this.left = this.windowWidth - this.width;
        } else {
          this.left = targetX;
        }
        if (targetY < 0) {
          this.top = 0;
        } else if (targetY > this.windowHeight - this.height) {
          this.top = this.windowHeight - this.height;
        } else {
          this.top = targetY;
        }
      }
    },
    dragUp(e) {
      if (this.isDragging) {
        this.isDragging = false;
      }
    },
    getStage(value, type) {
      const arg = type === "left" ? "width" : "height";
      if (value < this[type]) {
        return 1;
      }
      if (value >= this[type] && value <= this[type] + this[arg]) {
        return 2;
      }
      if (value > this[type] + this[arg]) {
        return 3;
      }
    },
    mouseDown(e) {
      if (e.target.id !== "screenshot") {
        return;
      }
      const x = e.offsetX;
      const y = e.offsetY;
      if (this.draggable) {
        this.startPointX = x;
        this.startPointY = y;
        this.left = x;
        this.top = y;
        this.isMoving = true;
      } else {
        const leftStage = this.getStage(x, "left");
        const topStage = this.getStage(y, "top");
        if (leftStage === 1 && topStage === 1) {
          this.width += this.left - x;
          this.left = x;
          this.height += this.top - y;
          this.top = y;
        }
        if (leftStage === 2 && topStage === 1) {
          this.height += this.top - y;
          this.top = y;
        }
        if (leftStage === 3 && topStage === 1) {
          this.width = x - this.left;
          this.height += this.top - y;
          this.top = y;
        }
        if (leftStage === 1 && topStage === 2) {
          this.width += this.left - x;
          this.left = x;
        }
        if (leftStage === 3 && topStage === 2) {
          this.width = x - this.left;
        }
        if (leftStage === 1 && topStage === 3) {
          this.width += this.left - x;
          this.left = x;
          this.height = y - this.top;
        }
        if (leftStage === 2 && topStage === 3) {
          this.height = y - this.top;
        }
        if (leftStage === 3 && topStage === 3) {
          this.width = x - this.left;
          this.height = y - this.top;
        }
      }
    },
    mouseMove(e) {
      const scrollX =
        document.documentElement.scrollLeft || document.body.scrollLeft;
      const scrollY =
        document.documentElement.scrollTop || document.body.scrollTop;
      const x = e.pageX || e.clientX + scrollX;
      const y = e.pageY || e.clientY + scrollY;
      if (this.isMoving) {
        if (
          this.resizingType !== "top-middle" &&
          this.resizingType !== "bottom-middle"
        ) {
          this.left = Math.min(x, this.startPointX);
          this.width = parseInt(Math.abs(x - this.startPointX));
        }
        if (
          this.resizingType !== "middle-left" &&
          this.resizingType !== "middle-right"
        ) {
          this.top = Math.min(y, this.startPointY);
          this.height = parseInt(Math.abs(y - this.startPointY));
        }
      }
    },
    mouseUp(e) {
      if (this.isMoving) {
        if (this.width == 0 && this.height == 0) {
          this.left = 0;
          this.top = 0;
          this.width = this.windowWidth;
          this.height = this.windowHeight;
        }

        this.$nextTick(() => {
          this.isMoving = false;
        });
        this.resizingType = "";
      }
    },
    async getMonitorSize() {
      const monitor = await currentMonitor();
      const { width, height } = monitor.size;
      this.windowWidth = width;
      this.windowHeight = height;
    },
    async registerShortcuts() {
      window.addEventListener("keydown", (e) => {
        if (e) {
          if (e.keyCode === 27) {
            this.clear();
          } else {
            e.preventDefault();
          }
        }
      });
      document.oncontextmenu = function (event) {
        return false;
      };
    },
    async addListeners() {
      try {
        this.listeners.push(
          ...[
            await listen("screenshot", async () => {
              await appWindow.show();
              await appWindow.setFocus();
            }),
          ]
        );
      } catch (err) {
        console.error(err);
      }
    },
  },
  mounted() {
    this.getMonitorSize();
    this.registerShortcuts();
    this.addListeners();
  },
  unmounted() {
    this.listeners.map((item) => {
      item();
    });
  },
};
</script>

<template>
  <div
    id="screenshot"
    :style="maskStyle"
    @mousedown="mouseDown"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @mouseleave="mouseUp"
  >
    <div
      id="rectangle"
      :style="rectangleStyle"
      @mousedown.stop="dragDown"
      @mousemove="dragMove"
      @mouseup="dragUp"
      @mouseleave="dragUp"
      @mouseout="dragUp"
    >
      <div
        v-for="item in balls"
        :key="item"
        :class="[item, 'ball']"
        v-show="isBallShow"
        @mousedown.stop="resizeDown($event, item)"
      ></div>
      <div class="toolbar flex-row" :style="toolbarStyle">
        <div
          class="tool flex-row-center"
          :style="toolStyle"
          @click.stop="clear"
        >
          <el-icon><Close /></el-icon>
        </div>
        <div
          class="tool flex-row-center"
          :style="toolStyle"
          @click.stop="capture"
        >
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$ball-size: 5px;
$mask-border: 2px;
$ball-position: calc(-#{$ball-size} - #{$mask-border});
$blue: #318efd;

#screenshot {
  width: 100%;
  height: 100%;
  &::before {
    content: "";
    position: absolute;
    left: var(--left);
    top: var(--top);
    width: var(--width);
    height: var(--height);
    box-shadow: 0 0 0 999vw rgba(0, 0, 0, 0.6); /*足够大的投影*/
  }

  #rectangle {
    cursor: move;
    & {
      position: absolute;
      border: $mask-border solid $blue;
      box-sizing: border-box;
    }

    .toolbar {
      position: absolute;
      background-color: white;
      border: 0.5px solid $blue;
      border-radius: 3px;

      .tool {
        cursor: pointer;
        color: #3c3c3c;
        &:hover {
          background-color: rgb(230, 230, 230);
        }
      }
    }

    .ball {
      width: calc(#{$ball-size} * 2);
      height: calc(#{$ball-size} * 2);
      border: 1px solid white;
      border-radius: 50%;
      background-color: $blue;
      position: absolute;

      &.top-left {
        top: $ball-position;
        left: $ball-position;
        cursor: nw-resize;
      }
      &.top-middle {
        top: $ball-position;
        left: 50%;
        transform: translateX(-50%);
        cursor: n-resize;
      }
      &.top-right {
        top: $ball-position;
        right: $ball-position;
        cursor: ne-resize;
      }
      &.middle-left {
        top: 50%;
        left: $ball-position;
        transform: translateY(-50%);
        cursor: w-resize;
      }
      &.middle-right {
        top: 50%;
        right: $ball-position;
        transform: translateY(-50%);
        cursor: e-resize;
      }
      &.bottom-left {
        bottom: $ball-position;
        left: $ball-position;
        cursor: sw-resize;
      }
      &.bottom-middle {
        bottom: $ball-position;
        left: 50%;
        transform: translateX(-50%);
        cursor: s-resize;
      }
      &.bottom-right {
        bottom: $ball-position;
        right: $ball-position;
        cursor: se-resize;
      }
    }
  }
}
</style>
