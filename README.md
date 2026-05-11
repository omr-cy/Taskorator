# 📅 Taskorator

Automatically generate daily tasks based on customizable templates in Obsidian.

[English](#english) | [العربية](#arabic) | [中文](#chinese)

---

<a name="english"></a>
## 🇺🇸 English

### ✨ Introduction

**Taskorator** is an Obsidian plugin that automatically generates daily task notes based on customizable templates. It helps you maintain a consistent daily task tracking system with minimal effort.

### 🚀 Features

- 🤖 **Automatic Generation**: Automatically creates daily task notes based on your preferred schedule (Daily or Workdays only).
- 🗂️ **Output Mode Selection**:
    - **Monthly Archive**: Organizes tasks in a `Root/Year/Month.md` structure (appends daily).
    - **Single File Overwrite**: Constantly overwrites a single file (like `Daily Task.md`) every day for a minimalist "today only" focus.
- 📊 **Task Statistics**: Tracks and displays completion rates for the previous day's tasks (Traditional mode).
- 🎨 **Customizable Templates**: Design your own task templates with variables.
- 📆 **Conditional Content**: Use `#every` tags to only include specific tasks on certain days (e.g., `#every monday, friday`).
- 📱 **Mobile Friendly**: Works perfectly on both desktop and mobile Obsidian.

### ⚙️ Configuration

After installation, configure the plugin in Settings:

1. **Output Mode**: Choose between archiving monthly or overwriting a single file.
2. **Path Configuration**: Set your Root Directory or Single File Path.
3. **Template**: Customize your task daily layout.
4. **Auto Generate**: Choose the frequency (None, Daily, or Workdays).

### 🖋️ Template Variables & Tags

#### Variables:
- `{{date}}` - Current date
- `{{weekday}}` - Day of the week
- `{{yearProgress}}` - Year progress percentage
- `{{time}}` - Current time

#### Conditional Tags (`#every`):
You can hide specific lines or entire header blocks based on the day of the week.
- Syntax: `#every(monday, tuesday)` or `#every monday, tuesday`
- Example:
    ```markdown
    ## Exercise #every monday, wednesday, friday
    - [ ] Go to the gym
    ```

### 📥 Installation

1. Open Obsidian and go to Settings.
2. Navigate to Community Plugins and click "Browse".
3. Search for "Taskorator".
4. Click Install, then Enable.

---

<a name="arabic"></a>
## 🇸🇦 العربية

### ✨ مقدمة

**Taskorator** هو إضافة لـ Obsidian يقوم بتوليد ملاحظات المهام اليومية تلقائياً بناءً على قوالب قابلة للتخصيص. يساعدك على الحفاظ على نظام تتبع مهام يومي ثابت بأقل مجهود.

### 🚀 المميزات

- 🤖 **توليد تلقائي**: ينشئ ملاحظات المهام اليومية تلقائياً بناءً على جدولك المفضل (يومياً أو أيام العمل فقط).
- 🗂️ **اختيار وضع الإخراج**:
    - **أرشيف شهري**: ينظم المهام في هيكل `الجذر/السنة/الشهر.md` (يضيف المهام يومياً).
    - **تجاوز ملف واحد**: يقوم بتجاوز ملف واحد (مثل `Daily Task.md`) باستمرار كل يوم للتركيز فقط على "مهام اليوم".
- 📊 **إحصائيات المهام**: يتتبع ويعرض معدلات الإنجاز لمهام اليوم السابق (في الوضع التقليدي).
- 🎨 **قوالب قابلة للتخصيص**: صمم قوالب المهام الخاصة بك باستخدام المتغيرات.
- 📆 **محتوى مشروط**: استخدم وسوم `#every` لتضمين مهام محددة فقط في أيام معينة (مثل `#every monday, friday`).
- 📱 **صديق للجوال**: يعمل بشكل مثالي على كل من نسخة الحاسوب والجوال من Obsidian.

### ⚙️ الإعدادات

بعد التثبيت، قم بتهيئة الإضافة في الإعدادات:

1. **وضع الإخراج**: اختر بين الأرشفة الشهرية أو تجاوز ملف واحد.
2. **تهيئة المسار**: قم بتعيين الدليل الجذري أو مسار الملف المنفرد.
3. **القالب**: خصص تخطيط مهامك اليومية.
4. **التوليد التلقائي**: اختر التكرار (لا شيء، يومياً، أو أيام العمل).

### 🖋️ متغيرات القالب والوسوم

#### المتغيرات:
- `{{date}}` - التاريخ الحالي
- `{{weekday}}` - اليوم من الأسبوع
- `{{yearProgress}}` - نسبة تقدم السنة
- `{{time}}` - الوقت الحالي

#### الوسوم المشروطة (`#every`):
يمكنك إخفاء أسطر محددة أو كتل عناوين كاملة بناءً على اليوم من الأسبوع.
- الصيغة: `#every(monday, tuesday)` أو `#every monday, tuesday`
- مثال:
    ```markdown
    ## تمارين #every monday, wednesday, friday
    - [ ] الذهاب إلى النادي الرياضي
    ```

### 📥 التثبيت

1. افتح Obsidian وانتقل إلى الإعدادات.
2. انتقل إلى "إضافات المجتمع" واضغط على "تصفح".
3. ابحث عن "Taskorator".
4. اضغط على تثبيت، ثم تفعيل.

---

<a name="chinese"></a>
## 🇨🇳 中文

### ✨ 介绍

**每日任务自动生成器** 是一个 Obsidian 插件，可以根据自定义模板自动生成每日任务笔记。它帮助您以最小的努力维护一致的每日任务跟踪系统。

### 🚀 功能特点

- 🤖 **自动生成**: 根据您的计划（每天或仅工作日）自动创建任务。
- 🗂️ **输出模式选择**:
    - **按月归档**: 按 `根目录/年份/月份.md` 结构组织（追加内容）。
    - **单一文件覆盖**: 每天完全覆盖同一个文件（如 `Daily Task.md`），适合极简主义者。
- 📊 **任务统计**: 跟踪并显示前一天任务的完成率。
- 🎨 **可自定义模板**: 使用变量设计您自己的任务布局。
- 📆 **条件内容**: 使用 `#every` 标签仅在特定日子包含特定任务（例如 `#every monday, friday`）。
- 📱 **移动设备友好**: 在桌面和移动端完美运行。

### 🖋️ 模板变量与标签

#### 变量:
- `{{date}}` - 当前日期
- `{{weekday}}` - 星期几
- `{{yearProgress}}` - 年度进度百分比
- `{{time}}` - 当前时间

#### 条件标签 (`#every`):
您可以根据星期几隐藏特定行或整个标题块。
- 语法: `#every(monday, tuesday)` 或 `#every monday, tuesday`
- 示例:
    ```markdown
    ## 健身 #every monday, wednesday, friday
    - [ ] 去健身房
    ```

### 📥 安装

1. 打开 Obsidian 设置。
2. 导航到“社区插件”并点击“浏览”。
3. 搜索 “Taskorator”。
4. 点击安装并启用。
